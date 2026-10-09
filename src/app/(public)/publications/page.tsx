'use client';

import PublicationPublic from '@/components/publications/PublicationPublic';

export default function PublicationsPage() {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>Публикации</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
                Научные статьи, публикации и доклады сотрудников предприятия.
            </p>
            <PublicationPublic />
        </div>
    );
}
