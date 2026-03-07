import React, { useState, useEffect } from 'react';
import type { UserData } from '../App';
import { getIncidents, dispatchUnit, updateIncidentStatus } from '../utils/api';

interface HospitalDashboardProps {
  user: UserData;
  onLogout: () => void;
}

const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ user, onLogout }) => {
  const [emergencyQueue, setEmergencyQueue] = useState<any[]>([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await getIncidents();
        // Hospital cares about all non-resolved incidents
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
      alert("Ambulance dispatched! Trauma bay preparation confirmed via Cloud Sync.");
    } catch (err) {
      alert("Dispatch failed. Check server.");
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
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>V6 ER TRAUMA COMMAND</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Facility: {user.stationId} | Level 1 Trauma Hub</p>
        </div>
        <button onClick={onLogout} className="btn-primary" style={{ width: 'auto', borderRadius: '30px', background: '#059669' }}>Terminal Exit</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', padding: '0 20px 20px 20px' }}>
        {emergencyQueue.map(patient => (
          <div key={patient.id} className="glass" style={{ padding: '24px', border: patient.status === 'OPEN' ? '1px solid var(--danger)' : '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Case #{patient.id}: {patient.driver?.carName}</h3>
              <span style={{ 
                color: patient.status === 'OPEN' ? 'var(--danger)' : 'var(--accent-primary)', 
                fontWeight: 800,
                fontSize: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                padding: '4px 10px',
                borderRadius: '20px'
              }}>
                {patient.status} {patient.assignedUnit ? `@ ${patient.assignedUnit}` : ''}
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                   <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Patient Info</p>
                   <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{patient.driver?.email.split('@')[0]}</p>
                   <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>{patient.location}</p>
                </div>
                <div>
                   <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Next of Kin</p>
                   {patient.driver?.contacts?.length > 0 ? (
                     <p style={{ margin: 0, fontSize: '0.85rem' }}>{patient.driver.contacts[0].name}: {patient.driver.contacts[0].phone}</p>
                   ) : (
                     <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.5 }}>None Registered</p>
                   )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
               <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>BATT SNAPSHOT</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{patient.batterySnapshot || 0}%</p>
               </div>
               <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>FUEL SNAPSHOT</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{patient.fuelSnapshot || 0}%</p>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                {patient.status === 'OPEN' ? (
                  <button className="btn-primary" onClick={() => handleDispatch(patient.id)} style={{ flex: 1, height: '44px' }}>Dispatch Ambulance</button>
                ) : (
                  <div style={{ flex: 1, background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--accent-primary)' }}>Unit {patient.assignedUnit} in transit</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>ETA: {patient.eta}</p>
                  </div>
                )}
                <button onClick={() => handleResolve(patient.id)} style={{ width: 'auto', background: 'rgba(255,255,255,0.05)', padding: '0 15px' }}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalDashboard;
