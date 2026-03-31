import React, { useState, useEffect } from 'react';
import type { UserData } from '../App';
import { createIncident, getFacilities, getContacts, addContact, deleteContact, getActiveIncident } from '../utils/api';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';

interface DashboardProps {
  user: UserData;
  onLogout: () => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, lang, onLanguageChange }) => {
  const t = translations[lang];
  const [bluetoothConnected] = useState(true);
  const [safetyScore] = useState(98);
  const [activeAlert] = useState<string | null>(t.alert);
  const [sosType, setSosType] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeIncident, setActiveIncident] = useState<any>(null);
  
  // Form State
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);

  const diagnostics = [
    { label: 'Fuel Level', value: 74, color: 'var(--accent-primary)' },
    { label: 'Tire Pressure', value: 92, color: 'var(--success)' },
    { label: 'Oil Health', value: 88, color: 'var(--success)' },
    { label: 'Battery', value: 85, color: 'var(--accent-primary)' }
  ];

  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const facData = await getFacilities();
        if (facData && Array.isArray(facData)) setFacilities(facData);
        const contactData = await getContacts(user.email);
        if (contactData && Array.isArray(contactData)) setContacts(contactData);
      } catch (err) {
        console.warn("Cloud Sync Paused.");
      }
    };
    fetchData();

    const pollIncident = async () => {
      try {
        const incident = await getActiveIncident(user.email);
        if (incident) setActiveIncident(incident);
      } catch (err) { }
    };
    pollIncident();
    const interval = setInterval(pollIncident, 10000);

    return () => clearInterval(interval);
  }, [user.email]);

  const updateRealLoc = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Location disabled:", err),
        { enableHighAccuracy: true }
      );
    }
  };

  const handleSOS = async (type: string) => {
    console.log(`Sending ${type} Alert...`);
    setSosType(type);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const fuelVal = diagnostics.find(d => d.label === 'Fuel Level')?.value;
      const battVal = diagnostics.find(d => d.label === 'Battery')?.value;
      const locString = coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : 'Skyline Drive (GPS Pending)';

      await createIncident({
        type: `${type.toUpperCase()} EMERGENCY`, 
        location: locString,
        driverEmail: user.email,
        fuelSnapshot: fuelVal,
        batterySnapshot: battVal
      });

      const contactName = (contacts && contacts.length > 0) ? contacts[0].name : 'Emergency Contact';
      alert(`🚨 CRITICAL BROADCAST SENT!\n\nAlert: ${type.toUpperCase()}\nLocation: ${locString}\nVoice Relay: 🤙 Contacting ${contactName}...`);
    } catch (err) {
      alert("❌ SIGNAL INTERRUPTED: Emergency cloud unavailable. Try manual dial.");
    } finally {
      setSosType(null);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const contact = await addContact(user.email, { name: newContactName, phone: newContactPhone, relation: newContactRelation });
      setContacts([...contacts, contact]);
      setNewContactName(''); setNewContactPhone(''); setNewContactRelation('');
      setShowContactForm(false);
    } catch (err) {
      alert("Failed to save contact.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }} className="animate-fade-in">
      <header className="glass" style={{ margin: '20px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ padding: '10px', background: 'var(--accent-glow)', borderRadius: '12px' }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>{t.title} <span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', verticalAlign: 'top' }}>V12</span></h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Active: {user.carName}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
           <button onClick={onLogout} className="btn-primary" style={{ width: 'auto', background: 'var(--danger)', color: 'white', borderRadius: '30px', padding: '10px 20px' }}>
             {t.logout}
           </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', padding: '0 20px 20px 20px', flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{t.infrastructure}</h3>
            {facilities.map((f, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', marginTop: '12px' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{f.name} ({f.distance})</p>
              </div>
            ))}
          </div>
           
           <div style={{ background: 'var(--danger-glow)', padding: '12px 20px', borderRadius: '12px', borderLeft: '4px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '12px' }} className="animate-pulse">
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800 }}>LIVE: {activeAlert}</p>
           </div>
        </div>

        <div className="glass premium-gradient" style={{ padding: '0', display: 'flex', flexDirection: 'column', position: 'relative', minHeight: '400px' }}>
           <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, background: 'rgba(15, 23, 42, 0.8)', padding: '10px 16px', borderRadius: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '0.8rem', color: 'var(--accent-primary)' }}>{t.live_scans}</h3>
           </div>
           <div style={{ flex: 1, background: '#0f172a', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.4, background: 'radial-gradient(circle, #1e293b 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '14px', height: '14px', background: 'white', borderRadius: '50%', border: '3px solid var(--accent-primary)' }}></div>
           </div>
           <div style={{ padding: '16px 24px', background: 'rgba(15, 23, 42, 0.9)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>{t.gps_fix}: {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'SCANNING...'}</p>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="glass" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                {(['en', 'te', 'hi'] as Language[]).map(l => (
                  <button key={l} onClick={() => onLanguageChange(l)} style={{ width: 'auto', padding: '4px 8px', fontSize: '0.65rem', background: lang === l ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>{l.toUpperCase()}</button>
                ))}
              </div>
              <h3 style={{ margin: '0 0 20px 0', color: 'var(--danger)', textAlign: 'center' }}>SOS CENTER</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="btn-danger" onClick={() => handleSOS('Medical')} disabled={!!sosType}>{t.sos_medical}</button>
                <button className="btn-danger" style={{ background: '#7c2d12' }} onClick={() => handleSOS('Security')} disabled={!!sosType}>{t.sos_security}</button>
                <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)' }} onClick={() => alert("COMMUNITY ALERT SENT.")}>{t.sos_community}</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
