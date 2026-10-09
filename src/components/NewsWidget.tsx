'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './NewsWidget.module.css';

interface NewsItem {
    id: number;
    title: string;
    description: string;
}

export default function NewsWidget() {
    const [news, setNews] = useState<NewsItem[]>([]);

    useEffect(() => {
        // Load from local storage to sync with Admin
        const stored = localStorage.getItem('innovation_news');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Sort by id descending (newest first) assuming ID is timestamp
                parsed.sort((a: NewsItem, b: NewsItem) => b.id - a.id);
                setNews(parsed);
            } catch (e) {
                console.error("Failed to parse news", e);
            }
        }
    }, []);

    // Limit to 5 items
    const displayNews = news.slice(0, 5);

    return (
        <div className={styles.container}>
            <h2 className={styles.header}>Актуально</h2>
            <div className={styles.list}>
                {displayNews.length === 0 && <p>Нет новостей</p>}
                {displayNews.map(item => (
                    <Link key={item.id} href={`/news/${item.id}`} className={styles.itemLink}>
                        <div className={styles.item}>
                            <h3 className={styles.title}>{item.title}</h3>
                            <p className={styles.description}>{item.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
