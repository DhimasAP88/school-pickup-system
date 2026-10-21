'use client';

import React, { useState } from 'react';
import { PickupLogItem } from '@/types';
import { 
  FileSpreadsheet, 
  Search, 
  Clock, 
  Users, 
  TrendingUp, 
  Zap, 
  Download,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface DailyLogsViewProps {
  logs: PickupLogItem[];
}

export default function DailyLogsView({ logs }: DailyLogsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');

  // Filter logs
  const filteredLogs = logs.filter(item => {
    const matchesSearch = 
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.parentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = selectedClass === 'ALL' || item.classGrade === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Calculate statistics
  const totalCompleted = logs.length;
  const avgWait = totalCompleted > 0 
    ? Math.round((logs.reduce((acc, curr) => acc + curr.durationMinutes, 0) / totalCompleted) * 10) / 10 
    : 0;
  
  const fastestWait = totalCompleted > 0
    ? Math.min(...logs.map(l => l.durationMinutes))
    : 0;

  const longestWait = totalCompleted > 0
    ? Math.max(...logs.map(l => l.durationMinutes))
    : 0;

  // Export to CSV function
  const handleExportCSV = () => {
    const headers = ['No', 'Nama Siswa', 'Kelas', 'Nomor Plat', 'Nama Orang Tua', 'Jam Dipanggil', 'Jam Dijemput', 'Durasi (Menit)', 'Petugas Pelepasan'];
    const rows = filteredLogs.map((l, index) => [
      index + 1,
      `"${l.studentName}"`,
      `"${l.classGrade}"`,
      `"${l.licensePlate}"`,
      `"${l.parentName}"`,
      `"${new Date(l.calledAt).toLocaleTimeString('id-ID')}"`,
      `"${new Date(l.pickedUpAt).toLocaleTimeString('id-ID')}"`,
      l.durationMinutes,
      `"${l.pickedUpBy || 'Guru'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap-penjemputan-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const availableClasses = Array.from(new Set(logs.map(l => l.classGrade))).sort();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Riwayat & Log Penjemputan
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Rekap evaluasi waktu tunggu dan laporan harian pelepasan siswa sekolah.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor CSV / Excel</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Siswa Dijemput</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalCompleted}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Hari ini</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Rata-Rata Waktu Tunggu</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {avgWait} <span className="text-sm font-normal text-slate-500">menit</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Target sekolah &lt; 5 menit</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Waktu Tercepat</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {fastestWait} <span className="text-sm font-normal text-slate-500">menit</span>
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Efisiensi tinggi</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Waktu Terlama</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {longestWait} <span className="text-sm font-normal text-slate-500">menit</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Perlu evaluasi kelas</div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama anak, plat nomor, atau orang tua..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Kelas:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="ALL">Semua Kelas</option>
            {availableClasses.map(cls => (
              <option key={cls} value={cls}>Kelas {cls}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">No</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4">Plat Kendaraan</th>
                <th className="py-3.5 px-4">Waktu Panggil</th>
                <th className="py-3.5 px-4">Waktu Dijemput</th>
                <th className="py-3.5 px-4">Lama Tunggu</th>
                <th className="py-3.5 px-4">Petugas / Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Tidak ada data log yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{log.studentName}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-bold">
                        {log.classGrade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">
                      {log.licensePlate}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {new Date(log.calledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {new Date(log.pickedUpAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        log.durationMinutes > 8
                          ? 'bg-rose-100 text-rose-800'
                          : log.durationMinutes > 4
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {log.durationMinutes} menit
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {log.pickedUpBy || 'Wali Kelas'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
