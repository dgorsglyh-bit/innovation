'use client';

import { useState, useEffect } from 'react';
import styles from './DocumentManager.module.css';

export type DocCategory = 'plans' | 'company' | 'gazprom' | 'other';

export interface DocumentItem {
    id: number;
    title: string;
    category: DocCategory;
    fileSource: string; // URL or Base64
    inputType: 'url' | 'file';
}

export const CATEGORY_LABELS: Record<string, string> = {
    plans: 'Планы',
    company: 'Документация ООО "Газпром добыча Иркутск"',
    gazprom: 'Документация ПАО «Газпром»',
    other: 'Прочее'
};

interface DocumentManagerProps {
    storageKey: string;
    allowedCategories: DocCategory[];
    title: string;
}

export default function DocumentManager({ storageKey, allowedCategories, title: sectionTitle }: DocumentManagerProps) {
    const [docs, setDocs] = useState<DocumentItem[]>([]);
    const [docTitle, setDocTitle] = useState('');
    const [category, setCategory] = useState<DocCategory>(allowedCategories[0]);
    const [fileSource, setFileSource] = useState('');
    const [inputType, setInputType] = useState<'url' | 'file'>('url');

    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            setDocs(JSON.parse(stored));
        }
    }, [storageKey]);

    const saveDocs = (newDocs: DocumentItem[]) => {
        setDocs(newDocs);
        localStorage.setItem(storageKey, JSON.stringify(newDocs));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('Файл слишком большой (>2MB). Рекомендуется использовать ссылку.');
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFileSource(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addDoc = (e: React.FormEvent) => {
        e.preventDefault();
        if (!docTitle || !fileSource) {
            alert('Заполните название и выберите файл/ссылку');
            return;
        }

        const newDoc: DocumentItem = {
            id: Date.now(),
            title: docTitle,
            category,
            fileSource,
            inputType
        };

        saveDocs([...docs, newDoc]);

        // Reset
        setDocTitle('');
        setCategory(allowedCategories[0]);
        setFileSource('');
        setInputType('url');
        alert('Документ добавлен!');
    };

    const deleteDoc = (id: number) => {
        if (confirm('Удалить документ?')) {
            saveDocs(docs.filter(d => d.id !== id));
        }
    };

    return (
        <div className={styles.container}>
            <h2>{sectionTitle}</h2>

            <form onSubmit={addDoc} className={styles.form}>
                <div className={styles.field}>
                    <label>Название документа:</label>
                    <input
                        type="text"
                        value={docTitle}
                        onChange={e => setDocTitle(e.target.value)}
                        required
                        placeholder="Например: План на 2026 год"
                    />
                </div>

                <div className={styles.field}>
                    <label>Категория:</label>
                    <select value={category} onChange={e => setCategory(e.target.value as DocCategory)}>
                        {allowedCategories.map(cat => (
                            <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.field}>
                    <label>Источник файла:</label>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                        <label><input type="radio" checked={inputType === 'url'} onChange={() => setInputType('url')} /> Ссылка (URL)</label>
                        <label><input type="radio" checked={inputType === 'file'} onChange={() => setInputType('file')} /> Загрузить файл</label>
                    </div>

                    {inputType === 'url' ? (
                        <input
                            type="text"
                            value={fileSource}
                            onChange={e => setFileSource(e.target.value)}
                            placeholder="https://example.com/doc.pdf"
                        />
                    ) : (
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        />
                    )}
                </div>

                <button type="submit" className={styles.submitButton}>Добавить документ</button>
            </form>

            <div className={styles.list}>
                <h3>Список документов ({docs.length})</h3>
                {docs.map(doc => (
                    <div key={doc.id} className={styles.item}>
                        <div className={styles.itemContent}>
                            <strong>{doc.title}</strong>
                            <span className={styles.badge}>{CATEGORY_LABELS[doc.category]}</span>
                            <small style={{ display: 'block', color: 'gray', marginTop: '0.2rem' }}>
                                {doc.inputType === 'url' ? 'Link' : 'File'}
                            </small>
                        </div>
                        <button onClick={() => deleteDoc(doc.id)} className={styles.deleteBtn}>Удалить</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
