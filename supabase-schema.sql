-- ===============================================================
-- SKEMA DATABASE SUPABASE: SISTEM PENJEMPUTAN SISWA SEKOLAH (IDEMPOTENT)
-- ===============================================================

-- 1. Tabel Siswa
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  class_grade TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Plat Nomor (1 Plat bisa punya banyak siswa untuk kakak-beradik)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
  plate_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Antrean & Riwayat Penjemputan (Tabel Realtime)
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
  status TEXT DEFAULT 'WAITING', -- 'WAITING', 'PICKED_UP', 'CANCELLED'
  picked_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index Pencarian
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON public.vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_pickups_status ON public.pickups(status);
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class_grade);

-- Aktifkan Realtime dengan aman (hanya tambah jika belum terdaftar)
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

-- Atur Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickups ENABLE ROW LEVEL SECURITY;

-- Policy Siswa
DROP POLICY IF EXISTS "Public Read Students" ON public.students;
CREATE POLICY "Public Read Students" ON public.students FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Students" ON public.students;
CREATE POLICY "Public Insert Students" ON public.students FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Delete Students" ON public.students;
CREATE POLICY "Public Delete Students" ON public.students FOR DELETE USING (true);

-- Policy Kendaraan
DROP POLICY IF EXISTS "Public Read Vehicles" ON public.vehicles;
CREATE POLICY "Public Read Vehicles" ON public.vehicles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Vehicles" ON public.vehicles;
CREATE POLICY "Public Insert Vehicles" ON public.vehicles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Delete Vehicles" ON public.vehicles;
CREATE POLICY "Public Delete Vehicles" ON public.vehicles FOR DELETE USING (true);

-- Policy Pickups
DROP POLICY IF EXISTS "Public Read Pickups" ON public.pickups;
CREATE POLICY "Public Read Pickups" ON public.pickups FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Pickups" ON public.pickups;
CREATE POLICY "Public Insert Pickups" ON public.pickups FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Pickups" ON public.pickups;
CREATE POLICY "Public Update Pickups" ON public.pickups FOR UPDATE USING (true);

-- Seed Data Awal
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
ON CONFLICT DO NOTHING;
