'use client';

import Link from 'next/link';
import styles from './council_hub.module.css';

const COUNCIL_SUBSECTIONS = [
    { id: 1, title: 'План работы НТС', icon: '📅', link: '/council/plan' },
    { id: 2, title: 'Совещания НТС по плану', icon: '🤝', link: '/council/meetings' },
    { id: 3, title: 'Положения и регламенты', icon: '📜', link: '/council/regulations' },
    { id: 4, title: 'Состав НТС', icon: '👥', link: '/council/members' },
    { id: 5, title: 'Нормативно-техническая документация', icon: '📂', link: '/council/ntd' },
];

export default function CouncilHubPage() {
    return (
        <div className="main-container">
            <div style={{ padding: '3rem 0' }}>
                <Link href="/" style={{ color: 'var(--gray-dark)', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>
                    ← На главную
                </Link>
                <h1 style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>Научно-технический совет</h1>
                <p style={{ color: 'var(--gray-dark)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                    Выберите интересующий раздел для получения подробной информации.
                </p>

                <div className={styles.grid}>
                    {COUNCIL_SUBSECTIONS.map(sub => (
                        <Link key={sub.id} href={sub.link} className={styles.card}>
                            <div className={styles.icon}>{sub.icon}</div>
                            <h3>{sub.title}</h3>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
