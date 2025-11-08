import React, { useState } from 'react';
import type { Instructor } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface InstructorsProps {
  instructors: Instructor[];
  setInstructors: React.Dispatch<React.SetStateAction<Instructor[]>>;
}

const Instructors: React.FC<InstructorsProps> = ({ instructors, setInstructors }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const { t, language } = useLanguage();

  const handleAddInstructor = () => {
    setEditingInstructor(null);
    setIsModalOpen(true);
  };

  const handleEditInstructor = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setIsModalOpen(true);
  };

  const handleDeleteInstructor = (id: number) => {
    if (window.confirm(t('confirm_delete_instructor'))) {
      setInstructors(instructors.filter(instructor => instructor.id !== id));
    }
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInstructor(null);
  };

  const handleSaveInstructor = (instructorData: Omit<Instructor, 'id'>) => {
    if (editingInstructor) {
      setInstructors(instructors.map(i => i.id === editingInstructor.id ? { ...editingInstructor, ...instructorData } : i));
    } else {
      const newInstructor: Instructor = {
        id: Math.max(0, ...instructors.map(i => i.id)) + 1,
        ...instructorData
      };
      setInstructors([...instructors, newInstructor]);
    }
    handleCloseModal();
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t('instructors_list')}</h2>
        <button 
          onClick={handleAddInstructor}
          className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          {t('add_new_instructor')}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'} text-gray-500 dark:text-gray-400`}>
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">{t('full_name')}</th>
              <th scope="col" className="px-6 py-3">{t('phone_number')}</th>
              <th scope="col" className="px-6 py-3">{t('hire_date')}</th>
              <th scope="col" className="px-6 py-3">{t('assigned_vehicle')}</th>
              <th scope="col" className="px-6 py-3">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {instructors.map((instructor) => (
              <tr key={instructor.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{instructor.name}</td>
                <td className="px-6 py-4">{instructor.phone}</td>
                <td className="px-6 py-4">{instructor.hireDate}</td>
                <td className="px-6 py-4">{instructor.assignedVehicleId ? `${t('vehicle_no')} ${instructor.assignedVehicleId}` : t('unassigned')}</td>
                <td className="px-6 py-4 flex items-center space-x-2 space-x-reverse">
                  <button onClick={() => handleEditInstructor(instructor)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-500 dark:hover:text-indigo-300">{t('edit')}</button>
                  <button onClick={() => handleDeleteInstructor(instructor.id)} className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-300">{t('delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <InstructorModal 
          instructor={editingInstructor} 
          onClose={handleCloseModal} 
          onSave={handleSaveInstructor} 
        />
      )}
    </div>
  );
};

interface InstructorModalProps {
  instructor: Instructor | null;
  onClose: () => void;
  onSave: (instructorData: Omit<Instructor, 'id'>) => void;
}

const InstructorModal: React.FC<InstructorModalProps> = ({ instructor, onClose, onSave }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: instructor?.name || '',
        phone: instructor?.phone || '',
        hireDate: instructor?.hireDate || new Date().toISOString().split('T')[0],
        assignedVehicleId: instructor?.assignedVehicleId || null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'assignedVehicleId' ? (value ? parseInt(value) : null) : value 
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg transform transition-all">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                            {instructor ? t('edit_instructor_title') : t('add_instructor_title')}
                        </h3>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('full_name')}</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('phone_number')}</label>
                                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                            </div>
                            <div>
                                <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('hire_date')}</label>
                                <input type="date" name="hireDate" id="hireDate" value={formData.hireDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                            </div>
                            <div>
                                <label htmlFor="assignedVehicleId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('assigned_vehicle_id')}</label>
                                <input type="number" name="assignedVehicleId" id="assignedVehicleId" value={formData.assignedVehicleId || ''} onChange={handleChange} placeholder={t('vehicle_id_placeholder')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm">
                            {t('save')}
                        </button>
                        <button type="button" onClick={onClose} className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">
                            {t('cancel')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default Instructors;