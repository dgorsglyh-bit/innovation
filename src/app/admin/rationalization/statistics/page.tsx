'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RetrospectiveData {
    year: number;
    authors: number;
    registered: number;
    used: number;
    economicEffect: number; // in million rubles
}

export default function AdminStatisticsPage() {
    const [retroData, setRetroData] = useState<RetrospectiveData[]>([]);
    const [newEntry, setNewEntry] = useState<RetrospectiveData>({
        year: new Date().getFullYear(),
        authors: 0,
        registered: 0,
        used: 0,
        economicEffect: 0,
    });

    useEffect(() => {
        const stored = localStorage.getItem('innovation_stats_retro');
        if (stored) {
            setRetroData(JSON.parse(stored));
        } else {
            // Default data starting from 2018
            const initial = [
                { year: 2018, authors: 10, registered: 15, used: 8, economicEffect: 1.2 },
                { year: 2019, authors: 12, registered: 18, used: 10, economicEffect: 1.5 },
                { year: 2020, authors: 15, registered: 22, used: 12, economicEffect: 2.1 },
                { year: 2021, authors: 18, registered: 25, used: 15, economicEffect: 2.8 },
                { year: 2022, authors: 20, registered: 30, used: 18, economicEffect: 3.5 },
                { year: 2023, authors: 25, registered: 35, used: 22, economicEffect: 4.2 },
                { year: 2024, authors: 22, registered: 32, used: 20, economicEffect: 3.8 },
            ];
            setRetroData(initial);
            localStorage.setItem('innovation_stats_retro', JSON.stringify(initial));
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('innovation_stats_retro', JSON.stringify(retroData));
        alert('Данные сохранены!');
    };

    const handleAddField = () => {
        const updated = [...retroData, newEntry].sort((a, b) => a.year - b.year);
        setRetroData(updated);
        setNewEntry({
            year: Math.max(...updated.map(d => d.year)) + 1,
            authors: 0,
            registered: 0,
            used: 0,
            economicEffect: 0,
        });
    };

    const handleDelete = (year: number) => {
        setRetroData(retroData.filter(d => d.year !== year));
    };

    const handleChange = (year: number, field: keyof RetrospectiveData, value: number) => {
        setRetroData(retroData.map(d => d.year === year ? { ...d, [field]: value } : d));
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Управление статистикой</h1>
                <Link href="/admin" style={{ color: 'var(--primary-blue)' }}>← Назад в админку</Link>
            </div>

            <section style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ marginBottom: '1rem' }}>Ретроспектива (Данные по годам)</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                            <th style={{ padding: '0.5rem' }}>Год</th>
                            <th style={{ padding: '0.5rem' }}>Авторы РП</th>
                            <th style={{ padding: '0.5rem' }}>Зарегистрировано</th>
                            <th style={{ padding: '0.5rem' }}>Использовано</th>
                            <th style={{ padding: '0.5rem' }}>Эк. эффект (млн руб)</th>
                            <th style={{ padding: '0.5rem' }}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {retroData.map((d) => (
                            <tr key={d.year} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '0.5rem' }}>{d.year}</td>
                                <td style={{ padding: '0.5rem' }}>
                                    <input type="number" value={d.authors} onChange={(e) => handleChange(d.year, 'authors', +e.target.value)} style={{ width: '80px' }} />
                                </td>
                                <td style={{ padding: '0.5rem' }}>
                                    <input type="number" value={d.registered} onChange={(e) => handleChange(d.year, 'registered', +e.target.value)} style={{ width: '80px' }} />
                                </td>
                                <td style={{ padding: '0.5rem' }}>
                                    <input type="number" value={d.used} onChange={(e) => handleChange(d.year, 'used', +e.target.value)} style={{ width: '80px' }} />
                                </td>
                                <td style={{ padding: '0.5rem' }}>
                                    <input type="number" value={d.economicEffect} step="0.1" onChange={(e) => handleChange(d.year, 'economicEffect', +e.target.value)} style={{ width: '80px' }} />
                                </td>
                                <td style={{ padding: '0.5rem' }}>
                                    <button onClick={() => handleDelete(d.year)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Удалить</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#f9f9f9', padding: '1rem', borderRadius: '4px' }}>
                    <input type="number" value={newEntry.year} onChange={(e) => setNewEntry({ ...newEntry, year: +e.target.value })} placeholder="Год" style={{ width: '80px' }} />
                    <input type="number" value={newEntry.authors} onChange={(e) => setNewEntry({ ...newEntry, authors: +e.target.value })} placeholder="Авторы" style={{ width: '80px' }} />
                    <input type="number" value={newEntry.registered} onChange={(e) => setNewEntry({ ...newEntry, registered: +e.target.value })} placeholder="Зарег." style={{ width: '80px' }} />
                    <input type="number" value={newEntry.used} onChange={(e) => setNewEntry({ ...newEntry, used: +e.target.value })} placeholder="Использ." style={{ width: '80px' }} />
                    <input type="number" value={newEntry.economicEffect} step="0.1" onChange={(e) => setNewEntry({ ...newEntry, economicEffect: +e.target.value })} placeholder="Эффект" style={{ width: '80px' }} />
                    <button onClick={handleAddField} style={{ padding: '0.5rem 1rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Добавить год</button>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <button
                        onClick={handleSave}
                        style={{ padding: '0.8rem 2rem', background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}
                    >
                        Сохранить все изменения
                    </button>
                </div>
            </section>
        </div>
    );
}
