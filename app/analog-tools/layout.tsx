import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analog Tools | Kuon R&D — Open-Reel Tape & Vintage Audio Calculators',
  description: 'Precision calculators for open-reel tape and vintage analog gear. Reel remaining time, recording duration, Revox/Studer/Otari speed calibration, performance time, voltage/dB conversion. Free browser tools for audio engineers worldwide.',
  keywords: [
    'open reel tape calculator', 'Revox B77 calibration', 'Studer A80 speed',
    'NAB CCIR reel', 'tape remaining time', 'dBu dBV converter',
    'analog audio tools', 'vintage recording gear', 'tape speed calibration',
    'Otari MX-5050', 'Tascam 38-2', 'Kuon analog',
    'オープンリール 計算機', 'Revox レストア', 'テープ残量',
  ],
  openGraph: {
    title: 'Kuon Analog Tools — Open-Reel Tape & Vintage Audio Calculators',
    description: 'Five precision browser calculators for open-reel tape and vintage analog audio workflows. Used by engineers worldwide.',
    url: 'https://kuon-rnd.com/analog-tools',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kuon Analog Tools',
    description: 'Precision calculators for open-reel tape and vintage analog gear.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/analog-tools',
  },
};

export default function AnalogToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
