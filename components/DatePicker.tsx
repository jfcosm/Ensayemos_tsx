import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
    value: string; // YYYY-MM-DD format
    onChange: (date: string) => void;
    className?: string;
}

const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days: Date[] = [];

    // Previous month padding
    const firstDay = date.getDay(); // 0 is Sunday
    const daysFromPrevMonth = firstDay === 0 ? 6 : firstDay - 1; // Start week on Monday
    for (let i = 0; i < daysFromPrevMonth; i++) {
        days.push(new Date(year, month, -daysFromPrevMonth + i + 1));
    }

    // Current month
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }

    // Next month padding
    const lastDay = days[days.length - 1].getDay();
    const daysFromNextMonth = lastDay === 0 ? 0 : 7 - lastDay;
    for (let i = 1; i <= daysFromNextMonth; i++) {
        days.push(new Date(year, month + 1, i));
    }

    return days;
};

const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Use T12:00:00 to avoid timezone offset issues when parsing YYYY-MM-DD
    const initialDate = value ? new Date(value + 'T12:00:00') : new Date();
    const [currentMonth, setCurrentMonth] = useState(initialDate);

    // Click outside listener
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleSelectDate = (date: Date) => {
        onChange(formatDate(date));
        setIsOpen(false);
    };

    const days = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const dayNames = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

    const selectedDateStr = value ? formatDate(new Date(value + 'T12:00:00')) : '';
    const todayStr = formatDate(new Date());

    const displayDate = value
        ? `${new Date(value + 'T12:00:00').getDate()} de ${monthNames[new Date(value + 'T12:00:00').getMonth()]} ${new Date(value + 'T12:00:00').getFullYear()}`
        : 'dd / mm / aaaa';

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-zinc-400" />
                    <span className={value ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}>
                        {displayDate}
                    </span>
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-[280px] sm:w-[320px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                        >
                            <ChevronLeft size={20} className="text-zinc-600 dark:text-zinc-400" />
                        </button>
                        <span className="font-medium text-zinc-900 dark:text-white capitalize">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </span>
                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                        >
                            <ChevronRight size={20} className="text-zinc-600 dark:text-zinc-400" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map(day => (
                            <div key={day} className="text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days.map((date, i) => {
                            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                            const dateStr = formatDate(date);
                            const isSelected = dateStr === selectedDateStr;
                            const isToday = dateStr === todayStr;

                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSelectDate(date)}
                                    className={`
                    w-8 sm:w-10 h-8 sm:h-10 mx-auto rounded-full flex items-center justify-center text-sm transition-colors
                    ${!isCurrentMonth ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}
                    ${isToday && !isSelected ? 'font-bold text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20' : ''}
                    ${isSelected ? 'bg-brand-500 text-white hover:bg-brand-600 dark:hover:bg-brand-600 font-medium' : ''}
                  `}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
