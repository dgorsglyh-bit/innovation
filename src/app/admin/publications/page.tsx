'use client';

import PublicationManager from '@/components/publications/PublicationManager';

export default function AdminPublicationsPage() {
    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ color: 'var(--primary-blue)', marginBottom: '2rem' }}>Управление публикациями</h1>
            <PublicationManager />
        </div>
    );
}
