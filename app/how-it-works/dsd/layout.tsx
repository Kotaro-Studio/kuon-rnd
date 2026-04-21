import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How KUON DSD Works — Rust × WebAssembly | Kuon R&D',
  description:
    'Discover how the world\'s first browser-based DSD player works. Learn the technology behind DSD decimation, Rust WebAssembly engines, and real-time audio processing at MHz sample rates without any server overhead.',
  keywords: [
    'DSD',
    'WebAssembly',
    'Rust WASM',
    'audio processing',
    'DSF',
    'DSDIFF',
    'FIR filter',
    'sinc interpolation',
    'digital audio',
    'DSD64',
    'DSD128',
    'DSD256',
    'browser audio',
    'web audio API',
    'sigma-delta modulation',
    'SACD',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/how-it-works/dsd',
  },
  openGraph: {
    title: 'How KUON DSD Works — Rust × WebAssembly',
    description:
      'The technology behind the world\'s first browser-based DSD player using Rust compiled to WebAssembly.',
    url: 'https://kuon-rnd.com/how-it-works/dsd',
    siteName: 'Kuon R&D',
    type: 'article',
    locale: 'en_US',
    images: [
      {
        url: 'https://kuon-rnd.com/og-dsd-technical.jpeg',
        width: 1200,
        height: 630,
        alt: 'How KUON DSD Works — Technical Architecture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How KUON DSD Works — Rust × WebAssembly',
    description:
      'Learn the engineering behind the world\'s first browser DSD player.',
    images: ['https://kuon-rnd.com/og-dsd-technical.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  authors: [
    {
      name: 'Kotaro Asahina',
      url: 'https://kotaroasahina.com',
    },
  ],
};

export default function HowItWorksDsdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
