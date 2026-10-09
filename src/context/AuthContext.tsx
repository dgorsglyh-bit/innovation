'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    username: string;
    role: 'admin' | 'user';
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Mocking auth check via localStorage for static export
                const savedUser = localStorage.getItem('innovation_user');
                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to check auth:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (username: string, password: string) => {
        // Simple hardcoded mock login for static demonstration
        // In a real production app on Spark, you'd use Firebase Auth here.
        if (username === 'admin' && password === 'admin') {
            const userData: User = { username: 'admin', role: 'admin' };
            setUser(userData);
            localStorage.setItem('innovation_user', JSON.stringify(userData));
            router.push('/admin/dashboard');
        } else {
            throw new Error('Invalid credentials. Use admin/admin for demo.');
        }
    };

    const logout = async () => {
        localStorage.removeItem('innovation_user');
        setUser(null);
        router.push('/admin');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
