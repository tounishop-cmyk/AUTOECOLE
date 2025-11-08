export type StudentStatus = 'ملف مفتوح' | 'في التكوين' | 'اجتاز الامتحان' | 'ناجح' | 'راسب';
export type LicenseType = 'A' | 'B' | 'C' | 'D' | 'E';
export type VehicleStatus = 'متوفرة' | 'صيانة' | 'خارج الخدمة';
export type LessonType = 'نظري' | 'تطبيقي';
export type LessonStatus = 'مجدولة' | 'مكتملة' | 'ملغاة';

export interface Document {
  id: number;
  name: string;
  fileName: string;
  uploadDate: string;
}

export interface Student {
  id: number;
  name: string;
  address: string;
  phone: string;
  nationalId: string;
  licenseType: LicenseType;
  status: StudentStatus;
  registrationDate: string;
  totalTrainingCost: number;
  documents?: Document[];
}

export interface Instructor {
  id: number;
  name: string;
  phone: string;
  hireDate: string;
  assignedVehicleId: number | null;
}

export interface Vehicle {
  id: number;
  type: string;
  brand: string;
  registration: string;
  purchaseYear: number;
  status: VehicleStatus;
  lastMaintenance: string;
}

export interface Lesson {
  id: number;
  type: LessonType;
  date: string;
  time: string;
  status: LessonStatus;
  // Practical lesson fields
  studentId?: number | null;
  instructorId?: number | null;
  vehicleId?: number | null;
  // Theoretical lesson fields
  topic?: string;
  location?: string;
}

export interface Payment {
  id: number;
  studentId: number;
  amount: number;
  date: string;
  description: string;
}

export interface Expense {
  id: number;
  category: 'صيانة' | 'رواتب' | 'كراء' | 'فواتير' | 'أخرى';
  amount: number;
  date: string;
  description: string;
}