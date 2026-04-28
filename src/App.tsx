import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Cpu, 
  Users, 
  Database, 
  FileText, 
  Settings as SettingsIcon,
  Bell,
  Search,
  LogOut,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { socket } from './lib/socket';
import { View, SensorLog, Device, User } from './types';
import DashboardView from './views/DashboardView';
import MapView from './views/MapView';
import DeviceView from './views/DeviceView';
import UserView from './views/UserView';
import RawDataView from './views/RawDataView';
import ReportView from './views/ReportView';
import SettingsView from './views/SettingsView';
import LoginView from './views/LoginView';
import { cn } from './lib/utils';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [logs, setLogs] = useState<SensorLog[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [notifications, setNotifications] = useState<SensorLog[]>([]);
  const [showAlert, setShowAlert] = useState<SensorLog | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [meRes, devicesRes, logsRes] = await Promise.all([
          axios.get('/api/me', config),
          axios.get('/api/devices', config),
          axios.get('/api/logs', config)
        ]);
        setUser(meRes.data);
        setDevices(devicesRes.data);
        setLogs(logsRes.data);
      } catch (err) {
        console.error("Session expired or invalid", err);
        handleLogout();
      }
    };

    fetchData();

    socket.on('new-log', (log: SensorLog) => {
      setLogs(prev => [log, ...prev].slice(0, 100));
    });

    socket.on('fire-alert', (log: SensorLog) => {
      setShowAlert(log);
      setNotifications(prev => [log, ...prev]);
      setTimeout(() => setShowAlert(null), 5000);
    });

    return () => {
      socket.off('new-log');
      socket.off('fire-alert');
    };
  }, [token]);

  const handleLogin = (newToken: string, loggedUser: any) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(loggedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCurrentView('dashboard');
  };

  if (!token || !user) {
    return <LoginView onLogin={handleLogin} />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'gis', label: 'Peta Wilayah', icon: MapIcon },
    { id: 'devices', label: 'Data Perangkat', icon: Cpu },
    { id: 'users', label: 'Data Pengguna', icon: Users, adminOnly: true },
    { id: 'raw', label: 'Raw Data', icon: Database },
    { id: 'reports', label: 'Laporan', icon: FileText },
    { id: 'settings', label: 'Pengaturan', icon: SettingsIcon },
  ];

  return (
    <div className={cn(
      "flex h-screen font-sans overflow-hidden transition-colors duration-300",
      "bg-[#FDFCFB] text-[#141414] dark:bg-[#0A0A0A] dark:text-gray-100"
    )}>
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#141414]/10 dark:border-white/10 flex flex-col bg-white dark:bg-[#0D0D0D]">
        <div className="p-6 border-bottom border-[#141414]/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#141414] dark:bg-white rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-white dark:text-black w-5 h-5" />
            </div>
            <h1 className="font-bold text-xl tracking-tight dark:text-white">FireWatch</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.filter(item => !item.adminOnly || user?.role === 'Admin').map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium",
                currentView === item.id 
                  ? "bg-[#141414] text-white shadow-lg shadow-[#141414]/10 dark:bg-white dark:text-black dark:shadow-white/5" 
                  : "text-[#141414]/60 dark:text-white/50 hover:bg-[#141414]/5 dark:hover:bg-white/5 hover:text-[#141414] dark:hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#141414]/5 dark:border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#141414]/60 dark:text-white/50 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-[#141414]/5 dark:border-white/5 flex items-center justify-between px-8 bg-white dark:bg-[#0D0D0D] z-10">
          <div className="flex items-center gap-4 bg-[#141414]/5 dark:bg-white/5 px-3 py-1.5 rounded-full w-96">
            <Search className="w-4 h-4 text-[#141414]/40 dark:text-white/30" />
            <input 
              type="text" 
              placeholder="Cari data atau perangkat..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full dark:text-white dark:placeholder-white/20"
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 hover:bg-[#141414]/5 dark:hover:bg-white/5 rounded-full transition-colors text-[#141414]/60 dark:text-white/60"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="relative p-2 hover:bg-[#141414]/5 dark:hover:bg-white/5 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-[#141414]/60 dark:text-white/60" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
              )}
            </button>
            <div className="h-8 w-px bg-[#141414]/10 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-[10px] text-[#141414]/50 dark:text-white/30 font-bold uppercase tracking-widest">{user.role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 border-2 border-white dark:border-white/20 shadow-sm" />
            </div>
          </div>
        </header>

        {/* View Space */}
        <div className="flex-1 overflow-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'dashboard' && <DashboardView logs={logs} devices={devices} isDark={isDark} />}
              {currentView === 'gis' && <MapView devices={devices} logs={logs} />}
              {currentView === 'devices' && <DeviceView devices={devices} setDevices={setDevices} />}
              {currentView === 'raw' && <RawDataView logs={logs} />}
              {currentView === 'reports' && <ReportView logs={logs} />}
              {currentView === 'users' && <UserView />}
              {currentView === 'settings' && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Fire Alert Alert */}
        <AnimatePresence>
          {showAlert && (
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="absolute top-20 right-8 z-50 bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-4 max-w-sm border-2 border-white/20 backdrop-blur-md"
            >
              <div className="p-2 bg-white/20 rounded-xl animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg leading-tight mb-1">BAHAYA KEBAKARAN!</h4>
                <p className="text-sm text-red-100 mb-2">
                  Terdeteksi api di <strong>{showAlert.deviceName} ({showAlert.confidence.toFixed(2)})</strong>
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowAlert(null)}
                    className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Abaikan
                  </button>
                  <button 
                    onClick={() => { setCurrentView('gis'); setShowAlert(null); }}
                    className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                  >
                    Lihat Peta
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
