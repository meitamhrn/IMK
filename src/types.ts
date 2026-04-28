export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Petugas Lapangan';
  status: 'Online' | 'Offline';
}

export interface Device {
  id: number;
  name: string;
  location: string;
  status: 'Aktif' | 'Non-aktif';
  lat: number;
  lng: number;
}

export interface SensorLog {
  id: number;
  deviceId: number;
  deviceName?: string;
  timestamp: string;
  status: 'Fire' | 'Non-Fire';
  confidence: number;
}

export type View = 'dashboard' | 'gis' | 'devices' | 'users' | 'raw' | 'reports' | 'settings';
