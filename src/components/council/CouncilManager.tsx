'use client';

import { useState, useEffect } from 'react';
import styles from './CouncilManager.module.css';

export interface CouncilQuestion {
    id: number;
    text: string;           // "Вопросы рассмотрения"
    date: string;           // "Срок проведения"
    participants: string;   // "Участники заседания"
    preparers: string;      // "Ответственные за подготовку"
    justification: string;  // "Обоснование целесообразности"
    protocols?: CouncilFile[];
}

export interface CouncilSection {
    id: number;
    title: string;
    questions: CouncilQuestion[];
}

export interface CouncilPlan {
    id: number;
    title: string; // e.g., "План НТС на 2025 год"
    sections: CouncilSection[];
}

export interface CouncilFile {
    id: number;
    name: string;
    data: string; // Base64
}

interface CouncilManagerProps {
    mode?: 'plan' | 'meetings';
}

export default function CouncilManager({ mode = 'plan' }: CouncilManagerProps) {
    const [plans, setPlans] = useState<CouncilPlan[]>([]);
    const [archive, setArchive] = useState<CouncilFile[]>([]);
    const [approvedFiles, setApprovedFiles] = useState<Record<number, CouncilFile>>({}); // planId -> file

    // Question Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);
    const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<CouncilQuestion | null>(null);
    const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const storedPlans = localStorage.getItem('innovation_council_plans');
        if (storedPlans) setPlans(JSON.parse(storedPlans));

        const storedArchive = localStorage.getItem('innovation_council_archive');
        if (storedArchive) setArchive(JSON.parse(storedArchive));

        const storedApproved = localStorage.getItem('innovation_council_approved');
        if (storedApproved) setApprovedFiles(JSON.parse(storedApproved));
    }, []);

    const savePlans = (newPlans: CouncilPlan[]) => {
        setPlans(newPlans);
        localStorage.setItem('innovation_council_plans', JSON.stringify(newPlans));
    };

    const saveArchive = (newArchive: CouncilFile[]) => {
        setArchive(newArchive);
        localStorage.setItem('innovation_council_archive', JSON.stringify(newArchive));
    };

    const saveApproved = (newApproved: Record<number, CouncilFile>) => {
        setApprovedFiles(newApproved);
        localStorage.setItem('innovation_council_approved', JSON.stringify(newApproved));
    };

    // Plans Management
    const addPlan = () => {
        const newPlan: CouncilPlan = {
            id: Date.now(),
            title: `План НТС на ${new Date().getFullYear() + 1} год`,
            sections: [
                { id: Date.now() + 1, title: 'Бюро', questions: [] }
            ]
        };
        savePlans([...plans, newPlan]);
    };

    const deletePlan = (id: number) => {
        if (confirm('Уверены, что хотите удалить план? Сначала будут скачаны отчетные Word-документы.')) {
            const plan = plans.find(p => p.id === id);
            if (plan) {
                exportToWord(plan);
                // In a real app we'd wait for download, but here we trigger and continue
                const updatedPlans = plans.filter(p => p.id !== id);
                savePlans(updatedPlans);

                const updatedApproved = { ...approvedFiles };
                delete updatedApproved[id];
                saveApproved(updatedApproved);
            }
        }
    };

    const updatePlanTitle = (id: number, title: string) => {
        const updated = plans.map(p => p.id === id ? { ...p, title } : p);
        savePlans(updated);
    };

    // Sections Management
    const addSection = (planId: number) => {
        const updated = plans.map(p => {
            if (p.id === planId) {
                return {
                    ...p,
                    sections: [...p.sections, { id: Date.now(), title: 'Новая секция', questions: [] }]
                };
            }
            return p;
        });
        savePlans(updated);
    };

    const addUnscheduledSection = (planId: number) => {
        const updated = plans.map(p => {
            if (p.id === planId) {
                return {
                    ...p,
                    sections: [...p.sections, { id: Date.now(), title: 'Внеплановое совещание', questions: [] }]
                };
            }
            return p;
        });
        savePlans(updated);
    };

    const deleteSection = (planId: number, sectionId: number) => {
        const updated = plans.map(p => {
            if (p.id === planId) {
                return { ...p, sections: p.sections.filter(s => s.id !== sectionId) };
            }
            return p;
        });
        savePlans(updated);
    };

    const updateSectionTitle = (planId: number, sectionId: number, title: string) => {
        const updated = plans.map(p => {
            if (p.id === planId) {
                return {
                    ...p,
                    sections: p.sections.map(s => s.id === sectionId ? { ...s, title } : s)
                };
            }
            return p;
        });
        savePlans(updated);
    };

    // Question Management
    const openQuestionModal = (planId: number, sectionId: number, question?: CouncilQuestion) => {
        setCurrentPlanId(planId);
        setCurrentSectionId(sectionId);
        setEditingQuestion(question || {
            id: Date.now(),
            text: '',
            date: '',
            participants: '',
            preparers: '',
            justification: '',
            protocols: []
        });
        setIsModalOpen(true);
    };

    const saveQuestion = () => {
        if (!editingQuestion || currentPlanId === null || currentSectionId === null) return;

        const updated = plans.map(p => {
            if (p.id === currentPlanId) {
                return {
                    ...p,
                    sections: p.sections.map(s => {
                        if (s.id === currentSectionId) {
                            const exists = s.questions.find(q => q.id === editingQuestion.id);
                            if (exists) {
                                return { ...s, questions: s.questions.map(q => q.id === editingQuestion.id ? editingQuestion : q) };
                            }
                            return { ...s, questions: [...s.questions, editingQuestion] };
                        }
                        return s;
                    })
                };
            }
            return p;
        });

        savePlans(updated);
        setIsModalOpen(false);
    };

    const deleteQuestion = (planId: number, sectionId: number, qId: number) => {
        const updated = plans.map(p => {
            if (p.id === planId) {
                return {
                    ...p,
                    sections: p.sections.map(s => {
                        if (s.id === sectionId) {
                            return { ...s, questions: s.questions.filter(q => q.id !== qId) };
                        }
                        return s;
                    })
                };
            }
            return p;
        });
        savePlans(updated);
    };

    const toggleQuestion = (id: number) => {
        setExpandedQuestions(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const openFile = (data: string) => {
        const win = window.open();
        if (win) {
            win.document.write(`<iframe src="${data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        }
    };

    const addProtocol = (planId: number, sectionId: number, questionId: number, file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result as string;
            const updated = plans.map(p => {
                if (p.id === planId) {
                    return {
                        ...p,
                        sections: p.sections.map(s => {
                            if (s.id === sectionId) {
                                return {
                                    ...s,
                                    questions: s.questions.map(q => {
                                        if (q.id === questionId) {
                                            return { ...q, protocols: [...(q.protocols || []), { id: Date.now(), name: file.name, data }] };
                                        }
                                        return q;
                                    })
                                };
                            }
                            return s;
                        })
                    };
                }
                return p;
            });
            savePlans(updated);
        };
        reader.readAsDataURL(file);
    };

    const deleteProtocol = (planId: number, sectionId: number, questionId: number, protocolId: number) => {
        const updated = plans.map(p => {
            if (p.id === planId) {
                return {
                    ...p,
                    sections: p.sections.map(s => {
                        if (s.id === sectionId) {
                            return {
                                ...s,
                                questions: s.questions.map(q => {
                                    if (q.id === questionId) {
                                        return { ...q, protocols: (q.protocols || []).filter(pr => pr.id !== protocolId) };
                                    }
                                    return q;
                                })
                            };
                        }
                        return s;
                    })
                };
            }
            return p;
        });
        savePlans(updated);
    };

    // Files Management
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, planId?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const data = reader.result as string;
            if (planId) {
                const newApproved = { ...approvedFiles, [planId]: { id: Date.now(), name: file.name, data } };
                saveApproved(newApproved);
            } else {
                const newArchive = [...archive, { id: Date.now(), name: file.name, data }];
                saveArchive(newArchive);
            }
        };
        reader.readAsDataURL(file);
    };

    const deleteArchiveFile = (id: number) => {
        saveArchive(archive.filter(f => f.id !== id));
    };

    const deleteApprovedFile = (planId: number) => {
        const updated = { ...approvedFiles };
        delete updated[planId];
        saveApproved(updated);
    };

    // Word Export
    const exportToWord = (plan: CouncilPlan) => {
        // Basic HTML to Word Blob trick
        let content = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Export</title></head>
            <body>
            <h1 style='text-align:center'>${plan.title}</h1>
        `;

        plan.sections.forEach(sec => {
            content += `<h3>${sec.title}</h3>`;
            content += `
                <table border='1' cellspacing='0' cellpadding='5' style='width:100%; border-collapse:collapse'>
                    <thead>
                        <tr style='background:#f0f0f0'>
                            <th>№</th>
                            <th>Вопросы рассмотрения</th>
                            <th>Срок проведения</th>
                            <th>Участники заседания</th>
                            <th>Ответственные за подготовку</th>
                            <th>Обоснование</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            sec.questions.forEach((q, idx) => {
                // Strip FIO from justification for Word as requested. 
                // In CouncilPublic we append " Иванов И.И." at the end.
                // We split by spaces and take all but the last 2 words if they look like FIO.
                const parts = q.justification.trim().split(' ');
                let justification = q.justification;
                if (parts.length > 2) {
                    const last = parts[parts.length - 1];
                    const prev = parts[parts.length - 2];
                    // Check if last two parts look like "Иванов И.И."
                    if (last.includes('.') && prev.length > 1) {
                        justification = parts.slice(0, -2).join(' ');
                    }
                }
                content += `
                    <tr>
                        <td>${idx + 1}</td>
                        <td>${q.text}</td>
                        <td>${q.date}</td>
                        <td>${q.participants}</td>
                        <td>${q.preparers}</td>
                        <td>${justification}</td>
                    </tr>
                `;
            });
            content += '</tbody></table><br>';
        });

        content += '</body></html>';

        const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${plan.title}.doc`;
        link.click();
    };

    return (
        <div className={styles.manager}>
            <div className={styles.header}>
                <h1>Управление планами НТС</h1>
                <button className={`${styles.actionBtn} ${styles.addBtn}`} onClick={addPlan}>
                    ➕ Добавить план
                </button>
            </div>

            {plans.map(plan => (
                <div key={plan.id} className={styles.planCard}>
                    <div className={styles.planTitleWrapper}>
                        <input
                            className={styles.planTitleInput}
                            value={plan.title}
                            onChange={(e) => updatePlanTitle(plan.id, e.target.value)}
                        />
                        <button className={`${styles.actionBtn} ${styles.exportBtn}`} onClick={() => exportToWord(plan)}>
                            📄 Выгрузить в Word
                        </button>
                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => deletePlan(plan.id)}>
                            🗑️ Удалить план
                        </button>
                    </div>

                    {plan.sections.map(section => (
                        <div key={section.id} className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <input
                                    className={styles.sectionTitleInput}
                                    value={section.title}
                                    onChange={(e) => updateSectionTitle(plan.id, section.id, e.target.value)}
                                />
                                <button className={`${styles.actionBtn} ${styles.addBtn}`} onClick={() => openQuestionModal(plan.id, section.id)}>
                                    ➕ Вопрос
                                </button>
                                <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => deleteSection(plan.id, section.id)}>
                                    🗑️
                                </button>
                            </div>

                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40px' }}>№</th>
                                            <th>Вопросы</th>
                                            <th>Срок</th>
                                            <th>Участники</th>
                                            <th>Ответственные</th>
                                            <th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {section.questions.map((q, qidx) => (
                                            <tbody key={q.id} style={{ display: 'contents' }}>
                                                <tr>
                                                    <td>{qidx + 1}</td>
                                                    <td
                                                        style={{
                                                            cursor: 'pointer',
                                                            color: expandedQuestions[q.id] ? '#0079C2' : 'inherit',
                                                            transition: 'color 0.2s',
                                                            fontWeight: expandedQuestions[q.id] ? '600' : 'normal'
                                                        }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.color = '#0079C2')}
                                                        onMouseLeave={(e) => {
                                                            if (!expandedQuestions[q.id]) e.currentTarget.style.color = 'inherit';
                                                        }}
                                                        onClick={() => toggleQuestion(q.id)}
                                                    >
                                                        {q.text} {expandedQuestions[q.id] ? '▴' : '▾'}
                                                    </td>
                                                    <td>{q.date}</td>
                                                    <td>{q.participants}</td>
                                                    <td>{q.preparers}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '5px' }}>
                                                            <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => openQuestionModal(plan.id, section.id, q)}>✏️</button>
                                                            <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => deleteQuestion(plan.id, section.id, q.id)}>🗑️</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedQuestions[q.id] && (
                                                    <tr>
                                                        <td colSpan={6} style={{ backgroundColor: '#f9fafb', padding: '1rem' }}>
                                                            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1rem' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                                                    <h5 style={{ margin: 0 }}>Протоколы совещания</h5>
                                                                    <div className={styles.fileInputWrapper}>
                                                                        <button className={`${styles.actionBtn} ${styles.addBtn}`}>➕ Добавить протокол</button>
                                                                        <input
                                                                            type="file"
                                                                            onChange={(e) => {
                                                                                const file = e.target.files?.[0];
                                                                                if (file) addProtocol(plan.id, section.id, q.id, file);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                                    <thead>
                                                                        <tr style={{ borderBottom: '1px solid #eee', fontSize: '0.85rem', color: '#666' }}>
                                                                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Название протокола</th>
                                                                            <th style={{ width: '100px', padding: '0.5rem' }}>Действия</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {(!q.protocols || q.protocols.length === 0) ? (
                                                                            <tr><td colSpan={2} style={{ textAlign: 'center', padding: '1rem', color: '#999' }}>Протоколы не добавлены</td></tr>
                                                                        ) : (
                                                                            q.protocols.map(p => (
                                                                                <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                                                                    <td
                                                                                        style={{ padding: '0.5rem', cursor: 'pointer', color: '#0079C2', textDecoration: 'underline' }}
                                                                                        onClick={() => openFile(p.data)}
                                                                                    >
                                                                                        📄 {p.name}
                                                                                    </td>
                                                                                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                                                        <button
                                                                                            className={styles.deleteBtn}
                                                                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'red' }}
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                deleteProtocol(plan.id, section.id, q.id, p.id);
                                                                                            }}
                                                                                        >🗑️</button>
                                                                                    </td>
                                                                                </tr>
                                                                            ))
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <button className={`${styles.actionBtn} ${styles.addBtn}`} onClick={() => addSection(plan.id)}>
                            ➕ Добавить секцию
                        </button>
                        <button className={`${styles.actionBtn} ${styles.addBtn}`} style={{ background: '#607d8b' }} onClick={() => addUnscheduledSection(plan.id)}>
                            ➕ Добавить внеплановое совещание
                        </button>
                    </div>

                    {mode === 'plan' && (
                        <div className={styles.approvedSection}>
                            <h4>Утвержденный файл</h4>
                            {approvedFiles[plan.id] ? (
                                <div className={styles.archiveItem}>
                                    <span>📄 {approvedFiles[plan.id].name}</span>
                                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => deleteApprovedFile(plan.id)}>Удалить</button>
                                </div>
                            ) : (
                                <div className={styles.fileInputWrapper}>
                                    <button className={`${styles.actionBtn} ${styles.fileBtn}`}>📁 Загрузить файл</button>
                                    <input type="file" onChange={(e) => handleFileUpload(e, plan.id)} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {mode === 'plan' && (
                <div className={styles.archiveSection}>
                    <h2>Архив планов</h2>
                    <div style={{ marginBottom: '1rem' }}>
                        <div className={styles.fileInputWrapper}>
                            <button className={`${styles.actionBtn} ${styles.addBtn}`}>➕ Добавить в архив</button>
                            <input type="file" onChange={(e) => handleFileUpload(e)} />
                        </div>
                    </div>
                    {archive.map(file => (
                        <div key={file.id} className={styles.archiveItem}>
                            <span>📦 {file.name}</span>
                            <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => deleteArchiveFile(file.id)}>Удалить</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Question Modal */}
            {isModalOpen && editingQuestion && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>{editingQuestion.id ? 'Редактировать вопрос' : 'Новый вопрос'}</h3>
                        <div className={styles.formGroup}>
                            <label>Вопросы рассмотрения</label>
                            <textarea
                                value={editingQuestion.text}
                                onChange={e => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                                rows={2}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Срок проведения</label>
                            <input
                                type="text"
                                value={editingQuestion.date}
                                onChange={e => setEditingQuestion({ ...editingQuestion, date: e.target.value })}
                                placeholder="I квартал"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Участники заседания</label>
                            <input
                                type="text"
                                value={editingQuestion.participants}
                                onChange={e => setEditingQuestion({ ...editingQuestion, participants: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Ответственные за подготовку</label>
                            <input
                                type="text"
                                value={editingQuestion.preparers}
                                onChange={e => setEditingQuestion({ ...editingQuestion, preparers: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Обоснование (с ФИО в конце)</label>
                            <textarea
                                value={editingQuestion.justification}
                                onChange={e => setEditingQuestion({ ...editingQuestion, justification: e.target.value })}
                                rows={3}
                                placeholder="Текст обоснования... Иванов И.И."
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Протоколы (файлы PDF/Word/Image)</label>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                {(editingQuestion.protocols || []).map(file => (
                                    <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px' }}>
                                        <span style={{ fontSize: '0.9rem' }}>{file.name}</span>
                                        <button
                                            onClick={() => {
                                                const updated = (editingQuestion.protocols || []).filter(f => f.id !== file.id);
                                                setEditingQuestion({ ...editingQuestion, protocols: updated });
                                            }}
                                            style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                        >✕</button>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.fileInputWrapper}>
                                <button className={`${styles.actionBtn} ${styles.fileBtn}`} style={{ width: '100%' }}>📁 Загрузить протокол</button>
                                <input
                                    type="file"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (re) => {
                                                const newFile: CouncilFile = {
                                                    id: Date.now(),
                                                    name: file.name,
                                                    data: re.target?.result as string
                                                };
                                                setEditingQuestion({
                                                    ...editingQuestion,
                                                    protocols: [...(editingQuestion.protocols || []), newFile]
                                                });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className={styles.btnGroup}>
                            <button className={`${styles.actionBtn} ${styles.fileBtn}`} onClick={() => setIsModalOpen(false)}>Отмена</button>
                            <button className={`${styles.actionBtn} ${styles.addBtn}`} onClick={saveQuestion}>Сохранить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
