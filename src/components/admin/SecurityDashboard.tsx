'use client';

import { useState, useEffect } from 'react';

interface Log {
    event: string;
    username: string;
    timestamp: string;
    ip: string;
}

export default function SecurityDashboard() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/auth/logs');
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data);
                }
            } catch (error) {
                console.error('Failed to fetch logs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>Security Control Center</h1>
                <p style={{ color: '#64748b' }}>Monitoring system access and data confidentiality.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <StatusCard title="System Health" value="Secure" color="#10b981" />
                <StatusCard title="Active Sessions" value="1" color="#3b82f6" />
                <StatusCard title="Threat Level" value="None" color="#ec4899" />
            </div>

            <div style={{ 
                background: 'white', 
                borderRadius: '20px', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontWeight: '700' }}>Recent Security Events</h3>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Last 50 events</span>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.8rem' }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem' }}>Event</th>
                                <th style={{ padding: '1rem 1.5rem' }}>User</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Timestamp</th>
                                <th style={{ padding: '1rem 1.5rem' }}>IP Address</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '0.9rem' }}>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Загрузка событий...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No events recorded.</td>
                                </tr>
                            ) : (
                                logs.map((log, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{ 
                                                padding: '0.25rem 0.6rem', 
                                                borderRadius: '6px', 
                                                fontSize: '0.75rem', 
                                                fontWeight: '600',
                                                background: log.event.includes('success') ? '#dcfce7' : '#fee2e2',
                                                color: log.event.includes('success') ? '#166534' : '#991b1b'
                                            }}>
                                                {log.event.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>{log.username}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontFamily: 'monospace' }}>{log.ip}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusCard({ title, value, color }: { title: string, value: string, color: string }) {
    return (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: color }}>{value}</p>
        </div>
    );
}
