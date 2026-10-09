'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Quality.module.css';

interface AnalyticData {
    id: string;
    label: string;
    currentYear: number;
    prevYear: number;
}

interface ComparativeData {
    year: number;
    value: number;
}

interface AnalyticsProps {
    isAdmin?: boolean;
}

export default function Analytics({ isAdmin = false }: AnalyticsProps) {
    const [criteriaData, setCriteriaData] = useState<AnalyticData[]>([
        { id: '1', label: 'Несоответствия', currentYear: 0, prevYear: 0 },
        { id: '2', label: 'Наблюдения', currentYear: 0, prevYear: 0 },
        { id: '3', label: 'Достижения', currentYear: 0, prevYear: 0 },
    ]);

    const [comparative, setComparative] = useState<ComparativeData[]>([
        { year: 2020, value: 0 }, { year: 2021, value: 0 }, { year: 2022, value: 0 },
        { year: 2023, value: 0 }, { year: 2024, value: 0 }, { year: 2025, value: 0 }
    ]);

    useEffect(() => {
        const storedCriteria = localStorage.getItem('qms_analytic_criteria');
        if (storedCriteria) setCriteriaData(JSON.parse(storedCriteria));

        const storedComp = localStorage.getItem('qms_analytic_comparative');
        if (storedComp) setComparative(JSON.parse(storedComp));
        
        // Auto-pull current data if available from audits
        const storedAudits = localStorage.getItem('qms_audits');
        if (storedAudits) {
            const audits = JSON.parse(storedAudits);
            const totalMinor = audits.reduce((acc: number, a: any) => acc + a.findingsCount.minor, 0);
            const totalMajor = audits.reduce((acc: number, a: any) => acc + a.findingsCount.major, 0);
            const totalObs = audits.reduce((acc: number, a: any) => acc + a.findingsCount.observation, 0);
            const totalAch = audits.reduce((acc: number, a: any) => acc + a.findingsCount.achievement, 0);

            setCriteriaData(prev => prev.map(item => {
                if (item.label === 'Несоответствия') return { ...item, currentYear: totalMinor + totalMajor };
                if (item.label === 'Наблюдения') return { ...item, currentYear: totalObs };
                if (item.label === 'Достижения') return { ...item, currentYear: totalAch };
                return item;
            }));
        }
    }, []);

    const saveCriteria = (data: AnalyticData[]) => {
        setCriteriaData(data);
        localStorage.setItem('qms_analytic_criteria', JSON.stringify(data));
    };

    const saveComp = (data: ComparativeData[]) => {
        setComparative(data);
        localStorage.setItem('qms_analytic_comparative', JSON.stringify(data));
    };

    const maxValue = Math.max(...criteriaData.map(d => Math.max(d.currentYear, d.prevYear)), 1);
    const maxCompValue = Math.max(...comparative.map(d => d.value), 1);

    return (
        <div className={styles.moduleContainer}>
            <header className={styles.moduleHeader}>
                <h2>Аналитика внутренних аудитов</h2>
            </header>

            <section style={{ marginBottom: '4rem' }}>
                <h3>Сведения по критериям (Текущий и Предыдущий год)</h3>
                <div style={{ display: 'flex', gap: '2rem', height: '250px', alignItems: 'flex-end', padding: '2rem', background: '#f8fafc', borderRadius: '12px', borderBottom: '2px solid #eee' }}>
                    {criteriaData.map(item => (
                        <div key={item.id} style={{ flex: 1, display: 'flex', gap: '0.5rem', height: '100%', alignItems: 'flex-end', textAlign: 'center' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                                <div style={{ height: `${(item.prevYear / maxValue) * 100}%`, background: '#94a3b8', borderRadius: '4px 4px 0 0' }} />
                                <span style={{ fontSize: '0.7rem' }}>{item.prevYear}</span>
                                <span style={{ fontSize: '0.6rem' }}>Пред.</span>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                                <div style={{ height: `${(item.currentYear / maxValue) * 100}%`, background: 'var(--primary-blue)', borderRadius: '4px 4px 0 0' }} />
                                <span style={{ fontSize: '0.7rem' }}>{item.currentYear}</span>
                                <span style={{ fontSize: '0.6rem' }}>Тек.</span>
                            </div>
                            <div style={{ position: 'absolute', transform: 'translateY(1.5rem)', width: '100%', left: 0, fontSize: '0.9rem', fontWeight: '600' }}>{item.label}</div>
                        </div>
                    ))}
                </div>

                {isAdmin && (
                    <div style={{ marginTop: '2rem' }}>
                        <h4>Редактировать данные для графика</h4>
                        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                            <thead>
                                <tr><th>Категория</th><th>Предыдущий год</th><th>Текущий (авто/руч)</th></tr>
                            </thead>
                            <tbody>
                                {criteriaData.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.label}</td>
                                        <td><input type="number" value={item.prevYear} onChange={e => saveCriteria(criteriaData.map(d => d.id === item.id ? {...d, prevYear: parseInt(e.target.value)} : d))} /></td>
                                        <td><input type="number" value={item.currentYear} onChange={e => saveCriteria(criteriaData.map(d => d.id === item.id ? {...d, currentYear: parseInt(e.target.value)} : d))} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section>
                <h3>Сравнительный анализ 2020-2025</h3>
                <div style={{ display: 'flex', gap: '1rem', height: '200px', alignItems: 'flex-end', padding: '2rem', background: '#0f172a', borderRadius: '12px', color: 'white' }}>
                    {comparative.map(item => (
                        <div key={item.year} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end', textAlign: 'center' }}>
                            <div style={{ height: `${(item.value / maxCompValue) * 100}%`, background: '#818cf8', borderRadius: '4px 4px 0 0' }} />
                            <span style={{ fontSize: '0.8rem' }}>{item.value}</span>
                            <span style={{ fontSize: '0.7rem' }}>{item.year}</span>
                        </div>
                    ))}
                </div>

                {isAdmin && (
                    <div style={{ marginTop: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
                            {comparative.map(item => (
                                <div key={item.year}>
                                    <label style={{ fontSize: '0.8rem' }}>{item.year}</label>
                                    <input type="number" value={item.value} onChange={e => saveComp(comparative.map(c => c.year === item.year ? {...c, value: parseInt(e.target.value)} : c))} style={{ width: '100%' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
