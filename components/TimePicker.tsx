import React from 'react';

interface TimePickerProps {
    value: string; // HH:mm format
    onChange: (time: string) => void;
    className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className = '' }) => {
    const [hours, minutes] = value ? value.split(':') : ['12', '00'];

    const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(`${e.target.value}:${minutes}`);
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(`${hours}:${e.target.value}`);
    };

    const hourOptions = Array.from({ length: 24 }, (_, i) => {
        const h = i.toString().padStart(2, '0');
        return <option key={h} value={h}>{h}</option>;
    });

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <select
                value={hours}
                onChange={handleHourChange}
                className="w-full flex-1 p-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors appearance-none"
                style={{ WebkitAppearance: 'none', backgroundPosition: 'right 0.5rem center' }}
            >
                {hourOptions}
            </select>
            <span className="text-zinc-500 font-bold">:</span>
            <select
                value={minutes}
                onChange={handleMinuteChange}
                className="w-full flex-1 p-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors appearance-none"
                style={{ WebkitAppearance: 'none', backgroundPosition: 'right 0.5rem center' }}
            >
                <option value="00">00</option>
                <option value="30">30</option>
            </select>
        </div>
    );
};
