'use client';

import Link from 'next/link';

const ADMIN_COUNCIL_SECTIONS = [
    { title: 'План работы НТС', link: '/admin/council/plan', icon: '📅' },
    { title: 'Совещания НТС', link: '/admin/council/meetings', icon: '🤝' },
    { title: 'Нормативно-техническая документация', link: '/admin/council/ntd', icon: '📂' },
];

export default function AdminCouncilHub() {
    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ color: 'var(--primary-blue)', marginBottom: '2rem' }}>Управление Научно-техническим советом</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {ADMIN_COUNCIL_SECTIONS.map((section, idx) => (
                    <Link
                        key={idx}
                        href={section.link}
                        style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        <span style={{ fontSize: '2.5rem' }}>{section.icon}</span>
                        <h3 style={{ margin: 0, color: 'var(--primary-blue)' }}>{section.title}</h3>
                    </Link>
                ))}
            </div>
        </div>
    );
}
