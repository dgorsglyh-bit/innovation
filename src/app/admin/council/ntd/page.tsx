'use client';

import DocumentManager from '@/components/documents/DocumentManager';

export default function AdminCouncilDocumentsPage() {
    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Управление НТД (НТС)</h1>
            <DocumentManager
                storageKey="innovation_council_docs"
                allowedCategories={['company', 'gazprom', 'other']}
                title="Управление НТД (Научно-технический совет)"
            />
        </div>
    );
}
