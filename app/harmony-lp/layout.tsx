import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON HARMONY — 和声課題リアルタイムチェッカー | 並達5度・声部進行・四声体チェック | 空音開発',
  description:
    '世界で唯一のブラウザ和声チェッカー。朝比奈幸太郎（作曲家・音響エンジニア）監修。並達5度・並達8度・隠伏5度・隠伏8度・声部交差・声部超越・声部間隔・音域逸脱・限定進行・導音解決・増2度を自動検出。SATB四声体の禁則を提出前にチェック。芸大和声・Piston・Aldwell & Schachter に準拠。全26調対応。リアルタイム検出・自動修正提案。音大生・受験生・作曲家のための無料和声チェックツール。',
  keywords: [
    // Japanese - 和声関連
    '和声', 'harmony', '和声学', '和声課題', 'harmony homework',
    '四声体', '4声体', 'four-part writing', 'SATB', 'SATB writing',
    '並達5度', '並達8度', 'parallel fifths', 'parallel octaves',
    '連続5度', '連続8度', '禁則', 'harmony rules', 'voice leading rules',
    '隠伏5度', '隠伏8度', 'hidden fifths', 'hidden octaves', 'direct fifths',
    '対斜', 'direct octaves',
    '声部交差', '声部超越', 'voice crossing', 'voice overlap',
    '声部間隔', '間隔', 'spacing violations', 'voice spacing',
    '音域', '音域逸脱', 'range', 'range violation', 'vocal range',
    '限定進行', '導音', '導音解決', '導音進行', 'resolution rules',
    'leading tone', 'leading note resolution', 'leading tone resolution',
    '7度', 'V7', '属7', '属七', '属七和音', 'dominant seventh',
    '増2度', 'augmented second', 'augmented 2', 'forbidden interval',
    '和音', '和音分析', 'chord identification', 'chord analysis',
    'ローマ数字', 'roman numeral', 'functional harmony',
    'I', 'IV', 'V', 'ii', 'vi', '主和音', '属和音', '下属和音',
    '和声進行', 'harmonic progression', 'chord progression',
    '機能和声', 'functional harmony', 'tonal harmony',

    // 音大・受験関連
    '音大', '音楽大学', 'music university', 'music college',
    '音大入試', '音大受験', 'music entrance exam', 'music university entrance',
    '音大受験生', 'music exam candidate', 'music exam prep',
    '共通テスト', 'common test',
    '音楽科', '作曲科', '音楽理論科', 'composition major', 'theory major',
    '芸大', '芸術大学', 'Geidai', 'Tokyo University of the Arts',

    // 楽典・音楽理論
    '楽典', '音楽理論', 'music theory', 'music fundamentals',
    '音楽基礎', 'music basics',
    '対位法', 'counterpoint', 'contrapuntal',
    '初期対位法', 'species counterpoint', 'first species counterpoint',
    '第一種対位法', '第二種対位法',
    'ソルフェージュ', 'solfège', 'sight singing',
    '聴音', 'ear training', 'dictation',

    // 教科書・参考書
    '島岡襄', '和声理論と実習', 'Shimaoka Yo',
    'Walter Piston', 'Harmony',
    'Edward Aldwell', 'Carl Schachter', 'Harmony and Voice Leading',
    '標準教科書', 'standard textbook',

    // 検出・チェック機能
    'チェック', 'check', 'checker',
    '自動検出', 'automatic detection', 'auto detection',
    'リアルタイム', 'real-time', 'real time',
    '検証', 'verification', 'verify',
    '禁則検出', 'rule detection',
    'エラー検出', 'error detection',
    '修正案', 'suggestion', 'suggestion',

    // ツール・プラットフォーム
    'オンライン', 'online', 'web-based',
    'ブラウザ', 'browser', 'browser-based',
    '無料', 'free', 'free tool',
    'アプリ', 'app', 'application',
    'ツール', 'tool', 'utility',
    'Sibelius', 'Finale', '楽譜作成',

    // 学習・練習
    '練習', 'practice', 'study',
    '学習', 'learning', 'study',
    '課題', 'homework', 'assignment', 'exercise',
    '演習', 'practice session',
    '提出', 'submission', 'submit',
    '予習', '復習', 'review',

    // 楽器関連
    '楽器', 'instrument',
    'ピアノ', 'piano', 'pianist',
    'ヴァイオリン', 'violin',
    'チェロ', 'cello',
    'フルート', 'flute',
    'クラリネット', 'clarinet',
    'トランペット', 'trumpet',
    '声楽', 'voice', 'vocalist', 'vocal',
    'ソプラノ', 'soprano', 'S',
    'アルト', 'alto', 'A',
    'テノール', 'tenor', 'T',
    'バス', 'bass', 'B',

    // 音域・調性
    'C調', 'D調', 'E調', 'F調', 'G調', 'A調', 'B調',
    '長調', 'major', 'major key', 'major scale',
    '短調', 'minor', 'minor key', 'minor scale',
    'ナチュラル', 'natural minor', 'pure minor',
    'ハーモニック', 'harmonic minor',
    'メロディック', 'melodic minor',
    '全調', '全調対応', 'all keys', '26調',

    // 和声分析用語
    'root position', 'first inversion', 'second inversion',
    '根音位置', '第一転回形', '第二転回形',
    '密集配置', 'close position', 'closed voicing',
    '開離配置', 'open position', 'open voicing',
    'ダブリング', 'doubling', 'note doubling',
    '根音の倍音', 'root doubling',
    '第三音', '第五音',

    // 進行関連
    '進行', 'progression', 'motion',
    '上行', 'ascending', 'rising',
    '下行', 'descending', 'falling',
    '斜行進行', 'oblique motion',
    '直行進行', 'direct motion', 'similar motion',
    '逆行進行', 'contrary motion', 'opposite motion',

    // 学年・属性
    '高校生', 'high school', 'secondary student',
    '大学生', 'university student', 'college student',
    '学生', 'student',
    '独学', 'self-taught', 'self-learning',
    '初心者', 'beginner',
    '初級', 'beginner level',
    '中級', 'intermediate',
    '上級', 'advanced',

    // ジャンル
    'クラシック', 'classical', 'classical music',
    '現代音楽', 'contemporary music', 'modern music',
    '映画音楽', 'film score', 'movie soundtrack',
    'ゲーム音楽', 'video game music',
    'J-POP', 'J-pop',

    // 英語版キーワード
    'voice leading checker', 'harmonic analysis tool',
    'music theory practice', 'harmony exercise',
    'parallel motion detector', 'voice spacing checker',
    'functional harmony analysis', 'chord analysis tool',
    'four-part writing checker', 'classical harmony',
    'western harmony', 'tonal harmony practice',
    'music student tool', 'musician resource',

    // Korean キーワード
    '화성', 'harmony', '화성학', '화성 과제',
    '4성부', 'four-part',
    '병행', 'parallel', 'motion',
    '성부', 'voice',
    '음악 대학', '음악 입시',
    '음악 이론',

    // Portuguese キーワード
    'harmonia', 'teoria musical', 'musica',
    'exercicio de harmonia', 'analise harmonica',
    'quintas paralelas', 'oitavas paralelas',
    'conducao de vozes',

    // Spanish キーワード
    'armonía', 'teoría musical', 'música',
    'ejercicio de armonía', 'análisis armónico',
    'quintas paralelas', 'octavas paralelas',
    'conducción de voces',

    // その他関連キーワード
    '朝比奈幸太郎', '空音開発',
    '音響', 'audio', 'acoustic',
    'エンジニア', 'engineer',
    '公開', 'free online tool',
    'クラウド', 'cloud-based',
  ],
  openGraph: {
    title: 'KUON HARMONY — Real-Time Harmony Checker | Parallel 5ths, Voice Leading Detection',
    description: 'The world\'s only browser-based harmony checker. Detects parallel 5ths/8ths, voice crossing, range violations, resolution rules in real-time. SATB four-part writing validation. Free.',
    url: 'https://kuon-rnd.com/harmony-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON HARMONY — Real-Time Harmony Checking for Music Students',
    description: 'Detects parallel 5ths, voice crossing, range violations, and 10+ harmony rules instantly. Perfect for music university students and exam prep.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/harmony-lp',
  },
};

export default function HarmonyLPLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
