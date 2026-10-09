'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

type DocCategory = 'plans' | 'company' | 'gazprom' | 'other';

interface DocumentItem {
    id: number;
    title: string;
    category: DocCategory;
    fileSource: string;
    inputType: 'url' | 'file';
}

const CATEGORY_LABELS: Record<string, string> = {
    all: 'Все НТД',
    plans: 'Планы',
    company: 'Документация ООО "Газпром добыча Иркутск"',
    gazprom: 'Документация ПАО «Газпром»',
    other: 'Прочее'
};

export default function DocumentsPage() {
    const [docs, setDocs] = useState<DocumentItem[]>([]);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        const stored = localStorage.getItem('innovation_docs');
        if (stored) {
            setDocs(JSON.parse(stored));
        }
    }, []);

    const filteredDocs = filter === 'all'
        ? docs
        : docs.filter(d => d.category === filter);

    const handleOpen = (doc: DocumentItem) => {
        // Mock open functionality
        if (doc.inputType === 'url') {
            window.open(doc.fileSource, '_blank');
        } else {
            // Open Base64 in new window (simple implementation)
            const newWindow = window.open();
            if (newWindow) {
                newWindow.document.write('<iframe src="' + doc.fileSource + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
            }
        }
    };

    const handleDownload = (doc: DocumentItem) => {
        const link = document.createElement('a');
        link.href = doc.fileSource;
        link.download = doc.title; // Try to set filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Нормативно-техническая документация</h1>

            <div className={styles.tabs}>
                {['all', 'plans', 'company', 'gazprom', 'other'].map(cat => (
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
                {filteredDocs.length === 0 && <p className={styles.empty}>Документы не найдены</p>}
                {filteredDocs.map(doc => (
                    <div key={doc.id} className={styles.card}>
                        <div className={styles.iconArea}>
                            {/* Document Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-blue)' }}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                        </div>
                        <div className={styles.content}>
                            <h3 className={styles.docTitle} onClick={() => handleOpen(doc)}>{doc.title}</h3>
                            <span className={styles.badge}>{CATEGORY_LABELS[doc.category]}</span>
                        </div>
                        <div className={styles.actions}>
                            <button title="Читать" onClick={() => handleOpen(doc)} className={styles.actionBtn}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                            </button>
                            <button title="Скачать" onClick={() => handleDownload(doc)} className={styles.actionBtn}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
