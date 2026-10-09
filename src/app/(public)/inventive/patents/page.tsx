'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Patent, PatentType } from '@/components/inventive/PatentManager';
import styles from './patents.module.css';

const TYPE_LABELS: Record<PatentType | 'all', string> = {
    all: 'ВСЕ ОБЪЕКТЫ',
    invention: 'Изобретения',
    utility_model: 'Полезные модели',
    software: 'Программы для ЭВМ'
};

type SortType = 'issueDate' | 'expiryDate' | 'author';

export default function PatentsPublicPage() {
    const [patents, setPatents] = useState<Patent[]>([]);
    const [filteredPatents, setFilteredPatents] = useState<Patent[]>([]);
    const [activeTab, setActiveTab] = useState<PatentType | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortBy, setSortBy] = useState<SortType>('issueDate');

    useEffect(() => {
        const stored = localStorage.getItem('innovation_patents');
        if (stored) {
            setPatents(JSON.parse(stored));
        }
    }, []);

    useEffect(() => {
        let result = [...patents];

        // Type filter
        if (activeTab !== 'all') {
            result = result.filter(p => p.type === activeTab);
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => p.title.toLowerCase().includes(query));
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'issueDate') {
                return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
            } else if (sortBy === 'expiryDate') {
                const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : 0;
                const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : 0;
                return dateB - dateA;
            } else if (sortBy === 'author') {
                const authorA = (a.authors[0] || '').toLowerCase();
                const authorB = (b.authors[0] || '').toLowerCase();
                return authorA.localeCompare(authorB);
            }
            return 0;
        });

        setFilteredPatents(result);
    }, [patents, activeTab, searchQuery, sortBy]);

    return (
        <div className="main-container">
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Объекты патентных и авторских прав</h1>
                    <p>Реестр интеллектуальной собственности предприятия</p>
                </header>

                <div className={styles.controls}>
                    <div className={styles.tabs}>
                        {(['all', 'invention', 'utility_model', 'software'] as const).map(tab => (
                            <button
                                key={tab}
                                className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {TYPE_LABELS[tab]}
                            </button>
                        ))}
                    </div>

                    <div className={styles.searchSort}>
                        <div className={styles.searchWrapper}>
                            <span className={styles.searchIcon}>🔍</span>
                            <input
                                type="text"
                                placeholder="Поиск по названию..."
                                className={styles.searchInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className={styles.sortMenu}>
                            <button
                                className={styles.filterBtn}
                                onClick={() => setIsSortOpen(!isSortOpen)}
                            >
                                ⚙️ Фильтрация
                            </button>
                            {isSortOpen && (
                                <div className={styles.dropdown}>
                                    <div
                                        className={styles.dropdownItem}
                                        onClick={() => { setSortBy('issueDate'); setIsSortOpen(false); }}
                                    >
                                        По дате выдачи
                                    </div>
                                    <div
                                        className={styles.dropdownItem}
                                        onClick={() => { setSortBy('expiryDate'); setIsSortOpen(false); }}
                                    >
                                        По сроку действия
                                    </div>
                                    <div
                                        className={styles.dropdownItem}
                                        onClick={() => { setSortBy('author'); setIsSortOpen(false); }}
                                    >
                                        По автору
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.grid}>
                    {filteredPatents.length === 0 ? (
                        <div className={styles.empty}>
                            <h3>Патентов не найдено</h3>
                            <p>Попробуйте изменить параметры поиска или фильтрации</p>
                        </div>
                    ) : (
                        filteredPatents.map(patent => (
                            <Link
                                href={`/inventive/patents/${patent.id}`}
                                key={patent.id}
                                className={styles.card}
                            >
                                <div className={`${styles.cardType} ${styles[`type_${patent.type}`]}`}>
                                    {TYPE_LABELS[patent.type]}
                                </div>
                                <h3 className={styles.cardTitle}>{patent.title}</h3>
                                <div className={styles.cardMeta}>
                                    <span><strong>Номер:</strong> {patent.number}</span>
                                    <span><strong>Выдан:</strong> {new Date(patent.issueDate).toLocaleDateString('ru-RU')}</span>
                                    {patent.expiryDate && (
                                        <span><strong>Действует до:</strong> {new Date(patent.expiryDate).toLocaleDateString('ru-RU')}</span>
                                    )}
                                </div>
                                <div className={styles.authors}>
                                    👥 {patent.authors.join(', ')}
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
