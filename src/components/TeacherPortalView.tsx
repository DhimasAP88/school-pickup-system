'use client';

import React, { useState, useEffect } from 'react';
import { PickupQueueItem, PickupLogItem } from '@/types';
import { 
  CheckCircle, 
  GraduationCap, 
  Clock, 
  Car, 
  Filter, 
  Check, 
  UserCheck, 
  History,
  AlertCircle
} from 'lucide-react';

interface TeacherPortalViewProps {
  queue: PickupQueueItem[];
  logs: PickupLogItem[];
  onDismissStudent: (queueItemId: string, teacherName: string) => void;
}

export default function TeacherPortalView({ queue, logs, onDismissStudent }: TeacherPortalViewProps) {
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [teacherName, setTeacherName] = useState<string>('Ibu Guru (Wali Kelas)');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [elapsedTimes, setElapsedTimes] = useState<{ [id: string]: string }>({});

  // Get distinct classes available from queue and logs
  const allClasses = Array.from(
    new Set([...queue.map(q => q.classGrade), ...logs.map(l => l.classGrade)])
  ).sort();

  // Filtered queue based on selected class
  const filteredQueue = selectedClass === 'ALL'
    ? queue
    : queue.filter(item => item.classGrade === selectedClass);

  // Live stopwatch update
  useEffect(() => {
    const updateElapsed = () => {
      const now = Date.now();
      const updated: { [id: string]: string } = {};

      queue.forEach((item) => {
        const calledTime = new Date(item.calledAt).getTime();
        const diffSeconds = Math.max(0, Math.floor((now - calledTime) / 1000));
        const mins = Math.floor(diffSeconds / 60);
        const secs = diffSeconds % 60;
        updated[item.id] = `${mins}m ${secs}s`;
      });

      setElapsedTimes(updated);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [queue]);

  const handleDismiss = (item: PickupQueueItem) => {
    onDismissStudent(item.id, teacherName);
    setSuccessToast(`Berhasil menandai ${item.studentName} (Kelas ${item.classGrade}) telah dijemput.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4" />
            Portal Guru & Pelepasan Siswa
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Antrean Penjemputan Kelas
          </h1>
          <p className="text-emerald-100/90 text-sm mt-1">
            Pantau siswa yang orang tuanya sudah menunggu di gerbang. Klik tombol hijau jika siswa sudah diantar.
          </p>
        </div>

        {/* Teacher profile pill */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
            👩‍🏫
          </div>
          <div>
            <div className="text-[11px] text-emerald-200">Sedang Bertugas:</div>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-white/40 focus:border-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* Success alert */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 shadow-sm animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-semibold">{successToast}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Pilih Kelas:</span>
          <div className="flex flex-wrap gap-1.5 ml-2">
            <button
              onClick={() => setSelectedClass('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedClass === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Kelas ({queue.length})
            </button>
            {allClasses.map((cls) => {
              const countInClass = queue.filter(q => q.classGrade === cls).length;
              return (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedClass === cls
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Kelas {cls}</span>
                  {countInClass > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      selectedClass === cls ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'
                    }`}>
                      {countInClass}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Student Cards in Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Siswa yang Siap Dijemput</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
              {filteredQueue.length} Anak
            </span>
          </h2>
          <span className="text-xs text-slate-400">
            Klik tombol &quot;Sudah Dijemput&quot; begitu anak diserahkan
          </span>
        </div>

        {filteredQueue.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {selectedClass === 'ALL' 
                ? 'Tidak ada siswa yang sedang menunggu' 
                : `Tidak ada siswa Kelas ${selectedClass} yang sedang menunggu`}
            </h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Saat satpam di gerbang menginput plat nomor penjemput, kartu siswa akan muncul di halaman ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQueue.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border-2 border-slate-200 hover:border-emerald-500/50 p-5 shadow-sm transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-black tracking-wide">
                      Kelas {item.classGrade}
                    </span>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg font-mono text-xs font-bold text-slate-700">
                      <Car className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.licensePlate}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    {item.studentName}
                  </h3>

                  <div className="mt-2 text-xs text-slate-500 space-y-1">
                    <div>Penjemput: <span className="font-semibold text-slate-700">{item.parentName}</span></div>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Menunggu sejak: <span className="font-mono font-semibold">{new Date(item.calledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span></span>
                      <span className="mx-1">•</span>
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {elapsedTimes[item.id] || '0m 0s'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dismiss Action Button */}
                <button
                  onClick={() => handleDismiss(item)}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Sudah Dijemput (Selesai)</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Today section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <History className="w-5 h-5 text-slate-500" />
          <h3>Siswa yang Telah Dijemput Hari Ini ({logs.length})</h3>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-400">Belum ada catatan penjemputan selesai hari ini.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-800">{log.studentName}</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-semibold">Kelas {log.classGrade}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-500">
                  <span className="font-mono">{log.licensePlate}</span>
                  <span>Waktu tunggu: <strong className="text-slate-800">{log.durationMinutes} menit</strong></span>
                  <span className="text-[11px] text-slate-400 italic">Oleh: {log.pickedUpBy || 'Guru'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
