'use client';

import Link from 'next/link';
import styles from './OpiPublic.module.css';

export default function OpiPublicHub() {
    const cards = [
        {
            title: 'Нормативно-техническая документация',
            description: 'Нормативные акты и документы, регламентирующие проведение опытно-промышленных испытаний.',
            link: '/pilot-tests/ntd',
            icon: '📂'
        },
        {
            title: 'Перечень опытно-промышленных испытаний',
            description: 'База данных проводимых испытаний опытных образцов, МТР, технологических процессов и методов.',
            link: '/pilot-tests/list',
            icon: '📋'
        }
    ];

    return (
        <div className={styles.hub}>
            <div className={styles.grid}>
                {cards.map((card, idx) => (
                    <Link key={idx} href={card.link} className={styles.card}>
                        <span className={styles.icon}>{card.icon}</span>
                        <h3>{card.title}</h3>
                        <p>{card.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
