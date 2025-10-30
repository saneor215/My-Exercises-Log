import React, { useState, useMemo } from 'react';
import { PencilIcon, SaveIcon } from './Icons';

interface DietPageProps {
  content: string;
  onSave: (newContent: string) => void;
}

export const DietPage: React.FC<DietPageProps> = ({ content, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(content);

  const handleSave = () => {
    onSave(editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(content);
    setIsEditing(false);
  };

  const formattedContent = useMemo(() => {
    return content.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('🍳') || trimmedLine.startsWith('🍏') || trimmedLine.startsWith('🥜') || trimmedLine.startsWith('🍽️') || trimmedLine.startsWith('🏋️') || trimmedLine.startsWith('🌙') || trimmedLine.startsWith('•	📌')) {
        return <p key={index} className="text-xl font-bold text-yellow-300 mt-4 mb-2">{line}</p>;
      }
      if (trimmedLine.startsWith('•')) {
        return <p key={index} className="ml-4 mb-1">{line}</p>;
      }
      if (trimmedLine.startsWith('__')) {
        return <hr key={index} className="border-gray-700 my-4" />;
      }
      return <p key={index}>{line}</p>;
    });
  }, [content]);

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg ring-1 ring-white/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">البرنامج الغذائي</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-400"
          >
            <PencilIcon className="w-5 h-5" />
            <span>تعديل</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full h-96 bg-gray-900 border border-gray-700 text-gray-200 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            style={{ direction: 'rtl', textAlign: 'right' }}
          />
          <div className="flex justify-end gap-4">
            <button
              onClick={handleCancel}
              className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <SaveIcon className="w-5 h-5" />
              <span>حفظ التغييرات</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
          {formattedContent}
        </div>
      )}
    </div>
  );
};
