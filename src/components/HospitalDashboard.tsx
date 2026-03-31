import React, { useState, useEffect } from 'react';
import type { UserData } from '../App';
import { getIncidents, dispatchUnit, updateIncidentStatus } from '../utils/api';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';

interface HospitalDashboardProps {
  user: UserData;
  onLogout: () => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ user, onLogout, lang, onLanguageChange }) => {
  const t = translations[lang];
  const [emergencyQueue, setEmergencyQueue] = useState<any[]>([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await getIncidents();
        setEmergencyQueue(data.filter((inc: any) => inc.status !== 'RESOLVED'));
      } catch (err) {
        console.error("Failed to fetch trauma queue");
      }
    };

    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDispatch = async (patientId: number) => {
    const unitCode = prompt("Enter Ambulance Unit ID (e.g. AMB-04):");
    const time = prompt("Enter ETA (e.g. 5 Mins):");
    if (!unitCode || !time) return;
    try {
      await dispatchUnit(patientId, { assignedUnit: unitCode, eta: time });
    } catch (err) {
      alert("Dispatch failed.");
    }
  };

  const handleResolve = async (id: number) => {
    if(!confirm("Mark patient as admitted and incident resolved?")) return;
    await updateIncidentStatus(id, 'RESOLVED');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }} className="animate-fade-in">
      <header className="glass" style={{ margin: '20px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #10b981' }}>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>TRAUMA COMMAND V12</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Facility: {user.stationId} | Level 1 Hub</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          {(['en', 'te', 'hi'] as Language[]).map(l => (
            <button key={l} onClick={() => onLanguageChange(l)} style={{ width: 'auto', padding: '4px 8px', fontSize: '0.65rem', background: lang === l ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>{l.toUpperCase()}</button>
          ))}
          <button onClick={onLogout} className="btn-primary" style={{ width: 'auto', borderRadius: '30px', background: 'var(--danger)', color: 'white' }}>{t.logout}</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', padding: '0 20px 20px 20px' }}>
        {emergencyQueue.map(patient => (
          <div key={patient.id} className="glass" style={{ padding: '24px', border: patient.status === 'OPEN' ? '1px solid var(--danger)' : '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
               <h3 style={{ margin: 0 }}>Case #{patient.id}: {patient.driver?.carName}</h3>
               <span style={{ color: patient.status === 'OPEN' ? 'var(--danger)' : 'var(--accent-primary)', fontWeight: 800 }}>{patient.status}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Location: {patient.location}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                {patient.status === 'OPEN' ? (
                  <button className="btn-primary" onClick={() => handleDispatch(patient.id)} style={{ flex: 1 }}>Dispatch Ambulance</button>
                ) : (
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ margin: 0, color: 'var(--accent-primary)' }}>Unit {patient.assignedUnit} en route. ETA: {patient.eta}</p>
                  </div>
                )}
                <button onClick={() => handleResolve(patient.id)} style={{ width: 'auto', background: 'rgba(255,255,255,0.05)', padding: '0 15px' }}>RESOLVE</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalDashboard;
