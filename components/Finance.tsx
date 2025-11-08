import React, { useState } from 'react';
import type { Payment, Expense, Student } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface FinanceProps {
    payments: Payment[];
    setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
    expenses: Expense[];
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
    students: Student[];
}

const Finance: React.FC<FinanceProps> = ({ payments, setPayments, expenses, setExpenses, students }) => {
    const { t, language } = useLanguage();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const studentNames = students.reduce((acc, student) => {
        acc[student.id] = student.name;
        return acc;
    }, {} as { [key: number]: string });

    const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    const handleSavePayment = (paymentData: Omit<Payment, 'id'>) => {
        if (editingPayment) {
            setPayments(payments.map(p => p.id === editingPayment.id ? { ...editingPayment, ...paymentData } : p));
        } else {
            const newPayment: Payment = {
                id: Math.max(0, ...payments.map(p => p.id)) + 1,
                ...paymentData
            };
            setPayments([...payments, newPayment]);
        }
        setIsPaymentModalOpen(false);
        setEditingPayment(null);
    };

    const handleDeletePayment = (id: number) => {
        if (window.confirm(t('confirm_delete_payment'))) {
            setPayments(payments.filter(p => p.id !== id));
        }
    };

    const handleSaveExpense = (expenseData: Omit<Expense, 'id'>) => {
        if (editingExpense) {
            setExpenses(expenses.map(e => e.id === editingExpense.id ? { ...editingExpense, ...expenseData } : e));
        } else {
            const newExpense: Expense = {
                id: Math.max(0, ...expenses.map(e => e.id)) + 1,
                ...expenseData
            };
            setExpenses([...expenses, newExpense]);
        }
        setIsExpenseModalOpen(false);
        setEditingExpense(null);
    };

    const handleDeleteExpense = (id: number) => {
        if (window.confirm(t('confirm_delete_expense'))) {
            setExpenses(expenses.filter(e => e.id !== id));
        }
    };
    
    const handlePrintReceipt = (payment: Payment) => {
        const studentName = studentNames[payment.studentId] || t('unknown');
        const printLocale = language === 'ar' ? 'ar-EG' : 'fr-FR';
        const printDirection = language === 'ar' ? 'rtl' : 'ltr';
        const printAlign = language === 'ar' ? 'right' : 'left';
        
        const receiptContent = `
          <html lang="${language}" dir="${printDirection}">
            <head>
              <title>${t('payment_receipt')}</title>
              <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
              <style>
                body { font-family: 'Cairo', sans-serif; direction: ${printDirection}; text-align: ${printAlign}; padding: 20px; background-color: #f9f9f9; }
                .receipt-container { border: 1px solid #ddd; padding: 30px; max-width: 600px; margin: auto; background-color: white; box-shadow: 0 0 15px rgba(0,0,0,0.05); border-radius: 8px; }
                h1 { text-align: center; color: #333; border-bottom: 2px solid #eee; padding-bottom: 15px; margin-bottom: 20px;}
                p { margin: 12px 0; font-size: 16px; }
                .details { margin-top: 25px; line-height: 1.8; }
                .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #777; }
                strong { color: #000; }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                <h1>${t('payment_receipt')}</h1>
                <p><strong>${t('school_name')}:</strong> ${t('school_name_value')}</p>
                <p><strong>${t('print_date')}:</strong> ${new Date().toLocaleDateString(printLocale)}</p>
                <hr/>
                <div class="details">
                  <p><strong>${t('received_from')}:</strong> ${studentName}</p>
                  <p><strong>${t('amount_of')}:</strong> ${payment.amount.toLocaleString(printLocale)} ${t('currency')}</p>
                  <p><strong>${t('for_reason')}:</strong> ${payment.description}</p>
                  <p><strong>${t('on_date')}:</strong> ${new Date(payment.date).toLocaleDateString(printLocale)}</p>
                </div>
                <div class="footer">
                  ${t('receipt_footer')}
                </div>
              </div>
            </body>
          </html>
        `;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(receiptContent);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
    };

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-green-500">{t('total_income')}</h3>
                    <p className="text-3xl font-bold mt-2">{totalIncome.toLocaleString()} {t('currency')}</p>
                </div>
                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-red-500">{t('total_expenses')}</h3>
                    <p className="text-3xl font-bold mt-2">{totalExpenses.toLocaleString()} {t('currency')}</p>
                </div>
                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-blue-500">{t('net_profit')}</h3>
                    <p className="text-3xl font-bold mt-2">{netProfit.toLocaleString()} {t('currency')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">{t('payments_income')}</h3>
                        <button onClick={() => { setEditingPayment(null); setIsPaymentModalOpen(true); }} className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300">{t('add_payment')}</button>
                    </div>
                    <div className="overflow-y-auto h-96">
                        <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                           <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                               <tr>
                                   <th className="py-3 px-2">{t('student')}</th>
                                   <th className="py-3 px-2">{t('amount')}</th>
                                   <th className="py-3 px-2">{t('date')}</th>
                                   <th className="py-3 px-2">{t('actions')}</th>
                               </tr>
                           </thead>
                           <tbody>
                           {payments.map(p => (
                               <tr key={p.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                   <td className="py-3 px-2">
                                       <div>{studentNames[p.studentId] || t('deleted_student')}</div>
                                       <div className="text-xs text-gray-500">{p.description}</div>
                                   </td>
                                   <td className="py-3 px-2 text-green-600 font-bold">{p.amount} {t('currency')}</td>
                                   <td className="py-3 px-2 text-xs text-gray-400">{p.date}</td>
                                   <td className="py-3 px-2 space-x-2 space-x-reverse whitespace-nowrap">
                                        <button onClick={() => handlePrintReceipt(p)} className="text-blue-600 hover:text-blue-900">{t('print')}</button>
                                        <button onClick={() => { setEditingPayment(p); setIsPaymentModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900">{t('edit')}</button>
                                        <button onClick={() => handleDeletePayment(p.id)} className="text-red-600 hover:text-red-900">{t('delete')}</button>
                                   </td>
                               </tr>
                           ))}
                           </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">{t('expenses')}</h3>
                        <button onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }} className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-300">{t('add_expense')}</button>
                    </div>
                    <div className="overflow-y-auto h-96">
                         <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                   <th className="py-3 px-2">{t('category')}</th>
                                   <th className="py-3 px-2">{t('amount')}</th>
                                   <th className="py-3 px-2">{t('date')}</th>
                                   <th className="py-3 px-2">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                           {expenses.map(e => (
                               <tr key={e.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                   <td className="py-3 px-2">
                                       <div>{e.category}</div>
                                       <div className="text-xs text-gray-500">{e.description}</div>
                                   </td>
                                   <td className="py-3 px-2 text-red-600 font-bold">{e.amount} {t('currency')}</td>
                                   <td className="py-3 px-2 text-xs text-gray-400">{e.date}</td>
                                   <td className="py-3 px-2 space-x-2 space-x-reverse whitespace-nowrap">
                                        <button onClick={() => { setEditingExpense(e); setIsExpenseModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900">{t('edit')}</button>
                                        <button onClick={() => handleDeleteExpense(e.id)} className="text-red-600 hover:text-red-900">{t('delete')}</button>
                                   </td>
                               </tr>
                           ))}
                           </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {isPaymentModalOpen && <PaymentModal payment={editingPayment} onClose={() => setIsPaymentModalOpen(false)} onSave={handleSavePayment} studentNames={studentNames} />}
            {isExpenseModalOpen && <ExpenseModal expense={editingExpense} onClose={() => setIsExpenseModalOpen(false)} onSave={handleSaveExpense} />}
        </div>
    );
};

// Payment Modal Component
interface PaymentModalProps {
  payment: Payment | null;
  onClose: () => void;
  onSave: (data: Omit<Payment, 'id'>) => void;
  studentNames: { [key: number]: string };
}
const PaymentModal: React.FC<PaymentModalProps> = ({ payment, onClose, onSave, studentNames }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        studentId: payment?.studentId || (Object.keys(studentNames).length > 0 ? Number(Object.keys(studentNames)[0]) : 1),
        amount: payment?.amount || '',
        date: payment?.date || new Date().toISOString().split('T')[0],
        description: payment?.description || '',
    });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, amount: Number(formData.amount), studentId: Number(formData.studentId) });
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-medium">{payment ? t('edit_payment_title') : t('add_payment_title')}</h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm">{t('student')}</label>
                                <select name="studentId" value={formData.studentId} onChange={e => setFormData({...formData, studentId: Number(e.target.value)})} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600">
                                    {Object.entries(studentNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm">{t('amount')} ({t('currency')})</label>
                                <input type="number" name="amount" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" required />
                            </div>
                            <div>
                                <label className="block text-sm">{t('description')}</label>
                                <input type="text" name="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" required />
                            </div>
                            <div>
                                <label className="block text-sm">{t('date')}</label>
                                <input type="date" name="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" required />
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

// Expense Modal Component
interface ExpenseModalProps {
  expense: Expense | null;
  onClose: () => void;
  onSave: (data: Omit<Expense, 'id'>) => void;
}
const ExpenseModal: React.FC<ExpenseModalProps> = ({ expense, onClose, onSave }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        category: expense?.category || 'صيانة',
        amount: expense?.amount || '',
        date: expense?.date || new Date().toISOString().split('T')[0],
        description: expense?.description || '',
    });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, amount: Number(formData.amount) });
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-medium">{expense ? t('edit_expense_title') : t('add_expense_title')}</h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm">{t('category')}</label>
                                <select name="category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Expense['category']})} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600">
                                    {['صيانة', 'رواتب', 'كراء', 'فواتير', 'أخرى'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm">{t('amount')} ({t('currency')})</label>
                                <input type="number" name="amount" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" required />
                            </div>
                            <div>
                                <label className="block text-sm">{t('description')}</label>
                                <input type="text" name="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" required />
                            </div>
                            <div>
                                <label className="block text-sm">{t('date')}</label>
                                <input type="date" name="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" required />
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


export default Finance;