'use client';
import RatingManager from '@/components/rating/RatingManager';

export default function AdminRatingPage() {
  return (
    <div>
      <h1 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Редактирование Рейтинга</h1>
      <RatingManager />
    </div>
  );
}
