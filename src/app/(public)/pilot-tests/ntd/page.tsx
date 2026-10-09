'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OpiDocument } from '@/components/opi/OpiManager';

export default function OpiNtdPage() {
    const [docs, setDocs] = useState<OpiDocument[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('innovation_opi_ntd');
        if (stored) setDocs(JSON.parse(stored));
    }, []);

    const openDoc = (data: string) => {
        const win = window.open();
        if (win) {
            win.document.write(`<iframe src="${data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        }
    };

    const downloadDoc = (data: string, filename: string) => {
        const link = document.createElement('a');
        link.href = data;
        link.download = filename;
        link.click();
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            <nav style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <Link href="/" style={{ color: '#666' }}>Главная</Link>
                <span>/</span>
                <Link href="/pilot-tests" style={{ color: '#666' }}>ОПИ</Link>
                <span>/</span>
                <span>НТД</span>
            </nav>

            <h1 style={{ color: 'var(--primary-blue)', marginBottom: '2rem' }}>Нормативно-техническая документация ОПИ</h1>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {docs.length === 0 ? (
                    <p style={{ color: '#999', textAlign: 'center', padding: '3rem' }}>Документы не найдены</p>
                ) : (
                    docs.map(doc => (
                        <div key={doc.id} style={{
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: '10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}>
                            <span style={{ fontWeight: '500' }}>{doc.title}</span>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => openDoc(doc.file.data)}
                                    style={{ background: '#0079C2', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer' }}
                                >Читать</button>
                                <button
                                    onClick={() => downloadDoc(doc.file.data, doc.file.name)}
                                    style={{ background: '#f8f9fa', color: '#333', border: '1px solid #ddd', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer' }}
                                >⬇️ Скачать</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
