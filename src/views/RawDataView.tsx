import { Database, Filter, Download, ArrowUpDown } from 'lucide-react';
import { SensorLog } from '../types';
import { cn } from '../lib/utils';

interface RawDataViewProps {
  logs: SensorLog[];
}

export default function RawDataView({ logs }: RawDataViewProps) {
  return (
    <div className="space-y-6 text-[#141414] dark:text-white">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Raw Data Sensor</h2>
          <p className="text-[#141414]/50 dark:text-white/40 font-medium">Log mentah pengiriman data dari perangkat IoT secara real-time.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white dark:bg-white/5 border border-[#141414]/10 dark:border-white/10 text-[#141414] dark:text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#141414]/5 dark:hover:bg-white/5 transition-all outline-none">
            <Filter className="w-4 h-4" />
            Filter Lanjutan
          </button>
          <button className="bg-[#141414] dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all outline-none shadow-lg shadow-[#141414]/20">
            <Download className="w-4 h-4" />
            Export Log
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0D0D0D] rounded-3xl border border-[#141414]/5 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#FDFCFB]/50 dark:bg-white/[0.02] border-b border-[#141414]/5 dark:border-white/5">
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#141414]/40 dark:text-white/20">
                  <div className="flex items-center gap-1 cursor-pointer">Timestamp <ArrowUpDown className="w-3 h-3"/></div>
                </th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#141414]/40 dark:text-white/20">Perangkat</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#141414]/40 dark:text-white/20">ID Data</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#141414]/40 dark:text-white/20">Status Deteksi</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#141414]/40 dark:text-white/20">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/5 dark:divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className={cn(
                  "hover:bg-[#141414]/[0.02] dark:hover:bg-white/[0.02] transition-colors",
                  log.status === 'Fire' ? "bg-red-50/30 dark:bg-red-900/10" : ""
                )}>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium text-[#141414]/80 dark:text-white/60">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold">{log.deviceName || `Device #${log.deviceId}`}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-mono text-[10px] text-[#141414]/40 dark:text-white/30">LOG-{log.id.toString().padStart(6, '0')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className={cn(
                         "w-1.5 h-1.5 rounded-full",
                         log.status === 'Fire' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-green-500"
                       )} />
                       <span className={cn(
                         "text-xs font-bold",
                         log.status === 'Fire' ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                       )}>
                         {log.status === 'Fire' ? "FIRE DETECTED" : "NON-FIRE"}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32 bg-[#141414]/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          log.status === 'Fire' ? "bg-red-500" : "bg-blue-500"
                        )}
                        style={{ width: `${log.confidence * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-bold mt-1 text-[#141414]/40 dark:text-white/20">{(log.confidence * 100).toFixed(1)}% Score</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {logs.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center">
            <Database className="w-12 h-12 text-[#141414]/10 dark:text-white/10 mb-2" />
            <p className="text-sm font-medium text-[#141414]/40 dark:text-white/30">Tidak ada data sensor yang tersedia.</p>
          </div>
        )}

        <div className="p-4 border-t border-[#141414]/5 dark:border-white/5 flex justify-between items-center bg-[#FDFCFB]/50 dark:bg-transparent">
          <p className="text-[10px] font-bold text-[#141414]/40 dark:text-white/30 uppercase tracking-widest">Menampilkan {logs.length} Log Terbaru</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs font-bold border border-[#141414]/10 dark:border-white/10 rounded-lg opacity-50 cursor-not-allowed dark:text-white">Sebelumnya</button>
            <button className="px-3 py-1 text-xs font-bold border border-[#141414]/10 dark:border-white/10 rounded-lg hover:bg-[#141414]/5 dark:hover:bg-white/5 transition-colors dark:text-white">Selanjutnya</button>
          </div>
        </div>
      </div>
    </div>
  );
}
