'use client';

import { useState, useEffect } from 'react';
import styles from './CouncilMeetings.module.css';
import { CouncilPlan, CouncilQuestion, CouncilFile } from './CouncilManager';

export default function CouncilMeetings() {
    const [plans, setPlans] = useState<CouncilPlan[]>([]);
    const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

    // Submission Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetPlanId, setTargetPlanId] = useState<number | null>(null);
    const [targetSectionId, setTargetSectionId] = useState<number | null>(null);
    const [userName, setUserName] = useState('');
    const [newQuestion, setNewQuestion] = useState({
        text: '',
        date: '',
        participants: '',
        preparers: '',
        justification: ''
    });

    useEffect(() => {
        const storedPlans = localStorage.getItem('innovation_council_plans');
        if (storedPlans) setPlans(JSON.parse(storedPlans));
    }, []);

    const toggleQuestion = (questionId: number) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    const handleDownload = (file: CouncilFile) => {
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        link.target = '_blank'; // Open in new window/tab
        link.click();
    };

    const openSubmission = (planId: number, sectionId: number) => {
        setTargetPlanId(planId);
        setTargetSectionId(sectionId);
        setIsModalOpen(true);
    };

    const submitQuestion = () => {
        if (!userName || !newQuestion.text || targetPlanId === null || targetSectionId === null) {
            alert('Пожалуйста, заполните основные поля и ФИО');
            return;
        }

        const questionToSubmit: CouncilQuestion = {
            id: Date.now(),
            ...newQuestion,
            justification: `${newQuestion.justification} ${userName}`,
            protocols: []
        };

        const updatedPlans = plans.map(p => {
            if (p.id === targetPlanId) {
                return {
                    ...p,
                    sections: p.sections.map(s => {
                        if (s.id === targetSectionId) {
                            return { ...s, questions: [...s.questions, questionToSubmit] };
                        }
                        return s;
                    })
                };
            }
            return p;
        });

        setPlans(updatedPlans);
        localStorage.setItem('innovation_council_plans', JSON.stringify(updatedPlans));
        setIsModalOpen(false);
        setUserName('');
        setNewQuestion({ text: '', date: '', participants: '', preparers: '', justification: '' });
        alert('Вопрос успешно внесен на рассмотрение');
    };

    return (
        <div className={styles.public}>
            {plans.length === 0 && (
                <div className={styles.emptyState}>
                    <p>На данный момент совещания не запланированы.</p>
                </div>
            )}

            {plans.map(plan => (
                <div key={plan.id} className={styles.planBlock}>
                    <h2 className={styles.planTitle}>{plan.title} (Совещания)</h2>

                    {plan.sections.map(section => (
                        <div key={section.id} className={styles.section}>
                            <h3 className={styles.sectionTitle}>{section.title}</h3>
                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40px' }}>№</th>
                                            <th>Вопросы рассмотрения</th>
                                            <th>Срок проведения</th>
                                            <th>Участники заседания</th>
                                            <th>Ответственные за подготовку</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {section.questions.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} style={{ textAlign: 'center', color: '#999' }}>Вопросов пока нет</td>
                                            </tr>
                                        ) : (
                                            section.questions.map((q, idx) => (
                                                <body key={q.id} style={{ display: 'contents' }}>
                                                    <tr>
                                                        <td>{idx + 1}</td>
                                                        <td
                                                            className={styles.clickableQuestion}
                                                            onClick={() => toggleQuestion(q.id)}
                                                        >
                                                            {q.text}
                                                        </td>
                                                        <td>{q.date}</td>
                                                        <td>{q.participants}</td>
                                                        <td>{q.preparers}</td>
                                                    </tr>
                                                    {expandedQuestions[q.id] && (
                                                        <tr className={styles.subTableRow}>
                                                            <td colSpan={5}>
                                                                <div className={styles.subTableContainer}>
                                                                    <table className={styles.subTable}>
                                                                        <thead>
                                                                            <tr>
                                                                                <th style={{ width: '40px' }}>№</th>
                                                                                <th>Протокол</th>
                                                                                <th style={{ width: '120px' }}>Файл</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {!q.protocols || q.protocols.length === 0 ? (
                                                                                <tr>
                                                                                    <td colSpan={3} style={{ textAlign: 'center', color: '#999' }}>Протоколы не добавлены</td>
                                                                                </tr>
                                                                            ) : (
                                                                                q.protocols.map((p, pIdx) => (
                                                                                    <tr key={p.id}>
                                                                                        <td>{pIdx + 1}</td>
                                                                                        <td>{p.name}</td>
                                                                                        <td>
                                                                                            <button
                                                                                                className={styles.downloadBtn}
                                                                                                onClick={() => handleDownload(p)}
                                                                                                title="Открыть в новом окне"
                                                                                            >
                                                                                                📎 Открыть
                                                                                            </button>
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
                                                </body>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <button className={styles.submitBtn} onClick={() => openSubmission(plan.id, section.id)}>
                                ✍️ Внести вопрос на рассмотрение
                            </button>
                        </div>
                    ))}
                </div>
            ))}

            {/* Submission Modal (Same as Public Plan) */}
            {isModalOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-blue)' }}>Внести вопрос на рассмотрение</h2>
                        <div className={styles.formGrid}>
                            <div className={`${styles.field} ${styles.fullWidth}`}>
                                <label>Вопрос рассмотрения *</label>
                                <textarea
                                    value={newQuestion.text}
                                    onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                    rows={2}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Срок проведения</label>
                                <input
                                    type="text"
                                    value={newQuestion.date}
                                    onChange={e => setNewQuestion({ ...newQuestion, date: e.target.value })}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Участники заседания</label>
                                <input
                                    type="text"
                                    value={newQuestion.participants}
                                    onChange={e => setNewQuestion({ ...newQuestion, participants: e.target.value })}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Ответственные за подготовку</label>
                                <input
                                    type="text"
                                    value={newQuestion.preparers}
                                    onChange={e => setNewQuestion({ ...newQuestion, preparers: e.target.value })}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Ваше ФИО *</label>
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={e => setUserName(e.target.value)}
                                    placeholder="Иванов И.И."
                                />
                            </div>
                            <div className={`${styles.field} ${styles.fullWidth}`}>
                                <label>Обоснование целесообразности рассмотрения вопроса</label>
                                <textarea
                                    value={newQuestion.justification}
                                    onChange={e => setNewQuestion({ ...newQuestion, justification: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className={styles.btnGroup}>
                            <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Отмена</button>
                            <button className={styles.submitBtn} onClick={submitQuestion}>Отправить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
