import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Settings: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save the settings here.
    alert(t('settings_saved'));
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-3 dark:border-gray-700">{t('school_data')}</h2>
        <form className="space-y-4" onSubmit={handleSaveSettings}>
          <div>
            <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('school_name')}</label>
            <input type="text" id="schoolName" defaultValue={t('school_name_value')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label htmlFor="schoolAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('school_address')}</label>
            <input type="text" id="schoolAddress" defaultValue={t('school_address_value')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label htmlFor="schoolLogo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('school_logo')}</label>
            <input type="file" id="schoolLogo" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600"/>
          </div>
          <div className="pt-4">
            <button type="submit" className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition duration-300">
              {t('save_changes')}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-3 dark:border-gray-700">{t('interface_customization')}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('language')}</label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'ar' | 'fr')}
              className="mt-1 block w-full md:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="ar">العربية</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-3 dark:border-gray-700">{t('backup_and_restore')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('backup_description')}
        </p>
        <button className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition duration-300">
          {t('create_backup_now')}
        </button>
      </div>
    </div>
  );
};

export default Settings;