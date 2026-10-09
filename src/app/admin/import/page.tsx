'use client';
import Link from 'next/link';

export default function AdminImportHub() {
    const sections = [
        { name: 'Протоколы совещаний', link: '/admin/import/protocols' },
        { name: 'Реестр поручений', link: '/admin/import/tasks' },
        { name: 'Оборудование (Excel / Дашборд)', link: '/admin/import/equipment' },
        { name: 'Документация (НТД)', link: '/admin/import/ntd' },
    ];

    return (
        <div style={{ padding: '0' }}>
            <h1 style={{ color: 'var(--primary-blue)', marginBottom: '2rem' }}>Управление Импортозамещением</h1>
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
