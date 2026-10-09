import PatentManager from '@/components/inventive/PatentManager';

export default function AdminPatentsPage() {
    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Управление патентами и авторскими правами</h1>
            <PatentManager />
        </div>
    );
}
