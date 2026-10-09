'use client';

import Link from 'next/link';
import styles from './Import.module.css';

const IMPORT_SECTIONS = [
    { id: 1, title: 'Презентации ДО ПАО Газпром', link: 'O:/00 - Общая/Презентации', icon: '📊', isExternal: true },
    { id: 2, title: 'Протоколы совещаний', link: '/import/protocols', icon: '📝' },
    { id: 3, title: 'Реестр исполнения поручений', link: '/import/tasks', icon: '✅' },
    { id: 4, title: 'Перечень импортного оборудования общества', link: '/import/equipment', icon: '⚙️' },
    { id: 5, title: 'Нормативно-техническая документация', link: '/import/ntd', icon: '📄' },
];

export default function ImportHub() {
    return (
        <div className={styles.hubContainer}>
            <header className={styles.hubHeader}>
                <h1>Импортозамещение</h1>
                <p>Блок по импортозамещению</p>
                <nav className={styles.breadcrumb}>
                    <Link href="/">Главная</Link> / <span>Импортозамещение</span>
                </nav>
            </header>

            <div className={styles.hubGrid}>
                {IMPORT_SECTIONS.map(section => (
                    <Link 
                        key={section.id} 
                        href={section.link} 
                        className={styles.hubCard} 
                        target="_blank"
                        onClick={(e) => {
                            if (section.isExternal) {
                                e.preventDefault();
                                alert(`Ссылка ведет в сетевую папку: ${section.link}. \nПожалуйста, убедитесь, что у вас есть к ней доступ.`);
                            }
                        }}
                    >
                        <span className={styles.hubIcon}>{section.icon}</span>
                        <h3>{section.title}</h3>
                    </Link>
                ))}
            </div>
        </div>
    );
}
