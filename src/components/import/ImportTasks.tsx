'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Import.module.css';

interface ImportTask {
    id: number;
    protocolName: string;
    description: string;
    deadline: string;
    responsible: string;
    responsibleEmails: string[];
    result: string;
    isCompleted: boolean;
}

interface ImportTasksProps {
    isAdmin?: boolean;
}

export default function ImportTasks({ isAdmin = false }: ImportTasksProps) {
    const [tasks, setTasks] = useState<ImportTask[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ deadline: '', responsible: '', status: 'all', protocol: '' });
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<ImportTask>>({});

    useEffect(() => {
        const stored = localStorage.getItem('import_tasks');
        if (stored) setTasks(JSON.parse(stored));
    }, []);

    const saveTasks = (data: ImportTask[]) => {
        setTasks(data);
        localStorage.setItem('import_tasks', JSON.stringify(data));
    };

    const handleSaveTask = () => {
        if (!editingTask.description || !editingTask.protocolName) return;
        let newTasks;
        if (editingTask.id) {
            newTasks = tasks.map(t => t.id === editingTask.id ? (editingTask as ImportTask) : t);
        } else {
            const task: ImportTask = {
                id: Date.now(),
                protocolName: editingTask.protocolName || '',
                description: editingTask.description || '',
                deadline: editingTask.deadline || '',
                responsible: editingTask.responsible || '',
                responsibleEmails: editingTask.responsibleEmails || [],
                result: editingTask.result || '',
                isCompleted: !!editingTask.isCompleted
            };
            newTasks = [...tasks, task];
        }
        saveTasks(newTasks);
        setIsAddOpen(false);
        setEditingTask({});
    };

    const sendReminder = (tEmails: string[]) => {
        if (tEmails.length === 0) return alert('Почты ответственных не указаны');
        console.log(`[REMINDER] Sending to: ${tEmails.join(', ')}`);
        alert(`Напоминание отправлено: ${tEmails.join(', ')}`);
    };

    const sendAllReminders = () => {
        const pendingEmails = tasks.filter(t => !t.isCompleted).flatMap(t => t.responsibleEmails);
        if (pendingEmails.length === 0) return alert('Нет невыполненных поручений с указанными почтами');
        sendReminder([...new Set(pendingEmails)]);
    };

    const filtered = tasks.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.protocolName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = !filters.deadline || t.deadline.includes(filters.deadline);
        const matchesResp = !filters.responsible || t.responsible.toLowerCase().includes(filters.responsible.toLowerCase());
        const matchesStatus = filters.status === 'all' || (filters.status === 'done' ? t.isCompleted : !t.isCompleted);
        const matchesProtocol = !filters.protocol || t.protocolName.toLowerCase().includes(filters.protocol.toLowerCase());
        return matchesSearch && matchesDate && matchesResp && matchesStatus && matchesProtocol;
    });

    return (
        <div className={styles.moduleContainer}>
            <Link href="/import" className={styles.backLink}>← Вернуться в Импортозамещение</Link>
            
            <header className={styles.hubHeader}>
                <h2>Реестр исполнения поручений</h2>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <input 
                    className={styles.inputField} 
                    placeholder="Поиск поручения или протокола..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ flex: 2, minWidth: '300px' }}
                />
                <button className={styles.secondaryBtn}>🔍 Фильтрация</button>
                {isAdmin && (
                    <>
                        <button className={styles.primaryBtn} onClick={() => setIsAddOpen(true)}>Добавить поручение</button>
                        <button className={styles.secondaryBtn} onClick={sendAllReminders}>🔔 Напомнить всем</button>
                    </>
                )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                <input placeholder="Срок" value={filters.deadline} onChange={e => setFilters({...filters, deadline: e.target.value})} className={styles.inputField} style={{flex:1}} />
                <input placeholder="Ответственный" value={filters.responsible} onChange={e => setFilters({...filters, responsible: e.target.value})} className={styles.inputField} style={{flex:1}} />
                <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className={styles.inputField} style={{flex:1}}>
                    <option value="all">Все статусы</option>
                    <option value="done">Выполнено</option>
                    <option value="pending">Не выполнено</option>
                </select>
            </div>

            <div className={styles.scrollTableWrapper}>
                <table className={styles.scrollTable}>
                    <thead>
                        <tr>
                            <th>Протокол совещания</th>
                            <th>Название поручения</th>
                            <th>Срок исполнения</th>
                            <th>Ответственные</th>
                            <th>Результат</th>
                            <th style={{ textAlign: 'center' }}>Статус / Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(t => (
                            <tr key={t.id} style={{ background: t.isCompleted ? '#dcfce7' : '#fee2e2' }}>
                                <td>{t.protocolName}</td>
                                <td>{t.description}</td>
                                <td>{t.deadline}</td>
                                <td>{t.responsible}</td>
                                <td>{t.result}</td>
                                <td style={{ textAlign: 'center' }}>
                                    {isAdmin ? (
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button onClick={() => saveTasks(tasks.map(task => task.id === t.id ? {...task, isCompleted: !task.isCompleted} : task))} style={{fontSize:'0.7rem'}}>
                                                {t.isCompleted ? '↩️' : '✅'}
                                            </button>
                                            <button onClick={() => { setEditingTask(t); setIsAddOpen(true); }} style={{fontSize:'0.7rem'}}>✏️</button>
                                            <button onClick={() => saveTasks(tasks.filter(task => task.id !== t.id))} style={{color:'red', fontSize:'0.7rem'}}>🗑️</button>
                                            {!t.isCompleted && <button onClick={() => sendReminder(t.responsibleEmails)} title="Напомнить" style={{fontSize:'0.7rem'}}>🔔</button>}
                                        </div>
                                    ) : (
                                        <span>{t.isCompleted ? '✅ Выполнено' : '❌ В работе'}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAddOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                        <h3>{editingTask.id ? 'Редактировать поручение' : 'Новое поручение'}</h3>
                        <div className={styles.formGroup} style={{marginBottom:'1rem'}}>
                            <label>Протокол совещания</label>
                            <input value={editingTask.protocolName} onChange={e => setEditingTask({...editingTask, protocolName: e.target.value})} className={styles.inputField} />
                        </div>
                        <div className={styles.formGroup} style={{marginBottom:'1rem'}}>
                            <label>Название поручения</label>
                            <textarea value={editingTask.description} onChange={e => setEditingTask({...editingTask, description: e.target.value})} className={styles.inputField} rows={2} />
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                            <div className={styles.formGroup}>
                                <label>Срок исполнения</label>
                                <input type="date" value={editingTask.deadline} onChange={e => setEditingTask({...editingTask, deadline: e.target.value})} className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Ответственный</label>
                                <input value={editingTask.responsible} onChange={e => setEditingTask({...editingTask, responsible: e.target.value})} className={styles.inputField} />
                            </div>
                        </div>
                        <div className={styles.formGroup} style={{marginBottom:'1rem'}}>
                            <label>Почты ответственных (через запятую)</label>
                            <input value={editingTask.responsibleEmails?.join(', ')} onChange={e => setEditingTask({...editingTask, responsibleEmails: e.target.value.split(',').map(s => s.trim())})} className={styles.inputField} placeholder="email1@gazprom.ru, email2@gazprom.ru" />
                        </div>
                        <div className={styles.formGroup} style={{marginBottom:'1.5rem'}}>
                            <label>Результат</label>
                            <input value={editingTask.result} onChange={e => setEditingTask({...editingTask, result: e.target.value})} className={styles.inputField} />
                        </div>
                        <div style={{ display:'flex', gap:'1rem', justifyContent:'flex-end' }}>
                            <button className={styles.secondaryBtn} onClick={() => setIsAddOpen(false)}>Отмена</button>
                            <button className={styles.primaryBtn} onClick={handleSaveTask}>Сохранить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
