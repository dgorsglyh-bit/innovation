'use client';

import { useState, useEffect } from 'react';
import styles from './CouncilPublic.module.css';
import { CouncilPlan, CouncilQuestion, CouncilFile } from './CouncilManager';

export default function CouncilPublic() {
    const [plans, setPlans] = useState<CouncilPlan[]>([]);
    const [archive, setArchive] = useState<CouncilFile[]>([]);
    const [approvedFiles, setApprovedFiles] = useState<Record<number, CouncilFile>>({});
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);

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

        const storedArchive = localStorage.getItem('innovation_council_archive');
        if (storedArchive) setArchive(JSON.parse(storedArchive));

        const storedApproved = localStorage.getItem('innovation_council_approved');
        if (storedApproved) setApprovedFiles(JSON.parse(storedApproved));
    }, []);

    const handleDownload = (file: CouncilFile) => {
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
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
            justification: `${newQuestion.justification} ${userName}`
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
                <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px dashed #ccc' }}>
                    <p style={{ color: '#666' }}>На данный момент планы НТС не загружены.</p>
                </div>
            )}
            {plans.map(plan => (
                <div key={plan.id} className={styles.planBlock}>
                    <h2 className={styles.planTitle}>{plan.title}</h2>

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
                                                <tr key={q.id}>
                                                    <td>{idx + 1}</td>
                                                    <td>{q.text}</td>
                                                    <td>{q.date}</td>
                                                    <td>{q.participants}</td>
                                                    <td>{q.preparers}</td>
                                                </tr>
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

                    {approvedFiles[plan.id] && (
                        <div style={{ marginTop: '2rem' }}>
                            <button className={styles.downloadLink} onClick={() => handleDownload(approvedFiles[plan.id])}>
                                📥 Утвержденный план научно-технического совета на {plan.title.match(/\d{4}/)?.[0] || 'год'}
                            </button>
                        </div>
                    )}
                </div>
            ))}

            <div className={styles.archive}>
                <button className={styles.archiveToggle} onClick={() => setIsArchiveOpen(!isArchiveOpen)}>
                    <span>{isArchiveOpen ? '[-]' : '[+]'}</span> Архив планов
                </button>
                {isArchiveOpen && (
                    <div className={styles.archiveContent}>
                        {archive.length === 0 ? (
                            <p style={{ color: '#999' }}>Архив пуст</p>
                        ) : (
                            archive.map(file => (
                                <button key={file.id} className={styles.archiveFile} onClick={() => handleDownload(file)}>
                                    📄 {file.name}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Submission Modal */}
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
                                    placeholder="Опишите вопрос..."
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Срок проведения</label>
                                <input
                                    type="text"
                                    value={newQuestion.date}
                                    onChange={e => setNewQuestion({ ...newQuestion, date: e.target.value })}
                                    placeholder="например, I квартал 2025"
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
