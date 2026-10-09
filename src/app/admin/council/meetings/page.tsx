'use client';

import CouncilManager from '@/components/council/CouncilManager';

export default function AdminCouncilMeetingsPage() {
    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ color: 'var(--primary-blue)', marginBottom: '2rem' }}>Совещания НТС</h1>
            <CouncilManager mode="meetings" />
        </div>
    );
}
