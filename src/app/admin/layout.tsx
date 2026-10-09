'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            // If NOT authenticated and NOT on the login page (root /admin), redirect to login
            if (!isAuthenticated && pathname !== '/admin') {
                router.push('/admin');
            }
            // If authenticated and ON login page, redirect to dashboard
            if (isAuthenticated && pathname === '/admin') {
                router.push('/admin/dashboard');
            }
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    // Show loading state
    if (isLoading) {
        return (
            <div style={{ 
                height: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                background: 'var(--bg-gradient)'
            }}>
                <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>Загрузка...</div>
            </div>
        );
    }

    // If not authenticated (and presumably on /admin due to effect), show just children (Login form)
    if (!isAuthenticated) {
        return (
            <div style={{ minHeight: '100vh', padding: '2rem' }}>
                {children}
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <aside style={{
                width: '280px',
                background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                color: 'white',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
                zIndex: 10
            }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
                        Innovation <span style={{ color: '#8f94fb', fontSize: '0.8rem' }}>Admin</span>
                    </h2>
                </div>
                
                <div style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    marginBottom: '2rem',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Current User</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>{user?.username}</p>
                    <p style={{ fontSize: '0.8rem', color: '#8f94fb', margin: 0 }}>{user?.role}</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
                    <Link href="/admin/dashboard" className={pathname === '/admin/dashboard' ? 'active' : ''} style={navLinkStyle(pathname === '/admin/dashboard')}>Dashboard</Link>
                    <Link href="/admin/security" className={pathname === '/admin/security' ? 'active' : ''} style={navLinkStyle(pathname === '/admin/security')}>Security System</Link>
                    <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '1rem 0' }} />
                    <Link href="/admin/calendar" style={navLinkStyle(false)}>Calendar Events</Link>
                    <Link href="/admin/news" style={navLinkStyle(false)}>News Items</Link>
                    <Link href="/admin/rating" style={navLinkStyle(false)}>Ratings</Link>
                    <Link href="/admin/education" style={navLinkStyle(false)}>Education (Test)</Link>
                    <Link href="/admin/documents" style={navLinkStyle(false)}>Documents (НТД Рац.)</Link>
                    <Link href="/admin/inventive/ntd" style={navLinkStyle(false)}>Documents (НТД Изобр.)</Link>
                    <Link href="/admin/inventive/patents" style={navLinkStyle(false)}>Patents</Link>
                    <Link href="/admin/council" style={navLinkStyle(false)}>Научно-технический совет</Link>
                    <Link href="/admin/rationalization/statistics" style={navLinkStyle(false)}>Statistics</Link>
                    <Link href="/admin/publications" style={navLinkStyle(false)}>Публикации</Link>
                    <Link href="/admin/pilot-tests" style={navLinkStyle(false)}>Опытно промышленные испытания</Link>
                    <Link href="/admin/rd-work" style={navLinkStyle(false)}>НИОКР</Link>
                    <Link href="/admin/quality" style={navLinkStyle(false)}>Система менеджмента качества</Link>
                    <Link href="/admin/energy" style={navLinkStyle(false)}>Система управления энергосбережением</Link>
                    <Link href="/admin/import" style={navLinkStyle(false)}>Импортозамещение</Link>
                    <Link href="/admin/regions" style={navLinkStyle(false)}>Взаимодействие с регионами</Link>
                    <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '1rem 0' }} />
                    <Link href="/" style={navLinkStyle(false)}>&larr; Back to Site</Link>
                </nav>

                <button
                    onClick={logout}
                    style={{
                        marginTop: '1.5rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        padding: '0.75rem',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        fontWeight: '600'
                    }}
                >
                    Logout
                </button>
            </aside>
            <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
                {children}
            </main>
        </div>
    );
}

function navLinkStyle(isActive: boolean) {
    return {
        color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: isActive ? '600' : '400',
        background: isActive ? 'rgba(143, 148, 251, 0.2)' : 'transparent',
        transition: 'all 0.2s',
        display: 'block'
    };
}
