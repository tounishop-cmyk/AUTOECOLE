import React, { useState, useRef } from 'react';
import type { Student, StudentStatus, LicenseType, Payment, Document } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const statusColors: Record<StudentStatus, string> = {
  'ناجح': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'في التكوين': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'اجتاز الامتحان': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'ملف مفتوح': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  'راسب': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const studentStatusKeys: Record<StudentStatus, string> = {
  'ملف مفتوح': 'status_open_file',
  'في التكوين': 'status_in_training',
  'اجتاز الامتحان': 'status_passed_exam',
  'ناجح': 'status_successful',
  'راسب': 'status_failed',
};

interface StudentsProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  payments: Payment[];
}

const Students: React.FC<StudentsProps> = ({ students, setStudents, payments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { t, language } = useLanguage();

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nationalId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleSaveStudent = (studentData: Omit<Student, 'id' | 'registrationDate'>) => {
    if (editingStudent) {
      setStudents(students.map(s => s.id === editingStudent.id ? { ...editingStudent, ...studentData } : s));
    } else {
      const newStudent: Student = {
        id: Math.max(0, ...students.map(s => s.id)) + 1,
        registrationDate: new Date().toISOString().split('T')[0],
        ...studentData
      };
      setStudents([...students, newStudent]);
    }
    handleCloseModal();
  };

  const handleDeleteStudent = (id: number) => {
    if (window.confirm(t('confirm_delete_student'))) {
        setStudents(students.filter(s => s.id !== id));
    }
  };
  
  const handlePrintStudent = (student: Student) => {
    const studentPayments = payments.filter(p => p.studentId === student.id);
    const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
    const balance = student.totalTrainingCost - totalPaid;
    const printLocale = language === 'ar' ? 'ar-EG' : 'fr-FR';

    const printDirection = language === 'ar' ? 'rtl' : 'ltr';
    const printAlign = language === 'ar' ? 'right' : 'left';

    const printContent = `
      <html lang="${language}" dir="${printDirection}">
        <head>
          <title>${t('student_file')}: ${student.name}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Cairo', sans-serif; direction: ${printDirection}; text-align: ${printAlign}; padding: 20px; }
            .container { border: 1px solid #ccc; padding: 20px; max-width: 800px; margin: auto; }
            h1 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: ${printAlign}; }
            th { background-color: #f2f2f2; }
            .section-title { font-weight: bold; font-size: 1.2em; margin-top: 25px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${t('student_file')}</h1>
            <div class="section-title">${t('personal_information')}</div>
            <table>
              <tr><th>${t('full_name')}</th><td>${student.name}</td></tr>
              <tr><th>${t('address')}</th><td>${student.address}</td></tr>
              <tr><th>${t('phone_number')}</th><td>${student.phone}</td></tr>
              <tr><th>${t('national_id')}</th><td>${student.nationalId}</td></tr>
            </table>
            
            <div class="section-title">${t('training_information')}</div>
            <table>
              <tr><th>${t('license_type')}</th><td>${student.licenseType}</td></tr>
              <tr><th>${t('registration_date')}</th><td>${new Date(student.registrationDate).toLocaleDateString(printLocale)}</td></tr>
              <tr><th>${t('status')}</th><td>${t(studentStatusKeys[student.status])}</td></tr>
            </table>

            <div class="section-title">${t('financial_status')}</div>
             <table>
              <tr><th>${t('total_cost')}</th><td>${student.totalTrainingCost.toLocaleString(printLocale)} ${t('currency')}</td></tr>
              <tr><th>${t('amount_paid')}</th><td>${totalPaid.toLocaleString(printLocale)} ${t('currency')}</td></tr>
              <tr><th>${t('remaining_balance')}</th><td>${balance.toLocaleString(printLocale)} ${t('currency')}</td></tr>
            </table>

            <div class="section-title">${t('attached_documents')}</div>
            <table>
              <thead><tr><th>${t('document_name')}</th><th>${t('file_name')}</th><th>${t('upload_date')}</th></tr></thead>
              <tbody>
                ${student.documents?.map(doc => `
                  <tr>
                    <td>${doc.name}</td>
                    <td>${doc.fileName}</td>
                    <td>${new Date(doc.uploadDate).toLocaleDateString(printLocale)}</td>
                  </tr>
                `).join('') || `<tr><td colspan="3">${t('no_documents_attached')}</td></tr>`}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <input
          type="text"
          placeholder={t('search_by_name_or_id')}
          className="w-full sm:w-72 p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={handleAddStudent}
          className="w-full sm:w-auto bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center justify-center"
        >
          <span>{t('add_new_student')}</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'} text-gray-500 dark:text-gray-400`}>
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">{t('full_name')}</th>
              <th scope="col" className="px-6 py-3">{t('phone_number')}</th>
              <th scope="col" className="px-6 py-3">{t('license_type')}</th>
              <th scope="col" className="px-6 py-3">{t('status')}</th>
              <th scope="col" className="px-6 py-3">{t('balance')}</th>
              <th scope="col" className="px-6 py-3">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => {
              const totalPaid = payments
                .filter(p => p.studentId === student.id)
                .reduce((sum, p) => sum + p.amount, 0);
              const balance = student.totalTrainingCost - totalPaid;

              return (
                <tr key={student.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{student.name}</td>
                  <td className="px-6 py-4">{student.phone}</td>
                  <td className="px-6 py-4">{student.licenseType}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[student.status]}`}>
                      {t(studentStatusKeys[student.status])}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {balance.toLocaleString()} {t('currency')}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center space-x-2 space-x-reverse">
                    <button onClick={() => handlePrintStudent(student)} className="text-green-600 hover:text-green-900 dark:text-green-500 dark:hover:text-green-300">{t('print')}</button>
                    <button onClick={() => handleEditStudent(student)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-500 dark:hover:text-indigo-300">{t('edit')}</button>
                    <button onClick={() => handleDeleteStudent(student.id)} className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-300">{t('delete')}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {isModalOpen && (
        <StudentModal 
            student={editingStudent} 
            onClose={handleCloseModal} 
            onSave={handleSaveStudent} 
        />
      )}
    </div>
  );
};


interface StudentModalProps {
  student: Student | null;
  onClose: () => void;
  onSave: (studentData: Omit<Student, 'id' | 'registrationDate'>) => void;
}

const StudentModal: React.FC<StudentModalProps> = ({ student, onClose, onSave }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: student?.name || '',
        address: student?.address || '',
        phone: student?.phone || '',
        nationalId: student?.nationalId || '',
        licenseType: student?.licenseType || 'B',
        status: student?.status || 'ملف مفتوح',
        totalTrainingCost: student?.totalTrainingCost || 0,
        documents: student?.documents || [],
    });

    const [newDocName, setNewDocName] = useState('');
    const [newDocFile, setNewDocFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'totalTrainingCost' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Omit<Student, 'id' | 'registrationDate'>);
    };

    const handleAddDocument = () => {
        if (!newDocName || !newDocFile) {
            alert(t('alert_doc_name_file'));
            return;
        }
        const newDocument: Document = {
            id: Date.now(),
            name: newDocName,
            fileName: newDocFile.name,
            uploadDate: new Date().toISOString().split('T')[0],
        };
        setFormData(prev => ({
            ...prev,
            documents: [...(prev.documents || []), newDocument]
        }));
        setNewDocName('');
        setNewDocFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeleteDocument = (docId: number) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents?.filter(doc => doc.id !== docId) || []
        }));
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                    <div className="p-6 overflow-y-auto">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                            {student ? t('edit_student_title') : t('add_student_title')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('full_name')}</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('phone_number')}</label>
                                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('address')}</label>
                                <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('national_id')}</label>
                                <input type="text" name="nationalId" id="nationalId" value={formData.nationalId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                            </div>
                             <div>
                                <label htmlFor="licenseType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('license_type')}</label>
                                <select id="licenseType" name="licenseType" value={formData.licenseType} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                                    {['A', 'B', 'C', 'D', 'E'].map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('status')}</label>
                                <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                                    {Object.entries(studentStatusKeys).map(([original, key]) => <option key={original} value={original}>{t(key)}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="totalTrainingCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('total_training_cost', { currency: t('currency') })}</label>
                                <input type="number" name="totalTrainingCost" id="totalTrainingCost" value={formData.totalTrainingCost} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t dark:border-gray-700">
                            <h3 className="text-md font-medium text-gray-900 dark:text-white">
                                {t('document_management')}
                            </h3>
                             <div className="mt-4 space-y-2 max-h-32 overflow-y-auto pr-2">
                                {formData.documents && formData.documents.length > 0 ? formData.documents.map(doc => (
                                    <div key={doc.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                                        <div>
                                            <p className="font-medium text-sm">{doc.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{doc.fileName} - {doc.uploadDate}</p>
                                        </div>
                                        <button type="button" onClick={() => handleDeleteDocument(doc.id)} className="text-red-500 hover:text-red-700 text-sm">
                                            {t('delete')}
                                        </button>
                                    </div>
                                )) : <p className="text-sm text-gray-500 dark:text-gray-400">{t('no_documents_attached')}</p>}
                            </div>
                            <div className="mt-4 flex flex-col sm:flex-row items-end gap-2 border-t dark:border-gray-700 pt-4">
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-medium">{t('document_name')}</label>
                                    <input type="text" value={newDocName} onChange={(e) => setNewDocName(e.target.value)} placeholder={t('doc_name_placeholder')} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600"/>
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-medium">{t('select_file')}</label>
                                    <input ref={fileInputRef} type="file" onChange={(e) => setNewDocFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-600 dark:file:text-gray-300 dark:hover:file:bg-gray-500"/>
                                </div>
                                <button type="button" onClick={handleAddDocument} className="w-full sm:w-auto bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 text-sm">{t('add_document')}</button>
                            </div>
                        </div>

                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2 mt-auto border-t dark:border-gray-600">
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

export default Students;