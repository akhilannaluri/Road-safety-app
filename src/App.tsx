import { useState } from 'react';
import type { Language } from './utils/translations';
import { translations } from './utils/translations';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PoliceDashboard from './components/PoliceDashboard';
import HospitalDashboard from './components/HospitalDashboard';
import FireDashboard from './components/FireDashboard';

export type UserRole = 'driver' | 'police' | 'hospital' | 'fire';

export interface UserData {
  id?: number;
  email: string;
  phone: string;
  carName: string;
  role: UserRole;
  stationId?: string;
  contacts?: any[];
}


function App() {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('road_safety_lang') as Language) || 'en';
  });

  const [userData, setUserData] = useState<UserData | null>(() => {
    const saved = localStorage.getItem('road_safety_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('road_safety_lang', newLang);
  };

  const handleLogin = (data: UserData) => {
    setUserData(data);
  };

  const handleLogout = () => {
    localStorage.removeItem('road_safety_user');
    setUserData(null);
  };

  const renderDashboard = () => {
    if (!userData) return null;

    const props = { 
      user: userData, 
      onLogout: handleLogout, 
      lang,
      onLanguageChange: handleLanguageChange 
    };

    switch (userData.role) {
      case 'police':
        return <PoliceDashboard {...props} />;
      case 'hospital':
        return <HospitalDashboard {...props} />;
      case 'fire':
        return <FireDashboard {...props} />;
      case 'driver':
      default:
        return <Dashboard {...props} />;
    }
  };

  return (
    <div className="app-container">
      {/* Dynamic Background Blobs */}
      <div className="bg-blob bg-blob-1"></div>
      <div className="bg-blob bg-blob-2"></div>
      
      {userData ? (
        renderDashboard()
      ) : (
        <Login onLogin={handleLogin} lang={lang} onLanguageChange={handleLanguageChange} />
      )}
    </div>
  );
}

export default App;
