import React, { useState, useRef } from 'react';
import type { BodyPart, Exercise, BodyPartId, WorkoutRoutine } from '../types';
import { TrashIcon, XIcon } from './Icons';
import { Modal } from './Modal';
import { ManageRoutineModal } from './ManageRoutineModal';

interface SettingsPageProps {
  bodyParts: BodyPart[];
  setBodyParts: React.Dispatch<React.SetStateAction<BodyPart[]>>;
  exercises: Record<BodyPartId, Exercise[]>;
  setExercises: React.Dispatch<React.SetStateAction<Record<BodyPartId, Exercise[]>>>;
  routines: WorkoutRoutine[];
  addRoutine: (routine: Omit<WorkoutRoutine, 'id'>) => void;
  updateRoutine: (routine: WorkoutRoutine) => void;
  deleteRoutine: (id: string) => void;
}

const COLOR_SCHEMES = [
    { color: 'rose', gradient: 'from-rose-500 to-pink-500' },
    { color: 'fuchsia', gradient: 'from-fuchsia-500 to-purple-500' },
    { color: 'indigo', gradient: 'from-indigo-500 to-blue-500' },
    { color: 'teal', gradient: 'from-teal-500 to-cyan-500' },
    { color: 'orange', gradient: 'from-orange-500 to-amber-500' },
];
const EMOJI_ICONS = ['💪', '🔥', ' Cardio', '🧘', '🤸', '🏋️'];

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const ManagePartModal: React.FC<{
  part: BodyPart;
  exercisesForPart: Exercise[];
  onClose: () => void;
  onUpdatePartName: (newName: string) => void;
  onUpdateExercise: (index: number, updatedExercise: Exercise) => void;
  onAddExercise: (newExercise: Exercise) => void;
  onDeleteExercise: (index: number) => void;
}> = ({ part, exercisesForPart, onClose, onUpdatePartName, onUpdateExercise, onAddExercise, onDeleteExercise }) => {
    const [partName, setPartName] = useState(part.name);
    const [newExerciseName, setNewExerciseName] = useState('');
    const [newExerciseImage, setNewExerciseImage] = useState<string | null>(null);
    const newExerciseFileRef = useRef<HTMLInputElement>(null);
    const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);

    const handleImageUpload = async (file: File, callback: (base64: string) => void) => {
        if (file && file.type.startsWith('image/')) {
            try {
                const base64 = await fileToBase64(file);
                callback(base64);
            } catch (error) {
                console.error("Error converting file to base64:", error);
                alert("فشل رفع الصورة.");
            }
        }
    };
    
    const handleUpdatePartName = () => {
        if(partName.trim() && partName.trim() !== part.name) {
            onUpdatePartName(partName.trim());
        }
    }

    const handleAddNewExercise = () => {
        if (!newExerciseName.trim() || !newExerciseImage) {
            alert("الرجاء إدخال اسم التمرين ورفع صورة.");
            return;
        }
        const newExercise = { name: newExerciseName.trim(), image: newExerciseImage };
        onAddExercise(newExercise);
        setNewExerciseName('');
        setNewExerciseImage(null);
        if (newExerciseFileRef.current) newExerciseFileRef.current.value = '';
    }
    
    const confirmDeleteExercise = () => {
        if (exerciseToDelete === null) return;
        onDeleteExercise(exerciseToDelete);
        setExerciseToDelete(null);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl p-6 ring-1 ring-white/10 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">إدارة: {part.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">تعديل اسم الجزء</label>
                    <div className="flex gap-2">
                        <input type="text" value={partName} onChange={e => setPartName(e.target.value)} onBlur={handleUpdatePartName} className="flex-grow bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button onClick={handleUpdatePartName} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">حفظ الاسم</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
                    <h3 className="text-xl font-bold text-gray-200 border-b border-gray-700 pb-2">التمارين</h3>
                    {exercisesForPart.map((exercise, index) => (
                        <div key={index} className="bg-gray-700/50 p-3 rounded-lg flex items-center gap-4">
                            <img src={exercise.image} alt={exercise.name} className="w-16 h-16 rounded-md object-cover"/>
                            <div className="flex-grow space-y-2">
                                <input type="text" value={exercise.name} onChange={e => {
                                    onUpdateExercise(index, {...exercise, name: e.target.value});
                                }} className="w-full bg-gray-600 text-white px-3 py-1.5 rounded-md"/>
                                <input type="file" accept="image/*" onChange={e => e.target.files && handleImageUpload(e.target.files[0], base64 => {
                                     onUpdateExercise(index, {...exercise, image: base64});
                                })} className="w-full text-sm text-gray-400 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-300 hover:file:bg-blue-500/30"/>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => setExerciseToDelete(index)} className="p-2 rounded-full hover:bg-red-500/20 text-red-400"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))}
                </div>
                 
                <div className="mt-6 pt-4 border-t border-gray-700">
                     <h3 className="text-xl font-bold text-gray-200 mb-2">إضافة تمرين جديد</h3>
                     <div className="flex items-start gap-4">
                        <div className="flex-grow space-y-2">
                           <input type="text" value={newExerciseName} onChange={e => setNewExerciseName(e.target.value)} placeholder="اسم التمرين الجديد" className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"/>
                           <input ref={newExerciseFileRef} type="file" accept="image/*" onChange={e => e.target.files && handleImageUpload(e.target.files[0], base64 => setNewExerciseImage(base64))} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"/>
                        </div>
                        {newExerciseImage && <img src={newExerciseImage} alt="Preview" className="w-16 h-16 rounded-md object-cover"/>}
                        <button onClick={handleAddNewExercise} className="self-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg h-full">إضافة</button>
                     </div>
                </div>

                <Modal
                    isOpen={exerciseToDelete !== null}
                    onClose={() => setExerciseToDelete(null)}
                    onConfirm={confirmDeleteExercise}
                    title="تأكيد حذف التمرين"
                    confirmText="نعم, احذف"
                    cancelText="إلغاء"
                >
                    <p>هل أنت متأكد أنك تريد حذف هذا التمرين؟</p>
                </Modal>
            </div>
        </div>
    );
};


export const SettingsPage: React.FC<SettingsPageProps> = ({ bodyParts, setBodyParts, exercises, setExercises, routines, addRoutine, updateRoutine, deleteRoutine }) => {
    const [newPartName, setNewPartName] = useState('');
    const [managingPart, setManagingPart] = useState<BodyPart | null>(null);
    const [partToDelete, setPartToDelete] = useState<BodyPart | null>(null);
    const [managingRoutine, setManagingRoutine] = useState<WorkoutRoutine | 'new' | null>(null);
    const [routineToDelete, setRoutineToDelete] = useState<WorkoutRoutine | null>(null);


    const handleAddPart = () => {
        if (!newPartName.trim()) {
            alert('الرجاء إدخال اسم للجزء الجديد.');
            return;
        }
        const newPartId = newPartName.trim().toLowerCase().replace(/\s+/g, '-');
        if (bodyParts.some(p => p.id === newPartId)) {
            alert('هذا الجزء موجود بالفعل.');
            return;
        }
        const colorScheme = COLOR_SCHEMES[bodyParts.length % COLOR_SCHEMES.length];
        const icon = EMOJI_ICONS[bodyParts.length % EMOJI_ICONS.length];
        const newPart: BodyPart = {
            id: newPartId,
            name: newPartName.trim(),
            icon,
            ...colorScheme
        };
        setBodyParts(prev => [...prev, newPart]);
        setExercises(prev => ({ ...prev, [newPartId]: [] }));
        setNewPartName('');
    };
    
    const confirmDeletePart = () => {
        if (!partToDelete) return;
        setBodyParts(prev => prev.filter(p => p.id !== partToDelete.id));
        setExercises(prev => {
            const newExercises = { ...prev };
            delete newExercises[partToDelete.id];
            return newExercises;
        });
        setPartToDelete(null);
    };
    
    const handleUpdatePartName = (partId: BodyPartId, newName: string) => {
        setBodyParts(prev => prev.map(p => p.id === partId ? {...p, name: newName} : p));
        setManagingPart(prev => prev ? {...prev, name: newName} : null);
    };
    
    const handleExerciseUpdate = (partId: BodyPartId, exIndex: number, updatedExercise: Exercise) => {
        setExercises(prev => {
            const newExercises = { ...prev };
            const partExercises = [...newExercises[partId]];
            partExercises[exIndex] = updatedExercise;
            newExercises[partId] = partExercises;
            return newExercises;
        });
    };
    
    const handleExerciseAdd = (partId: BodyPartId, newExercise: Exercise) => {
         setExercises(prev => {
            const newExercises = { ...prev };
            newExercises[partId] = [...(newExercises[partId] || []), newExercise];
            return newExercises;
        });
    };
    
    const handleExerciseDelete = (partId: BodyPartId, exIndex: number) => {
        setExercises(prev => {
            const newExercises = { ...prev };
            const partExercises = [...newExercises[partId]];
            partExercises.splice(exIndex, 1);
            newExercises[partId] = partExercises;
            return newExercises;
        });
    };
    
    const confirmDeleteRoutine = () => {
        if (!routineToDelete) return;
        deleteRoutine(routineToDelete.id);
        setRoutineToDelete(null);
    };


    return (
        <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg ring-1 ring-white/10 space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white mb-4">إدارة الأجزاء والتمارين</h2>
                <p className="text-gray-400">هنا يمكنك تخصيص أجزاء الجسم والتمارين لتناسب خطتك التدريبية.</p>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-200">الأجزاء الحالية</h3>
                {bodyParts.map(part => (
                    <div key={part.id} className={`p-4 rounded-lg flex items-center justify-between bg-gradient-to-r ${part.gradient}`}>
                        <span className="font-bold text-lg text-white">{part.icon} {part.name}</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setManagingPart(part)} className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg text-sm">إدارة التمارين</button>
                            <button onClick={() => setPartToDelete(part)} className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"><TrashIcon className="w-5 h-5" /></button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-8 border-t border-gray-700">
                <h3 className="text-xl font-bold text-gray-200 mb-2">إضافة جزء جديد</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={newPartName}
                        onChange={e => setNewPartName(e.target.value)}
                        placeholder="مثال: كارديو"
                        className="flex-grow bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleAddPart} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg">
                        إضافة جزء
                    </button>
                </div>
            </div>

            <div className="pt-8 border-t border-gray-700 space-y-4">
                <h2 className="text-3xl font-bold text-white mb-4">خطط التمارين</h2>
                <p className="text-gray-400">أنشئ خططًا تدريبية كاملة للوصول السريع إليها في يوم التمرين.</p>
                
                <div className="space-y-3">
                    {routines.map(routine => (
                        <div key={routine.id} className="bg-gray-700/50 p-4 rounded-lg flex items-center justify-between">
                            <span className="font-bold text-lg text-white">{routine.name}</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setManagingRoutine(routine)} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg text-sm">تعديل</button>
                                <button onClick={() => setRoutineToDelete(routine)} className="p-2 rounded-full bg-red-600/80 hover:bg-red-500 text-white"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-4">
                    <button onClick={() => setManagingRoutine('new')} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg">
                        إنشاء خطة جديدة
                    </button>
                </div>
            </div>

            {managingPart && (
                <ManagePartModal
                    part={managingPart}
                    exercisesForPart={exercises[managingPart.id] || []}
                    onClose={() => setManagingPart(null)}
                    onUpdatePartName={(newName) => handleUpdatePartName(managingPart.id, newName)}
                    onUpdateExercise={(index, updatedEx) => handleExerciseUpdate(managingPart.id, index, updatedEx)}
                    onAddExercise={(newEx) => handleExerciseAdd(managingPart.id, newEx)}
                    onDeleteExercise={(index) => handleExerciseDelete(managingPart.id, index)}
                />
            )}
            
            {managingRoutine && (
                <ManageRoutineModal
                    isOpen={!!managingRoutine}
                    onClose={() => setManagingRoutine(null)}
                    routineToEdit={managingRoutine === 'new' ? undefined : managingRoutine}
                    bodyParts={bodyParts}
                    exercises={exercises}
                    onSave={(routineData) => {
                        if (managingRoutine === 'new') {
                            addRoutine(routineData);
                        } else if (managingRoutine.id) {
                            updateRoutine({ ...routineData, id: managingRoutine.id });
                        }
                        setManagingRoutine(null);
                    }}
                />
            )}

            <Modal
                isOpen={!!partToDelete}
                onClose={() => setPartToDelete(null)}
                onConfirm={confirmDeletePart}
                title="تأكيد حذف الجزء"
                confirmText="نعم, احذف"
                cancelText="إلغاء"
            >
                <p>هل أنت متأكد من حذف جزء "{partToDelete?.name}" وكل تمارينه؟ لا يمكن التراجع عن هذا الإجراء.</p>
            </Modal>
            
            <Modal
                isOpen={!!routineToDelete}
                onClose={() => setRoutineToDelete(null)}
                onConfirm={confirmDeleteRoutine}
                title="تأكيد حذف الخطة"
                confirmText="نعم, احذف"
                cancelText="إلغاء"
            >
                <p>هل أنت متأكد من حذف خطة "{routineToDelete?.name}"؟ لن يتم حذف التمارين نفسها.</p>
            </Modal>
        </div>
    );
};