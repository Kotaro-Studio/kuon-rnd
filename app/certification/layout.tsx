import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'KUON CERTIFICATION — 音楽家のための独立国際認定制度 | Independent International Music Certification',
  description:
    '学歴も国籍も年齢も問わない、音楽家のための独立した国際認定制度。Bronze / Silver / Gold / Platinum の4段階。楽典・聴音・演奏・録音・和声を6言語・4記譜体系で評価。受験料 ¥9,800〜、認定維持費 ¥980〜 /月。ウェイトリスト受付中。Independent certification for musicians pursuing professional careers. Four tiers: Bronze / Silver / Gold / Platinum. Exams available in six languages and four notation systems. Waitlist open.',
  keywords: [
    // Japanese
    '音楽 認定',
    '音楽家 資格',
    '演奏家 認定',
    'プロ音楽家 認定',
    '音楽 独立認定',
    '音楽 国際認定',
    '音楽 オンライン試験',
    '楽典 試験',
    '聴音 試験',
    '演奏グレード',
    '音大 代替',
    'プロ志向 音楽',
    '音楽 資格 社会人',
    'Kuon 認定',
    'Kuon Certification',
    // English
    'music certification',
    'independent music certification',
    'international music certification',
    'professional musician credential',
    'music grade exam online',
    'music performance certification',
    'music theory exam online',
    'ear training certification',
    'alternative to conservatory',
    'music credential for freelance',
    'Kuon certification',
    // German
    'Musikzertifizierung',
    'unabhängige Musikzertifizierung',
    'internationale Musikzertifizierung',
    'Musikerausweis',
    'Musiktheorie Prüfung online',
    'Gehörbildung Prüfung',
    'Musiker Qualifikation',
    'Alternative zu Konservatorium',
    // Spanish / Portuguese / Korean
    'certificación musical',
    'certificación musicos',
    'certificacao musical',
    'certificacao musicos',
    '음악 인증',
    '연주자 인증',
  ],
  openGraph: {
    title: 'KUON CERTIFICATION — Independent International Music Certification',
    description:
      'Four tiers — Bronze, Silver, Gold, Platinum. Six languages, four notation systems. For musicians pursuing professional careers.',
    url: 'https://kuon-rnd.com/certification',
    siteName: 'Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON CERTIFICATION — Independent International Music Certification',
    description:
      'Four tiers. Six languages. An independent international certification for musicians pursuing professional careers.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/certification',
  },
};

export default function CertificationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
