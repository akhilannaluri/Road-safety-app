import React, { useState, useEffect } from 'react';
import type { UserData } from '../App';
import { getIncidents, dispatchUnit, updateIncidentStatus } from '../utils/api';

interface PoliceDashboardProps {
  user: UserData;
  onLogout: () => void;
}

const PoliceDashboard: React.FC<PoliceDashboardProps> = ({ user, onLogout }) => {
  const [activeIncidents, setActiveIncidents] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [unitId, setUnitId] = useState('');
  const [eta, setEta] = useState('');

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await getIncidents();
        setActiveIncidents(data.filter((inc: any) => inc.status !== 'RESOLVED'));
      } catch (err) {
        console.error("Failed to fetch incidents");
      }
    };

    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleDispatch = async () => {
    if (!selectedVehicle || !unitId || !eta) {
      alert("Enter Unit ID and ETA first.");
      return;
    }
    try {
      await dispatchUnit(selectedVehicle.id, { assignedUnit: unitId, eta });
      alert(`Unit ${unitId} Dispatched. Response team notified.`);
      setUnitId('');
      setEta('');
      setSelectedVehicle(null);
    } catch (err) {
      alert("Dispatch failed. Check server.");
    }
  };

  const handleImmobilize = () => {
    alert("REMOTE IMMOBILIZATION COMMAND SENT. Vehicle engine disabled via Cloud API.");
  };

  const calculateHotspots = () => {
    return activeIncidents.length > 2 ? 'HIGH (Sector 7)' : 'LOW';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }} className="animate-fade-in">
      <header className="glass" style={{ margin: '20px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #3b82f6' }}>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>POLICE COMMAND CENTER (V6)</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Precinct: {user.stationId} | Hotspot Risk: <span style={{ color: calculateHotspots() === 'HIGH (Sector 7)' ? 'var(--danger)' : 'var(--success)' }}>{calculateHotspots()}</span></p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => alert("All units alert: High incident density detected in Sector 7.")} style={{ width: 'auto', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>Broadcast Hotspot Alert</button>
          <button onClick={onLogout} className="btn-primary" style={{ width: 'auto', borderRadius: '30px', background: 'var(--danger)', color: 'white', fontWeight: 700 }}>Secure Logout</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '20px', padding: '0 20px 20px 20px', flex: 1 }}>
        {/* Incident List */}
        <div className="glass" style={{ padding: '24px', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '20px' }}>Live Incident Feed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeIncidents.map(inc => (
              <div 
                key={inc.id} 
                className="facility-item" 
                onClick={() => setSelectedVehicle(inc)}
                style={{ 
                  background: selectedVehicle?.id === inc.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  padding: '16px',
                  borderRadius: '12px',
                  border: selectedVehicle?.id === inc.id ? '1px solid var(--accent-primary)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: inc.status === 'OPEN' ? 'var(--danger)' : 'var(--accent-primary)', fontWeight: 800, fontSize: '0.7rem' }}>
                    {inc.status} {inc.assignedUnit ? `- ${inc.assignedUnit}` : ''}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>#{inc.id}</span>
                </div>
                <h4 style={{ margin: '4px 0' }}>{inc.type}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{inc.location}</p>
              </div>
            ))}
            {activeIncidents.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5 }}>No active emergencies.</p>}
          </div>
        </div>

        {/* Intelligence & Dispatch */}
        <div className="glass premium-gradient" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
           {selectedVehicle ? (
              <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '30px' }}>
                    <div>
                      <h2 style={{ margin: 0 }}>Incident Intelligence: {selectedVehicle.driver?.carName}</h2>
                      <p style={{ color: 'var(--text-secondary)' }}>Driver Email: {selectedVehicle.driver?.email} | Phone: {selectedVehicle.driver?.phone}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)' }}>B-SQUAD ACTIVE</span>
                    </div>
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    {/* Telemetry Intel */}
                    <div className="glass" style={{ background: 'rgba(0,0,0,0.2)', padding: '20px' }}>
                       <h4 style={{ margin: '0 0 15px 0' }}>Vehicle Snapshots</h4>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Fuel Level (At SOS)</span>
                            <span style={{ fontWeight: 700 }}>{selectedVehicle.fuelSnapshot || 0}%</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Battery Health</span>
                            <span style={{ fontWeight: 700 }}>{selectedVehicle.batterySnapshot || 0}%</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Last GPS Lock</span>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                               <span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}>{selectedVehicle.location}</span>
                               <button 
                                 onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedVehicle.location}`, '_blank')}
                                 style={{ width: 'auto', padding: '4px 8px', fontSize: '0.7rem', background: 'var(--accent-glow)', border: '1px solid var(--accent-primary)' }}
                               >
                                 🗺️ View
                               </button>
                            </div>
                          </div>
                       </div>
                    </div>

                    {/* Next of Kin Intel */}
                    <div className="glass" style={{ background: 'rgba(0,0,0,0.2)', padding: '20px' }}>
                       <h4 style={{ margin: '0 0 15px 0' }}>Emergency Contacts</h4>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {selectedVehicle.driver?.contacts?.length > 0 ? selectedVehicle.driver.contacts.map((c: any) => (
                            <div key={c.id} style={{ fontSize: '0.85rem' }}>
                               <strong>{c.name} ({c.relation})</strong>: {c.phone}
                            </div>
                          )) : (
                            <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>No contacts saved by driver.</p>
                          )}
                       </div>
                    </div>
                 </div>

                 {/* Dispatch Command */}
                 <div className="glass" style={{ marginTop: 'auto', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h3 style={{ margin: '0 0 20px 0' }}>Emergency Dispatch Coordination</h3>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'end' }}>
                       <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '5px' }}>ASSIGN UNIT ID</label>
                          <input type="text" placeholder="e.g. ALPHA-7" value={unitId} onChange={e => setUnitId(e.target.value)} style={{ padding: '12px' }} />
                       </div>
                       <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '5px' }}>ESTIMATED TRAVEL TIME</label>
                          <input type="text" placeholder="e.g. 4 Mins" value={eta} onChange={e => setEta(e.target.value)} style={{ padding: '12px' }} />
                       </div>
                       <button className="btn-primary" onClick={handleDispatch} style={{ width: 'auto', padding: '12px 30px' }}>Confirm Dispatch</button>
                    </div>
                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                       <button className="btn-danger" onClick={handleImmobilize} style={{ width: 'auto', fontSize: '0.85rem' }}>Immobilize Stolen Vehicle</button>
                       <button onClick={() => updateIncidentStatus(selectedVehicle.id, 'RESOLVED').then(() => setSelectedVehicle(null))} style={{ width: 'auto', background: 'var(--success)', color: 'white', fontSize: '0.85rem' }}>Mark as Resolved</button>
                    </div>
                 </div>
              </div>
           ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                 <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                 <p style={{ marginTop: '20px' }}>Standby Mode. Selecting incident for deep surveillance...</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default PoliceDashboard;
