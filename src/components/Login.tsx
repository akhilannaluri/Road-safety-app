import React, { useState } from 'react';
import type { UserData, UserRole } from '../App';
import { loginUser } from '../utils/api';

interface LoginProps {
  onLogin: (data: UserData) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>('driver');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [carName, setCarName] = useState('');
  const [stationId, setStationId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const user = await loginUser({ 
        email: email || (role !== 'driver' ? `${role}-${stationId}@authority.gov` : ''), 
        phone, 
        carName: role === 'driver' ? carName : 'Authority Unit',
        role,
        stationId: role !== 'driver' ? stationId : undefined
      });
      localStorage.setItem('road_safety_user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      console.error("Login Error:", err);
      alert(`Database Connection Failed! 
      
Possible fixes:
1. Ensure the server is running (node index.js)
2. Check if port 3001 is open
3. Check Console (F12) for exact error.`);
    } finally {
      setLoading(false);
    }

  };


  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', padding: '20px', background: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)' }}>
      <div className="glass shadow-2xl" style={{ width: '100%', maxWidth: '440px', padding: '48px', display: 'flex', flexDirection: 'column', gap: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '20px', background: 'var(--accent-glow)', borderRadius: '24px', marginBottom: '20px', border: '1px solid var(--accent-primary)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-1px' }}>SENTINEL<span style={{ color: 'var(--accent-primary)' }}>AI</span></h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600 }}>
            Traffic & Safety Protocol <span style={{ color: 'var(--accent-primary)' }}>v9.0</span>
          </p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {(['driver', 'police', 'hospital', 'fire'] as UserRole[]).map((r) => (
            <button 
              key={r}
              onClick={() => setRole(r)}
              style={{ 
                flex: 1, 
                padding: '10px 4px', 
                fontSize: '0.7rem', 
                background: role === r ? 'var(--accent-primary)' : 'transparent',
                color: role === r ? 'white' : 'var(--text-secondary)',
                borderRadius: '12px',
                width: 'auto',
                fontWeight: 800,
                textTransform: 'uppercase',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {role === 'driver' ? (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Registry Email</label>
                <input 
                  type="email" 
                  placeholder="name@gmail.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Phone</label>
                  <input 
                    type="tel" 
                    placeholder="+91-000-000" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required 
                    style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Vehicle</label>
                  <input 
                    type="text" 
                    placeholder="Tesla M3" 
                    value={carName}
                    onChange={(e) => setCarName(e.target.value)}
                    required 
                    style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '14px' }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Unit Identifier / Badge</label>
                <input 
                  type="text" 
                  placeholder={`UNIT-${role.toUpperCase()}-7`} 
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value)}
                  required 
                  style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '14px' }}
                />
              </div>
              <div style={{ padding: '14px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--accent-primary)', textAlign: 'center' }}>
                  🔐 SECURE AUTHORITY HANDSHAKE ACTIVE
                </p>
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '12px', padding: '16px' }}>
            {loading ? (
              <span className="animate-pulse">VERIFYING...</span>
            ) : (
              <span>INITIALIZE DASHBOARD</span>
            )}
          </button>

          <button 
            type="button" 
            className="btn-glass"
            onClick={() => {
              const demoUser = {
                id: 888,
                email: 'demo@sentinel.gov',
                phone: '+9199999999',
                carName: 'Patrol Cruiser X',
                role: 'driver' as const
              };
              localStorage.setItem('road_safety_user', JSON.stringify(demoUser));
              onLogin(demoUser);
            }} 
            style={{ 
              width: '100%', 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px dashed rgba(255, 255, 255, 0.1)', 
              color: 'var(--text-secondary)', 
              fontSize: '0.8rem', 
              marginTop: '8px', 
              padding: '12px',
              borderRadius: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            DEBUG: BYPASS WITH DEMO PROFILE
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
