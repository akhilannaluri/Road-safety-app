import React, { useState, useEffect } from 'react';
import type { UserData } from '../App';
import { createIncident, getFacilities, getContacts, addContact, deleteContact, getActiveIncident } from '../utils/api';

interface DashboardProps {
  user: UserData;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [bluetoothConnected] = useState(true);
  const [safetyScore] = useState(98);
  const [activeAlert] = useState<string | null>("AI Watchdog: All sectors clear.");
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
    // V10: Safe Mode Initializer
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

    // V10: Stable Local Pulse
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

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const contact = await addContact(user.email, { 
        name: newContactName, 
        phone: newContactPhone, 
        relation: newContactRelation 
      });
      setContacts([...contacts, contact]);
      setNewContactName('');
      setNewContactPhone('');
      setNewContactRelation('');
      setShowContactForm(false);
    } catch (err) {
      alert("Failed to save contact to cloud database.");
    }
  };

  const handleDeleteContact = async (id: number) => {
    if(!confirm("Remove this emergency contact?")) return;
    try {
      await deleteContact(id);
      setContacts(contacts.filter(c => c.id !== id));
    } catch (err) {
      alert("Delete failed. Check server connection.");
    }
  };


  const handleSOS = async (type: string) => {
    console.log(`Sending ${type} Alert...`);
    setSosType(type);
    try {
      // Professional Satellite Coordination Delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const fuelVal = diagnostics.find(d => d.label === 'Fuel Level')?.value;
      const battVal = diagnostics.find(d => d.label === 'Battery')?.value;

      // Extract Real Coordinates if available
      const locString = coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : 'Skyline Drive (GPS Pending)';

      await createIncident({
        type: `${type.toUpperCase()} EMERGENCY`, // Distinguish types in DB
        location: locString,
        driverEmail: user.email,
        fuelSnapshot: fuelVal,
        batterySnapshot: battVal
      });

      const contactName = (contacts && contacts.length > 0) ? contacts[0].name : 'Emergency Contact';
      alert(`🚨 CRITICAL BROADCAST SENT!
    
Alert: ${type.toUpperCase()}
Location: ${locString}
Tracking: LIVE (📡 GPS Locked)
Voice Relay: 🤙 Contacting ${contactName} & Police precinct...
Unit Dispatch: Pending Confirmation via Satellite.`);
    } catch (err) {
      alert("❌ SIGNAL INTERRUPTED: Emergency cloud unavailable. Try manual dial.");
    } finally {
      setSosType(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }} className="animate-fade-in">
      {/* Header */}
      <header className="glass" style={{ margin: '20px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ padding: '10px', background: 'var(--accent-glow)', borderRadius: '12px' }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
             </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>SAFEGUARD <span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', verticalAlign: 'top' }}>PRO</span></h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <span className="status-indicator" style={{ background: bluetoothConnected ? 'var(--success)' : 'var(--danger)' }}></span>
               <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Active: {user.carName}</p>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
           <div style={{ textAlign: 'right' }}>
             <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase' }}>Active Driver</p>
             <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>ID #{user.id || '...'} | {user.email ? user.email.split('@')[0] : 'Driver'}</p>
           </div>
           <button onClick={onLogout} className="btn-primary" style={{ width: 'auto', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '30px', fontSize: '0.85rem', padding: '10px 20px', fontWeight: 700 }}>
             Secure Logout
           </button>
        </div>
      </header>

      {/* V6 Dispatch Banner */}
      {activeIncident && activeIncident.status === 'DISPATCHED' && (
        <div className="animate-slide-up" style={{ margin: '0 20px 20px 20px', background: 'var(--accent-glow)', border: '1px solid var(--accent-primary)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="status-pulse" style={{ background: 'var(--accent-primary)' }}></div>
          <div>
            <h4 style={{ margin: 0, color: 'var(--accent-primary)', fontSize: '0.95rem' }}>RESCUE CO-ORDINATION ACTIVE</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
              Authority Unit <strong>{activeIncident.assignedUnit}</strong> is en route. ETA: <strong>{activeIncident.eta}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', padding: '0 20px 20px 20px', flex: 1 }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Emergency Contacts */}
          <div className="glass" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Emergency Contacts</h3>
              <button onClick={() => setShowContactForm(!showContactForm)} style={{ width: 'auto', padding: '4px 12px', background: 'var(--accent-glow)', color: 'var(--accent-primary)', fontSize: '0.75rem', borderRadius: '20px' }}>
                {showContactForm ? 'Close' : '+ Add'}
              </button>
            </div>

            {showContactForm && (
              <form onSubmit={handleAddContact} className="animate-fade-in" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" placeholder="Name" value={newContactName} onChange={e => setNewContactName(e.target.value)} required style={{ background: 'rgba(0,0,0,0.2)' }} />
                <input type="text" placeholder="Phone" value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)} required style={{ background: 'rgba(0,0,0,0.2)' }} />
                <input type="text" placeholder="Relation" value={newContactRelation} onChange={e => setNewContactRelation(e.target.value)} required style={{ background: 'rgba(0,0,0,0.2)' }} />
                <button type="submit" className="btn-primary" style={{ height: '36px', fontSize: '0.85rem' }}>Save to Database</button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {contacts.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.relation} • {c.phone}</p>
                  </div>
                  <button onClick={() => handleDeleteContact(c.id)} style={{ width: 'auto', background: 'none', color: 'var(--danger)', opacity: 0.6, fontSize: '0.75rem' }}>Delete</button>
                </div>
              ))}
              {contacts.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>No cloud-synced contacts.</p>}
            </div>
          </div>

           {/* Real-World Alert Ticker */}
           <div style={{ background: 'var(--danger-glow)', padding: '12px 20px', borderRadius: '12px', borderLeft: '4px solid var(--danger)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }} className="animate-pulse">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                 <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    LIVE: {activeAlert} | HEAVY TRAFFIC AT SECTOR 4 | AMBULANCE 12 RESPONDING TO ROUTE 99
                 </p>
              </div>
           </div>

           <div className="glass" style={{ padding: '24px', flex: 1 }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                 Infrastructure nearby
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 {facilities.length > 0 ? facilities.map((f, idx) => (
                   <div key={idx} className="facility-item" style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                       <h4 style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text-primary)' }}>{f.name}</h4>
                       <span style={{ fontSize: '0.7rem', background: f.type === 'Community' ? 'var(--success-glow)' : 'var(--accent-glow)', color: f.type === 'Community' ? 'var(--success)' : 'var(--accent-primary)', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>{f.distance}</span>
                     </div>
                     <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '6px 0' }}>{f.address}</p>
                     <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                       <button className="btn-primary" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.7rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>ROUTING</button>
                       <button className="btn-primary" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.7rem', borderRadius: '8px' }} onClick={() => alert(`Calling Service: ${f.name}`)}>
                         {f.type === 'Community' ? 'SOS HELP' : 'DIRECT CALL'}
                       </button>
                     </div>
                   </div>
                 )) : (
                   <div style={{ textAlign: 'center', padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Synchronizing local units...</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Center: Tactical Surveillance Map */}
        <div className="glass premium-gradient" style={{ padding: '0', display: 'flex', flexDirection: 'column', position: 'relative', minHeight: '400px' }}>
           <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, background: 'rgba(15, 23, 42, 0.8)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent-primary)' }}>TACTICAL SURVEILLANCE</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', margin: 0 }}>V9 SATELLITE LINK ACTIVE</p>
           </div>
           
           <div style={{ flex: 1, background: '#0f172a', position: 'relative', overflow: 'hidden' }}>
              {/* Simulated Map Background */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.4, background: 'radial-gradient(circle, #1e293b 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
              
              {/* Simulated Map Roads */}
              <div style={{ position: 'absolute', height: '4px', width: '100%', background: 'rgba(51, 65, 85, 0.5)', top: '50%' }}></div>
              <div style={{ position: 'absolute', width: '4px', height: '100%', background: 'rgba(51, 65, 85, 0.5)', left: '50%' }}></div>
              
              {/* Nearby Units */}
              <div style={{ position: 'absolute', top: '30%', left: '40%', width: '10px', height: '10px', background: 'var(--accent-primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-primary)' }}>
                 <div style={{ position: 'absolute', top: '-20px', left: '-20px', fontSize: '0.6rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>P-UNIT 7</div>
              </div>
              <div style={{ position: 'absolute', bottom: '20%', right: '30%', width: '10px', height: '10px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }}>
                 <div style={{ position: 'absolute', top: '-20px', left: '-20px', fontSize: '0.6rem', color: 'var(--success)', fontWeight: 'bold' }}>AMB-12</div>
              </div>
 
              {/* Driver Location (Centered) */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 5 }}>
                 <div style={{ width: '14px', height: '14px', background: 'white', borderRadius: '50%', border: '3px solid var(--accent-primary)', boxShadow: '0 0 20px white' }}></div>
              </div>
           </div>
 
           <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.9)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Fix</span>
                <p style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'Scanning Sector 7...'}</p>
              </div>
              <button 
                onClick={updateRealLoc} 
                className="btn-primary"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.75rem', borderRadius: '20px' }}
              >
                 📡 Refresh GPS
              </button>
           </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           
           <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
              <h3>Drive Analytics</h3>
              <div className="safety-score-ring">
                 <span style={{ fontSize: '2.4rem', fontWeight: 800 }}>{safetyScore}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '16px 0 0 0' }}>Persistent Cloud Data</p>
           </div>
           
           {/* Diagnostics Mini */}
           <div className="glass" style={{ padding: '20px' }}>
              <h4 style={{ margin: '0 0 15px 0' }}>Diagnostics</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 {diagnostics.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <span style={{ fontSize: '0.75rem', width: '80px', color: 'var(--text-secondary)' }}>{d.label}</span>
                       <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                          <div style={{ width: `${d.value}%`, height: '100%', background: d.color, borderRadius: '2px' }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="glass" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', color: 'var(--danger)', textAlign: 'center' }}>SOS CENTER</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 <button className="btn-danger" onClick={() => handleSOS('Medical')} disabled={!!sosType}>Medical Emergency</button>
                 <button className="btn-danger" style={{ background: '#7c2d12' }} onClick={() => handleSOS('Security')} disabled={!!sosType}>Security / Police</button>
                 <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)' }} onClick={() => alert("COMMUNITY ALERT: Nearby helpers are receiving your request now.")}>Ask Community Help</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
