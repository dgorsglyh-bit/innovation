'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { OpiEntry } from '@/components/opi/OpiManager';

export default function OpiClient() {
    const { id } = useParams();
    const router = useRouter();
    const [entry, setEntry] = useState<OpiEntry | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('innovation_opi_list');
        if (stored) {
            const list: OpiEntry[] = JSON.parse(stored);
            const found = list.find(e => e.id === Number(id));
            if (found) setEntry(found);
        }
    }, [id]);

    if (!entry) return <div style={{ padding: '4rem', textAlign: 'center' }}>Загрузка...</div>;

    const statusLabels: Record<string, string> = {
        planned: 'Запланировано',
        in_progress: 'В процессе',
        completed: 'Завершено',
        cancelled: 'Отменено'
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
            <nav style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <Link href="/pilot-tests" style={{ color: '#666' }}>ОПИ</Link>
                <span>/</span>
                <Link href="/pilot-tests/list" style={{ color: '#666' }}>Перечень</Link>
                <span>/</span>
                <span>Детали</span>
            </nav>

            <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 25px rgba(0,0,0,0.05)' }}>
                <h1 style={{ color: 'var(--primary-blue)', marginBottom: '2rem', fontSize: '2.2rem' }}>{entry.productName}</h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem', borderBottom: '1px solid #eee', paddingBottom: '2rem' }}>
                    <div>
                        <p style={{ color: '#999', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Объект проведения</p>
                        <p style={{ fontWeight: '600', fontSize: '1.2rem' }}>📍 {entry.object}</p>
                    </div>
                    <div>
                        <p style={{ color: '#999', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Статус</p>
                        <p style={{ fontWeight: '600', fontSize: '1.2rem' }}>{statusLabels[entry.status]}</p>
                    </div>
                    <div>
                        <p style={{ color: '#999', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Сроки проведения</p>
                        <p style={{ fontWeight: '600', fontSize: '1.2rem' }}>📅 {entry.startDate} — {entry.endDate}</p>
                    </div>
                </div>

                <div style={{ lineHeight: '1.8', color: '#444' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Описание испытания</h3>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{entry.description || 'Описание не предоставлено.'}</p>
                </div>

                <div style={{ marginTop: '3rem' }}>
                    <button
                        onClick={() => router.back()}
                        style={{ background: '#f8f9fa', border: '1px solid #ddd', padding: '0.8rem 2rem', borderRadius: '6px', cursor: 'pointer' }}
                    >Назад к списку</button>
                </div>
            </div>
        </div>
    );
}
