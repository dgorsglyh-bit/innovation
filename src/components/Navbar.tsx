'use client';

import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={toggleTheme} className={styles.themeToggle}>
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    <div className={styles.logo}>
                        <Link href="/">Инновационная деятельность</Link>
                    </div>
                </div>
                <div className={styles.links}>
                    <Link href="/" className={styles.link}>Главная</Link>
                    <Link href="/rating" className={styles.link}>Рейтинг</Link>
                    <Link href="/admin" className={styles.link}>Вход для Администраторов</Link>
                </div>
            </div>
        </nav>
    );
}
