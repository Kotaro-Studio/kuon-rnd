import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analog Machine Speed Calibration | Revox / Studer / Otari / Tascam',
  description: 'Precision speed calibration calculator for open-reel tape machines. Covers Revox B77/A77/PR99/A700, Studer A80/A810, Otari MX-5050, Tascam 38-2. Input measured frequency or period, see % speed deviation instantly. Free browser tool.',
  keywords: [
    'Revox B77 calibration', 'Revox A77 speed', 'Studer A80 calibration',
    'Otari MX-5050 speed', 'Tascam 38-2 calibration', 'tape speed calibration',
    '3150 Hz CCIR test tone', 'capstan speed adjust', 'reel speed deviation',
    'analog tape machine calibration', 'vintage recorder speed',
    'Revox 校正', 'Studer キャリブレーション', 'テープ速度',
  ],
  openGraph: {
    title: 'Speed Calibration — Revox / Studer / Otari / Tascam',
    description: 'Input measured frequency, see speed deviation % instantly.',
    url: 'https://kuon-rnd.com/analog-tools/speed-cal',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Analog Speed Calibration', description: 'Revox / Studer / Otari / Tascam speed calibration.' },
  alternates: { canonical: 'https://kuon-rnd.com/analog-tools/speed-cal' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
