import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kasper Transport - Fleet Telematics & Driver Ecosystem Prototype',
  description: 'Production-ready founder prototype showcasing Ops Admin Live Telematics, Driver Mobile App Simulator, and Tokenized Customer Tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0F19] text-slate-100 min-h-screen antialiased selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
