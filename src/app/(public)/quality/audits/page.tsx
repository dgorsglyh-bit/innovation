'use client';

import Link from 'next/link';
import styles from '@/components/quality/Quality.module.css';

const AUDIT_SUB_SECTIONS = [
    { title: 'Программа аудитов (Перечень)', link: '/quality/audits/program', icon: '📋' },
    { title: 'Аналитика', link: '/quality/audits/analytics', icon: '📊' },
    { title: 'Несоответствия', link: '/quality/audits/discrepancies', icon: '🚫' },
    { title: 'Шаблоны', link: '/quality/audits/templates', icon: '📂' },
];

export default function AuditsHubPage() {
    return (
        <div className={styles.hubContainer}>
            <Link href="/quality" className={styles.backLink}>← Вернуться в СМК</Link>
            <header className={styles.hubHeader}>
                <h2>Внутренние аудиты</h2>
            </header>

            <div className={styles.hubGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                {AUDIT_SUB_SECTIONS.map((section, idx) => (
                    <Link key={idx} href={section.link} className={styles.hubCard} target="_blank">
                        <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>{section.icon}</span>
                        <h4>{section.title}</h4>
                    </Link>
                ))}
            </div>
        </div>
    );
}
