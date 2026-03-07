// Build Trigger: V6.1 Clean Build
import { useState } from 'react';
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
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleLogin = (data: UserData) => {
    setUserData(data);
  };

  const handleLogout = () => {
    setUserData(null);
  };

  const renderDashboard = () => {
    if (!userData) return null;

    switch (userData.role) {
      case 'police':
        return <PoliceDashboard user={userData} onLogout={handleLogout} />;
      case 'hospital':
        return <HospitalDashboard user={userData} onLogout={handleLogout} />;
      case 'fire':
        return <FireDashboard user={userData} onLogout={handleLogout} />;
      case 'driver':
      default:
        return <Dashboard user={userData} onLogout={handleLogout} />;
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
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
