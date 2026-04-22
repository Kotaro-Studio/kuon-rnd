import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voltage ⇔ dB Converter (6-way) | dBu / dBV / dBm / Vrms / Vpp / Vp',
  description: 'Precision 6-way bidirectional converter for analog audio voltages. dBu, dBV, dBm, Vrms, Vpp, Vp with impedance (600Ω / 150Ω / 50Ω) selection. Presets for 0dBu, +4dBu, +6dBu, −10dBV. Free browser tool for audio engineers.',
  keywords: [
    'dBu to volts', 'dBV calculator', 'dBm conversion',
    'voltage to dB', '0dBu 0.775V', '+4dBu line level',
    '-10dBV consumer level', 'Vrms Vpp converter',
    'analog audio voltage', 'millivoltmeter reference',
    'dBu Vrms 変換', '電圧 dB 換算',
  ],
  openGraph: {
    title: 'Voltage ⇔ dB Converter — 6-way Analog Audio',
    description: 'dBu / dBV / dBm / Vrms / Vpp / Vp bidirectional conversion.',
    url: 'https://kuon-rnd.com/analog-tools/dbu-volt',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Voltage ⇔ dB Converter', description: '6-way analog audio voltage conversion.' },
  alternates: { canonical: 'https://kuon-rnd.com/analog-tools/dbu-volt' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
