import { Student, PickupQueueItem, PickupLogItem } from '@/types';

export const INITIAL_STUDENTS: Student[] = [
  // Kakak Beradik 1 (Plat: B 1988 KLR)
  {
    id: 'std-1',
    name: 'Muhammad Farhan',
    classGrade: '4B',
    parentName: 'Bpk. Hendra Gunawan',
    parentPhone: '0812-3456-7890',
    licensePlate: 'B 1988 KLR',
  },
  {
    id: 'std-2',
    name: 'Aisyah Zahira Gunawan',
    classGrade: '1A',
    parentName: 'Bpk. Hendra Gunawan',
    parentPhone: '0812-3456-7890',
    licensePlate: 'B 1988 KLR',
  },
  // Kakak Beradik 2 (Plat: D 4567 XYZ)
  {
    id: 'std-3',
    name: 'Kenzo Alvarendra',
    classGrade: '3A',
    parentName: 'Ibu Ratna Sari',
    parentPhone: '0813-8899-1122',
    licensePlate: 'D 4567 XYZ',
  },
  {
    id: 'std-4',
    name: 'Keisha Nayla',
    classGrade: '5C',
    parentName: 'Ibu Ratna Sari',
    parentPhone: '0813-8899-1122',
    licensePlate: 'D 4567 XYZ',
  },
  // Siswa Tunggal
  {
    id: 'std-5',
    name: 'Raditya Pratama',
    classGrade: '2B',
    parentName: 'Bpk. Bambang Wijaya',
    parentPhone: '0857-1122-3344',
    licensePlate: 'B 2345 SIK',
  },
  {
    id: 'std-6',
    name: 'Nabila Syakirah',
    classGrade: '1B',
    parentName: 'Ibu Diana Kusuma',
    parentPhone: '0819-0987-6543',
    licensePlate: 'B 8901 MNO',
  },
  {
    id: 'std-7',
    name: 'Aditya Putra Pratama',
    classGrade: '6A',
    parentName: 'Bpk. Agus Santoso',
    parentPhone: '0821-4567-8910',
    licensePlate: 'B 7777 ROY',
  },
  {
    id: 'std-8',
    name: 'Siti Nurhaliza',
    classGrade: '2A',
    parentName: 'Ibu Fatimah',
    parentPhone: '0878-5544-3322',
    licensePlate: 'B 3456 ABC',
  },
  {
    id: 'std-9',
    name: 'Alvaro Rizky Ramadhan',
    classGrade: '3B',
    parentName: 'Bpk. Dedy Prasetyo',
    parentPhone: '0811-2233-4455',
    licensePlate: 'B 1122 VIP',
  },
  {
    id: 'std-10',
    name: 'Zahra Cantika',
    classGrade: '4A',
    parentName: 'Ibu Rina Mariana',
    parentPhone: '0813-9988-7766',
    licensePlate: 'B 4433 DEF',
  }
];

// Helper to create timestamps relative to now
const now = new Date();
const minutesAgo = (min: number) => new Date(now.getTime() - min * 60 * 1000).toISOString();

export const INITIAL_QUEUE: PickupQueueItem[] = [
  {
    id: 'q-1',
    studentId: 'std-5',
    studentName: 'Raditya Pratama',
    classGrade: '2B',
    licensePlate: 'B 2345 SIK',
    parentName: 'Bpk. Bambang Wijaya',
    calledAt: minutesAgo(11), // 11 menit (status over limit / merah)
    status: 'WAITING',
  },
  {
    id: 'q-2',
    studentId: 'std-1',
    studentName: 'Muhammad Farhan',
    classGrade: '4B',
    licensePlate: 'B 1988 KLR',
    parentName: 'Bpk. Hendra Gunawan',
    calledAt: minutesAgo(6), // 6 menit (status sedang / kuning)
    status: 'WAITING',
  },
  {
    id: 'q-3',
    studentId: 'std-2',
    studentName: 'Aisyah Zahira Gunawan',
    classGrade: '1A',
    licensePlate: 'B 1988 KLR',
    parentName: 'Bpk. Hendra Gunawan',
    calledAt: minutesAgo(6), // 6 menit (adiknya Farhan)
    status: 'WAITING',
  },
  {
    id: 'q-4',
    studentId: 'std-8',
    studentName: 'Siti Nurhaliza',
    classGrade: '2A',
    licensePlate: 'B 3456 ABC',
    parentName: 'Ibu Fatimah',
    calledAt: minutesAgo(2), // 2 menit (baru tiba / hijau)
    status: 'WAITING',
  }
];

export const INITIAL_LOGS: PickupLogItem[] = [
  {
    id: 'log-1',
    studentId: 'std-7',
    studentName: 'Aditya Putra Pratama',
    classGrade: '6A',
    licensePlate: 'B 7777 ROY',
    parentName: 'Bpk. Agus Santoso',
    calledAt: minutesAgo(35),
    pickedUpAt: minutesAgo(31),
    durationMinutes: 4,
    status: 'PICKED_UP',
    pickedUpBy: 'Ibu Ratna (Wali Kelas 6A)'
  },
  {
    id: 'log-2',
    studentId: 'std-6',
    studentName: 'Nabila Syakirah',
    classGrade: '1B',
    licensePlate: 'B 8901 MNO',
    parentName: 'Ibu Diana Kusuma',
    calledAt: minutesAgo(42),
    pickedUpAt: minutesAgo(35),
    durationMinutes: 7,
    status: 'PICKED_UP',
    pickedUpBy: 'Bpk. Doni (Wali Kelas 1B)'
  },
  {
    id: 'log-3',
    studentId: 'std-9',
    studentName: 'Alvaro Rizky Ramadhan',
    classGrade: '3B',
    licensePlate: 'B 1122 VIP',
    parentName: 'Bpk. Dedy Prasetyo',
    calledAt: minutesAgo(50),
    pickedUpAt: minutesAgo(47),
    durationMinutes: 3,
    status: 'PICKED_UP',
    pickedUpBy: 'Ibu Maya (Wali Kelas 3B)'
  }
];
