import React from 'react';
import { DashboardIcon, StudentIcon, InstructorIcon, VehicleIcon, ScheduleIcon, FinanceIcon, SettingsIcon, LogoutIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

type Page = 'dashboard' | 'students' | 'instructors' | 'vehicles' | 'schedule' | 'finance' | 'settings';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const { t, language } = useLanguage();
  
  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: DashboardIcon },
    { id: 'students', label: t('students'), icon: StudentIcon },
    { id: 'instructors', label: t('instructors'), icon: InstructorIcon },
    { id: 'vehicles', label: t('vehicles'), icon: VehicleIcon },
    { id: 'schedule', label: t('schedule'), icon: ScheduleIcon },
    { id: 'finance', label: t('finance'), icon: FinanceIcon },
    { id: 'settings', label: t('settings'), icon: SettingsIcon },
  ];

  const iconMargin = language === 'ar' ? 'ml-3' : 'mr-3';
  const textAlignment = language === 'ar' ? 'text-right' : 'text-left';

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <VehicleIcon className="w-8 h-8 text-indigo-500" />
        <h1 className={`text-xl font-bold text-gray-800 dark:text-white ${language === 'ar' ? 'mr-2' : 'ml-2'}`}>
          {t('app_title')}
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id as Page)}
            className={`w-full flex items-center py-2.5 px-4 rounded-lg transition-colors duration-200 ${textAlignment} ${
              currentPage === item.id
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700'
            }`}
          >
            <item.icon className={`w-5 h-5 ${iconMargin}`} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className={`w-full flex items-center py-2.5 px-4 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-500 transition-colors duration-200 ${textAlignment}`}>
          <LogoutIcon className={`w-5 h-5 ${iconMargin}`} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;