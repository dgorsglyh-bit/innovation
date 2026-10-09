'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Quality.module.css';

interface Question {
    id: number;
    text: string;
    options: string[];
    correctIndex: number;
}

interface TrainingModuleProps {
    isAdmin?: boolean;
}

const DEFAULT_QUESTIONS: Question[] = [
    {
        id: 1,
        text: 'Что является основной целью Системы менеджмента качества?',
        options: ['Снижение затрат', 'Постоянное улучшение деятельности и удовлетворенность потребителей', 'Увеличение штата сотрудников', 'Для галочки'],
        correctIndex: 1
    },
    {
        id: 2,
        text: 'Как часто должен проводиться внутренний аудит?',
        options: ['Раз в 10 лет', 'Никогда', 'Согласно утвержденному графику (не реже раза в год)', 'По желанию сотрудников'],
        correctIndex: 2
    }
];

export default function TrainingModule({ isAdmin = false }: TrainingModuleProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [showConfirmName, setShowConfirmName] = useState(false);
    const [userName, setUserName] = useState('');
    const [testResult, setTestResult] = useState<{ score: number, total: number } | null>(null);

    // Admin state
    const [isEditing, setIsEditing] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('qms_training_questions');
        if (stored) {
            setQuestions(JSON.parse(stored));
        } else {
            setQuestions(DEFAULT_QUESTIONS);
            localStorage.setItem('qms_training_questions', JSON.stringify(DEFAULT_QUESTIONS));
        }
    }, []);

    const saveQuestions = (newQuestions: Question[]) => {
        setQuestions(newQuestions);
        localStorage.setItem('qms_training_questions', JSON.stringify(newQuestions));
    };

    const handleAnswer = (qId: number, oIdx: number) => {
        setUserAnswers(prev => ({ ...prev, [qId]: oIdx }));
    };

    const submitTest = () => {
        if (Object.keys(userAnswers).length < questions.length) {
            alert('Пожалуйста, ответьте на все вопросы.');
            return;
        }
        setShowConfirmName(true);
    };

    const confirmResult = () => {
        if (!userName.trim()) return;

        let score = 0;
        questions.forEach(q => {
            if (userAnswers[q.id] === q.correctIndex) score++;
        });

        const result = { score, total: questions.length };
        setTestResult(result);
        setShowConfirmName(false);

        // Simulate e-mail sending
        console.log(`[EMAIL SENDING] To: VyatkinaAA@irkutsk-dobycha.gazprom.ru. Content: User ${userName} scored ${score}/${questions.length}`);
        alert(`Результат отправлен на почту администратору: ${userName} - ${score}/${questions.length}`);
    };

    // Admin Handlers
    const addQuestion = () => {
        setEditingQuestion({ id: Date.now(), text: '', options: ['', '', '', ''], correctIndex: 0 });
        setIsEditing(true);
    };

    const saveEditing = () => {
        if (!editingQuestion) return;
        const index = questions.findIndex(q => q.id === editingQuestion.id);
        let newQuestions;
        if (index > -1) {
            newQuestions = questions.map(q => q.id === editingQuestion.id ? editingQuestion : q);
        } else {
            newQuestions = [...questions, editingQuestion];
        }
        saveQuestions(newQuestions);
        setIsEditing(false);
        setEditingQuestion(null);
    };

    const deleteQuestion = (id: number) => {
        if (confirm('Удалить вопрос?')) {
            saveQuestions(questions.filter(q => q.id !== id));
        }
    };

    return (
        <div className={styles.moduleContainer}>
            <Link href="/quality" className={styles.backLink}>← Вернуться в СМК</Link>
            
            <header className={styles.moduleHeader}>
                <h2>Раздел «Обучение»</h2>
            </header>

            {!isAdmin ? (
                <>
                    <section className={styles.videoSection}>
                        <h3>Ознакомительный видеоинструктаж</h3>
                        <div className={styles.videoPlaceholder}>
                            ▶️ Видеоплеер (Инструктаж по СМК)
                        </div>
                        <div className={styles.qrSection}>
                            <div className={styles.qrImage}>
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com/briefing" alt="QR Code" style={{width: '100%'}} />
                            </div>
                            <div>
                                <p><strong>QR-код на видеоинструктаж</strong></p>
                                <p>Отсканируйте, чтобы посмотреть на мобильном устройстве</p>
                                <a href="#" style={{color: 'var(--primary-blue)'}}>Презентации / Методические пособия (Скачать)</a>
                            </div>
                        </div>
                    </section>

                    <section className={styles.testSection}>
                        <h3>Тестирование по результатам обучения</h3>
                        {testResult ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <h4 style={{ color: 'green', fontSize: '2rem' }}>Ваш результат: {testResult.score} / {testResult.total}</h4>
                                <p>Спасибо за прохождение теста, {userName}!</p>
                                <button className={styles.primaryBtn} onClick={() => { setTestResult(null); setUserAnswers({}); setUserName(''); }}>Пройти снова</button>
                            </div>
                        ) : (
                            <>
                                {questions.map((q, idx) => (
                                    <div key={q.id} className={styles.question}>
                                        <h4>{idx + 1}. {q.text}</h4>
                                        <div className={styles.options}>
                                            {q.options.map((opt, oIdx) => (
                                                <label key={oIdx} className={styles.optionLabel}>
                                                    <input 
                                                        type="radio" 
                                                        name={`q-${q.id}`} 
                                                        checked={userAnswers[q.id] === oIdx}
                                                        onChange={() => handleAnswer(q.id, oIdx)}
                                                    />
                                                    {opt}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <button className={styles.primaryBtn} onClick={submitTest}>Посмотреть результат</button>
                            </>
                        )}
                    </section>

                    {showConfirmName && (
                        <div className={styles.modal}>
                            <div className={styles.modalContent}>
                                <h3>Подтвердите данные</h3>
                                <div className={styles.formGroup}>
                                    <label>Введите ваше ФИО</label>
                                    <input 
                                        type="text" 
                                        value={userName} 
                                        onChange={e => setUserName(e.target.value)} 
                                        placeholder="Иванов Иван Иванович"
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button className={styles.secondaryBtn} onClick={() => setShowConfirmName(false)}>Отмена</button>
                                    <button className={styles.primaryBtn} onClick={confirmResult} disabled={!userName.trim()}>Подтвердить</button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h3>Управление тестами</h3>
                        <button className={styles.primaryBtn} onClick={addQuestion}>➕ Добавить вопрос</button>
                    </div>

                    <div className={styles.tableWrapper}>
                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                            <thead>
                                <tr style={{background: '#f8fafc', borderBottom: '2px solid #e2e8f0'}}>
                                    <th style={{padding: '1rem', textAlign: 'left'}}>Вопрос</th>
                                    <th style={{padding: '1rem', textAlign: 'left'}}>Верный ответ</th>
                                    <th style={{padding: '1rem', textAlign: 'right'}}>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map(q => (
                                    <tr key={q.id} style={{borderBottom: '1px solid #eee'}}>
                                        <td style={{padding: '1rem'}}>{q.text}</td>
                                        <td style={{padding: '1rem'}}>{q.options[q.correctIndex]}</td>
                                        <td style={{padding: '1rem', textAlign: 'right'}}>
                                            <button onClick={() => { setEditingQuestion(q); setIsEditing(true); }} style={{marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer'}}>✏️</button>
                                            <button onClick={() => deleteQuestion(q.id)} style={{background: 'none', border: 'none', cursor: 'pointer'}}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {isEditing && editingQuestion && (
                        <div className={styles.modal}>
                            <div className={styles.modalContent} style={{maxWidth: '600px'}}>
                                <h3>{editingQuestion.id ? 'Редактировать вопрос' : 'Новый вопрос'}</h3>
                                <div className={styles.formGroup}>
                                    <label>Текст вопроса</label>
                                    <textarea 
                                        value={editingQuestion.text} 
                                        onChange={e => setEditingQuestion({...editingQuestion, text: e.target.value})}
                                        rows={2}
                                    />
                                </div>
                                {editingQuestion.options.map((opt, idx) => (
                                    <div key={idx} className={styles.formGroup} style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                                        <input 
                                            type="radio" 
                                            checked={editingQuestion.correctIndex === idx} 
                                            onChange={() => setEditingQuestion({...editingQuestion, correctIndex: idx})}
                                        />
                                        <input 
                                            type="text" 
                                            value={opt} 
                                            onChange={e => {
                                                const newOpts = [...editingQuestion.options];
                                                newOpts[idx] = e.target.value;
                                                setEditingQuestion({...editingQuestion, options: newOpts});
                                            }}
                                            placeholder={`Вариант ${idx + 1}`}
                                        />
                                    </div>
                                ))}
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                    <button className={styles.secondaryBtn} onClick={() => setIsEditing(false)}>Отмена</button>
                                    <button className={styles.primaryBtn} onClick={saveEditing}>Сохранить</button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
