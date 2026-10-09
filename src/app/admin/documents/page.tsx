import DocumentManager from '@/components/documents/DocumentManager';

export default function AdminDocumentsPage() {
    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Управление НТД</h1>
            <DocumentManager
                storageKey="innovation_docs"
                allowedCategories={['plans', 'company', 'gazprom', 'other']}
                title="Управление НТД"
            />
        </div>
    );
}
