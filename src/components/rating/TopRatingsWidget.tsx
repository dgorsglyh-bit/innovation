'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './TopRatingsWidget.module.css';

interface RatingItem {
    id: number;
    image: string;
    text1: string;
    text2: string;
    rank?: number | null;
}

export default function TopRatingsWidget() {
    const [topItems, setTopItems] = useState<RatingItem[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('innovation_rating');
        if (stored) {
            const items: RatingItem[] = JSON.parse(stored);
            // Filter items with rank 1, 2, 3 and sort them
            const ranked = items
                .filter(i => i.rank && i.rank >= 1 && i.rank <= 3)
                .sort((a, b) => (a.rank || 0) - (b.rank || 0));
            setTopItems(ranked);
        }
    }, []);

    if (topItems.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    <h3>Рейтинг</h3>
                    <p>Лидеры еще не определены</p>
                    <Link href="/rating" className={styles.link}>Открыть полный рейтинг</Link>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <h3 className={styles.header}>Лидеры Рейтинга</h3>
            <div className={styles.grid}>
                {[1, 2, 3].map(rank => {
                    const item = topItems.find(i => i.rank === rank);
                    return (
                        <div key={rank} className={`${styles.card} ${styles[`rank${rank}`]}`}>
                            <div className={styles.rankBadge}>{rank} место</div>
                            {item ? (
                                <>
                                    <img src={item.image} alt={`Rank ${rank}`} className={styles.image} />
                                    <p className={styles.text}>{item.text1}</p>
                                </>
                            ) : (
                                <div className={styles.placeholder}>Пусто</div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link href="/rating" className={styles.link}>Открыть полный рейтинг</Link>
            </div>
        </div>
    );
}
