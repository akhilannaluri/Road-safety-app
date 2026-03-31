import React, { useState } from 'react';
import type { UserData, UserRole } from '../App';
import { loginUser } from '../utils/api';

import { Language, translations } from '../utils/translations';

interface LoginProps {
  onLogin: (data: UserData) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, lang, onLanguageChange }) => {
  const t = translations[lang];
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
      alert(`Database Connection Failed!`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', padding: '20px', background: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)' }}>
      <div className="glass shadow-2xl" style={{ width: '100%', maxWidth: '440px', padding: '48px', display: 'flex', flexDirection: 'column', gap: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {/* Language Selector */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {(['en', 'te', 'hi'] as Language[]).map((l) => (
            <button 
              key={l}
              onClick={() => onLanguageChange(l)}
              style={{ width: 'auto', padding: '4px 8px', fontSize: '0.65rem', background: lang === l ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', borderRadius: '6px' }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--accent-glow)', borderRadius: '24px', marginBottom: '16px', border: '1px solid var(--accent-primary)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '4px', letterSpacing: '-1px' }}>{t.title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600 }}>
            {t.subtitle} <span style={{ color: 'var(--accent-primary)' }}>V12</span>
          </p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {(['driver', 'police', 'hospital', 'fire'] as UserRole[]).map((r) => (
            <button 
              key={r}
              onClick={() => setRole(r)}
              style={{ 
                flex: 1, 
                padding: '8px 4px', 
                fontSize: '0.65rem', 
                background: role === r ? 'var(--accent-primary)' : 'transparent',
                color: role === r ? 'white' : 'var(--text-secondary)',
                borderRadius: '8px',
                width: 'auto',
                fontWeight: 800,
                textTransform: 'uppercase'
              }}
            >
              {t[r as keyof typeof t] || r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {role === 'driver' ? (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Registry Email</label>
                <input 
                  type="email" 
                  placeholder="name@gmail.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '12px', marginBottom: '0' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Phone</label>
                  <input 
                    type="tel" 
                    placeholder="+91" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required 
                    style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '12px', marginBottom: '0' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Vehicle</label>
                  <input 
                    type="text" 
                    placeholder="X" 
                    value={carName}
                    onChange={(e) => setCarName(e.target.value)}
                    required 
                    style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '12px', marginBottom: '0' }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Unit Identifier</label>
                <input 
                  type="text" 
                  placeholder={`UNIT-${role.toUpperCase()}-7`} 
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value)}
                  required 
                  style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '12px', marginBottom: '0' }}
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px', padding: '14px' }}>
            {loading ? <span>{t.loading}</span> : <span>{t.login}</span>}
          </button>

          <button 
            type="button" 
            onClick={() => {
              const demoUser = { id: 888, email: 'demo@sentinel.gov', phone: '+9199999999', carName: 'Patrol X', role: 'driver' as const };
              localStorage.setItem('road_safety_user', JSON.stringify(demoUser));
              onLogin(demoUser);
            }} 
            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '4px', padding: '10px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
          >
            DEBUG: DEMO BYPASS
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
