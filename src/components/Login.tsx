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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', padding: '20px' }} className="animate-fade-in">
      <div className="glass" style={{ width: '100%', maxWidth: '420px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--accent-glow)', borderRadius: '50%', marginBottom: '16px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>Road Sentinel</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Emergency Response & Safety Ecosystem <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>V8</span>
          </p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
          {(['driver', 'police', 'hospital', 'fire'] as UserRole[]).map((r) => (
            <button 
              key={r}
              onClick={() => setRole(r)}
              style={{ 
                flex: 1, 
                padding: '8px', 
                fontSize: '0.75rem', 
                background: role === r ? 'var(--accent-primary)' : 'transparent',
                color: role === r ? 'white' : 'var(--text-secondary)',
                borderRadius: '8px',
                width: 'auto',
                fontWeight: 600,
                textTransform: 'capitalize'
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {role === 'driver' ? (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Gmail / Email Address</label>
                <input 
                  type="email" 
                  placeholder="driver@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+1 (555) 000-0000" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Car Name & Model</label>
                <input 
                  type="text" 
                  placeholder="e.g. Tesla Model 3" 
                  value={carName}
                  onChange={(e) => setCarName(e.target.value)}
                  required 
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Station / Unit ID</label>
                <input 
                  type="text" 
                  placeholder={`e.g. ${role.toUpperCase()}-742`} 
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value)}
                  required 
                />
              </div>
              <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                  Authority Access Mode: Secure terminal for {role} personnel.
                </p>
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? (
              <span className="animate-pulse">Authorizing...</span>
            ) : (
              <span>Enter Dashboard</span>
            )}
          </button>

          <button 
            type="button" 
            onClick={() => {
              setEmail('demo@safety.gov');
              setPhone('+1234567890');
              setCarName('Security Patrol V8');
            }} 
            style={{ 
              width: '100%', 
              background: 'rgba(59, 130, 246, 0.1)', 
              border: '1px dashed var(--accent-primary)', 
              color: 'var(--accent-primary)', 
              fontSize: '0.9rem', 
              marginTop: '15px', 
              padding: '12px',
              borderRadius: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🚀 QUICK LAUNCH (DEMO MODE)
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
