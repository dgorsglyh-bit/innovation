'use client';

import Link from 'next/link';
import styles from './rationalization.module.css';

export default function RationalizationPage() {
    return (
        <div className="main-container">
            <h1 style={{ marginBottom: '2rem' }}>Рационализаторская деятельность</h1>

            <div className={styles.grid}>
                <Link href="/rationalization/education" className={styles.card}>
                    <div className={styles.icon}>🎓</div>
                    <h3>Обучение</h3>
                    <p>Видеоинструктаж, материалы и тестирование</p>
                </Link>

                <Link href="/rationalization/ntd" className={styles.card}>
                    <div className={styles.icon}>📄</div>
                    <h3>НТД</h3>
                    <p>Нормативно-техническая документация и планы</p>
                </Link>

                <Link href="/rationalization/statistics" className={styles.card}>
                    <div className={styles.icon}>📊</div>
                    <h3>Статистика</h3>
                    <p>Показатели деятельности и аналитика</p>
                </Link>
            </div>

            <div className={styles.description}>
                <p>В этом разделе представлена информация и инструменты, связанные с рационализаторской деятельностью Общества.</p>
            </div>
        </div>
    );
}
