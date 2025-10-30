import React, { useState, useMemo } from 'react';
import type { WorkoutEntry, BodyPart, Exercise, BodyPartId } from '../types';
import { CalendarView } from './CalendarView';
import { LogItem } from './LogItem';
import { EditWorkoutModal } from './EditWorkoutModal';
import { ImageModal } from './ImageModal';


interface CalendarPageProps {
  log: WorkoutEntry[];
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (entry: WorkoutEntry) => void;
  bodyParts: BodyPart[];
  exercises: Record<BodyPartId, Exercise[]>;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ log, onDeleteEntry, onUpdateEntry, bodyParts, exercises }) => {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [editingEntry, setEditingEntry] = useState<WorkoutEntry | null>(null);
    const [viewingImage, setViewingImage] = useState<{src: string; alt: string} | null>(null);
    
    const filteredLog = useMemo(() => {
        if (!selectedDate) return [];
        
        // selectedDate is "YYYY-MM-DD". We need to find all log entries
        // that fall within this local day.
        const [year, month, day] = selectedDate.split('-').map(Number);

        // Create date objects for start and end of day using the user's local timezone
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
        
        return log.filter(entry => {
            const entryDate = new Date(entry.date); // Parses the ISO string correctly
            // Check if the entry's date falls within the 24-hour window of the selected local day
            return entryDate >= startOfDay && entryDate <= endOfDay;
        });
    }, [log, selectedDate]);

    const handleUpdate = (updatedEntry: WorkoutEntry) => {
        onUpdateEntry(updatedEntry);
        setEditingEntry(null);
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
                log={log}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
            />

            {selectedDate && (
                <div className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg ring-1 ring-white/10">
                    <h3 className="font-bold text-xl text-gray-200 mb-4">
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
