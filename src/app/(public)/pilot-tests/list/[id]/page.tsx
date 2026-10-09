export function generateStaticParams() {
    return [{ id: '1' }]; 
}

import OpiClient from './OpiClient';

export default function OpiDetailPage() {
    return <OpiClient />;
}
