import React, { useState, useEffect } from 'react';
import { Student, StudentFormData, Gender } from '../types';

interface StudentFormProps {
  initialData?: Student | null;
  onSubmit: (data: StudentFormData) => void;
  onCancel: () => void;
}

const emptyForm: StudentFormData = {
  studentNo: '',
  fullName: '',
  gender: Gender.Male,
  scores: { t1: 0, t2: 0, t3: 0, t4: 0, t5: 0 }
};

export const StudentForm: React.FC<StudentFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<StudentFormData>(emptyForm);

  useEffect(() => {
    if (initialData) {
      const { id, average, createdAt, ...rest } = initialData;
      setFormData(rest);
    } else {
      setFormData(emptyForm);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let numValue = Number(value);
    
    if (numValue < 0) numValue = 0;
    if (numValue > 100) numValue = 100;

    setFormData(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [name]: numValue
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Öğrenci No</label>
          <input
            required
            type="text"
            name="studentNo"
            value={formData.studentNo}
            onChange={handleChange}
            placeholder="Örn: 123"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
          <input
            required
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Örn: Ahmet Yılmaz"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
          >
            {Object.values(Gender).map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Temrin Puanları (0-100)</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num}>
              <label className="block text-xs font-medium text-gray-600 mb-1">Temrin {num}</label>
              <input
                type="number"
                min="0"
                max="100"
                name={`t${num}`}
                value={formData.scores[`t${num}` as keyof typeof formData.scores]}
                onChange={handleScoreChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-center font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
        >
          İptal
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm hover:shadow transition-all"
        >
          {initialData ? 'Güncelle' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
};