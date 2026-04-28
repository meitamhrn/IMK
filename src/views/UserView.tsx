import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Shield, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { User } from '../types';
import { cn } from '../lib/utils';

export default function UserView() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'User' as User['role'] });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const token = localStorage.getItem('token');
  const ax = axios.create({ headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await ax.get('/api/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'User' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingUser) {
        const res = await ax.put(`/api/users/${editingUser.id}`, formData);
        setUsers(prev => prev.map(u => u.id === editingUser.id ? res.data : u));
      } else {
        const res = await ax.post('/api/users', formData);
        setUsers(prev => [...prev, res.data]);
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;
    try {
      await ax.delete(`/api/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus pengguna');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nama', 'Email', 'Role', 'Status'].join(',');
    const rows = users.map(u => [u.id, u.name, u.email, u.role, u.status].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-[#141414] dark:text-white">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Manajemen Pengguna</h2>
          <p className="text-[#141414]/50 dark:text-white/40 font-medium">Atur hak akses dan profil personil FireWatch.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#141414] dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[#141414]/20"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengguna
        </button>
      </div>

      <div className="bg-white dark:bg-[#0D0D0D] rounded-3xl border border-[#141414]/5 dark:border-white/5 shadow-sm overflow-hidden scale-in">
        <div className="p-6 border-b border-[#141414]/5 dark:border-white/5 flex justify-between items-center bg-[#FDFCFB]/50 dark:bg-transparent">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141414]/30" />
            <input 
              type="text" 
              placeholder="Cari nama atau email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-white/5 border border-[#141414]/10 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#141414]/5 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="text-xs font-bold px-3 py-2 border border-[#141414]/10 dark:border-white/10 rounded-lg hover:bg-[#141414]/5 dark:hover:bg-white/5 transition-colors dark:text-white">Ekspor CSV</button>
          </div>
        </div>

        {fetching ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#141414]/20" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className="group p-6 bg-[#FDFCFB]/50 dark:bg-white/5 border border-[#141414]/5 dark:border-white/5 rounded-3xl hover:bg-white dark:hover:bg-white/[0.08] transition-all hover:shadow-xl hover:shadow-[#141414]/5 relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-950 dark:to-red-950 flex items-center justify-center text-orange-600 font-black text-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(user)} className="p-2 hover:bg-[#141414]/5 dark:hover:bg-white/5 rounded-lg text-blue-600 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 dark:text-white">{user.name}</h4>
                  <div className="flex items-center gap-1.5 text-[#141414]/40 dark:text-white/30 text-xs font-medium mb-4">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141414]/5 dark:bg-white/5 rounded-lg text-[#141414]/60 dark:text-white/50 text-[10px] font-bold uppercase tracking-widest">
                      <Shield className="w-3 h-3" />
                      {user.role}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", user.status === 'Online' ? 'bg-green-500' : 'bg-gray-300')} />
                      <span className="text-[10px] font-bold text-[#141414]/30 dark:text-white/20 uppercase tracking-widest">{user.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="bg-white dark:bg-[#121212] w-full max-w-lg rounded-3xl p-8 relative shadow-2xl border border-white/5 slide-up">
            <button onClick={handleCloseModal} className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black mb-6 dark:text-white">{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 dark:text-white/30 ml-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full h-12 bg-[#141414]/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#141414]/10 dark:text-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 dark:text-white/30 ml-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="w-full h-12 bg-[#141414]/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#141414]/10 dark:text-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 dark:text-white/30 ml-1">
                  Password {editingUser && '(Kosongkan jika tidak ingin diubah)'}
                </label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editingUser}
                  className="w-full h-12 bg-[#141414]/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#141414]/10 dark:text-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 dark:text-white/30 ml-1">Role</label>
                <div className="flex gap-2">
                  {(['Admin', 'User', 'Petugas Lapangan'] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({...formData, role})}
                      className={cn(
                        "flex-1 h-12 rounded-2xl text-xs font-bold transition-all border",
                        formData.role === role 
                          ? "bg-[#141414] dark:bg-white text-white dark:text-black border-transparent" 
                          : "bg-transparent border-[#141414]/10 dark:border-white/10 text-[#141414]/40 dark:text-white/20"
                      )}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 h-12 border border-[#141414]/10 dark:border-white/10 rounded-2xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95 text-[#141414] dark:text-white"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-[#141414] dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .scale-in { animation: scale-in 0.3s ease-out; }
        .slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
