'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Quality.module.css';

interface NtdFile {
    id: number;
    name: string;
    data: string; // Base64
}

interface NtdModuleProps {
    isAdmin?: boolean;
}

export default function NtdModule({ isAdmin = false }: NtdModuleProps) {
    const [files, setFiles] = useState<NtdFile[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('qms_ntd_files');
        if (stored) setFiles(JSON.parse(stored));
    }, []);

    const saveFiles = (newFiles: NtdFile[]) => {
        setFiles(newFiles);
        localStorage.setItem('qms_ntd_files', JSON.stringify(newFiles));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (re) => {
            const newFile: NtdFile = {
                id: Date.now(),
                name: file.name,
                data: re.target?.result as string
            };
            saveFiles([...files, newFile]);
        };
        reader.readAsDataURL(file);
    };

    const deleteFile = (id: number) => {
        if (confirm('Удалить файл?')) {
            saveFiles(files.filter(f => f.id !== id));
        }
    };

    const downloadFile = (file: NtdFile) => {
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        link.click();
    };

    return (
        <div className={styles.moduleContainer}>
            <Link href="/quality" className={styles.backLink}>← Вернуться в СМК</Link>
            
            <header className={styles.moduleHeader}>
                <h2>Нормативно-техническая документация</h2>
            </header>

            {isAdmin && (
                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed var(--primary-blue)' }}>
                    <h4>Добавить новый документ</h4>
                    <input type="file" onChange={handleFileUpload} style={{ marginTop: '0.5rem' }} />
                </div>
            )}

            <div className={styles.fileGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {files.map(file => (
                    <div key={file.id} style={{
                        padding: '1.5rem',
                        border: '1px solid #eee',
                        borderRadius: '12px',
                        background: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        position: 'relative'
                    }}>
                        <span style={{ fontSize: '3rem' }}>📄</span>
                        <span style={{ fontWeight: '500', textAlign: 'center', fontSize: '0.9rem' }}>{file.name}</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                                className={styles.primaryBtn} 
                                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                                onClick={() => downloadFile(file)}
                            >
                                ⬇️ Скачать
                            </button>
                            {isAdmin && (
                                <button 
                                    className={styles.secondaryBtn} 
                                    style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#dc2626' }}
                                    onClick={() => deleteFile(file.id)}
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {files.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#999' }}>
                        Документы пока не загружены
                    </div>
                )}
            </div>
        </div>
    );
}
