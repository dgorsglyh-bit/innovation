'use client';

import { useState, useEffect } from 'react';
import styles from './PublicationManager.module.css';

export interface Article {
    id: number;
    title: string;
    authors: string;
    edition: string;
    file?: {
        name: string;
        data: string; // Base64
    };
}

export interface PublicationYear {
    id: number;
    year: string;
    articles: Article[];
}

export default function PublicationManager() {
    const [years, setYears] = useState<PublicationYear[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [currentYearId, setCurrentYearId] = useState<number | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('innovation_publications');
        if (stored) {
            setYears(JSON.parse(stored));
        }
    }, []);

    const saveYears = (newYears: PublicationYear[]) => {
        setYears(newYears);
        localStorage.setItem('innovation_publications', JSON.stringify(newYears));
    };

    const addYear = () => {
        const yearStr = prompt('Введите год (например, 2024):');
        if (!yearStr) return;
        const newYear: PublicationYear = {
            id: Date.now(),
            year: yearStr,
            articles: []
        };
        saveYears([...years, newYear].sort((a, b) => b.year.localeCompare(a.year)));
    };

    const deleteYear = (id: number) => {
        if (confirm('Удалить весь год и все статьи в нем?')) {
            saveYears(years.filter(y => y.id !== id));
        }
    };

    const openArticleModal = (yearId: number, article?: Article) => {
        setCurrentYearId(yearId);
        setEditingArticle(article || {
            id: Date.now(),
            title: '',
            authors: '',
            edition: ''
        });
        setIsModalOpen(true);
    };

    const saveArticle = () => {
        if (!editingArticle || currentYearId === null) return;

        const updated = years.map(y => {
            if (y.id === currentYearId) {
                const exists = y.articles.find(a => a.id === editingArticle.id);
                if (exists) {
                    return { ...y, articles: y.articles.map(a => a.id === editingArticle.id ? editingArticle : a) };
                }
                return { ...y, articles: [...y.articles, editingArticle] };
            }
            return y;
        });

        saveYears(updated);
        setIsModalOpen(false);
    };

    const deleteArticle = (yearId: number, articleId: number) => {
        if (confirm('Удалить статью?')) {
            const updated = years.map(y => {
                if (y.id === yearId) {
                    return { ...y, articles: y.articles.filter(a => a.id !== articleId) };
                }
                return y;
            });
            saveYears(updated);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingArticle) return;

        if (file.type !== 'application/pdf') {
            alert('Пожалуйста, загрузите PDF файл');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setEditingArticle({
                ...editingArticle,
                file: {
                    name: file.name,
                    data: reader.result as string
                }
            });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.addBtn} onClick={addYear}>➕ Добавить год</button>
            </div>

            {years.map(y => (
                <div key={y.id} className={styles.yearSection}>
                    <div className={styles.yearHeader}>
                        <h2>{y.year} год</h2>
                        <div className={styles.yearActions}>
                            <button className={styles.addArticleBtn} onClick={() => openArticleModal(y.id)}>➕ Добавить статью</button>
                            <button className={styles.deleteBtn} onClick={() => deleteYear(y.id)}>🗑️ Удалить год</button>
                        </div>
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Название</th>
                                    <th>Авторы</th>
                                    <th>Издание</th>
                                    <th>Файл</th>
                                    <th style={{ width: '100px' }}>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {y.articles.length === 0 ? (
                                    <tr><td colSpan={5} className={styles.empty}>Нет статей</td></tr>
                                ) : (
                                    y.articles.map(a => (
                                        <tr key={a.id}>
                                            <td>{a.title}</td>
                                            <td>{a.authors}</td>
                                            <td>{a.edition}</td>
                                            <td>{a.file ? '📄 ' + a.file.name : '❌ Нет'}</td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button onClick={() => openArticleModal(y.id, a)}>✏️</button>
                                                    <button onClick={() => deleteArticle(y.id, a.id)}>🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {isModalOpen && editingArticle && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>{editingArticle.id ? 'Редактировать статью' : 'Новая статья'}</h3>
                        <div className={styles.formGroup}>
                            <label>Название статьи</label>
                            <textarea
                                value={editingArticle.title}
                                onChange={e => setEditingArticle({ ...editingArticle, title: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Авторы</label>
                            <input
                                type="text"
                                value={editingArticle.authors}
                                onChange={e => setEditingArticle({ ...editingArticle, authors: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Издание</label>
                            <input
                                type="text"
                                value={editingArticle.edition}
                                onChange={e => setEditingArticle({ ...editingArticle, edition: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>PDF файл статьи</label>
                            <div className={styles.fileInput}>
                                {editingArticle.file && <p>Текущий: {editingArticle.file.name}</p>}
                                <input type="file" accept=".pdf" onChange={handleFileUpload} />
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Отмена</button>
                            <button className={styles.saveBtn} onClick={saveArticle}>Сохранить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
