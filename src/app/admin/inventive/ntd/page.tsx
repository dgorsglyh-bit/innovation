'use client';

import DocumentManager from '@/components/documents/DocumentManager';

export default function AdminInventiveDocumentsPage() {
    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Управление НТД (Изобретательство)</h1>
            <DocumentManager
                storageKey="innovation_inventive_docs"
                allowedCategories={['company', 'gazprom', 'other']}
                title="Управление НТД (Изобретательство)"
            />
        </div>
    );
}
