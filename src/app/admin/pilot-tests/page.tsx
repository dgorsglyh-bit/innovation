'use client';

import OpiManager from '@/components/opi/OpiManager';

export default function AdminOpiPage() {
    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ color: 'var(--primary-blue)', marginBottom: '2rem' }}>Управление Опытно-промышленными испытаниями</h1>
            <OpiManager />
        </div>
    );
}
