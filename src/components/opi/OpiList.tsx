'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import styles from './OpiList.module.css';
import { OpiEntry } from './OpiManager';

export default function OpiList() {
    const [entries, setEntries] = useState<OpiEntry[]>([]);
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const [filterStatus, setFilterStatus] = useState('');
    const [filterObject, setFilterObject] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('innovation_opi_list');
        if (stored) setEntries(JSON.parse(stored));
    }, []);

    const objectsList = useMemo(() => {
        const objs = new Set<string>();
        entries.forEach(e => objs.add(e.object));
        return Array.from(objs).sort();
    }, [entries]);

    const filteredEntries = useMemo(() => {
        return entries.filter(e => {
            const matchesSearch = e.productName.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = !filterStatus || e.status === filterStatus;
            const matchesObject = !filterObject || e.object === filterObject;

            const matchesDate = (!filterStartDate || e.startDate >= filterStartDate) &&
                (!filterEndDate || e.endDate <= filterEndDate);

            return matchesSearch && matchesStatus && matchesObject && matchesDate;
        });
    }, [entries, search, filterStatus, filterObject, filterStartDate, filterEndDate]);

    const statusLabels: Record<string, string> = {
        planned: 'Запланировано',
        in_progress: 'В процессе',
        completed: 'Завершено',
        cancelled: 'Отменено'
    };

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Поиск по наименованию продукции..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button
                        className={styles.filterToggle}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        ⚙️ Фильтрация
                    </button>
                </div>

                {showFilters && (
                    <div className={styles.filtersPanel}>
                        <div className={styles.filterGroup}>
                            <label>Статус</label>
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="">Все статусы</option>
                                <option value="planned">Запланировано</option>
                                <option value="in_progress">В процессе</option>
                                <option value="completed">Завершено</option>
                                <option value="cancelled">Отменено</option>
                            </select>
                        </div>
                        <div className={styles.filterGroup}>
                            <label>Объект</label>
                            <select value={filterObject} onChange={e => setFilterObject(e.target.value)}>
                                <option value="">Все объекты</option>
                                {objectsList.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div className={styles.filterGroup}>
                            <label>Начало от</label>
                            <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
                        </div>
                        <div className={styles.filterGroup}>
                            <label>Завершение до</label>
                            <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />
                        </div>
                        <button className={styles.resetBtn} onClick={() => {
                            setFilterStatus('');
                            setFilterObject('');
                            setFilterStartDate('');
                            setFilterEndDate('');
                        }}>Сбросить</button>
                    </div>
                )}
            </div>

            <div className={styles.list}>
                {filteredEntries.length === 0 ? (
                    <div className={styles.empty}>Ничего не найдено</div>
                ) : (
                    filteredEntries.map(e => (
                        <Link key={e.id} href={`/pilot-tests/list/${e.id}`} className={styles.entryCard}>
                            <div className={styles.cardHeader}>
                                <span className={`${styles.statusBadge} ${styles[e.status]}`}>
                                    {statusLabels[e.status]}
                                </span>
                                <span className={styles.dates}>{e.startDate} — {e.endDate}</span>
                            </div>
                            <h3>{e.productName}</h3>
                            <div className={styles.cardInfo}>
                                <span>📍 Обьект: {e.object}</span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
