'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Quality.module.css';

interface PlanItem {
    id: number;
    text: string;
    responsibleEmails: string[];
    isCompleted: boolean;
    comment: string;
    files: { name: string; data: string }[];
}

interface Protocol {
    id: number;
    title: string;
    items: PlanItem[];
}

interface PlanningManagerProps {
    isAdmin?: boolean;
}

export default function PlanningManager({ isAdmin = false }: PlanningManagerProps) {
    const [protocols, setProtocols] = useState<Protocol[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddProtocolOpen, setIsAddProtocolOpen] = useState(false);
    const [newProtocolTitle, setNewProtocolTitle] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('qms_planning_protocols');
        if (stored) setProtocols(JSON.parse(stored));
    }, []);

    const saveProtocols = (newProtocols: Protocol[]) => {
        setProtocols(newProtocols);
        localStorage.setItem('qms_planning_protocols', JSON.stringify(newProtocols));
    };

    const addProtocol = () => {
        if (!newProtocolTitle) return;
        const protocol: Protocol = {
            id: Date.now(),
            title: newProtocolTitle,
            items: []
        };
        saveProtocols([...protocols, protocol]);
        setNewProtocolTitle('');
        setIsAddProtocolOpen(false);
    };

    const addItem = (pId: number) => {
        const updated = protocols.map(p => {
            if (p.id === pId) {
                const newItem: PlanItem = {
                    id: Date.now(),
                    text: 'Новое поручение',
                    responsibleEmails: [],
                    isCompleted: false,
                    comment: '',
                    files: []
                };
                return { ...p, items: [...p.items, newItem] };
            }
            return p;
        });
        saveProtocols(updated);
    };

    const deleteItem = (pId: number, iId: number) => {
        if (!confirm('Удалить этот пункт?')) return;
        saveProtocols(protocols.map(p => p.id === pId ? { ...p, items: p.items.filter(i => i.id !== iId) } : p));
    };

    const updateItem = (pId: number, iId: number, field: keyof PlanItem, value: any) => {
        const updated = protocols.map(p => {
            if (p.id === pId) {
                return {
                    ...p,
                    items: p.items.map(i => i.id === iId ? { ...i, [field]: value } : i)
                };
            }
            return p;
        });
        saveProtocols(updated);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, pId: number, iId: number) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (re) => {
            const fileData = { name: file.name, data: re.target?.result as string };
            const currentItem = protocols.find(p => p.id === pId)?.items.find(i => i.id === iId);
            if (currentItem) {
                updateItem(pId, iId, 'files', [...currentItem.files, fileData]);
            }
        };
        reader.readAsDataURL(file);
    };

    const sendReminders = (items: PlanItem[], context: string) => {
        const uncompleted = items.filter(i => !i.isCompleted);
        if (uncompleted.length === 0) {
            alert('Все поручения выполнены, напоминания не требуются.');
            return;
        }
        const emails = uncompleted.flatMap(i => i.responsibleEmails);
        if (emails.length === 0) {
            alert('Не указаны почты ответственных для невыполненных поручений.');
            return;
        }
        console.log(`[REMINDERS] Sending to: ${[...new Set(emails)].join(', ')}. Context: ${context}`);
        alert(`Напоминания отправлены ответственным (${emails.length} адресов).`);
    };

    const exportPlan = () => {
        const content = protocols.map(p => {
            return `--- ${p.title} ---\n` + p.items.map(i => 
                `${i.isCompleted ? '[X]' : '[ ]'} ${i.text}\n   Комментарий: ${i.comment}\n`
            ).join('\n');
        }).join('\n\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'План_мероприятий_СМК.txt';
        link.click();
    };

    const isProtocolCompleted = (protocol: Protocol) => {
        return protocol.items.length > 0 && protocol.items.every(item => item.isCompleted);
    };

    const filteredProtocols = protocols.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.items.some(i => i.text.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className={styles.moduleContainer}>
            <Link href="/quality" className={styles.backLink}>← Вернуться в СМК</Link>
            
            <header className={styles.moduleHeader}>
                <h2>Планирование мероприятий СМК</h2>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input 
                    className={styles.searchInput} 
                    placeholder="Поиск по мероприятиям..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                {isAdmin && (
                    <>
                        <button className={styles.primaryBtn} onClick={() => setIsAddProtocolOpen(true)}>Добавить мероприятие</button>
                        <button className={styles.secondaryBtn} onClick={() => sendReminders(protocols.flatMap(p => p.items), 'Global Plan')}>Отправить всем</button>
                        <button className={styles.secondaryBtn} onClick={exportPlan}>Выгрузить отчет</button>
                    </>
                )}
            </div>

            <div className={styles.protocolsList}>
                {filteredProtocols.map(protocol => (
                    <div key={protocol.id} 
                        style={{ 
                            marginBottom: '2rem', 
                            borderRadius: '12px', 
                            overflow: 'hidden', 
                            border: '1px solid #eee',
                            background: isProtocolCompleted(protocol) ? '#dcfce7' : '#fee2e2'
                        }}
                    >
                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{protocol.title}</h3>
                            {isAdmin && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className={styles.smallBtn} onClick={() => sendReminders(protocol.items, protocol.title)}>🔔 Напоминание</button>
                                    <button className={styles.smallBtn} onClick={() => addItem(protocol.id)}>➕ Пункт</button>
                                    <button className={styles.smallBtn} style={{ color: 'red' }} onClick={() => saveProtocols(protocols.filter(p => p.id !== protocol.id))}>🗑️</button>
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '1rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                        <th style={{ padding: '0.75rem' }}>Мероприятие</th>
                                        <th style={{ padding: '0.75rem' }}>Ответственные</th>
                                        <th style={{ padding: '0.75rem' }}>Комментарий / Документы</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Статус</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {protocol.items.map(item => (
                                        <tr key={item.id} style={{ 
                                            borderBottom: '1px solid #f5f5f5',
                                            background: item.isCompleted ? '#f0fdf4' : '#fff1f2'
                                        }}>
                                            <td style={{ padding: '0.75rem' }}>
                                                {isAdmin ? (
                                                    <textarea 
                                                        value={item.text} 
                                                        onChange={e => updateItem(protocol.id, item.id, 'text', e.target.value)}
                                                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                                                    />
                                                ) : item.text}
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>
                                                {isAdmin ? (
                                                    <input 
                                                        value={item.responsibleEmails.join(', ')} 
                                                        onChange={e => updateItem(protocol.id, item.id, 'responsibleEmails', e.target.value.split(',').map(s => s.trim()))}
                                                        placeholder="email1, email2"
                                                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                                                    />
                                                ) : item.responsibleEmails.join(', ')}
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <textarea 
                                                    value={item.comment} 
                                                    onChange={e => updateItem(protocol.id, item.id, 'comment', e.target.value)}
                                                    placeholder="Введите комментарий по исполнению..."
                                                    style={{ width: '100%', marginBottom: '0.5rem' }}
                                                />
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {item.files.map((file, fidx) => (
                                                        <span key={fidx} style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                                            📄 {file.name}
                                                        </span>
                                                    ))}
                                                    <label style={{ cursor: 'pointer', fontSize: '0.75rem', color: 'var(--primary-blue)' }}>
                                                        📎 Прикрепить
                                                        <input type="file" onChange={e => handleFileUpload(e, protocol.id, item.id)} style={{ display: 'none' }} />
                                                    </label>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={item.isCompleted} 
                                                    onChange={e => updateItem(protocol.id, item.id, 'isCompleted', e.target.checked)} 
                                                />
                                                {isAdmin && (
                                                    <button onClick={() => deleteItem(protocol.id, item.id)} style={{ marginLeft: '1rem', border: 'none', background: 'none', cursor: 'pointer' }}>🗑️</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            {isAddProtocolOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>Добавить новое мероприятие</h3>
                        <div className={styles.formGroup}>
                            <label>Название протокола совещания</label>
                            <input value={newProtocolTitle} onChange={e => setNewProtocolTitle(e.target.value)} placeholder="Протокол №123 от 01.01.2025" />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className={styles.secondaryBtn} onClick={() => setIsAddProtocolOpen(false)}>Отмена</button>
                            <button className={styles.primaryBtn} onClick={addProtocol}>Создать</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
