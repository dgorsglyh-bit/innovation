export function generateStaticParams() {
    return [{ id: '1' }]; 
}

import PatentClient from './PatentClient';

export default function PatentDetailPage() {
    return <PatentClient />;
}
