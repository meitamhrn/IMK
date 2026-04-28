import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Device, SensorLog } from '../types';
import { cn } from '../lib/utils';

// Fix for default marker icons in Leaflet
const markerIcon2x = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const markerIcon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const markerShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapViewProps {
  devices: Device[];
  logs: SensorLog[];
}

const fireIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(239, 68, 68, 0.8); animation: pulse-red 2s infinite;"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const normalIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #22c55e; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(34, 197, 94, 0.4);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export default function MapView({ devices, logs }: MapViewProps) {
  const center: [number, number] = [-6.2088, 106.8456];

  const getDeviceStatus = (deviceId: number) => {
    const recentLog = logs.find(l => l.deviceId === deviceId);
    return recentLog?.status === 'Fire' ? 'FIRE' : 'NORMAL';
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Geographic Information System</h2>
        <p className="text-[#141414]/50 dark:text-white/40 font-medium">Visualisasi lokasi perangkat dan indikator bahaya real-time.</p>
      </div>

      <div className="flex-1 min-h-[500px] relative rounded-3xl overflow-hidden border border-[#141414]/10 dark:border-white/10 shadow-2xl">
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {devices.map((device) => {
            const status = getDeviceStatus(device.id);
            const isFire = status === 'FIRE';
            
            return (
              <div key={device.id}>
                <Marker 
                  position={[device.lat, device.lng]} 
                  icon={isFire ? fireIcon : normalIcon}
                >
                  <Popup className="dark-popup">
                    <div className="p-1">
                      <h4 className="font-bold text-sm m-0">{device.name}</h4>
                      <p className="text-[10px] text-gray-500 mb-2">{device.location}</p>
                      <div className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full inline-block",
                        isFire ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                      )}>
                        {isFire ? "TERDETEKSI API" : "STATUS AMAN"}
                      </div>
                    </div>
                  </Popup>
                </Marker>
                {isFire && (
                  <Circle 
                    center={[device.lat, device.lng]} 
                    radius={500} 
                    pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 1 }} 
                  />
                )}
              </div>
            );
          })}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-6 right-6 bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-[#141414]/10 dark:border-white/10 z-[1000] space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest border-b border-[#141414]/5 dark:border-white/5 pb-2">Legenda</h4>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-[10px] font-bold text-[#141414]/60 dark:text-white/60">Terdeteksi Api</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold text-[#141414]/60 dark:text-white/60">Area Aman</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-orange-400 opacity-50" />
            <span className="text-[10px] font-bold text-[#141414]/60 dark:text-white/60">Radius Bahaya</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-red {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
}
