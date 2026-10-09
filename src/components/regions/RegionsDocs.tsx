'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Regions.module.css';

interface RegionDoc {
    id: number;
    name: string;
    fileData: string; // Base64 or Blob URL
}

interface RegionsDocsProps {
    isAdmin?: boolean;
}

export default function RegionsDocs({ isAdmin = false }: RegionsDocsProps) {
    const [docs, setDocs] = useState<RegionDoc[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newFileData, setNewFileData] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('regions_docs');
        if (stored) setDocs(JSON.parse(stored));
    }, []);

    const saveDocs = (newDocs: RegionDoc[]) => {
        setDocs(newDocs);
        localStorage.setItem('regions_docs', JSON.stringify(newDocs));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (re) => {
            setNewFileData(re.target?.result as string);
            if (!newName) setNewName(file.name);
        };
        reader.readAsDataURL(file);
    };

    const addDoc = () => {
        if (!newName || !newFileData) return;
        const doc: RegionDoc = { id: Date.now(), name: newName, fileData: newFileData };
        saveDocs([...docs, doc]);
        setIsAddOpen(false);
        setNewName('');
        setNewFileData('');
    };

    const openDoc = (doc: RegionDoc) => {
        const win = window.open();
        if (win) {
            win.document.write(`<iframe src="${doc.fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        }
    };

    return (
        <div className={styles.moduleContainer}>
            <Link href="/regions" className={styles.backLink}>← Вернуться к регионам</Link>
            <header className={styles.hubHeader}>
                <h2>Документация</h2>
            </header>

            {isAdmin && (
                <button className={styles.primaryBtn} onClick={() => setIsAddOpen(true)}>Добавить документ</button>
            )}

            <div className={styles.docList}>
                {docs.map(doc => (
                    <div key={doc.id} className={styles.docItem}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>📄</span>
                            <button 
                                onClick={() => openDoc(doc)}
                                className={styles.docLink}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1rem' }}
                            >
                                {doc.name}
                            </button>
                        </div>
                        {isAdmin && (
                            <button onClick={() => saveDocs(docs.filter(d => d.id !== doc.id))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                        )}
                    </div>
                ))}
                {docs.length === 0 && <p style={{textAlign:'center', color:'#999'}}>Документы пока не загружены</p>}
            </div>

            {isAddOpen && (
                <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
                    <div style={{ background:'white', padding:'2rem', borderRadius:'12px', width:'400px' }}>
                        <h3>Загрузить PDF</h3>
                        <div style={{ marginBottom:'1rem' }}>
                            <label style={{ display:'block', marginBottom:'0.5rem' }}>Название документа</label>
                            <input className={styles.inputField} value={newName} onChange={e => setNewName(e.target.value)} />
                        </div>
                        <div style={{ marginBottom:'1.5rem' }}>
                            <label style={{ display:'block', marginBottom:'0.5rem' }}>Файл</label>
                            <input type="file" onChange={handleFileUpload} accept="application/pdf" />
                        </div>
                        <div style={{ display:'flex', gap:'1rem', justifyContent:'flex-end' }}>
                            <button className={styles.secondaryBtn} onClick={() => setIsAddOpen(false)}>Отмена</button>
                            <button className={styles.primaryBtn} onClick={addDoc}>Добавить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
