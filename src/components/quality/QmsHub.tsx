'use client';

import Link from 'next/link';
import styles from './Quality.module.css';

const QMS_SECTIONS = [
    { id: 1, title: 'Планирование', link: '/quality/planning', icon: '📅' },
    { id: 2, title: 'Внутренние аудиты', link: '/quality/audits', icon: '🔎' },
    { id: 3, title: 'Обучение', link: '/quality/training', icon: '🎓' },
    { id: 4, title: 'Обратная связь', link: '/quality/feedback', icon: '💬' },
    { id: 5, title: 'Нормативно-техническая документация', link: '/quality/ntd', icon: '📄' },
];

export default function QmsHub() {
    return (
        <div className={styles.hubContainer}>
            <header className={styles.hubHeader}>
                <h1>Система менеджмента качества</h1>
                <p>Блок по Системе менеджмента качества</p>
                <nav className={styles.breadcrumb}>
                    <Link href="/">Главная</Link> / <span>СМК</span>
                </nav>
            </header>

            <div className={styles.hubGrid}>
                {QMS_SECTIONS.map(section => (
                    <Link key={section.id} href={section.link} className={styles.hubCard}>
                        <span className={styles.hubIcon}>{section.icon}</span>
                        <h3>{section.title}</h3>
                    </Link>
                ))}
            </div>
        </div>
    );
}
