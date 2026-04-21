'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L5 = Record<Lang, string>;

/**
 * RegistrationNudge — Canva-style soft wall
 *
 * Shows a beautiful overlay when a non-logged-in user tries to access
 * a "premium convenience" feature (save, download, history, etc.)
 *
 * The user has ALREADY experienced the value — we're not blocking first use,
 * we're making repeated use more convenient with an account.
 *
 * Usage:
 *   const [showNudge, setShowNudge] = useState(false);
 *   // In your download/save handler:
 *   if (!isLoggedIn) { setShowNudge(true); return; }
 *   // In JSX:
 *   <RegistrationNudge show={showNudge} onClose={() => setShowNudge(false)} feature="download" />
 */

type NudgeFeature =
  | 'download'      // WAV/MP3 download (MASTER CHECK, RESAMPLER, CONVERTER)
  | 'history'       // Score history / practice log (EAR TRAINING, CHORD QUIZ, INTERVAL SPEED)
  | 'presets'       // Save presets / favorites (TRANSPOSER, METRONOME)
  | 'advanced'      // Advanced features (metric modulation, etc.)
  | 'share'         // Share results
  | 'general';      // Generic

const FEATURE_CONFIG: Record<NudgeFeature, { icon: string; title: L5; description: L5; benefits: L5[] }> = {
  download: {
    icon: '⬇',
    title: {
      ja: '処理結果をダウンロード',
      en: 'Download Your Results',
      ko: '처리 결과 다운로드',
      pt: 'Baixe seus resultados',
      es: 'Descarga tus resultados',
    },
    description: {
      ja: '無料アカウントを作成すると、処理した音声ファイルをダウンロードできます。',
      en: 'Create a free account to download your processed audio files.',
      ko: '무료 계정을 만들면 처리된 오디오 파일을 다운로드할 수 있습니다.',
      pt: 'Crie uma conta gratuita para baixar seus arquivos processados.',
      es: 'Crea una cuenta gratuita para descargar tus archivos procesados.',
    },
    benefits: [
      { ja: '処理結果をWAV/MP3でダウンロード', en: 'Download results as WAV/MP3', ko: 'WAV/MP3로 결과 다운로드', pt: 'Baixe resultados em WAV/MP3', es: 'Descarga resultados en WAV/MP3' },
      { ja: '処理履歴を30日間保存', en: '30-day processing history', ko: '30일간 처리 이력 저장', pt: 'Historico de 30 dias', es: 'Historial de 30 dias' },
      { ja: '全アプリで設定を同期', en: 'Sync settings across all apps', ko: '모든 앱에서 설정 동기화', pt: 'Sincronize configuracoes', es: 'Sincroniza configuraciones' },
    ],
  },
  history: {
    icon: '📊',
    title: {
      ja: 'あなたの成長を記録する',
      en: 'Track Your Growth',
      ko: '당신의 성장을 기록하세요',
      pt: 'Acompanhe seu crescimento',
      es: 'Registra tu crecimiento',
    },
    description: {
      ja: '無料アカウントで練習スコアを記録し、成長グラフを確認できます。',
      en: 'Create a free account to save your scores and see your growth over time.',
      ko: '무료 계정으로 연습 점수를 기록하고 성장 그래프를 확인하세요.',
      pt: 'Crie uma conta gratuita para salvar suas pontuacoes e ver seu progresso.',
      es: 'Crea una cuenta gratuita para guardar tus puntuaciones y ver tu progreso.',
    },
    benefits: [
      { ja: 'スコア履歴と成長グラフ', en: 'Score history & growth charts', ko: '점수 이력 및 성장 그래프', pt: 'Historico e graficos de progresso', es: 'Historial y graficos de progreso' },
      { ja: '過去のベストスコアを記録', en: 'Track your personal bests', ko: '개인 최고 기록 추적', pt: 'Acompanhe seus melhores resultados', es: 'Registra tus mejores marcas' },
      { ja: '週間・月間レポート', en: 'Weekly & monthly reports', ko: '주간 및 월간 리포트', pt: 'Relatorios semanais e mensais', es: 'Reportes semanales y mensuales' },
    ],
  },
  presets: {
    icon: '⭐',
    title: {
      ja: '設定を保存する',
      en: 'Save Your Presets',
      ko: '설정 저장하기',
      pt: 'Salve suas configuracoes',
      es: 'Guarda tus configuraciones',
    },
    description: {
      ja: '無料アカウントでよく使う設定を保存し、次回すぐに呼び出せます。',
      en: 'Create a free account to save your favorite settings and recall them instantly.',
      ko: '무료 계정으로 자주 사용하는 설정을 저장하고 즉시 불러올 수 있습니다.',
      pt: 'Crie uma conta gratuita para salvar suas configuracoes favoritas.',
      es: 'Crea una cuenta gratuita para guardar tus configuraciones favoritas.',
    },
    benefits: [
      { ja: '楽器プリセットの保存', en: 'Save instrument presets', ko: '악기 프리셋 저장', pt: 'Salve presets de instrumentos', es: 'Guarda presets de instrumentos' },
      { ja: 'お気に入り設定をクラウドに同期', en: 'Cloud sync your favorites', ko: '즐겨찾기를 클라우드에 동기화', pt: 'Sincronize favoritos na nuvem', es: 'Sincroniza favoritos en la nube' },
      { ja: 'どのデバイスからでもアクセス', en: 'Access from any device', ko: '어떤 기기에서든 접근', pt: 'Acesse de qualquer dispositivo', es: 'Accede desde cualquier dispositivo' },
    ],
  },
  advanced: {
    icon: '🔓',
    title: {
      ja: '高度な機能を解放する',
      en: 'Unlock Advanced Features',
      ko: '고급 기능 잠금 해제',
      pt: 'Desbloqueie recursos avancados',
      es: 'Desbloquea funciones avanzadas',
    },
    description: {
      ja: '無料アカウントでこの機能が使えるようになります。',
      en: 'Create a free account to unlock this feature.',
      ko: '무료 계정을 만들면 이 기능을 사용할 수 있습니다.',
      pt: 'Crie uma conta gratuita para desbloquear este recurso.',
      es: 'Crea una cuenta gratuita para desbloquear esta funcion.',
    },
    benefits: [
      { ja: 'メトリック・モジュレーション計算', en: 'Metric modulation calculator', ko: '미터 변조 계산기', pt: 'Calculadora de modulacao metrica', es: 'Calculadora de modulacion metrica' },
      { ja: '高度な分析ツール', en: 'Advanced analysis tools', ko: '고급 분석 도구', pt: 'Ferramentas de analise avancadas', es: 'Herramientas de analisis avanzadas' },
      { ja: 'プロフェッショナル設定', en: 'Professional settings', ko: '전문가 설정', pt: 'Configuracoes profissionais', es: 'Configuraciones profesionales' },
    ],
  },
  share: {
    icon: '🔗',
    title: {
      ja: '結果を共有する',
      en: 'Share Your Results',
      ko: '결과 공유하기',
      pt: 'Compartilhe seus resultados',
      es: 'Comparte tus resultados',
    },
    description: {
      ja: '無料アカウントで分析結果をリンクで共有できます。',
      en: 'Create a free account to share your analysis results via link.',
      ko: '무료 계정으로 분석 결과를 링크로 공유할 수 있습니다.',
      pt: 'Crie uma conta gratuita para compartilhar seus resultados por link.',
      es: 'Crea una cuenta gratuita para compartir tus resultados por enlace.',
    },
    benefits: [
      { ja: '分析結果をリンクで共有', en: 'Share results via link', ko: '링크로 결과 공유', pt: 'Compartilhe por link', es: 'Comparte por enlace' },
      { ja: 'SNSにワンクリック投稿', en: 'One-click social sharing', ko: 'SNS에 원클릭 공유', pt: 'Compartilhamento social com um clique', es: 'Compartir en redes sociales con un clic' },
      { ja: '自分のプロフィールに掲載', en: 'Feature on your profile', ko: '프로필에 게시', pt: 'Exiba em seu perfil', es: 'Muestra en tu perfil' },
    ],
  },
  general: {
    icon: '✨',
    title: {
      ja: '無料アカウントで もっと便利に',
      en: 'Get More with a Free Account',
      ko: '무료 계정으로 더 편리하게',
      pt: 'Faca mais com uma conta gratuita',
      es: 'Haz mas con una cuenta gratuita',
    },
    description: {
      ja: '10秒で登録完了。パスワード不要。',
      en: 'Sign up in 10 seconds. No password needed.',
      ko: '10초면 가입 완료. 비밀번호 불필요.',
      pt: 'Cadastre-se em 10 segundos. Sem senha.',
      es: 'Registrate en 10 segundos. Sin contrasena.',
    },
    benefits: [
      { ja: '全アプリの設定を保存', en: 'Save settings across all apps', ko: '모든 앱 설정 저장', pt: 'Salve configuracoes de todos os apps', es: 'Guarda configuraciones de todas las apps' },
      { ja: '練習スコアの成長グラフ', en: 'Practice score growth charts', ko: '연습 점수 성장 그래프', pt: 'Graficos de progresso de pratica', es: 'Graficos de progreso de practica' },
      { ja: '処理結果のダウンロード', en: 'Download processing results', ko: '처리 결과 다운로드', pt: 'Baixe resultados de processamento', es: 'Descarga resultados de procesamiento' },
    ],
  },
};

interface Props {
  show: boolean;
  onClose: () => void;
  feature?: NudgeFeature;
}

export function RegistrationNudge({ show, onClose, feature = 'general' }: Props) {
  const { lang } = useLang();
  const config = FEATURE_CONFIG[feature];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // Small delay for animation
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 400, width: '100%',
          background: '#fff', borderRadius: 20,
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
          transition: 'transform 0.35s cubic-bezier(0.2,0.8,0.4,1)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 12, right: 14,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.2rem', color: '#aaa', lineHeight: 1,
            padding: 4,
          }}
          aria-label="Close"
        >
          ×
        </button>

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.2rem', fontSize: '1.6rem',
        }}>
          {config.icon}
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: sans, fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
          fontWeight: 600, textAlign: 'center', color: '#111',
          marginBottom: '0.5rem', lineHeight: 1.4,
        }}>
          {config.title[lang]}
        </h2>

        {/* Description */}
        <p style={{
          fontFamily: sans, fontSize: '0.82rem',
          color: '#666', textAlign: 'center', lineHeight: 1.7,
          marginBottom: '1.2rem',
        }}>
          {config.description[lang]}
        </p>

        {/* Benefits */}
        <div style={{
          background: '#f8fafc', borderRadius: 12,
          padding: '0.9rem 1rem', marginBottom: '1.5rem',
        }}>
          {config.benefits.map((b, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.35rem 0',
              fontSize: '0.78rem', fontFamily: sans, color: '#444',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="7" cy="7" r="7" fill="#e0f2fe" />
                <path d="M4 7L6 9L10 5" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {b[lang]}
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/auth/login"
          style={{
            display: 'block', width: '100%', textAlign: 'center',
            padding: '0.9rem', borderRadius: 50,
            background: ACCENT, color: '#fff',
            fontFamily: sans, fontSize: '0.92rem',
            fontWeight: 600, letterSpacing: '0.06em',
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(2,132,199,0.3)',
            transition: 'opacity 0.2s',
          }}
        >
          {lang === 'ja' ? '無料で登録する（10秒）' :
           lang === 'ko' ? '무료 가입하기 (10초)' :
           lang === 'pt' ? 'Cadastre-se gratis (10s)' :
           lang === 'es' ? 'Registrate gratis (10s)' :
           'Sign Up Free (10 seconds)'}
        </Link>

        {/* Secondary: continue without account */}
        <button
          onClick={onClose}
          style={{
            display: 'block', width: '100%', marginTop: '0.7rem',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: sans, fontSize: '0.75rem', color: '#999',
            padding: '0.5rem', textAlign: 'center',
          }}
        >
          {lang === 'ja' ? '今はスキップ' :
           lang === 'ko' ? '나중에 할게요' :
           lang === 'pt' ? 'Pular por enquanto' :
           lang === 'es' ? 'Omitir por ahora' :
           'Skip for now'}
        </button>
      </div>
    </div>
  );
}

/**
 * useRegistrationNudge — Hook for easy integration
 *
 * Returns { isLoggedIn, showNudge, setShowNudge, guardAction }
 *
 * Usage:
 *   const { guardAction, showNudge, setShowNudge } = useRegistrationNudge();
 *
 *   // In your handler:
 *   const handleDownload = () => {
 *     if (guardAction()) return; // returns true if nudge was shown (user not logged in)
 *     // ... proceed with download
 *   };
 *
 *   // In JSX:
 *   <RegistrationNudge show={showNudge} onClose={() => setShowNudge(false)} feature="download" />
 */
export function useRegistrationNudge() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNudge, setShowNudge] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('kuon_user'));
  }, []);

  const guardAction = () => {
    if (isLoggedIn) return false; // proceed
    setShowNudge(true);
    return true; // blocked, nudge shown
  };

  return { isLoggedIn, showNudge, setShowNudge, guardAction };
}
