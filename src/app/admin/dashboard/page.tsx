'use client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AdminDashboard() {
    const { user } = useAuth();

    return (
        <div>
            <h1>Панель управления</h1>
            <p style={{ margin: '1rem 0' }}>Добро пожаловать, {user?.username}!</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <Link href="/admin/calendar" style={{
                    padding: '2rem',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: 'var(--primary-blue)'
                }}>
                    Управление Календарем
                </Link>
                <Link href="/admin/news" style={{
                    padding: '2rem',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: 'var(--primary-blue)'
                }}>
                    Управление Новостями
                </Link>
            </div>
        </div>
    );
}
