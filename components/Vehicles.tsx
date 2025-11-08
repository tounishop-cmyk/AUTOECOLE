import React, { useState } from 'react';
import type { Vehicle, VehicleStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface VehiclesProps {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
}

const statusColors: Record<VehicleStatus, string> = {
  'متوفرة': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'صيانة': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'خارج الخدمة': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const vehicleStatusKeys: Record<VehicleStatus, string> = {
    'متوفرة': 'status_available',
    'صيانة': 'status_maintenance',
    'خارج الخدمة': 'status_out_of_service',
};

const Vehicles: React.FC<VehiclesProps> = ({ vehicles, setVehicles }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const { t, language } = useLanguage();

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDeleteVehicle = (id: number) => {
    if (window.confirm(t('confirm_delete_vehicle'))) {
      setVehicles(vehicles.filter(v => v.id !== id));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
  };

  const handleSaveVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    if (editingVehicle) {
      setVehicles(vehicles.map(v => v.id === editingVehicle.id ? { ...editingVehicle, ...vehicleData } : v));
    } else {
      const newVehicle: Vehicle = {
        id: Math.max(0, ...vehicles.map(v => v.id)) + 1,
        ...vehicleData,
      };
      setVehicles([...vehicles, newVehicle]);
    }
    handleCloseModal();
  };


  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t('vehicles_list')}</h2>
        <button 
          onClick={handleAddVehicle}
          className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          {t('add_new_vehicle')}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'} text-gray-500 dark:text-gray-400`}>
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">{t('type_and_brand')}</th>
              <th scope="col" className="px-6 py-3">{t('registration_number')}</th>
              <th scope="col" className="px-6 py-3">{t('purchase_year')}</th>
              <th scope="col" className="px-6 py-3">{t('last_maintenance')}</th>
              <th scope="col" className="px-6 py-3">{t('status')}</th>
              <th scope="col" className="px-6 py-3">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{vehicle.brand}</td>
                <td className="px-6 py-4">{vehicle.registration}</td>
                <td className="px-6 py-4">{vehicle.purchaseYear}</td>
                <td className="px-6 py-4">{vehicle.lastMaintenance}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[vehicle.status]}`}>
                    {t(vehicleStatusKeys[vehicle.status])}
                  </span>
                </td>
                <td className="px-6 py-4 flex items-center space-x-2 space-x-reverse">
                  <button onClick={() => handleEditVehicle(vehicle)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-500 dark:hover:text-indigo-300">{t('edit')}</button>
                  <button onClick={() => handleDeleteVehicle(vehicle.id)} className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-300">{t('delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <VehicleModal 
          vehicle={editingVehicle}
          onClose={handleCloseModal}
          onSave={handleSaveVehicle}
        />
      )}
    </div>
  );
};

interface VehicleModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSave: (vehicleData: Omit<Vehicle, 'id'>) => void;
}

const VehicleModal: React.FC<VehicleModalProps> = ({ vehicle, onClose, onSave }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    type: vehicle?.type || 'سيارة',
    brand: vehicle?.brand || '',
    registration: vehicle?.registration || '',
    purchaseYear: vehicle?.purchaseYear || new Date().getFullYear(),
    status: vehicle?.status || 'متوفرة',
    lastMaintenance: vehicle?.lastMaintenance || new Date().toISOString().split('T')[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: name === 'purchaseYear' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className="text-lg font-medium">{vehicle ? t('edit_vehicle_title') : t('add_vehicle_title')}</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm">{t('type')}</label>
                <input type="text" name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div>
                <label className="block text-sm">{t('brand')}</label>
                <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div>
                <label className="block text-sm">{t('registration_number')}</label>
                <input type="text" name="registration" value={formData.registration} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div>
                <label className="block text-sm">{t('purchase_year')}</label>
                <input type="number" name="purchaseYear" value={formData.purchaseYear} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" required />
              </div>
               <div>
                <label className="block text-sm">{t('status')}</label>
                <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600">
                  {Object.entries(vehicleStatusKeys).map(([original, key]) => <option key={original} value={original}>{t(key)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm">{t('last_maintenance_date')}</label>
                <input type="date" name="lastMaintenance" value={formData.lastMaintenance} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" required />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex flex-row-reverse gap-2">
            <button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded-lg">{t('save')}</button>
            <button type="button" onClick={onClose} className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 py-2 px-4 rounded-lg">{t('cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Vehicles;