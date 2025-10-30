
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { WorkoutEntry, BodyPartId, BodyPart, Exercise } from '../types';
import { LogItem } from './LogItem';
import { Modal } from './Modal';
import { ImageModal } from './ImageModal';
import { EditWorkoutModal } from './EditWorkoutModal';
import { ClearIcon, CsvIcon, ActivityIcon, ImportIcon, ExportIcon } from './Icons';

interface WorkoutLogProps {
  log: WorkoutEntry[];
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (entry: WorkoutEntry) => void;
  onClearLog: () => void;
  showIntro: boolean;
  onImportData: (data: { log: WorkoutEntry[]; dietPlan: string }) => void;
  bodyParts: BodyPart[];
  exercises: Record<BodyPartId, Exercise[]>;
}

export const WorkoutLog: React.FC<WorkoutLogProps> = ({ log, onDeleteEntry, onUpdateEntry, onClearLog, showIntro, onImportData, bodyParts, exercises }) => {
  const [partFilter, setPartFilter] = useState<BodyPartId | 'all'>('all');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkoutEntry | null>(null);
  const [viewingImage, setViewingImage] = useState<{src: string; alt: string} | null>(null);
  const importedDataRef = useRef<null | { log: WorkoutEntry[]; dietPlan: string }>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const availableWeeks = useMemo(() => {
    return Array.from(new Set(validLog.map(entry => entry.week))).sort((a, b) => Number(a) - Number(b));
  }, [validLog]);
  
  const [weekFilter, setWeekFilter] = useState<'all' | string>(() => {
    if (validLog.length > 0) {
      return String(Math.max(...validLog.map(entry => entry.week)));
    }
    return 'all';
  });

  const prevLogLengthRef = useRef(validLog.length);

  useEffect(() => {
    const latestWeek = availableWeeks.length > 0 ? String(availableWeeks[availableWeeks.length - 1]) : null;

    const logJustPopulated = prevLogLengthRef.current === 0 && validLog.length > 0;
    const isFilterStale = weekFilter !== 'all' && !availableWeeks.map(String).includes(weekFilter);

    if (logJustPopulated || isFilterStale) {
      setWeekFilter(latestWeek || 'all');
    }

    prevLogLengthRef.current = validLog.length;
  }, [validLog, weekFilter, availableWeeks]);


  const filteredLog = useMemo(() => {
    return validLog.filter(entry => {
        const partMatch = partFilter === 'all' || entry.part === partFilter;
        const weekMatch = weekFilter === 'all' || entry.week.toString() === weekFilter;
        return partMatch && weekMatch;
    });
  }, [validLog, partFilter, weekFilter]);

  const handleClear = () => {
    onClearLog();
    setIsClearModalOpen(false);
  };
  
  const handleUpdate = (updatedEntry: WorkoutEntry) => {
    onUpdateEntry(updatedEntry);
    setEditingEntry(null);
  };

  const handleExport = () => {
    try {
      const dietPlan = window.localStorage.getItem('workoutDietPlan_react');
      
      if (log.length === 0 && (!dietPlan || dietPlan === '""')) {
        alert("لا توجد بيانات للتصدير.");
        return;
      }

      const dataToExport = {
        log: log,
        dietPlan: dietPlan ? JSON.parse(dietPlan) : '',
      };

      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `workout-log-backup-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("حدث خطأ أثناء تصدير البيانات.");
    }
  };
  
  const triggerImport = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("محتوى الملف غير نصي.");
        const data = JSON.parse(text);

        if (data && typeof data.dietPlan === 'string' && Array.isArray(data.log)) {
          if (data.log.length > 0) {
             const firstItem = data.log[0];
             if (typeof firstItem.id !== 'string' || typeof firstItem.exercise !== 'string' || typeof firstItem.weight !== 'number') {
                throw new Error("بنية بيانات السجل غير صالحة.");
             }
          }
          importedDataRef.current = data;
          setIsImportModalOpen(true);
        } else {
          throw new Error("بنية الملف غير صالحة.");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير معروف";
        console.error("Error importing file:", error);
        alert(`فشل استيراد الملف. تأكد من أنه ملف JSON صالح. الخطأ: ${errorMessage}`);
      } finally {
        if (event.target) event.target.value = '';
      }
    };
    reader.onerror = () => {
      alert('فشل قراءة الملف.');
      if (event.target) event.target.value = '';
    };
    reader.readAsText(file);
  };
  
  const confirmImport = () => {
    if (importedDataRef.current) {
      onImportData(importedDataRef.current);
    }
    setIsImportModalOpen(false);
    importedDataRef.current = null;
  };

  const exportCSV = () => {
    if (validLog.length === 0) {
      alert("لا يوجد بيانات للتصدير");
      return;
    }
    const headers = ["الأسبوع", "الجزء", "التمرين", "الوزن (كجم)", "التكرارات", "التاريخ", "تعليق"];
    const rows = validLog.map(entry => {
        const partName = bodyParts.find(p => p.id === entry.part)?.name || entry.part;
        return [
            entry.week,
            partName, 
            entry.exercise, 
            entry.weight, 
            entry.reps, 
            new Date(entry.date).toLocaleString('ar-SA', { calendar: 'gregory' }),
            entry.comment || ''
        ];
    });

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "workout_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg ring-1 ring-white/10 h-full flex flex-col">
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".json"
        className="hidden"
        aria-hidden="true"
      />
      <h3 className="text-2xl font-bold mb-4 text-gray-200">📊 السجل</h3>
      
      {validLog.length > 0 && (
          <div className="space-y-4 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-400 mr-2">فلترة الجزء:</span>
              <button
                onClick={() => setPartFilter('all')}
                className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 ${
                    partFilter === 'all'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                الكل
              </button>
              {bodyParts.map(part => (
                <button
                  key={part.id}
                  onClick={() => setPartFilter(part.id)}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                    partFilter === part.id
                      ? `bg-gradient-to-r ${part.gradient} text-white shadow-md ring-2 ring-offset-2 ring-offset-gray-800 ring-${part.color}-400`
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {part.icon} {part.name}
                </button>
              ))}
            </div>

            <div>
                <label htmlFor="week-filter-select" className="sr-only">تصفية حسب الأسبوع</label>
                <div className="relative">
                    <select
                        id="week-filter-select"
                        value={weekFilter}
                        onChange={e => setWeekFilter(e.target.value)}
                        className="w-full bg-gray-700 border-gray-600 text-white pl-3 pr-10 py-2 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow disabled:opacity-50"
                        disabled={availableWeeks.length === 0}
                    >
                        <option value="all">كل الأسابيع</option>
                        {availableWeeks.map(week => <option key={week} value={week}>الأسبوع {week}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-2">
                <button onClick={handleExport} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 shadow-md">
                    <ExportIcon className="w-5 h-5"/> <span>تصدير</span>
                </button>
                <button onClick={triggerImport} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 shadow-md">
                    <ImportIcon className="w-5 h-5"/> <span>استيراد</span>
                </button>
                <button onClick={exportCSV} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 shadow-md">
                    <CsvIcon className="w-5 h-5"/> <span>CSV</span>
                </button>
                <button onClick={() => setIsClearModalOpen(true)} className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-3 rounded-lg transition-all duration-300 shadow-md">
                    <ClearIcon className="w-5 h-5"/> <span>مسح الكل</span>
                </button>
            </div>
          </div>
      )}

      {showIntro || validLog.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 p-8 border-2 border-dashed border-gray-700 rounded-xl">
            <ActivityIcon className="w-16 h-16 mb-4"/>
            <h4 className="text-xl font-bold text-gray-400">السجل فارغ</h4>
            <p>ابدأ بإضافة تمرينك الأول من النموذج.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
            {filteredLog.length > 0 ? filteredLog.map(entry => (
                <LogItem 
                    key={entry.id} 
                    entry={entry}
                    bodyParts={bodyParts}
                    onDelete={onDeleteEntry}
                    onEditRequest={setEditingEntry}
                    onImageClick={setViewingImage}
                />
            )) : (
                <div className="text-center text-gray-500 py-10">
                    "لا توجد تمارين تطابق هذا الفلتر."
                </div>
            )}
        </div>
      )}

      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClear}
        title="تأكيد المسح"
        confirmText="نعم, امسح الكل"
        cancelText="إلغاء"
      >
        <p>هل أنت متأكد أنك تريد مسح جميع سجلات التمارين؟ لا يمكن التراجع عن هذا الإجراء.</p>
      </Modal>

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onConfirm={confirmImport}
        title="تأكيد استيراد البيانات"
        confirmText="نعم، استبدل البيانات الحالية"
        cancelText="إلغاء"
      >
        <p>سيؤدي هذا إلى استبدال جميع بياناتك الحالية (السجل والنظام الغذائي) بالبيانات الموجودة في الملف. هل تريد المتابعة؟</p>
      </Modal>
      
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
