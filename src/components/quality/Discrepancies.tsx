'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Quality.module.css';

interface GlobalDiscrepancy {
    id: number;
    auditNumber?: string;
    auditObject: string;
    auditCriteria: string;
    description: string;
    correctiveActions: string;
    deadline: string;
    responsible: string;
    isCompleted: boolean;
    files: { name: string; data: string }[];
}

interface DiscrepanciesProps {
    isAdmin?: boolean;
}

export default function Discrepancies({ isAdmin = false }: DiscrepanciesProps) {
    const [discrepancies, setDiscrepancies] = useState<GlobalDiscrepancy[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ object: '', number: '', deadline: '', actions: '' });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    // Add Manual Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newDisc, setNewDisc] = useState<Partial<GlobalDiscrepancy>>({ auditNumber: '', auditObject: '', description: '', deadline: '', auditCriteria: '', correctiveActions: '', responsible: '' });

    useEffect(() => {
        const stored = localStorage.getItem('qms_discrepancies');
        if (stored) setDiscrepancies(JSON.parse(stored));
    }, []);

    const saveDiscrepancies = (updated: GlobalDiscrepancy[]) => {
        setDiscrepancies(updated);
        localStorage.setItem('qms_discrepancies', JSON.stringify(updated));
    };

    const handleAdd = () => {
        const disc: GlobalDiscrepancy = {
            id: Date.now(),
            auditObject: newDisc.auditObject || '',
            auditNumber: newDisc.auditNumber || 'ВНЕПЛАН.',
            description: newDisc.description || '',
            auditCriteria: newDisc.auditCriteria || '',
            correctiveActions: newDisc.correctiveActions || '',
            deadline: newDisc.deadline || '',
            responsible: newDisc.responsible || '',
            isCompleted: false,
            files: []
        };
        saveDiscrepancies([...discrepancies, disc]);
        setIsAddModalOpen(false);
        setNewDisc({ auditNumber: '', auditObject: '', description: '', deadline: '', auditCriteria: '', correctiveActions: '', responsible: '' });
    };

    const deleteDisc = (id: number) => {
        if (confirm('Удалить несоответствие?')) {
            saveDiscrepancies(discrepancies.filter(d => d.id !== id));
        }
    };

    const updateDisc = (id: number, field: keyof GlobalDiscrepancy, value: any) => {
        saveDiscrepancies(discrepancies.map(d => d.id === id ? { ...d, [field]: value } : d));
    };

    const sendReminder = (disc: GlobalDiscrepancy) => {
        if (!disc.responsible) return;
        alert(`Напоминание отправлено на ${disc.responsible}`);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (re) => {
            const current = discrepancies.find(d => d.id === id);
            if (current) {
                updateDisc(id, 'files', [...current.files, { name: file.name, data: re.target?.result as string }]);
            }
        };
        reader.readAsDataURL(file);
    };

    const filtered = discrepancies.filter(d => {
        const matchesSearch = d.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesObj = !filters.object || d.auditObject.includes(filters.object);
        const matchesNum = !filters.number || (d.auditNumber || '').includes(filters.number);
        const matchesDeadline = !filters.deadline || d.deadline.includes(filters.deadline);
        const matchesActions = !filters.actions || d.correctiveActions.includes(filters.actions);
        return matchesSearch && matchesObj && matchesNum && matchesDeadline && matchesActions;
    });

    return (
        <div className={styles.moduleContainer}>
            <header className={styles.moduleHeader}>
                <h2>Таблица несоответствий по внутренним аудитам СМК</h2>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input 
                    className={styles.searchInput} 
                    placeholder="Поиск по описанию несоответствия..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <button className={styles.secondaryBtn} onClick={() => setIsFilterOpen(!isFilterOpen)}>🔍 Фильтрация</button>
                {isAdmin && (
                    <button className={styles.primaryBtn} onClick={() => setIsAddModalOpen(true)}>Добавить новое несоответствие</button>
                )}
            </div>

            {isFilterOpen && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                    <input placeholder="Объект" value={filters.object} onChange={e => setFilters({...filters, object: e.target.value})} />
                    <input placeholder="Номер аудита" value={filters.number} onChange={e => setFilters({...filters, number: e.target.value})} />
                    <input placeholder="Срок" value={filters.deadline} onChange={e => setFilters({...filters, deadline: e.target.value})} />
                    <input placeholder="КД" value={filters.actions} onChange={e => setFilters({...filters, actions: e.target.value})} />
                </div>
            )}

            <div className={styles.tableWrapper}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '0.75rem' }}>Аудит / Объект</th>
                            <th style={{ padding: '0.75rem' }}>Описание несоответствия</th>
                            <th style={{ padding: '0.75rem' }}>Корректирующие действия / Срок</th>
                            <th style={{ padding: '0.75rem' }}>Документы / Комментарии</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(d => (
                            <tr key={d.id} style={{ borderBottom: '1px solid #eee', background: d.isCompleted ? '#f0fdf4' : 'white' }}>
                                <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                                    <strong>{d.auditNumber}</strong><br/>{d.auditObject}
                                </td>
                                <td style={{ padding: '0.75rem' }}>{d.description}</td>
                                <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                                    <p><strong>Меры:</strong> {d.correctiveActions}</p>
                                    <p><strong>Срок:</strong> {d.deadline}</p>
                                    <p><strong>Отв:</strong> {d.responsible}</p>
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                        {d.files.map((file, fidx) => <span key={fidx} style={{fontSize: '0.7rem'}}>📄 {file.name}</span>)}
                                        <label style={{ fontSize: '0.7rem', color: 'var(--primary-blue)', cursor: 'pointer' }}>
                                            📎 +Файл
                                            <input type="file" style={{ display: 'none' }} onChange={e => handleFileUpload(e, d.id)} />
                                        </label>
                                    </div>
                                </td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                    <input type="checkbox" checked={d.isCompleted} onChange={e => updateDisc(d.id, 'isCompleted', e.target.checked)} />
                                    {isAdmin && (
                                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                                            <button onClick={() => sendReminder(d)} title="Напомнить">🔔</button>
                                            <button onClick={() => deleteDisc(d.id)} title="Удалить">🗑️</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAddModalOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>Новое несоответствие</h3>
                        <div className={styles.formGroup}><label>Номер аудита (если есть)</label><input value={newDisc.auditNumber} onChange={e => setNewDisc({...newDisc, auditNumber: e.target.value})} /></div>
                        <div className={styles.formGroup}><label>Объект (обязательно)</label><input value={newDisc.auditObject} onChange={e => setNewDisc({...newDisc, auditObject: e.target.value})} /></div>
                        <div className={styles.formGroup}><label>Описание несоответствия</label><textarea value={newDisc.description} onChange={e => setNewDisc({...newDisc, description: e.target.value})} rows={2} /></div>
                        <div className={styles.formGroup}><label>Корректирующие действия</label><textarea value={newDisc.correctiveActions} onChange={e => setNewDisc({...newDisc, correctiveActions: e.target.value})} rows={2} /></div>
                        <div className={styles.formGroup}><label>Срок</label><input type="date" value={newDisc.deadline} onChange={e => setNewDisc({...newDisc, deadline: e.target.value})} /></div>
                        <div className={styles.formGroup}><label>Ответственный</label><input value={newDisc.responsible} onChange={e => setNewDisc({...newDisc, responsible: e.target.value})} /></div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className={styles.secondaryBtn} onClick={() => setIsAddModalOpen(false)}>Отмена</button>
                            <button className={styles.primaryBtn} onClick={handleAdd}>Создать</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
