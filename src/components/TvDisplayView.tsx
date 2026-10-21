'use client';

import React, { useState, useEffect } from 'react';
import { PickupQueueItem } from '@/types';
import { announcer } from '@/lib/audio-announcer';
import { 
  Volume2, 
  VolumeX, 
  Maximize, 
  Clock, 
  Car, 
  GraduationCap, 
  Users, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface TvDisplayViewProps {
  queue: PickupQueueItem[];
}

export default function TvDisplayView({ queue }: TvDisplayViewProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [elapsedTimes, setElapsedTimes] = useState<{ [id: string]: { text: string; seconds: number } }>({});

  // Clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer counter tick for each waiting student
  useEffect(() => {
    const calculateElapsed = () => {
      const now = Date.now();
      const newElapsed: { [id: string]: { text: string; seconds: number } } = {};

      queue.forEach((item) => {
        const calledTime = new Date(item.calledAt).getTime();
        const diffSeconds = Math.max(0, Math.floor((now - calledTime) / 1000));
        
        const minutes = Math.floor(diffSeconds / 60);
        const seconds = diffSeconds % 60;
        const text = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        newElapsed[item.id] = { text, seconds: diffSeconds };
      });

      setElapsedTimes(newElapsed);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [queue]);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    announcer.setMuted(nextMuted);
  };

  const handleTestAudio = () => {
    announcer.testVoice();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none">
      {/* Top TV Header Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between shadow-xl backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">
                Layar Panggilan Penjemputan Siswa
              </h1>
            </div>
            <p className="text-xs md:text-sm text-slate-400 font-medium">
              SD Tunas Bangsa • Pintu Keluar Lobi Utama
            </p>
          </div>
        </div>

        {/* Middle Stats Badge */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl flex items-center gap-3 shadow-inner">
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Sedang Menunggu</div>
              <div className="text-lg font-bold text-white leading-none">
                <span className="text-emerald-400 font-black">{queue.length}</span> Siswa
              </div>
            </div>
          </div>

          {/* Sound & Fullscreen Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold ${
                isMuted 
                  ? 'bg-rose-950/60 border-rose-800 text-rose-300 hover:bg-rose-900/60' 
                  : 'bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900/60'
              }`}
              title={isMuted ? "Suara Panggilan Nonaktif" : "Suara Panggilan Aktif"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Suara Aktif'}</span>
            </button>

            <button
              onClick={handleTestAudio}
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all text-xs font-semibold flex items-center gap-1.5"
              title="Coba Pengeras Suara (TTS)"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Tes Audio</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              title="Layar Penuh (F11)"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Digital Clock */}
        <div className="text-right">
          <div className="text-2xl md:text-3xl font-black tracking-tight text-white font-mono drop-shadow">
            {currentTime || '--:--:-- WIB'}
          </div>
          <div className="text-xs md:text-sm text-slate-400 font-medium capitalize">
            {currentDate}
          </div>
        </div>
      </header>

      {/* Main Grid: Student Cards */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {queue.length === 0 ? (
          <div className="h-[65vh] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
            <div className="w-24 h-24 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-6 shadow-2xl">
              <Car className="w-12 h-12 text-slate-500" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-200 mb-2">
              Belum Ada Antrean Penjemputan
            </h2>
            <p className="text-slate-400 max-w-md text-sm lg:text-base">
              Nama murid akan otomatis tampil di layar ini beserta penghitung waktu begitu kendaraan orang tua tercatat di pos gerbang.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {queue.map((item, index) => {
              const elapsed = elapsedTimes[item.id] || { text: '00:00', seconds: 0 };
              const isOvertime = elapsed.seconds > 600; // > 10 mins (red)
              const isWarning = elapsed.seconds > 300 && !isOvertime; // 5-10 mins (yellow)

              return (
                <div
                  key={item.id}
                  className={`relative rounded-3xl border transition-all duration-300 p-5 shadow-2xl overflow-hidden flex flex-col justify-between ${
                    isOvertime
                      ? 'bg-gradient-to-b from-rose-950/80 to-slate-900 border-rose-600/60 shadow-rose-950/50 ring-2 ring-rose-500/40'
                      : isWarning
                      ? 'bg-gradient-to-b from-amber-950/60 to-slate-900 border-amber-600/50 shadow-amber-950/40'
                      : 'bg-gradient-to-b from-slate-900 to-slate-900/90 border-slate-800 hover:border-slate-700 shadow-slate-950/80'
                  }`}
                >
                  {/* Decorative Glow */}
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl pointer-events-none rounded-full ${
                    isOvertime ? 'bg-rose-500/20' : isWarning ? 'bg-amber-500/15' : 'bg-blue-500/10'
                  }`} />

                  {/* Header inside Card: Queue Number & Plate */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-black flex items-center justify-center text-slate-300">
                          #{index + 1}
                        </span>
                        {/* Vehicle Plate Badge - Indonesian Style */}
                        <div className="px-3 py-1 bg-black/90 border border-slate-600 rounded-lg shadow font-mono text-xs font-black tracking-widest text-white flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-yellow-400" />
                          <span>{item.licensePlate}</span>
                        </div>
                      </div>

                      {/* Class Badge */}
                      <span className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 font-extrabold text-sm tracking-wide">
                        Kelas {item.classGrade}
                      </span>
                    </div>

                    {/* Student Name */}
                    <h3 className="text-2xl font-black text-white tracking-tight leading-snug line-clamp-2 mt-1">
                      {item.studentName}
                    </h3>

                    {/* Parent Info */}
                    <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="text-slate-500">Penjemput:</span>
                      <span className="text-slate-300 font-medium">{item.parentName}</span>
                    </div>
                  </div>

                  {/* Footer inside Card: Stopwatch Timer */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Waktu Menunggu</span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        Tiba {new Date(item.calledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Timer Badge with Color Coding */}
                    <div
                      className={`px-3.5 py-2 rounded-2xl font-mono text-xl font-black tracking-wider flex items-center gap-2 shadow-lg ${
                        isOvertime
                          ? 'bg-rose-500/20 border border-rose-500/60 text-rose-300 animate-pulse-fast'
                          : isWarning
                          ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300'
                          : 'bg-emerald-500/20 border border-emerald-500/60 text-emerald-300'
                      }`}
                    >
                      {isOvertime && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                      <span>{elapsed.text}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer Ticker / Instructions */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            &lt; 5 Menit: Baru Tiba
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            5 - 10 Menit: Sedang Menunggu
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            &gt; 10 Menit: Perhatian Khusus
          </span>
        </div>
        <div className="text-slate-500 hidden sm:block">
          Sistem Penjemputan Terpadu • Harap tertib saat menjemput
        </div>
      </footer>
    </div>
  );
}
