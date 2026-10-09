'use client';

import { useState } from 'react';
import NeedsManager from '@/components/needs/NeedsManager';
import RndPlanManager from '@/components/rnd/RndPlanManager';

export default function AdminRndWorkPage() {
    const [activeTab, setActiveTab] = useState<'needs' | 'plan'>('plan');

    return (
        <div style={{ padding: '0' }}>
            <h1 style={{ color: 'var(--primary-blue)', marginBottom: '2rem' }}>
                Управление НИОКР
            </h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button 
                    onClick={() => setActiveTab('plan')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeTab === 'plan' ? 'var(--primary-blue)' : '#e2e8f0',
                        color: activeTab === 'plan' ? 'white' : '#475569',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Управление планом НИОКР
                </button>
                <button 
                    onClick={() => setActiveTab('needs')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeTab === 'needs' ? 'var(--primary-blue)' : '#e2e8f0',
                        color: activeTab === 'needs' ? 'white' : '#475569',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Управление потребностями
                </button>
            </div>

            {activeTab === 'plan' ? (
                <RndPlanManager isAdmin={true} />
            ) : (
                <NeedsManager isAdmin={true} />
            )}
        </div>
    );
}
