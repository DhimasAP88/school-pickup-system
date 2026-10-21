export interface Student {
  id: string;
  name: string;
  classGrade: string; // e.g. "1A", "2B", "3C"
  parentName: string;
  parentPhone: string;
  licensePlate: string; // e.g. "B 1234 ABC"
  avatarUrl?: string;
}

export type PickupStatus = 'WAITING' | 'PICKED_UP' | 'CANCELLED';

export interface PickupQueueItem {
  id: string;
  studentId: string;
  studentName: string;
  classGrade: string;
  licensePlate: string;
  parentName: string;
  calledAt: string; // ISO string
  pickedUpAt?: string; // ISO string
  status: PickupStatus;
  notes?: string;
}

export interface PickupLogItem extends PickupQueueItem {
  durationMinutes: number; // calculated wait duration
  pickedUpAt: string;
  pickedUpBy?: string; // name of teacher or gate staff
}
