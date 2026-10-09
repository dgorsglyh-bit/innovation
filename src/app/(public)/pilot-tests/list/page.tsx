'use client';

import OpiList from '@/components/opi/OpiList';
import Link from 'next/link';

export default function OpiListPage() {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <nav style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <Link href="/" style={{ color: '#666' }}>Главная</Link>
                <span>/</span>
                <Link href="/pilot-tests" style={{ color: '#666' }}>ОПИ</Link>
                <span>/</span>
                <span>Перечень ОПИ</span>
            </nav>

            <h1 style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>Перечень опытно-промышленных испытаний</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
                Используйте поиск и фильтры для нахождения интересующих вас испытаний.
            </p>

            <OpiList />
        </div>
    );
}
