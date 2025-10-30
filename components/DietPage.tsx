import React, { useState, useMemo } from 'react';
import type { NutritionGoals, FoodItem, DailyDietLog, MealType, LoggedFood } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, PlusCircleIcon, TrashIcon, XIcon, SaveIcon } from './Icons';
import { ManageFoodItemModal } from './ManageFoodItemModal';

// Helper to format date to 'YYYY-MM-DD'
const toYMD = (date: Date) => date.toISOString().split('T')[0];

// --- Sub-components ---

const TotalsSummary: React.FC<{ totals: Record<string, number>, goals: NutritionGoals }> = ({ totals, goals }) => {
    const macroInfo = [
        { name: 'بروتين', value: totals.protein, goal: goals.protein, unit: 'جرام', color: 'bg-sky-500' },
        { name: 'كربوهيدرات', value: totals.carbs, goal: goals.carbs, unit: 'جرام', color: 'bg-orange-500' },
        { name: 'دهون', value: totals.fat, goal: goals.fat, unit: 'جرام', color: 'bg-amber-500' },
    ];

    const caloriePercent = goals.calories > 0 ? (totals.calories / goals.calories) * 100 : 0;

    return (
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg ring-1 ring-white/10">
            <h2 className="text-2xl font-bold mb-4 text-white">ملخص اليوم</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center">
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4a5568" strokeWidth="3" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4f46e5" strokeWidth="3" strokeDasharray={`${caloriePercent}, 100`} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-white">{Math.round(totals.calories)}</span>
                            <span className="text-sm text-gray-400">/{goals.calories} سعرة</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    {macroInfo.map(macro => (
                        <div key={macro.name}>
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="font-semibold text-gray-300">{macro.name}</span>
                                <span className="text-sm text-gray-400">{Math.round(macro.value)} / {macro.goal}{macro.unit}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div className={`${macro.color} h-2.5 rounded-full`} style={{ width: `${Math.min(100, (macro.value / (macro.goal || 1)) * 100)}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AddFoodModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    foodDatabase: FoodItem[];
    onLogFood: (foodId: string, servings: number) => void;
    onAddNewFood: () => void;
}> = ({ isOpen, onClose, foodDatabase, onLogFood, onAddNewFood }) => {
    const [selectedFoodId, setSelectedFoodId] = useState<string>('');
    const [servings, setServings] = useState('1');

    React.useEffect(() => {
        if (isOpen && foodDatabase.length > 0) {
            setSelectedFoodId(foodDatabase[0].id);
        } else if (isOpen) {
            setSelectedFoodId('');
        }
    }, [isOpen, foodDatabase]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const servingsNum = parseFloat(servings);
        if (!selectedFoodId || isNaN(servingsNum) || servingsNum <= 0) {
            alert("بيانات غير صالحة.");
            return;
        }
        onLogFood(selectedFoodId, servingsNum);
        onClose();
    };
    
    const selectedFood = foodDatabase.find(f => f.id === selectedFoodId);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">إضافة طعام</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">اختر من قاعدة البيانات</label>
                        <select value={selectedFoodId} onChange={e => setSelectedFoodId(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded-lg" disabled={foodDatabase.length === 0}>
                           {foodDatabase.length > 0 ? (
                                foodDatabase.map(food => <option key={food.id} value={food.id}>{food.name}</option>)
                           ) : (
                               <option>قاعدة البيانات فارغة</option>
                           )}
                        </select>
                         <button type="button" onClick={onAddNewFood} className="text-sm text-blue-400 hover:underline mt-2">...أو أضف عنصرًا جديدًا لقاعدة البيانات</button>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">الكمية ({selectedFood?.servingSize || 'حصص'})</label>
                        <input type="number" step="0.1" min="0.1" value={servings} onChange={e => setServings(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded-lg" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg">إلغاء</button>
                        <button type="submit" className="px-4 py-2 bg-emerald-600 rounded-lg" disabled={!selectedFoodId}>إضافة</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main Component ---
interface DietPageProps {
    goals: NutritionGoals;
    foodDatabase: FoodItem[];
    dailyLogs: DailyDietLog;
    onLogFood: (date: string, meal: MealType, foodId: string, servings: number) => void;
    onRemoveLoggedFood: (date: string, meal: MealType, loggedFoodId: string) => void;
    onAddFoodToDatabase: (food: Omit<FoodItem, 'id'>) => FoodItem;
}

export const DietPage: React.FC<DietPageProps> = ({ goals, foodDatabase, dailyLogs, onLogFood, onRemoveLoggedFood, onAddFoodToDatabase }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [addingFoodTo, setAddingFoodTo] = useState<MealType | null>(null);
    const [isManageFoodModalOpen, setIsManageFoodModalOpen] = useState(false);

    const selectedDateStr = toYMD(selectedDate);
    const dayLog = dailyLogs[selectedDateStr] || {};

    const totals = useMemo(() => {
        const result = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        Object.values(dayLog).flat().forEach(loggedFood => {
            const foodItem = foodDatabase.find(f => f.id === loggedFood.foodId);
            if (foodItem) {
                result.calories += foodItem.calories * loggedFood.servings;
                result.protein += foodItem.protein * loggedFood.servings;
                result.carbs += foodItem.carbs * loggedFood.servings;
                result.fat += foodItem.fat * loggedFood.servings;
            }
        });
        return result;
    }, [dayLog, foodDatabase]);

    const changeDate = (amount: number) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + amount);
            return newDate;
        });
    };
    
    const mealTitles: Record<MealType, string> = {
        breakfast: '🍳 الفطور',
        lunch: '🍽️ الغداء',
        dinner: '🌙 العشاء',
        snacks: '🍏 وجبات خفيفة',
    };

    const handleAddNewFood = () => {
        setAddingFoodTo(null);
        setIsManageFoodModalOpen(true);
    };
    
    const handleSaveNewFood = (foodData: Omit<FoodItem, 'id'> | FoodItem) => {
        if (!('id' in foodData)) {
            onAddFoodToDatabase(foodData);
        }
    };

    return (
        <div className="space-y-8">
             <div className="flex justify-between items-center bg-gray-800 p-4 rounded-2xl">
                 <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeftIcon /></button>
                 <h2 className="text-xl font-bold">{selectedDate.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', calendar: 'gregory' })}</h2>
                 <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronRightIcon /></button>
             </div>
             
             <TotalsSummary totals={totals} goals={goals} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(Object.keys(mealTitles) as MealType[]).map(meal => (
                    <div key={meal} className="bg-gray-800 p-4 rounded-2xl ring-1 ring-white/10">
                        <h3 className="text-lg font-bold mb-3">{mealTitles[meal]}</h3>
                        <div className="space-y-2 mb-3">
                            {(dayLog[meal] || []).map(loggedFood => {
                                const foodItem = foodDatabase.find(f => f.id === loggedFood.foodId);
                                if (!foodItem) return null;
                                return (
                                    <div key={loggedFood.id} className="flex justify-between items-center bg-gray-700/50 p-2 rounded-lg text-sm">
                                        <div>
                                            <p className="font-semibold text-white">{foodItem.name}</p>
                                            <p className="text-gray-400">{loggedFood.servings} × {foodItem.servingSize} • {Math.round(foodItem.calories * loggedFood.servings)} سعرة</p>
                                        </div>
                                        <button onClick={() => onRemoveLoggedFood(selectedDateStr, meal, loggedFood.id)} className="p-1 text-red-400 hover:text-red-300"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                );
                            })}
                        </div>
                        <button onClick={() => setAddingFoodTo(meal)} className="w-full flex items-center justify-center gap-2 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                            <PlusCircleIcon className="w-5 h-5" /> أضف طعام
                        </button>
                    </div>
                ))}
            </div>
            
            <AddFoodModal 
                isOpen={!!addingFoodTo}
                onClose={() => setAddingFoodTo(null)}
                foodDatabase={foodDatabase}
                onLogFood={(foodId, servings) => {
                    if (addingFoodTo) onLogFood(selectedDateStr, addingFoodTo, foodId, servings);
                }}
                onAddNewFood={handleAddNewFood}
            />

            {isManageFoodModalOpen && (
                <ManageFoodItemModal
                    isOpen={isManageFoodModalOpen}
                    onClose={() => setIsManageFoodModalOpen(false)}
                    onSave={handleSaveNewFood}
                />
            )}
        </div>
    );
};