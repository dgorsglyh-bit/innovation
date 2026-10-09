'use client';
import Link from 'next/link';

export default function AdminQualityHub() {
    const sections = [
        { name: 'Обучение (Тесты)', link: '/admin/quality/training' },
        { name: 'НТД (Файлы)', link: '/admin/quality/ntd' },
        { name: 'Обратная связь (Службы)', link: '/admin/quality/feedback' },
        { name: 'Обратная связь (УТТиСТ Подробно)', link: '/admin/quality/feedback/uttist' },
    ];

    return (
        <div style={{ padding: '0' }}>
            <h1 style={{ color: 'var(--primary-blue)', marginBottom: '2rem' }}>Управление СМК</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {sections.map(s => (
                    <Link key={s.link} href={s.link} style={{
                        padding: '2rem',
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #eee',
                        textAlign: 'center',
                        textDecoration: 'none',
                        color: 'var(--primary-blue)',
                        fontWeight: '700',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                    }}>
                        {s.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}
