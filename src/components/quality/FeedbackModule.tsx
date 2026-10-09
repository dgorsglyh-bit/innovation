'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Quality.module.css';

interface Department {
    id: number;
    name: string;
    slug: string;
}

interface FeedbackModuleProps {
    isAdmin?: boolean;
}

const DEFAULT_DEPTS: Department[] = [
    { id: 1, name: 'УТТиСТ', slug: 'uttist' },
    { id: 2, name: 'Управление связи', slug: 'связь' },
    { id: 3, name: 'Служба ИТ', slug: 'it' }
];

export default function FeedbackModule({ isAdmin = false }: FeedbackModuleProps) {
    const [depts, setDepts] = useState<Department[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('qms_feedback_depts');
        if (stored) setDepts(JSON.parse(stored));
        else {
            setDepts(DEFAULT_DEPTS);
            localStorage.setItem('qms_feedback_depts', JSON.stringify(DEFAULT_DEPTS));
        }
    }, []);

    const saveDepts = (newDepts: Department[]) => {
        setDepts(newDepts);
        localStorage.setItem('qms_feedback_depts', JSON.stringify(newDepts));
    };

    const handleSave = () => {
        if (!editingDept) return;
        let newDepts;
        if (depts.find(d => d.id === editingDept.id)) {
            newDepts = depts.map(d => d.id === editingDept.id ? editingDept : d);
        } else {
            newDepts = [...depts, { ...editingDept, id: Date.now() }];
        }
        saveDepts(newDepts);
        setIsEditing(false);
    };

    const deleteDept = (id: number) => {
        if (confirm('Удалить службу?')) {
            saveDepts(depts.filter(d => d.id !== id));
        }
    };

    return (
        <div className={styles.moduleContainer}>
            <Link href="/quality" className={styles.backLink}>← Вернуться в СМК</Link>
            
            <header className={styles.moduleHeader}>
                <h2>Обратная связь</h2>
                <p>Перечень управлений/служб, проводящих обратную связь</p>
            </header>

            {isAdmin && (
                <div style={{ marginBottom: '2rem' }}>
                    <button className={styles.primaryBtn} onClick={() => { setEditingDept({ id: 0, name: '', slug: '' }); setIsEditing(true); }}>
                        ➕ Добавить подразделение
                    </button>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {depts.map(dept => (
                    <div key={dept.id} style={{
                        padding: '1.5rem',
                        border: '1px solid #eee',
                        borderRadius: '12px',
                        background: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Link 
                            href={`/quality/feedback/${dept.slug}`} 
                            target="_blank"
                            style={{ fontWeight: '600', color: 'var(--primary-blue)', fontSize: '1.1rem' }}
                        >
                            🏢 {dept.name}
                        </Link>
                        {isAdmin && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => { setEditingDept(dept); setIsEditing(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                                <button onClick={() => deleteDept(dept.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isEditing && editingDept && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>{editingDept.id ? 'Редактировать' : 'Новое подразделение'}</h3>
                        <div className={styles.formGroup}>
                            <label>Название</label>
                            <input 
                                value={editingDept.name} 
                                onChange={e => setEditingDept({...editingDept, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                                placeholder="УТТиСТ"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className={styles.secondaryBtn} onClick={() => setIsEditing(false)}>Отмена</button>
                            <button className={styles.primaryBtn} onClick={handleSave}>Сохранить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
