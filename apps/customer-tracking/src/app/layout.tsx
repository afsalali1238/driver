import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Track Shipment - Kasper Transport',
  description: 'Real-time equipment transport tracking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}