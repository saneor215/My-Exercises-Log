import React, { useState, useEffect } from 'react';
import type { FoodItem } from '../types';

interface ManageFoodItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (food: Omit<FoodItem, 'id'> | FoodItem) => void;
    itemToEdit?: FoodItem;
}

export const ManageFoodItemModal: React.FC<ManageFoodItemModalProps> = ({ isOpen, onClose, onSave, itemToEdit }) => {
    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');
    const [servingSize, setServingSize] = useState('');

    useEffect(() => {
        if (itemToEdit) {
            setName(itemToEdit.name);
            setCalories(String(itemToEdit.calories));
            setProtein(String(itemToEdit.protein));
            setCarbs(String(itemToEdit.carbs));
            setFat(String(itemToEdit.fat));
            setServingSize(itemToEdit.servingSize);
        } else {
            setName(''); setCalories(''); setProtein(''); setCarbs(''); setFat(''); setServingSize('');
        }
    }, [itemToEdit, isOpen]);
    
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const foodData = {
            name: name.trim(),
            calories: parseFloat(calories),
            protein: parseFloat(protein),
            carbs: parseFloat(carbs),
            fat: parseFloat(fat),
            servingSize: servingSize.trim()
        };
        // Basic validation
        if (!foodData.name || isNaN(foodData.calories) || isNaN(foodData.protein) || isNaN(foodData.carbs) || isNaN(foodData.fat) || !foodData.servingSize) {
            alert('يرجى ملء جميع الحقول بأرقام صالحة.');
            return;
        }
        if (itemToEdit) {
            onSave({ ...foodData, id: itemToEdit.id });
        } else {
            onSave(foodData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">{itemToEdit ? 'تعديل عنصر' : 'إضافة عنصر جديد'}</h2>
                <div className="space-y-4">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="اسم الطعام (مثال: صدر دجاج)" className="w-full bg-gray-700 text-white p-2 rounded-lg" required/>
                    <input value={servingSize} onChange={e => setServingSize(e.target.value)} placeholder="حجم الحصة (مثال: 100g)" className="w-full bg-gray-700 text-white p-2 rounded-lg" required/>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" step="0.1" min="0" value={calories} onChange={e => setCalories(e.target.value)} placeholder="السعرات" className="w-full bg-gray-700 text-white p-2 rounded-lg" required/>
                        <input type="number" step="0.1" min="0" value={protein} onChange={e => setProtein(e.target.value)} placeholder="البروتين (g)" className="w-full bg-gray-700 text-white p-2 rounded-lg" required/>
                        <input type="number" step="0.1" min="0" value={carbs} onChange={e => setCarbs(e.target.value)} placeholder="الكربوهيدرات (g)" className="w-full bg-gray-700 text-white p-2 rounded-lg" required/>
                        <input type="number" step="0.1" min="0" value={fat} onChange={e => setFat(e.target.value)} placeholder="الدهون (g)" className="w-full bg-gray-700 text-white p-2 rounded-lg" required/>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg">إلغاء</button>
                    <button type="submit" className="px-4 py-2 bg-emerald-600 rounded-lg">حفظ</button>
                </div>
            </form>
        </div>
    );
};
