'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';

type DocCategory = 'company' | 'gazprom' | 'other';

interface DocumentItem {
    id: number;
    title: string;
    category: DocCategory;
    fileSource: string;
    inputType: 'url' | 'file';
}

const CATEGORY_LABELS: Record<string, string> = {
    all: 'Все НТД',
    company: 'Документация ООО "Газпром добыча Иркутск"',
    gazprom: 'Документация ПАО «Газпром»',
    other: 'Прочее'
};

export default function CouncilDocumentsPage() {
    const [docs, setDocs] = useState<DocumentItem[]>([]);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        const stored = localStorage.getItem('innovation_council_docs');
        if (stored) {
            setDocs(JSON.parse(stored));
        }
    }, []);

    const filteredDocs = filter === 'all'
        ? docs
        : docs.filter(d => d.category === filter);

    const handleDownload = (doc: DocumentItem) => {
        const link = document.createElement('a');
        link.href = doc.fileSource;
        link.download = doc.title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="main-container">
            <div style={{ padding: '2rem 0' }}>
                <Link href="/council" style={{ color: 'var(--gray-dark)', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>
                    ← Назад в совет
                </Link>

                <h1 style={{ color: 'var(--primary-blue)', marginBottom: '2rem' }}>Нормативно-техническая документация НТС</h1>

                <div className={styles.tabs}>
                    {['all', 'company', 'gazprom', 'other'].map(cat => (
                        <button
                            key={cat}
                            className={`${styles.tab} ${filter === cat ? styles.activeTab : ''}`}
                            onClick={() => setFilter(cat)}
                        >
                            {CATEGORY_LABELS[cat]}
                        </button>
                    ))}
                </div>

                <div className={styles.list}>
                    {filteredDocs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px dashed #ccc' }}>
                            <p style={{ color: '#666' }}>Документы не найдены</p>
                        </div>
                    )}
                    {filteredDocs.map(doc => (
                        <div key={doc.id} className={styles.card}>
                            <div className={styles.iconArea}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-blue)' }}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.docTitle}>{doc.title}</h3>
                                <span className={styles.badge}>{CATEGORY_LABELS[doc.category]}</span>
                            </div>
                            <div className={styles.actions}>
                                <button title="Скачать" onClick={() => handleDownload(doc)} className={styles.actionBtn}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
