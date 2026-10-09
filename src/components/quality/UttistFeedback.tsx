'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Quality.module.css';

interface SurveyEntry {
    id: number;
    userName: string;
    date: string;
    rating: number;
    suggestion: string;
}

interface MeasureEntry {
    suggestionId: number;
    measure: string;
    status: string;
}

interface UttistFeedbackProps {
    isAdmin?: boolean;
}

export default function UttistFeedback({ isAdmin = false }: UttistFeedbackProps) {
    const [activeTab, setActiveTab] = useState<'survey' | 'results' | 'measures'>('survey');
    const [surveys, setSurveys] = useState<SurveyEntry[]>([]);
    const [measures, setMeasures] = useState<Record<number, MeasureEntry>>({});
    
    // Form state
    const [newSurvey, setNewSurvey] = useState({ userName: '', rating: 5, suggestion: '' });

    useEffect(() => {
        const storedSurveys = localStorage.getItem('qms_uttist_surveys');
        if (storedSurveys) setSurveys(JSON.parse(storedSurveys));

        const storedMeasures = localStorage.getItem('qms_uttist_measures');
        if (storedMeasures) setMeasures(JSON.parse(storedMeasures));
    }, []);

    const saveSurveys = (newSurveys: SurveyEntry[]) => {
        setSurveys(newSurveys);
        localStorage.setItem('qms_uttist_surveys', JSON.stringify(newSurveys));
    };

    const saveMeasures = (newMeasures: Record<number, MeasureEntry>) => {
        setMeasures(newMeasures);
        localStorage.setItem('qms_uttist_measures', JSON.stringify(newMeasures));
    };

    const handleSurveySubmit = () => {
        if (!newSurvey.suggestion.trim()) return;
        const entry: SurveyEntry = {
            id: Date.now(),
            userName: newSurvey.userName || 'Аноним',
            date: new Date().toLocaleDateString(),
            rating: newSurvey.rating,
            suggestion: newSurvey.suggestion
        };
        saveSurveys([...surveys, entry]);
        setNewSurvey({ userName: '', rating: 5, suggestion: '' });
        alert('Спасибо! Ваша обратная связь принята.');
    };

    const updateMeasure = (sId: number, field: 'measure' | 'status', value: string) => {
        const updated = { 
            ...measures, 
            [sId]: { 
                ...(measures[sId] || { suggestionId: sId, measure: '', status: '' }), 
                [field]: value 
            } 
        };
        saveMeasures(updated);
    };

    return (
        <div className={styles.moduleContainer}>
            <Link href="/quality/feedback" className={styles.backLink}>← Вернуться к списку служб</Link>
            <header className={styles.moduleHeader}>
                <h2>Обратная связь: УТТиСТ</h2>
            </header>

            <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #eee' }}>
                <button 
                    onClick={() => setActiveTab('survey')} 
                    style={{ 
                        padding: '1rem', 
                        border: 'none', 
                        background: 'none', 
                        cursor: 'pointer',
                        borderBottom: activeTab === 'survey' ? '3px solid var(--primary-blue)' : 'none',
                        fontWeight: activeTab === 'survey' ? '700' : '400'
                    }}
                >Анкетирование</button>
                <button 
                    onClick={() => setActiveTab('results')} 
                    style={{ 
                        padding: '1rem', 
                        border: 'none', 
                        background: 'none', 
                        cursor: 'pointer',
                        borderBottom: activeTab === 'results' ? '3px solid var(--primary-blue)' : 'none',
                        fontWeight: activeTab === 'results' ? '700' : '400'
                    }}
                >Результаты</button>
                <button 
                    onClick={() => setActiveTab('measures')} 
                    style={{ 
                        padding: '1rem', 
                        border: 'none', 
                        background: 'none', 
                        cursor: 'pointer',
                        borderBottom: activeTab === 'measures' ? '3px solid var(--primary-blue)' : 'none',
                        fontWeight: activeTab === 'measures' ? '700' : '400'
                    }}
                >Меры по улучшению</button>
            </nav>

            <main>
                {activeTab === 'survey' && (
                    <div className={styles.testSection} style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h3>Пройти анкетирование</h3>
                        <div className={styles.formGroup}>
                            <label>Ваше ФИО (необязательно)</label>
                            <input 
                                value={newSurvey.userName} 
                                onChange={e => setNewSurvey({...newSurvey, userName: e.target.value})}
                                placeholder="Иванов И.И."
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Оценка качества услуг (1-5)</label>
                            <select 
                                value={newSurvey.rating} 
                                onChange={e => setNewSurvey({...newSurvey, rating: parseInt(e.target.value)})}
                            >
                                <option value="5">5 - Отлично</option>
                                <option value="4">4 - Хорошо</option>
                                <option value="3">3 - Удовлетворительно</option>
                                <option value="2">2 - Плохо</option>
                                <option value="1">1 - Очень плохо</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Ваши пожелания/замечания/предложения</label>
                            <textarea 
                                value={newSurvey.suggestion} 
                                onChange={e => setNewSurvey({...newSurvey, suggestion: e.target.value})}
                                rows={4}
                                placeholder="Напишите здесь всё, что поможет нам стать лучше..."
                            />
                        </div>
                        <button className={styles.primaryBtn} onClick={handleSurveySubmit}>Отправить анкету</button>
                    </div>
                )}

                {activeTab === 'results' && (
                    <div className={styles.tableWrapper}>
                        <h3>Свод всех ответов</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Дата</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Автор</th>
                                    <th style={{ padding: '1rem', textAlign: 'center' }}>Оценка</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Предложение</th>
                                </tr>
                            </thead>
                            <tbody>
                                {surveys.map(s => (
                                    <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '1rem' }}>{s.date}</td>
                                        <td style={{ padding: '1rem' }}>{s.userName}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>⭐ {s.rating}</td>
                                        <td style={{ padding: '1rem' }}>{s.suggestion}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'measures' && (
                    <div className={styles.tableWrapper}>
                        <h3>Меры по улучшению</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', width: '40%' }}>1. Ответы: Пожелания/замечания/предложения</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', width: '30%' }}>2. Мероприятия</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', width: '30%' }}>3. Выполнение</th>
                                </tr>
                            </thead>
                            <tbody>
                                {surveys.map(s => (
                                    <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{s.suggestion}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {isAdmin ? (
                                                <textarea 
                                                    value={measures[s.id]?.measure || ''} 
                                                    onChange={e => updateMeasure(s.id, 'measure', e.target.value)}
                                                    rows={2}
                                                    style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                                />
                                            ) : (
                                                measures[s.id]?.measure || <em style={{color: '#999'}}>В обработке...</em>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {isAdmin ? (
                                                <input 
                                                    value={measures[s.id]?.status || ''} 
                                                    onChange={e => updateMeasure(s.id, 'status', e.target.value)}
                                                    style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                                    placeholder="Напр. Выполнено"
                                                />
                                            ) : (
                                                measures[s.id]?.status || <em style={{color: '#999'}}>Нет данных</em>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
