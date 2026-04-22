'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Shippori Mincho", "Noto Serif JP", "Yu Mincho", "YuMincho", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L5 = Partial<Record<Lang, string>> & { en: string };
const t5 = (m: L5, lang: Lang): string => m[lang] ?? m.en;

const HomePage: React.FC = () => {
  const { lang } = useLang();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const faqs = [
    {
      q: {
        ja: '無料で使えるアプリはありますか？',
        en: 'Are there free apps?',
        es: '¿Hay aplicaciones gratuitas?',
        ko: '무료로 사용할 수 있는 앱이 있나요?',
        pt: 'Existem aplicativos gratuitos?',
      },
      a: {
        ja: 'はい。多くのブラウザアプリは無料で使用回数の制限なくお使いいただけます。一部のプレミアム機能やサーバー処理が必要なアプリにはサブスクリプションが必要です。',
        en: 'Yes. Many browser-based apps are free with no usage limits. Some premium features and server-powered apps require a subscription.',
        es: 'Sí. Muchas aplicaciones basadas en navegador son gratuitas sin límites de uso. Algunas funciones premium y aplicaciones de servidor requieren suscripción.',
        ko: '네. 많은 브라우저 기반 앱은 사용 제한 없이 무료입니다. 일부 프리미엄 기능과 서버 앱은 구독이 필요합니다.',
        pt: 'Sim. Muitos aplicativos baseados em navegador são gratuitos sem limites de uso. Algumas funcionalidades premium e aplicativos de servidor requerem assinatura.',
      },
    },
    {
      q: {
        ja: 'アカウント登録は必要ですか？',
        en: 'Do I need an account?',
        es: '¿Necesito una cuenta?',
        ko: '계정 등록이 필요한가요?',
        pt: 'Preciso de uma conta?',
      },
      a: {
        ja: 'アプリを使うだけなら不要です。設定の保存や処理履歴の確認にはアカウントが便利です。',
        en: 'Not to use the apps. An account lets you save settings and view history.',
        es: 'No para usar las aplicaciones. Una cuenta te permite guardar configuraciones y ver el historial.',
        ko: '앱을 사용하는 데는 필요하지 않습니다. 계정은 설정 저장 및 기록 보기에 유용합니다.',
        pt: 'Não para usar os aplicativos. Uma conta permite que você salve as configurações e visualize o histórico.',
      },
    },
    {
      q: {
        ja: 'マイクはどこに届けてもらえますか？',
        en: 'Where do you ship microphones?',
        es: '¿A dónde envían los micrófonos?',
        ko: '마이크는 어디로 배송되나요?',
        pt: 'Para onde vocês enviam os microfones?',
      },
      a: {
        ja: '日本国内はもちろん、国際郵便が届くすべての国・地域に発送可能です。EMS・国際小包で安全にお届けします。送料は地域により異なります。',
        en: 'We ship anywhere international postal services reach — worldwide via EMS and international parcel post. Shipping costs vary by region.',
        es: 'Enviamos a cualquier lugar al que lleguen los servicios postales internacionales, a través de EMS y correo internacional. Los costos varían por región.',
        ko: '국제 우편이 닿는 모든 국가·지역으로 배송 가능합니다. EMS 및 국제 소포로 안전하게 배송합니다.',
        pt: 'Enviamos para qualquer lugar que os serviços postais internacionais alcançam — via EMS e encomenda internacional.',
      },
    },
    {
      q: {
        ja: 'サブスクリプションはいつでも解約できますか？',
        en: 'Can I cancel my subscription anytime?',
        es: '¿Puedo cancelar mi suscripción en cualquier momento?',
        ko: '언제든지 구독을 취소할 수 있나요?',
        pt: 'Posso cancelar minha assinatura a qualquer momento?',
      },
      a: {
        ja: 'はい、いつでも解約できます。解約後も無料プランの機能は引き続き使えます。',
        en: 'Yes, cancel anytime. Free plan features remain available after cancellation.',
        es: 'Sí, cancela en cualquier momento. Las características del plan gratuito permanecen disponibles después de la cancelación.',
        ko: '네, 언제든지 취소할 수 있습니다. 취소 후에도 무료 플랜 기능을 계속 사용할 수 있습니다.',
        pt: 'Sim, cancele a qualquer momento. Os recursos do plano gratuito permanecem disponíveis após o cancelamento.',
      },
    },
    {
      q: {
        ja: '対応ファイル形式は？',
        en: 'What file formats are supported?',
        es: '¿Qué formatos de archivo son compatibles?',
        ko: '지원되는 파일 형식은?',
        pt: 'Quais formatos de arquivo são suportados?',
      },
      a: {
        ja: 'WAV、MP3、FLAC、DSD（DSF/DFF）、DDPなど幅広いフォーマットに対応しています。',
        en: 'WAV, MP3, FLAC, DSD (DSF/DFF), DDP, and many more.',
        es: 'WAV, MP3, FLAC, DSD (DSF/DFF), DDP y muchos más.',
        ko: 'WAV, MP3, FLAC, DSD (DSF/DFF), DDP 등 다양한 형식을 지원합니다.',
        pt: 'WAV, MP3, FLAC, DSD (DSF/DFF), DDP e muito mais.',
      },
    },
    {
      q: {
        ja: '日本語以外にも対応していますか？',
        en: 'Is it available in other languages?',
        es: '¿Está disponible en otros idiomas?',
        ko: '다른 언어로도 사용 가능한가요?',
        pt: 'Está disponível em outros idiomas?',
      },
      a: {
        ja: 'はい。日本語、英語、スペイン語、韓国語、ポルトガル語の5言語に対応しています。',
        en: 'Yes. Available in Japanese, English, Spanish, Korean, and Portuguese.',
        es: 'Sí. Disponible en japonés, inglés, español, coreano y portugués.',
        ko: '네. 일본어, 영어, 스페인어, 한국어, 포르투갈어 5가지 언어로 제공됩니다.',
        pt: 'Sim. Disponível em japonês, inglês, espanhol, coreano e português.',
      },
    },
  ];

  const apps: { emoji: string; name: string; desc: L5; href: string; badge?: L5 }[] = [
    {
      emoji: '🎚️',
      name: 'MASTER CHECK',
      desc: { ja: 'ラウドネス測定 + 自動調整', en: 'Loudness measurement + auto-adjust', es: 'Medición de volumen + ajuste automático', ko: '라우드니스 측정 + 자동 조정', pt: 'Medição de volume + ajuste automático' },
      href: '/master-check-lp',
    },
    {
      emoji: '🎼',
      name: 'DSD CONVERTER',
      desc: { ja: '世界初ブラウザDSD再生', en: 'World\'s first browser DSD player', es: 'Primer reproductor DSD de navegador del mundo', ko: '세계 최초 브라우저 DSD 플레이어', pt: 'Primeiro reprodutor DSD do navegador do mundo' },
      href: '/dsd-lp',
    },
    {
      emoji: '💿',
      name: 'DDP CHECKER',
      desc: { ja: 'DDPイメージ検証', en: 'DDP image verification', es: 'Verificación de imágenes DDP', ko: 'DDP 이미지 검증', pt: 'Verificação de imagem DDP' },
      href: '/ddp-checker-lp',
    },
    {
      emoji: '🎵',
      name: 'NORMALIZE',
      desc: { ja: 'ピーク・ラウドネス正規化', en: 'Peak & loudness normalization', es: 'Normalización de pico y volumen', ko: '피크 & 라우드니스 정규화', pt: 'Normalização de pico e volume' },
      href: '/normalize-lp',
      badge: { ja: 'マイク購入者限定', en: 'Mic Owners Only', es: 'Solo compradores', ko: '마이크 구매자 전용', pt: 'Apenas compradores' },
    },
    {
      emoji: '🔇',
      name: 'NOISE REDUCTION',
      desc: { ja: 'スペクトルノイズ除去', en: 'Spectral noise reduction', es: 'Reducción de ruido espectral', ko: '스펙트럼 노이즈 제거', pt: 'Redução de ruído espectral' },
      href: '/noise-reduction',
    },
    {
      emoji: '🎹',
      name: 'EAR TRAINING',
      desc: { ja: '音感トレーニング', en: 'Ear training exercises', es: 'Ejercicios de entrenamiento auditivo', ko: '귀 훈련', pt: 'Exercícios de treinamento auditivo' },
      href: '/ear-training-lp',
    },
    {
      emoji: '🥁',
      name: 'METRONOME',
      desc: { ja: 'プロ仕様メトロノーム', en: 'Professional metronome', es: 'Metrónomo profesional', ko: '프로 메트로놈', pt: 'Metrônomo profissional' },
      href: '/metronome-lp',
    },
    {
      emoji: '🎸',
      name: 'CHORD QUIZ',
      desc: { ja: 'コード聴き取りクイズ', en: 'Chord recognition quiz', es: 'Quiz de reconocimiento de acordes', ko: '코드 인식 퀴즈', pt: 'Quiz de reconhecimento de acordes' },
      href: '/chord-quiz-lp',
    },
  ];

  const personas = [
    {
      emoji: '🎵',
      title: { ja: '演奏家', en: 'Musicians', es: 'Músicos', ko: '연주자', pt: 'Músicos' },
      desc: { ja: '練習の記録、ラウドネス調整、音源分離。プロの現場で使われるツールが、すべて無料。', en: 'Practice logs, loudness adjustment, stem separation. Professional-grade tools, all free.', es: 'Registros de práctica, ajuste de volumen, separación de stems. Herramientas de calidad profesional, todas gratis.', ko: '연습 기록, 라우드니스 조정, 스템 분리. 전문 수준의 도구, 모두 무료.', pt: 'Registros de prática, ajuste de volume, separação de stems. Ferramentas de qualidade profissional, todas grátis.' },
    },
    {
      emoji: '🎓',
      title: { ja: '音大生', en: 'Music Students', es: 'Estudiantes de Música', ko: '음악학생', pt: 'Estudantes de Música' },
      desc: { ja: '和声分析、リズム訓練、聴音テスト。学割¥480/月で、音大4年間の成長を記録。', en: 'Harmony analysis, rhythm training, ear tests. Student plan ¥480/mo to track 4 years of growth.', es: 'Análisis de armonía, entrenamiento de ritmo, pruebas auditivas. Plan de estudiante ¥480/mes para registrar 4 años de crecimiento.', ko: '화성 분석, 리듬 훈련, 청음 테스트. 학생 플랜 ¥480/월로 4년간의 성장을 기록합니다.', pt: 'Análise de harmonia, treinamento de ritmo, testes auditivos. Plano de estudante ¥480/mês para rastrear 4 anos de crescimento.' },
    },
    {
      emoji: '🎛️',
      title: { ja: '録音エンジニア', en: 'Recording Engineers', es: 'Ingenieros de Grabación', ko: '녹음 엔지니어', pt: 'Engenheiros de Gravação' },
      desc: { ja: 'DSD変換、DDPチェッカー、マスターチェック。他にないツールが、ブラウザで動く。', en: 'DSD converter, DDP checker, master check. Tools you can\'t find anywhere else, in your browser.', es: 'Convertidor DSD, verificador DDP, verificación maestra. Herramientas que no encontrarás en ningún otro lugar, en tu navegador.', ko: 'DSD 컨버터, DDP 체커, 마스터 체크. 다른 곳에서 찾을 수 없는 도구, 브라우저에서.', pt: 'Conversor DSD, verificador DDP, verificação mestre. Ferramentas que você não encontrará em nenhum outro lugar, no seu navegador.' },
    },
    {
      emoji: '🎧',
      title: { ja: '音楽ファン', en: 'Music Fans', es: 'Aficionados a la Música', ko: '음악 팬', pt: 'Fãs de Música' },
      desc: { ja: '世界中のライブ情報、録音マップ、アーティスト発掘。音楽の新しい楽しみ方。', en: 'Live events worldwide, sound map, discover artists. A new way to enjoy music.', es: 'Eventos en vivo en todo el mundo, mapa de sonido, descubre artistas. Una nueva forma de disfrutar la música.', ko: '세계 라이브 이벤트, 사운드 맵, 아티스트 발견. 음악을 즐기는 새로운 방식.', pt: 'Eventos ao vivo em todo o mundo, mapa de som, descubra artistas. Uma nova maneira de desfrutar da música.' },
    },
  ];

  return (
    <div style={{ fontFamily: sans, color: '#1f2937' }}>
      {/* 1. HERO */}
      <section style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 'clamp(2rem, 5%, 6rem) clamp(1rem, 3%, 4rem)', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#64748b', marginBottom: '1.5rem' }}>THE PLATFORM FOR MUSICIANS</div>
        <h1 style={{ fontFamily: serif, fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 400, lineHeight: 1.2, margin: '0 0 2rem 0', maxWidth: '1000px', whiteSpace: 'pre-line', wordBreak: 'keep-all', color: '#0f172a' }}>
          {t5({ ja: 'あなたの音楽を、\n次のステージへ。', en: 'Take your music\nto the next stage.', es: 'Lleva tu música\nal siguiente nivel.', ko: '당신의 음악을\n다음 단계로.', pt: 'Leve sua música\npara o próximo nível.' }, lang)}
        </h1>
        <p style={{ fontFamily: sans, fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', color: '#64748b', maxWidth: '800px', lineHeight: 1.6, margin: '0 0 3rem 0', whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
          {t5({ ja: '15以上の無料ツール、ハンドメイドマイク、世界中の音楽家コミュニティ。\n空音開発は、音楽に生きるすべての人のためのプラットフォームです。', en: '15+ free tools, handmade microphones, a global musician community.\nKuon R&D is the platform for everyone who lives for music.', es: 'Más de 15 herramientas gratuitas, micrófonos artesanales, comunidad global.\nKuon R&D es la plataforma para quienes viven por la música.', ko: '15개 이상의 무료 도구, 핸드메이드 마이크, 글로벌 음악가 커뮤니티.\n공음개발은 음악으로 살아가는 모든 사람을 위한 플랫폼입니다.', pt: 'Mais de 15 ferramentas gratuitas, microfones artesanais, comunidade global.\nKuon R&D é a plataforma para quem vive pela música.' }, lang)}
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/auth/login" style={{ display: 'inline-block', padding: '0.875rem 2rem', background: '#0f172a', color: 'white', borderRadius: '9999px', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            {t5({ ja: '無料ではじめる', en: 'Start Free', es: 'Comenzar Gratis', ko: '무료로 시작', pt: 'Comece Grátis' }, lang)}
          </Link>
          <Link href="/audio-apps" style={{ display: 'inline-block', padding: '0.875rem 2rem', border: `2px solid ${ACCENT}`, color: ACCENT, borderRadius: '9999px', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', background: 'white', transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = ACCENT; e.currentTarget.style.transform = 'translateY(0)'; }}>
            {t5({ ja: 'アプリを体験する', en: 'Try the Apps', es: 'Probar las Aplicaciones', ko: '앱 시도', pt: 'Experimente os Aplicativos' }, lang)}
          </Link>
        </div>
      </section>

      {/* 2. TRUST BAR */}
      <section style={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '2rem clamp(1rem, 3%, 4rem)', background: 'white' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div><div style={{ fontSize: '2rem', fontWeight: 600, color: ACCENT }}>15+</div><div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>{t5({ ja: 'オーディオツール', en: 'Audio Tools', es: 'Herramientas de Audio', ko: '오디오 도구', pt: 'Ferramentas de Áudio' }, lang)}</div></div>
          <div><div style={{ fontSize: '2rem', fontWeight: 600, color: ACCENT }}>🌐</div><div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>{t5({ ja: '世界中に発送', en: 'Ships Worldwide', es: 'Envío Mundial', ko: '전 세계 배송', pt: 'Envio Mundial' }, lang)}</div></div>
          <div><div style={{ fontSize: '2rem', fontWeight: 600, color: ACCENT }}>5</div><div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>{t5({ ja: '言語対応', en: 'Languages', es: 'Idiomas', ko: '언어', pt: 'Idiomas' }, lang)}</div></div>
          <div><div style={{ fontSize: '2rem', fontWeight: 600, color: ACCENT }}>100%</div><div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>{t5({ ja: 'ブラウザ完結', en: 'Browser-Based', es: 'Basado en Navegador', ko: '브라우저 기반', pt: 'Baseado em Navegador' }, lang)}</div></div>
        </div>
      </section>

      {/* 3. WHO IS THIS FOR */}
      <section style={{ padding: 'clamp(4rem, 8%, 6rem) clamp(1rem, 3%, 4rem)', background: 'white', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, textAlign: 'center', marginBottom: '0.5rem', color: '#0f172a' }}>
          {t5({ ja: 'あなたのための場所', en: 'Built for you', es: 'Hecho para ti', ko: '당신을 위해 만들어졌습니다', pt: 'Feito para você' }, lang)}
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '3rem', fontSize: '1rem' }}>
          {t5({ ja: '音楽に関わるすべての人が、自分のステージを持つことができます。', en: 'Everyone involved in music can have their own stage.', es: 'Todos los involucrados en la música pueden tener su propio escenario.', ko: '음악에 관련된 모든 사람이 자신의 무대를 가질 수 있습니다.', pt: 'Todos os envolvidos na música podem ter seu próprio palco.' }, lang)}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {personas.map((p, idx) => (
            <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', transition: 'all 0.3s ease', cursor: 'pointer', minWidth: 0, overflow: 'hidden', boxSizing: 'border-box' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{p.emoji}</div>
              <h3 style={{ fontFamily: serif, fontSize: '1.5rem', fontWeight: 400, marginBottom: '1rem', color: '#0f172a', overflowWrap: 'anywhere' }}>{t5(p.title, lang)}</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, overflowWrap: 'anywhere', wordBreak: 'normal' }}>{t5(p.desc, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. APP SHOWCASE */}
      <section style={{ padding: 'clamp(4rem, 8%, 6rem) clamp(1rem, 3%, 4rem)', background: '#f8fafc', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, textAlign: 'center', marginBottom: '0.5rem', color: '#0f172a' }}>
          {t5({ ja: 'プロが使うツールを、あなたの手に。', en: 'Professional tools, in your hands.', es: 'Herramientas profesionales, en tus manos.', ko: '프로가 사용하는 도구를 당신의 손에.', pt: 'Ferramentas profissionais, nas suas mãos.' }, lang)}
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '3rem', fontSize: '1rem', maxWidth: '700px', margin: '0 auto 3rem', wordBreak: 'keep-all' }}>
          {t5({ ja: 'ブラウザだけで完結。ダウンロード不要で今すぐ使えます。', en: 'Everything runs in your browser. No downloads needed — start right now.', es: 'Todo se ejecuta en tu navegador. Sin descargas necesarias.', ko: '모든 것이 브라우저에서 실행됩니다. 다운로드 없이 바로 시작하세요.', pt: 'Tudo é executado no seu navegador. Sem downloads necessários.' }, lang)}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {apps.map((app, idx) => (
            <Link key={idx} href={app.href} style={{ display: 'block', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', textDecoration: 'none', color: 'inherit', transition: 'all 0.3s ease', position: 'relative' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 4px 12px rgba(2, 132, 199, 0.1)`; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}>
              {app.badge && (
                <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontSize: '0.65rem', fontWeight: 600, padding: '0.25rem 0.6rem', borderRadius: '999px', letterSpacing: '0.02em' }}>{t5(app.badge, lang)}</span>
              )}
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{app.emoji}</div>
              <h3 style={{ fontFamily: sans, fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#0f172a' }}>{app.name}</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem', wordBreak: 'keep-all' }}>{t5(app.desc, lang)}</p>
              <span style={{ color: ACCENT, fontSize: '0.875rem', fontWeight: 500 }}>→</span>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/audio-apps" style={{ color: ACCENT, textDecoration: 'none', fontSize: '1rem', fontWeight: 500 }} onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }} onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}>
            {t5({ ja: 'すべてのアプリを見る →', en: 'See all apps →', es: 'Ver todas las aplicaciones →', ko: '모든 앱 보기 →', pt: 'Ver todos os aplicativos →' }, lang)}
          </Link>
        </div>
      </section>

      {/* 5. MICROPHONE */}
      <section style={{ padding: 'clamp(4rem, 8%, 6rem) clamp(1rem, 3%, 4rem)', background: 'white', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, textAlign: 'center', marginBottom: '0.5rem', color: '#0f172a' }}>
          {t5({ ja: 'ソフトウェアだけじゃない。', en: 'Not just software.', es: 'No solo software.', ko: '소프트웨어만이 아닙니다.', pt: 'Não é apenas software.' }, lang)}
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '3rem', fontSize: '0.95rem', maxWidth: '800px', margin: '0 auto 3rem', wordBreak: 'keep-all' }}>
          {t5({ ja: '音大生だった創業者が、自分のために作ったマイク。数十万円の高級マイクと同等以上のクオリティを、手が届く価格で。', en: 'Microphones built by our founder, who was once a music student. Studio-quality at an accessible price.', es: 'Micrófonos construidos por nuestro fundador, que fue estudiante de música. Calidad de estudio a un precio accesible.', ko: '음대생이었던 우리의 창립자가 만든 마이크. 저렴한 가격에 스튜디오 품질.', pt: 'Microfones construídos pelo nosso fundador, que foi estudante de música. Qualidade de estúdio a um preço acessível.' }, lang)}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ position: 'relative', height: '280px', background: '#e2e8f0' }}>
              <Image src="/mic01.jpeg" alt="P-86S" fill style={{ objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#0284c7', color: 'white', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>BESTSELLER</div>
            </div>
            <div style={{ padding: '2rem' }}>
              <h3 style={{ fontFamily: serif, fontSize: '1.5rem', fontWeight: 400, marginBottom: '0.5rem', color: '#0f172a' }}>{t5({ ja: 'P-86S ステレオマイクロフォン', en: 'P-86S Stereo Microphone', es: 'Micrófono Estéreo P-86S', ko: 'P-86S 스테레오 마이크로폰', pt: 'Microfone Estéreo P-86S' }, lang)}</h3>
              <div style={{ fontSize: '1.875rem', fontWeight: 600, color: ACCENT, marginBottom: '1.5rem' }}>¥16,900</div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>• {t5({ ja: 'プラグインパワー対応', en: 'Plug-in power compatible', es: 'Compatible con alimentación plug-in', ko: '플러그인 전원 호환', pt: 'Compatível com alimentação plug-in' }, lang)}</li>
                <li style={{ marginBottom: '0.5rem' }}>• {t5({ ja: '1本でABステレオ', en: 'Single-body AB stereo', es: 'Estéreo AB de un solo cuerpo', ko: '단일 바디 AB 스테레오', pt: 'Estéreo AB de corpo único' }, lang)}</li>
                <li>• {t5({ ja: '手はんだ製作', en: 'Hand-soldered', es: 'Soldada a mano', ko: '손납', pt: 'Soldado à mão' }, lang)}</li>
              </ul>
              <Link href="/microphone" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: ACCENT, color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#0369a1'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)'; }}>
                {t5({ ja: '詳しく見る →', en: 'Learn more →', es: 'Aprende más →', ko: '자세히 보기 →', pt: 'Saiba mais →' }, lang)}
              </Link>
            </div>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', opacity: 0.7, transition: 'all 0.3s ease', position: 'relative' }}>
            <div style={{ position: 'relative', height: '280px', background: '#e2e8f0' }}>
              <Image src="/mic03.jpeg" alt="X-86S" fill style={{ objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#64748b', color: 'white', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>PRO</div>
            </div>
            <div style={{ padding: '2rem' }}>
              <h3 style={{ fontFamily: serif, fontSize: '1.5rem', fontWeight: 400, marginBottom: '0.5rem', color: '#0f172a' }}>{t5({ ja: 'X-86S プロフェッショナル', en: 'X-86S Professional', es: 'X-86S Profesional', ko: 'X-86S 프로페셔널', pt: 'X-86S Profissional' }, lang)}</h3>
              <div style={{ fontSize: '1.875rem', fontWeight: 600, color: ACCENT, marginBottom: '1.5rem' }}>¥39,600</div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>• {t5({ ja: 'ミニXLR端子', en: 'Mini XLR connector', es: 'Conector XLR mini', ko: '미니 XLR 커넥터', pt: 'Conector XLR mini' }, lang)}</li>
                <li style={{ marginBottom: '0.5rem' }}>• {t5({ ja: '48Vファンタム電源', en: '48V phantom power', es: 'Alimentación fantasma 48V', ko: '48V 팬텀 전원', pt: 'Alimentação fantasma 48V' }, lang)}</li>
                <li>• {t5({ ja: 'スタジオ品質', en: 'Studio quality', es: 'Calidad de estudio', ko: '스튜디오 품질', pt: 'Qualidade de estúdio' }, lang)}</li>
              </ul>
              <button style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#cbd5e1', color: '#64748b', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, border: 'none', cursor: 'not-allowed' }} disabled>
                {t5({ ja: 'Coming Soon', en: 'Coming Soon', es: 'Próximamente', ko: '곧 출시', pt: 'Em breve' }, lang)}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DISCOVER */}
      <section style={{ padding: 'clamp(4rem, 8%, 6rem) clamp(1rem, 3%, 4rem)', background: '#f8fafc', maxWidth: '1400px', margin: '0 auto', width: '100%' }} id="discover">
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, textAlign: 'center', marginBottom: '0.5rem', color: '#0f172a' }}>
          {t5({ ja: 'スカウト', en: 'Discover', es: 'Descubrir', ko: '발견', pt: 'Descobrir' }, lang)}
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '3rem', fontSize: '1rem' }}>
          {t5({ ja: '世界中の音楽、音風景、アーティストを探索する。', en: 'Explore music, soundscapes, and artists around the world.', es: 'Explora música, paisajes sonoros y artistas de todo el mundo.', ko: '세계의 음악, 음풍경, 아티스트를 탐색합니다.', pt: 'Explore música, paisagens sonoras e artistas em todo o mundo.' }, lang)}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          <Link href="/soundmap" style={{ display: 'block', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', textDecoration: 'none', color: 'inherit', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</div>
            <h3 style={{ fontFamily: serif, fontSize: '1.5rem', fontWeight: 400, marginBottom: '0.5rem', color: '#0f172a' }}>{t5({ ja: '地球の音マップ', en: 'Sound Map', es: 'Mapa de Sonido', ko: '사운드 맵', pt: 'Mapa de Som' }, lang)}</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', wordBreak: 'keep-all' }}>{t5({ ja: '世界中の音風景を探索', en: 'Explore soundscapes worldwide', es: 'Explora paisajes sonoros en todo el mundo', ko: '세계의 음풍경 탐색', pt: 'Explore paisagens sonoras em todo o mundo' }, lang)}</p>
          </Link>
          <Link href="/events-lp" style={{ display: 'block', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', textDecoration: 'none', color: 'inherit', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎪</div>
            <h3 style={{ fontFamily: serif, fontSize: '1.5rem', fontWeight: 400, marginBottom: '0.5rem', color: '#0f172a' }}>{t5({ ja: 'ライブ情報', en: 'Live Events', es: 'Eventos en Vivo', ko: '라이브 이벤트', pt: 'Eventos ao Vivo' }, lang)}</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', wordBreak: 'keep-all' }}>{t5({ ja: '近くのコンサートを見つける', en: 'Find concerts near you', es: 'Encuentra conciertos cerca de ti', ko: '근처 콘서트 찾기', pt: 'Encontre concertos perto de você' }, lang)}</p>
          </Link>
        </div>
      </section>

      {/* 7. PRICING */}
      <section style={{ padding: 'clamp(4rem, 8%, 6rem) clamp(1rem, 3%, 4rem)', background: 'white', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, textAlign: 'center', marginBottom: '0.5rem', color: '#0f172a' }}>
          {t5({ ja: 'はじめ方', en: 'Choose your plan', es: 'Elige tu plan', ko: '계획 선택', pt: 'Escolha seu plano' }, lang)}
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '3rem', fontSize: '1rem', wordBreak: 'keep-all' }}>
          {t5({ ja: 'まずは無料で。もっと使いたくなったらプランを選べます。', en: 'Start free. Upgrade when you want more.', es: 'Empieza gratis. Actualiza cuando quieras más.', ko: '무료로 시작하세요. 더 필요하면 업그레이드하세요.', pt: 'Comece grátis. Atualize quando quiser mais.' }, lang)}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2.5rem 2rem', textAlign: 'center' }}>
            <h3 style={{ fontFamily: sans, fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: '#0f172a' }}>{t5({ ja: 'Free', en: 'Free', es: 'Gratis', ko: '무료', pt: 'Gratuito' }, lang)}</h3>
            <div style={{ fontSize: '2rem', fontWeight: 600, color: ACCENT, marginBottom: '1.5rem' }}>¥0</div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', textAlign: 'left', color: '#64748b', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '0.75rem' }}>✓ {t5({ ja: 'ブラウザアプリ無制限', en: 'Unlimited browser apps', es: 'Aplicaciones de navegador ilimitadas', ko: '무제한 브라우저 앱', pt: 'Aplicativos de navegador ilimitados' }, lang)}</li>
              <li>✓ {t5({ ja: '登録不要で今すぐ使える', en: 'Use now, no signup', es: 'Úsalo ahora, sin registro', ko: '지금 사용, 가입 불필요', pt: 'Use agora, sem inscrição' }, lang)}</li>
            </ul>
            <Link href="/audio-apps" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#0f172a', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              {t5({ ja: '登録なしで今すぐ使う', en: 'Use Now — No Signup', es: 'Usar Ahora — Sin Registro', ko: '가입 없이 지금 사용', pt: 'Usar Agora — Sem Inscrição' }, lang)}
            </Link>
          </div>
          <div style={{ background: 'white', border: `2px solid ${ACCENT}`, borderRadius: '12px', padding: '2.5rem 2rem', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: ACCENT, color: 'white', padding: '0.375rem 1rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
              {t5({ ja: 'おすすめ', en: 'POPULAR', es: 'POPULAR', ko: '인기', pt: 'POPULAR' }, lang)}
            </div>
            <h3 style={{ fontFamily: sans, fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: '#0f172a' }}>{t5({ ja: 'Student', en: 'Student', es: 'Estudiante', ko: '학생', pt: 'Estudante' }, lang)}</h3>
            <div style={{ fontSize: '2rem', fontWeight: 600, color: ACCENT, marginBottom: '0.25rem' }}>¥480</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>{t5({ ja: '/月', en: '/month', es: '/mes', ko: '/월', pt: '/mês' }, lang)}</div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', textAlign: 'left', color: '#64748b', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '0.75rem' }}>✓ {t5({ ja: 'ブラウザアプリ無制限', en: 'Unlimited browser apps', es: 'Aplicaciones de navegador ilimitadas', ko: '무제한 브라우저 앱', pt: 'Aplicativos de navegador ilimitados' }, lang)}</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ {t5({ ja: 'サーバーアプリ無制限', en: 'Unlimited server apps', es: 'Aplicaciones de servidor ilimitadas', ko: '무제한 서버 앱', pt: 'Aplicativos de servidor ilimitados' }, lang)}</li>
              <li>✓ {t5({ ja: '練習ログ記録', en: 'Practice logs', es: 'Registros de práctica', ko: '연습 기록', pt: 'Registros de prática' }, lang)}</li>
            </ul>
            <Link href="/auth/login" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: ACCENT, color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#0369a1'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)'; }}>
              {t5({ ja: '登録する', en: 'Sign Up', es: 'Registrarse', ko: '가입', pt: 'Inscrever-se' }, lang)}
            </Link>
          </div>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2.5rem 2rem', textAlign: 'center' }}>
            <h3 style={{ fontFamily: sans, fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: '#0f172a' }}>{t5({ ja: 'Pro', en: 'Pro', es: 'Pro', ko: '프로', pt: 'Pro' }, lang)}</h3>
            <div style={{ fontSize: '2rem', fontWeight: 600, color: ACCENT, marginBottom: '0.25rem' }}>¥980</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>{t5({ ja: '/月', en: '/month', es: '/mes', ko: '/월', pt: '/mês' }, lang)}</div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', textAlign: 'left', color: '#64748b', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '0.75rem' }}>✓ {t5({ ja: '全機能アクセス', en: 'Full access', es: 'Acceso completo', ko: '전체 액세스', pt: 'Acesso completo' }, lang)}</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ {t5({ ja: 'ライブ投稿', en: 'Post live events', es: 'Publicar eventos en vivo', ko: '라이브 포스팅', pt: 'Postar eventos ao vivo' }, lang)}</li>
              <li>✓ {t5({ ja: '優先サポート', en: 'Priority support', es: 'Soporte prioritario', ko: '우선 지원', pt: 'Suporte prioritário' }, lang)}</li>
            </ul>
            <Link href="/auth/login" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#0f172a', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              {t5({ ja: '登録する', en: 'Sign Up', es: 'Registrarse', ko: '가입', pt: 'Inscrever-se' }, lang)}
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section style={{ padding: 'clamp(4rem, 8%, 6rem) clamp(1rem, 3%, 4rem)', background: '#f8fafc', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, textAlign: 'center', marginBottom: '3rem', color: '#0f172a' }}>
          {t5({ ja: 'よくある質問', en: 'FAQ', es: 'Preguntas Frecuentes', ko: '자주 묻는 질문', pt: 'Perguntas Frequentes' }, lang)}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => (
            <div key={idx} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <button onClick={() => setFaqOpen(faqOpen === idx ? null : idx)} style={{ width: '100%', padding: '1.5rem', background: 'white', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}>
                <span style={{ fontWeight: 500, color: '#0f172a', fontSize: '1rem' }}>{t5(faq.q, lang)}</span>
                <span style={{ color: ACCENT, fontSize: '1.2rem', transition: 'all 0.3s ease', transform: faqOpen === idx ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
              </button>
              {faqOpen === idx && (
                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, borderTop: '1px solid #e2e8f0', wordBreak: 'keep-all' }}>
                  {t5(faq.a, lang)}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. FOUNDER */}
      <section style={{ padding: 'clamp(5rem, 10%, 8rem) clamp(1rem, 3%, 4rem)', background: 'white', maxWidth: '900px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#64748b', marginBottom: '1rem', textTransform: 'uppercase' }}>Founder</p>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 400, marginBottom: '2.5rem', color: '#0f172a' }}>
          {t5({ ja: '創業者の想い', en: 'The Vision Behind Kuon R&D', es: 'La visión detrás de Kuon R&D', ko: '창립자의 비전', pt: 'A visão por trás da Kuon R&D' }, lang)}
        </h2>
        <div style={{ marginBottom: '2rem' }}>
          <Image src="/kotaro.jpeg" alt="Kotaro Asahina" width={140} height={140} style={{ borderRadius: '50%', margin: '0 auto', display: 'block', border: '3px solid #e2e8f0' }} />
        </div>
        <h3 style={{ fontFamily: serif, fontSize: '1.5rem', fontWeight: 400, marginBottom: '0.3rem', color: '#0f172a' }}>
          {t5({ ja: '朝比奈 幸太郎', en: 'Kotaro Asahina', es: 'Kotaro Asahina', ko: '아사히나 코타로', pt: 'Kotaro Asahina' }, lang)}
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '2rem', letterSpacing: '0.05em' }}>
          {t5({ ja: '音響エンジニア / マイク設計者 / 音楽プロデューサー', en: 'Audio Engineer / Microphone Designer / Music Producer', es: 'Ingeniero de Audio / Diseñador de Micrófonos / Productor Musical', ko: '오디오 엔지니어 / 마이크 설계자 / 음악 프로듀서', pt: 'Engenheiro de Áudio / Designer de Microfones / Produtor Musical' }, lang)}
        </p>
        <blockquote style={{ fontFamily: serif, fontSize: 'clamp(1rem, 2vw, 1.15rem)', lineHeight: 2.0, color: '#334155', maxWidth: '700px', margin: '0 auto 2rem', padding: '1.5rem 2rem', background: '#f8fafc', borderRadius: '12px', borderLeft: `4px solid ${ACCENT}`, textAlign: 'left', wordBreak: 'keep-all', fontStyle: 'normal' }}>
          {t5({
            ja: '世界の音楽文化が発展し、音楽家がより創造性に集中できる世界を。エンジニアがより表現に専念できるように。音楽家同士が国境を越えて繋がり、世界のあらゆる場所で文化と表現、そして何より芸術が芽を出すような世界にしたい。——その想いで空音開発を立ち上げました。',
            en: 'I want a world where musical culture thrives, where musicians can focus purely on creativity, where engineers can dedicate themselves to expression, and where artists connect across borders — so that culture, expression, and above all, art can flourish everywhere. That is why I founded Kuon R&D.',
            es: 'Quiero un mundo donde la cultura musical prospere, donde los músicos puedan concentrarse puramente en la creatividad, donde los ingenieros puedan dedicarse a la expresión, y donde los artistas se conecten más allá de las fronteras. Por eso fundé Kuon R&D.',
            ko: '음악 문화가 발전하고 음악가가 창의성에만 집중할 수 있는 세상, 엔지니어가 표현에 전념할 수 있는 세상, 국경을 넘어 음악가들이 연결되어 전 세계에서 문화와 예술이 싹틔는 세상을 만들고 싶었습니다. 그래서 공음개발을 설립했습니다.',
            pt: 'Quero um mundo onde a cultura musical prospere, onde os músicos possam focar puramente na criatividade, onde os engenheiros possam se dedicar à expressão, e onde os artistas se conectem além das fronteiras. Por isso fundei a Kuon R&D.',
          }, lang)}
        </blockquote>
        <div style={{ marginBottom: '2.5rem' }} />
        <Link href="/profile" style={{ display: 'inline-block', padding: '0.875rem 2.5rem', border: `2px solid ${ACCENT}`, color: ACCENT, borderRadius: '9999px', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', background: 'white', transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(2,132,199,0.2)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = ACCENT; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
          {t5({ ja: 'プロフィールを見る', en: 'View Full Profile', es: 'Ver Perfil Completo', ko: '프로필 보기', pt: 'Ver Perfil Completo' }, lang)}
        </Link>
      </section>

      {/* 10. FINAL CTA */}
      <section style={{ padding: 'clamp(4rem, 8%, 6rem) clamp(1rem, 3%, 4rem)', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', textAlign: 'center', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, marginBottom: '2rem', color: '#0f172a', wordBreak: 'keep-all' }}>
          {t5({ ja: '音楽の、いちばん近くに。', en: 'Closer to music than ever.', es: 'Más cerca de la música que nunca.', ko: '음악과 더 가깝게.', pt: 'Mais perto da música do que nunca.' }, lang)}
        </h2>
        <Link href="/auth/login" style={{ display: 'inline-block', padding: '0.875rem 2rem', background: '#0f172a', color: 'white', borderRadius: '9999px', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.transform = 'translateY(0)'; }}>
          {t5({ ja: '無料ではじめる', en: 'Start Free', es: 'Comenzar Gratis', ko: '무료로 시작', pt: 'Comece Grátis' }, lang)}
        </Link>
      </section>

      {/* 11. CONTACT */}
      <section style={{ padding: 'clamp(4rem, 8%, 6rem) clamp(1rem, 3%, 4rem)', background: 'white', maxWidth: '900px', margin: '0 auto', width: '100%' }} id="contact">
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 400, textAlign: 'center', marginBottom: '2rem', color: '#0f172a' }}>
          {t5({ ja: 'お問い合わせ', en: 'Contact', es: 'Contacto', ko: '문의', pt: 'Contato' }, lang)}
        </h2>
        <form action="https://formspree.io/f/xyknanzy" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#0f172a', fontWeight: 500, fontSize: '0.95rem' }}>
              {t5({ ja: 'お名前', en: 'Name', es: 'Nombre', ko: '이름', pt: 'Nome' }, lang)}
            </label>
            <input type="text" name="name" required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.95rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#0f172a', fontWeight: 500, fontSize: '0.95rem' }}>
              {t5({ ja: 'メールアドレス', en: 'Email', es: 'Correo Electrónico', ko: '이메일', pt: 'E-mail' }, lang)}
            </label>
            <input type="email" name="email" required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.95rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#0f172a', fontWeight: 500, fontSize: '0.95rem' }}>
              {t5({ ja: 'メッセージ', en: 'Message', es: 'Mensaje', ko: '메시지', pt: 'Mensagem' }, lang)}
            </label>
            <textarea name="message" required rows={5} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.95rem', boxSizing: 'border-box', fontFamily: sans }} />
          </div>
          <button type="submit" style={{ padding: '0.875rem 2rem', background: ACCENT, color: 'white', borderRadius: '6px', border: 'none', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#0369a1'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)'; }}>
            {t5({ ja: '送信', en: 'Send', es: 'Enviar', ko: '전송', pt: 'Enviar' }, lang)}
          </button>
        </form>
      </section>

      <div style={{ height: '2rem' }} />
    </div>
  );
};

export default HomePage;
