import React, { useState } from 'react';
import { AlertTriangle, Mail, Lock, Loader2 } from 'lucide-react';
import axios from 'axios';

interface LoginViewProps {
  onLogin: (token: string, user: any) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/login', { email, password });
      onLogin(response.data.token, response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] dark:bg-[#0A0A0A] p-4 transition-colors duration-500">
      <div className="w-full max-w-md bg-white dark:bg-[#121212] rounded-3xl shadow-xl shadow-[#141414]/5 dark:shadow-none border border-[#141414]/5 dark:border-white/5 p-8 scale-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#141414] dark:bg-white rounded-2xl flex items-center justify-center mb-4 transition-transform hover:rotate-3">
            <AlertTriangle className="text-white dark:text-[#141414] w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight dark:text-white">FireWatch Admin</h1>
          <p className="text-sm text-[#141414]/40 dark:text-white/30 font-medium">Masuk untuk mengelola sistem Monitoring</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/50 dark:text-white/30 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141414]/30 dark:text-white/20" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@firewatch.id"
                required
                className="w-full h-12 bg-[#141414]/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl pl-12 pr-4 text-sm font-medium dark:text-white focus:outline-none focus:ring-2 focus:ring-[#141414]/10 dark:focus:ring-white/10 transition-all placeholder:text-[#141414]/20 dark:placeholder:text-white/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/50 dark:text-white/30 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141414]/30 dark:text-white/20" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-12 bg-[#141414]/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl pl-12 pr-4 text-sm font-medium dark:text-white focus:outline-none focus:ring-2 focus:ring-[#141414]/10 dark:focus:ring-white/10 transition-all placeholder:text-[#141414]/20 dark:placeholder:text-white/10"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#141414] dark:bg-white text-white dark:text-[#141414] rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#141414]/10 dark:shadow-none disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#141414]/5 dark:border-white/5 text-center">
          <p className="text-xs text-[#141414]/30 dark:text-white/20 font-medium">Lupa kata sandi? Hubungi Administrator Utama</p>
        </div>
      </div>
      <style>{`
        .scale-in { animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
