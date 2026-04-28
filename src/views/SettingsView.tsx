import { 
  Bell, 
  Lock, 
  Globe, 
  Cloud, 
  Zap,
  Info,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function SettingsView() {
  const sections = [
    {
      title: 'Notifikasi & Peringatan',
      items: [
        { icon: AlertBell, label: 'Push Notifications', desc: 'Terima peringatan kebakaran di browser.', status: true },
        { icon: Bell, label: 'Suara Alarm', desc: 'Mainkan suara bahaya saat api terdeteksi.', status: true },
      ]
    },
    {
      title: 'Konektivitas IoT',
      items: [
        { icon: Cloud, label: 'Mqtt Broker', desc: 'Konfigurasi alamat broker mqtt.', status: 'broker.hivemq.com' },
        { icon: Zap, label: 'API Gateway', desc: 'Endpoint untuk pengiriman data CNN.', status: 'api.firewatch.id/v1' },
      ]
    },
    {
      title: 'Keamanan',
      items: [
        { icon: Lock, label: 'Dua Faktor (2FA)', desc: 'Tambahkan lapisan keamanan akun.', status: false },
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl text-[#141414] dark:text-white">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Pengaturan Sistem</h2>
        <p className="text-[#141414]/50 dark:text-white/40 font-medium">Konfigurasi notifikasi, endpoint API, dan keamanan akses.</p>
      </div>

      <div className="space-y-8">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#141414]/50 dark:text-white/30 border-b border-[#141414]/5 dark:border-white/5 pb-2">{section.title}</h3>
            <div className="bg-white dark:bg-[#0D0D0D] rounded-2xl border border-[#141414]/5 dark:border-white/5 shadow-sm divide-y divide-[#141414]/5 dark:divide-white/5">
              {section.items.map((item, i) => (
                <div key={i} className="p-6 flex items-center justify-between group hover:bg-[#FDFCFB]/50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#141414]/5 dark:bg-white/5 rounded-xl group-hover:bg-[#141414] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-300">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm dark:text-white">{item.label}</p>
                      <p className="text-xs text-[#141414]/40 dark:text-white/40 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {typeof item.status === 'boolean' ? (
                      <div className={cn(
                        "w-10 h-6 rounded-full relative transition-colors",
                        item.status ? "bg-green-500" : "bg-gray-200 dark:bg-gray-800"
                      )}>
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                          item.status ? "right-1" : "left-1"
                        )} />
                      </div>
                    ) : (
                      <span className="text-xs font-mono font-bold text-[#141414]/40 dark:text-white/30 bg-[#141414]/5 dark:bg-white/5 px-3 py-1 rounded-lg">{item.status}</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-[#141414]/20 dark:text-white/20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-3xl flex gap-4">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-blue-900 dark:text-blue-200 leading-tight">Detail Versi</p>
          <p className="text-xs text-blue-700/70 dark:text-blue-200/50 font-medium">FireWatch v2.1.0-beta. Sistem ini menggunakan CNN berbasis MobileNetV2 dengan akurasi 98.4% pada dataset kebakaran indoor.</p>
        </div>
      </div>
    </div>
  );
}

function AlertBell(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
