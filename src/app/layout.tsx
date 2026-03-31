import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pixel Agents Office',
  description:
    'A pixel-art virtual office with 5 AI agents collaborating in real-time. Watch Luna, Max, Ava, Sam, and Rio work, chat, and meet.',
  keywords: ['pixel art', 'AI agents', 'virtual office', 'simulation'],
  openGraph: {
    title: 'Pixel Agents Office',
    description:
      'A pixel-art virtual office with 5 AI agents collaborating in real-time.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixel Agents Office',
    description:
      'A pixel-art virtual office with 5 AI agents collaborating in real-time.',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
