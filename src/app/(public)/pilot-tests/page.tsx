'use client';

import OpiPublicHub from '@/components/opi/OpiPublicHub';
import Link from 'next/link';

export default function OpiHubPage() {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/" style={{ color: '#666', textDecoration: 'none' }}>&larr; На главную</Link>
            </div>
            <h1 style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>Опытно-промышленные испытания</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
                Раздел посвящен проведению испытаний опытных образцов и новых технологий на объектах предприятия.
            </p>
            <OpiPublicHub />
        </div>
    );
}
