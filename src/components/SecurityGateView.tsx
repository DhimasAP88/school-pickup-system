'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Student, PickupQueueItem } from '@/types';
import { 
  Car, 
  Send, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  RotateCcw,
  CheckSquare,
  Square,
  UserCheck
} from 'lucide-react';

interface SecurityGateViewProps {
  students: Student[];
  queue: PickupQueueItem[];
  onCallStudents: (selectedStudents: Student[], plateNumber: string) => void;
}

export default function SecurityGateView({ students, queue, onCallStudents }: SecurityGateViewProps) {
  // 3-Segment License Plate Input
  const [platePrefix, setPlatePrefix] = useState<string>(''); // Segment 1: Letters (e.g. "B")
  const [plateNumber, setPlateNumber] = useState<string>(''); // Segment 2: Numbers (e.g. "1988")
  const [plateSuffix, setPlateSuffix] = useState<string>(''); // Segment 3: Letters (e.g. "KLR")

  // Selected students for pickup (supports picking only 1 child if multiple siblings)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const prefixRef = useRef<HTMLInputElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);
  const suffixRef = useRef<HTMLInputElement>(null);

  // Normalize plate string (remove extra spaces, uppercase)
  const cleanPlate = (str: string) => str.replace(/\s+/g, ' ').trim().toUpperCase();

  // Combine segments into full plate string
  const combinedPlate = [platePrefix.trim(), plateNumber.trim(), plateSuffix.trim()]
    .filter(Boolean)
    .join(' ')
    .toUpperCase();

  const formattedSearch = cleanPlate(combinedPlate);

  // Exact matching students for current combined plate
  const currentTargetStudents = formattedSearch.length >= 2
    ? students.filter(s => cleanPlate(s.licensePlate) === formattedSearch)
    : [];

  // When matched students change, update selected students
  useEffect(() => {
    if (currentTargetStudents.length > 0) {
      // Default: select all students under this plate
      setSelectedStudentIds(currentTargetStudents.map(s => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  }, [formattedSearch]);

  // Find matching students for suggestions if partial
  const matchedStudents = formattedSearch.length >= 2
    ? students.filter(s => {
        const studentPlate = cleanPlate(s.licensePlate);
        return studentPlate.includes(formattedSearch) || 
               (platePrefix && studentPlate.startsWith(platePrefix) && plateNumber && studentPlate.includes(plateNumber));
      })
    : [];

  // Check if any of them are already waiting in queue
  const alreadyWaitingIds = queue.map(q => q.studentId);

  // Auto-focus transitions
  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2);
    setPlatePrefix(val);
    if (val.length >= 2) {
      numberRef.current?.focus();
    }
  };

  const handlePrefixKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === ' ' || e.key === 'Enter') && platePrefix) {
      e.preventDefault();
      numberRef.current?.focus();
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setPlateNumber(val);
    if (val.length >= 4) {
      suffixRef.current?.focus();
    }
  };

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !plateNumber) {
      prefixRef.current?.focus();
    } else if ((e.key === ' ' || e.key === 'Enter') && plateNumber) {
      e.preventDefault();
      suffixRef.current?.focus();
    }
  };

  const handleSuffixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3);
    setPlateSuffix(val);
  };

  const handleSuffixKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !plateSuffix) {
      numberRef.current?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleCallSelected();
    }
  };

  const handleSelectPreset = (plateStr: string) => {
    const parts = plateStr.split(' ');
    const p1 = parts[0] || '';
    const p2 = parts[1] || '';
    const p3 = parts[2] || '';

    setPlatePrefix(p1);
    setPlateNumber(p2);
    setPlateSuffix(p3);
    suffixRef.current?.focus();
  };

  const handleResetInputs = () => {
    setPlatePrefix('');
    setPlateNumber('');
    setPlateSuffix('');
    setSelectedStudentIds([]);
    prefixRef.current?.focus();
  };

  // Toggle selection for a specific sibling student
  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedStudentIds(currentTargetStudents.map(s => s.id));
  };

  const handleDeselectAll = () => {
    setSelectedStudentIds([]);
  };

  // Call only specific student directly
  const handleCallSingle = (student: Student) => {
    handleTriggerCall([student], formattedSearch);
  };

  // Call all currently selected students
  const handleCallSelected = () => {
    const chosen = currentTargetStudents.filter(s => selectedStudentIds.includes(s.id));
    if (chosen.length === 0) return;
    handleTriggerCall(chosen, formattedSearch);
  };

  const handleTriggerCall = (targetStudents: Student[], plate: string) => {
    if (targetStudents.length === 0) return;

    onCallStudents(targetStudents, plate);

    const names = targetStudents.map(s => s.name).join(' & ');
    setSuccessMessage(`Berhasil memanggil ${names} (${targetStudents.length} siswa) ke layar TV!`);
    
    handleResetInputs();

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4500);
  };

  // Sample plates for testing
  const samplePlates = ['B 1988 KLR', 'D 4567 XYZ', 'B 8901 MNO', 'B 7777 ROY', 'B 1122 VIP'];

  const selectedStudents = currentTargetStudents.filter(s => selectedStudentIds.includes(s.id));

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Pos Keamanan Gerbang Utama
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Input Kedatangan Penjemput
          </h1>
          <p className="text-blue-100/90 text-sm md:text-base mt-1 max-w-xl">
            Ketik nomor plat kendaraan. Jika 1 kendaraan terhubung ke lebih dari 1 siswa (kakak-adik), Anda dapat memilih siswa mana yang dijemput sekarang sesuai jam pulang masing-masing.
          </p>
        </div>
        <Car className="absolute -bottom-6 -right-6 w-44 h-44 text-white/10 pointer-events-none" />
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}

      {/* 3-SEGMENT PLATE INPUT SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nomor Polisi Kendaraan (3 Bagian)
            </label>
            {(platePrefix || plateNumber || plateSuffix) && (
              <button
                onClick={handleResetInputs}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Input</span>
              </button>
            )}
          </div>

          {/* Authentic Plate Display & 3-Input Segment Container */}
          <div className="bg-slate-900 p-4 md:p-6 rounded-3xl border-4 border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5 text-yellow-400">
                <Car className="w-4 h-4" />
                <span>Plat Nomor Indonesia</span>
              </span>
              <span className="font-mono text-slate-500">HURUF • ANGKA • HURUF</span>
            </div>

            <div className="grid grid-cols-12 gap-3 items-center">
              {/* INPUT 1: HURUF / KODE WILAYAH */}
              <div className="col-span-3 sm:col-span-3">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 text-center">
                  1. Wilayah
                </label>
                <input
                  ref={prefixRef}
                  type="text"
                  inputMode="text"
                  maxLength={2}
                  value={platePrefix}
                  onChange={handlePrefixChange}
                  onKeyDown={handlePrefixKeyDown}
                  placeholder="B"
                  autoFocus
                  className="w-full text-center py-4 bg-black border-2 border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 rounded-2xl text-2xl md:text-3xl font-mono font-black tracking-widest text-white placeholder:text-slate-600 outline-none transition-all uppercase shadow-inner"
                />
              </div>

              {/* INPUT 2: ANGKA / NOMOR POLISI */}
              <div className="col-span-5 sm:col-span-5">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 text-center">
                  2. Nomor (Angka)
                </label>
                <input
                  ref={numberRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={plateNumber}
                  onChange={handleNumberChange}
                  onKeyDown={handleNumberKeyDown}
                  placeholder="1988"
                  className="w-full text-center py-4 bg-black border-2 border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 rounded-2xl text-2xl md:text-3xl font-mono font-black tracking-widest text-yellow-400 placeholder:text-slate-600 outline-none transition-all shadow-inner"
                />
              </div>

              {/* INPUT 3: HURUF / SERI AKHIR */}
              <div className="col-span-4 sm:col-span-4">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 text-center">
                  3. Seri (Huruf)
                </label>
                <input
                  ref={suffixRef}
                  type="text"
                  inputMode="text"
                  maxLength={3}
                  value={plateSuffix}
                  onChange={handleSuffixChange}
                  onKeyDown={handleSuffixKeyDown}
                  placeholder="KLR"
                  className="w-full text-center py-4 bg-black border-2 border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 rounded-2xl text-2xl md:text-3xl font-mono font-black tracking-widest text-white placeholder:text-slate-600 outline-none transition-all uppercase shadow-inner"
                />
              </div>
            </div>

            {/* Live Combined Preview string */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Format Tergabung:</span>
              <span className="font-mono font-black text-sm tracking-widest px-3 py-1 bg-slate-800 text-yellow-300 rounded-lg">
                {combinedPlate || '— — —'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Plate Buttons */}
        <div>
          <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Pilihan Cepat Uji Coba:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {samplePlates.map((plate) => (
              <button
                key={plate}
                type="button"
                onClick={() => handleSelectPreset(plate)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                  cleanPlate(combinedPlate) === plate
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                {plate}
                {plate === 'B 1988 KLR' && ' (Kakak-Adik)'}
                {plate === 'D 4567 XYZ' && ' (Kakak-Adik)'}
              </button>
            ))}
          </div>
        </div>

        {/* MATCH DETECTION & SIBLING SELECTION SECTION */}
        {formattedSearch.length >= 2 && (
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Hasil Deteksi ({matchedStudents.length} siswa cocok)
              </span>
              {currentTargetStudents.length > 1 && (
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  1 Plat untuk {currentTargetStudents.length} Siswa (Kakak-Adik)
                </span>
              )}
            </div>

            {matchedStudents.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Plat Nomor Tidak Ditemukan</div>
                  <div className="text-xs text-amber-700 mt-0.5">
                    Plat <strong>{combinedPlate}</strong> belum terdaftar. Pastikan kode wilayah, nomor, dan seri akhir sudah sesuai.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {currentTargetStudents.length > 0 ? (
                  // Exact match with current plate input
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                    {/* Header info & Sibling Selection guide */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          Siswa Terdaftar pada Plat <span className="font-mono font-black text-blue-600">{formattedSearch}</span>
                        </div>
                        {currentTargetStudents.length > 1 ? (
                          <p className="text-xs text-amber-700 font-medium mt-0.5">
                            💡 Centang nama siswa yang ingin dijemput saat ini (bisa salah satu atau keduanya jika beda jam pulang).
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Orang tua: {currentTargetStudents[0].parentName}
                          </p>
                        )}
                      </div>

                      {/* Quick Select/Deselect buttons for multiple siblings */}
                      {currentTargetStudents.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSelectAll}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg"
                          >
                            Pilih Semua
                          </button>
                          <button
                            type="button"
                            onClick={handleDeselectAll}
                            className="text-xs font-bold text-slate-500 hover:text-slate-700 px-2.5 py-1 bg-slate-200/60 hover:bg-slate-200 rounded-lg"
                          >
                            Batal Pilih
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Sibling Student Cards with Selection Checkbox & Direct Call */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentTargetStudents.map((student) => {
                        const isSelected = selectedStudentIds.includes(student.id);
                        const isWaiting = alreadyWaitingIds.includes(student.id);

                        return (
                          <div
                            key={student.id}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 ${
                              isSelected
                                ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                                : 'bg-white border-slate-200 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                {/* Interactive Checkbox */}
                                <button
                                  type="button"
                                  onClick={() => toggleStudentSelection(student.id)}
                                  className="flex items-center gap-2 text-left group"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                  ) : (
                                    <Square className="w-5 h-5 text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
                                  )}
                                  <span className={`font-bold text-sm leading-snug ${isSelected ? 'text-blue-950 font-black' : 'text-slate-700'}`}>
                                    {student.name}
                                  </span>
                                </button>

                                {/* Grade badge */}
                                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-lg text-xs font-black flex-shrink-0">
                                  Kelas {student.classGrade}
                                </span>
                              </div>

                              <div className="mt-2 text-xs text-slate-500 pl-7">
                                <div>Wali: {student.parentName}</div>
                                {isWaiting && (
                                  <div className="text-[11px] font-bold text-amber-700 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>Sudah dalam antrean</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Option to call THIS student only in 1 click */}
                            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                              <span className="text-[11px] text-slate-500">
                                {isSelected ? '✓ Terpilih' : 'Tidak dipilih'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCallSingle(student)}
                                className="px-3 py-1.5 bg-white hover:bg-blue-600 hover:text-white border border-slate-300 hover:border-blue-600 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all flex items-center gap-1"
                                title="Panggil hanya anak ini saja ke layar TV"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Panggil Anak Ini Saja</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Main Action Button for Selected Students */}
                    <div className="pt-2">
                      <button
                        onClick={handleCallSelected}
                        disabled={selectedStudents.length === 0}
                        className={`w-full py-3.5 px-6 rounded-2xl font-bold text-base shadow-lg flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99] ${
                          selectedStudents.length > 0
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25 cursor-pointer'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                      >
                        <Send className="w-5 h-5" />
                        <span>
                          {selectedStudents.length === 0
                            ? 'Pilih minimal 1 siswa di atas untuk dipanggil'
                            : selectedStudents.length === 1
                            ? `Panggil Ananda ${selectedStudents[0].name} (Kelas ${selectedStudents[0].classGrade})`
                            : `Panggil ${selectedStudents.length} Siswa Terpilih Sekaligus`}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  // Suggestion cards if partial
                  <div className="space-y-2">
                    <div className="text-xs text-slate-500">Mungkin yang Anda maksud:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchedStudents.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSelectPreset(s.licensePlate)}
                          className="p-3 text-left bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl transition-all flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-slate-800 text-sm">{s.name}</div>
                            <div className="text-xs text-slate-500">Kelas {s.classGrade} • {s.parentName}</div>
                          </div>
                          <div className="font-mono text-xs font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-sm">
                            {s.licensePlate}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Currently Waiting Queue Overview for Gate Staff */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500" />
            <h3 className="font-bold text-slate-900 text-base">
              Antrean Menunggu Saat Ini ({queue.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Live Sinkronisasi</span>
        </div>

        {queue.length === 0 ? (
          <p className="text-sm text-slate-400 py-3 text-center">
            Semua siswa yang dipanggil telah dijemput orang tua.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.map((item, idx) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-400 w-5">#{idx + 1}</span>
                  <div>
                    <span className="font-bold text-slate-900">{item.studentName}</span>
                    <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                      Kelas {item.classGrade}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">
                    {item.licensePlate}
                  </span>
                  <span className="text-xs text-slate-500">
                    Tiba {new Date(item.calledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
