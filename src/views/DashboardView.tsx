import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp 
} from 'lucide-react';
import { SensorLog, Device } from '../types';
import { cn } from '../lib/utils';

interface DashboardViewProps {
  logs: SensorLog[];
  devices: Device[];
  isDark: boolean;
}

export default function DashboardView({ logs, devices, isDark }: DashboardViewProps) {
  const activeDevices = devices.filter(d => d.status === 'Aktif').length;
  const fireAlerts = logs.filter(l => l.status === 'Fire').length;
  
  // Prepare chart data (simple mock aggregation)
  const chartData = [
    { name: '08:00', fire: 0, normal: 10 },
    { name: '10:00', fire: 1, normal: 15 },
    { name: '12:00', fire: 0, normal: 12 },
    { name: '14:00', fire: 4, normal: 8 },
    { name: '16:00', fire: 2, normal: 14 },
    { name: '18:00', fire: 0, normal: 20 },
  ];

  const recentFireAlerts = logs.filter(l => l.status === 'Fire').slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Overview Monitoring</h2>
          <p className="text-[#141414]/50 dark:text-white/40 font-medium">Ringkasan status sistem pemantauan kebakaran real-time.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white dark:bg-white/5 border border-[#141414]/5 dark:border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs font-bold uppercase tracking-widest text-[#141414]/60 dark:text-white/40">Sistem Online</span>
           </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Activity className="w-5 h-5 text-blue-600" />} 
          label="Total Perangkat" 
          value={devices.length.toString()} 
          subText={`${activeDevices} Aktif Sekarang`}
          color="blue"
        />
        <StatCard 
          icon={<AlertCircle className="w-5 h-5 text-red-600" />} 
          label="Deteksi Kebakaran" 
          value={fireAlerts.toString()} 
          subText="Dalam 24 Jam Terakhir"
          color="red"
        />
        <StatCard 
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} 
          label="Status Lingkungan" 
          value="Aman" 
          subText="Tidak ada ancaman aktif"
          color="green"
        />
        <StatCard 
          icon={<TrendingUp className="w-5 h-5 text-orange-600" />} 
          label="Confidence Avg" 
          value="94.2%" 
          subText="+2.1% dari rata-rata"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0D0D0D] rounded-2xl border border-[#141414]/5 dark:border-white/5 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Statistik Kejadian</h3>
            <select className="bg-[#141414]/5 dark:bg-white/5 border-none rounded-lg text-xs font-bold p-2 focus:outline-none dark:text-white">
              <optgroup label="Periode">
                <option>7 Hari Terakhir</option>
                <option>30 Hari Terakhir</option>
              </optgroup>
            </select>
          </div>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                 <defs>
                   <linearGradient id="colorFire" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#ffffff10" : "#14141410"} />
                 <XAxis 
                   dataKey="name" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fontWeight: 500, fill: 'currentColor' }} 
                   dy={10}
                 />
                 <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fontWeight: 500, fill: 'currentColor' }} 
                 />
                 <Tooltip 
                   contentStyle={{ 
                     borderRadius: '12px', 
                     border: 'none', 
                     boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                     backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                     color: isDark ? '#FFFFFF' : '#000000'
                   }}
                 />
                 <Area type="monotone" dataKey="fire" stroke="#ef4444" fillOpacity={1} fill="url(#colorFire)" strokeWidth={2} />
                 <Area type="monotone" dataKey="normal" stroke={isDark ? "#FFFFFF" : "#141414"} strokeDasharray="5 5" fill="transparent" strokeWidth={1} opacity={0.2} />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white dark:bg-[#0D0D0D] rounded-2xl border border-[#141414]/5 dark:border-white/5 p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Laporan Terbaru</h3>
          <div className="space-y-4">
            {recentFireAlerts.length > 0 ? recentFireAlerts.map((log) => (
              <div key={log.id} className="flex gap-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                <div className="p-2 bg-red-500 rounded-lg text-white">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-red-900 dark:text-red-400 truncate">Kebakaran Terdeteksi</p>
                  <p className="text-[10px] font-medium text-red-700/70 dark:text-red-400/50">{log.deviceName} • {new Date(log.timestamp).toLocaleTimeString()}</p>
                </div>
                <div className="text-[10px] font-bold text-red-600 bg-white dark:bg-red-800 dark:text-white px-2 py-1 rounded-md h-fit">
                  {Math.round(log.confidence * 100)}%
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-[#141414]/30 dark:text-white/10">
                <CheckCircle2 className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm font-medium">Semua Aman</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subText, color }: { icon: React.ReactNode, label: string, value: string, subText: string, color: 'blue' | 'red' | 'green' | 'orange' }) {
  const bgColors = {
    blue: 'bg-blue-50 dark:bg-blue-900/10',
    red: 'bg-red-50 dark:bg-red-900/10',
    green: 'bg-green-50 dark:bg-green-900/10',
    orange: 'bg-orange-50 dark:bg-orange-900/10'
  };

  return (
    <div className="bg-white dark:bg-[#0D0D0D] border border-[#141414]/5 dark:border-white/5 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-3">
        <div className={cn("p-2.5 rounded-xl", bgColors[color])}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/50 dark:text-white/30">{label}</p>
          <p className="text-2xl font-extrabold leading-none">{value}</p>
        </div>
      </div>
      <p className="text-[11px] font-medium text-[#141414]/40 dark:text-white/20 flex items-center gap-1.5">
        <Clock className="w-3 h-3" />
        {subText}
      </p>
    </div>
  );
}
