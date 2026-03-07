import React, { useState, useEffect } from 'react';
import type { UserData } from '../App';
import { createIncident, getFacilities, getContacts, addContact, deleteContact, getActiveIncident } from '../utils/api';

interface DashboardProps {
  user: UserData;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [bluetoothConnected] = useState(true);
  const [safetyScore, setSafetyScore] = useState(98);
  const [activeAlert, setActiveAlert] = useState<string | null>("System initialized. All safety protocols active.");
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const facData = await getFacilities();
        setFacilities(facData);
        
        const contactData = await getContacts(user.email);
        setContacts(contactData);
      } catch (err) {
        console.error("Data load failed from server");
      }
    };
    fetchData();

    // V6: Live Dispatch Polling
    const pollIncident = async () => {
      try {
        const incident = await getActiveIncident(user.email);
        setActiveIncident(incident);
      } catch (err) {
        console.error("Incident polling failed");
      }
    };
    pollIncident();
    const interval = setInterval(pollIncident, 5000);

    const timers = [
      setTimeout(() => setActiveAlert("Weather Update: Heavy Rain detected. Visibility decreased."), 8000),
      setTimeout(() => {
        setSafetyScore(92);
        setActiveAlert("Precaution: High hydroplane risk on Route 101. Suggest reducing speed.");
      }, 15000)
    ];

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [user.email]);

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
    setSosType(type);
    try {
      const fuelVal = diagnostics.find(d => d.label === 'Fuel Level')?.value;
      const battVal = diagnostics.find(d => d.label === 'Battery')?.value;

      await createIncident({
        type: `${type} Emergency`,
        location: 'Skyline Drive, Sector 7',
        driverEmail: user.email,
        fuelSnapshot: fuelVal,
        batterySnapshot: battVal
      });
      alert(`CRITICAL SOS: ${type} dispatched. 
      
📡 Live telemetry synced to Command Center.
📧 Emergency Email sent to contacts.
📱 SMS alert broadcast triggered.`);
    } catch (err) {
      alert("Failed to sync SOS to database. Ensure server connectivity.");
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
             <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>ID #{user.id || '...'} | {user.email.split('@')[0]}</p>
           </div>
           <button onClick={onLogout} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', width: 'auto', borderRadius: '30px', fontSize: '0.85rem' }}>
             Logout
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

          {/* Infrastructure nearby */}
          <div className="glass" style={{ padding: '24px', flex: 1 }}>
             <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Infrastructure nearby</h3>
             <div style={{ display: 'flex', flexDirection: 'column' }}>
                {facilities.map((f, idx) => (
                  <div key={idx} className="facility-item" style={{ borderLeft: `3px solid ${f.type === 'Community' ? 'var(--success)' : 'var(--accent-primary)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <h4 style={{ fontSize: '0.95rem', margin: 0 }}>{f.name}</h4>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px' }}>{f.distance}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0' }}>{f.address}</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button style={{ width: 'auto', padding: '4px 0', background: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 500 }}>Route</button>
                      <button style={{ width: 'auto', padding: '4px 0', background: 'none', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 500 }} onClick={() => alert(`Calling Service: ${f.name}`)}>
                        {f.type === 'Community' ? 'Contact Helper' : 'Direct Call'}
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Center: Radar */}
        <div className="glass premium-gradient" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
           <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h3 style={{ margin: 0 }}>Live Environmental Scan</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>V6 Surveillance Command Active</p>
           </div>

           {activeAlert && (
             <div className="voice-banner animate-fade-in" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                <p style={{ fontSize: '0.9rem', margin: 0, fontWeight: 500 }}>AI VOICE: {activeAlert}</p>
             </div>
           )}

           <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '220px', height: '220px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div className="radar-ring" style={{ borderColor: 'rgba(59, 130, 246, 0.4)' }}></div>
                 <div style={{ width: '8px', height: '8px', background: 'var(--accent-primary)', borderRadius: '50%', zIndex: 2, boxShadow: '0 0 20px var(--accent-primary)' }}></div>
                 <div style={{ position: 'absolute', top: '25%', left: '35%', width: '5px', height: '5px', background: 'white', borderRadius: '50%', opacity: 0.6 }}></div>
              </div>
           </div>

           <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>GPS Locked</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '4px 0' }}>Skyline Drive, Sector 7</p>
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
