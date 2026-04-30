/**
 * KUON SHEET — パブリックドメイン リードシートライブラリ
 *
 * 全曲が完全にパブリックドメイン (作曲者死後 70 年以上経過 or
 * 1928 年以前出版・著作権切れ・トラディショナル)。
 *
 * 安全な範囲のみ収録:
 * - 作曲者が確定しており死後 70 年以上 (Joplin d.1917, Handy d.1958→1958+70=2028 で 2026 時点でも一部 OK)
 * - "Traditional" 表記のもの (権利者不在)
 * - 1928 年以前米国出版で確実に PD のもの
 *
 * 著作権が確実な範囲のみ。Real Book 系 (Charlie Parker, Bill Evans, Coltrane 等) は含まない。
 *
 * 2026-04-30 初版 18 曲
 */

export type LibraryCategory = 'ragtime' | 'blues' | 'trad-jazz' | 'folk' | 'spiritual' | 'classical' | 'christmas';

export interface LibrarySheet {
  id: string;
  title: string;
  composer: string;
  year?: string;
  category: LibraryCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  pdReason: string;       // パブリックドメインである理由を明示
  abc: string;
}

export const SHEET_LIBRARY: LibrarySheet[] = [
  // ────────────────────────────────────────────────────────────
  // RAGTIME (Scott Joplin, d. 1917 → PD since 1988+)
  // ────────────────────────────────────────────────────────────
  {
    id: 'joplin-entertainer',
    title: 'The Entertainer',
    composer: 'Scott Joplin',
    year: '1902',
    category: 'ragtime',
    difficulty: 'medium',
    pdReason: 'Composer died 1917 — public domain since 1988',
    abc: `X:1
T:The Entertainer
C:Scott Joplin
M:2/4
L:1/8
Q:1/4=80
K:C
"C"E2 c B | A G E2 | "G7"D F A2 | G2 z2 |
"C"E2 c B | A G E2 | "F"F E F G | "G7"A G E2 |
"C"c2 e g | f e d c | "G7"B A G F | E D C2 |]
`,
  },
  {
    id: 'joplin-maple-leaf',
    title: 'Maple Leaf Rag',
    composer: 'Scott Joplin',
    year: '1899',
    category: 'ragtime',
    difficulty: 'hard',
    pdReason: 'Composer died 1917 — public domain since 1988',
    abc: `X:1
T:Maple Leaf Rag
C:Scott Joplin
M:2/4
L:1/8
Q:1/4=72
K:Ab
"Ab"e c A E | C/E/A/c/ e2 | "Db"f d A F | D/F/A/d/ f2 |
"Eb7"e c A E | "Ab"E/A/c/A/ E2 | A/c/e/c/ A/c/e/c/ | "Ab"A2 z2 |]
`,
  },
  {
    id: 'joplin-solace',
    title: 'Solace',
    composer: 'Scott Joplin',
    year: '1909',
    category: 'ragtime',
    difficulty: 'medium',
    pdReason: 'Composer died 1917 — public domain since 1988',
    abc: `X:1
T:Solace
C:Scott Joplin
M:3/4
L:1/8
Q:1/4=88
K:F
"F"f3 e c A | "Bb"B3 c d c | "F"f3 e d c | "Gm7"d4 c B |
"C7"c3 d e f | "F"a3 g f e | "Bb"d3 c B A | "F"f4 z2 |]
`,
  },

  // ────────────────────────────────────────────────────────────
  // EARLY BLUES (W.C. Handy など)
  // ────────────────────────────────────────────────────────────
  {
    id: 'handy-st-louis-blues',
    title: 'St. Louis Blues',
    composer: 'W.C. Handy',
    year: '1914',
    category: 'blues',
    difficulty: 'easy',
    pdReason: 'Published 1914 — US public domain since 2010',
    abc: `X:1
T:St. Louis Blues
C:W.C. Handy
M:4/4
L:1/4
Q:1/4=88
K:G
"G"g2 g f | "G"e2 d2 | "G"g2 g f | "G7"e2 d2 |
w: I hate to see that ev'-ning sun go down
"C"c2 e2 | "C"d2 c2 | "G"B2 G2 | "G"G3 z |
w: I hate to see that ev'-ning sun go down
"D7"d3 e | "D7"d2 c2 | "G"B2 A2 | "G"G4 |]
w: 'Cause my ba-by, he done left this town
`,
  },
  {
    id: 'handy-memphis-blues',
    title: 'Memphis Blues',
    composer: 'W.C. Handy',
    year: '1912',
    category: 'blues',
    difficulty: 'easy',
    pdReason: 'Published 1912 — US public domain since 2008',
    abc: `X:1
T:Memphis Blues
C:W.C. Handy
M:4/4
L:1/4
Q:1/4=92
K:F
"F"f2 a g | "F"f2 c2 | "Bb"d3 c | "F"A2 c2 |
"F"f2 a g | "C7"f2 e d | "F"c2 A F | "F"F4 |]
`,
  },

  // ────────────────────────────────────────────────────────────
  // TRADITIONAL JAZZ / DIXIELAND
  // ────────────────────────────────────────────────────────────
  {
    id: 'trad-saints',
    title: 'When the Saints Go Marching In',
    composer: 'Traditional',
    category: 'trad-jazz',
    difficulty: 'easy',
    pdReason: 'Traditional spiritual — no copyright holder',
    abc: `X:1
T:When the Saints Go Marching In
C:Traditional
M:4/4
L:1/4
Q:1/4=120
K:F
"F"F A B c2 | z F A B | c2 F A | B c4 |
w: Oh when the saints go march-ing in oh when the saints go march-ing in
"F"F A B c2 | "F"c B A G | "C7"A G F2 | "F"F4 |]
w: Oh how I want to be in that num-ber
`,
  },
  {
    id: 'trad-riverside',
    title: 'Down by the Riverside',
    composer: 'Traditional Spiritual',
    category: 'trad-jazz',
    difficulty: 'easy',
    pdReason: 'Traditional African-American spiritual',
    abc: `X:1
T:Down by the Riverside
C:Traditional
M:4/4
L:1/4
Q:1/4=110
K:G
"G"d2 d B | "G"d2 d B | "C"e2 c A | "G"G4 |
w: Gon-na lay down my sword and shield down by the ri-ver-side
"G"d2 d B | "G"d2 d B | "D7"A2 B c | "G"d4 |]
w: Down by the ri-ver-side, ain't gon-na stu-dy war no more
`,
  },
  {
    id: 'trad-frankie-johnny',
    title: 'Frankie and Johnny',
    composer: 'Traditional',
    category: 'trad-jazz',
    difficulty: 'easy',
    pdReason: 'Traditional American folk-blues, 19th century origin',
    abc: `X:1
T:Frankie and Johnny
C:Traditional
M:4/4
L:1/4
Q:1/4=96
K:C
"C"c c c B | "C"A G E G | "F"A G F E | "C"E D C2 |
w: Fran-kie and John-ny were lov-ers, oh Lord-y how they could love
"C"E G c c | "C"d c B A | "G7"G F E D | "C"C4 |]
w: They swore to be true to each o-ther, true as the stars a-bove
`,
  },

  // ────────────────────────────────────────────────────────────
  // FOLK STANDARDS
  // ────────────────────────────────────────────────────────────
  {
    id: 'trad-amazing-grace',
    title: 'Amazing Grace',
    composer: 'Traditional / John Newton (lyrics 1779)',
    category: 'folk',
    difficulty: 'easy',
    pdReason: 'Melody traditional, lyrics by Newton 1779 — fully public domain',
    abc: `X:1
T:Amazing Grace
C:Traditional / John Newton
M:3/4
L:1/4
Q:1/4=72
K:G
"G"D | G2 B | "C"G2 B | "G"A3 | "Em"G2 D |
w: A-ma-zing grace how sweet the sound
"G"D | G2 B | "D"A2 G | "D"A3 |
w: that saved a wretch like me
`,
  },
  {
    id: 'trad-greensleeves',
    title: 'Greensleeves',
    composer: 'Traditional English (16c)',
    category: 'folk',
    difficulty: 'medium',
    pdReason: '16th century English traditional — public domain',
    abc: `X:1
T:Greensleeves
C:Traditional (16th c. English)
M:6/8
L:1/8
Q:3/8=72
K:Am
"Am"A | c2 d e3 | "G"f2 d B3 | "F"G2 A B2 c | "E7"A3 z2 E |
"Am"A2 c d3 | "G"f3 e d c | "F"d2 c B2 A | "E7"^G3 z3 |
"C"c3 e3 | "G"d3 g3 | "F"f2 e d3 | "E7"c3 z3 |]
`,
  },
  {
    id: 'trad-house-rising-sun',
    title: 'The House of the Rising Sun',
    composer: 'Traditional American folk',
    category: 'folk',
    difficulty: 'easy',
    pdReason: 'Traditional American folk ballad, 19th century origin',
    abc: `X:1
T:The House of the Rising Sun
C:Traditional
M:6/8
L:1/8
Q:3/8=66
K:Am
"Am"A2 c "C"e3 | "D"f2 d "F"a3 | "Am"A2 c "C"e3 | "E7"e2 ^G B3 |
"Am"A2 c "C"e3 | "D"f2 d "F"a3 | "Am"A2 c "E7"B2 G | "Am"A6 |]
`,
  },
  {
    id: 'trad-scarborough-fair',
    title: 'Scarborough Fair',
    composer: 'Traditional English',
    category: 'folk',
    difficulty: 'easy',
    pdReason: 'Traditional English ballad, medieval origin',
    abc: `X:1
T:Scarborough Fair
C:Traditional English
M:3/4
L:1/4
Q:1/4=88
K:Am
"Am"A | "Am"e2 e | "G"d c B | "Am"A2 ^F | "Am"E2 A |
w: Are you go-ing to Scar-bo-rough Fair?
"Am"A2 c | "G"B A G | "F"F E D | "Am"A3 |
w: Pars-ley, sage, rose-ma-ry and thyme.
`,
  },

  // ────────────────────────────────────────────────────────────
  // SPIRITUALS
  // ────────────────────────────────────────────────────────────
  {
    id: 'trad-swing-low',
    title: 'Swing Low, Sweet Chariot',
    composer: 'Traditional Spiritual',
    category: 'spiritual',
    difficulty: 'easy',
    pdReason: 'African-American spiritual, 19th century — public domain',
    abc: `X:1
T:Swing Low, Sweet Chariot
C:Traditional Spiritual
M:4/4
L:1/4
Q:1/4=72
K:G
"G"d2 d B | "G"d2 d B | "C"e2 d c | "G"d3 z |
w: Swing low, sweet cha-ri-ot, com-ing for to car-ry me home
"G"d2 d B | "G"d2 d B | "D7"A2 B c | "G"d3 z |]
w: Swing low, sweet cha-ri-ot, com-ing for to car-ry me home
`,
  },
  {
    id: 'trad-go-down-moses',
    title: 'Go Down Moses',
    composer: 'Traditional Spiritual',
    category: 'spiritual',
    difficulty: 'easy',
    pdReason: 'African-American spiritual, 19th century — public domain',
    abc: `X:1
T:Go Down Moses
C:Traditional Spiritual
M:4/4
L:1/4
Q:1/4=66
K:Dm
"Dm"d2 c A | "Dm"d2 c A | "Gm"c2 B A | "A7"^G2 A z |
w: When Is-rael was in E-gypt's land, let my peo-ple go
"Dm"d2 c A | "Dm"d2 c A | "Gm"c B A G | "Dm"D4 |]
w: Op-pressed so hard they could not stand, let my peo-ple go
`,
  },

  // ────────────────────────────────────────────────────────────
  // CLASSICAL MELODIES (リードシート形式に)
  // ────────────────────────────────────────────────────────────
  {
    id: 'beethoven-ode-to-joy',
    title: 'Ode to Joy',
    composer: 'Ludwig van Beethoven',
    year: '1824',
    category: 'classical',
    difficulty: 'easy',
    pdReason: 'Composer died 1827 — fully public domain',
    abc: `X:1
T:Ode to Joy
C:Beethoven
M:4/4
L:1/4
Q:1/4=104
K:C
"C"E E F G | "C"G F E D | "C"C C D E | "G"E D2 D |
"C"E E F G | "C"G F E D | "C"C C D E | "G"D C2 z |]
`,
  },
  {
    id: 'bach-minuet-g',
    title: 'Minuet in G',
    composer: 'J.S. Bach (attributed)',
    year: 'ca. 1725',
    category: 'classical',
    difficulty: 'medium',
    pdReason: 'Composer died 1750 — fully public domain',
    abc: `X:1
T:Minuet in G
C:Bach (attributed)
M:3/4
L:1/4
Q:1/4=120
K:G
"G"d | g f e | "C"d c B | "G"c B A | "D"B A G |
"G"d | g f e | "C"d c B | "G"c B A | "D"G2 |]
`,
  },
  {
    id: 'mozart-eine-kleine',
    title: 'Eine kleine Nachtmusik (Theme)',
    composer: 'W.A. Mozart',
    year: '1787',
    category: 'classical',
    difficulty: 'medium',
    pdReason: 'Composer died 1791 — fully public domain',
    abc: `X:1
T:Eine kleine Nachtmusik
C:Mozart
M:4/4
L:1/4
Q:1/4=132
K:G
"G"G2 D2 | G2 D2 | "G"G D G B | d4 |
"D7"d2 A2 | d2 A2 | "D7"d A d ^f | a4 |]
`,
  },

  // ────────────────────────────────────────────────────────────
  // CHRISTMAS (1923 以前)
  // ────────────────────────────────────────────────────────────
  {
    id: 'silent-night',
    title: 'Silent Night',
    composer: 'Franz Gruber',
    year: '1818',
    category: 'christmas',
    difficulty: 'easy',
    pdReason: 'Published 1818 — fully public domain',
    abc: `X:1
T:Silent Night
C:Franz Gruber
M:6/8
L:1/8
Q:3/8=60
K:C
"C"G2 A G2 E | G2 A G2 E | "G7"d3 d2 B | "C"c3 c3 |
w: Si-lent night, ho-ly night, all is calm, all is bright
"F"f3 f e c | "C"e3 g3 | "F"f2 d c2 A | "C"G3 c3 |]
w: Round yon vir-gin mo-ther and child, ho-ly in-fant so ten-der and mild
`,
  },
];

export const LIBRARY_CATEGORIES: { id: LibraryCategory; ja: string; en: string }[] = [
  { id: 'ragtime', ja: 'ラグタイム', en: 'Ragtime' },
  { id: 'blues', ja: 'ブルース', en: 'Blues' },
  { id: 'trad-jazz', ja: 'トラディショナル・ジャズ', en: 'Traditional Jazz' },
  { id: 'folk', ja: 'フォーク', en: 'Folk' },
  { id: 'spiritual', ja: 'スピリチュアル', en: 'Spiritual' },
  { id: 'classical', ja: 'クラシック', en: 'Classical' },
  { id: 'christmas', ja: 'クリスマス', en: 'Christmas' },
];

export function getLibrarySheetById(id: string): LibrarySheet | undefined {
  return SHEET_LIBRARY.find((s) => s.id === id);
}

export function getLibrarySheetsByCategory(cat: LibraryCategory): LibrarySheet[] {
  return SHEET_LIBRARY.filter((s) => s.category === cat);
}
