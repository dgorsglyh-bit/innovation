'use client';

import { useState, useEffect } from 'react';

interface RatingItem {
  id: number;
  image: string;
  text1: string;
  text2: string;
}

export default function RatingPage() {
  const [items, setItems] = useState<RatingItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('innovation_rating');
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="main-container">
      <h1 style={{ margin: '2rem 0', color: 'var(--primary-blue)', textAlign: 'center' }}>Рейтинг</h1>

      {items.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Рейтинг пока не сформирован.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {items.map(item => (
          <div key={item.id} style={{
            display: 'flex',
            gap: '2rem',
            background: 'var(--bg-card)',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ flexShrink: 0 }}>
              <img
                src={item.image}
                alt="Rating"
                style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem', color: 'var(--text-primary)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{item.text1}</div>
              <div style={{ fontSize: '1rem' }}>{item.text2}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
