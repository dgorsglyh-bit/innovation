'use client';

import Link from 'next/link';
import styles from './Regions.module.css';

const REGIONS_SECTIONS = [
    { id: 1, title: 'Документация', link: '/regions/docs', icon: '📁' },
    { id: 2, title: 'Дашборд (Аналитика)', link: '/regions/dashboard', icon: '📊' },
];

export default function RegionsHub() {
    return (
        <div className={styles.hubContainer}>
            <header className={styles.hubHeader}>
                <h1>Взаимодействие с регионами</h1>
                <p>Блок по взаимодействию с регионами РФ</p>
                <nav className={styles.breadcrumb}>
                    <Link href="/">Главная</Link> / <span>Регионы</span>
                </nav>
            </header>

            <div className={styles.hubGrid}>
                {REGIONS_SECTIONS.map(section => (
                    <Link key={section.id} href={section.link} className={styles.hubCard} target="_blank">
                        <span className={styles.hubIcon}>{section.icon}</span>
                        <h3>{section.title}</h3>
                    </Link>
                ))}
            </div>
        </div>
    );
}
