'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Import.module.css';

interface Protocol {
    id: number;
    title: string;
    date: string;
    fileData: string; // Base64 or mock blob
    fileName: string;
}

interface ImportProtocolsProps {
    isAdmin?: boolean;
}

export default function ImportProtocols({ isAdmin = false }: ImportProtocolsProps) {
    const [protocols, setProtocols] = useState<Protocol[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newProtocol, setNewProtocol] = useState<Partial<Protocol>>({ title: '', date: '' });

    useEffect(() => {
        const stored = localStorage.getItem('import_protocols');
        if (stored) setProtocols(JSON.parse(stored));
    }, []);

    const saveProtocols = (data: Protocol[]) => {
        setProtocols(data);
        localStorage.setItem('import_protocols', JSON.stringify(data));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (re) => {
            setNewProtocol({ ...newProtocol, fileData: re.target?.result as string, fileName: file.name });
        };
        reader.readAsDataURL(file);
    };

    const addProtocol = () => {
        if (!newProtocol.title || !newProtocol.fileData) return;
        const protocol: Protocol = {
            id: Date.now(),
            title: newProtocol.title,
            date: newProtocol.date || new Date().toLocaleDateString(),
            fileData: newProtocol.fileData as string,
            fileName: newProtocol.fileName || 'document.pdf'
        };
        saveProtocols([...protocols, protocol]);
        setIsAddOpen(false);
        setNewProtocol({ title: '', date: '' });
    };

    const deleteProtocol = (id: number) => {
        if (confirm('Удалить протокол?')) {
            saveProtocols(protocols.filter(p => p.id !== id));
        }
    };

    const downloadProtocol = (p: Protocol) => {
        const link = document.createElement('a');
        link.href = p.fileData;
        link.download = p.fileName;
        link.click();
    };

    const filtered = protocols.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = !dateFilter || p.date.includes(dateFilter);
        return matchesSearch && matchesDate;
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className={styles.moduleContainer}>
            <Link href="/import" className={styles.backLink}>← Вернуться в Импортозамещение</Link>
            
            <header className={styles.hubHeader}>
                <h2>Протоколы совещаний</h2>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input 
                    className={styles.inputField} 
                    placeholder="Поиск совещаний..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ flex: 1 }}
                />
                <input 
                    type="date" 
                    className={styles.inputField} 
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                    style={{ width: '200px' }}
                />
                {isAdmin && <button className={styles.primaryBtn} onClick={() => setIsAddOpen(true)}>Добавить протокол</button>}
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {filtered.map(p => (
                    <div key={p.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '1.5rem', 
                        background: 'white', 
                        borderRadius: '10px', 
                        border: '1px solid #eee' 
                    }}>
                        <div style={{ cursor: 'pointer' }} onClick={() => downloadProtocol(p)}>
                            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--primary-blue)' }}>{p.title}</h4>
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>📅 {p.date} | 📄 {p.fileName}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => downloadProtocol(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>⬇️</button>
                            {isAdmin && <button onClick={() => deleteProtocol(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>}
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <p style={{textAlign:'center', color:'#999', padding:'3rem'}}>Протоколы не найдены</p>}
            </div>

            {isAddOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>Новый протокол</h3>
                        <div className={styles.formGroup} style={{marginBottom:'1rem'}}>
                            <label>Название совещания</label>
                            <input value={newProtocol.title} onChange={e => setNewProtocol({...newProtocol, title: e.target.value})} className={styles.inputField} />
                        </div>
                        <div className={styles.formGroup} style={{marginBottom:'1rem'}}>
                            <label>Дата проведения</label>
                            <input type="date" value={newProtocol.date} onChange={e => setNewProtocol({...newProtocol, date: e.target.value})} className={styles.inputField} />
                        </div>
                        <div className={styles.formGroup} style={{marginBottom:'1.5rem'}}>
                            <label>Файл протокола</label>
                            <input type="file" onChange={handleFileUpload} />
                        </div>
                        <div style={{ display:'flex', gap:'1rem', justifyContent:'flex-end' }}>
                            <button className={styles.secondaryBtn} onClick={() => setIsAddOpen(false)}>Отмена</button>
                            <button className={styles.primaryBtn} onClick={addProtocol}>Сохранить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
