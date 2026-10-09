'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function AdminPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
        } catch (err: any) {
            setError(err.message || 'Ошибка входа. Проверьте учетные данные.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Innovation</h1>
                    <p className={styles.subtitle}>Система управления порталом</p>
                </div>

                <form onSubmit={handleLogin} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}
                    
                    <div className={styles.field}>
                        <label>Имя пользователя</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin"
                            required
                        />
                    </div>
                    
                    <div className={styles.field}>
                        <label>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    
                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Вход...' : 'Войти в систему'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>Забыли пароль? <span className={styles.link}>Обратитесь к администратору</span></p>
                </div>
            </div>
        </div>
    );
}
