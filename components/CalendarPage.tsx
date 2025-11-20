
import React, { useState, useMemo } from 'react';
import type { WorkoutEntry, BodyPart, Exercise, BodyPartId, WeeklySchedule, WorkoutRoutine } from '../types';
import { CalendarView } from './CalendarView';
import { LogItem } from './LogItem';
import { EditWorkoutModal } from './EditWorkoutModal';
import { ImageModal } from './ImageModal';
import { ClipboardPlusIcon } from './Icons';


interface CalendarPageProps {
  log: WorkoutEntry[];
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (entry: WorkoutEntry) => void;
  onAddMultipleEntries: (entries: (Omit<WorkoutEntry, 'id' | 'date' | 'image'> & { date?: string })[]) => void;
  bodyParts: BodyPart[];
  exercises: Record<BodyPartId, Exercise[]>;
  weeklySchedule?: WeeklySchedule;
  routines?: WorkoutRoutine[];
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ log, onDeleteEntry, onUpdateEntry, onAddMultipleEntries, bodyParts, exercises, weeklySchedule, routines }) => {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [editingEntry, setEditingEntry] = useState<WorkoutEntry | null>(null);
    const [viewingImage, setViewingImage] = useState<{src: string; alt: string} | null>(null);
    
    const validLog = useMemo(() => {
        return log.filter(entry => 
            entry && 
            typeof entry === 'object' &&
            entry.id &&
            entry.part &&
            entry.exercise &&
            typeof entry.weight === 'number' &&
            typeof entry.reps === 'number' &&
            typeof entry.week === 'number' &&
            entry.date
        );
    }, [log]);

    const filteredLog = useMemo(() => {
        if (!selectedDate) return [];
        
        // selectedDate is "YYYY-MM-DD". We need to find all log entries
        // that fall within this local day.
        const [year, month, day] = selectedDate.split('-').map(Number);

        // Create date objects for start and end of day using the user's local timezone
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
        
        return validLog.filter(entry => {
            const entryDate = new Date(entry.date); // Parses the ISO string correctly
            // Check if the entry's date falls within the 24-hour window of the selected local day
            return entryDate >= startOfDay && entryDate <= endOfDay;
        });
    }, [validLog, selectedDate]);
    
    // Determine if there is a scheduled routine for the selected date
    const scheduledRoutineForSelectedDate = useMemo(() => {
        if (!selectedDate || !weeklySchedule || !routines) return null;
        const [year, month, day] = selectedDate.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dayIndex = dateObj.getDay().toString();
        
        const routineId = weeklySchedule[dayIndex];
        if (!routineId) return null;
        
        return routines.find(r => r.id === routineId) || null;
    }, [selectedDate, weeklySchedule, routines]);

    const handleUpdate = (updatedEntry: WorkoutEntry) => {
        onUpdateEntry(updatedEntry);
        setEditingEntry(null);
    };

    const handleLogScheduledRoutine = () => {
        if (!scheduledRoutineForSelectedDate || !selectedDate) return;
        
        const weekStr = prompt('الرجاء إدخال رقم الأسبوع لهذا السجل:', '1');
        const weekNum = parseInt(weekStr || '', 10);
        if (!weekStr || isNaN(weekNum)) return;

        // Construct an ISO date string that corresponds to the selected date
        // We'll use 12:00 PM on that date to avoid timezone edge cases
        const dateToLog = new Date(selectedDate + 'T12:00:00').toISOString();

        const entries = scheduledRoutineForSelectedDate.exercises.map(ex => {
             // Smart Lookup logic similar to WorkoutInputForm
             const history = log.filter(e => e.exercise === ex.exerciseName);
             history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
             const lastEntry = history[0];

             return {
                part: ex.partId,
                exercise: ex.exerciseName,
                weight: lastEntry ? lastEntry.weight : 0,
                reps: lastEntry ? lastEntry.reps : 0,
                week: weekNum,
                comment: 'تم التسجيل تلقائياً من التقويم',
                date: dateToLog
            };
        });

        onAddMultipleEntries(entries);
        alert(`تم تسجيل تمارين "${scheduledRoutineForSelectedDate.name}" ليوم ${selectedDate}.`);
    };

    const formattedSelectedDate = useMemo(() => {
        if (!selectedDate) return '';
        // Parse the 'YYYY-MM-DD' string as a local date by adding T00:00:00.
        // This prevents the browser from interpreting it as UTC midnight.
        const date = new Date(selectedDate + 'T00:00:00');
        return date.toLocaleDateString('ar-EG', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            calendar: 'gregory',
        }); // Uses browser's default timezone for correct display
    }, [selectedDate]);

    return (
        <div className="space-y-8">
            <CalendarView 
                log={validLog}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
            />

            {selectedDate && (
                <div className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg ring-1 ring-white/10">
                    <h3 className="font-bold text-2xl bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent mb-4">
                        تمارين يوم: {formattedSelectedDate}
                    </h3>
                    <div className="space-y-4">
                        {filteredLog.length > 0 ? (
                            filteredLog.map(entry => (
                                <LogItem 
                                    key={entry.id} 
                                    entry={entry}
                                    bodyParts={bodyParts}
                                    onDelete={onDeleteEntry}
                                    onEditRequest={setEditingEntry}
                                    onImageClick={setViewingImage}
                                />
                            ))
                        ) : scheduledRoutineForSelectedDate ? (
                            <div className="text-center p-8 border-2 border-dashed border-blue-500/30 bg-blue-900/10 rounded-xl">
                                <p className="text-lg font-bold text-blue-200 mb-2">جدول اليوم: {scheduledRoutineForSelectedDate.name}</p>
                                <p className="text-gray-400 mb-4">لم يتم تسجيل التمارين لهذا اليوم بعد. يحتوي الجدول على:</p>
                                <ul className="text-sm text-gray-300 space-y-1 mb-6 inline-block text-right dir-rtl">
                                    {scheduledRoutineForSelectedDate.exercises.map((ex, idx) => (
                                        <li key={idx}>• {ex.exerciseName}</li>
                                    ))}
                                </ul>
                                <div className="flex justify-center">
                                    <button 
                                        onClick={handleLogScheduledRoutine}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg"
                                    >
                                        <ClipboardPlusIcon className="w-5 h-5" />
                                        تسجيل هذا الجدول الآن
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 p-8 border-2 border-dashed border-gray-700 rounded-xl">
                                لا توجد تمارين مسجلة في هذا اليوم.
                            </div>
                        )}
                    </div>
                </div>
            )}
             {viewingImage && (
                <ImageModal 
                    src={viewingImage.src}
                    alt={viewingImage.alt}
                    onClose={() => setViewingImage(null)}
                />
            )}
            
            {editingEntry && (
                <EditWorkoutModal 
                    entry={editingEntry}
                    onUpdate={handleUpdate}
                    onClose={() => setEditingEntry(null)}
                    exercises={exercises}
                />
            )}
        </div>
    );
};
