import { FileText, Download, Calendar, ArrowRight } from 'lucide-react';
import { SensorLog } from '../types';

interface ReportViewProps {
  logs: SensorLog[];
}

export default function ReportView({ logs }: ReportViewProps) {
  const reports = [
    { title: 'Laporan Harian', date: '24 Apr 2026', type: 'PDF', size: '1.2 MB' },
    { title: 'Laporan Mingguan', date: '17 - 23 Apr 2026', type: 'PDF', size: '4.5 MB' },
    { title: 'Rekapitulasi Deteksi Bulanan', date: 'Maret 2026', type: 'CSV', size: '128 KB' },
    { title: 'Analisis Performa Model CNN', date: 'Q1 2026', type: 'PDF', size: '8.1 MB' },
  ];

  return (
    <div className="space-y-6 text-[#141414] dark:text-white">
       <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Pusat Laporan</h2>
          <p className="text-[#141414]/50 dark:text-white/40 font-medium">Analisis histori kejadian dan performa sistem pemantauan.</p>
        </div>
        <button className="bg-[#141414] dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 shadow-lg shadow-[#141414]/20 transition-all">
          <Calendar className="w-4 h-4" />
          Kustomisasi Laporan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-[#141414] dark:bg-blue-600/10 text-white p-8 rounded-3xl relative overflow-hidden dark:border dark:border-blue-500/20">
          <div className="relative z-10 space-y-4 max-w-lg">
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 dark:text-blue-400">Insight Terkini</span>
             <h3 className="text-4xl font-extrabold leading-tight">Kejadian Berbahaya Menurun 15% Bulan Ini</h3>
             <p className="text-white/60 dark:text-gray-400 font-medium text-sm">Optimalisasi CNN Versi 2.1 berhasil mendeteksi api lebih akurat dengan penurunan False Positive sebesar 15% pada area publik.</p>
             <button className="bg-white dark:bg-blue-600 text-[#141414] dark:text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform">
               Lihat Detail Analisis <ArrowRight className="w-4 h-4"/>
             </button>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />
           <FileText className="absolute bottom-[-40px] right-[-20px] w-64 h-64 text-white/5 dark:text-blue-500/10 opacity-20 rotate-12" />
        </div>

        {reports.map((report, i) => (
          <div key={i} className="bg-white dark:bg-[#0D0D0D] border border-[#141414]/5 dark:border-white/5 p-6 rounded-2xl shadow-sm hover:shadow-md dark:hover:bg-white/[0.04] transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-[#141414]/5 dark:bg-white/5 rounded-xl group-hover:bg-[#141414] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-[#141414]/5 dark:bg-white/5 rounded-full text-[#141414]/40 dark:text-white/20">{report.type}</span>
            </div>
            <h4 className="font-bold text-lg mb-1">{report.title}</h4>
            <p className="text-xs text-[#141414]/40 dark:text-white/20 font-medium mb-6">{report.date} • {report.size}</p>
            <button className="w-full py-2.5 rounded-xl border border-[#141414]/10 dark:border-white/10 text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#141414]/5 dark:hover:bg-white/5 transition-colors dark:text-white">
              <Download className="w-4 h-4" />
              Unduh Laporan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
