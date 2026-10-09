'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Energy.module.css';

interface IndicatorRow {
    id: number;
    col2: string; // Name
    col3: string; // Unit
    col4: number; // Target
    col5: number; // Fact
}

interface EnergyIndicatorsProps {
    isAdmin?: boolean;
}

export default function EnergyIndicators({ isAdmin = false }: EnergyIndicatorsProps) {
    const [rows, setRows] = useState<IndicatorRow[]>([]);
    const [footnote, setFootnote] = useState('');
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

    useEffect(() => {
        const storedRows = localStorage.getItem('energy_indicators');
        if (storedRows) setRows(JSON.parse(storedRows));
        else {
            const initial = [{ id: 1, col2: 'Расход электроэнергии', col3: 'кВт.ч', col4: 1000, col5: 950 }];
            setRows(initial);
            localStorage.setItem('energy_indicators', JSON.stringify(initial));
        }

        const storedFoot = localStorage.getItem('energy_indicators_footnote');
        if (storedFoot) setFootnote(storedFoot);
    }, []);

    const saveRows = (newRows: IndicatorRow[]) => {
        setRows(newRows);
        localStorage.setItem('energy_indicators', JSON.stringify(newRows));
    };

    const saveFootnote = (text: string) => {
        setFootnote(text);
        localStorage.setItem('energy_indicators_footnote', text);
    };

    const addRow = () => {
        const newRow: IndicatorRow = { id: Date.now(), col2: '', col3: '', col4: 0, col5: 0 };
        saveRows([...rows, newRow]);
    };

    const deleteRow = (id: number) => {
        saveRows(rows.filter(r => r.id !== id));
    };

    const updateRow = (id: number, field: keyof IndicatorRow, value: any) => {
        saveRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const calculateDeviation = (target: number, fact: number): string => {
        if (target === 0) return '0.00';
        return (((fact - target) / target) * 100).toFixed(2);
    };

    return (
        <div className={styles.moduleContainer}>
            <Link href="/energy" className={styles.backLink}>← Вернуться в СУЭн</Link>
            <header className={styles.hubHeader}>
                <h2>Показатели энергетической эффективности</h2>
            </header>

            <table className={styles.indicatorTable}>
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}>№</th>
                        <th>Наименование показателя</th>
                        <th>Ед. изм.</th>
                        <th>Целевой показатель</th>
                        <th>Факт</th>
                        <th>Отклонение (%)</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr 
                            key={row.id} 
                            onMouseEnter={() => setHoveredRow(row.id)} 
                            onMouseLeave={() => setHoveredRow(null)}
                            style={{ position: 'relative' }}
                        >
                            <td>{index + 1}</td>
                            <td>
                                {isAdmin ? (
                                    <input value={row.col2} onChange={e => updateRow(row.id, 'col2', e.target.value)} style={{ width: '100%', border: 'none' }} />
                                ) : row.col2}
                            </td>
                            <td>
                                {isAdmin ? (
                                    <input value={row.col3} onChange={e => updateRow(row.id, 'col3', e.target.value)} style={{ width: '100%', border: 'none' }} />
                                ) : row.col3}
                            </td>
                            <td>
                                {isAdmin ? (
                                    <input type="number" value={row.col4} onChange={e => updateRow(row.id, 'col4', parseFloat(e.target.value))} style={{ width: '100%', border: 'none' }} />
                                ) : row.col4}
                            </td>
                            <td>
                                {isAdmin ? (
                                    <input type="number" value={row.col5} onChange={e => updateRow(row.id, 'col5', parseFloat(e.target.value))} style={{ width: '100%', border: 'none' }} />
                                ) : row.col5}
                            </td>
                            <td style={{ fontWeight: '700', color: parseFloat(calculateDeviation(row.col4, row.col5)) > 0 ? '#ef4444' : '#10b981' }}>
                                {calculateDeviation(row.col4, row.col5)}%
                            </td>
                            {isAdmin && hoveredRow === row.id && (
                                <button 
                                    onClick={() => deleteRow(row.id)}
                                    style={{
                                        position: 'absolute',
                                        right: '-40px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: '#fee2e2',
                                        color: '#ef4444',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        padding: '0.25rem 0.5rem'
                                    }}
                                >
                                    🗑️
                                </button>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {isAdmin && <button className={styles.secondaryBtn} onClick={addRow} style={{ marginTop: '1rem' }}>+ Добавить строку</button>}

            <section className={styles.footnoteSection}>
                <h4>Примечания / Сноски</h4>
                {isAdmin ? (
                    <textarea 
                        value={footnote} 
                        onChange={e => saveFootnote(e.target.value)}
                        placeholder="Введите примечания здесь..."
                        rows={4}
                    />
                ) : (
                    <p style={{ whiteSpace: 'pre-wrap' }}>{footnote || 'Примечания отсутствуют'}</p>
                )}
            </section>
        </div>
    );
}
