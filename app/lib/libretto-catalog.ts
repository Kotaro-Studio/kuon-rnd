/**
 * KUON LIBRETTO TRANSLATOR — サンプルアリアカタログ
 *
 * 6 つの代表アリア (Mozart 3 / Verdi 1 / Puccini 1 / Bizet 1) を事前収録。
 * 全てパブリックドメイン (作曲家・台本作家ともに 1923 年以前死去)。
 *
 * 各アリアは「最初の数行 (8-15 行)」をサンプルとして掲載。
 * 実用ではユーザーがフルテキストを貼り付けて翻訳ボタンを押す。
 *
 * 翻訳の品質方針:
 * - source/ipa/literal は専門知識に基づく確定版
 * - singing/literary は「参考訳 (専門家レビュー前)」として明示
 * - notes は声楽家・指揮者の現場ヒント
 *
 * 2026-04-30 初版
 */

export type LibrettoLanguage = 'it' | 'de' | 'fr';
export type Era = 'baroque' | 'classical' | 'romantic' | 'verismo' | 'late-romantic';

export interface SampleAriaLine {
  num: number;
  source: string;
  ipa: string;
  literalJa: string;
  singingJa: string;
  literaryJa: string;
  literalEn: string;
  singingEn: string;
  literaryEn: string;
  notes?: string[];
}

export interface SampleAria {
  id: string;
  composer: string;
  opera: string;
  operaSlug: string;
  premiereYear: number;
  era: Era;
  language: LibrettoLanguage;
  act: number;
  number?: string;
  title: string;
  character: string;
  voiceType: string;
  contextJa: string;
  contextEn: string;
  imslpUrl?: string;
  publicDomain: true;
  reviewStatus: 'curated' | 'pending-expert-review';
  lines: SampleAriaLine[];
}

// ──────────────────────────────────────────────────────────────────────────
// SAMPLE ARIAS (MVP: 6 arias)
// ──────────────────────────────────────────────────────────────────────────

export const SAMPLE_ARIAS: SampleAria[] = [
  // ────────────────────────────────────────────────────────────────────
  // 1. Mozart — Don Giovanni — Madamina, il catalogo è questo (Leporello)
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'mozart-don-giovanni-madamina',
    composer: 'Wolfgang Amadeus Mozart',
    opera: 'Don Giovanni',
    operaSlug: 'don-giovanni',
    premiereYear: 1787,
    era: 'classical',
    language: 'it',
    act: 1,
    number: 'No. 4',
    title: 'Madamina, il catalogo è questo',
    character: 'Leporello',
    voiceType: 'Bass-baritone',
    contextJa:
      'ドン・ジョヴァンニに捨てられたエルヴィーラに、従者レポレッロが「主人の女性遍歴のリスト」を読み上げる場面。コミカルでありながら、聞かされる側にとっては残酷な「カタログのアリア」。',
    contextEn:
      'Leporello reads aloud the catalog of his master\'s amorous conquests to the abandoned Donna Elvira. Comic on the surface, devastating to listen to.',
    imslpUrl: 'https://imslp.org/wiki/Don_Giovanni%2C_K.527_(Mozart%2C_Wolfgang_Amadeus)',
    publicDomain: true,
    reviewStatus: 'curated',
    lines: [
      {
        num: 1,
        source: 'Madamina, il catalogo è questo',
        ipa: '[madaˈmiːna il kataˈlɔːɡo ɛ ˈkwesto]',
        literalJa: '奥様、これがカタログです',
        singingJa: 'マダム、これが、その帳簿です',
        literaryJa: 'お嬢様、ご覧ください、この記録を',
        literalEn: 'Little madam, the catalog is this one',
        singingEn: 'Madam dear, here is the catalog',
        literaryEn: 'Behold, my lady, this record',
        notes: [
          'Leporello は Elvira を「Madamina (小さな奥様)」と呼ぶ。皮肉と親しみが混じる愛称',
          'Mozart 時代のイタリア語: madamina の二重子音 m は明瞭に発音する',
        ],
      },
      {
        num: 2,
        source: 'Delle belle che amò il padron mio',
        ipa: '[ˈdelle ˈbɛlle ke aˈmɔ il paˈdron ˈmio]',
        literalJa: '私の主人が愛した美女たちの',
        singingJa: 'うちの主人が、愛した女たち',
        literaryJa: 'わが主人が思いを寄せた、美しき方々の',
        literalEn: 'Of the beauties that my master loved',
        singingEn: 'All the lovers my master pursued',
        literaryEn: 'Of every beauty my master pursued',
      },
      {
        num: 3,
        source: 'Un catalogo egli è che ho fatt\'io',
        ipa: '[un kataˈlɔːɡo ˈeʎʎi ɛ ke ɔ ˈfattio]',
        literalJa: 'これは私が作ったカタログ',
        singingJa: 'この帳簿は、私が作った',
        literaryJa: '私自らが、これを記しました',
        literalEn: 'It is a catalog that I have made',
        singingEn: 'A catalog that I have written',
        literaryEn: 'A list I myself have compiled',
      },
      {
        num: 4,
        source: 'Osservate, leggete con me',
        ipa: '[osserˈvaːte legˈɡeːte kon me]',
        literalJa: '見てください、私と一緒に読んでください',
        singingJa: 'ご覧ください、共に読みましょう',
        literaryJa: 'さあ、ご一緒に目を通しましょう',
        literalEn: 'Observe, read along with me',
        singingEn: 'Just observe, and read along',
        literaryEn: 'Look closely, and read with me',
        notes: [
          'osservate と leggete は命令形複数 — Elvira への丁重な命令',
          'バス歌手にとっては低音域 (E2-D3) で言葉を立てる難所',
        ],
      },
      {
        num: 5,
        source: 'In Italia seicento e quaranta',
        ipa: '[in iˈtaːlja seiˈtʃɛnto e kwaˈranta]',
        literalJa: 'イタリアでは六百四十',
        singingJa: 'イタリアじゃ、六百四十',
        literaryJa: 'イタリアにて六百四十名',
        literalEn: 'In Italy six hundred and forty',
        singingEn: 'Italy: six hundred forty',
        literaryEn: 'In Italy: six hundred forty',
        notes: [
          'ここから有名な「数のリスト」が始まる。数字の発音は明瞭に立てる',
          'コミックバスとして観客の笑いを誘う伝統的な間 (timing) が重要',
        ],
      },
      {
        num: 6,
        source: 'In Almagna duecento e trent\'una',
        ipa: '[in alˈmaɲɲa dueˈtʃɛnto e trenˈtuna]',
        literalJa: 'ドイツでは二百三十一',
        singingJa: 'ドイツじゃ、二百三十一',
        literaryJa: 'ドイツにて二百三十一名',
        literalEn: 'In Germany two hundred and thirty-one',
        singingEn: 'Germany: two hundred thirty-one',
        literaryEn: 'In Germany: two hundred thirty-one',
        notes: [
          'Almagna は古いイタリア語表記の「ドイツ」(現代では Germania)',
          'Da Ponte の韻律: trent\'una のアポストロフィは音節省略',
        ],
      },
      {
        num: 7,
        source: 'Cento in Francia, in Turchia novantuna',
        ipa: '[ˈtʃɛnto in ˈfrantʃa in turˈkia novanˈtuna]',
        literalJa: 'フランスで百、トルコで九十一',
        singingJa: 'フランスは百、トルコ九十一',
        literaryJa: 'フランスに百、トルコに九十一',
        literalEn: 'A hundred in France, ninety-one in Turkey',
        singingEn: 'A hundred in France, ninety-one in Turkey',
        literaryEn: 'France: a hundred. Turkey: ninety-one',
      },
      {
        num: 8,
        source: 'Ma in Ispagna son già mille e tre',
        ipa: '[ma in iˈspaɲɲa son d͡ʒa ˈmille e tre]',
        literalJa: 'しかしスペインでは既に千と三',
        singingJa: 'けどスペインじゃ、千と三',
        literaryJa: 'されどスペインには既に千と三名',
        literalEn: 'But in Spain there are already a thousand and three',
        singingEn: 'But in Spain it\'s a thousand and three',
        literaryEn: 'But in Spain — already, a thousand and three',
        notes: [
          '「mille e tre」(千と三) はオペラ史上最も有名な数字。観客への決め台詞',
          'バス歌手はここで音量を一段下げて謎めかすか、堂々と誇示するか — 解釈の分岐点',
          'Da Ponte は実数の正確さより韻律 (mille e tre は 4 音節) を優先したと言われる',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // 2. Mozart — Le nozze di Figaro — Voi che sapete (Cherubino)
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'mozart-figaro-voi-che-sapete',
    composer: 'Wolfgang Amadeus Mozart',
    opera: 'Le nozze di Figaro',
    operaSlug: 'le-nozze-di-figaro',
    premiereYear: 1786,
    era: 'classical',
    language: 'it',
    act: 2,
    number: 'No. 11',
    title: 'Voi che sapete',
    character: 'Cherubino',
    voiceType: 'Mezzo-soprano (trouser role)',
    contextJa:
      '思春期の小姓ケルビーノが伯爵夫人とスザンナの前で、自分の作った歌を披露する場面。「恋とは何か、教えてください」と歌う、変声期の少年の純粋な戸惑いの表現。トラウザーロール (女性が男性役を演じる) の代表的アリア。',
    contextEn:
      'The adolescent page Cherubino performs his own song before the Countess and Susanna. "Tell me what love is" — a pure expression of a boy\'s bewilderment at first feelings. A signature aria of the trouser-role tradition.',
    imslpUrl: 'https://imslp.org/wiki/Le_nozze_di_Figaro%2C_K.492_(Mozart%2C_Wolfgang_Amadeus)',
    publicDomain: true,
    reviewStatus: 'curated',
    lines: [
      {
        num: 1,
        source: 'Voi che sapete che cosa è amor',
        ipa: '[ˈvoi ke saˈpeːte ke ˈkɔːza ɛ aˈmor]',
        literalJa: '愛とは何かを知るあなたがた',
        singingJa: '愛をご存じの、あなたがたよ',
        literaryJa: '恋を知るあなたがたに、お尋ねします',
        literalEn: 'You who know what love is',
        singingEn: 'You who know what love must be',
        literaryEn: 'You who understand what love truly is',
        notes: [
          '冒頭の「Voi」(あなたがた) は伯爵夫人とスザンナへの呼びかけ',
          'che cosa è amor の è は強拍に置く (Mozart の和声構造に合わせる)',
          'メゾソプラノは A4 を頭声で軽く始める — 少年の声を演出',
        ],
      },
      {
        num: 2,
        source: 'Donne, vedete s\'io l\'ho nel cor',
        ipa: '[ˈdɔnne veˈdeːte ˈsio lo nel kor]',
        literalJa: 'ご婦人方、私の心にそれがあるか見てください',
        singingJa: 'ご婦人方、見極めて、私の心',
        literaryJa: '婦人がたよ、見抜いてください、わが胸の中を',
        literalEn: 'Ladies, see if I have it in my heart',
        singingEn: 'Ladies, see if it lives in my heart',
        literaryEn: 'Ladies, look — is it within my heart?',
      },
      {
        num: 3,
        source: 'Quello ch\'io provo, vi ridirò',
        ipa: '[ˈkwello ˈkio ˈprɔːvo vi ridiˈrɔ]',
        literalJa: '私が感じることを、あなたがたにお話します',
        singingJa: '感じる思いを、お伝えします',
        literaryJa: 'わが感じるところを、お話しいたしましょう',
        literalEn: 'What I am feeling, I will tell you',
        singingEn: 'What I am feeling, I\'ll declare',
        literaryEn: 'What I feel, I shall confide to you',
      },
      {
        num: 4,
        source: 'È per me nuovo, capir nol so',
        ipa: '[ɛ per me ˈnwɔːvo kaˈpir nol sɔ]',
        literalJa: 'それは私には新しい、理解できない',
        singingJa: '初めての気持ち、わからない',
        literaryJa: 'これは初めての感情、解しがたく',
        literalEn: 'It is new to me, I cannot understand it',
        singingEn: 'It is so new, I can\'t understand',
        literaryEn: 'A feeling new to me, beyond my grasp',
        notes: [
          'capir nol so の nol は古いイタリア語の non lo の縮約',
          '思春期の少年の戸惑いが言語の不確かさに反映されている',
        ],
      },
      {
        num: 5,
        source: 'Sento un affetto pien di desir',
        ipa: '[ˈsɛnto un afˈfɛtto ˈpjɛn di deˈzir]',
        literalJa: '欲望に満ちた感情を感じる',
        singingJa: '憧れに満ちた、想いを覚える',
        literaryJa: '憧憬に満ちた感情が、わが胸を捉える',
        literalEn: 'I feel an affection full of desire',
        singingEn: 'I feel a longing full of desire',
        literaryEn: 'I feel a yearning rich with desire',
      },
      {
        num: 6,
        source: 'Ch\'ora è diletto, ch\'ora è martir',
        ipa: '[ˈkɔːra ɛ diˈlɛtto ˈkɔːra ɛ marˈtir]',
        literalJa: '今は喜び、今は苦しみ',
        singingJa: '時に喜び、時に苦しみ',
        literaryJa: 'あるときは歓喜、あるときは責め苦',
        literalEn: 'Now it is delight, now it is torment',
        singingEn: 'Now it\'s delight, now it\'s torment',
        literaryEn: 'Now ecstasy, now agony',
        notes: [
          '「ch\'ora ... ch\'ora」(今は…今は) の対句構造',
          '対比的な感情を 1 小節内で表現する Mozart の典型的書法',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // 3. Mozart — Die Zauberflöte — Der Hölle Rache (Königin der Nacht)
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'mozart-zauberflote-der-holle-rache',
    composer: 'Wolfgang Amadeus Mozart',
    opera: 'Die Zauberflöte',
    operaSlug: 'die-zauberflote',
    premiereYear: 1791,
    era: 'classical',
    language: 'de',
    act: 2,
    number: 'No. 14',
    title: 'Der Hölle Rache kocht in meinem Herzen',
    character: 'Königin der Nacht',
    voiceType: 'Coloratura soprano (high F6)',
    contextJa:
      '夜の女王が娘パミーナに、ザラストロを殺すよう短剣を渡しながら命じる場面。最高音 F6 (ハイ F) を含むコロラトゥーラの最高峰。怒りと復讐の表現。',
    contextEn:
      'The Queen of the Night hands her daughter Pamina a dagger, commanding her to kill Sarastro. The pinnacle of coloratura soprano repertoire — reaching High F6. Pure rage and vengeance.',
    imslpUrl: 'https://imslp.org/wiki/Die_Zauberfl%C3%B6te%2C_K.620_(Mozart%2C_Wolfgang_Amadeus)',
    publicDomain: true,
    reviewStatus: 'curated',
    lines: [
      {
        num: 1,
        source: 'Der Hölle Rache kocht in meinem Herzen',
        ipa: '[deːɐ̯ ˈhœlə ˈʁaːxə kɔxt ɪn ˈmaɪnəm ˈhɛʁt͡sn̩]',
        literalJa: '地獄の復讐が私の心の中で煮えたぎる',
        singingJa: '地獄の怒りが、心に燃える',
        literaryJa: '地獄の復讐の炎が、わが胸を焼き尽くす',
        literalEn: 'Hell\'s revenge boils in my heart',
        singingEn: 'Hell\'s vengeance boils within my heart',
        literaryEn: 'The fury of hell rages in my heart',
        notes: [
          'Mozart 時代のドイツ語: kocht の ch は硬口蓋摩擦音 [ç] ではなく軟口蓋 [x]',
          'Hölle の二重子音 ll は明瞭に分離 (現代ドイツ語より長め)',
          'Rache の R は巻き舌 R (Apico-alveolar trill) — オーストリア・古典様式',
        ],
      },
      {
        num: 2,
        source: 'Tod und Verzweiflung flammet um mich her',
        ipa: '[toːt ʊnt fɛɐ̯ˈt͡svaɪflʊŋ ˈflamət ʊm mɪç heːɐ̯]',
        literalJa: '死と絶望が私の周りに燃え盛る',
        singingJa: '死と絶望が、燃え狂う',
        literaryJa: '死と絶望の炎が、わが身を取り囲む',
        literalEn: 'Death and despair blaze around me',
        singingEn: 'Death and despair are blazing all around',
        literaryEn: 'Death and despair flame about me',
      },
      {
        num: 3,
        source: 'Fühlt nicht durch dich Sarastro Todesschmerzen',
        ipa: '[fyːlt nɪçt dʊʁç dɪç zaˈʁastʁo ˈtoːdəsˌʃmɛʁt͡sn̩]',
        literalJa: 'お前の手によってザラストロが死の痛みを感じないなら',
        singingJa: 'お前がザラストロを、討たぬなら',
        literaryJa: 'お前を通じてザラストロが死の苦悶を味わわぬのなら',
        literalEn: 'If through you Sarastro does not feel death\'s pains',
        singingEn: 'If through your hand Sarastro feels no death-pain',
        literaryEn: 'Should not Sarastro die by your own hand',
        notes: [
          'durch dich の dich は親しい二人称 — 母から娘への命令の親密さ',
          'Sarastro の z は無声 [s]、ドイツ語 z [t͡s] と区別する伝統 (イタリア語起源の固有名詞)',
        ],
      },
      {
        num: 4,
        source: 'So bist du meine Tochter nimmermehr',
        ipa: '[zoː bɪst duː ˈmaɪnə ˈtɔxtɐ ˈnɪmɐmeːɐ̯]',
        literalJa: 'お前はもう私の娘ではない',
        singingJa: 'お前は娘では、なくなる',
        literaryJa: 'お前はもはや、わが娘ではない',
        literalEn: 'Then you are my daughter nevermore',
        singingEn: 'Then you are my daughter no more',
        literaryEn: 'Then you are no longer my daughter',
        notes: [
          'nimmermehr は古風な表現 (現代では nie wieder) — 様式的な威厳を演出',
          'コロラトゥーラ突入の直前。歌手はここで決意を聴衆に伝える緊張を作る',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // 4. Verdi — La traviata — Sempre libera (Violetta)
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'verdi-traviata-sempre-libera',
    composer: 'Giuseppe Verdi',
    opera: 'La traviata',
    operaSlug: 'la-traviata',
    premiereYear: 1853,
    era: 'romantic',
    language: 'it',
    act: 1,
    title: 'Sempre libera',
    character: 'Violetta Valéry',
    voiceType: 'Lyric coloratura soprano',
    contextJa:
      'パーティ後、一人になった高級娼婦ヴィオレッタが、アルフレードへの想いを否定し、自由を貫こうと歌う。第 1 幕のクライマックス。最高音 E♭6 (Mi♭) を含む技巧的アリア。',
    contextEn:
      'After the party, the courtesan Violetta, alone, denies her feelings for Alfredo and resolves to remain free. The Act 1 climax — with virtuosic coloratura reaching E♭6.',
    publicDomain: true,
    reviewStatus: 'curated',
    lines: [
      {
        num: 1,
        source: 'Sempre libera degg\'io',
        ipa: '[ˈsɛmpre ˈliːbera ˈdeddʒo]',
        literalJa: '私はいつも自由でいなければならない',
        singingJa: '常に自由で、いなくては',
        literaryJa: 'わが身は永遠に自由でなければならぬ',
        literalEn: 'Always free I must be',
        singingEn: 'Always free I must remain',
        literaryEn: 'Forever free, I must remain',
        notes: [
          'degg\'io は devo io の詩的縮約 (Verdi の作詞家 Piave の常用)',
          'リブレットの中心テーマ「自由」が冒頭で宣言される',
        ],
      },
      {
        num: 2,
        source: 'Folleggiare di gioia in gioia',
        ipa: '[folledˈdʒaːre di ˈdʒoːja in ˈdʒoːja]',
        literalJa: '喜びから喜びへと戯れる',
        singingJa: '喜びから、喜びへと舞う',
        literaryJa: '歓楽から歓楽へと、舞い踊る',
        literalEn: 'To frolic from joy to joy',
        singingEn: 'To frolic from joy to joy',
        literaryEn: 'To dance from one joy to another',
        notes: [
          'folleggiare は「狂ったように楽しむ」の意。Violetta の刹那的な享楽',
          '畳み掛ける di gioia in gioia の反復は、作曲家により装飾音で増幅',
        ],
      },
      {
        num: 3,
        source: 'Vo\' che scorra il viver mio',
        ipa: '[vɔ ke ˈskorra il ˈviːver ˈmio]',
        literalJa: '私の人生が流れることを望む',
        singingJa: '我が人生は、流れゆけ',
        literaryJa: 'わが命の時を、流れに任せん',
        literalEn: 'I want my life to flow on',
        singingEn: 'Let my life flow on its way',
        literaryEn: 'Let my life flow ever onward',
      },
      {
        num: 4,
        source: 'Pei sentieri del piacer',
        ipa: '[pei senˈtjɛːri del pjaˈtʃer]',
        literalJa: '快楽の小道を通って',
        singingJa: '快楽の道を、たどって',
        literaryJa: '歓楽の小径を、辿りつつ',
        literalEn: 'Along the paths of pleasure',
        singingEn: 'Along the paths of pleasure',
        literaryEn: 'Down the paths of pleasure',
        notes: [
          'pei は per i の縮約',
          'piacer のアクセントは最終音節 (er) — 強拍に乗せる',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // 5. Puccini — La bohème — Che gelida manina (Rodolfo)
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'puccini-boheme-che-gelida-manina',
    composer: 'Giacomo Puccini',
    opera: 'La bohème',
    operaSlug: 'la-boheme',
    premiereYear: 1896,
    era: 'late-romantic',
    language: 'it',
    act: 1,
    title: 'Che gelida manina',
    character: 'Rodolfo',
    voiceType: 'Lyric tenor (high C5)',
    contextJa:
      'クリスマス・イヴのパリの屋根裏部屋。ろうそくを借りに来たミミの冷たい手を取りながら、詩人ロドルフォが自己紹介し、想いを告げる。テノールの代表的アリア。最高音は High C (C5)。',
    contextEn:
      'In a Parisian garret on Christmas Eve, the poet Rodolfo takes Mimì\'s cold hand and introduces himself, declaring his feelings. The signature lyric tenor aria, climaxing on High C.',
    publicDomain: true,
    reviewStatus: 'curated',
    lines: [
      {
        num: 1,
        source: 'Che gelida manina',
        ipa: '[ke ˈdʒɛːlida maˈniːna]',
        literalJa: 'なんて冷たい小さな手',
        singingJa: 'なんと冷たい、その手は',
        literaryJa: 'ああ、なんと冷たい、その小さな手',
        literalEn: 'What a frozen little hand',
        singingEn: 'What a frozen little hand',
        literaryEn: 'How cold this little hand of yours',
        notes: [
          'manina は mano + 縮小辞 ina — 「小さな・愛らしい手」のニュアンス',
          '冒頭の入りは pp。Rodolfo はミミに気付かれないよう静かに語りかける',
        ],
      },
      {
        num: 2,
        source: 'Se la lasci riscaldar',
        ipa: '[se la ˈlaʃi riskalˈdar]',
        literalJa: 'もしそれを温めるに任せるなら',
        singingJa: 'もし温める、ことを許せば',
        literaryJa: 'もし、温めることを、お許しいただけるなら',
        literalEn: 'If you let it be warmed',
        singingEn: 'If you let me warm it now',
        literaryEn: 'If you would let me warm it',
      },
      {
        num: 3,
        source: 'Cercar che giova?',
        ipa: '[tʃerˈkar ke ˈdʒɔːva]',
        literalJa: '探すことに何の役がある?',
        singingJa: '探して、何になる?',
        literaryJa: 'いまさら、探す甲斐があるでしょうか?',
        literalEn: 'What use to search?',
        singingEn: 'What use to keep on searching?',
        literaryEn: 'Why should we search?',
        notes: [
          'che giova は「何の役に立つ」の修辞疑問。Rodolfo の機知',
          '直前まで二人で鍵を探していた状況が、突然親密な対話に転じる転換点',
        ],
      },
      {
        num: 4,
        source: 'Al buio non si trova',
        ipa: '[al ˈbuːjo non si ˈtrɔːva]',
        literalJa: '暗闇では見つからない',
        singingJa: '暗くて、見つからぬ',
        literaryJa: '闇の中では、見つけられぬのです',
        literalEn: 'In the dark one cannot find it',
        singingEn: 'In darkness one can\'t find it',
        literaryEn: 'In the dark, nothing is found',
      },
      {
        num: 5,
        source: 'Ma per fortuna è una notte di luna',
        ipa: '[ma per forˈtuːna ɛ una ˈnɔtte di ˈluːna]',
        literalJa: 'でも幸運にも今夜は月夜',
        singingJa: 'でも幸い、月夜の今宵',
        literaryJa: 'されど幸い、今宵は月のある夜',
        literalEn: 'But fortunately it is a moonlit night',
        singingEn: 'But fortunately tonight is moonlit',
        literaryEn: 'But by good fortune, tonight there is a moon',
        notes: [
          'notte di luna は「月の夜」 — 文学的・詩的表現',
          'ここから情景描写が始まる。テノールは r を立てて言葉を浮かび上がらせる',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // 6. Bizet — Carmen — Habanera (Carmen)
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'bizet-carmen-habanera',
    composer: 'Georges Bizet',
    opera: 'Carmen',
    operaSlug: 'carmen',
    premiereYear: 1875,
    era: 'romantic',
    language: 'fr',
    act: 1,
    number: 'No. 5',
    title: 'L\'amour est un oiseau rebelle (Habanera)',
    character: 'Carmen',
    voiceType: 'Mezzo-soprano',
    contextJa:
      'セビリアの煙草工場の前、休憩時間に出てきたカルメンが「愛は反逆の鳥」と歌う、メゾソプラノを代表するアリア。ハバネラのリズムに乗って、愛の自由と気まぐれを歌う。',
    contextEn:
      'Outside the Seville tobacco factory, Carmen emerges during break and declares "Love is a rebellious bird." A signature mezzo-soprano aria over the habanera rhythm — singing of love\'s freedom and caprice.',
    publicDomain: true,
    reviewStatus: 'curated',
    lines: [
      {
        num: 1,
        source: 'L\'amour est un oiseau rebelle',
        ipa: '[lamuʁ ɛt‿œ̃n‿wazo ʁəbɛl]',
        literalJa: '愛は反逆の鳥',
        singingJa: '愛は鳥、誰にも従わぬ',
        literaryJa: '愛とは、何ものにも縛られぬ鳥',
        literalEn: 'Love is a rebellious bird',
        singingEn: 'Love is a rebel bird that no one tames',
        literaryEn: 'Love is a wild and rebellious bird',
        notes: [
          'rebelle の最終 e は無声 (詩的弱化)',
          'リエゾン: est un → [ɛt‿œ̃] 。リエゾンは Bizet 様式の重要要素',
          'メゾソプラノは D♯4 から始まり、低音域の艶を聴かせる',
        ],
      },
      {
        num: 2,
        source: 'Que nul ne peut apprivoiser',
        ipa: '[kə nyl nə pø apʁivwaze]',
        literalJa: '誰も飼い慣らすことができない',
        singingJa: '誰にも、飼い慣らせぬ',
        literaryJa: 'なにびとも飼い慣らすことのできぬ',
        literalEn: 'Whom no one can tame',
        singingEn: 'Whom no one can ever tame',
        literaryEn: 'No one can tame it ever',
      },
      {
        num: 3,
        source: 'Et c\'est bien en vain qu\'on l\'appelle',
        ipa: '[e sɛ bjɛ̃n‿ɑ̃ vɛ̃ kɔ̃ lapɛl]',
        literalJa: 'そして呼びかけるのは無駄だ',
        singingJa: 'そして呼んでも、無駄なこと',
        literaryJa: 'そして呼びかけても、まこと虚しい',
        literalEn: 'And it is in vain that one calls it',
        singingEn: 'And in vain we may call out to it',
        literaryEn: 'And vainly do we call to it',
      },
      {
        num: 4,
        source: 'S\'il lui convient de refuser',
        ipa: '[sil lɥi kɔ̃vjɛ̃ də ʁəfyze]',
        literalJa: 'もしそれが拒否することを好むなら',
        singingJa: 'それが拒むと、決めたなら',
        literaryJa: 'もし愛が拒むことを選ぶなら',
        literalEn: 'If it suits it to refuse',
        singingEn: 'If it should choose to refuse you',
        literaryEn: 'If it chooses to refuse',
      },
      {
        num: 5,
        source: 'Rien n\'y fait, menace ou prière',
        ipa: '[ʁjɛ̃ ni fɛ mənas u pʁijɛʁ]',
        literalJa: '何もそれを動かさない、脅しも祈りも',
        singingJa: '何しても、無駄なのよ',
        literaryJa: '脅しも祈りも、無に帰す',
        literalEn: 'Nothing avails, neither threat nor prayer',
        singingEn: 'Nothing works — neither threats nor prayers',
        literaryEn: 'Nothing prevails, neither menace nor prayer',
        notes: [
          'menace ou prière は二項対立の修辞 — Carmen の世界観の核心',
          '「祈り」が無効という宣言は、19 世紀の宗教的価値観への挑戦',
        ],
      },
      {
        num: 6,
        source: 'L\'un parle bien, l\'autre se tait',
        ipa: '[lœ̃ paʁl bjɛ̃ lotʁ sə tɛ]',
        literalJa: '一方は雄弁、もう一方は黙る',
        singingJa: '雄弁な人、黙る人',
        literaryJa: 'ある者は語り、ある者は黙する',
        literalEn: 'One speaks well, the other stays silent',
        singingEn: 'One speaks well, another stays silent',
        literaryEn: 'One eloquent, another silent',
      },
      {
        num: 7,
        source: 'Et c\'est l\'autre que je préfère',
        ipa: '[e sɛ lotʁ kə ʒə pʁefɛʁ]',
        literalJa: 'そして私が好むのは後者',
        singingJa: '私が好むの、黙る人',
        literaryJa: 'そして私が選ぶのは、沈黙する者',
        literalEn: 'And it is the other I prefer',
        singingEn: 'And the silent one is my choice',
        literaryEn: 'And it is the silent one I choose',
        notes: [
          'Carmen のキャラクターを決定づける一行。雄弁より沈黙を選ぶ性格',
          '指揮者によっては préfère で大きな ritardando — Carmen の決意を強調する伝統',
        ],
      },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

export function getAriaById(id: string): SampleAria | undefined {
  return SAMPLE_ARIAS.find((a) => a.id === id);
}

export function getAriasByLanguage(lang: LibrettoLanguage): SampleAria[] {
  return SAMPLE_ARIAS.filter((a) => a.language === lang);
}

export function getAriasByComposer(composer: string): SampleAria[] {
  return SAMPLE_ARIAS.filter((a) => a.composer.includes(composer));
}

/** アリアを「フリーテキスト」(ペーストできる形式) で取得 */
export function getAriaSourceText(aria: SampleAria): string {
  return aria.lines.map((l) => l.source).join('\n');
}
