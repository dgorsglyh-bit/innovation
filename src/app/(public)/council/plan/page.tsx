'use client';

import CouncilPublic from '@/components/council/CouncilPublic';
import Link from 'next/link';

export default function CouncilPlanPage() {
    return (
        <div className="main-container">
            <div style={{ padding: '2rem 0' }}>
                <Link href="/" style={{ color: 'var(--gray-dark)', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>
                    ← На главную
                </Link>
                <h1 style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>План Научно-технического совета</h1>
                <p style={{ color: 'var(--gray-dark)', marginBottom: '3rem' }}>
                    В данном разделе представлены текущие планы работы НТС и возможность внесения предложений.
                </p>

                <CouncilPublic />
            </div>
        </div>
    );
}
