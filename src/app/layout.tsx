import type { Metadata } from 'next';
import { Press_Start_2P } from 'next/font/google';
import './globals.css';

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

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
    <html lang="en" className={pressStart2P.variable}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </head>
      <body className="bg-bg text-text-base antialiased">{children}</body>
    </html>
  );
}
