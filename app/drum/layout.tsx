import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON DRUM MACHINE — 世界12文化圏のリズムを叩くブラウザドラムマシン | 空音開発',
  description:
    'キューバ・ブラジル・アルゼンチン・スペイン・バルカン・日本など世界の本物リズムを内蔵。サンプル不要・登録不要・ブラウザ完結。8トラック × 16ステップ × 4ジャンルキット。WAV出力・URL共有対応。完全無料。',
  keywords: [
    'ドラムマシン', 'drum machine', 'リズムマシン', 'rhythm machine',
    '無料ドラムマシン', 'free drum machine', 'browser drum machine', 'online drum machine',
    'ドラムシーケンサー', 'drum sequencer', 'beat maker', 'ビートメーカー',
    'TR-808', 'TR-909', '808', '909', 'シンセドラム', 'synth drum',
    'クラベ', 'clave', 'ソンクラベ', 'son clave', 'サルサ', 'salsa',
    'ボサノバ', 'bossa nova', 'サンバ', 'samba', 'タンゴ', 'tango', 'ハバネラ',
    'フラメンコ', 'flamenco', 'ブレリーア', 'buleria',
    'レゲエ', 'reggae', 'ワンドロップ', 'one drop',
    'ジャズ', 'jazz', 'スウィング', 'swing', 'シャッフル', 'shuffle',
    'ファンク', 'funk', 'パーディーシャッフル', 'purdie shuffle',
    'ヒップホップ', 'hip-hop', 'トラップ', 'trap', 'ドリル', 'drill',
    'バルカン', 'balkan', '7/8', '11/8', '5/4', 'odd meter', '変拍子',
    '和太鼓', 'taiko', 'matsuri', 'kotaro asahina', '朝比奈幸太郎',
    'web audio api', 'synthesis', 'シンセシス', 'no samples', 'サンプル不要',
    'wav export', 'wav書き出し', 'pattern share', 'パターン共有',
    'metronome', 'メトロノーム', 'rhythm training', 'リズム練習',
    '民族音楽', 'world music', 'ethnic rhythm',
    '音大生', 'music student', 'composition', '作曲',
    'splice alternative', 'bandlab alternative', 'beepbox',
    'kuon rnd', '空音開発',
  ],
  openGraph: {
    title: 'KUON DRUM MACHINE — 世界12文化圏のリズムを叩くブラウザドラムマシン',
    description: 'キューバ・ブラジル・バルカン・日本など世界の本物リズムを内蔵。サンプル不要・登録不要・ブラウザ完結。完全無料。',
    type: 'website',
    url: 'https://kuon-rnd.com/drum',
    siteName: '空音開発 / Kuon R&D',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON DRUM MACHINE',
    description: '世界12文化圏のリズムを叩く・サンプル不要・登録不要・ブラウザ完結',
  },
  alternates: { canonical: 'https://kuon-rnd.com/drum' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
