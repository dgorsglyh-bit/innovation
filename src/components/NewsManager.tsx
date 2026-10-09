'use client';
import { useState, useEffect } from 'react';
import styles from './NewsManager.module.css';

interface NewsItem {
    id: number;
    title: string;
    description: string;
    content?: string; // Full text
    image?: string; // Base64 data URL
}

export default function NewsManager() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(''); // Stores Base64 string

    useEffect(() => {
        const stored = localStorage.getItem('innovation_news');
        if (stored) {
            setNews(JSON.parse(stored));
        }
    }, []);

    const saveNews = (items: NewsItem[]) => {
        setNews(items);
        localStorage.setItem('innovation_news', JSON.stringify(items));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addNews = (e: React.FormEvent) => {
        e.preventDefault();
        const newItem: NewsItem = {
            id: Date.now(),
            title,
            description,
            content,
            image
        };
        saveNews([newItem, ...news]);
        setTitle('');
        setDescription('');
        setContent('');
        setImage('');
        alert('Новость добавлена!');
    };

    const deleteNews = (id: number) => {
        if (confirm('Вы уверены, что хотите удалить эту новость?')) {
            saveNews(news.filter(item => item.id !== id));
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '1rem' }}>Добавить новость</h2>
            <form onSubmit={addNews} className={styles.form}>
                <div className={styles.field}>
                    <label>Заголовок (Тема):</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label>Краткое описание (для списка):</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                        rows={2}
                    />
                </div>

                <div className={styles.field}>
                    <label>Полный текст новости:</label>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        rows={5}
                    />
                </div>

                <div className={styles.field}>
                    <label>Изображение:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    {image && <img src={image} alt="Preview" style={{ maxWidth: '200px', marginTop: '10px' }} />}
                </div>

                <button type="submit">Опубликовать</button>
            </form>

            <h2 style={{ margin: '2rem 0 1rem' }}>Список новостей</h2>
            <div className={styles.list}>
                {news.map(item => (
                    <div key={item.id} className={styles.item}>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <button onClick={() => deleteNews(item.id)} className={styles.deleteBtn}>Удалить</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
