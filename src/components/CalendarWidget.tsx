'use client';

import { useState, useEffect } from 'react';
import styles from './CalendarWidget.module.css';

interface Event {
    id: string;
    date: string;
    title: string;
    description: string;
}

interface CalendarProps {
    adminMode?: boolean;
}

export default function CalendarWidget({ adminMode = false }: CalendarProps) {
    // Start from Jan 2026
    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
    const [events, setEvents] = useState<Event[]>([]);
    const [activeUserMonth, setActiveUserMonth] = useState('2026-01');
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    // Form state
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDesc, setNewEventDesc] = useState('');

    useEffect(() => {
        // Load from local storage
        const storedEvents = localStorage.getItem('innovation_events');
        const storedSettings = localStorage.getItem('innovation_settings');

        if (storedEvents) setEvents(JSON.parse(storedEvents));
        if (storedSettings) {
            const settings = JSON.parse(storedSettings);
            if (settings.activeMonth && !adminMode) {
                // In user mode, force the view to the active month
                const [year, month] = settings.activeMonth.split('-').map(Number);
                setCurrentDate(new Date(year, month - 1, 1));
            }
        }
    }, [adminMode]);

    const saveEvents = (newEvents: Event[]) => {
        setEvents(newEvents);
        localStorage.setItem('innovation_events', JSON.stringify(newEvents));
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: days }, (_, i) => i + 1);
    };

    const handlePrevMonth = () => {
        if (!adminMode) return; // Users see fixed month
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        if (!adminMode) return; // Users see fixed month
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleSetActiveMonth = () => {
        const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        setActiveUserMonth(monthStr);
        localStorage.setItem('innovation_settings', JSON.stringify({ activeMonth: monthStr }));
        alert(`Месяц ${monthStr} установлен как активный для пользователей.`);
    };

    const handleAddEvent = () => {
        if (!selectedDay) return;
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
        const newEvent: Event = {
            id: Date.now().toString(),
            date: dateStr,
            title: newEventTitle,
            description: newEventDesc
        };
        saveEvents([...events, newEvent]);
        setNewEventTitle('');
        setNewEventDesc('');
        setSelectedDay(null);
    };

    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    const days = getDaysInMonth(currentDate);

    // Filter events for current month
    const currentMonthEvents = events.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });

    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    // Calculate padding days (empty cells before 1st of month)
    // getDay() returns 0 for Sunday, 1 for Monday...
    // We want 0 for Monday... 6 for Sunday
    const firstDayIndex = (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() + 6) % 7;
    const paddingDays = Array.from({ length: firstDayIndex });

    return (
        <div className={styles.calendarContainer}>
            <div className={styles.header}>
                {adminMode && <button onClick={handlePrevMonth}>&lt;</button>}
                <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                {adminMode && <button onClick={handleNextMonth}>&gt;</button>}
            </div>

            {adminMode && (
                <div className={styles.adminControls}>
                    <button onClick={handleSetActiveMonth} className={styles.actionBtn}>
                        Показывать этот месяц пользователям
                    </button>
                </div>
            )}

            <div className={styles.grid}>
                {dayNames.map(name => (
                    <div key={name} className={styles.dayName}>
                        {name}
                    </div>
                ))}

                {paddingDays.map((_, i) => (
                    <div key={`pad-${i}`} className={styles.dayPlaceholder} />
                ))}

                {days.map(day => {
                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayEvents = events.filter(e => e.date === dateStr);
                    const isSelected = String(day) === selectedDay;

                    return (
                        <div
                            key={day}
                            className={`${styles.day} ${isSelected ? styles.selected : ''}`}
                            onClick={() => adminMode && setSelectedDay(String(day))}
                        >
                            <div className={styles.dayNumber}>{day}</div>
                            {dayEvents.map(e => (
                                <div key={e.id} className={styles.eventMarker} title={e.title}>•</div>
                            ))}
                        </div>
                    );
                })}
            </div>

            <div className={styles.eventList}>
                <h3>Мероприятия:</h3>
                {currentMonthEvents.length === 0 && <p>Нет мероприятий</p>}
                {currentMonthEvents.map(e => (
                    <div key={e.id} className={styles.eventItem}>
                        <strong>{e.date}: {e.title}</strong>
                        <p>{e.description}</p>
                    </div>
                ))}
            </div>

            {adminMode && selectedDay && (
                <div className={styles.modal}>
                    <h3>Добавить событие на {selectedDay} {monthNames[currentDate.getMonth()]}</h3>
                    <input
                        type="text"
                        placeholder="Название"
                        value={newEventTitle}
                        onChange={e => setNewEventTitle(e.target.value)}
                    />
                    <textarea
                        placeholder="Описание"
                        value={newEventDesc}
                        onChange={e => setNewEventDesc(e.target.value)}
                    />
                    <div className={styles.modalActions}>
                        <button onClick={handleAddEvent}>Сохранить</button>
                        <button onClick={() => setSelectedDay(null)}>Отмена</button>
                    </div>
                </div>
            )}
        </div>
    );
}
