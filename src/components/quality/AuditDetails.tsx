'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Quality.module.css';
import { Audit, Finding } from './AuditsProgram';

interface AuditDetailsProps {
    auditId: number;
    isAdmin?: boolean;
}

export default function AuditDetails({ auditId, isAdmin = false }: AuditDetailsProps) {
    const [audit, setAudit] = useState<Audit | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Finding Modal State
    const [isFindingModalOpen, setIsFindingModalOpen] = useState(false);
    const [editingFinding, setEditingFinding] = useState<Finding | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('qms_audits');
        if (stored) {
            const audits = JSON.parse(stored) as Audit[];
            const found = audits.find(a => a.id === auditId);
            if (found) setAudit(found);
        }
    }, [auditId]);

    const saveAudit = (updated: Audit) => {
        setAudit(updated);
        const stored = localStorage.getItem('qms_audits');
        if (stored) {
            const audits = JSON.parse(stored) as Audit[];
            const newAudits = audits.map(a => a.id === auditId ? updated : a);
            localStorage.setItem('qms_audits', JSON.stringify(newAudits));
            
            // Sync with Discrepancies (auto-update analytic/discrepancy list if needed)
            syncFindingsToGlobalList(newAudits);
        }
    };

    const syncFindingsToGlobalList = (allAudits: Audit[]) => {
        // Flat list of discrepancies for the "Несоответствия" section
        const discrepancies = allAudits.flatMap(a => 
            a.detailedFindings
                .filter(f => f.type === 'minor' || f.type === 'major')
                .map(f => ({ ...f, auditNumber: a.number, auditObject: a.object, auditCriteria: a.criteria }))
        );
        localStorage.setItem('qms_discrepancies', JSON.stringify(discrepancies));
    };

    const handleUpdateAudit = (field: keyof Audit, value: any) => {
        if (!audit) return;
        saveAudit({ ...audit, [field]: value });
    };

    const saveFinding = () => {
        if (!audit || !editingFinding) return;
        
        // Validation for discrepancies
        if ((editingFinding.type === 'minor' || editingFinding.type === 'major')) {
            if (!editingFinding.correction || !editingFinding.correctiveActions || !editingFinding.deadline || !editingFinding.responsible) {
                alert('Для несоответствий поля "Коррекция", "Корректирующие действия", "Срок" и "Ответственный" обязательны.');
                return;
            }
        }

        let newFindings;
        const exists = audit.detailedFindings.find(f => f.id === editingFinding.id);
        if (exists) {
            newFindings = audit.detailedFindings.map(f => f.id === editingFinding.id ? editingFinding : f);
        } else {
            newFindings = [...audit.detailedFindings, editingFinding];
        }

        // Update counts
        const counts = { none: 0, minor: 0, major: 0, observation: 0, achievement: 0 };
        newFindings.forEach(f => counts[f.type]++);

        saveAudit({ ...audit, detailedFindings: newFindings, findingsCount: counts });
        setIsFindingModalOpen(false);
    };

    const sendReminders = (finding?: Finding) => {
        const recipients = finding ? [finding.responsible] : audit?.detailedFindings.filter(f => !f.isCompleted).map(f => f.responsible) || [];
        if (recipients.length === 0) {
            alert('Нет ответственных для отправки напоминаний.');
            return;
        }
        console.log(`[REMINDER] Sending to: ${recipients.join(', ')}`);
        alert(`Напоминания отправлены ответственным: ${recipients.join(', ')}`);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fId: number) => {
        const file = e.target.files?.[0];
        if (!file || !audit) return;
        const reader = new FileReader();
        reader.onload = (re) => {
            const fileData = { name: file.name, data: re.target?.result as string };
            const updatedFindings = audit.detailedFindings.map(f => {
                if (f.id === fId) return { ...f, files: [...f.files, fileData] };
                return f;
            });
            saveAudit({ ...audit, detailedFindings: updatedFindings });
        };
        reader.readAsDataURL(file);
    };

    if (!audit) return <div>Загрузка...</div>;

    return (
        <div className={styles.moduleContainer}>
            <Link href="/quality/audits" className={styles.backLink}>← Вернуться к программе</Link>
            
            <header className={styles.moduleHeader} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <h2>Аудит №{audit.number}</h2>
                    <p>{audit.object} - {audit.criteria}</p>
                </div>
                {isAdmin && (
                    <button className={styles.primaryBtn} onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? 'Закрыть редактирование' : 'Редактировать аудит'}
                    </button>
                )}
            </header>

            <section className={styles.auditInfo} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                    <h4>Общая информация</h4>
                    {isEditing ? (
                        <>
                            <div className={styles.formGroup}><label>Номер</label><input value={audit.number} onChange={e => handleUpdateAudit('number', e.target.value)} /></div>
                            <div className={styles.formGroup}><label>Объект</label><input value={audit.object} onChange={e => handleUpdateAudit('object', e.target.value)} /></div>
                            <div className={styles.formGroup}><label>Дата проведения</label><input type="date" value={audit.date} onChange={e => handleUpdateAudit('date', e.target.value)} /></div>
                        </>
                    ) : (
                        <div style={{ marginTop: '1rem' }}>
                            <p><strong>Дата:</strong> {audit.date || 'Не указана'}</p>
                            <p><strong>Группа:</strong> {audit.group}</p>
                            <p><strong>Период:</strong> {audit.period}</p>
                        </div>
                    )}
                </div>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                    <h4>Результаты</h4>
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                        <li>✅ Достижения: {audit.findingsCount.achievement}</li>
                        <li>⚠️ Наблюдения: {audit.findingsCount.observation}</li>
                        <li>🔴 Несоответствия: {audit.findingsCount.minor + audit.findingsCount.major}</li>
                    </ul>
                </div>
            </section>

            <section className={styles.findingsSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <h3>Выявленные несоответствия / достижения / наблюдения</h3>
                    {isAdmin && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className={styles.secondaryBtn} onClick={() => sendReminders()}>Отправить напоминания всем</button>
                            <button className={styles.primaryBtn} onClick={() => { setEditingFinding({id: Date.now(), type: 'none', description: '', correction: '', correctiveActions: '', deadline: '', responsible: '', isCompleted: false, comment: '', files: []}); setIsFindingModalOpen(true); }}>➕ Добавить запись</button>
                        </div>
                    )}
                </div>

                <div className={styles.tableWrapper}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '0.75rem' }}>Тип</th>
                                <th style={{ padding: '0.75rem' }}>Описание</th>
                                <th style={{ padding: '0.75rem' }}>Мероприятия / Ответственный</th>
                                <th style={{ padding: '0.75rem' }}>Комментарий / Файлы</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            {audit.detailedFindings.map(finding => (
                                <tr key={finding.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span className={styles.statusBadge} data-type={finding.type} style={{ 
                                            padding: '0.2rem 0.5rem', 
                                            borderRadius: '4px', 
                                            fontSize: '0.75rem', 
                                            background: finding.type === 'major' ? '#fee2e2' : finding.type === 'minor' ? '#fff7ed' : finding.type === 'achievement' ? '#ecfdf5' : '#f1f5f9'
                                        }}>
                                            {finding.type === 'major' ? 'НЕЗН. НЕСООТВ.' : finding.type === 'minor' ? 'МАЛОЗН. НЕСООТВ.' : finding.type === 'observation' ? 'НАБЛЮДЕНИЕ' : finding.type === 'achievement' ? 'ДОСТИЖЕНИЕ' : 'НЕ ВЫЯВЛЕНО'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>{finding.description}</td>
                                    <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                                        {finding.correctiveActions && (
                                            <div>
                                                <p><strong>КД:</strong> {finding.correctiveActions}</p>
                                                <p><strong>Срок:</strong> {finding.deadline}</p>
                                                <p><strong>Отв:</strong> {finding.responsible}</p>
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <textarea 
                                            value={finding.comment} 
                                            onChange={e => {
                                                const updated = audit.detailedFindings.map(f => f.id === finding.id ? { ...f, comment: e.target.value } : f);
                                                saveAudit({ ...audit, detailedFindings: updated });
                                            }}
                                            style={{ width: '100%', border: '1px solid #eee', fontSize: '0.8rem' }}
                                            placeholder="Комментарии..."
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                            {finding.files.map((file, fidx) => <span key={fidx} style={{ fontSize: '0.7rem' }}>📄 {file.name}</span>)}
                                            <label style={{ fontSize: '0.7rem', color: 'var(--primary-blue)', cursor: 'pointer' }}>
                                                📎 Добавить файл
                                                <input type="file" style={{ display: 'none' }} onChange={e => handleFileUpload(e, finding.id)} />
                                            </label>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={finding.isCompleted} 
                                            onChange={e => {
                                                const updated = audit.detailedFindings.map(f => f.id === finding.id ? { ...f, isCompleted: e.target.checked } : f);
                                                saveAudit({ ...audit, detailedFindings: updated });
                                            }} 
                                        />
                                        {isAdmin && (
                                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                                                <button onClick={() => { setEditingFinding(finding); setIsFindingModalOpen(true); }}>✏️</button>
                                                <button onClick={() => sendReminders(finding)}>🔔</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {isFindingModalOpen && editingFinding && (
                <div className={styles.modal}>
                    <div className={styles.modalContent} style={{ maxWidth: '700px' }}>
                        <h3>{editingFinding.id ? 'Редактировать запись' : 'Новая запись аудита'}</h3>
                        <div className={styles.formGroup}>
                            <label>Тип</label>
                            <select value={editingFinding.type} onChange={e => setEditingFinding({...editingFinding, type: e.target.value as any})}>
                                <option value="none">Не выявлено</option>
                                <option value="minor">Несоответствие малозначительное</option>
                                <option value="major">Несоответствие значительное</option>
                                <option value="observation">Наблюдение</option>
                                <option value="achievement">Достижение</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Описание</label>
                            <textarea value={editingFinding.description} onChange={e => setEditingFinding({...editingFinding, description: e.target.value})} rows={2} />
                        </div>
                        
                        {(editingFinding.type === 'minor' || editingFinding.type === 'major') && (
                            <div style={{ padding: '1rem', background: '#fff1f2', borderRadius: '8px', marginBottom: '1rem' }}>
                                <div className={styles.formGroup}>
                                    <label>Коррекция (обязательно)</label>
                                    <input value={editingFinding.correction} onChange={e => setEditingFinding({...editingFinding, correction: e.target.value})} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Корректирующие действия (обязательно)</label>
                                    <textarea value={editingFinding.correctiveActions} onChange={e => setEditingFinding({...editingFinding, correctiveActions: e.target.value})} rows={2} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className={styles.formGroup}>
                                        <label>Срок (обязательно)</label>
                                        <input type="date" value={editingFinding.deadline} onChange={e => setEditingFinding({...editingFinding, deadline: e.target.value})} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Ответственный исполнитель (обязательно)</label>
                                        <input value={editingFinding.responsible} onChange={e => setEditingFinding({...editingFinding, responsible: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className={styles.secondaryBtn} onClick={() => setIsFindingModalOpen(false)}>Отмена</button>
                            <button className={styles.primaryBtn} onClick={saveFinding}>Сохранить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
