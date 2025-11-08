import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { StudentIcon, InstructorIcon, VehicleIcon, FinanceIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

const Dashboard: React.FC = () => {
    const { t } = useLanguage();

    const stats = [
        { title: t('total_students'), value: 125, icon: StudentIcon, color: 'bg-blue-500' },
        { title: t('active_instructors'), value: 8, icon: InstructorIcon, color: 'bg-green-500' },
        { title: t('available_vehicles'), value: 10, icon: VehicleIcon, color: 'bg-yellow-500' },
        { title: t('monthly_income'), value: `15,000 ${t('currency')}`, icon: FinanceIcon, color: 'bg-indigo-500' },
    ];

    const monthlyIncomeData = [
        { name: t('january'), [t('income')]: 4000 },
        { name: t('february'), [t('income')]: 3000 },
        { name: t('march'), [t('income')]: 5000 },
        { name: t('april'), [t('income')]: 4500 },
        { name: t('may'), [t('income')]: 6000 },
        { name: t('june'), [t('income')]: 8000 },
    ];

    const successRateData = [
        { name: t('status_successful'), value: 400 },
        { name: t('status_failed'), value: 120 },
    ];
    const COLORS = ['#4CAF50', '#F44336'];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center space-x-reverse space-x-4">
                        <div className={`p-3 rounded-full text-white ${stat.color}`}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="font-semibold text-lg mb-4">{t('monthly_income_chart_title')}</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={monthlyIncomeData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="name" tick={{ fill: 'rgb(156 163 175)' }} />
                                <YAxis tick={{ fill: 'rgb(156 163 175)' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '0.5rem', color: '#fff' }} />
                                <Legend />
                                <Bar dataKey={t('income')} fill="#4f46e5" name={`${t('income')} (${t('currency')})`} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="font-semibold text-lg mb-4">{t('exam_success_rate')}</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={successRateData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={110}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {successRateData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '0.5rem', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;