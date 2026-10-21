'use client';

import React, { useState } from 'react';
import { Student } from '@/types';
import { 
  Users, 
  Upload, 
  Download, 
  Plus, 
  Search, 
  Trash2, 
  Car, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';

interface DataManagementViewProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onImportBulkStudents: (imported: Student[]) => void;
}

export default function DataManagementView({
  students,
  onAddStudent,
  onDeleteStudent,
  onImportBulkStudents,
}: DataManagementViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Student Form State
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState('1A');
  const [newPlate, setNewPlate] = useState('');
  const [newParent, setNewParent] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // CSV Import State
  const [importText, setImportText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  // Filter students
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.classGrade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.parentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count plates that belong to siblings (> 1 student)
  const plateCountMap: { [plate: string]: number } = {};
  students.forEach(s => {
    const p = s.licensePlate.trim().toUpperCase();
    plateCountMap[p] = (plateCountMap[p] || 0) + 1;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPlate) return;

    const student: Student = {
      id: 'std-' + Date.now(),
      name: newName.trim(),
      classGrade: newClass.trim(),
      licensePlate: newPlate.trim().toUpperCase(),
      parentName: newParent.trim() || 'Orang Tua Siswa',
      parentPhone: newPhone.trim() || '-',
    };

    onAddStudent(student);
    setShowAddModal(false);
    setNewName('');
    setNewPlate('');
    setNewParent('');
    setNewPhone('');

    setNotification(`Berhasil menambahkan data siswa: ${student.name}`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDownloadTemplate = () => {
    const csvContent = 
`Nama Siswa,Kelas,Nomor Plat,Nama Orang Tua,Nomor HP
Muhammad Farhan,4B,B 1988 KLR,Bpk. Hendra Gunawan,081234567890
Aisyah Zahira Gunawan,1A,B 1988 KLR,Bpk. Hendra Gunawan,081234567890
Kenzo Alvarendra,3A,D 4567 XYZ,Ibu Ratna Sari,081388991122
Raditya Pratama,2B,B 2345 SIK,Bpk. Bambang Wijaya,085711223344`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template-data-siswa-penjemputan.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcessImportCSV = () => {
    if (!importText.trim()) return;

    try {
      const lines = importText.trim().split('\n');
      const parsed: Student[] = [];

      // Check if line 0 is header
      const startIndex = lines[0].toLowerCase().includes('nama') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Support both comma and tab separated values (direct copy from Google Sheets!)
        const parts = line.includes('\t') ? line.split('\t') : line.split(',');

        if (parts.length >= 3) {
          parsed.push({
            id: 'import-' + Date.now() + '-' + i,
            name: parts[0].replace(/^["']|["']$/g, '').trim(),
            classGrade: parts[1].replace(/^["']|["']$/g, '').trim(),
            licensePlate: parts[2].replace(/^["']|["']$/g, '').trim().toUpperCase(),
            parentName: parts[3] ? parts[3].replace(/^["']|["']$/g, '').trim() : 'Orang Tua',
            parentPhone: parts[4] ? parts[4].replace(/^["']|["']$/g, '').trim() : '-',
          });
        }
      }

      if (parsed.length > 0) {
        onImportBulkStudents(parsed);
        setShowImportModal(false);
        setImportText('');
        setNotification(`Berhasil mengimpor ${parsed.length} siswa baru!`);
        setTimeout(() => setNotification(null), 3500);
      } else {
        alert('Format teks CSV/Google Sheet tidak valid atau baris kosong.');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat membaca data CSV.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Database Siswa & Plat Kendaraan
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola data murid, kelas, serta plat nomor penjemput. Mendukung 1 plat untuk beberapa anak (kakak-beradik).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload dari Excel / Google Sheet</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Search and stats bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama siswa, plat nomor, kelas, atau orang tua..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Terdaftar: <strong className="text-slate-800">{students.length} Siswa</strong>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">No</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4">Nomor Plat Polisi</th>
                <th className="py-3.5 px-4">Orang Tua / Wali</th>
                <th className="py-3.5 px-4">Kontak HP</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Tidak ada data siswa yang cocok.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const plateUpper = student.licensePlate.trim().toUpperCase();
                  const isSiblingGroup = (plateCountMap[plateUpper] || 0) > 1;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{student.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-bold">
                          Kelas {student.classGrade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-800">
                            {student.licensePlate}
                          </span>
                          {isSiblingGroup && (
                            <span 
                              className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full flex items-center gap-1"
                              title="Plat ini terhubung ke lebih dari 1 siswa (Kakak-Adik)"
                            >
                              <LinkIcon className="w-2.5 h-2.5" />
                              Kakak-Adik
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{student.parentName}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{student.parentPhone}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onDeleteStudent(student.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Siswa Baru */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Tambah Data Siswa Baru</h2>
            <p className="text-xs text-slate-500 mb-6">
              Masukkan informasi murid dan nomor plat yang akan digunakan untuk menjemput.
            </p>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Raden Mas Danang"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-600 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value.toUpperCase())}
                    placeholder="Contoh: 3A"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-600 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Nomor Polisi (Plat) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                    placeholder="Contoh: B 1234 ABC"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:border-blue-600 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Nama Orang Tua / Penjemput
                </label>
                <input
                  type="text"
                  value={newParent}
                  onChange={(e) => setNewParent(e.target.value)}
                  placeholder="Contoh: Bpk. Gunawan"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-600 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  No HP / WhatsApp Ortu
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-600 focus:bg-white outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Import Excel / Google Sheets */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-slate-900">Import Data dari Google Sheet / Excel</h2>
              <button
                onClick={handleDownloadTemplate}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Format Contoh CSV
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Salin (*copy*) baris data langsung dari Google Sheets / Excel dan tempelkan (*paste*) pada kotak di bawah ini, atau gunakan format CSV.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Format Kolom: [Nama Siswa], [Kelas], [Nomor Plat], [Nama Orang Tua], [No HP]
              </label>
              <textarea
                rows={7}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Muhammad Farhan	4B	B 1988 KLR	Bpk. Hendra	08123456789
Aisyah Zahira	1A	B 1988 KLR	Bpk. Hendra	08123456789
Danang S	2A	B 9999 XYZ	Ibu Siti	08198765432"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:border-blue-600 focus:bg-white outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-400">
                Mendukung separator koma (CSV) maupun tab (Google Sheets copy-paste).
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleProcessImportCSV}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Proses & Impor Siswa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
