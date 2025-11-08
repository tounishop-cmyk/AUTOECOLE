import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Instructors from './components/Instructors';
import Vehicles from './components/Vehicles';
import Schedule from './components/Schedule';
import Finance from './components/Finance';
import Settings from './components/Settings';
import type { Student, Payment, Expense, Instructor, Vehicle, Lesson } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

type Page = 'dashboard' | 'students' | 'instructors' | 'vehicles' | 'schedule' | 'finance' | 'settings';

const initialStudents: Student[] = [
  { id: 1, name: 'أحمد العلوي', address: 'شارع الحرية، الرباط', phone: '0612345678', nationalId: 'AB12345', licenseType: 'B', status: 'ناجح', registrationDate: '2023-01-15', totalTrainingCost: 3500, documents: [
      { id: 1, name: 'البطاقة الوطنية', fileName: 'cin_ahmed.pdf', uploadDate: '2023-01-15' },
      { id: 2, name: 'الشهادة الطبية', fileName: 'certif_medical.pdf', uploadDate: '2023-01-16' },
  ]},
  { id: 2, name: 'فاطمة الزهراء', address: 'زنقة النصر، الدار البيضاء', phone: '0698765432', nationalId: 'CD67890', licenseType: 'B', status: 'في التكوين', registrationDate: '2023-03-20', totalTrainingCost: 3500, documents: [] },
  { id: 3, name: 'يوسف بناني', address: 'حي الأمل، مراكش', phone: '0655443322', nationalId: 'EF11223', licenseType: 'A', status: 'اجتاز الامتحان', registrationDate: '2023-02-10', totalTrainingCost: 4000 },
  { id: 4, name: 'خديجة حمدي', address: 'شارع المسيرة، أكادير', phone: '0611223344', nationalId: 'GH44556', licenseType: 'C', status: 'ملف مفتوح', registrationDate: '2023-04-05', totalTrainingCost: 8000 },
  { id: 5, name: 'محمد أمين', address: 'حي الرياض، طنجة', phone: '0677889900', nationalId: 'IJ77889', licenseType: 'B', status: 'راسب', registrationDate: '2022-12-01', totalTrainingCost: 3500 },
];

const initialInstructors: Instructor[] = [
  { id: 1, name: 'كريم العلمي', phone: '0611223344', hireDate: '2020-05-10', assignedVehicleId: 1 },
  { id: 2, name: 'نادية بوعزة', phone: '0622334455', hireDate: '2021-02-15', assignedVehicleId: 3 },
  { id: 3, name: 'سعيد رضوان', phone: '0633445566', hireDate: '2019-11-20', assignedVehicleId: 2 },
  { id: 4, name: 'لبنى فهيم', phone: '0644556677', hireDate: '2022-08-01', assignedVehicleId: 4 },
];

const initialVehicles: Vehicle[] = [
  { id: 1, type: 'سيارة', brand: 'Renault Clio', registration: '123-A-45', purchaseYear: 2021, status: 'متوفرة', lastMaintenance: '2023-05-15' },
  { id: 2, type: 'سيارة', brand: 'Dacia Logan', registration: '678-B-90', purchaseYear: 2020, status: 'متوفرة', lastMaintenance: '2023-04-20' },
  { id: 3, type: 'سيارة', brand: 'Peugeot 208', registration: '111-C-22', purchaseYear: 2022, status: 'صيانة', lastMaintenance: '2023-06-01' },
  { id: 4, type: 'شاحنة', brand: 'Volvo FH', registration: '333-D-44', purchaseYear: 2019, status: 'متوفرة', lastMaintenance: '2023-03-10' },
  { id: 5, type: 'حافلة', brand: 'Mercedes-Benz Tourismo', registration: '555-E-66', purchaseYear: 2018, status: 'خارج الخدمة', lastMaintenance: '2023-01-05' },
];

const initialLessons: Lesson[] = [
    { id: 1, studentId: 2, instructorId: 1, vehicleId: 1, date: '2024-07-22', time: '09:00', type: 'تطبيقي', status: 'مجدولة' },
    { id: 2, studentId: 3, instructorId: 2, vehicleId: 3, date: '2024-07-22', time: '10:00', type: 'تطبيقي', status: 'مجدولة' },
    { id: 3, date: '2024-07-23', time: '18:00', type: 'نظري', topic: 'قانون السير', location: 'القاعة 1', status: 'مكتملة' },
];

const initialPayments: Payment[] = [
  { id: 1, studentId: 1, amount: 1500, date: '2023-01-15', description: 'دفعة التسجيل' },
  { id: 2, studentId: 2, amount: 1500, date: '2023-03-20', description: 'دفعة التسجيل' },
  { id: 3, studentId: 1, amount: 2000, date: '2023-02-10', description: 'دفعة حصص السياقة' },
  { id: 4, studentId: 3, amount: 2000, date: '2023-02-11', description: 'رخصة دراجة نارية' },
];

const initialExpenses: Expense[] = [
  { id: 1, category: 'صيانة', amount: 800, date: '2023-06-01', description: 'إصلاح Peugeot 208' },
  { id: 2, category: 'رواتب', amount: 25000, date: '2023-05-30', description: 'رواتب شهر مايو' },
  { id: 3, category: 'كراء', amount: 10000, date: '2023-06-05', description: 'إيجار مقر المدرسة' },
  { id: 4, category: 'فواتير', amount: 1200, date: '2023-06-03', description: 'فاتورة الكهرباء والماء' },
];

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [instructors, setInstructors] = useState<Instructor[]>(initialInstructors);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const { t } = useLanguage();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <Students students={students} setStudents={setStudents} payments={payments} />;
      case 'instructors':
        return <Instructors instructors={instructors} setInstructors={setInstructors} />;
      case 'vehicles':
        return <Vehicles vehicles={vehicles} setVehicles={setVehicles} />;
      case 'schedule':
        return <Schedule lessons={lessons} setLessons={setLessons} students={students} instructors={instructors} vehicles={vehicles} />;
      case 'finance':
        return <Finance payments={payments} setPayments={setPayments} expenses={expenses} setExpenses={setExpenses} students={students} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const pageTitles: { [key in Page]: string } = {
    dashboard: t('dashboard'),
    students: t('manage_students'),
    instructors: t('manage_instructors'),
    vehicles: t('manage_vehicles'),
    schedule: t('schedule'),
    finance: t('finance_management'),
    settings: t('settings'),
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex text-gray-800 dark:text-gray-200">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 flex flex-col">
        <Header title={pageTitles[currentPage]} />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;