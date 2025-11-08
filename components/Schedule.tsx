import React, { useState } from 'react';
import type { Lesson, Student, Instructor, Vehicle, LessonType, LessonStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ScheduleProps {
    lessons: Lesson[];
    setLessons: React.Dispatch<React.SetStateAction<Lesson[]>>;
    students: Student[];
    instructors: Instructor[];
    vehicles: Vehicle[];
}

const lessonStatusColors: Record<LessonStatus, string> = {
    'مجدولة': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'مكتملة': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'ملغاة': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const lessonStatusKeys: Record<LessonStatus, string> = {
    'مجدولة': 'lesson_status_scheduled',
    'مكتملة': 'lesson_status_completed',
    'ملغاة': 'lesson_status_cancelled',
};
const lessonTypeKeys: Record<LessonType, string> = {
    'تطبيقي': 'lesson_type_practical',
    'نظري': 'lesson_type_theoretical',
};

const Schedule: React.FC<ScheduleProps> = ({ lessons, setLessons, students, instructors, vehicles }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const { t } = useLanguage();

    const studentMap = Object.fromEntries(students.map(s => [s.id, s.name]));
    const instructorMap = Object.fromEntries(instructors.map(i => [i.id, i.name]));

    const handleAddLesson = () => {
        setEditingLesson(null);
        setIsModalOpen(true);
    };

    const handleEditLesson = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLesson(null);
    };

    const handleSaveLesson = (lessonData: Omit<Lesson, 'id'>) => {
        if (editingLesson) {
            setLessons(prevLessons =>
                prevLessons.map(l =>
                    l.id === editingLesson.id ? { ...editingLesson, ...lessonData } : l
                )
            );
        } else {
            setLessons(prevLessons => {
                const newLesson: Lesson = {
                    id: Math.max(0, ...prevLessons.map(l => l.id)) + 1,
                    ...lessonData,
                };
                return [...prevLessons, newLesson];
            });
        }
        handleCloseModal();
    };
    
    const handleDeleteLesson = (id: number) => {
        if (window.confirm(t('confirm_delete_lesson'))) {
            setLessons(prevLessons => prevLessons.filter(l => l.id !== id));
        }
    };

    const days = [t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday'), t('sunday')];
    const timeSlots = Array.from({ length: 11 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
    
    const getDayIndex = (date: string) => (new Date(date).getDay() + 6) % 7;


  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('weekly_schedule')}</h2>
            <button onClick={handleAddLesson} className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300">
            {t('add_new_lesson')}
            </button>
      </div>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 min-w-[1300px]">
            <div className="text-center font-bold p-2 border-b dark:border-gray-600">{t('time')}</div>
            {days.map(day => (
                <div key={day} className="text-center font-bold p-2 border-b dark:border-gray-600">{day}</div>
            ))}

            {timeSlots.map(time => (
                <React.Fragment key={time}>
                    <div className="text-center p-2 border-r dark:border-gray-600 h-28 flex items-center justify-center">{time}</div>
                    {days.map((day, dayIndex) => {
                        const lesson = lessons.find(l => {
                            return getDayIndex(l.date) === dayIndex && l.time === time;
                        });
                        return (
                            <div key={`${day}-${time}`} className="border-b border-r dark:border-gray-600 p-1 h-28">
                                {lesson ? (
                                    <div 
                                        onClick={() => handleEditLesson(lesson)}
                                        className={`p-2 rounded-lg h-full text-xs cursor-pointer transition-transform hover:scale-105 ${lesson.type === 'تطبيقي' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'}`}
                                    >
                                        <p className="font-bold">{t(lessonTypeKeys[lesson.type])}</p>
                                        <p>{lesson.type === 'تطبيقي' ? studentMap[lesson.studentId!] : lesson.topic}</p>
                                        <p className="text-gray-500">{lesson.type === 'تطبيقي' ? instructorMap[lesson.instructorId!] : lesson.location}</p>
                                        <span className={`px-2 py-0.5 mt-1 inline-block text-[10px] font-medium rounded-full ${lessonStatusColors[lesson.status]}`}>
                                            {t(lessonStatusKeys[lesson.status])}
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </React.Fragment>
            ))}
        </div>
      </div>

       {isModalOpen && (
            <LessonModal
                lesson={editingLesson}
                onClose={handleCloseModal}
                onSave={handleSaveLesson}
                onDelete={handleDeleteLesson}
                students={students}
                instructors={instructors}
                vehicles={vehicles}
            />
        )}
    </div>
  );
};


interface LessonModalProps {
    lesson: Lesson | null;
    onClose: () => void;
    onSave: (data: Omit<Lesson, 'id'>) => void;
    onDelete: (id: number) => void;
    students: Student[];
    instructors: Instructor[];
    vehicles: Vehicle[];
}

const LessonModal: React.FC<LessonModalProps> = ({ lesson, onClose, onSave, onDelete, students, instructors, vehicles }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<Omit<Lesson, 'id'>>({
        type: lesson?.type || 'تطبيقي',
        date: lesson?.date || new Date().toISOString().split('T')[0],
        time: lesson?.time || '08:00',
        status: lesson?.status || 'مجدولة',
        studentId: lesson?.studentId || null,
        instructorId: lesson?.instructorId || null,
        vehicleId: lesson?.vehicleId || null,
        topic: lesson?.topic || '',
        location: lesson?.location || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleNumericChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value ? Number(value) : null }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-medium">{lesson ? t('edit_lesson_title') : t('add_lesson_title')}</h3>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm">{t('lesson_type')}</label>
                                <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600">
                                    <option value="تطبيقي">{t('lesson_type_practical')}</option>
                                    <option value="نظري">{t('lesson_type_theoretical')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm">{t('status')}</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600">
                                    {Object.entries(lessonStatusKeys).map(([original, key]) => <option key={original} value={original}>{t(key)}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm">{t('date')}</label>
                                <input type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" required />
                            </div>
                            <div>
                                <label className="block text-sm">{t('time')}</label>
                                <select name="time" value={formData.time} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600">
                                {Array.from({ length: 11 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            {formData.type === 'تطبيقي' ? (
                                <>
                                    <div className="col-span-2">
                                        <label className="block text-sm">{t('student')}</label>
                                        <select name="studentId" value={formData.studentId || ''} onChange={handleNumericChange} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" required>
                                            <option value="">-- {t('select_student')} --</option>
                                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm">{t('instructor')}</label>
                                        <select name="instructorId" value={formData.instructorId || ''} onChange={handleNumericChange} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" required>
                                            <option value="">-- {t('select_instructor')} --</option>
                                            {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm">{t('vehicle')}</label>
                                        <select name="vehicleId" value={formData.vehicleId || ''} onChange={handleNumericChange} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" required>
                                            <option value="">-- {t('select_vehicle')} --</option>
                                            {vehicles.filter(v => v.status === 'متوفرة').map(v => <option key={v.id} value={v.id}>{v.brand} ({v.registration})</option>)}
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="col-span-2">
                                        <label className="block text-sm">{t('lesson_topic')}</label>
                                        <input type="text" name="topic" value={formData.topic} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" required />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm">{t('classroom')}</label>
                                        <input type="text" name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" required />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex justify-between items-center">
                         <div>
                            {lesson && (
                                <button type="button" onClick={() => onDelete(lesson.id)} className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 font-medium">
                                    {t('delete_lesson')}
                                </button>
                            )}
                        </div>
                        <div className="flex flex-row-reverse gap-2">
                             <button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded-lg">{t('save')}</button>
                             <button type="button" onClick={onClose} className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 py-2 px-4 rounded-lg">{t('cancel')}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Schedule;