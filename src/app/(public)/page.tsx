import SectionGrid from '@/components/SectionGrid';
import CalendarWidget from '@/components/CalendarWidget';
import NewsWidget from '@/components/NewsWidget';
import TopRatingsWidget from '@/components/rating/TopRatingsWidget';

export default function Home() {
  return (
    <main className="main-container">
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Портал Инновационной Деятельности</h1>

      <section>
        <SectionGrid />
      </section>

      <section style={{ marginTop: '2rem' }}>
        <TopRatingsWidget />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '3rem' }}>
        <section>
          <h2 style={{ marginBottom: '1rem' }}>Календарь мероприятий</h2>
          <CalendarWidget />
        </section>

        <section>
          <NewsWidget />
        </section>
      </div>
    </main>
  );
}
