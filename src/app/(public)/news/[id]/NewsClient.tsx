'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

interface NewsItem {
    id: number;
    title: string;
    description: string; // The short description
    content?: string; // The full text
    image?: string;
}

export default function NewsClient({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('innovation_news');
        if (stored) {
            const items: NewsItem[] = JSON.parse(stored);
            const found = items.find((i) => i.id.toString() === resolvedParams.id);
            if (found) {
                setNewsItem(found);
            }
        }
        setLoading(false);
    }, [resolvedParams.id]);

    if (loading) return <div className="main-container">Загрузка...</div>;

    if (!newsItem) {
        return (
            <div className="main-container">
                <h1>Новость не найдена</h1>
                <button onClick={() => router.back()} style={{ color: 'var(--primary-blue)', textDecoration: 'underline' }}>
                    Вернуться назад
                </button>
            </div>
        );
    }

    return (
        <div className="main-container">
            <button
                onClick={() => router.back()}
                style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}
            >
                &larr; Назад к новостям
            </button>

            <article style={{ background: 'white', padding: '2rem', border: '1px solid var(--border-blue)' }}>
                <h1 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>{newsItem.title}</h1>

                {newsItem.image && (
                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <img
                            src={newsItem.image}
                            alt={newsItem.title}
                            style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                        />
                    </div>
                )}

                <div style={{ fontSize: '1.1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {newsItem.content ? newsItem.content : newsItem.description}
                </div>
            </article>
        </div>
    );
}
