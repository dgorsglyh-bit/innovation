import Navbar from '@/components/Navbar';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <Navbar />
            <div style={{ padding: '2rem' }}>
                {children}
            </div>
        </div>
    );
}
