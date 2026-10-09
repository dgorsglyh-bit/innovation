'use client';
import AuditDetails from '@/components/quality/AuditDetails';
import { useParams } from 'next/navigation';

export default function AuditDetailsAdminPageClient() { 
    const { id } = useParams();
    return <AuditDetails auditId={parseInt(id as string)} isAdmin={true} />; 
}
