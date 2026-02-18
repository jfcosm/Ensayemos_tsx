import React, { useState } from 'react';
import { Button } from './Button';
import { ArrowLeft, Calendar, Clock, MapPin, Music2, Save } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CreateRehearsalProps {
  onSave: (data: { title: string; date: string; time: string; location: string }) => void;
  onCancel: () => void;
}

export const CreateRehearsal: React.FC<CreateRehearsalProps> = ({ onSave, onCancel }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time || !location) {
      alert('Por favor completa todos los campos.');
      return;
    }
    
    setIsSubmitting(true);
    try {
        await onSave({ title, date, time, location });
        // --- AQUÍ ESTÁ LA CORRECCIÓN ---
        setIsSubmitting(false);
        onCancel();
        // -------------------------------
    } catch (err) {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={onCancel} 
          className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
        >
          <ArrowLeft className="text-zinc-500 dark:text-zinc-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('new_rehearsal_title')}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">{t('new_rehearsal_subtitle')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 md:p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t('field_title')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Music2 className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-zinc-200 dark:border-zinc-700 rounded-lg leading-5 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors"
                autoFocus
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('field_date')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('field_time')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t('field_location')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-zinc-200 dark:border-zinc-700 rounded-lg leading-5 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="gap-2" isLoading={isSubmitting}>
              <Save size={18} />
              {t('save')}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};