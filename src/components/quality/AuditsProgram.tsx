'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Quality.module.css';

export interface Audit {
    id: number;
    number: string;
    object: string;
    criteria: string;
    period: string;
    group: string;
    date: string;
    findingsCount: {
        none: number,
        minor: number,
        major: number,
        observation: number,
        achievement: number
    };
    detailedFindings: Finding[];
}

export interface Finding {
    id: number;
    type: 'none' | 'minor' | 'major' | 'observation' | 'achievement';
    description: string;
    correction: string;
    correctiveActions: string; // text
    deadline: string;
    responsible: string;
    isCompleted: boolean;
    comment: string;
    files: { name: string; data: string }[];
}

interface AuditsProgramProps {
    isAdmin?: boolean;
}

export default function AuditsProgram({ isAdmin = false }: AuditsProgramProps) {
    const [audits, setAudits] = useState<Audit[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newAudit, setNewAudit] = useState<Partial<Audit>>({ number: '', object: '', criteria: '', period: '', group: '' });
    const [filters, setFilters] = useState({ object: '', period: '', group: '' });
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('qms_audits');
        if (stored) setAudits(JSON.parse(stored));
    }, []);

    const saveAudits = (newAudits: Audit[]) => {
        setAudits(newAudits);
        localStorage.setItem('qms_audits', JSON.stringify(newAudits));
    };

    const addAudit = () => {
        const audit: Audit = {
            id: Date.now(),
            number: newAudit.number || '',
            object: newAudit.object || '',
            criteria: newAudit.criteria || '',
            period: newAudit.period || '',
            group: newAudit.group || '',
            date: '',
            findingsCount: { none: 0, minor: 0, major: 0, observation: 0, achievement: 0 },
            detailedFindings: []
        };
        saveAudits([...audits, audit]);
        setIsAddModalOpen(false);
        setNewAudit({ number: '', object: '', criteria: '', period: '', group: '' });
    };

    const deleteAudit = (id: number) => {
        if (confirm('Удалить аудит из программы?')) {
            saveAudits(audits.filter(a => a.id !== id));
        }
    };

    const filteredAudits = audits.filter(a => {
        const matchesSearch = a.number.toLowerCase().includes(searchTerm.toLowerCase()) || a.object.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesObj = !filters.object || a.object.includes(filters.object);
        const matchesPeriod = !filters.period || a.period.includes(filters.period);
        const matchesGroup = !filters.group || a.group.includes(filters.group);
        return matchesSearch && matchesObj && matchesPeriod && matchesGroup;
    });

    return (
        <div className={styles.moduleContainer}>
            <header className={styles.moduleHeader}>
                <h2>Программа внутреннего аудита СМК</h2>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input 
                    className={styles.searchInput} 
                    placeholder="Поиск по названию или номеру..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <button className={styles.secondaryBtn} onClick={() => setIsFilterOpen(!isFilterOpen)}>🔍 Фильтрация</button>
                {isAdmin && (
                    <button className={styles.primaryBtn} onClick={() => setIsAddModalOpen(true)}>Добавить аудит</button>
                )}
            </div>

            {isFilterOpen && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                    <input placeholder="Фильтр по объекту" value={filters.object} onChange={e => setFilters({...filters, object: e.target.value})} />
                    <input placeholder="Фильтр по периоду" value={filters.period} onChange={e => setFilters({...filters, period: e.target.value})} />
                    <input placeholder="Фильтр по группе" value={filters.group} onChange={e => setFilters({...filters, group: e.target.value})} />
                </div>
            )}

            <div className={styles.tableWrapper}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Номер</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Объект</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Критерии</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Период</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Группа</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAudits.map(audit => (
                            <tr key={audit.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '1rem' }}>
                                    <Link href={`/quality/audits/details/${audit.id}`} style={{ color: 'var(--primary-blue)', fontWeight: 'bold' }}>
                                        {audit.number}
                                    </Link>
                                </td>
                                <td style={{ padding: '1rem' }}>{audit.object}</td>
                                <td style={{ padding: '1rem' }}>{audit.criteria}</td>
                                <td style={{ padding: '1rem' }}>{audit.period}</td>
                                <td style={{ padding: '1rem' }}>{audit.group}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    {isAdmin && (
                                        <button onClick={() => deleteAudit(audit.id)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>🗑️</button>
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
                        <h3>Новый аудит в программу</h3>
                        <div className={styles.formGroup}>
                            <label>Номер аудита</label>
                            <input value={newAudit.number} onChange={e => setNewAudit({...newAudit, number: e.target.value})} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Объект</label>
                            <input value={newAudit.object} onChange={e => setNewAudit({...newAudit, object: e.target.value})} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Критерии</label>
                            <input value={newAudit.criteria} onChange={e => setNewAudit({...newAudit, criteria: e.target.value})} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Период</label>
                            <input value={newAudit.period} onChange={e => setNewAudit({...newAudit, period: e.target.value})} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Группа по аудиту</label>
                            <input value={newAudit.group} onChange={e => setNewAudit({...newAudit, group: e.target.value})} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className={styles.secondaryBtn} onClick={() => setIsAddModalOpen(false)}>Отмена</button>
                            <button className={styles.primaryBtn} onClick={addAudit}>Добавить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
