import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MindSync Player',
  description: 'Functional music to improve focus, relaxation, and sleep.',
};

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-950 min-h-screen">
      {children}
    </div>
  );
} 