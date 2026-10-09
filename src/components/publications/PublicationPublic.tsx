'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './PublicationPublic.module.css';
import { PublicationYear, Article } from './PublicationManager';

export default function PublicationPublic() {
    const [years, setYears] = useState<PublicationYear[]>([]);
    const [search, setSearch] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState('');
    const [selectedEdition, setSelectedEdition] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('innovation_publications');
        if (stored) {
            setYears(JSON.parse(stored));
        }
    }, []);

    const allAuthors = useMemo(() => {
        const authors = new Set<string>();
        years.forEach(y => y.articles.forEach(a => {
            a.authors.split(',').forEach(auth => authors.add(auth.trim()));
        }));
        return Array.from(authors).sort();
    }, [years]);

    const allEditions = useMemo(() => {
        const editions = new Set<string>();
        years.forEach(y => y.articles.forEach(a => editions.add(a.edition)));
        return Array.from(editions).sort();
    }, [years]);

    const filteredYears = useMemo(() => {
        return years.map(y => {
            const articles = y.articles.filter(a => {
                const matchesSearch =
                    a.title.toLowerCase().includes(search.toLowerCase()) ||
                    a.authors.toLowerCase().includes(search.toLowerCase()) ||
                    a.edition.toLowerCase().includes(search.toLowerCase());

                const matchesAuthor = !selectedAuthor || a.authors.includes(selectedAuthor);
                const matchesEdition = !selectedEdition || a.edition === selectedEdition;

                return matchesSearch && matchesAuthor && matchesEdition;
            });
            return { ...y, articles };
        }).filter(y => y.articles.length > 0);
    }, [years, search, selectedAuthor, selectedEdition]);

    const openPDF = (data: string) => {
        const win = window.open();
        if (win) {
            win.document.write(`<iframe src="${data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                <div className={styles.searchGroup}>
                    <input
                        type="text"
                        placeholder="Поиск по названию, автору или изданию..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.selectGroup}>
                    <select value={selectedAuthor} onChange={e => setSelectedAuthor(e.target.value)}>
                        <option value="">Все авторы</option>
                        {allAuthors.map(auth => <option key={auth} value={auth}>{auth}</option>)}
                    </select>
                    <select value={selectedEdition} onChange={e => setSelectedEdition(e.target.value)}>
                        <option value="">Все издания</option>
                        {allEditions.map(ed => <option key={ed} value={ed}>{ed}</option>)}
                    </select>
                </div>
            </div>

            {filteredYears.length === 0 ? (
                <div className={styles.noResults}>По вашему запросу ничего не найдено</div>
            ) : (
                filteredYears.map(y => (
                    <div key={y.id} className={styles.yearBlock}>
                        <h2 className={styles.yearTitle}>{y.year} год</h2>
                        <div className={styles.articlesList}>
                            {y.articles.map(a => (
                                <div key={a.id} className={styles.articleCard}>
                                    <h3
                                        className={styles.articleTitle}
                                        onClick={() => a.file && openPDF(a.file.data)}
                                        style={{ cursor: a.file ? 'pointer' : 'default' }}
                                    >
                                        {a.title}
                                    </h3>
                                    <p className={styles.articleAuthors}><strong>Авторы:</strong> {a.authors}</p>
                                    <p className={styles.articleEdition}><strong>Издание:</strong> {a.edition}</p>
                                    {a.file && <span className={styles.pdfBadge}>PDF</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
