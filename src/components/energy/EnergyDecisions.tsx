'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Energy.module.css';

interface Member {
    id: number;
    name: string;
    email: string;
}

interface Vote {
    userId: string;
    choice: 'за' | 'против' | 'воздержался' | 'особое';
    opinion?: string;
}

interface ProtocolItem {
    id: number;
    text: string;
}

interface DecisionProtocol {
    id: number;
    title: string;
    date: string;
    agenda: ProtocolItem[];
    noted: ProtocolItem[];
    decisions: ProtocolItem[];
}

interface EnergyDecisionsProps {
    isAdmin?: boolean;
}

export default function EnergyDecisions({ isAdmin = false }: EnergyDecisionsProps) {
    const [protocols, setProtocols] = useState<DecisionProtocol[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [votes, setVotes] = useState<Record<number, Record<string, Vote>>>({});
    const [expandedProtocol, setExpandedProtocol] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showOpinions, setShowOpinions] = useState<Record<number, boolean>>({});

    // Voting state for local user (mocking)
    const currentUserId = 'user_123'; // In real app, from AuthContext
    const [localOpinion, setLocalOpinion] = useState('');

    useEffect(() => {
        const pStored = localStorage.getItem('energy_protocols');
        if (pStored) setProtocols(JSON.parse(pStored));

        const mStored = localStorage.getItem('energy_members');
        if (mStored) setMembers(JSON.parse(mStored));
        else {
            const defaultMembers = [{ id: 1, name: 'Иванов И.И.', email: 'ivanov@example.com' }, { id: 2, name: 'Петров П.П.', email: 'petrov@example.com' }];
            setMembers(defaultMembers);
            localStorage.setItem('energy_members', JSON.stringify(defaultMembers));
        }

        const vStored = localStorage.getItem('energy_votes');
        if (vStored) setVotes(JSON.parse(vStored));
    }, []);

    const saveProtocols = (newP: DecisionProtocol[]) => {
        setProtocols(newP);
        localStorage.setItem('energy_protocols', JSON.stringify(newP));
    };

    const saveVotes = (newV: Record<number, Record<string, Vote>>) => {
        setVotes(newV);
        localStorage.setItem('energy_votes', JSON.stringify(newV));
    };

    const handleVote = (pId: number, choice: Vote['choice']) => {
        if (votes[pId]?.[currentUserId]) return;
        const newVotes = { 
            ...votes, 
            [pId]: { 
                ...(votes[pId] || {}), 
                [currentUserId]: { userId: currentUserId, choice, opinion: choice === 'особое' ? localOpinion : undefined } 
            } 
        };
        saveVotes(newVotes);
        setLocalOpinion('');
    };

    const addProtocol = () => {
        const protocol: DecisionProtocol = {
            id: Date.now(),
            title: 'Новый протокол совещания РГ',
            date: new Date().toLocaleDateString(),
            agenda: [],
            noted: [],
            decisions: []
        };
        saveProtocols([...protocols, protocol]);
    };

    const updateProtocolItem = (pId: number, type: 'agenda'|'noted'|'decisions', id: number, text: string) => {
        saveProtocols(protocols.map(p => p.id === pId ? { ...p, [type]: (p[type] as ProtocolItem[]).map((i: ProtocolItem) => i.id === id ? { ...i, text } : i) } : p));
    };

    const addItem = (pId: number, type: 'agenda'|'noted'|'decisions') => {
        saveProtocols(protocols.map(p => p.id === pId ? { ...p, [type]: [...(p[type as keyof DecisionProtocol] as ProtocolItem[]), { id: Date.now(), text: 'Новый пункт' }] } : p));
    };

    const getStats = (pId: number) => {
        const pVotes = Object.values(votes[pId] || {});
        const total = members.length;
        const counts = {
            for: pVotes.filter(v => v.choice === 'за').length,
            against: pVotes.filter(v => v.choice === 'против').length,
            abstained: pVotes.filter(v => v.choice === 'воздержался').length,
            special: pVotes.filter(v => v.choice === 'особое').length,
            notVoted: total - pVotes.length
        };
        const percentNotVoted = total > 0 ? Math.round((counts.notVoted / total) * 100) : 0;
        return { ...counts, percentNotVoted };
    };

    const printProtocol = (protocol: DecisionProtocol) => {
        const stats = getStats(protocol.id);
        const pVotes = Object.values(votes[protocol.id] || {});
        const content = `
            ПРОТОКОЛ СОВЕЩАНИЯ: ${protocol.title}
            Дата: ${protocol.date}
            
            ПОВЕСТКА:
            ${protocol.agenda.map(a => `- ${a.text}`).join('\n')}
            
            ОТМЕТИЛИ:
            ${protocol.noted.map(n => `- ${n.text}`).join('\n')}
            
            РЕШИЛИ:
            ${protocol.decisions.map(d => `- ${d.text}`).join('\n')}
            
            ЧЛЕНЫ РАБОЧЕЙ ГРУППЫ:
            ${members.map(m => `- ${m.name} (${votes[protocol.id]?.[m.id] ? 'Проголосовал' : 'Не проголосовал'})`).join('\n')}
            
            РЕЗУЛЬТАТЫ ГОЛОСОВАНИЯ:
            За: ${stats.for}, Против: ${stats.against}, Воздержались: ${stats.abstained}, Особое мнение: ${stats.special}, Не проголосовали: ${stats.notVoted} (${stats.percentNotVoted}%)
            
            ОСОБЫЕ МНЕНИЯ:
            ${pVotes.filter(v => v.choice === 'особое').map(v => `${v.userId}: ${v.opinion}`).join('\n')}
        `;
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Протокол_${protocol.id}.txt`;
        link.click();
    };

    const addMember = () => {
        const name = prompt('ФИО члена РГ:');
        const email = prompt('Email:');
        if (name && email) {
            const newM = [...members, { id: Date.now(), name, email }];
            setMembers(newM);
            localStorage.setItem('energy_members', JSON.stringify(newM));
        }
    };

    const deleteMember = (id: number) => {
        if (confirm('Удалить участника?')) {
            const newM = members.filter(m => m.id !== id);
            setMembers(newM);
            localStorage.setItem('energy_members', JSON.stringify(newM));
        }
    };

    const filtered = protocols.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className={styles.moduleContainer}>
            <Link href="/energy" className={styles.backLink}>← Вернуться в СУЭн</Link>
            <header className={styles.hubHeader}>
                <h2>Решения совещаний рабочей группы</h2>
            </header>

            <div style={{ marginBottom: '2rem' }}>
                <input 
                    className={styles.inputField} 
                    placeholder="Поиск по названию протокола..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className={styles.protocolsList}>
                {filtered.map(p => (
                    <div key={p.id} className={styles.protocolCard}>
                        <div className={styles.protocolHeader} onClick={() => setExpandedProtocol(expandedProtocol === p.id ? null : p.id)}>
                            <h3>{p.title} ({p.date})</h3>
                            <span>{expandedProtocol === p.id ? '🔼' : '🔽'}</span>
                        </div>

                        {expandedProtocol === p.id && (
                            <div className={styles.protocolContent}>
                                <section>
                                    <h4>Повестка совещания</h4>
                                    {p.agenda.map(a => (
                                        <div key={a.id} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                            • {isAdmin ? <input value={a.text} onChange={e => updateProtocolItem(p.id, 'agenda', a.id, e.target.value)} style={{flex: 1}} /> : a.text}
                                        </div>
                                    ))}
                                    {isAdmin && <button className={styles.secondaryBtn} onClick={() => addItem(p.id, 'agenda')} style={{padding: '0.25rem 0.5rem', fontSize: '0.8rem'}}>+ Добавить</button>}
                                </section>

                                <section style={{ marginTop: '2rem' }}>
                                    <h4>Отметили на совещании</h4>
                                    {p.noted.map(n => (
                                        <div key={n.id} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                            • {isAdmin ? <input value={n.text} onChange={e => updateProtocolItem(p.id, 'noted', n.id, e.target.value)} style={{flex: 1}} /> : n.text}
                                        </div>
                                    ))}
                                    {isAdmin && <button className={styles.secondaryBtn} onClick={() => addItem(p.id, 'noted')} style={{padding: '0.25rem 0.5rem', fontSize: '0.8rem'}}>+ Добавить</button>}
                                </section>

                                <section style={{ marginTop: '2rem' }}>
                                    <h4>Решили на совещании</h4>
                                    {p.decisions.map(d => (
                                        <div key={d.id} style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px dashed #eee' }}>
                                            <p style={{ fontWeight: '500' }}>{isAdmin ? <input value={d.text} onChange={e => updateProtocolItem(p.id, 'decisions', d.id, e.target.value)} style={{width: '100%'}} /> : d.text}</p>
                                            
                                            <div className={styles.voteBtnGroup}>
                                                <button className={styles.voteBtn} onClick={() => handleVote(p.id, 'за')} data-active={votes[p.id]?.[currentUserId]?.choice === 'за'}>За</button>
                                                <button className={styles.voteBtn} onClick={() => handleVote(p.id, 'против')} data-active={votes[p.id]?.[currentUserId]?.choice === 'против'}>Против</button>
                                                <button className={styles.voteBtn} onClick={() => handleVote(p.id, 'воздержался')} data-active={votes[p.id]?.[currentUserId]?.choice === 'воздержался'}>Воздержался</button>
                                                <button className={styles.voteBtn} onClick={() => handleVote(p.id, 'особое')} data-active={votes[p.id]?.[currentUserId]?.choice === 'особое'}>Особое мнение</button>
                                            </div>

                                            {(!votes[p.id]?.[currentUserId] && votes[p.id]?.[currentUserId]?.choice !== 'особое') && (
                                                <textarea 
                                                    placeholder="Введите особое мнение..." 
                                                    value={localOpinion}
                                                    onChange={e => setLocalOpinion(e.target.value)}
                                                    style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                                />
                                            ) || (votes[p.id]?.[currentUserId]?.choice === 'особое' && <p style={{ fontStyle: 'italic', color: '#666' }}>Ваше мнение: {votes[p.id]?.[currentUserId]?.opinion}</p>)}
                                        </div>
                                    ))}
                                    {isAdmin && <button className={styles.secondaryBtn} onClick={() => addItem(p.id, 'decisions')} style={{padding: '0.25rem 0.5rem', fontSize: '0.8rem'}}>+ Добавить решение</button>}
                                </section>

                                {isAdmin && (
                                    <div className={styles.adminPanel}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                            <h3>Результаты голосования</h3>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button className={styles.primaryBtn} onClick={() => printProtocol(p)}>🖨️ Распечатать протокол</button>
                                                <button className={styles.secondaryBtn} onClick={() => alert('Письма отправлены не проголосовавшим')}>📨 Отправить письма</button>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                                            <div>
                                                {(() => {
                                                    const s = getStats(p.id);
                                                    return (
                                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                                            <li>✅ За: <strong>{s.for}</strong></li>
                                                            <li>❌ Против: <strong>{s.against}</strong></li>
                                                            <li>⚖️ Воздержались: <strong>{s.abstained}</strong></li>
                                                            <li>🔍 Особое мнение: <strong>{s.special}</strong> 
                                                                <button onClick={() => setShowOpinions(prev => ({...prev, [p.id]: !prev[p.id]}))} style={{ marginLeft: '1rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                                    {showOpinions[p.id] ? 'Скрыть мнения' : 'Открыть мнения'}
                                                                </button>
                                                            </li>
                                                            <li>⏳ Не проголосовали: <strong>{s.notVoted} ({s.percentNotVoted}%)</strong></li>
                                                        </ul>
                                                    );
                                                })()}

                                                {showOpinions[p.id] && (
                                                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'white', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                                        {Object.values(votes[p.id] || {}).filter(v => v.choice === 'особое').map((v, i) => (
                                                            <p key={i} style={{ fontSize: '0.85rem', marginBottom: '1rem', borderBottom: '1px solid #eee' }}>
                                                                <strong>{v.userId}:</strong> {v.opinion}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h4>Члены рабочей группы</h4>
                                                <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
                                                    {members.map(m => (
                                                        <div key={m.id} className={styles.memberRow}>
                                                            <div style={{ flex: 1 }}>{m.name}</div>
                                                            <div style={{ flex: 1, color: '#666', fontSize: '0.9rem' }}>{m.email}</div>
                                                            <div style={{ width: '100px', textAlign: 'center' }}>
                                                                {votes[p.id]?.[m.id] ? <span style={{color: 'green'}}>✓</span> : <span style={{color: '#999'}}>...</span>}
                                                            </div>
                                                            <button className={styles.deleteBtn} onClick={() => deleteMember(m.id)}>🗑️</button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button className={styles.secondaryBtn} onClick={addMember} style={{ marginTop: '1rem', width: '100%' }}>+ Добавить члена РГ</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {isAdmin && <button className={styles.primaryBtn} onClick={addProtocol} style={{ width: '100%', marginTop: '2rem' }}>➕ Создать новый протокол</button>}
            </div>
        </div>
    );
}
