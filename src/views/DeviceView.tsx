import React, { useState } from 'react';
import { Plus, Search, MoreVertical, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Device } from '../types';
import { cn } from '../lib/utils';

interface DeviceViewProps {
  devices: Device[];
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
}

export default function DeviceView({ devices, setDevices }: DeviceViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState({ name: '', location: '', lat: '', lng: '', status: 'Aktif' as 'Aktif' | 'Non-aktif' });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const token = localStorage.getItem('token');
  const ax = axios.create({ headers: { Authorization: `Bearer ${token}` } });

  const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (device?: Device) => {
    if (device) {
      setEditingDevice(device);
      setFormData({ name: device.name, location: device.location, lat: device.lat.toString(), lng: device.lng.toString(), status: device.status });
    } else {
      setEditingDevice(null);
      setFormData({ name: '', location: '', lat: '', lng: '', status: 'Aktif' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDevice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = { 
      ...formData, 
      lat: parseFloat(formData.lat), 
      lng: parseFloat(formData.lng) 
    };

    try {
      if (editingDevice) {
        const res = await ax.put(`/api/devices/${editingDevice.id}`, data);
        setDevices(prev => prev.map(d => d.id === editingDevice.id ? res.data : d));
      } else {
        const res = await ax.post('/api/devices', data);
        setDevices(prev => [...prev, res.data]);
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan perangkat');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus perangkat ini?')) return;
    try {
      await ax.delete(`/api/devices/${id}`);
      setDevices(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus perangkat');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nama', 'Lokasi', 'Status', 'Lat', 'Lng'].join(',');
    const rows = devices.map(d => [d.id, d.name, d.location, d.status, d.lat, d.lng].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "devices_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Manajemen Perangkat</h2>
          <p className="text-[#141414]/50 dark:text-white/40 font-medium">Kelola daftar Raspberry Pi dan sensor IoT Anda.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#141414] dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[#141414]/20"
        >
          <Plus className="w-4 h-4" />
          Tambah Perangkat
        </button>
      </div>

      <div className="bg-white dark:bg-[#0D0D0D] rounded-3xl border border-[#141414]/5 dark:border-white/5 shadow-sm overflow-hidden scale-in">
        <div className="p-6 border-b border-[#141414]/5 dark:border-white/5 flex justify-between items-center bg-[#FDFCFB]/50 dark:bg-transparent">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141414]/30" />
            <input 
              type="text" 
              placeholder="Cari ID atau nama..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-white/5 border border-[#141414]/10 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#141414]/5 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="text-xs font-bold px-3 py-2 border border-[#141414]/10 dark:border-white/10 rounded-lg hover:bg-[#141414]/5 dark:hover:bg-white/5 transition-colors dark:text-white">Ekspor CSV</button>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-bottom border-[#141414]/5 dark:border-white/5 bg-[#FDFCFB]/50 dark:bg-transparent">
              <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#141414]/40 dark:text-white/20">ID Device</th>
              <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#141414]/40 dark:text-white/20">Nama Perangkat</th>
              <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#141414]/40 dark:text-white/20">Lokasi</th>
              <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#141414]/40 dark:text-white/20">Status</th>
              <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#141414]/40 dark:text-white/20 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141414]/5 dark:divide-white/5">
            {filteredDevices.map((device) => (
              <tr key={device.id} className="hover:bg-[#141414]/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-5">
                  <span className="font-mono text-xs font-bold text-[#141414]/40 dark:text-white/20">#{device.id.toString().slice(-4)}</span>
                </td>
                <td className="px-6 py-5">
                  <p className="font-bold text-sm dark:text-white">{device.name}</p>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-medium text-[#141414]/60 dark:text-white/40">{device.location}</p>
                </td>
                <td className="px-6 py-5">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-lg",
                    device.status === 'Aktif' ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                  )}>
                    {device.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(device)} className="p-2 hover:bg-[#141414]/5 dark:hover:bg-white/5 rounded-lg transition-colors text-blue-600 dark:text-blue-400">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(device.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="bg-white dark:bg-[#121212] w-full max-w-lg rounded-3xl p-8 relative shadow-2xl border border-white/5 slide-up">
            <button onClick={handleCloseModal} className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black mb-6 dark:text-white">{editingDevice ? 'Edit Perangkat' : 'Tambah Perangkat'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 dark:text-white/30 ml-1">Nama Perangkat</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full h-12 bg-[#141414]/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#141414]/10 dark:text-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 dark:text-white/30 ml-1">Lokasi</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                  className="w-full h-12 bg-[#141414]/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#141414]/10 dark:text-white transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 dark:text-white/30 ml-1">Latitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData({...formData, lat: e.target.value})}
                    required
                    className="w-full h-12 bg-[#141414]/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#141414]/10 dark:text-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 dark:text-white/30 ml-1">Longitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData({...formData, lng: e.target.value})}
                    required
                    className="w-full h-12 bg-[#141414]/5 dark:bg-white/5 border border-transparent rounded-2xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#141414]/10 dark:text-white transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 dark:text-white/30 ml-1">Status</label>
                <div className="flex gap-2">
                  {(['Aktif', 'Non-aktif'] as const).map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({...formData, status})}
                      className={cn(
                        "flex-1 h-12 rounded-2xl text-xs font-bold transition-all border",
                        formData.status === status 
                          ? "bg-[#141414] dark:bg-white text-white dark:text-black border-transparent" 
                          : "bg-transparent border-[#141414]/10 dark:border-white/10 text-[#141414]/40 dark:text-white/20"
                      )}
                    >
                      {status}
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
                  Simpan Perubahan
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
