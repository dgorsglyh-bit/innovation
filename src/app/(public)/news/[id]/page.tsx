
export function generateStaticParams() {
    return [{ id: '1' }]; 
}

import NewsClient from './NewsClient';

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return <NewsClient params={params} />;
}
