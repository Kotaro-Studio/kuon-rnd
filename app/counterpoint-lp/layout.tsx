import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON COUNTERPOINT — 種別対位法リアルタイムチェッカー | Fux方式 | 並達5度・掛留・声部進行検出 | 空音開発',
  description:
    '世界初のブラウザ対位法チェッカー。Fuxの厳密な種別対位法に準拠。第1〜第4類の全禁則を自動検出。並達5度・並達8度・隠伏5度・隠伏8度・声部交差・掛留の解決・不協和音処理を即座にチェック。定旋律との音程禁止・進行分類・旋律的規則も検証。提出前にすべての対位法エラーを修正。音大生・作曲受験生のための無料対位法チェックツール。',
  keywords: [
    // Japanese - 対位法関連
    '対位法', 'counterpoint', '対位法チェッカー',
    '種別対位法', 'species counterpoint',
    '第1類', '第2類', '第3類', '第4類', '1:1', '2:1', '4:1', 'syncopation',
    '第一種', '第二種', '第三種', '第四種',
    '類別対位法', 'first species', 'second species', 'third species', 'fourth species',
    '並達5度', '並達8度', 'parallel fifths', 'parallel octaves',
    '連続5度', '連続8度',
    '隠伏5度', '隠伏8度', 'hidden fifths', 'hidden octaves', 'direct fifths', 'direct octaves',
    '声部交差', '声部超越', 'voice crossing', 'voice overlap',
    '掛留音', 'suspension', 'prepared suspension', '定時音',
    '掛留の解決', 'suspension resolution', '下行解決',
    '経過音', 'passing tone', 'passing tones',
    '近音', 'neighbor tone', 'auxiliary tone',
    'カンビアータ', 'cambiata',
    '定旋律', 'cantus firmus', '主旋律',
    '対旋律', 'countermelody', 'counterpoint melody',
    '不協和音', 'dissonance', '不協和音程',
    '協和音', 'consonance', '協和音程',
    '3度', '6度', '2度', '4度', '7度', '増2度',
    '音程禁止', 'forbidden interval',
    'Fux', 'Johann Joseph Fux', 'Gradus', 'Gradus ad Parnassum',
    '対位法の禁則', 'counterpoint rules', 'counterpoint violations',

    // 進行・声部関連
    '進行', 'motion',
    '直進行', 'similar motion', 'direct motion',
    '逆進行', 'contrary motion', 'opposite motion',
    '斜進行', 'oblique motion',
    '声部進行', 'voice leading', 'part leading',
    '声部交差', 'voice crossing',
    '旋律的飛躍', 'melodic leap', 'melodic jump',
    '旋律的規則', 'melodic rules',
    '音域', 'range', 'register',

    // 音大・受験関連
    '音大', '音楽大学', 'music university', 'music college',
    '音大入試', '音大受験', 'music entrance exam',
    '音大受験生', 'music exam candidate',
    '作曲科', '作曲専攻', 'composition major',
    '音楽理論科', '音楽理論専攻', 'theory major',
    '芸大', '東京藝術大学', 'Geidai',
    '共通テスト', '二次対策',

    // 楽典・音楽理論
    '楽典', '音楽理論', 'music theory',
    '声楽', 'vocal writing',
    'ソルフェージュ', 'solfège',
    '聴音', 'ear training',
    '初期対位法', 'strict counterpoint',
    '自由対位法', 'free counterpoint',
    'フーガ', 'fugue', 'fugal writing',
    'カノン', 'canon',
    '有伴奏対位法', '無伴奏対位法',

    // 検出・チェック機能
    'チェック', 'check', 'checker',
    '自動検出', 'automatic detection',
    'リアルタイム', 'real-time',
    '検証', 'verification',
    '禁則検出', 'rule detection',
    'エラー検出', 'error detection',
    '修正案', 'suggestion',
    'エラー表示', 'error display',

    // ツール・プラットフォーム
    'オンライン', 'online',
    'ブラウザ', 'browser', 'browser-based',
    '無料', 'free',
    'アプリ', 'app',
    'ツール', 'tool', 'utility',
    'Sibelius', 'Finale', 'MuseScore',

    // 学習関連
    '練習', 'practice',
    '学習', 'learning', 'study',
    '課題', 'homework', 'assignment', 'exercise',
    '演習', 'practice session',
    '提出', 'submission', 'submit',
    '予習', '復習', 'review',
    '独学', 'self-taught',

    // 楽器・声部
    'ソプラノ', 'soprano', 'S',
    'アルト', 'alto', 'A',
    'テノール', 'tenor', 'T',
    'バス', 'bass', 'B',
    'SATB',
    '四声体', 'four-part writing',
    'ピアノ', 'piano',
    '声楽', 'voice',

    // キー・調性
    'C調', 'major', 'minor', '長調', '短調',
    '全調', '調性',

    // 進行分析
    '和声進行', 'harmonic progression',
    'ローマ数字分析', 'roman numeral',
    '機能和声', 'functional harmony',
    'I', 'IV', 'V',

    // 教科書・参考書
    'Fux', 'Piston', 'Aldwell', 'Schachter',
    '教科書', 'textbook',

    // その他キーワード
    '朝比奈幸太郎', '空音開発',
    '音響', 'audio',
    'エンジニア', 'engineer',
    '公開', 'free online tool',
    'クラウド', 'cloud-based',

    // English - Species Counterpoint
    'species counterpoint writing', 'counterpoint exercise',
    'fifth species counterpoint', 'voice leading checker',
    'interval analysis tool', 'dissonance treatment',
    'cantus firmus checker', 'countermelody checker',
    'first species writing', 'second species writing',
    'third species writing', 'fourth species writing',
    'suspension checker', 'passing tone rules',
    'contrapuntal motion', 'contrary motion',
    'similar motion', 'oblique motion',
    'melodic line analysis', 'voice independence',
    'musical counterpoint', 'strict counterpoint',
    'free counterpoint',

    // Korean 키워드
    '대위법', 'counterpoint', '대위법 체커',
    '유별 대위법', 'species counterpoint',
    '제1류', '제2류', '제3류', '제4류',
    '병행', 'parallel',
    '정선율', 'cantus firmus',
    '대선율', 'countermelody',
    '성부', 'voice',
    '성부 교차', 'voice crossing',
    '음악 이론', 'music theory',
    '음악 대학', 'music university',
    '음악 입시',
    '작곡', 'composition',
    '음악 교육',

    // Portuguese 키ーワード
    'contraponto', 'contraponto por espécies',
    'primeira espécie', 'segunda espécie', 'terceira espécie', 'quarta espécie',
    'contraponto estrito', 'contraponto livre',
    'cantus firmus', 'contraponto',
    'quintas paralelas', 'oitavas paralelas',
    'conducao de vozes', 'movimento de vozes',
    'movimiento similar', 'movimiento contrario', 'movimiento oblicuo',
    'dissonancia', 'suspensão',
    'teoria musical', 'musica',
    'exercicio de contraponto',
    'nota de passagem', 'nota vizinha',

    // Spanish 키워드
    'contrapunto', 'contrapunto por especies',
    'primera especie', 'segunda especie', 'tercera especie', 'cuarta especie',
    'contrapunto estricto', 'contrapunto libre',
    'cantus firmus', 'contramelodía',
    'quintas paralelas', 'octavas paralelas',
    'conducción de voces', 'movimiento de voces',
    'movimiento similar', 'movimiento contrario', 'movimiento oblicuo',
    'disonancia', 'suspensión',
    'teoría musical', 'música',
    'ejercicio de contrapunto',
    'nota de paso', 'nota vecina',

    // Advanced / Professional keywords
    'voice part writing', 'polyphonic composition',
    'tonal counterpoint', 'diatonic harmony',
    'invertible counterpoint', 'double counterpoint',
    'figure', 'motif',
    'sonata form preparation', 'baroque counterpoint',
    'classical counterpoint',
  ],
  openGraph: {
    title: 'KUON COUNTERPOINT — Real-Time Species Counterpoint Checker | Parallel 5ths, Suspensions, Voice Leading Detection',
    description: 'The world\'s first browser-based species counterpoint checker. Based on Fux\'s method. Detects parallel 5ths/8ths, hidden 5ths/8ths, voice crossing, suspension violations, forbidden intervals in 1st-4th species counterpoint in real-time. SATB validation for music students. Free.',
    url: 'https://kuon-rnd.com/counterpoint-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON COUNTERPOINT — Real-Time Species Counterpoint Checker for Music Students',
    description: 'Detects parallel 5ths, hidden 8ths, suspension errors, voice crossing, and 15+ counterpoint rules instantly. Perfect for music university students and composition exam prep.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/counterpoint-lp',
  },
};

export default function CounterpointLPLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
