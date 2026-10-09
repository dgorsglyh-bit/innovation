'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Energy.module.css';

interface EnergyTask {
    id: number;
    text: string;
    responsibleEmails: string[];
    isCompleted: boolean;
}

interface EnergyProtocol {
    id: number;
    title: string;
    tasks: EnergyTask[];
}

interface EnergyRegistryProps {
    isAdmin?: boolean;
}

export default function EnergyRegistry({ isAdmin = false }: EnergyRegistryProps) {
    const [protocols, setProtocols] = useState<EnergyProtocol[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedP, setExpandedP] = useState<number | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('energy_registry');
        if (stored) setProtocols(JSON.parse(stored));
    }, []);

    const saveRegistry = (newP: EnergyProtocol[]) => {
        setProtocols(newP);
        localStorage.setItem('energy_registry', JSON.stringify(newP));
    };

    const addProtocol = () => {
        const p: EnergyProtocol = { id: Date.now(), title: 'Протокол совещания №...', tasks: [] };
        saveRegistry([...protocols, p]);
    };

    const addTask = (pId: number) => {
        saveRegistry(protocols.map(p => p.id === pId ? { ...p, tasks: [...p.tasks, { id: Date.now(), text: 'Новое поручение', responsibleEmails: [], isCompleted: false }] } : p));
    };

    const updateTask = (pId: number, tId: number, field: keyof EnergyTask, value: any) => {
        saveRegistry(protocols.map(p => p.id === pId ? { ...p, tasks: p.tasks.map(t => t.id === tId ? { ...t, [field]: value } : t) } : p));
    };

    const deleteTask = (pId: number, tId: number) => {
        saveRegistry(protocols.map(p => p.id === pId ? { ...p, tasks: p.tasks.filter(t => t.id !== tId) } : p));
    };

    const getCompletedCount = (p: EnergyProtocol) => {
        const completed = p.tasks.filter(t => t.isCompleted).length;
        const total = p.tasks.length;
        return { completed, total, allDone: total > 0 && completed === total };
    };

    const sendReminders = (tasks: EnergyTask[]) => {
        const pending = tasks.filter(t => !t.isCompleted);
        const emails = pending.flatMap(t => t.responsibleEmails);
        if (emails.length === 0) {
            alert('Нет ответственных для невыполненных поручений.');
            return;
        }
        console.log(`[ENERGY REMINDER] To: ${[...new Set(emails)].join(', ')}`);
        alert('Напоминания отправлены ответственным.');
    };

    const filtered = protocols.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className={styles.moduleContainer}>
            <Link href="/energy" className={styles.backLink}>← Вернуться в СУЭн</Link>
            <header className={styles.hubHeader}>
                <h2>Реестр протоколов совещаний</h2>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input 
                    className={styles.inputField} 
                    placeholder="Поиск по названию протокола..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ flex: 1 }}
                />
                {isAdmin && <button className={styles.secondaryBtn} onClick={() => sendReminders(protocols.flatMap(p => p.tasks))}>🔔 Напомнить всем</button>}
            </div>

            <div className={styles.protocolsList}>
                {filtered.map(p => {
                    const stats = getCompletedCount(p);
                    return (
                        <div key={p.id} className={styles.protocolCard} style={{ background: stats.allDone ? '#dcfce7' : 'white' }}>
                            <div className={styles.protocolHeader} onClick={() => setExpandedP(expandedP === p.id ? null : p.id)} style={{ background: stats.allDone ? 'rgba(0,0,0,0.05)' : '#f8fafc' }}>
                                <div style={{ flex: 1 }}>
                                    {isAdmin ? <input value={p.title} onChange={e => saveRegistry(protocols.map(pr => pr.id === p.id ? {...pr, title: e.target.value} : pr))} style={{ border: 'none', background: 'transparent', fontWeight: '700', fontSize: '1.2rem', color: 'var(--primary-blue)', width: '100%' }} /> : <h3>{p.title}</h3>}
                                </div>
                                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.9rem', color: '#666' }}>Выполнено: <strong>{stats.completed} из {stats.total}</strong></span>
                                    {isAdmin && <button className={styles.smallBtn} onClick={(e) => { e.stopPropagation(); sendReminders(p.tasks); }} style={{ fontSize: '0.7rem' }}>🔔 Напоминания</button>}
                                    {isAdmin && <button className={styles.smallBtn} onClick={(e) => { e.stopPropagation(); if(confirm('Удалить протокол?')) saveRegistry(protocols.filter(pr => pr.id !== p.id)); }} style={{ color: 'red' }}>🗑️</button>}
                                    <span>{expandedP === p.id ? '🔼' : '🔽'}</span>
                                </div>
                            </div>

                            {expandedP === p.id && (
                                <div className={styles.protocolContent}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                                <th style={{ padding: '0.75rem' }}>Поручение</th>
                                                <th style={{ padding: '0.75rem' }}>Ответственные</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Статус</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {p.tasks.map(t => (
                                                <tr key={t.id} style={{ borderBottom: '1px solid #f5f5f5', background: t.isCompleted ? '#f0fdf4' : '#fff1f2' }}>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        {isAdmin ? <input value={t.text} onChange={e => updateTask(p.id, t.id, 'text', e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent' }} /> : t.text}
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        {isAdmin ? <input value={t.responsibleEmails.join(', ')} onChange={e => updateTask(p.id, t.id, 'responsibleEmails', e.target.value.split(',').map(s => s.trim()))} style={{ width: '100%', border: 'none', background: 'transparent' }} placeholder="emails..." /> : t.responsibleEmails.join(', ')}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                        {isAdmin ? (
                                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                                <button onClick={() => updateTask(p.id, t.id, 'isCompleted', true)} style={{ color: 'green', fontWeight: 'bold' }}>+</button>
                                                                <button onClick={() => updateTask(p.id, t.id, 'isCompleted', false)} style={{ color: 'red', fontWeight: 'bold' }}>-</button>
                                                                <button onClick={() => deleteTask(p.id, t.id)} style={{ marginLeft: '1rem', opacity: 0.5 }}>🗑️</button>
                                                            </div>
                                                        ) : (
                                                            <span>{t.isCompleted ? '✅' : '🔴'}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {isAdmin && <button className={styles.secondaryBtn} onClick={() => addTask(p.id)} style={{ marginTop: '1rem', width: '100%' }}>➕ Добавить новое поручение</button>}
                                </div>
                            )}
                        </div>
                    );
                })}
                {isAdmin && <button className={styles.primaryBtn} onClick={addProtocol} style={{ width: '100%', marginTop: '2rem' }}>➕ Добавить новый протокол</button>}
            </div>
        </div>
    );
}
