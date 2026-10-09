'use client';

import CouncilManager from '@/components/council/CouncilManager';

export default function AdminCouncilPlanPage() {
    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ color: 'var(--primary-blue)', marginBottom: '2rem' }}>План НТС</h1>
            <CouncilManager mode="plan" />
        </div>
    );
}
