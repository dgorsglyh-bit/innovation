'use client';
import CalendarWidget from '@/components/CalendarWidget';

export default function AdminCalendarPage() {
    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Управление Календарем</h1>
            <p style={{ marginBottom: '1rem' }}>
                Здесь вы можете добавлять события и выбирать месяц, который будет отображаться пользователям на главной странице.
            </p>
            <CalendarWidget adminMode={true} />
        </div>
    );
}
