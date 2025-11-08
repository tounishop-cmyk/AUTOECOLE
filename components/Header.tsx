import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { t, language } = useLanguage();
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm p-4 sm:px-6 lg:px-8 flex justify-between items-center sticky top-0 z-10">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button className="flex items-center space-x-2">
            <img 
              className="h-10 w-10 rounded-full object-cover" 
              src="https://picsum.photos/100" 
              alt="User"
            />
            <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                <span className="text-gray-800 dark:text-white font-medium hidden sm:block">{t('general_manager')}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{t('admin')}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;