import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON METRONOME — プロ監修メトロノーム | 空音開発',
  description:
    'プロの音楽家 朝比奈幸太郎 監修。Web Audio API精密スケジューリング。タップテンポ・12種拍子・サブディビジョン・サイレントバー練習・スピードトレーナー・ポリリズム・スウィング・変拍子グルーピング・メトリックモジュレーション・クラーベパターン・ビートディスプレイスメント・オーバーザバーライン・チューニング基準音・プリセット・練習ログ。ブラウザ完結・完全無料。',
  keywords: [
    'メトロノーム', 'metronome', 'オンラインメトロノーム', 'online metronome',
    'プロ監修', 'professional metronome', 'タップテンポ', 'tap tempo',
    'サイレントバー', 'silent bar practice', 'スピードトレーナー', 'speed trainer',
    'ポリリズム', 'polyrhythm', 'ポリリズムメトロノーム', 'polyrhythm metronome',
    'スウィング', 'swing metronome', '変拍子', 'irregular meter', 'odd time signature',
    'サブディビジョン', 'subdivision', 'チューニング', 'tuning reference',
    'メトリックモジュレーション', 'metric modulation', 'metric modulation training',
    'metric modulation metronome', 'tempo modulation', 'beat equivalence',
    'クラーベ', 'clave', 'son clave', 'rumba clave', 'clave metronome',
    'ボサノバリズム', 'bossa nova rhythm', 'サンバリズム', 'samba rhythm',
    'ジャズライド', 'jazz ride', 'jazz ride pattern', 'cascara',
    'ビートディスプレイスメント', 'beat displacement', 'rhythmic displacement',
    'displaced beat training', 'jazz displacement',
    'オーバーザバーライン', 'over the barline', 'cross-barline accent',
    'over barline training', 'jazz phrasing', 'jazz polymetric',
    '拍子', 'time signature', 'BPM', 'tempo',
    '音大受験', '音楽練習', 'music practice', 'ソルフェージュ', 'solfege',
    'ジャズ練習', 'jazz practice', 'jazz training', 'jazz metronome',
    '5/4', '7/8', '6/8', '9/8', '12/8', '5/8',
    '메트로놈', '온라인 메트로놈', '탭 템포', '폴리리듬', '변박자', '음대 입시',
    '메트릭 모듈레이션', '클라베', '비트 디스플레이스먼트', '재즈 연습',
    'metrónomo', 'metrónomo en línea', 'metrónomo online', 'polirritmia', 'compás irregular',
    'modulación métrica', 'clave', 'desplazamiento rítmico', 'práctica de jazz',
    'metrônomo', 'metrônomo online', 'polirritmia', 'compasso irregular',
    'modulação métrica', 'clave', 'deslocamento rítmico', 'prática de jazz',
  ],
  openGraph: {
    title: 'KUON METRONOME — Pro-Supervised Metronome with Jazz Training',
    description: 'Silent bar, speed trainer, polyrhythm, swing, metric modulation, clave patterns, beat displacement, over-the-barline. Free.',
    url: 'https://kuon-rnd.com/metronome-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON METRONOME — Pro-Supervised + Jazz Training',
    description: 'Metric modulation, clave, beat displacement, OTB, polyrhythm, swing, silent bar. Free.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/metronome-lp',
  },
};

export default function MetronomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
