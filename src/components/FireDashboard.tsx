import React, { useState, useEffect } from 'react';
import type { UserData } from '../App';
import { getIncidents, dispatchUnit, updateIncidentStatus } from '../utils/api';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';

interface FireDashboardProps {
  user: UserData;
  onLogout: () => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

const FireDashboard: React.FC<FireDashboardProps> = ({ user, onLogout, lang, onLanguageChange }) => {
  const t = translations[lang];

  const [activeDispatch, setActiveDispatch] = useState<any>(null);
  const [incidentFeed, setIncidentFeed] = useState<any[]>([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await getIncidents();
        setIncidentFeed(data.filter((inc: any) => inc.status !== 'RESOLVED'));
      } catch (err) {
        console.error("Failed to fetch fire dispatch feed");
      }
    };

    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDispatch = async () => {
    if(!activeDispatch) return;
    const unitCode = prompt("Enter Fire/Rescue Unit ID (e.g. RESCUE-01):");
    const time = prompt("Enter ETA (e.g. 2 Mins):");
    if (!unitCode || !time) return;
    
    try {
      await dispatchUnit(activeDispatch.id, { assignedUnit: unitCode, eta: time });
      alert(`Fire Unit ${unitCode} Dispatched. Route clearing signals activated.`);
      setActiveDispatch(null);
    } catch (err) {
      alert("Dispatch failed.");
    }
  };

  const handleClearRoute = () => {
    alert("TRAFFIC CONTROL SIGNAL SENT. All stoplights on route set to FLASHING RED. Path cleared via V6 Grid Control.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }} className="animate-fade-in">
      <header className="glass" style={{ margin: '20px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--danger)' }}>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>V6 FIRE & RESCUE COMMAND</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Station: {user.stationId} | Heavy Rescue Unit</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {(['en', 'te', 'hi'] as Language[]).map(l => (
            <button key={l} onClick={() => onLanguageChange(l)} style={{ width: 'auto', padding: '4px 8px', fontSize: '0.65rem', background: lang === l ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>{l.toUpperCase()}</button>
          ))}
          <button onClick={onLogout} className="btn-primary" style={{ width: 'auto', borderRadius: '30px', background: 'var(--danger)' }}>{t.logout}</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '20px', padding: '0 20px 20px 20px', flex: 1 }}>
        
        {/* Active Rescue List */}
        <div className="glass" style={{ padding: '24px', overflowY: 'auto' }}>
          <h3>Rescue Calls</h3>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
             {incidentFeed.length > 0 ? incidentFeed.map(inc => (
               <div 
                 key={inc.id}
                 className="facility-item" 
                 onClick={() => setActiveDispatch(inc)}
                 style={{ 
                   background: activeDispatch?.id === inc.id ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.05)', 
                   padding: '20px', 
                   borderRadius: '12px',
                   border: activeDispatch?.id === inc.id ? '1px solid var(--danger)' : '1px solid transparent',
                   cursor: 'pointer'
                 }}
               >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--danger)', fontWeight: 800, fontSize: '0.75rem' }}>
                      {inc.status} {inc.assignedUnit ? `@ ${inc.assignedUnit}` : ''}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: #{inc.id}</span>
                  </div>
                  <h4>{inc.type}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{inc.location}</p>
               </div>
             )) : (
               <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No active rescue calls</p>
             )}
          </div>
        </div>

        {/* Tactical Intel & Control */}
        <div className="glass premium-gradient" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
           {activeDispatch ? (
             <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                   <div>
                      <h3 style={{ margin: 0 }}>Intelligence Feed: {activeDispatch.driver?.carName}</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>Contact: {activeDispatch.driver?.email} | Status: {activeDispatch.status}</p>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>EMERGENCY CONTACT</p>
                      {activeDispatch.driver?.contacts?.[0] ? (
                        <p style={{ margin: 0, fontWeight: 700 }}>{activeDispatch.driver.contacts[0].name}: {activeDispatch.driver.contacts[0].phone}</p>
                      ) : <p style={{ margin: 0, opacity: 0.5 }}>None</p>}
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                   <div className="glass" style={{ background: 'rgba(0,0,0,0.2)', padding: '15px' }}>
                      <p style={{ fontSize: '0.7rem', opacity: 0.6, margin: '0 0 5px 0' }}>FUEL SNAPSHOT</p>
                      <p style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{activeDispatch.fuelSnapshot || 0}%</p>
                   </div>
                   <div className="glass" style={{ background: 'rgba(0,0,0,0.2)', padding: '15px' }}>
                      <p style={{ fontSize: '0.7rem', opacity: 0.6, margin: '0 0 5px 0' }}>BATTERY SNAPSHOT</p>
                      <p style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{activeDispatch.batterySnapshot || 0}%</p>
                   </div>
                </div>

                <div style={{ marginTop: 'auto', background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '12px' }}>
                   <h4 style={{ margin: '0 0 15px 0' }}>Tactical Coordination</h4>
                   <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn-primary" onClick={handleDispatch} style={{ flex: 2 }}>Dispatch Engine Unit</button>
                      <button className="btn-warning" onClick={handleClearRoute} style={{ flex: 1, color: 'white' }}>Clear Route</button>
                      <button onClick={() => updateIncidentStatus(activeDispatch.id, 'RESOLVED').then(() => setActiveDispatch(null))} style={{ width: 'auto', background: 'var(--success)', color: 'white' }}>
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                   </div>
                </div>
             </div>
           ) : (
             <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                <p>Select a dispatch call to begin tactical surveillance</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default FireDashboard;
