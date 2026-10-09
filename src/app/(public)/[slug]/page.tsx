import { notFound } from 'next/navigation';

const sectionData: Record<string, string> = {
    'inventive': 'Изобретательская деятельность',
    'council': 'Научно-технический совет',
    'publications': 'Публикации',
    'pilot-tests': 'Опытно промышленные испытания',
    'rd-work': 'Научно-исследовательские и опытно-конструкторские работы',
    'quality': 'Система менеджмента качества',
    'energy': 'Система управления энергосбережением',
    'import-substitution': 'Импортозамещение',
    'regions': 'Взаимодействие с регионами России',
};

// Add type params for Next.js App Router Page
export default async function SectionPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const slug = (await params).slug;
    const title = sectionData[slug];

    if (!title) {
        notFound();
    }

    return (
        <div className="main-container">
            <h1 style={{ marginBottom: '2rem' }}>{title}</h1>
            <div style={{
                padding: '2rem',
                backgroundColor: 'var(--white)',
                border: '1px solid var(--border-blue)',
                minHeight: '300px'
            }}>
                <p>Содержание раздела "{title}" находится в разработке.</p>
                <p style={{ marginTop: '1rem' }}>Здесь будет размещена информация о {title.toLowerCase()}.</p>
            </div>
        </div>
    );
}

export function generateStaticParams() {
    return Object.keys(sectionData).map((slug) => ({
        slug,
    }));
}
