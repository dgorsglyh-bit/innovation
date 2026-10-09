'use client';

import { useState, useEffect } from 'react';
import styles from './NeedsManager.module.css';

export interface Need {
    id: number;
    number: number;
    name: string;
    description: string;
    date: string;
    author: string;
    note: string;
    status: 'pending' | 'accepted' | 'rejected';
}

interface NeedsManagerProps {
    isAdmin?: boolean;
}

export default function NeedsManager({ isAdmin = false }: NeedsManagerProps) {
    const [needs, setNeeds] = useState<Need[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newNeed, setNewNeed] = useState({ name: '', description: '' });

    useEffect(() => {
        const stored = localStorage.getItem('innovation_needs');
        if (stored) {
            setNeeds(JSON.parse(stored));
        }
    }, []);

    const saveNeeds = (updatedNeeds: Need[]) => {
        setNeeds(updatedNeeds);
        localStorage.setItem('innovation_needs', JSON.stringify(updatedNeeds));
    };

    const handleAddNeed = () => {
        const nextNumber = needs.length > 0 ? Math.max(...needs.map(n => n.number)) + 1 : 1;
        const need: Need = {
            id: Date.now(),
            number: nextNumber,
            name: newNeed.name,
            description: newNeed.description,
            date: new Date().toLocaleDateString(),
            author: 'Текущий пользователь', // In real app, from auth
            note: '',
            status: 'pending'
        };
        saveNeeds([...needs, need]);
        setNewNeed({ name: '', description: '' });
        setIsAddModalOpen(false);
    };

    const handleUpdateField = (id: number, field: keyof Need, value: any) => {
        const updated = needs.map(n => n.id === id ? { ...n, [field]: value } : n);
        saveNeeds(updated);
    };

    const handleDelete = (id: number) => {
        if (confirm('Удалить эту потребность?')) {
            saveNeeds(needs.filter(n => n.id !== id));
        }
    };

    const handleStatusChange = (id: number, status: 'accepted' | 'rejected') => {
        const updated = needs.map(n => {
            if (n.id === id) {
                const updatedNeed = { ...n, status };
                if (status === 'accepted') {
                    // Logic to add to R&D plan can be handled here or by pulling accepted needs in RndPlanManager
                    addToRndPlan(updatedNeed);
                }
                return updatedNeed;
            }
            return n;
        });
        saveNeeds(updated);
    };

    const addToRndPlan = (need: Need) => {
        const storedRnd = localStorage.getItem('innovation_rnd_plan');
        let rndProjects = storedRnd ? JSON.parse(storedRnd) : [];
        
        // Avoid duplicates
        if (!rndProjects.find((p: any) => p.title === need.name)) {
            rndProjects.push({
                id: Date.now(),
                title: need.name,
                status: 'planned',
                stages: [],
                files: []
            });
            localStorage.setItem('innovation_rnd_plan', JSON.stringify(rndProjects));
        }
    };

    const getRowStyle = (status: string) => {
        if (status === 'accepted') return { backgroundColor: '#d4edda' }; // Green
        if (status === 'rejected') return { backgroundColor: '#f8d7da' }; // Red
        return {};
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Сбор потребностей</h2>
                {!isAdmin && (
                    <button className={styles.addBtn} onClick={() => setIsAddModalOpen(true)}>
                        ➕ Добавить потребность
                    </button>
                )}
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>№</th>
                            <th>Наименование</th>
                            <th>Описание и обоснование</th>
                            <th>Дата</th>
                            <th>Автор</th>
                            <th>Примечание</th>
                            {isAdmin && <th>Действия</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {needs.map((need) => (
                            <tr key={need.id} style={getRowStyle(need.status)}>
                                <td>{need.number}</td>
                                <td>
                                    {!isAdmin ? (
                                        <input 
                                            className={styles.inlineInput}
                                            value={need.name}
                                            onChange={(e) => handleUpdateField(need.id, 'name', e.target.value)}
                                        />
                                    ) : (
                                        need.name
                                    )}
                                </td>
                                <td>
                                    {!isAdmin ? (
                                        <textarea 
                                            className={styles.inlineTextarea}
                                            value={need.description}
                                            onChange={(e) => handleUpdateField(need.id, 'description', e.target.value)}
                                        />
                                    ) : (
                                        need.description
                                    )}
                                </td>
                                <td>{need.date}</td>
                                <td>{need.author}</td>
                                <td>
                                    {isAdmin ? (
                                        <input 
                                            className={styles.inlineInput}
                                            value={need.note}
                                            onChange={(e) => handleUpdateField(need.id, 'note', e.target.value)}
                                        />
                                    ) : (
                                        need.note
                                    )}
                                </td>
                                {isAdmin && (
                                    <td>
                                        <div className={styles.adminActions}>
                                            <button 
                                                className={styles.acceptBtn} 
                                                title="Принять"
                                                onClick={() => handleStatusChange(need.id, 'accepted')}
                                            >✔️</button>
                                            <button 
                                                className={styles.rejectBtn} 
                                                title="Отклонить"
                                                onClick={() => handleStatusChange(need.id, 'rejected')}
                                            >❌</button>
                                            <button 
                                                className={styles.deleteBtn} 
                                                title="Удалить"
                                                onClick={() => handleDelete(need.id)}
                                            >🗑️</button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {needs.length === 0 && (
                            <tr>
                                <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                    Пока ничего не добавлено
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isAddModalOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>Новая потребность</h3>
                        <div className={styles.formGroup}>
                            <label>Наименование</label>
                            <input 
                                value={newNeed.name}
                                onChange={e => setNewNeed({...newNeed, name: e.target.value})}
                                placeholder="Введите название..."
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Описание и обоснование</label>
                            <textarea 
                                value={newNeed.description}
                                onChange={e => setNewNeed({...newNeed, description: e.target.value})}
                                placeholder="Опишите потребность..."
                                rows={4}
                            />
                        </div>
                        <div className={styles.modalBtns}>
                            <button className={styles.cancelBtn} onClick={() => setIsAddModalOpen(false)}>Отмена</button>
                            <button className={styles.confirmBtn} onClick={handleAddNeed}>Добавить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
