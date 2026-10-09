export function generateStaticParams() {
    return [{ id: '1' }]; 
}

import AuditDetailsPageClient from './AuditDetailsPageClient';

export default function AuditDetailsPage() {
    return <AuditDetailsPageClient />;
}
