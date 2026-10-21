'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Student, PickupQueueItem, PickupLogItem } from '@/types';
import { INITIAL_STUDENTS, INITIAL_QUEUE, INITIAL_LOGS } from '@/lib/mock-data';
import { announcer } from '@/lib/audio-announcer';
import { supabase } from '@/lib/supabase';
import TvDisplayView from '@/components/TvDisplayView';
import SecurityGateView from '@/components/SecurityGateView';
import TeacherPortalView from '@/components/TeacherPortalView';
import DailyLogsView from '@/components/DailyLogsView';
import DataManagementView from '@/components/DataManagementView';
import { 
  Tv, 
  ShieldCheck, 
  GraduationCap, 
  FileText, 
  Database, 
  SplitSquareVertical, 
  RefreshCw,
  Bell,
  Sparkles,
  Wifi,
  WifiOff,
  Code2,
  CheckCircle2,
  Copy
} from 'lucide-react';

type ActiveTab = 'tv' | 'gate' | 'teacher' | 'logs' | 'data' | 'split';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('split');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [queue, setQueue] = useState<PickupQueueItem[]>(INITIAL_QUEUE);
  const [logs, setLogs] = useState<PickupLogItem[]>(INITIAL_LOGS);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Supabase Connection Status
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean>(false);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Load state from localStorage on initial render as fallback
  useEffect(() => {
    try {
      const savedStudents = localStorage.getItem('school_pickup_students');
      if (savedStudents) setStudents(JSON.parse(savedStudents));

      const savedQueue = localStorage.getItem('school_pickup_queue');
      if (savedQueue) setQueue(JSON.parse(savedQueue));

      const savedLogs = localStorage.getItem('school_pickup_logs');
      if (savedLogs) setLogs(JSON.parse(savedLogs));
    } catch (e) {
      console.warn('LocalStorage load error', e);
    }
    setIsLoaded(true);
  }, []);

  // Sync state with Supabase & Subscribe to Realtime WebSocket
  useEffect(() => {
    let isSubscribed = true;

    async function initSupabaseData() {
      try {
        // Test connection & fetch active queue
        const { data: dbQueue, error: queueError } = await supabase
          .from('pickups')
          .select('*')
          .eq('status', 'WAITING')
          .order('called_at', { ascending: true });

        if (!queueError && dbQueue) {
          setIsSupabaseOnline(true);
          const mappedQueue: PickupQueueItem[] = dbQueue.map((item: any) => ({
            id: item.id,
            studentId: item.student_id || item.id,
            studentName: item.student_name,
            classGrade: item.class_grade,
            licensePlate: item.plate_number,
            parentName: item.parent_name,
            calledAt: item.called_at,
            status: item.status,
          }));
          setQueue(mappedQueue);
        }

        // Fetch completed pickups for logs
        const { data: dbLogs } = await supabase
          .from('pickups')
          .select('*')
          .eq('status', 'PICKED_UP')
          .order('picked_up_at', { ascending: false })
          .limit(100);

        if (dbLogs && dbLogs.length > 0) {
          const mappedLogs: PickupLogItem[] = dbLogs.map((item: any) => ({
            id: item.id,
            studentId: item.student_id || item.id,
            studentName: item.student_name,
            classGrade: item.class_grade,
            licensePlate: item.plate_number,
            parentName: item.parent_name,
            calledAt: item.called_at,
            pickedUpAt: item.picked_up_at || item.called_at,
            durationMinutes: item.duration_minutes || 1,
            status: 'PICKED_UP',
            pickedUpBy: item.picked_by || 'Guru',
          }));
          setLogs(mappedLogs);
        }

        // Fetch students & vehicles
        const { data: dbStudents } = await supabase
          .from('students')
          .select('*, vehicles(plate_number)');

        if (dbStudents && dbStudents.length > 0) {
          const mappedStudents: Student[] = [];
          dbStudents.forEach((s: any) => {
            const plates = s.vehicles && s.vehicles.length > 0
              ? s.vehicles.map((v: any) => v.plate_number).join(', ')
              : 'B 1234 ABC';

            mappedStudents.push({
              id: s.id,
              name: s.name,
              classGrade: s.class_grade,
              parentName: s.parent_name,
              parentPhone: s.parent_phone || '-',
              licensePlate: plates,
            });
          });
          setStudents(mappedStudents);
        }
      } catch (err) {
        console.warn('Supabase not yet configured or tables not created, using local state.', err);
        setIsSupabaseOnline(false);
      }
    }

    initSupabaseData();

    // Supabase Realtime Subscription (PostgreSQL Changes via WebSocket)
    const realtimeChannel = supabase
      .channel('public:pickups')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pickups' },
        (payload: any) => {
          if (!isSubscribed) return;
          setIsSupabaseOnline(true);

          if (payload.eventType === 'INSERT') {
            const newItem = payload.new;
            if (newItem.status === 'WAITING') {
              const mapped: PickupQueueItem = {
                id: newItem.id,
                studentId: newItem.student_id || newItem.id,
                studentName: newItem.student_name,
                classGrade: newItem.class_grade,
                licensePlate: newItem.plate_number,
                parentName: newItem.parent_name,
                calledAt: newItem.called_at,
                status: 'WAITING',
              };

              setQueue((prev) => {
                if (prev.some(q => q.id === mapped.id)) return prev;
                return [...prev, mapped];
              });

              // Voice announcement if called in the last 15 seconds
              const diffMs = Date.now() - new Date(newItem.called_at).getTime();
              if (diffMs < 15000) {
                announcer.announceStudents([{ name: newItem.student_name, classGrade: newItem.class_grade }]);
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new;
            if (updated.status === 'PICKED_UP') {
              // Remove from active queue
              setQueue((prev) => prev.filter((q) => q.id !== updated.id));

              // Add to logs
              const logEntry: PickupLogItem = {
                id: updated.id,
                studentId: updated.student_id || updated.id,
                studentName: updated.student_name,
                classGrade: updated.class_grade,
                licensePlate: updated.plate_number,
                parentName: updated.parent_name,
                calledAt: updated.called_at,
                pickedUpAt: updated.picked_up_at || new Date().toISOString(),
                durationMinutes: updated.duration_minutes || 1,
                status: 'PICKED_UP',
                pickedUpBy: updated.picked_by || 'Guru',
              };

              setLogs((prev) => [logEntry, ...prev.filter(l => l.id !== updated.id)]);
            } else if (updated.status === 'WAITING') {
              setQueue((prev) =>
                prev.map((q) => (q.id === updated.id ? { ...q, calledAt: updated.called_at } : q))
              );
            }
          } else if (payload.eventType === 'DELETE') {
            setQueue((prev) => prev.filter((q) => q.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSupabaseOnline(true);
        }
      });

    return () => {
      isSubscribed = false;
      supabase.removeChannel(realtimeChannel);
    };
  }, []);

  // Save changes to localStorage as secondary backup
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('school_pickup_students', JSON.stringify(students));
      localStorage.setItem('school_pickup_queue', JSON.stringify(queue));
      localStorage.setItem('school_pickup_logs', JSON.stringify(logs));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }, [students, queue, logs, isLoaded]);

  // Action: Call students from Gate (Persists to Supabase & Realtime)
  const handleCallStudents = async (selectedStudents: Student[], plateNumber: string) => {
    const nowIso = new Date().toISOString();

    // 1. Optimistic Local Update
    setQueue((prevQueue) => {
      const updated = [...prevQueue];
      selectedStudents.forEach((student) => {
        const existingIdx = updated.findIndex((q) => q.studentId === student.id);
        if (existingIdx >= 0) {
          updated[existingIdx] = { ...updated[existingIdx], calledAt: nowIso };
        } else {
          updated.push({
            id: 'q-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            studentId: student.id,
            studentName: student.name,
            classGrade: student.classGrade,
            licensePlate: plateNumber,
            parentName: student.parentName,
            calledAt: nowIso,
            status: 'WAITING',
          });
        }
      });
      return updated;
    });

    // 2. Play Audio Announcement
    announcer.announceStudents(
      selectedStudents.map((s) => ({ name: s.name, classGrade: s.classGrade }))
    );

    // 3. Sync to Supabase
    try {
      const dbRows = selectedStudents.map((student) => ({
        id: 'q-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        student_id: student.id,
        student_name: student.name,
        class_grade: student.classGrade,
        plate_number: plateNumber,
        parent_name: student.parentName,
        called_at: nowIso,
        status: 'WAITING',
      }));

      await supabase.from('pickups').insert(dbRows);
    } catch (err) {
      console.warn('Supabase insert fallback to local', err);
    }
  };

  // Action: Teacher dismisses student ("Sudah Dijemput")
  const handleDismissStudent = async (queueItemId: string, teacherName: string) => {
    const targetItem = queue.find((q) => q.id === queueItemId);
    if (!targetItem) return;

    const nowIso = new Date().toISOString();
    const calledTime = new Date(targetItem.calledAt).getTime();
    const durationMinutes = Math.max(1, Math.round((Date.now() - calledTime) / 60000));

    // 1. Optimistic Local Update
    const logEntry: PickupLogItem = {
      ...targetItem,
      status: 'PICKED_UP',
      pickedUpAt: nowIso,
      durationMinutes,
      pickedUpBy: teacherName,
    };

    setQueue((prev) => prev.filter((q) => q.id !== queueItemId));
    setLogs((prev) => [logEntry, ...prev]);

    // 2. Update Supabase record
    try {
      await supabase
        .from('pickups')
        .update({
          status: 'PICKED_UP',
          picked_up_at: nowIso,
          duration_minutes: durationMinutes,
          picked_by: teacherName,
        })
        .eq('id', queueItemId);
    } catch (err) {
      console.warn('Supabase update fallback to local', err);
    }
  };

  // Student CRUD actions
  const handleAddStudent = async (student: Student) => {
    setStudents((prev) => [student, ...prev]);
    try {
      await supabase.from('students').insert({
        id: student.id,
        name: student.name,
        class_grade: student.classGrade,
        parent_name: student.parentName,
        parent_phone: student.parentPhone,
      });

      if (student.licensePlate) {
        await supabase.from('vehicles').insert({
          student_id: student.id,
          plate_number: student.licensePlate,
        });
      }
    } catch (e) {
      console.warn('Supabase add student error', e);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    try {
      await supabase.from('students').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete student error', e);
    }
  };

  const handleImportBulkStudents = async (bulk: Student[]) => {
    setStudents((prev) => [...bulk, ...prev]);
    try {
      const studentRows = bulk.map((s) => ({
        id: s.id,
        name: s.name,
        class_grade: s.classGrade,
        parent_name: s.parentName,
        parent_phone: s.parentPhone,
      }));
      await supabase.from('students').insert(studentRows);

      const vehicleRows = bulk
        .filter((s) => s.licensePlate)
        .map((s) => ({
          student_id: s.id,
          plate_number: s.licensePlate,
        }));
      if (vehicleRows.length > 0) {
        await supabase.from('vehicles').insert(vehicleRows);
      }
    } catch (e) {
      console.warn('Supabase bulk insert error', e);
    }
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mereset kembali data demo awal?')) {
      localStorage.clear();
      setStudents(INITIAL_STUDENTS);
      setQueue(INITIAL_QUEUE);
      setLogs(INITIAL_LOGS);
    }
  };

  const sqlScript = `-- Buka Supabase Dashboard > SQL Editor > New Query > Paste & Run:
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  class_grade TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
  plate_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pickups (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  student_name TEXT NOT NULL,
  class_grade TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  called_at TIMESTAMPTZ DEFAULT NOW(),
  picked_up_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'WAITING',
  picked_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'pickups'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pickups;
  END IF;
END $$;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Pickups" ON public.pickups;
CREATE POLICY "Public Read Pickups" ON public.pickups FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Pickups" ON public.pickups;
CREATE POLICY "Public Insert Pickups" ON public.pickups FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Pickups" ON public.pickups;
CREATE POLICY "Public Update Pickups" ON public.pickups FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Read Students" ON public.students;
CREATE POLICY "Public Read Students" ON public.students FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Students" ON public.students;
CREATE POLICY "Public Insert Students" ON public.students FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Delete Students" ON public.students;
CREATE POLICY "Public Delete Students" ON public.students FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public Read Vehicles" ON public.vehicles;
CREATE POLICY "Public Read Vehicles" ON public.vehicles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Vehicles" ON public.vehicles;
CREATE POLICY "Public Insert Vehicles" ON public.vehicles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Delete Vehicles" ON public.vehicles;
CREATE POLICY "Public Delete Vehicles" ON public.vehicles FOR DELETE USING (true);

INSERT INTO public.students (id, name, class_grade, parent_name, parent_phone) VALUES
  ('std-1', 'Muhammad Farhan', '4B', 'Bpk. Hendra Gunawan', '0812-3456-7890'),
  ('std-2', 'Aisyah Zahira Gunawan', '1A', 'Bpk. Hendra Gunawan', '0812-3456-7890'),
  ('std-3', 'Kenzo Alvarendra', '3A', 'Ibu Ratna Sari', '0813-8899-1122'),
  ('std-4', 'Keisha Nayla', '5C', 'Ibu Ratna Sari', '0813-8899-1122'),
  ('std-5', 'Raditya Pratama', '2B', 'Bpk. Bambang Wijaya', '0857-1122-3344'),
  ('std-6', 'Nabila Syakirah', '1B', 'Ibu Diana Kusuma', '0819-0987-6543'),
  ('std-7', 'Aditya Putra Pratama', '6A', 'Bpk. Agus Santoso', '0821-4567-8910'),
  ('std-8', 'Siti Nurhaliza', '2A', 'Ibu Fatimah', '0878-5544-3322')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.vehicles (student_id, plate_number) VALUES
  ('std-1', 'B 1988 KLR'),
  ('std-2', 'B 1988 KLR'),
  ('std-3', 'D 4567 XYZ'),
  ('std-4', 'D 4567 XYZ'),
  ('std-5', 'B 2345 SIK'),
  ('std-6', 'B 8901 MNO'),
  ('std-7', 'B 7777 ROY'),
  ('std-8', 'B 3456 ABC')
ON CONFLICT DO NOTHING;`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      {/* Top Application Switcher Bar */}
      <nav className="bg-slate-900 text-white border-b border-slate-800 px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-sm">
              🏫
            </div>
            <div>
              <span className="font-extrabold text-sm md:text-base tracking-tight">Sistem Penjemputan Siswa</span>
              
              {/* Supabase Realtime Status Pill */}
              <button 
                onClick={() => setShowSqlModal(true)}
                className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 transition-all ${
                  isSupabaseOnline 
                    ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300 hover:bg-emerald-900/60' 
                    : 'bg-amber-950/60 border-amber-600 text-amber-300 hover:bg-amber-900/60'
                }`}
                title="Klik untuk melihat skrip SQL & status Supabase"
              >
                {isSupabaseOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
                <span>{isSupabaseOnline ? 'Supabase Realtime Online' : 'Koneksi Supabase (Setup SQL)'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('split')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'split'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5 text-amber-400" />
              <span>Mode Demo (Simulasi)</span>
            </button>

            <button
              onClick={() => setActiveTab('tv')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'tv'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Layar TV Lobi ({queue.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('gate')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'gate'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Pos Gerbang (Satpam)</span>
            </button>

            <button
              onClick={() => setActiveTab('teacher')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'teacher'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Portal Guru ({queue.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Riwayat & Log ({logs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'data'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Kelola Data Siswa</span>
            </button>
          </div>

          {/* Reset button */}
          <div>
            <button
              onClick={handleResetData}
              title="Reset ke data awal"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Reset Demo</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'split' && (
          <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
            {/* Simulation Header Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-800 rounded-3xl p-5 text-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                    Mode Simulasi Interaktif & Realtime
                  </span>
                </div>
                <h2 className="text-xl font-bold">Uji Coba Alur Penjemputan Langsung</h2>
                <p className="text-xs text-blue-200 max-w-2xl">
                  Ketik plat nomor di sisi kiri (Pos Satpam). Anda akan melihat nama anak, timer stopwatch, dan mendengar panggilan audio Text-to-Speech langsung terupdate pada Layar TV di sisi kanan!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => announcer.testVoice()}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>Uji Suara Bell & TTS</span>
                </button>
              </div>
            </div>

            {/* Split Screen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Security Gate + Teacher Portal */}
              <div className="lg:col-span-5 space-y-6">
                <div className="border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-sm">
                  <div className="bg-slate-900 px-5 py-3 text-white text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      1. Pos Satpam Gerbang (Input 3 Kotak)
                    </span>
                    <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded">Petugas Gerbang</span>
                  </div>
                  <SecurityGateView
                    students={students}
                    queue={queue}
                    onCallStudents={handleCallStudents}
                  />
                </div>

                <div className="border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-sm">
                  <div className="bg-slate-900 px-5 py-3 text-white text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      2. Portal Guru Kelas (Pelepasan Siswa)
                    </span>
                    <span className="text-[10px] bg-emerald-600 px-2 py-0.5 rounded">Wali Kelas</span>
                  </div>
                  <TeacherPortalView
                    queue={queue}
                    logs={logs}
                    onDismissStudent={handleDismissStudent}
                  />
                </div>
              </div>

              {/* Right Column: TV Display Screen */}
              <div className="lg:col-span-7 sticky top-20">
                <div className="border-4 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="bg-slate-900 px-5 py-3 text-white text-xs font-bold flex items-center justify-between border-b border-slate-800">
                    <span className="flex items-center gap-2">
                      <Tv className="w-4 h-4 text-emerald-400" />
                      Layar Monitor TV Lobi (Tampilan Siswa & Stopwatch Realtime)
                    </span>
                    <button
                      onClick={() => setActiveTab('tv')}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-bold hover:underline"
                    >
                      Buka Layar Penuh TV ↗
                    </button>
                  </div>
                  <div className="max-h-[calc(100vh-140px)] overflow-y-auto">
                    <TvDisplayView queue={queue} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tv' && <TvDisplayView queue={queue} />}

        {activeTab === 'gate' && (
          <div className="py-6">
            <SecurityGateView
              students={students}
              queue={queue}
              onCallStudents={handleCallStudents}
            />
          </div>
        )}

        {activeTab === 'teacher' && (
          <div className="py-6">
            <TeacherPortalView
              queue={queue}
              logs={logs}
              onDismissStudent={handleDismissStudent}
            />
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="py-6">
            <DailyLogsView logs={logs} />
          </div>
        )}

        {activeTab === 'data' && (
          <div className="py-6">
            <DataManagementView
              students={students}
              onAddStudent={handleAddStudent}
              onDeleteStudent={handleDeleteStudent}
              onImportBulkStudents={handleImportBulkStudents}
            />
          </div>
        )}
      </main>

      {/* SQL Setup Modal for Supabase */}
      {showSqlModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Setup Database Supabase</h3>
              </div>
              <button 
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Tutup ✕
              </button>
            </div>

            <div className="py-4 space-y-3 flex-1 overflow-y-auto text-xs text-slate-600">
              <p>
                Agar fitur <strong>Realtime Multi-Perangkat (HP Satpam $\leftrightarrow$ TV Lobi $\leftrightarrow$ HP Guru)</strong> aktif secara online di database Supabase Anda, jalankan skrip SQL di bawah ini:
              </p>

              <ol className="list-decimal pl-5 space-y-1 text-slate-700 font-medium">
                <li>Buka dashboard project Anda di <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold">Supabase Dashboard</a></li>
                <li>Klik menu <strong>SQL Editor</strong> di bilah kiri, lalu klik <strong>New query</strong></li>
                <li>Salin (*copy*) seluruh skrip SQL di bawah ini, lalu tempel (*paste*) dan klik tombol <strong>Run</strong></li>
              </ol>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
                  {sqlScript}
                </pre>
                <button
                  onClick={copySql}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  {copiedSql ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
