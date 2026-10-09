export function generateStaticParams() {
    return [{ id: '1' }]; 
}

import AuditDetailsAdminPageClient from './AuditDetailsAdminPageClient';

export default function AuditDetailsAdminPage() {
    return <AuditDetailsAdminPageClient />;
}
