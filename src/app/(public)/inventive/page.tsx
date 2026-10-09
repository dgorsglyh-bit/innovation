'use client';

import Link from 'next/link';
import styles from './inventive.module.css';

export default function InventiveActivityPage() {
    return (
        <div className="main-container">
            <h1 style={{ marginBottom: '2rem' }}>Изобретательская деятельность</h1>

            <div className={styles.grid}>
                <Link href="/inventive/ntd" className={styles.card}>
                    <div className={styles.icon}>📄</div>
                    <h3>НТД</h3>
                    <p>Нормативно-техническая документация и регламенты</p>
                </Link>

                <Link href="/inventive/patents" className={styles.card}>
                    <div className={styles.icon}>🎓</div>
                    <h3>Объекты патентных и авторских прав</h3>
                    <p>Реестр изобретений, полезных моделей и программ для ЭВМ</p>
                </Link>

                {/* Fallback for other potential inventive sections */}
                <div className={`${styles.card} ${styles.disabled}`}>
                    <div className={styles.icon}>💡</div>
                    <h3>Заявки на изобретения</h3>
                    <p>Раздел в разработке</p>
                </div>
            </div>

            <div className={styles.description}>
                <p>Раздел посвящен вопросам интеллектуальной собственности, патентованию и работе с изобретениями в Обществе.</p>
            </div>
        </div>
    );
}
