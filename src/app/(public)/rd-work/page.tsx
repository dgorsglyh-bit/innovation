'use client';

import { useState } from 'react';
import NeedsManager from '@/components/needs/NeedsManager';
import RndPlanManager from '@/components/rnd/RndPlanManager';

export default function RndWorkPage() {
    const [activeTab, setActiveTab] = useState<'needs' | 'plan'>('plan');

    return (
        <div style={{ padding: '1rem' }}>
            <h1 style={{ color: 'var(--primary-blue)', marginBottom: '2rem', textAlign: 'center' }}>
                Научно-исследовательские и опытно-конструкторские работы
            </h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
                <button 
                    onClick={() => setActiveTab('plan')}
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: activeTab === 'plan' ? 'var(--primary-blue)' : 'white',
                        color: activeTab === 'plan' ? 'white' : 'var(--primary-blue)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}
                >
                    План выполнения НИОКР
                </button>
                <button 
                    onClick={() => setActiveTab('needs')}
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: activeTab === 'needs' ? 'var(--primary-blue)' : 'white',
                        color: activeTab === 'needs' ? 'white' : 'var(--primary-blue)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}
                >
                    Сбор потребностей
                </button>
            </div>

            {activeTab === 'plan' ? (
                <RndPlanManager isAdmin={false} />
            ) : (
                <NeedsManager isAdmin={false} />
            )}
        </div>
    );
}
