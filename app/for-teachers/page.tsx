'use client';

/**
 * 教師向け説明 LP — 限定公開ページ（多言語対応）
 *
 * 隠し設計 (CLAUDE.md §44.9):
 *   - 本番サイト (header/footer/sitemap/index ページ) からリンクしない
 *   - パスワード "kuon" でゲート
 *   - /admin/coupons からのみ到達可能
 *
 * 多言語対応 (2026-04-28):
 *   - 6 言語完全対応 (ja/en/es/ko/pt/de)
 *   - useLang() で動的切替
 *   - 全ての表示テキストが lang に追従
 *
 * 内容構成 (IQ 90-105 の音楽教師が完璧に理解できることを目的):
 *   1. ヒーロー
 *   2. 空音開発について
 *   3. 教師が手に入れるもの
 *   4. 学生が受ける割引 (月払い・3 段階タイムライン)
 *   5. 学生が受ける割引 (年払い・2 段階タイムライン)
 *   6. 使い方 (3 ステップ)
 *   7. なぜこの制度を作ったか
 *   8. FAQ (8 問)
 *   9. 次のアクション
 */

import { useState, useEffect } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", Consolas, monospace';

const ACCENT = '#0284c7';
const GOLD = '#b45309';
const BG_CREAM = '#fafaf7';

const TEACHER_LP_PASSWORD = 'kuon';
const STORAGE_KEY = 'kuon_teacher_lp_unlocked';

// 多言語ヘルパー
type L6 = Partial<Record<Lang, string>> & { en: string };
const t = (m: L6, lang: Lang): string => m[lang] ?? m.en;

// パスワードゲート用文言
const GATE_LABELS = {
  title: { ja: '教師向け案内', en: 'For Teachers', es: 'Para Profesores', ko: '교사 안내', pt: 'Para Professores', de: 'Für Lehrkräfte' } as L6,
  subtitle: { ja: '限定公開ページです', en: 'Private invitation only', es: 'Página de acceso privado', ko: '비공개 페이지', pt: 'Página de acesso privado', de: 'Geschlossener Zugang' } as L6,
  password: { ja: 'パスワード', en: 'Password', es: 'Contraseña', ko: '비밀번호', pt: 'Senha', de: 'Passwort' } as L6,
  open: { ja: '開く', en: 'Open', es: 'Abrir', ko: '열기', pt: 'Abrir', de: 'Öffnen' } as L6,
  invalid: { ja: 'パスワードが違います', en: 'Incorrect password', es: 'Contraseña incorrecta', ko: '비밀번호가 일치하지 않습니다', pt: 'Senha incorreta', de: 'Falsches Passwort' } as L6,
  note: {
    ja: 'このページは関係者限定です。\nURL とパスワードを共有していただいた方のみアクセスください。',
    en: 'This page is for invited recipients only.\nPlease access only with the URL and password shared with you.',
    es: 'Esta página es solo para destinatarios invitados.\nAcceda solo con la URL y contraseña compartidas.',
    ko: '이 페이지는 초청 받으신 분만 접근하실 수 있습니다.\n공유받은 URL과 비밀번호로만 접속해 주세요.',
    pt: 'Esta página é apenas para destinatários convidados.\nAcesse somente com a URL e senha compartilhadas.',
    de: 'Diese Seite ist nur für eingeladene Empfänger bestimmt.\nBitte nur mit geteilter URL und geteiltem Passwort zugreifen.',
  } as L6,
};

// ヒーロー
const HERO = {
  pretitle: { ja: 'KUON R&D · TEACHER PARTNERSHIP', en: 'KUON R&D · TEACHER PARTNERSHIP', es: 'KUON R&D · TEACHER PARTNERSHIP', ko: 'KUON R&D · TEACHER PARTNERSHIP', pt: 'KUON R&D · TEACHER PARTNERSHIP', de: 'KUON R&D · TEACHER PARTNERSHIP' } as L6,
  title: {
    ja: 'あなたの学生に、\n最高の学割を。',
    en: 'The best student offer\nfor your students.',
    es: 'La mejor oferta\npara sus estudiantes.',
    ko: '당신의 학생에게,\n최고의 학생 할인을.',
    pt: 'A melhor oferta\npara os seus alunos.',
    de: 'Das beste Studentenangebot\nfür Ihre Studierenden.',
  } as L6,
  body: {
    ja: '音楽教育に携わってくださる先生方へ。\n空音開発（Kuon R&D）から、\n先生と先生の学生さんに専用のご案内です。',
    en: 'A message to music educators.\nFrom Kuon R&D, a dedicated invitation\nfor you and your students.',
    es: 'Un mensaje a los educadores de música.\nDe parte de Kuon R&D, una invitación\nexclusiva para usted y sus estudiantes.',
    ko: '음악 교육에 참여하시는 선생님께.\n공음개발(Kuon R&D)에서 선생님과\n선생님의 학생들을 위한 전용 안내입니다.',
    pt: 'Uma mensagem para educadores musicais.\nDa Kuon R&D, um convite dedicado\npara você e seus alunos.',
    de: 'Eine Nachricht an Musikpädagoginnen und -pädagogen.\nVon Kuon R&D — ein exklusives Angebot\nfür Sie und Ihre Studierenden.',
  } as L6,
  hint: {
    ja: 'このページは限定公開です。読み終わったらブラウザを閉じてください。',
    en: 'This page is private. Please close your browser after reading.',
    es: 'Esta página es privada. Por favor, cierre el navegador después de leer.',
    ko: '이 페이지는 비공개입니다. 읽으신 후 브라우저를 닫아 주세요.',
    pt: 'Esta página é privada. Feche o navegador após a leitura.',
    de: 'Diese Seite ist vertraulich. Bitte schließen Sie den Browser nach dem Lesen.',
  } as L6,
};

// セクション 01: 空音開発について
const ABOUT = {
  heading: { ja: '空音開発について、簡単に', en: 'About Kuon R&D, briefly', es: 'Sobre Kuon R&D, en breve', ko: '공음개발에 대해 간단히', pt: 'Sobre a Kuon R&D, em resumo', de: 'Über Kuon R&D — kurz' } as L6,
  p1: {
    ja: '空音開発は、音楽家・録音エンジニア・音大生のためのオンラインツール 33 種類を提供しています。ピッチ分析、音源分離、譜起こし、聴音トレーニング、ノーマライズ、リサンプル、DDP チェッカー、DSD コンバーターなど、プロの現場で使われるツールが、すべてブラウザだけで動きます。',
    en: 'Kuon R&D provides 33 online tools designed for musicians, recording engineers, and music students. Pitch analysis, AI source separation, transcription, ear training, normalization, resampling, DDP checking, DSD conversion, and more — professional-grade tools that all run in the browser.',
    es: 'Kuon R&D ofrece 33 herramientas en línea diseñadas para músicos, ingenieros de grabación y estudiantes de música. Análisis tonal, separación con IA, transcripción, entrenamiento auditivo, normalización, remuestreo, comprobación DDP, conversión DSD y más — herramientas profesionales que funcionan en el navegador.',
    ko: '공음개발은 음악가·녹음 엔지니어·음대생을 위한 온라인 도구 33종을 제공합니다. 피치 분석, AI 음원 분리, 채보, 청음 훈련, 노멀라이즈, 리샘플, DDP 체커, DSD 컨버터 등, 전문 현장에서 사용되는 도구가 모두 브라우저만으로 작동합니다.',
    pt: 'A Kuon R&D oferece 33 ferramentas online para músicos, engenheiros de gravação e estudantes de música. Análise tonal, separação por IA, transcrição, treinamento auditivo, normalização, reamostragem, verificação DDP, conversão DSD, e mais — ferramentas profissionais que funcionam direto no navegador.',
    de: 'Kuon R&D bietet 33 Online-Werkzeuge für Musikerinnen, Tontechniker und Musikstudierende. Tonhöhenanalyse, KI-Stem-Trennung, Notation, Gehörbildung, Normalisierung, Resampling, DDP-Prüfung, DSD-Konvertierung und mehr — professionelle Werkzeuge direkt im Browser.',
  } as L6,
  p2: {
    ja: '代表は音大出身のエンジニア・朝比奈幸太郎。「音大時代に、自分が必要だったツールを作る」という想いから始まった研究開発プロジェクトです。',
    en: 'Founded by Kotaro Asahina, a conservatory-trained engineer. Kuon R&D started from a single thought: "Build the tools I wished I had as a music student."',
    es: 'Fundada por Kotaro Asahina, ingeniero formado en conservatorio. Kuon R&D nació de un solo pensamiento: "Crear las herramientas que necesitaba cuando era estudiante de música."',
    ko: '대표는 음대 출신 엔지니어 아사히나 코타로. "음대 시절에 필요했던 도구를 직접 만들자"라는 생각에서 시작된 연구 개발 프로젝트입니다.',
    pt: 'Fundada por Kotaro Asahina, engenheiro formado em conservatório. A Kuon R&D nasceu de um único pensamento: "Construir as ferramentas que eu queria ter quando era estudante de música."',
    de: 'Gegründet von Kotaro Asahina, einem konservatorisch ausgebildeten Ingenieur. Kuon R&D entstand aus dem Gedanken: „Baue die Werkzeuge, die ich als Musikstudent gebraucht hätte."',
  } as L6,
  p3: {
    ja: '詳しくは ',
    en: 'For more, please visit ',
    es: 'Para más información, visite ',
    ko: '자세한 내용은 ',
    pt: 'Para mais detalhes, visite ',
    de: 'Mehr Informationen unter ',
  } as L6,
  p3_suffix: {
    ja: ' をご覧ください。',
    en: '.',
    es: '.',
    ko: ' 를 참고해 주세요.',
    pt: '.',
    de: '.',
  } as L6,
};

// セクション 02: 先生が手に入れるもの
const BENEFITS = {
  heading: { ja: '先生が手に入れるもの', en: 'What you receive', es: 'Lo que usted recibe', ko: '선생님께서 받으시는 것', pt: 'O que você recebe', de: 'Was Sie erhalten' } as L6,
  intro: {
    ja: '教育に関わる先生方には、以下の二つをご提供します。',
    en: 'For educators, we provide the following two benefits.',
    es: 'A los educadores, ofrecemos los siguientes dos beneficios.',
    ko: '교육에 종사하시는 선생님께 아래 두 가지를 제공합니다.',
    pt: 'Para educadores, oferecemos os dois benefícios a seguir.',
    de: 'Für Lehrkräfte bieten wir die folgenden zwei Vorteile.',
  } as L6,
  card1Title: { ja: 'Symphony プラン無償提供', en: 'Symphony Plan, free for life', es: 'Plan Symphony gratuito de por vida', ko: 'Symphony 플랜 평생 무료', pt: 'Plano Symphony grátis para sempre', de: 'Symphony-Plan dauerhaft kostenlos' } as L6,
  card1Price: { ja: '¥2,480 / 月相当', en: '¥2,480/mo value', es: 'Valor de ¥2,480/mes', ko: '월 ¥2,480 상당', pt: 'Valor de ¥2,480/mês', de: 'Wert: ¥2.480/Monat' } as L6,
  card1Desc: {
    ja: 'Kuon の最上位プランを無料でお使いいただけます。33 種類のツールすべてが無制限。本来は月額 ¥2,480 のプロ向けプラン。',
    en: 'Use our top-tier plan for free, forever. All 33 tools without limits. Normally ¥2,480/month for professionals.',
    es: 'Use nuestro plan superior gratis, para siempre. Las 33 herramientas sin límites. Normalmente ¥2,480/mes para profesionales.',
    ko: 'Kuon 최상위 플랜을 무료로 이용하실 수 있습니다. 33종 도구 모두 무제한. 일반적으로 월 ¥2,480의 프로 플랜.',
    pt: 'Use nosso plano top gratuitamente, para sempre. Todas as 33 ferramentas sem limite. Normalmente ¥2.480/mês para profissionais.',
    de: 'Nutzen Sie unseren Top-Tarif dauerhaft kostenlos. Alle 33 Werkzeuge unbegrenzt. Normalerweise ¥2.480/Monat für Profis.',
  } as L6,
  card2Title: { ja: '先生専用 学生割引コード', en: 'Personal student-discount code', es: 'Código de descuento personal para estudiantes', ko: '선생님 전용 학생 할인 코드', pt: 'Código de desconto pessoal para alunos', de: 'Persönlicher Studenten-Rabattcode' } as L6,
  card2Price: { ja: '例: ASAHINA-30', en: 'e.g., ASAHINA-30', es: 'ej.: ASAHINA-30', ko: '예: ASAHINA-30', pt: 'ex.: ASAHINA-30', de: 'z.B.: ASAHINA-30' } as L6,
  card2Desc: {
    ja: '先生のお名前のついた割引コードを発行します。学生さんに渡せば、Kuon が初月 50% OFF + 12 ヶ月 30% OFF で使えるようになります。',
    en: 'A discount code bearing your name. Share it with your students — they get 50% OFF the first month and 30% OFF for 12 months.',
    es: 'Un código de descuento con su nombre. Compártalo con sus estudiantes — obtienen 50% OFF el primer mes y 30% OFF durante 12 meses.',
    ko: '선생님 이름이 붙은 할인 코드를 발급해 드립니다. 학생들에게 전달하시면 첫 달 50% 할인 + 12개월간 30% 할인으로 Kuon을 이용할 수 있습니다.',
    pt: 'Um código de desconto com o seu nome. Compartilhe com seus alunos — eles ganham 50% OFF no primeiro mês e 30% OFF por 12 meses.',
    de: 'Ein Rabattcode mit Ihrem Namen. Teilen Sie ihn mit Ihren Studierenden — sie erhalten 50 % im ersten Monat und 30 % für 12 Monate.',
  } as L6,
  note: {
    ja: '✨ 大切なこと：これは「お金を稼ぐ仕組み」ではありません。先生方への感謝と、先生の学生さんが安価で本格的なツールを使えるようにするための仕組みです。紹介報酬や成果報酬はありませんが、その分、先生のお名前を冠したコードを通じて、学生さんから「先生のおかげで使えている」という感謝が直接届きます。',
    en: '✨ Important: This is not a money-making scheme. It is a way to thank educators and ensure your students can access professional-grade tools at a reasonable price. There is no referral commission. Instead, your students will personally feel "thanks to my teacher" through the code bearing your name.',
    es: '✨ Importante: Este no es un esquema para ganar dinero. Es una manera de agradecer a los educadores y permitir que sus estudiantes accedan a herramientas profesionales a un precio razonable. No hay comisión de referido. En cambio, sus estudiantes sentirán personalmente "gracias a mi profesor" a través del código con su nombre.',
    ko: '✨ 중요한 점: 이것은 "돈을 버는 구조"가 아닙니다. 교육자에 대한 감사와, 선생님의 학생들이 합리적인 가격으로 본격적인 도구를 사용할 수 있도록 하기 위한 구조입니다. 소개 보수는 없지만, 그 대신 선생님 이름의 코드를 통해 학생들이 "선생님 덕분에 사용할 수 있다"는 감사를 직접 느끼게 됩니다.',
    pt: '✨ Importante: Isto não é um esquema para ganhar dinheiro. É uma forma de agradecer aos educadores e garantir que seus alunos tenham acesso a ferramentas profissionais a um preço justo. Não há comissão de indicação. Em vez disso, seus alunos sentirão "graças ao meu professor" diretamente através do código com seu nome.',
    de: '✨ Wichtig: Dies ist kein Verdienstmodell. Es ist eine Form des Dankes an Lehrkräfte und sorgt dafür, dass Ihre Studierenden professionelle Werkzeuge zu fairen Preisen nutzen können. Es gibt keine Provisionen. Stattdessen erleben Ihre Studierenden direkt — „dank meiner Lehrkraft" — über den Code, der Ihren Namen trägt.',
  } as L6,
};

// セクション 03: 月払い割引
const MONTHLY = {
  heading: { ja: '学生さんが受ける割引（月払いの場合）', en: 'Student discount (monthly billing)', es: 'Descuento para estudiantes (pago mensual)', ko: '학생이 받는 할인 (월 결제 시)', pt: 'Desconto do aluno (pagamento mensal)', de: 'Studentenrabatt (monatliche Zahlung)' } as L6,
  intro: {
    ja: '学生さんが月払いを選んだ場合、以下の流れで割引が自動的に適用されます。',
    en: 'When your student chooses monthly billing, discounts are applied automatically as follows.',
    es: 'Cuando su estudiante elige el pago mensual, los descuentos se aplican automáticamente como sigue.',
    ko: '학생이 월 결제를 선택하면, 다음 흐름으로 할인이 자동 적용됩니다.',
    pt: 'Quando o aluno escolhe pagamento mensal, os descontos são aplicados automaticamente como abaixo.',
    de: 'Bei monatlicher Zahlung Ihres Studierenden werden Rabatte automatisch wie folgt angewendet.',
  } as L6,
  phase1Label: { ja: '最初の 1 ヶ月', en: 'First month', es: 'Primer mes', ko: '첫 1개월', pt: 'Primeiro mês', de: 'Erster Monat' } as L6,
  phase1Big: { ja: '50% OFF', en: '50% OFF', es: '50% OFF', ko: '50% 할인', pt: '50% OFF', de: '50% Rabatt' } as L6,
  phase1Detail: {
    ja: 'まずは半額でお試し。Concerto なら ¥740（通常 ¥1,480）。',
    en: 'A half-price trial. Concerto: ¥740 (regular ¥1,480).',
    es: 'Una prueba a mitad de precio. Concerto: ¥740 (normal ¥1,480).',
    ko: '먼저 반값으로 시도. Concerto는 ¥740 (정가 ¥1,480).',
    pt: 'Teste pela metade do preço. Concerto: ¥740 (normal ¥1.480).',
    de: 'Halbpreis-Test. Concerto: ¥740 (regulär ¥1.480).',
  } as L6,
  phase2Label: { ja: 'その後 12 ヶ月', en: 'Next 12 months', es: 'Siguientes 12 meses', ko: '이후 12개월', pt: 'Próximos 12 meses', de: 'Folgende 12 Monate' } as L6,
  phase2Big: { ja: '30% OFF', en: '30% OFF', es: '30% OFF', ko: '30% 할인', pt: '30% OFF', de: '30% Rabatt' } as L6,
  phase2Detail: {
    ja: '学生割引が 12 ヶ月続きます。Concerto なら ¥1,036/月（通常 ¥1,480）。',
    en: 'Student discount continues for 12 months. Concerto: ¥1,036/mo (regular ¥1,480).',
    es: 'El descuento de estudiante continúa 12 meses. Concerto: ¥1,036/mes (normal ¥1,480).',
    ko: '학생 할인이 12개월 동안 계속됩니다. Concerto는 ¥1,036/월 (정가 ¥1,480).',
    pt: 'Desconto continua por 12 meses. Concerto: ¥1.036/mês (normal ¥1.480).',
    de: 'Der Rabatt läuft 12 Monate. Concerto: ¥1.036/Mo (regulär ¥1.480).',
  } as L6,
  phase3Label: { ja: '13 ヶ月目以降', en: 'Month 13 onward', es: 'A partir del mes 13', ko: '13개월차 이후', pt: 'Do 13.º mês em diante', de: 'Ab 13. Monat' } as L6,
  phase3Big: { ja: '通常価格に戻る', en: 'Regular price', es: 'Precio regular', ko: '정가로 복귀', pt: 'Preço normal', de: 'Regulärer Preis' } as L6,
  phase3Detail: {
    ja: '学割期間終了後は自動的に通常価格になります。Concerto ¥1,480/月。',
    en: 'After the discount period, the price returns automatically. Concerto: ¥1,480/mo.',
    es: 'Después del descuento, el precio vuelve automáticamente. Concerto: ¥1,480/mes.',
    ko: '학생 할인 기간 종료 후 정가로 자동 복귀됩니다. Concerto는 ¥1,480/월.',
    pt: 'Após o período de desconto, o preço retorna automaticamente. Concerto: ¥1.480/mês.',
    de: 'Nach Ablauf des Rabatts geht der Preis automatisch zurück. Concerto: ¥1.480/Mo.',
  } as L6,
  tableHeading: { ja: '12 ヶ月分の支払い試算（月払いの場合）', en: '12-month payment estimate (monthly)', es: 'Pago estimado a 12 meses (mensual)', ko: '12개월 결제 시뮬레이션 (월 결제)', pt: 'Estimativa de 12 meses (mensal)', de: '12-Monats-Übersicht (monatlich)' } as L6,
  preludeLabel: { ja: 'Prelude（一番お手頃）', en: 'Prelude (most affordable)', es: 'Prelude (más asequible)', ko: 'Prelude (가장 저렴)', pt: 'Prelude (mais acessível)', de: 'Prelude (günstigste Option)' } as L6,
  concertoLabel: { ja: 'Concerto（学生に人気）', en: 'Concerto (student favorite)', es: 'Concerto (favorito de estudiantes)', ko: 'Concerto (학생들에게 인기)', pt: 'Concerto (preferido dos alunos)', de: 'Concerto (Studenten-Favorit)' } as L6,
};

// セクション 04: 年払い割引
const ANNUAL = {
  heading: { ja: '学生さんが受ける割引（年払いの場合）', en: 'Student discount (annual billing)', es: 'Descuento para estudiantes (pago anual)', ko: '학생이 받는 할인 (연 결제 시)', pt: 'Desconto do aluno (pagamento anual)', de: 'Studentenrabatt (jährliche Zahlung)' } as L6,
  intro: {
    ja: '学生さんが年払いを選んだ場合、最初の 1 年がぐっとお得になります。\n※ 実は年払いが最もお得です。',
    en: "If your student chooses annual billing, the first year is dramatically cheaper.\n* Annual is actually the best value.",
    es: 'Si su estudiante elige el pago anual, el primer año es notablemente más barato.\n※ En realidad, el pago anual es la mejor opción.',
    ko: '학생이 연 결제를 선택하시면, 첫 1년이 가장 저렴해집니다.\n※ 사실 연 결제가 가장 이득입니다.',
    pt: 'Se o aluno escolher pagamento anual, o primeiro ano é muito mais barato.\n※ Anual é, na verdade, o melhor custo-benefício.',
    de: 'Wählt Ihr Studierender die jährliche Zahlung, ist das erste Jahr deutlich günstiger.\n※ Jährliche Zahlung ist tatsächlich am vorteilhaftesten.',
  } as L6,
  phase1Label: { ja: '最初の 1 年', en: 'First year', es: 'Primer año', ko: '첫 1년', pt: 'Primeiro ano', de: 'Erstes Jahr' } as L6,
  phase1Big: { ja: '30% OFF', en: '30% OFF', es: '30% OFF', ko: '30% 할인', pt: '30% OFF', de: '30% Rabatt' } as L6,
  phase1Detail: {
    ja: '年額にも 30% OFF が乗ります。Concerto なら ¥10,360（通常 ¥14,800）で 1 年分一括。',
    en: '30% OFF on the annual price too. Concerto: ¥10,360 for one year (regular ¥14,800).',
    es: '30% OFF también en el precio anual. Concerto: ¥10,360 por un año (normal ¥14,800).',
    ko: '연간 가격에도 30% 할인이 적용됩니다. Concerto는 ¥10,360 (정가 ¥14,800)로 1년치 일괄.',
    pt: '30% OFF também no preço anual. Concerto: ¥10.360 para um ano (normal ¥14.800).',
    de: '30% Rabatt auch auf den Jahrespreis. Concerto: ¥10.360 für ein Jahr (regulär ¥14.800).',
  } as L6,
  phase2Label: { ja: '2 年目以降', en: 'From year 2', es: 'A partir del año 2', ko: '2년차 이후', pt: 'A partir do 2.º ano', de: 'Ab 2. Jahr' } as L6,
  phase2Big: { ja: '通常価格に戻る', en: 'Regular price', es: 'Precio regular', ko: '정가로 복귀', pt: 'Preço normal', de: 'Regulärer Preis' } as L6,
  phase2Detail: {
    ja: 'Concerto ¥14,800/年。1 年使った後の自動更新です。',
    en: 'Concerto ¥14,800/year. Auto-renewed after the first year.',
    es: 'Concerto ¥14,800/año. Renovación automática tras el primer año.',
    ko: 'Concerto ¥14,800/년. 1년 후 자동 갱신.',
    pt: 'Concerto ¥14.800/ano. Renovação automática após o primeiro ano.',
    de: 'Concerto ¥14.800/Jahr. Automatische Verlängerung nach dem ersten Jahr.',
  } as L6,
  tableHeading: { ja: '1 年分の支払い試算（年払いの場合）', en: 'Annual payment estimate', es: 'Pago anual estimado', ko: '연 결제 시뮬레이션', pt: 'Estimativa anual', de: 'Jährliche Zahlungsübersicht' } as L6,
  preludeLabel: { ja: 'Prelude 年額', en: 'Prelude annual', es: 'Prelude anual', ko: 'Prelude 연간', pt: 'Prelude anual', de: 'Prelude (jährlich)' } as L6,
  concertoLabel: { ja: 'Concerto 年額', en: 'Concerto annual', es: 'Concerto anual', ko: 'Concerto 연간', pt: 'Concerto anual', de: 'Concerto (jährlich)' } as L6,
  bundlePay1: { ja: '¥5,460（1 年一括）', en: '¥5,460 (year, one-off)', es: '¥5,460 (año, único pago)', ko: '¥5,460 (1년 일괄)', pt: '¥5.460 (ano, único)', de: '¥5.460 (Jahr, einmalig)' } as L6,
  bundlePay2: { ja: '¥10,360（1 年一括）', en: '¥10,360 (year, one-off)', es: '¥10,360 (año, único pago)', ko: '¥10,360 (1년 일괄)', pt: '¥10.360 (ano, único)', de: '¥10.360 (Jahr, einmalig)' } as L6,
  whyAnnual: {
    ja: '💡 なぜ年払いが最もお得？\n年額プランには元々「2 ヶ月分無料」のサービスが含まれています。そこに学生割引 30% OFF が重なるので、合計で約 42% OFF と同じ計算になります。学生さんに年払いをお勧めしてあげると、より長く Kuon を使ってもらえます。',
    en: '💡 Why is annual the best value?\nAnnual plans already include "2 free months" baked in. With the student 30% OFF on top, the effective discount becomes about 42% OFF. Recommending annual billing helps your students stay with Kuon longer.',
    es: '💡 ¿Por qué el pago anual es el mejor?\nLos planes anuales ya incluyen "2 meses gratis" integrados. Con el descuento de estudiante del 30% OFF encima, el descuento efectivo es alrededor de 42% OFF. Recomendar el pago anual ayuda a sus estudiantes a permanecer con Kuon más tiempo.',
    ko: '💡 왜 연 결제가 가장 이득인가?\n연간 플랜에는 이미 "2개월 무료"가 포함되어 있습니다. 거기에 학생 할인 30%가 더해져 실질적으로 약 42% 할인과 같은 계산이 됩니다. 학생들에게 연 결제를 추천하시면 Kuon을 더 오래 사용해 주시게 됩니다.',
    pt: '💡 Por que o anual é o melhor?\nOs planos anuais já incluem "2 meses grátis" embutidos. Com o desconto de estudante de 30% por cima, o desconto efetivo torna-se cerca de 42% OFF. Recomendar pagamento anual ajuda seus alunos a permanecerem com a Kuon por mais tempo.',
    de: '💡 Warum ist die jährliche Zahlung am vorteilhaftesten?\nJahresabos enthalten bereits „2 Monate gratis". Mit dem Studenten-Rabatt von 30 % obendrauf ergibt sich ein effektiver Rabatt von etwa 42 %. Empfehlen Sie Ihren Studierenden die jährliche Zahlung, um sie länger bei Kuon zu halten.',
  } as L6,
};

// セクション 05: 使い方
const USAGE = {
  heading: { ja: 'コードの使い方（とてもシンプルです）', en: 'How to use the code (very simple)', es: 'Cómo usar el código (muy simple)', ko: '코드 사용 방법 (매우 간단)', pt: 'Como usar o código (muito simples)', de: 'Wie der Code verwendet wird (sehr einfach)' } as L6,
  intro: {
    ja: '先生が学生さんに渡すのは、URL（リンク）一つだけ。3 ステップで完了します。',
    en: 'You only share one URL with your student. Three simple steps.',
    es: 'Solo comparte una URL con su estudiante. Tres pasos simples.',
    ko: '선생님께서 학생에게 전달하시는 것은 URL 하나뿐. 3단계로 완료됩니다.',
    pt: 'Você compartilha apenas uma URL com o aluno. Três passos simples.',
    de: 'Sie teilen nur eine URL mit Ihrem Studierenden. Drei einfache Schritte.',
  } as L6,
  step1Title: { ja: '私から URL を受け取る', en: 'Receive the URL from us', es: 'Recibe la URL de nosotros', ko: '저희에게서 URL을 받습니다', pt: 'Receba a URL de nós', de: 'URL von uns erhalten' } as L6,
  step1Desc: {
    ja: 'ミーティング後、先生のお名前を冠した URL を私から個別にお送りします。例えばこんな形です。',
    en: 'After our meeting, we send you a URL personalized with your name. Like this:',
    es: 'Después de nuestra reunión, le enviamos una URL personalizada con su nombre. Así:',
    ko: '미팅 후 선생님 이름이 들어간 URL을 개별적으로 보내드립니다. 예를 들면 이런 형태입니다.',
    pt: 'Após nossa reunião, enviamos a você uma URL personalizada com seu nome. Algo assim:',
    de: 'Nach unserem Treffen senden wir Ihnen eine personalisierte URL mit Ihrem Namen. Zum Beispiel:',
  } as L6,
  step2Title: { ja: 'その URL を学生さんに送る', en: 'Share the URL with your student', es: 'Comparte la URL con su estudiante', ko: '학생에게 URL을 보내드립니다', pt: 'Compartilhe a URL com o aluno', de: 'URL mit Ihrem Studierenden teilen' } as L6,
  step2Desc: {
    ja: 'LINE、メール、Slack、何でも結構です。「これを使ってみて」と一言添えていただければ大丈夫です。',
    en: 'Use any channel — message, email, Slack. A short note like "Try this!" is enough.',
    es: 'Use cualquier canal — mensaje, correo, Slack. Una nota breve como "Pruébalo" es suficiente.',
    ko: '카카오톡, 이메일, Slack 등 어떤 방법이든 좋습니다. "한번 써봐"라는 짧은 한 마디면 충분합니다.',
    pt: 'Use qualquer canal — mensagem, e-mail, Slack. Uma breve nota como "Experimente!" é suficiente.',
    de: 'Beliebiger Kanal — E-Mail, Messenger, Slack. Eine kurze Notiz wie „Probier das mal" reicht.',
  } as L6,
  step2Example: {
    ja: '先生：「Kuon ってツール、こちらから登録すると割引で使えるよ → 上記URL」',
    en: 'Teacher: "Sign up via this link to get the student discount → URL above."',
    es: 'Profesor: "Regístrate por este enlace para el descuento de estudiante → URL arriba."',
    ko: '선생님: "Kuon이라는 도구, 이 링크로 등록하면 할인으로 쓸 수 있어 → 위 URL"',
    pt: 'Professor: "Cadastre-se por este link para o desconto de estudante → URL acima."',
    de: 'Lehrkraft: „Melde dich über diesen Link an, um den Rabatt zu erhalten → URL oben."',
  } as L6,
  step3Title: { ja: '学生さんがクリック → 自動で割引適用', en: 'Student clicks → discount applied automatically', es: 'El estudiante hace clic → descuento aplicado automáticamente', ko: '학생이 클릭 → 자동으로 할인 적용', pt: 'Aluno clica → desconto aplicado automaticamente', de: 'Studierender klickt → Rabatt automatisch angewendet' } as L6,
  step3Desc: {
    ja: '学生さんが URL をクリックして購入手続きをすると、自動的に学生割引が適用されます。先生も学生さんも、コードを手入力する必要はありません。',
    en: 'When the student clicks the URL and checks out, the discount applies automatically. No manual code entry from teacher or student.',
    es: 'Cuando el estudiante hace clic y completa la compra, el descuento se aplica automáticamente. Sin entrada manual de código.',
    ko: '학생이 URL을 클릭하여 결제하시면 학생 할인이 자동 적용됩니다. 선생님도 학생도 코드를 수동으로 입력할 필요가 없습니다.',
    pt: 'Quando o aluno clica na URL e faz a compra, o desconto é aplicado automaticamente. Sem digitação manual de código.',
    de: 'Wenn Ihr Studierender auf die URL klickt und kauft, wird der Rabatt automatisch angewendet. Keine manuelle Code-Eingabe nötig.',
  } as L6,
  step3Example: {
    ja: '購入画面で「Concerto First Month 50% Off -¥740」と表示されます',
    en: 'Checkout shows "Concerto First Month 50% Off -¥740"',
    es: 'En el checkout aparece "Concerto First Month 50% Off -¥740"',
    ko: '결제 화면에 "Concerto First Month 50% Off -¥740"가 표시됩니다',
    pt: 'O checkout mostra "Concerto First Month 50% Off -¥740"',
    de: 'Im Checkout erscheint „Concerto First Month 50% Off -¥740"',
  } as L6,
};

// セクション 06: なぜこの制度を作ったか
const STORY = {
  heading: { ja: 'なぜこの制度を作ったのか', en: 'Why we built this program', es: 'Por qué creamos este programa', ko: '왜 이 제도를 만들었는가', pt: 'Por que criamos este programa', de: 'Warum wir dieses Programm geschaffen haben' } as L6,
  p1: {
    ja: '私自身、音大時代に「市販のプロ用録音機材は数十万円。学生にはとても買えない」という現実に直面しました。空音開発を立ち上げたのは、「音大生でも届く価格で、プロ品質のツールを」という想いからです。',
    en: 'As a music student, I faced the reality that professional recording gear costs hundreds of thousands of yen — out of reach for students. I founded Kuon R&D with one simple wish: "Pro-grade tools at prices music students can afford."',
    es: 'Como estudiante de música, enfrenté la realidad de que el equipo profesional de grabación cuesta cientos de miles de yenes — inaccesible para estudiantes. Fundé Kuon R&D con un deseo simple: "Herramientas profesionales a precios accesibles para estudiantes de música."',
    ko: '저 자신, 음대 시절에 "시판되는 프로용 녹음 장비는 수십만 엔. 학생은 도저히 살 수 없다"는 현실에 직면했습니다. 공음개발을 설립한 것은 "음대생도 손에 닿는 가격으로 프로 품질의 도구를"이라는 생각에서였습니다.',
    pt: 'Como estudante de música, enfrentei a realidade de que equipamentos profissionais de gravação custam centenas de milhares de ienes — inacessíveis para estudantes. Fundei a Kuon R&D com um desejo simples: "Ferramentas profissionais a preços que estudantes de música possam pagar."',
    de: 'Als Musikstudent erlebte ich, dass professionelle Aufnahmegeräte hunderttausende Yen kosten — unerreichbar für Studierende. Kuon R&D gründete ich mit einem einfachen Wunsch: „Professionelle Werkzeuge zu Preisen, die Musikstudierende sich leisten können."',
  } as L6,
  p2: {
    ja: 'ですが、ツールがあっても、それを「使ってみよう」と最初に教えてくれるのは、いつも先生方です。先生のひとことが、学生の音楽人生を変える。私自身もそうでした。',
    en: 'But even if the tools exist, it is always the teachers who first say "try this" to their students. A teacher\'s single word can change a student\'s musical life. It did for me.',
    es: 'Pero incluso si las herramientas existen, son siempre los profesores quienes primero dicen "prueba esto" a sus estudiantes. Una palabra del profesor puede cambiar la vida musical de un estudiante. La mía cambió así.',
    ko: '하지만 도구가 있어도, 그것을 "써보자"고 처음 알려주시는 것은 언제나 선생님들이십니다. 선생님의 한 마디가 학생의 음악 인생을 바꿉니다. 저 자신도 그러했습니다.',
    pt: 'Mas mesmo com as ferramentas existindo, são sempre os professores que dizem primeiro "experimente isso" aos seus alunos. Uma palavra do professor pode mudar a vida musical do aluno. Mudou a minha.',
    de: 'Aber selbst wenn die Werkzeuge existieren — es sind stets die Lehrkräfte, die zuerst „Probier das mal" sagen. Ein einziges Wort einer Lehrkraft kann das musikalische Leben eines Studierenden verändern. Bei mir war es so.',
  } as L6,
  p3: {
    ja: 'だからこの制度は、先生方への感謝の形です。先生に Symphony プランを無償でお使いいただき、先生のお名前のコードを学生さんに渡せるようにする。学生さんは「○○先生のおかげで安く使えてる」と感謝の気持ちが先生に向かう。先生は学生に最高の道具を紹介できる。',
    en: 'So this program is a form of gratitude to teachers. We give you Symphony for free, and a code with your name to share with students. Students feel "thanks to my teacher, I can use this affordably." You get to share the best tools with your students.',
    es: 'Por eso este programa es una forma de gratitud hacia los profesores. Le damos Symphony gratis y un código con su nombre para compartir con sus estudiantes. Los estudiantes sienten "gracias a mi profesor, puedo usar esto asequiblemente." Usted comparte las mejores herramientas con sus estudiantes.',
    ko: '그래서 이 제도는 선생님들께 드리는 감사의 형태입니다. 선생님께 Symphony 플랜을 무료로 제공해 드리고, 선생님 이름의 코드를 학생들에게 전달하실 수 있도록 합니다. 학생은 "○○선생님 덕분에 저렴하게 사용할 수 있다"는 감사의 마음을 선생님께 향하게 됩니다. 선생님은 학생들에게 최고의 도구를 소개해 드릴 수 있습니다.',
    pt: 'Por isso, este programa é uma forma de gratidão aos professores. Damos a você o Symphony grátis e um código com seu nome para compartilhar com os alunos. Os alunos sentem "graças ao meu professor, posso usar isto a um preço acessível." Você compartilha as melhores ferramentas com seus alunos.',
    de: 'Dieses Programm ist daher eine Form des Dankes an Lehrkräfte. Sie erhalten Symphony kostenlos und einen Code mit Ihrem Namen, den Sie mit Ihren Studierenden teilen können. Studierende empfinden „Dank meiner Lehrkraft kann ich das günstig nutzen." Sie teilen die besten Werkzeuge mit Ihren Studierenden.',
  } as L6,
  p4: {
    ja: '紹介報酬も、ノルマも、契約書もありません。先生のご判断で、伝えたい学生さんにだけ伝えてください。',
    en: 'No referral fees. No quotas. No contracts. Tell your students only those you wish to.',
    es: 'Sin comisiones. Sin cuotas. Sin contratos. Dígalo solo a los estudiantes que desee.',
    ko: '소개 보수도, 할당량도, 계약서도 없습니다. 선생님의 판단으로 전달하고 싶은 학생에게만 전달해 주세요.',
    pt: 'Sem comissões. Sem cotas. Sem contratos. Compartilhe apenas com os alunos que desejar.',
    de: 'Keine Provisionen. Keine Quoten. Keine Verträge. Teilen Sie es nur mit Studierenden, die Ihnen am Herzen liegen.',
  } as L6,
};

// FAQ
const FAQ = {
  heading: { ja: 'よくあるご質問', en: 'Frequently Asked Questions', es: 'Preguntas frecuentes', ko: '자주 묻는 질문', pt: 'Perguntas frequentes', de: 'Häufige Fragen' } as L6,
  q1: {
    ja: { q: '本当に先生は無料で Symphony プランを使えるのですか？', a: 'はい。先生のアカウントを Symphony 権限に手動で切り替えます。月額のお支払いは一切発生しません。' },
    en: { q: 'Is Symphony truly free for teachers?', a: 'Yes. Your account is manually switched to Symphony tier. No monthly payment is required.' },
    es: { q: '¿Symphony es realmente gratis para profesores?', a: 'Sí. Su cuenta se cambia manualmente al plan Symphony. No se requiere pago mensual.' },
    ko: { q: '정말 선생님은 무료로 Symphony 플랜을 사용할 수 있습니까?', a: '네. 선생님 계정을 Symphony 권한으로 수동 전환해 드립니다. 월 결제는 일절 발생하지 않습니다.' },
    pt: { q: 'Symphony é realmente grátis para professores?', a: 'Sim. Sua conta é manualmente migrada para o plano Symphony. Sem pagamento mensal.' },
    de: { q: 'Ist Symphony für Lehrkräfte wirklich kostenlos?', a: 'Ja. Ihr Konto wird manuell auf den Symphony-Tarif umgestellt. Es fallen keine monatlichen Zahlungen an.' },
  } as Record<Lang, { q: string; a: string }>,
  q2: {
    ja: { q: '学生は本当に 30% オフで 1 年間使えるのですか？', a: 'はい。最初に学生割引が適用されてから 12 ヶ月間、自動的に 30% オフが続きます。学生さん側で何か手続きをする必要はありません。' },
    en: { q: 'Do students really get 30% off for a full year?', a: 'Yes. The 30% discount applies automatically for 12 months from the first payment. The student does not need to take any action.' },
    es: { q: '¿Los estudiantes realmente reciben 30% de descuento por un año completo?', a: 'Sí. El descuento del 30% se aplica automáticamente durante 12 meses desde el primer pago. El estudiante no necesita hacer nada.' },
    ko: { q: '학생은 정말 30% 할인으로 1년 동안 사용할 수 있습니까?', a: '네. 학생 할인이 적용된 후 12개월 동안 자동으로 30% 할인이 계속됩니다. 학생 측에서 어떤 절차도 필요 없습니다.' },
    pt: { q: 'Os alunos realmente recebem 30% de desconto por um ano inteiro?', a: 'Sim. O desconto de 30% é aplicado automaticamente por 12 meses a partir do primeiro pagamento. O aluno não precisa fazer nada.' },
    de: { q: 'Erhalten Studierende wirklich 30 % Rabatt für ein ganzes Jahr?', a: 'Ja. Der 30 %-Rabatt gilt automatisch 12 Monate ab der ersten Zahlung. Der Studierende muss nichts unternehmen.' },
  } as Record<Lang, { q: string; a: string }>,
  q3: {
    ja: { q: '1 年経ったら学生はどうなりますか？', a: '自動的に通常価格に戻ります。Concerto なら ¥1,480/月、Prelude なら ¥780/月です。学生さんは事前にメールでお知らせを受け取れる設計です。' },
    en: { q: 'What happens after one year?', a: 'The price returns automatically to the regular rate. Concerto becomes ¥1,480/mo, Prelude ¥780/mo. The student receives an email reminder beforehand.' },
    es: { q: '¿Qué pasa después de un año?', a: 'El precio vuelve automáticamente a la tarifa regular. Concerto se convierte en ¥1,480/mes, Prelude en ¥780/mes. El estudiante recibe un correo de aviso previo.' },
    ko: { q: '1년 후 학생은 어떻게 됩니까?', a: '자동으로 정가로 복귀됩니다. Concerto는 ¥1,480/월, Prelude는 ¥780/월입니다. 학생에게는 미리 이메일로 안내가 발송되도록 설계되어 있습니다.' },
    pt: { q: 'O que acontece após um ano?', a: 'O preço retorna automaticamente ao valor normal. Concerto ¥1.480/mês, Prelude ¥780/mês. O aluno recebe um aviso por e-mail antecipado.' },
    de: { q: 'Was passiert nach einem Jahr?', a: 'Der Preis kehrt automatisch zum regulären Tarif zurück. Concerto ¥1.480/Mo, Prelude ¥780/Mo. Der Studierende erhält vorab eine E-Mail-Erinnerung.' },
  } as Record<Lang, { q: string; a: string }>,
  q4: {
    ja: { q: 'すでに Kuon に登録している学生はこのコードを使えますか？', a: '残念ながら使えません。学生割引は「初めて Kuon を購入する方」専用です。これは制度の悪用を防ぐためです。' },
    en: { q: 'Can students already on Kuon use this code?', a: 'Unfortunately no. The student discount is for first-time buyers only. This is to prevent abuse.' },
    es: { q: '¿Los estudiantes ya registrados en Kuon pueden usar este código?', a: 'Lamentablemente no. El descuento es solo para nuevos compradores. Esto previene abusos.' },
    ko: { q: '이미 Kuon에 가입한 학생은 이 코드를 사용할 수 있습니까?', a: '아쉽게도 사용할 수 없습니다. 학생 할인은 "처음 Kuon을 구매하시는 분" 전용입니다. 제도의 악용을 방지하기 위함입니다.' },
    pt: { q: 'Alunos já cadastrados na Kuon podem usar este código?', a: 'Infelizmente não. O desconto é apenas para novos compradores. Isto previne abusos.' },
    de: { q: 'Können bereits registrierte Studierende diesen Code nutzen?', a: 'Leider nein. Der Studentenrabatt gilt nur für Erstkäufer. Dies verhindert Missbrauch.' },
  } as Record<Lang, { q: string; a: string }>,
  q5: {
    ja: { q: '学生がコードを使った後にすぐ解約したらどうなりますか？', a: '通常通り解約できます。残期間まで利用できて、次回更新分から請求が止まります。学生さんに不利益はありません。' },
    en: { q: 'What if a student cancels right after using the code?', a: 'They can cancel normally. They keep access for the remaining period, and no further billing applies. No disadvantage to the student.' },
    es: { q: '¿Qué pasa si un estudiante cancela justo después de usar el código?', a: 'Pueden cancelar normalmente. Conservan acceso hasta el final del período actual y no se cobra más. Sin desventaja para el estudiante.' },
    ko: { q: '학생이 코드를 사용한 직후 해지하면 어떻게 됩니까?', a: '평소대로 해지할 수 있습니다. 남은 기간까지 이용 가능하며 다음 갱신부터 청구가 중단됩니다. 학생에게 불이익은 없습니다.' },
    pt: { q: 'E se o aluno cancelar logo após usar o código?', a: 'Podem cancelar normalmente. Mantêm acesso até o fim do período atual e nenhum novo valor é cobrado. Sem desvantagem para o aluno.' },
    de: { q: 'Was passiert, wenn ein Studierender direkt nach Verwendung des Codes kündigt?', a: 'Eine normale Kündigung ist möglich. Sie behalten den Zugang bis zum Ende des laufenden Zeitraums; danach erfolgen keine Abbuchungen. Kein Nachteil für die Studierenden.' },
  } as Record<Lang, { q: string; a: string }>,
  q6: {
    ja: { q: '何人の学生にコードを使ってもらえますか？', a: '人数制限はありません。先生のご判断で、好きなだけ学生さんに共有してください。' },
    en: { q: 'How many students can use the code?', a: 'No limit. Share with as many of your students as you wish.' },
    es: { q: '¿Cuántos estudiantes pueden usar el código?', a: 'Sin límite. Compártalo con tantos estudiantes como desee.' },
    ko: { q: '몇 명의 학생이 코드를 사용할 수 있습니까?', a: '인원 제한이 없습니다. 선생님 판단으로 원하시는 만큼 학생들에게 공유하실 수 있습니다.' },
    pt: { q: 'Quantos alunos podem usar o código?', a: 'Sem limite. Compartilhe com quantos alunos desejar.' },
    de: { q: 'Wie viele Studierende können den Code nutzen?', a: 'Keine Begrenzung. Teilen Sie ihn mit so vielen Studierenden, wie Sie möchten.' },
  } as Record<Lang, { q: string; a: string }>,
  q7: {
    ja: { q: '私（教師）が学生のために代理で購入できますか？', a: '申し訳ありませんが、ご本人のクレジットカードで決済していただく必要があります（Stripe の規約上）。' },
    en: { q: 'Can I (teacher) buy on behalf of my student?', a: 'Unfortunately no. The student must use their own credit card per Stripe terms.' },
    es: { q: '¿Puedo (profesor) comprar en nombre de mi estudiante?', a: 'Lamentablemente no. El estudiante debe usar su propia tarjeta según las normas de Stripe.' },
    ko: { q: '제가(교사) 학생을 대신해 구매할 수 있습니까?', a: '죄송하지만 본인의 신용카드로 결제하셔야 합니다 (Stripe 규정상).' },
    pt: { q: 'Eu (professor) posso comprar em nome do aluno?', a: 'Infelizmente não. O aluno deve usar o próprio cartão (regras do Stripe).' },
    de: { q: 'Kann ich (Lehrkraft) im Namen meiner Studierenden kaufen?', a: 'Leider nein. Der Studierende muss laut Stripe-Bedingungen eine eigene Kreditkarte verwenden.' },
  } as Record<Lang, { q: string; a: string }>,
  q8: {
    ja: { q: '紹介の報酬はありますか？', a: '金銭的な紹介報酬はありません。代わりに、先生のお名前のコードで学生さんが Kuon に登録するたび、ダッシュボードに「○○先生からの招待」として記録され、先生の影響力が可視化されます。' },
    en: { q: 'Is there a referral commission?', a: 'No monetary commission. Instead, every student signing up via your code is recorded as "invited by [your name]" in our dashboard, making your influence visible.' },
    es: { q: '¿Hay comisión por referido?', a: 'Sin comisión monetaria. Cada estudiante que se registra con su código se registra como "invitado por [su nombre]" en nuestro panel, haciendo visible su influencia.' },
    ko: { q: '소개 보수가 있습니까?', a: '금전적 소개 보수는 없습니다. 대신, 선생님 이름의 코드로 학생이 Kuon에 가입할 때마다 대시보드에 "○○선생님으로부터의 초대"로 기록되어 선생님의 영향력이 가시화됩니다.' },
    pt: { q: 'Há comissão de indicação?', a: 'Sem comissão monetária. Em vez disso, cada aluno cadastrado com seu código aparece como "convidado por [seu nome]" em nosso painel, tornando sua influência visível.' },
    de: { q: 'Gibt es eine Empfehlungsprovision?', a: 'Keine monetäre Provision. Stattdessen wird jeder Studierende, der sich mit Ihrem Code registriert, im Dashboard als „eingeladen von [Ihr Name]" erfasst, sodass Ihr Einfluss sichtbar wird.' },
  } as Record<Lang, { q: string; a: string }>,
};

// セクション 08: 次のアクション
const NEXT = {
  heading: { ja: '次にすること', en: 'What happens next', es: 'Qué sigue', ko: '다음에 할 일', pt: 'Próximos passos', de: 'Wie es weitergeht' } as L6,
  body: {
    ja: 'このページをお読みいただいて、「興味がある」と感じてくださった先生は、私にご連絡ください。先生のお名前を冠したコードを発行して、先生の Kuon アカウントを Symphony プランに切り替えます。',
    en: 'If, after reading this, you feel "I am interested," please reach out. We issue a code bearing your name and upgrade your Kuon account to Symphony.',
    es: 'Si, después de leer esto, siente "estoy interesado/a", contácteme. Le emito un código con su nombre y actualizo su cuenta Kuon al plan Symphony.',
    ko: '이 페이지를 읽으시고 "관심이 있다"고 느끼시는 선생님께서는 제게 연락 주세요. 선생님 이름의 코드를 발급해 드리고 선생님의 Kuon 계정을 Symphony 플랜으로 전환해 드립니다.',
    pt: 'Se, após ler isto, você sentir "tenho interesse", entre em contato. Emitimos um código com seu nome e atualizamos sua conta Kuon para Symphony.',
    de: 'Wenn Sie nach dem Lesen denken „Das interessiert mich", melden Sie sich gern. Wir stellen Ihnen einen Code mit Ihrem Namen aus und stellen Ihr Kuon-Konto auf Symphony um.',
  } as L6,
  contactLabel: { ja: 'お問い合わせ', en: 'Contact', es: 'Contacto', ko: '문의', pt: 'Contato', de: 'Kontakt' } as L6,
  ownerName: { ja: '朝比奈幸太郎（Kuon R&D 代表）', en: 'Kotaro Asahina (Founder, Kuon R&D)', es: 'Kotaro Asahina (Fundador, Kuon R&D)', ko: '아사히나 코타로 (Kuon R&D 대표)', pt: 'Kotaro Asahina (Fundador, Kuon R&D)', de: 'Kotaro Asahina (Gründer, Kuon R&D)' } as L6,
  emailLabel: { ja: 'メール', en: 'Email', es: 'Correo', ko: '이메일', pt: 'E-mail', de: 'E-Mail' } as L6,
  webLabel: { ja: 'ウェブサイト', en: 'Website', es: 'Sitio web', ko: '웹사이트', pt: 'Website', de: 'Website' } as L6,
  endNote: {
    ja: 'このページは限定公開です。\n内容にご質問があればお気軽にメールしてください。',
    en: 'This page is private.\nIf you have questions, please email anytime.',
    es: 'Esta página es privada.\nSi tiene preguntas, escríbame cuando guste.',
    ko: '이 페이지는 비공개입니다.\n내용에 대해 질문이 있으시면 부담 없이 이메일 주세요.',
    pt: 'Esta página é privada.\nSe tiver dúvidas, escreva-me a qualquer momento.',
    de: 'Diese Seite ist vertraulich.\nBei Fragen jederzeit gern per E-Mail.',
  } as L6,
};

const FOOTER_TEXT = {
  ja: '© 2026 空音開発（Kuon R&D） · 教師向け案内（限定公開）',
  en: '© 2026 Kuon R&D · For Teachers (Private)',
  es: '© 2026 Kuon R&D · Para Profesores (Privado)',
  ko: '© 2026 Kuon R&D · 교사 안내 (비공개)',
  pt: '© 2026 Kuon R&D · Para Professores (Privado)',
  de: '© 2026 Kuon R&D · Für Lehrkräfte (Privat)',
} as L6;

// 共通ラベル
const LABEL_TEACHER_BOOST_GIFT = { ja: '✨ 大切なこと', en: '✨ Important', es: '✨ Importante', ko: '✨ 중요한 점', pt: '✨ Importante', de: '✨ Wichtig' } as L6;
const TABLE_HEADER = {
  plan: { ja: 'プラン', en: 'Plan', es: 'Plan', ko: '플랜', pt: 'Plano', de: 'Tarif' } as L6,
  m1: { ja: '初月 / 1 年', en: 'Month 1 / Year 1', es: 'Mes 1 / Año 1', ko: '첫 달 / 1년', pt: 'Mês 1 / Ano 1', de: 'Monat 1 / Jahr 1' } as L6,
  m2: { ja: 'その後', en: 'Then', es: 'Luego', ko: '이후', pt: 'Depois', de: 'Danach' } as L6,
  total: { ja: '合計', en: 'Total', es: 'Total', ko: '합계', pt: 'Total', de: 'Gesamt' } as L6,
  save: { ja: '節約額', en: 'You save', es: 'Ahorra', ko: '절약액', pt: 'Economia', de: 'Ersparnis' } as L6,
};

export default function ForTeachersPage() {
  const { lang } = useLang();
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') {
        setUnlocked(true);
      }
    } catch { /* silent */ }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwInput.trim().toLowerCase() === TEACHER_LP_PASSWORD) {
      setUnlocked(true);
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* silent */ }
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  if (!hydrated) {
    return <div style={{ minHeight: '100vh', background: BG_CREAM }} />;
  }

  if (!unlocked) {
    return (
      <div style={{
        minHeight: '100vh',
        background: BG_CREAM,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: sans,
      }}>
        <div style={{
          maxWidth: 420, width: '100%', background: '#fff', borderRadius: 16,
          padding: '3rem 2rem', boxShadow: '0 8px 40px rgba(0,0,0,0.06)', textAlign: 'center',
        }}>
          <div style={{ fontFamily: serif, fontSize: '1.4rem', fontWeight: 400, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            {t(GATE_LABELS.title, lang)}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '2rem' }}>
            {t(GATE_LABELS.subtitle, lang)}
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="password" value={pwInput}
              onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
              placeholder={t(GATE_LABELS.password, lang)}
              autoFocus
              style={{
                width: '100%', padding: '0.8rem 1rem', fontSize: '1rem',
                border: pwError ? '2px solid #ef4444' : '1px solid #cbd5e1',
                borderRadius: 8, outline: 'none', fontFamily: sans, color: '#0f172a',
                marginBottom: '1rem', boxSizing: 'border-box', background: '#fff',
              }}
            />
            {pwError && (
              <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>
                {t(GATE_LABELS.invalid, lang)}
              </div>
            )}
            <button type="submit"
              style={{
                width: '100%', padding: '0.8rem 1rem', background: ACCENT, color: '#fff',
                border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: sans,
              }}>
              {t(GATE_LABELS.open, lang)}
            </button>
          </form>
          <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {t(GATE_LABELS.note, lang)}
          </div>
        </div>
      </div>
    );
  }

  const faq = FAQ;
  const faqItems = [faq.q1[lang], faq.q2[lang], faq.q3[lang], faq.q4[lang], faq.q5[lang], faq.q6[lang], faq.q7[lang], faq.q8[lang]];

  return (
    <div style={{ minHeight: '100vh', background: BG_CREAM, color: '#0f172a', fontFamily: sans }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .fade-in { animation: fadeIn 0.6s ease-out both; }
      `}</style>

      {/* ヒーロー */}
      <section style={{ padding: 'clamp(3rem, 8vw, 6rem) 1.5rem clamp(2rem, 6vw, 4rem)', maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: GOLD, fontWeight: 700, marginBottom: '1rem' }}>
          {t(HERO.pretitle, lang)}
        </div>
        <h1 className="fade-in" style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 400, lineHeight: 1.4, color: '#0f172a', marginBottom: '1.5rem', letterSpacing: '0.02em', whiteSpace: 'pre-line' }}>
          {t(HERO.title, lang)}
        </h1>
        <p className="fade-in" style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.05rem)', color: '#475569', lineHeight: 1.9, maxWidth: 640, margin: '0 auto', wordBreak: 'keep-all', whiteSpace: 'pre-line' }}>
          {t(HERO.body, lang)}
        </p>
        <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          {t(HERO.hint, lang)}
        </div>
      </section>

      <Divider />

      {/* セクション 01: 空音開発について */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', maxWidth: 760, margin: '0 auto' }}>
        <SectionLabel num="01" />
        <h2 style={sectionH2Style}>{t(ABOUT.heading, lang)}</h2>
        <p style={paragraphStyle}>{t(ABOUT.p1, lang)}</p>
        <p style={paragraphStyle}>{t(ABOUT.p2, lang)}</p>
        <p style={paragraphStyle}>
          {t(ABOUT.p3, lang)}
          <a href="https://kuon-rnd.com" target="_blank" rel="noreferrer" style={{ color: ACCENT, textDecoration: 'underline' }}>kuon-rnd.com</a>
          {t(ABOUT.p3_suffix, lang)}
        </p>
      </section>

      <Divider />

      {/* セクション 02: 教師が手に入れるもの */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', maxWidth: 880, margin: '0 auto' }}>
        <SectionLabel num="02" />
        <h2 style={sectionH2Style}>{t(BENEFITS.heading, lang)}</h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '2.5rem', lineHeight: 1.8 }}>
          {t(BENEFITS.intro, lang)}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <BenefitCard icon="🎁" title={t(BENEFITS.card1Title, lang)} price={t(BENEFITS.card1Price, lang)} desc={t(BENEFITS.card1Desc, lang)} />
          <BenefitCard icon="🎓" title={t(BENEFITS.card2Title, lang)} price={t(BENEFITS.card2Price, lang)} desc={t(BENEFITS.card2Desc, lang)} />
        </div>

        <div style={{ marginTop: '2rem', padding: '1.2rem 1.5rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, fontSize: '0.9rem', color: '#7c2d12', lineHeight: 1.8 }}>
          {t(BENEFITS.note, lang)}
        </div>
      </section>

      <Divider />

      {/* セクション 03: 月払い割引 */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', maxWidth: 880, margin: '0 auto' }}>
        <SectionLabel num="03" />
        <h2 style={sectionH2Style}>{t(MONTHLY.heading, lang)}</h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '2.5rem', lineHeight: 1.8 }}>
          {t(MONTHLY.intro, lang)}
        </p>

        <Timeline phases={[
          { label: t(MONTHLY.phase1Label, lang), big: t(MONTHLY.phase1Big, lang), color: '#10b981', detail: t(MONTHLY.phase1Detail, lang) },
          { label: t(MONTHLY.phase2Label, lang), big: t(MONTHLY.phase2Big, lang), color: '#0284c7', detail: t(MONTHLY.phase2Detail, lang) },
          { label: t(MONTHLY.phase3Label, lang), big: t(MONTHLY.phase3Big, lang), color: '#64748b', detail: t(MONTHLY.phase3Detail, lang) },
        ]} />

        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <div style={tableHeadingStyle}>{t(MONTHLY.tableHeading, lang)}</div>
          <PaymentTable lang={lang} rows={[
            { plan: t(MONTHLY.preludeLabel, lang), m1: '¥390', m2: '¥546 × 11', total: '¥6,396', save: '¥2,964' },
            { plan: t(MONTHLY.concertoLabel, lang), m1: '¥740', m2: '¥1,036 × 11', total: '¥12,136', save: '¥5,624' },
          ]} />
        </div>
      </section>

      {/* セクション 04: 年払い割引 */}
      <section style={{ padding: 'clamp(2rem, 4vw, 3rem) 1.5rem clamp(3rem, 6vw, 5rem)', maxWidth: 880, margin: '0 auto' }}>
        <SectionLabel num="04" />
        <h2 style={sectionH2Style}>{t(ANNUAL.heading, lang)}</h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '2.5rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
          {t(ANNUAL.intro, lang)}
        </p>

        <Timeline phases={[
          { label: t(ANNUAL.phase1Label, lang), big: t(ANNUAL.phase1Big, lang), color: '#0284c7', detail: t(ANNUAL.phase1Detail, lang) },
          { label: t(ANNUAL.phase2Label, lang), big: t(ANNUAL.phase2Big, lang), color: '#64748b', detail: t(ANNUAL.phase2Detail, lang) },
        ]} />

        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <div style={tableHeadingStyle}>{t(ANNUAL.tableHeading, lang)}</div>
          <PaymentTable lang={lang} highlight rows={[
            { plan: t(ANNUAL.preludeLabel, lang), m1: t(ANNUAL.bundlePay1, lang), m2: '—', total: '¥5,460', save: '¥3,900' },
            { plan: t(ANNUAL.concertoLabel, lang), m1: t(ANNUAL.bundlePay2, lang), m2: '—', total: '¥10,360', save: '¥7,400' },
          ]} />
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1.2rem 1.5rem', background: '#ecfeff', border: '1px solid #67e8f9', borderRadius: 10, fontSize: '0.9rem', color: '#0e7490', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
          {t(ANNUAL.whyAnnual, lang)}
        </div>
      </section>

      <Divider />

      {/* セクション 05: 使い方 */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', maxWidth: 880, margin: '0 auto' }}>
        <SectionLabel num="05" />
        <h2 style={sectionH2Style}>{t(USAGE.heading, lang)}</h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '2.5rem', lineHeight: 1.8 }}>
          {t(USAGE.intro, lang)}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <Step num="1" title={t(USAGE.step1Title, lang)} desc={t(USAGE.step1Desc, lang)} example="https://kuon-rnd.com/?coupon=ASAHINA-30" />
          <Step num="2" title={t(USAGE.step2Title, lang)} desc={t(USAGE.step2Desc, lang)} example={t(USAGE.step2Example, lang)} />
          <Step num="3" title={t(USAGE.step3Title, lang)} desc={t(USAGE.step3Desc, lang)} example={t(USAGE.step3Example, lang)} />
        </div>
      </section>

      <Divider />

      {/* セクション 06: なぜこの制度 */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', maxWidth: 760, margin: '0 auto' }}>
        <SectionLabel num="06" />
        <h2 style={sectionH2Style}>{t(STORY.heading, lang)}</h2>
        <div style={{ fontSize: '1rem', lineHeight: 2, color: '#334155', wordBreak: 'keep-all' }}>
          <p style={{ marginBottom: '1.2rem' }}>{t(STORY.p1, lang)}</p>
          <p style={{ marginBottom: '1.2rem' }}>{t(STORY.p2, lang)}</p>
          <p style={{ marginBottom: '1.2rem' }}>{t(STORY.p3, lang)}</p>
          <p style={{ marginBottom: 0 }}>{t(STORY.p4, lang)}</p>
        </div>
      </section>

      <Divider />

      {/* セクション 07: FAQ */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', maxWidth: 760, margin: '0 auto' }}>
        <SectionLabel num="07" />
        <h2 style={{ ...sectionH2Style, marginBottom: '2.5rem' }}>{t(FAQ.heading, lang)}</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqItems.map((item, idx) => (
            <FaqItem key={idx} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      <Divider />

      {/* セクション 08: 次のアクション */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem clamp(5rem, 8vw, 8rem)', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <SectionLabel num="08" />
        <h2 style={sectionH2Style}>{t(NEXT.heading, lang)}</h2>
        <div style={{ fontSize: '1rem', lineHeight: 2, color: '#334155', marginBottom: '2.5rem' }}>
          {t(NEXT.body, lang)}
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '1rem', textTransform: 'uppercase' }}>
            {t(NEXT.contactLabel, lang)}
          </div>
          <div style={{ fontFamily: serif, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem' }}>
            {t(NEXT.ownerName, lang)}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.9 }}>
            {t(NEXT.emailLabel, lang)}：<a href="mailto:369@kotaroasahina.com" style={{ color: ACCENT, textDecoration: 'none', fontFamily: mono }}>369@kotaroasahina.com</a><br />
            {t(NEXT.webLabel, lang)}：<a href="https://kuon-rnd.com" target="_blank" rel="noreferrer" style={{ color: ACCENT, textDecoration: 'none' }}>kuon-rnd.com</a>
          </div>
        </div>

        <div style={{ marginTop: '3rem', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
          {t(NEXT.endNote, lang)}
        </div>
      </section>

      {/* フッター */}
      <footer style={{ padding: '2rem 1.5rem', borderTop: '1px solid #e2e8f0', textAlign: 'center', background: '#fff', fontSize: '0.75rem', color: '#94a3b8' }}>
        {t(FOOTER_TEXT, lang)}
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────
// 共通スタイル
// ─────────────────────────────────────────────

const sectionH2Style: React.CSSProperties = {
  fontFamily: serif,
  fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
  fontWeight: 400,
  color: '#0f172a',
  marginBottom: '1.5rem',
  letterSpacing: '0.02em',
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '1rem',
  lineHeight: 1.95,
  color: '#334155',
  wordBreak: 'keep-all',
  marginBottom: '1rem',
};

const tableHeadingStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#64748b',
  fontWeight: 700,
  letterSpacing: '0.06em',
  marginBottom: '1rem',
  textTransform: 'uppercase',
};

// ─────────────────────────────────────────────
// サブコンポーネント
// ─────────────────────────────────────────────

function Divider() {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 1.5rem' }}>
      <div style={{ height: 1, background: 'linear-gradient(to right, transparent, #cbd5e1, transparent)' }} />
    </div>
  );
}

function SectionLabel({ num }: { num: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
      <span style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: GOLD, fontFamily: mono, fontWeight: 700 }}>{num}</span>
      <div style={{ flex: 1, height: 1, background: '#e2e8f0', maxWidth: 120 }} />
    </div>
  );
}

function BenefitCard({ icon, title, price, desc }: { icon: string; title: string; price: string; desc: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', textAlign: 'left' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontFamily: serif, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.25rem' }}>{title}</div>
      <div style={{ fontSize: '0.8rem', color: GOLD, fontWeight: 600, marginBottom: '0.8rem', fontFamily: mono }}>{price}</div>
      <div style={{ fontSize: '0.88rem', lineHeight: 1.8, color: '#475569' }}>{desc}</div>
    </div>
  );
}

interface Phase { label: string; big: string; color: string; detail: string }

function Timeline({ phases }: { phases: Phase[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${phases.length}, 1fr)`, gap: '0.8rem' }} className="timeline-grid">
      <style>{`
        @media (max-width: 720px) {
          .timeline-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {phases.map((p, i) => (
        <div key={i} style={{ background: '#fff', border: `2px solid ${p.color}33`, borderRadius: 12, padding: '1.2rem', position: 'relative' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{p.label}</div>
          <div style={{ fontFamily: serif, fontSize: '1.6rem', fontWeight: 600, color: p.color, marginBottom: '0.6rem', letterSpacing: '0.01em' }}>{p.big}</div>
          <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.7 }}>{p.detail}</div>
        </div>
      ))}
    </div>
  );
}

interface Row { plan: string; m1: string; m2: string; total: string; save: string }

function PaymentTable({ rows, highlight = false, lang }: { rows: Row[]; highlight?: boolean; lang: Lang }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
            <th style={{ padding: '0.6rem 0.5rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em' }}>{t(TABLE_HEADER.plan, lang)}</th>
            <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em' }}>{t(TABLE_HEADER.m1, lang)}</th>
            <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em' }}>{t(TABLE_HEADER.m2, lang)}</th>
            <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em' }}>{t(TABLE_HEADER.total, lang)}</th>
            <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em', color: highlight ? '#7c2d12' : '#64748b' }}>{t(TABLE_HEADER.save, lang)}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.plan} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '0.7rem 0.5rem', color: '#0f172a', fontWeight: 500 }}>{r.plan}</td>
              <td style={{ padding: '0.7rem 0.5rem', textAlign: 'right', color: '#10b981', fontFamily: mono, fontWeight: 600 }}>{r.m1}</td>
              <td style={{ padding: '0.7rem 0.5rem', textAlign: 'right', color: '#0284c7', fontFamily: mono }}>{r.m2}</td>
              <td style={{ padding: '0.7rem 0.5rem', textAlign: 'right', color: '#0f172a', fontWeight: 700, fontFamily: mono }}>{r.total}</td>
              <td style={{ padding: '0.7rem 0.5rem', textAlign: 'right', color: GOLD, fontWeight: 700, fontFamily: mono }}>{r.save}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Step({ num, title, desc, example }: { num: string; title: string; desc: string; example: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
      <div style={{
        flexShrink: 0, width: 40, height: 40, borderRadius: '50%', background: ACCENT, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: serif, fontSize: '1.2rem', fontWeight: 700,
      }}>
        {num}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: serif, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem' }}>{title}</div>
        <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.8, marginBottom: '0.8rem' }}>{desc}</div>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '0.6rem 0.8rem', fontSize: '0.8rem', color: '#64748b', fontFamily: mono, wordBreak: 'break-all' }}>
          {example}
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '1rem 1.25rem', background: 'transparent', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '1rem', textAlign: 'left', fontFamily: sans,
        }}>
        <span style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, lineHeight: 1.6 }}>Q. {q}</span>
        <span style={{ fontSize: '1.1rem', color: '#94a3b8', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: '0 1.25rem 1.1rem', fontSize: '0.9rem', color: '#475569', lineHeight: 1.9, borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
          A. {a}
        </div>
      )}
    </div>
  );
}
