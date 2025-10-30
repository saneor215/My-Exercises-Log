
import React, { useState, useCallback } from 'react';
import { WorkoutInputForm } from './components/WorkoutInputForm';
import { WorkoutLog } from './components/WorkoutLog';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { WorkoutEntry, BodyPart, Exercise, BodyPartId, WorkoutRoutine } from './types';
import { INITIAL_EXERCISES, INITIAL_BODY_PARTS } from './constants';
import { Navigation } from './components/Navigation';
import { CalendarPage } from './components/CalendarPage';
import { DietPage } from './components/DietPage';
import { SettingsPage } from './components/SettingsPage';
import { ProgressPage } from './components/ProgressPage';

type View = 'log' | 'calendar' | 'progress' | 'diet' | 'settings';

const initialDietPlan = `برنامجك الغذائي (النسخة الأخف – 1850–1900 سعرة)
________________________________________
🍳 الفطور – 6:00 صباحاً
•	6 جم كولاجين + ملعقة صغيرة عسل على الريق
•	3 بيضات (مسلوقة أو مقلية خفيفة)
•	نصف حبة خبز بر أو شريحة توست بر محمصة + ملعقة صغيرة زيت زيتون
•	كوب قهوة (16 أونصة ≈ 470 مل) بدون سكر
•	ماء كثير
________________________________________
🍏 وجبة خفيفة – 12:00 ظهراً
•	موزة (ثابتة)
•	تفاحة أو برتقالة (تبديل يومي)
________________________________________
🥜 الوجبة الثانية – 3:00 عصراً
•	حفنة مكسرات صغيرة (7–10 جم: لوز – جوز – كاجو)
•	ملعقتين كبار سمسم
________________________________________
🍽️ الوجبة الرئيسية – 6:00 مساءً
•	6 ملاعق كبار رز أسمر مطبوخ
•	صدر دجاج متوسط أو فخذ مشوي
•	صحن سلطة كبير (خضار + ورقيات) + ملعقة صغيرة زيت زيتون
•	7 ملاعق إدام (شفوت/بامية/فاصوليا/عدس)
•	نصف حبة بطاطا حلوة (يوم ويوم)
•	كأس شاي أخضر
________________________________________
🏋️ 8:00 مساءً – التمرين
________________________________________
🌙 بعد التمرين – 10:00 مساءً
•	زبادي أو لبن (حسب المتوفر)
•	صحن صغير رز مع إدام أو سلطة
•	ممكن تونة بدل الزبادي بين يوم ويوم، مو شرط يومياً
________________________________________
إجمالي يومي تقريبي:
•	السعرات: 1850–1900 سعرة
•	البروتين: 130–140 جم (ممتاز يحافظ على عضلاتك)
•	الكارب: 160–170 جم (معتدل → يساعدك تخسر دهون البطن بدون ضعف)
•	الدهون: 55–60 جم (دهون صحية متوازنة)
•	الفيتامينات والمعادن:
o	فيتامين C ✅ (فواكه + خضار)
o	ماغنيسيوم ✅ (مكسرات + ورقيات)
o	كالسيوم ✅ (بيض + زبادي)
o	أوميغا 3 ❌ ناقص (الحل: سمك/تونة مرتين بالأسبوع أو مكمل)
o	فيتامين D ❌ ناقص (الحل: شمس 10–15 دقيقة أو مكمل)
________________________________________
•	📌 الخلاصة:
•	الخلاصة: برنامجك ممتاز لحرق دهون البطن والخواصر بدون ما ينشف وجهك أو يخرب شكلك.
❌ لا ترجع للكرياتين حالياً. ركّز على البروتين من البيض + الدجاج + الزبادي + السمسم والمكسرات.`;

export default function App(): React.ReactElement {
  const [log, setLog] = useLocalStorage<WorkoutEntry[]>('workoutLog_categorized_react_v2', []);
  const [dietPlan, setDietPlan] = useLocalStorage<string>('workoutDietPlan_react_v2', initialDietPlan);
  const [bodyParts, setBodyParts] = useLocalStorage<BodyPart[]>('workout_bodyParts_v2', INITIAL_BODY_PARTS);
  const [exercises, setExercises] = useLocalStorage<Record<BodyPartId, Exercise[]>>('workout_exercises_v2', INITIAL_EXERCISES);
  const [routines, setRoutines] = useLocalStorage<WorkoutRoutine[]>('workoutRoutines_v1', []);

  const [showIntro, setShowIntro] = useState(log.length === 0);
  const [activeView, setActiveView] = useState<View>('log');

  const addEntry = useCallback((entry: Omit<WorkoutEntry, 'id' | 'date' | 'image'>) => {
    const exerciseDetails = exercises[entry.part]?.find(e => e.name === entry.exercise);
    const newEntry: WorkoutEntry = {
      ...entry,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      image: exerciseDetails?.image || 'https://picsum.photos/seed/placeholder/100/100'
    };
    setLog(prevLog => [newEntry, ...prevLog]);
    setShowIntro(false);
  }, [setLog, exercises]);
  
  const addMultipleEntries = useCallback((entries: Omit<WorkoutEntry, 'id' | 'date' | 'image'>[]) => {
    const newEntries: WorkoutEntry[] = entries.map(entry => {
        const exerciseDetails = exercises[entry.part]?.find(e => e.name === entry.exercise);
        return {
            ...entry,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            image: exerciseDetails?.image || 'https://picsum.photos/seed/placeholder/100/100'
        };
    });
    setLog(prevLog => [...newEntries, ...prevLog]);
    setShowIntro(false);
  }, [setLog, exercises]);

  const deleteEntry = useCallback((id: string) => {
    setLog(prevLog => {
        const updatedLog = prevLog.filter(entry => entry.id !== id);
        if (updatedLog.length === 0) {
            setShowIntro(true);
        }
        return updatedLog;
    });
  }, [setLog]);
  
  const updateEntry = useCallback((updatedEntry: WorkoutEntry) => {
    setLog(prevLog => prevLog.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
  }, [setLog]);

  const clearLog = useCallback(() => {
    setLog([]);
    setShowIntro(true);
  }, [setLog]);

  const importData = useCallback((data: { log: WorkoutEntry[], dietPlan: string }) => {
    try {
        if (!data || !Array.isArray(data.log) || typeof data.dietPlan !== 'string') {
            throw new Error("Invalid data structure.");
        }
        setLog(data.log);
        setDietPlan(data.dietPlan);
        setShowIntro(data.log.length === 0);
        alert('تم استيراد البيانات بنجاح!');
    } catch (error) {
        console.error("Import failed:", error);
        alert(`فشل الاستيراد: ${error.message}`);
    }
  }, [setLog, setDietPlan]);
  
  const addRoutine = useCallback((routine: Omit<WorkoutRoutine, 'id'>) => {
    const newRoutine = { ...routine, id: crypto.randomUUID() };
    setRoutines(prev => [...prev, newRoutine]);
  }, [setRoutines]);

  const updateRoutine = useCallback((updatedRoutine: WorkoutRoutine) => {
      setRoutines(prev => prev.map(r => r.id === updatedRoutine.id ? updatedRoutine : r));
  }, [setRoutines]);

  const deleteRoutine = useCallback((id: string) => {
      setRoutines(prev => prev.filter(r => r.id !== id));
  }, [setRoutines]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Navigation activeView={activeView} onNavigate={setActiveView} />

        <div className="mt-2">
           {activeView === 'log' && (
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                  <WorkoutInputForm 
                    onAddEntry={addEntry}
                    bodyParts={bodyParts}
                    exercises={exercises}
                    routines={routines}
                    onAddMultipleEntries={addMultipleEntries}
                  />
                </div>
                <div className="lg:col-span-3">
                  <WorkoutLog 
                    log={log} 
                    onDeleteEntry={deleteEntry} 
                    onUpdateEntry={updateEntry} 
                    onClearLog={clearLog} 
                    showIntro={showIntro}
                    onImportData={importData}
                    bodyParts={bodyParts}
                    exercises={exercises}
                   />
                </div>
              </div>
           )}
           {activeView === 'calendar' && (
              <CalendarPage 
                log={log} 
                onDeleteEntry={deleteEntry} 
                onUpdateEntry={updateEntry}
                bodyParts={bodyParts}
                exercises={exercises}
              />
           )}
           {activeView === 'progress' && (
              <ProgressPage 
                log={log}
                bodyParts={bodyParts}
                exercises={exercises}
              />
           )}
           {activeView === 'diet' && <DietPage content={dietPlan} onSave={setDietPlan} />}
           {activeView === 'settings' && (
              <SettingsPage
                bodyParts={bodyParts}
                setBodyParts={setBodyParts}
                exercises={exercises}
                setExercises={setExercises}
                routines={routines}
                addRoutine={addRoutine}
                updateRoutine={updateRoutine}
                deleteRoutine={deleteRoutine}
              />
           )}
        </div>
      </div>
    </div>
  );
}