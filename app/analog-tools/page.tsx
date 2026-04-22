'use client';

import React from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type L5 = Partial<Record<Lang, string>> & { en: string };

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#d97706';
const ACCENT_DEEP = '#78350f';
const BG = '#fefbf6';

interface Tool {
  id: string;
  href: string;
  name: L5;
  tagline: L5;
  desc: L5;
  glyph: string;
}

const TOOLS: Tool[] = [
  {
    id: 'tape-remaining',
    href: '/analog-tools/tape-remaining',
    name: { ja: 'リール残量計算機', en: 'Reel Remaining Calculator', ko: '릴 잔량 계산기', pt: 'Calculadora de Fita Restante', es: 'Calculadora de Cinta Restante' },
    tagline: {
      ja: '巻き厚を測って、残り時間を知る。',
      en: 'Measure the wind, know the time.',
      ko: '감긴 두께로 잔여 시간을 계산합니다.',
      pt: 'Meça a espessura, saiba o tempo.',
      es: 'Mide el grosor, conoce el tiempo.',
    },
    desc: {
      ja: 'NAB/CCIR/7号/10号のハブ径に対応。Standard/LP/DP/Tripleの4厚み。断面をSVGでリアルタイム可視化。',
      en: 'Supports NAB/CCIR/7"/10" hubs. Standard/LP/DP/Triple tape thicknesses. Real-time SVG cross-section.',
      ko: 'NAB/CCIR/7호/10호 허브 직경 지원. Standard/LP/DP/Triple 4가지 두께. SVG 단면 실시간 시각화.',
      pt: 'Suporta cubos NAB/CCIR/7"/10". Espessuras Standard/LP/DP/Triple. Visualização SVG em tempo real.',
      es: 'Soporta cubos NAB/CCIR/7"/10". Grosores Standard/LP/DP/Triple. Visualización SVG en tiempo real.',
    },
    glyph: '◎',
  },
  {
    id: 'tape-time',
    href: '/analog-tools/tape-time',
    name: { ja: 'テープ録音時間計算機', en: 'Tape Recording Time', ko: '테이프 녹음 시간 계산기', pt: 'Tempo de Gravação em Fita', es: 'Tiempo de Grabación en Cinta' },
    tagline: {
      ja: 'テープ長から録音時間を算出。',
      en: 'Length to time, instantly.',
      ko: '테이프 길이로 녹음 시간 계산.',
      pt: 'Comprimento para tempo, instantâneo.',
      es: 'Longitud a tiempo, al instante.',
    },
    desc: {
      ja: 'ft/m/cm三方向入力。1200/1800/2500/3600/4800ftプリセット。両面合計も表示。',
      en: 'Input in ft/m/cm. Presets for 1200/1800/2500/3600/4800 ft. Double-sided total.',
      ko: 'ft/m/cm 3방향 입력. 1200/1800/2500/3600/4800ft 프리셋. 양면 합계도 표시.',
      pt: 'Entrada em ft/m/cm. Presets 1200/1800/2500/3600/4800 ft. Total dos dois lados.',
      es: 'Entrada en ft/m/cm. Presets 1200/1800/2500/3600/4800 ft. Total de ambos lados.',
    },
    glyph: '⏱',
  },
  {
    id: 'speed-cal',
    href: '/analog-tools/speed-cal',
    name: { ja: 'アナログ機キャリブレーション', en: 'Speed Calibration', ko: '아날로그기 속도 보정', pt: 'Calibração de Velocidade', es: 'Calibración de Velocidad' },
    tagline: {
      ja: 'Revox / Studer / Otari / Tascamの速度校正。',
      en: 'Revox, Studer, Otari, Tascam — all in one.',
      ko: 'Revox / Studer / Otari / Tascam 속도 교정.',
      pt: 'Revox / Studer / Otari / Tascam — tudo em um.',
      es: 'Revox / Studer / Otari / Tascam — todo en uno.',
    },
    desc: {
      ja: 'B77 / A77 / PR99 / A700 / Studer A80 / A810 / Otari MX-5050 / Tascam 38-2対応。チェックポイント周期μsと周波数Hzを同時算出。',
      en: 'B77 / A77 / PR99 / A700 / Studer A80 / A810 / Otari MX-5050 / Tascam 38-2. Computes checkpoint period (μs) and frequency (Hz).',
      ko: 'B77 / A77 / PR99 / A700 / Studer A80 / A810 / Otari MX-5050 / Tascam 38-2 지원. 체크포인트 주기 μs와 주파수 Hz 동시 산출.',
      pt: 'B77 / A77 / PR99 / A700 / Studer A80 / A810 / Otari MX-5050 / Tascam 38-2. Calcula período (μs) e frequência (Hz).',
      es: 'B77 / A77 / PR99 / A700 / Studer A80 / A810 / Otari MX-5050 / Tascam 38-2. Calcula período (μs) y frecuencia (Hz).',
    },
    glyph: '⟳',
  },
  {
    id: 'jazz-time',
    href: '/analog-tools/jazz-time',
    name: { ja: '演奏時間計算機', en: 'Performance Time Calculator', ko: '연주 시간 계산기', pt: 'Calculadora de Tempo de Performance', es: 'Calculadora de Tiempo de Actuación' },
    tagline: {
      ja: 'BPMと構成から、正確な演奏時間を。',
      en: 'Exact performance time from BPM and form.',
      ko: 'BPM과 구성으로 정확한 연주 시간을.',
      pt: 'Tempo exato a partir de BPM e forma.',
      es: 'Tiempo exacto a partir del BPM y la forma.',
    },
    desc: {
      ja: '4/4・3/4・5/4・6/8・7/8・12/8の変拍子対応。イントロ／テーマ／ソロ／エンディング個別設定。テープ残量超過を警告。',
      en: 'Supports 4/4, 3/4, 5/4, 6/8, 7/8, 12/8. Separate intro / theme / solo / ending. Warns if exceeds tape remaining.',
      ko: '4/4·3/4·5/4·6/8·7/8·12/8 변박자 지원. 인트로·테마·솔로·엔딩 별도 설정. 테이프 잔량 초과 경고.',
      pt: 'Suporta 4/4, 3/4, 5/4, 6/8, 7/8, 12/8. Intro / tema / solo / final separados. Alerta se exceder a fita restante.',
      es: 'Soporta 4/4, 3/4, 5/4, 6/8, 7/8, 12/8. Intro / tema / solo / final separados. Alerta si excede la cinta restante.',
    },
    glyph: '♩',
  },
  {
    id: 'dbu-volt',
    href: '/analog-tools/dbu-volt',
    name: { ja: '電圧⇔dB 変換機', en: 'Voltage ⇔ dB Converter', ko: '전압 ⇔ dB 변환기', pt: 'Conversor Tensão ⇔ dB', es: 'Conversor Voltaje ⇔ dB' },
    tagline: {
      ja: 'dBu/dBV/dBm/Vrms/Vpp/Vpの6軸相互変換。',
      en: '6-axis bidirectional: dBu/dBV/dBm/Vrms/Vpp/Vp.',
      ko: 'dBu/dBV/dBm/Vrms/Vpp/Vp 6축 상호 변환.',
      pt: 'Conversão bidirecional 6 eixos: dBu/dBV/dBm/Vrms/Vpp/Vp.',
      es: 'Conversión bidireccional 6 ejes: dBu/dBV/dBm/Vrms/Vpp/Vp.',
    },
    desc: {
      ja: '負荷インピーダンス（600Ω/150Ω/50Ω）指定可。0dBu / +4dBu / +6dBu / −10dBV プリセット。ミリバル/テスター読み替え用。',
      en: 'Load impedance (600Ω/150Ω/50Ω) selectable. 0dBu / +4dBu / +6dBu / −10dBV presets. For millivoltmeter/tester crossreference.',
      ko: '부하 임피던스(600Ω/150Ω/50Ω) 선택 가능. 0dBu / +4dBu / +6dBu / −10dBV 프리셋. 밀리바르·테스터 환산용.',
      pt: 'Impedância de carga (600Ω/150Ω/50Ω) selecionável. Presets 0dBu / +4dBu / +6dBu / −10dBV. Para referência de milivoltímetro/tester.',
      es: 'Impedancia de carga (600Ω/150Ω/50Ω) seleccionable. Presets 0dBu / +4dBu / +6dBu / −10dBV. Para referencia de milivoltímetro/tester.',
    },
    glyph: '⚡',
  },
];

const T = {
  hero1: { ja: 'アナログの現場に、', en: 'Precision calculators for', ko: '아날로그 현장에,', pt: 'No local de trabalho analógico,', es: 'En el lugar de trabajo analógico,' } as L5,
  hero2: { ja: '正確な数字を。', en: 'the analog workflow.', ko: '정확한 숫자를.', pt: 'números precisos.', es: 'números precisos.' } as L5,
  lead: {
    ja: 'オープンリールテープ、ヴィンテージアナログ機材、録音現場。感覚に頼らず、プロフェッショナルな判断を数値で裏付ける計算機を5本。',
    en: 'Open-reel tape, vintage analog gear, the recording floor. Five calculators that back up your professional decisions with numbers — not guesswork.',
    ko: '오픈 릴 테이프, 빈티지 아날로그 장비, 녹음 현장. 감각에 의존하지 않고 프로의 판단을 수치로 뒷받침하는 계산기 5종.',
    pt: 'Fita de rolo aberto, equipamento analógico vintage, o chão do estúdio. Cinco calculadoras que apoiam suas decisões profissionais com números.',
    es: 'Cinta de carrete abierto, equipo analógico vintage, la sala de grabación. Cinco calculadoras que respaldan tus decisiones profesionales con números.',
  } as L5,
  tools: { ja: '収録ツール', en: 'Tools', ko: '수록 도구', pt: 'Ferramentas', es: 'Herramientas' } as L5,
  open: { ja: '開く →', en: 'Open →', ko: '열기 →', pt: 'Abrir →', es: 'Abrir →' } as L5,
  coming: { ja: 'まもなく追加', en: 'Coming soon', ko: '곧 추가', pt: 'Em breve', es: 'Próximamente' } as L5,
  comingDesc: {
    ja: 'Revoxレストアアプリ（マニュアルPDFからコンデンサー情報をビジュアル表示）を次フェーズで実装予定。',
    en: 'A Revox restoration app (visualizing capacitor data from service manual PDFs) ships in the next phase.',
    ko: 'Revox 복원 앱(서비스 매뉴얼 PDF에서 커패시터 정보를 시각화)을 다음 단계에서 구현 예정.',
    pt: 'Um aplicativo de restauração Revox (visualização de dados de capacitores a partir de PDFs de manuais) na próxima fase.',
    es: 'Una app de restauración Revox (visualización de datos de capacitores desde PDFs de manuales) en la próxima fase.',
  } as L5,
  back: { ja: '← 全アプリに戻る', en: '← All apps', ko: '← 모든 앱', pt: '← Todos os apps', es: '← Todas las apps' } as L5,
};

export default function AnalogToolsHub() {
  const { lang } = useLang();
  const t = (k: keyof typeof T): string => T[k][lang] ?? T[k].en;
  const l5 = (v: L5) => v[lang] ?? v.en;

  return (
    <div style={{
      fontFamily: sans,
      backgroundColor: BG,
      minHeight: '100vh',
      color: '#1c1917',
      padding: 'clamp(16px, 4vw, 32px)',
      backgroundImage: 'radial-gradient(circle at 20% 0%, rgba(217,119,6,0.08) 0%, transparent 40%), radial-gradient(circle at 80% 100%, rgba(120,53,15,0.06) 0%, transparent 45%)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/audio-apps" style={{
          display: 'inline-block',
          fontSize: 'clamp(12px, 2vw, 13px)',
          color: ACCENT_DEEP,
          textDecoration: 'none',
          marginBottom: 'clamp(24px, 4vw, 40px)',
          opacity: 0.7,
        }}>
          {t('back')}
        </Link>

        {/* HERO */}
        <header style={{ marginBottom: 'clamp(40px, 8vw, 80px)', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            fontFamily: serif,
            fontSize: 'clamp(11px, 1.8vw, 13px)',
            letterSpacing: '0.4em',
            color: ACCENT,
            marginBottom: 24,
            textTransform: 'uppercase',
          }}>
            Kuon R&amp;D · Analog Tools
          </div>
          <h1 style={{
            fontFamily: serif,
            fontSize: 'clamp(32px, 7vw, 64px)',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: 0,
            color: ACCENT_DEEP,
          }}>
            {t('hero1')}<br />{t('hero2')}
          </h1>
          <p style={{
            fontFamily: serif,
            fontSize: 'clamp(14px, 2.4vw, 17px)',
            lineHeight: 1.85,
            marginTop: 32,
            color: '#44403c',
            maxWidth: 640,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            {t('lead')}
          </p>
        </header>

        {/* TOOLS GRID */}
        <section style={{ marginBottom: 'clamp(60px, 10vw, 100px)' }}>
          <h2 style={{
            fontFamily: serif,
            fontSize: 'clamp(20px, 3vw, 26px)',
            fontWeight: 600,
            color: ACCENT_DEEP,
            marginBottom: 24,
            borderBottom: `2px solid ${ACCENT}`,
            paddingBottom: 12,
          }}>
            {t('tools')}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: 'clamp(16px, 3vw, 24px)',
          }}>
            {TOOLS.map(tool => (
              <Link key={tool.id} href={tool.href} style={{
                display: 'flex',
                flexDirection: 'column',
                padding: 'clamp(20px, 3vw, 28px)',
                backgroundColor: '#fff',
                border: '1px solid rgba(217,119,6,0.18)',
                borderRadius: 6,
                textDecoration: 'none',
                color: 'inherit',
                boxShadow: '0 1px 3px rgba(120,53,15,0.06)',
                transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(120,53,15,0.10)';
                e.currentTarget.style.borderColor = ACCENT;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(120,53,15,0.06)';
                e.currentTarget.style.borderColor = 'rgba(217,119,6,0.18)';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                  <div style={{
                    width: 42, height: 42,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(217,119,6,0.10)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                    color: ACCENT,
                    flexShrink: 0,
                  }}>
                    {tool.glyph}
                  </div>
                  <h3 style={{
                    fontFamily: serif,
                    fontSize: 'clamp(15px, 2.2vw, 17px)',
                    fontWeight: 700,
                    margin: 0,
                    color: ACCENT_DEEP,
                    letterSpacing: '-0.01em',
                  }}>
                    {l5(tool.name)}
                  </h3>
                </div>
                <p style={{
                  fontFamily: serif,
                  fontSize: 13,
                  color: ACCENT,
                  margin: '0 0 10px 0',
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                }}>
                  {l5(tool.tagline)}
                </p>
                <p style={{
                  fontSize: 13,
                  color: '#57534e',
                  lineHeight: 1.65,
                  flexGrow: 1,
                  margin: 0,
                }}>
                  {l5(tool.desc)}
                </p>
                <div style={{
                  fontFamily: serif,
                  fontSize: 13,
                  color: ACCENT,
                  marginTop: 16,
                  fontWeight: 600,
                }}>
                  {t('open')}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* COMING SOON */}
        <section style={{
          padding: 'clamp(24px, 4vw, 36px)',
          backgroundColor: 'rgba(217,119,6,0.06)',
          borderLeft: `4px solid ${ACCENT}`,
          borderRadius: '0 6px 6px 0',
          marginBottom: 'clamp(40px, 8vw, 80px)',
        }}>
          <div style={{
            fontFamily: serif,
            fontSize: 11,
            letterSpacing: '0.3em',
            color: ACCENT,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            {t('coming')}
          </div>
          <h3 style={{
            fontFamily: serif,
            fontSize: 'clamp(18px, 2.6vw, 22px)',
            color: ACCENT_DEEP,
            margin: '0 0 10px 0',
          }}>
            KUON REVOX RESTORE
          </h3>
          <p style={{
            fontSize: 14,
            color: '#57534e',
            lineHeight: 1.75,
            margin: 0,
          }}>
            {t('comingDesc')}
          </p>
        </section>
      </div>
    </div>
  );
}
