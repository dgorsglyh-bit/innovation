'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Patent, PatentType } from '@/components/inventive/PatentManager';

const TYPE_LABELS: Record<PatentType, string> = {
    invention: 'Изобретение',
    utility_model: 'Полезная модель',
    software: 'Программа для ЭВМ'
};

export default function PatentClient() {
    const params = useParams();
    const router = useRouter();
    const [patent, setPatent] = useState<Patent | null>(null);
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('innovation_patents');
        if (stored) {
            const allPatents: Patent[] = JSON.parse(stored);
            const found = allPatents.find(p => p.id.toString() === params.id);
            if (found) {
                setPatent(found);
            }
        }
    }, [params.id]);

    const handleDownload = (fileData: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = fileData;
        link.download = fileName;
        link.click();
    };

    if (!patent) {
        return (
            <div className="main-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <h2>Запись не найдена</h2>
                <Link href="/inventive/patents" style={{ color: 'var(--primary-blue)', textDecoration: 'underline' }}>
                    Вернуться к списку
                </Link>
            </div>
        );
    }

    return (
        <div className="main-container">
            <div style={{ padding: '2rem 0' }}>
                <Link href="/inventive/patents" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--gray-dark)', textDecoration: 'none' }}>
                    ← Вернуться к списку
                </Link>

                <div style={{ background: 'white', borderRadius: '12px', padding: '2.5rem', border: '1px solid var(--gray-light)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        color: 'white',
                        padding: '0.4rem 1rem',
                        borderRadius: '4px',
                        display: 'inline-block',
                        marginBottom: '1.5rem',
                        backgroundColor: patent.type === 'invention' ? '#1976d2' : patent.type === 'utility_model' ? '#388e3c' : '#f57c00'
                    }}>
                        {TYPE_LABELS[patent.type]}
                    </div>

                    <h1 style={{ fontSize: '2rem', color: 'var(--primary-blue)', marginBottom: '2rem', lineHeight: '1.2' }}>
                        {patent.title}
                    </h1>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', padding: '2rem', background: '#f8f9fc', borderRadius: '8px', marginBottom: '2.5rem' }}>
                        <div>
                            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--gray-dark)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Государственный номер</p>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>№ {patent.number}</p>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--gray-dark)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Дата выдачи</p>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{new Date(patent.issueDate).toLocaleDateString('ru-RU')}</p>
                        </div>
                        {patent.expiryDate && (
                            <div>
                                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--gray-dark)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Срок действия</p>
                                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>до {new Date(patent.expiryDate).toLocaleDateString('ru-RU')}</p>
                            </div>
                        )}
                        <div>
                            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--gray-dark)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Авторы</p>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{patent.authors.join(', ')}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        {patent.description && (
                            <section>
                                <h3 style={{ borderLeft: '4px solid var(--primary-blue)', paddingLeft: '1rem', marginBottom: '1rem' }}>Краткое описание</h3>
                                <div style={{ lineHeight: '1.6', color: '#444', whiteSpace: 'pre-wrap' }}>
                                    {patent.description}
                                </div>
                            </section>
                        )}

                        {(patent.results || patent.implementationObject) && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                {patent.results && (
                                    <section>
                                        <h3 style={{ borderLeft: '4px solid #28a745', paddingLeft: '1rem', marginBottom: '1rem' }}>Достигаемые результаты</h3>
                                        <div style={{ lineHeight: '1.5', color: '#444' }}>{patent.results}</div>
                                    </section>
                                )}
                                {patent.implementationObject && (
                                    <section>
                                        <h3 style={{ borderLeft: '4px solid #f57c00', paddingLeft: '1rem', marginBottom: '1rem' }}>Объект внедрения</h3>
                                        <div style={{ lineHeight: '1.5', color: '#444' }}>{patent.implementationObject}</div>
                                    </section>
                                )}
                            </div>
                        )}

                        {patent.images && patent.images.length > 0 && (
                            <section>
                                <h3 style={{ marginBottom: '1.5rem' }}>Рисунки и схемы</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                    {patent.images.map((img, i) => (
                                        <div
                                            key={i}
                                            style={{ cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--gray-light)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', aspectRatio: '3/4' }}
                                            onClick={() => setFullScreenImage(img)}
                                        >
                                            <img src={img} alt={`Схема ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {patent.files && patent.files.length > 0 && (
                            <section style={{ background: '#f8f9fc', padding: '1.5rem', borderRadius: '8px' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Прилагаемые документы</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {patent.files.map((file, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.8rem 1.2rem', borderRadius: '6px', border: '1px solid var(--gray-light)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span style={{ fontSize: '1.5rem' }}>📄</span>
                                                <span style={{ fontWeight: '500' }}>{file.name}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDownload(file.data, file.name)}
                                                style={{ background: 'var(--primary-blue)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <span>📥</span> Скачать
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <div style={{ marginTop: '4rem', padding: '1.5rem', border: '1px solid #ffeeba', background: '#fff3cd', borderRadius: '8px', fontSize: '0.9rem', color: '#856404' }}>
                        <strong>Примечание:</strong> Данная страница содержит официальные сведения из реестра интеллектуальной собственности. Копии документов можно получить в патентном отделе.
                    </div>
                </div>
            </div>

            {/* Lightbox / Full screen image */}
            {fullScreenImage && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
                    onClick={() => setFullScreenImage(null)}
                >
                    <button style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer' }}>×</button>
                    <img
                        src={fullScreenImage}
                        alt="Full Screen"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }}
                    />
                </div>
            )}
        </div>
    );
}
