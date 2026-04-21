import { Metadata } from 'next';

const DOMAIN = 'https://kuon-rnd.com';

export const metadata: Metadata = {
  title: 'How DDP Checker Works | KUON R&D',
  description: 'Technical deep-dive: How we parse, visualize, and play CD mastering binary format DDP entirely in the browser. Includes binary structure analysis, track building algorithm, and our innovative Gap Listen feature.',
  openGraph: {
    title: 'How DDP Checker Works | KUON R&D',
    description: 'Technical deep-dive: Parsing CD mastering binary format DDP in the browser — binary structure, track algorithms, and gap listening.',
    url: `${DOMAIN}/how-it-works/ddp`,
    type: 'article',
    images: [
      {
        url: `${DOMAIN}/og-ddp.png`,
        width: 1200,
        height: 630,
        alt: 'DDP Checker Technical Article',
      },
    ],
    siteName: 'KUON R&D',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How DDP Checker Works | KUON R&D',
    description: 'Technical deep-dive: Parsing CD mastering binary format DDP in the browser.',
    images: [`${DOMAIN}/og-ddp.png`],
  },
  keywords: [
    'DDP',
    'CD mastering',
    'binary format',
    'Disc Description Protocol',
    'audio engineering',
    'CD replication',
    'DDP parser',
    'browser audio processing',
    'Web Audio API',
  ],
};

export default function DDPHowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
