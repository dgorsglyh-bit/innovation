'use client';

import Link from 'next/link';
import styles from './Energy.module.css';

const ENERGY_SECTIONS = [
    { id: 1, title: 'Решения совещаний рабочей группы', link: '/energy/decisions', icon: '🤝' },
    { id: 2, title: 'Реестр протоколов совещаний', link: '/energy/registry', icon: '📋' },
    { id: 3, title: 'Показатели энергетической эффективности', link: '/energy/indicators', icon: '📈' },
    { id: 4, title: 'Нормативно-техническая документация', link: '/energy/ntd', icon: '📄' },
];

export default function EnergyHub() {
    return (
        <div className={styles.hubContainer}>
            <header className={styles.hubHeader}>
                <h1>Система управления энергосбережением</h1>
                <p>Блок по Системе управления энергосбережением в ООО «Газпром добыча Иркутск»</p>
                <nav className={styles.breadcrumb}>
                    <Link href="/">Главная</Link> / <span>СУЭн</span>
                </nav>
            </header>

            <div className={styles.hubGrid}>
                {ENERGY_SECTIONS.map(section => (
                    <Link key={section.id} href={section.link} className={styles.hubCard} target="_blank">
                        <span className={styles.hubIcon}>{section.icon}</span>
                        <h3>{section.title}</h3>
                    </Link>
                ))}
            </div>
        </div>
    );
}
