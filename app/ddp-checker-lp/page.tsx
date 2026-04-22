'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
type L3 = Partial<Record<Lang, string>> & { en: string };
const ACCENT = '#0284c7';
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", "Consolas", monospace';

// ─────────────────────────────────────────────
// i18n — full LP copy
// ─────────────────────────────────────────────
const T = {
  // ── Hero ──
  heroBadge: { ja: 'FREE BROWSER TOOL', en: 'FREE BROWSER TOOL', es: 'HERRAMIENTA GRATUITA', ko: 'FREE BROWSER TOOL' } as L3,
  heroTitle: {
    ja: 'DDPファイルの中身、\nもう高額ソフトなしで確認できます。',
    en: 'Check your DDP files.\nNo expensive software needed.',
    es: 'Verifica tus archivos DDP.\nSin software costoso.',
    ko: 'DDP 파일의 내용을\n이제 비싼 소프트웨어 없이 확인할 수 있습니다.',
  } as L3,
  heroSub: {
    ja: 'マスタリングエンジニアから届いたDDPファイルセット。\n中身を確認したいだけなのに、数万円のソフトが必要？\nもう、その時代は終わりました。',
    en: 'Your mastering engineer just sent you a DDP fileset.\nYou just want to verify the contents — but you need software that costs hundreds?\nNot anymore.',
    es: 'Tu ingeniero de masterización te envió un DDP.\nSolo quieres verificar el contenido, ¿pero necesitas software de cientos de dólares?\nYa no.',
    ko: '마스터링 엔지니어가 보낸 DDP 파일 세트.\n내용을 확인하고 싶을 뿐인데 수백 달러짜리 소프트웨어가 필요합니까?\n더 이상은 아닙니다.',
  } as L3,
  heroCta: {
    ja: '今すぐ無料でDDPを確認する',
    en: 'Check Your DDP — Free',
    es: 'Verificar DDP — Gratis',
    ko: 'DDP 검증하기 — 무료',
  } as L3,
  heroCtaSub: {
    ja: 'インストール不要・ブラウザだけで完結',
    en: 'No install required — works entirely in your browser',
    es: 'Sin instalación — funciona completamente en tu navegador',
    ko: '설치 불필요 — 브라우저에서 완전히 작동',
  } as L3,

  // ── Problem ──
  problemLabel: { ja: 'THE PROBLEM', en: 'THE PROBLEM', es: 'EL PROBLEMA', ko: 'THE PROBLEM' } as L3,
  problemTitle: {
    ja: 'DDPの中身を確認する。\nたったそれだけのことが、\nなぜこんなに難しいのか。',
    en: 'Just checking what\'s inside a DDP.\nWhy is that so hard?',
    es: 'Solo verificar el contenido de un DDP.\n¿Por qué es tan difícil?',
    ko: 'DDP 내부만 확인합니다.\n왜 이렇게 어렵습니까?',
  } as L3,
  painPoints: [
    {
      icon: '💸',
      title: {
        ja: '高額な専用ソフト',
        en: 'Expensive dedicated software',
        es: 'Software dedicado costoso',
        ko: '비싼 전용 소프트웨어',
      } as L3,
      desc: {
        ja: 'HOFA DDP Player、Sonoris DDP Creator——DDPを確認できるソフトは、どれも数万円〜数十万円。「中身を見たいだけ」なのに、その投資は見合わない。',
        en: 'HOFA DDP Player, Sonoris DDP Creator — every tool that reads DDP files costs hundreds to thousands of dollars. Just to check if the tracks are there.',
        es: 'HOFA DDP Player, Sonoris DDP Creator — cada herramienta que lee archivos DDP cuesta cientos a miles de dólares. Solo para verificar si las pistas están ahí.',
        ko: 'HOFA DDP Player, Sonoris DDP Creator — DDP 파일을 읽을 수 있는 모든 도구는 수백에서 수천 달러의 비용이 듭니다. 단지 트랙이 있는지 확인하기 위해서요.',
      } as L3,
    },
    {
      icon: '🖥️',
      title: {
        ja: 'インストールの手間',
        en: 'Installation hassle',
        es: 'Molestia de instalación',
        ko: '설치 번거로움',
      } as L3,
      desc: {
        ja: 'ダウンロード、ライセンス認証、OS互換性の確認——DDPを一回確認するためだけに、この手順を踏む必要がある。',
        en: 'Download, license activation, OS compatibility — all these steps just to verify a DDP once.',
        es: 'Descarga, activación de licencia, compatibilidad del SO — todos estos pasos solo para verificar un DDP una vez.',
        ko: '다운로드, 라이선스 활성화, OS 호환성 확인 — DDP를 한 번 확인하기 위해 이 모든 단계를 거쳐야 합니다.',
      } as L3,
    },
    {
      icon: '⏱️',
      title: {
        ja: 'エンジニアを待つしかない',
        en: 'Waiting on the engineer',
        es: 'Esperando al ingeniero',
        ko: '엔지니어를 기다려야 합니다',
      } as L3,
      desc: {
        ja: '「DDPの中身、本当に合ってますか？」——確認する手段がないから、エンジニアの言葉を信じるしかない。でも本当は自分の目と耳で確かめたい。',
        en: '"Is the DDP correct?" — without a way to check, you just have to trust the engineer. But you really want to verify with your own eyes and ears.',
        es: '"¿El DDP está correcto?" — sin forma de verificar, tienes que confiar en el ingeniero. Pero realmente quieres comprobarlo con tus propios ojos y oídos.',
        ko: '"DDP이 올바른가요?" — 확인할 수 있는 방법이 없으면 엔지니어를 신뢰해야 할 뿐입니다. 하지만 정말로 자신의 눈과 귀로 확인하고 싶습니다.',
      } as L3,
    },
  ],

  // ── Solution ──
  solutionLabel: { ja: 'THE SOLUTION', en: 'THE SOLUTION', es: 'LA SOLUCIÓN', ko: 'THE SOLUTION' } as L3,
  solutionTitle: {
    ja: '空音開발の\nDDPチェッカーが解決します。',
    en: 'Kuon R&D\'s DDP Checker\nsolves this.',
    es: 'El DDP Checker de\nKuon R&D lo resuelve.',
    ko: 'Kuon R&D의\nDDP 체커가 해결합니다.',
  } as L3,
  solutionSub: {
    ja: 'ブラウザを開いて、DDPフォルダをドロップするだけ。\nトラックリスト、再生時間、ISRC——すべてが一瞬で表示されます。',
    en: 'Open your browser, drop your DDP folder.\nTrack list, duration, ISRC — everything appears instantly.',
    es: 'Abre tu navegador, suelta la carpeta DDP.\nLista de pistas, duración, ISRC — todo aparece al instante.',
    ko: '브라우저를 열고 DDP 폴더를 드롭하기만 하면 됩니다.\n트랙 목록, 재생 시간, ISRC — 모든 것이 즉시 나타납니다.',
  } as L3,

  // ── Features ──
  featuresLabel: { ja: 'FEATURES', en: 'FEATURES', es: 'CARACTERÍSTICAS', ko: 'FEATURES' } as L3,
  features: [
    {
      icon: '⏮',
      title: {
        ja: '曲間試聴 — Gap Listen',
        en: 'Gap Listen — Crossfade Preview',
        es: 'Escuchar Pausa — Gap Listen',
        ko: '곡간 시청 — Gap Listen',
      } as L3,
      desc: {
        ja: '前の曲の終わり15秒 → 曲間の無音 → 次の曲の冒頭を連続再生。CDの曲間のニュアンスをプレス前にブラウザで体感できる、他のDDPツールにはない独自機能。',
        en: 'Plays the last 15 seconds of the previous track → silence gap → start of the next track. Experience the nuance of CD track transitions before pressing — a feature no other DDP tool offers.',
        es: 'Reproduce los últimos 15 segundos de la pista anterior → silencio → inicio de la siguiente. Experimenta la transición entre pistas de CD antes del prensado — una función que ninguna otra herramienta DDP ofrece.',
        ko: '이전 트랙의 마지막 15초 → 무음 갭 → 다음 트랙의 시작을 재생합니다. 프레싱 전에 CD 트랙 전환의 뉘앙스를 경험할 수 있는 다른 DDP 도구에는 없는 고유한 기능입니다.',
      } as L3,
      exclusive: true,
    },
    {
      icon: '📋',
      title: {
        ja: 'トラックリスト表示',
        en: 'Track List Display',
        es: 'Visualización de pistas',
        ko: '트랙 목록 표시',
      } as L3,
      desc: {
        ja: 'DDPに収録されている全トラックの番号、再生時間、ISRCを一覧表示。曲順が合っているか、トラック数が正しいか、一目で確認できます。',
        en: 'View all track numbers, durations, and ISRC codes at a glance. Verify track order and count instantly.',
        es: 'Ve todos los números de pista, duraciones y códigos ISRC de un vistazo. Verifica el orden y cantidad de pistas al instante.',
        ko: '모든 트랙 번호, 재생 시간 및 ISRC 코드를 한눈에 확인하세요. 트랙 순서와 개수를 즉시 확인합니다.',
      } as L3,
    },
    {
      icon: '▶️',
      title: {
        ja: 'トラックごとに試聴',
        en: 'Preview Each Track',
        es: 'Previsualizar cada pista',
        ko: '각 트랙 미리보기',
      } as L3,
      desc: {
        ja: '各トラックの再生ボタンを押すだけで、ブラウザ上でそのまま試聴。「本当にこの曲が入っているか」を自分の耳で確認できます。',
        en: 'Press play on any track to listen right in your browser. Confirm the right audio is there with your own ears.',
        es: 'Presiona reproducir en cualquier pista para escuchar directamente en tu navegador. Confirma que el audio correcto está ahí con tus propios oídos.',
        ko: '모든 트랙을 브라우저에서 직접 재생하세요. 올바른 오디오가 있는지 직접 확인하십시오.',
      } as L3,
    },
    {
      icon: '💾',
      title: {
        ja: 'WAVダウンロード',
        en: 'WAV Download',
        es: 'Descarga WAV',
        ko: 'WAV 다운로드',
      } as L3,
      desc: {
        ja: '各トラックを個別のWAVファイルとしてダウンロード。エンジニアに差し戻す前の最終確認や、アーカイブ用途にも。',
        en: 'Download individual tracks as WAV files. Perfect for final verification before sending feedback to your engineer.',
        es: 'Descarga pistas individuales como archivos WAV. Perfecto para la verificación final antes de enviar comentarios a tu ingeniero.',
        ko: '개별 트랙을 WAV 파일로 다운로드합니다. 엔지니어에게 피드백을 보내기 전에 최종 검증에 완벽합니다.',
      } as L3,
    },
    {
      icon: '🔒',
      title: {
        ja: '完全ローカル処理',
        en: '100% Local Processing',
        es: 'Procesamiento 100% local',
        ko: '100% 로컬 처리',
      } as L3,
      desc: {
        ja: 'すべての処理はブラウザ内で完結。あなたのマスター音源がサーバーに送信されることは一切ありません。機密性の高いプリリリース音源でも安心です。',
        en: 'Everything happens in your browser. Your master audio never leaves your computer. Safe even for confidential pre-release material.',
        es: 'Todo ocurre en tu navegador. Tu audio máster nunca sale de tu computadora. Seguro incluso para material confidencial previo al lanzamiento.',
        ko: '모든 처리가 브라우저에서 발생합니다. 마스터 오디오가 컴퓨터를 떠나지 않습니다. 기밀 사전 공개 자료도 안전합니다.',
      } as L3,
    },
    {
      icon: '🌐',
      title: {
        ja: 'インストール不要',
        en: 'No Installation',
        es: 'Sin instalación',
        ko: '설치 불필요',
      } as L3,
      desc: {
        ja: 'ブラウザさえあれば、Windows でも Mac でも ChromeBook でも、どこでも使えます。ソフトのダウンロードもライセンス認証も不要。',
        en: 'Works on any device with a browser — Windows, Mac, Chromebook. No downloads, no license keys.',
        es: 'Funciona en cualquier dispositivo con navegador — Windows, Mac, Chromebook. Sin descargas, sin licencias.',
        ko: '브라우저가 있는 모든 장치에서 작동합니다(Windows, Mac, Chromebook). 다운로드나 라이선스 키 불필요.',
      } as L3,
    },
    {
      icon: '🆓',
      title: {
        ja: '完全無料',
        en: 'Completely Free',
        es: 'Completamente gratis',
        ko: '완전 무료',
      } as L3,
      desc: {
        ja: '利用料は一切かかりません。広告もありません。ミュージシャンとプロデューサーの味方であり続けるための、空音開発のポリシーです。',
        en: 'No fees, ever. No ads. This is Kuon R&D\'s commitment to supporting musicians and producers.',
        es: 'Sin tarifas, nunca. Sin anuncios. Este es el compromiso de Kuon R&D con músicos y productores.',
        ko: '절대 수수료 없음. 광고도 없음. 이것은 음악가와 프로듀서를 지원하기 위한 Kuon R&D의 약속입니다.',
      } as L3,
    },
  ],

  // ── How to use ──
  howLabel: { ja: 'HOW TO USE', en: 'HOW TO USE', es: 'CÓMO USAR', ko: 'HOW TO USE' } as L3,
  howTitle: {
    ja: '使い方は、たったの3ステップ。',
    en: 'Just 3 steps.',
    es: 'Solo 3 pasos.',
    ko: '단 3단계만 하면 됩니다.',
  } as L3,
  steps: [
    {
      num: '01',
      title: {
        ja: 'DDPフォルダをドロップ',
        en: 'Drop your DDP folder',
        es: 'Suelta tu carpeta DDP',
        ko: 'DDP 폴더 드롭하기',
      } as L3,
      desc: {
        ja: 'マスタリングエンジニアから受け取ったDDPフォルダを、そのままブラウザの画面にドラッグ＆ドロップ。',
        en: 'Drag and drop the DDP folder from your mastering engineer directly onto the browser.',
        es: 'Arrastra y suelta la carpeta DDP de tu ingeniero de masterización directamente en el navegador.',
        ko: '마스터링 엔지니어로부터 받은 DDP 폴더를 브라우저에 끌어다 놓습니다.',
      } as L3,
    },
    {
      num: '02',
      title: {
        ja: 'トラックリストを確認',
        en: 'Review the track list',
        es: 'Revisa la lista de pistas',
        ko: '트랙 목록 검토',
      } as L3,
      desc: {
        ja: 'DDPバージョン、トラック数、各トラックの再生時間、ISRCが自動表示。曲順が正しいか一目で確認できます。',
        en: 'DDP version, track count, duration, and ISRC codes are displayed automatically. Verify track order at a glance.',
        es: 'La versión DDP, cantidad de pistas, duración y códigos ISRC se muestran automáticamente. Verifica el orden de un vistazo.',
        ko: 'DDP 버전, 트랙 수, 재생 시간 및 ISRC 코드가 자동으로 표시됩니다. 한눈에 트랙 순서를 확인하세요.',
      } as L3,
    },
    {
      num: '03',
      title: {
        ja: '試聴して確認完了',
        en: 'Listen and confirm',
        es: 'Escucha y confirma',
        ko: '재생 및 확인',
      } as L3,
      desc: {
        ja: '各トラックの再生ボタンで試聴。問題なければプレス工場へGO。気になる点があればWAVでダウンロードしてエンジニアに共有。',
        en: 'Press play on each track. If everything sounds right, send it to the pressing plant. Need to flag something? Download the WAV and share with your engineer.',
        es: 'Reproduce cada pista. Si todo suena bien, envíalo a la planta de prensado. ¿Necesitas señalar algo? Descarga el WAV y compártelo con tu ingeniero.',
        ko: '각 트랙을 재생합니다. 모든 것이 올바르면 프레싱 공장으로 보냅니다. 표시해야 할 사항이 있으신가요? WAV를 다운로드하여 엔지니어와 공유하세요.',
      } as L3,
    },
  ],

  // ── Comparison table ──
  compareLabel: { ja: 'COMPARISON', en: 'COMPARISON', es: 'COMPARACIÓN', ko: 'COMPARISON' } as L3,
  compareTitle: {
    ja: '他のDDPツールとの比較',
    en: 'Compared to other DDP tools',
    es: 'Comparado con otras herramientas DDP',
    ko: '다른 DDP 도구와의 비교',
  } as L3,
  compareCols: {
    feature: { ja: '', en: '', es: '', ko: '' } as L3,
    kuon: { ja: '空音開発\nDDP Checker', en: 'Kuon R&D\nDDP Checker', es: 'Kuon R&D\nDDP Checker', ko: 'Kuon R&D\nDDP Checker' } as L3,
    hofa: { ja: 'HOFA\nDDP Player', en: 'HOFA\nDDP Player', es: 'HOFA\nDDP Player', ko: 'HOFA\nDDP Player' } as L3,
    sonoris: { ja: 'Sonoris\nDDP Creator', en: 'Sonoris\nDDP Creator', es: 'Sonoris\nDDP Creator', ko: 'Sonoris\nDDP Creator' } as L3,
  },
  compareRows: [
    {
      feature: { ja: '価格', en: 'Price', es: 'Precio', ko: '가격' } as L3,
      kuon: { ja: '無料', en: 'Free', es: 'Gratis', ko: '무료' } as L3,
      hofa: { ja: '€79〜', en: '€79+', es: '€79+', ko: '€79+' } as L3,
      sonoris: { ja: '€249〜', en: '€249+', es: '€249+', ko: '€249+' } as L3,
    },
    {
      feature: { ja: 'インストール', en: 'Installation', es: 'Instalación', ko: '설치' } as L3,
      kuon: { ja: '不要', en: 'None', es: 'Ninguna', ko: '없음' } as L3,
      hofa: { ja: '必要', en: 'Required', es: 'Requerida', ko: '필수' } as L3,
      sonoris: { ja: '必要', en: 'Required', es: 'Requerida', ko: '필수' } as L3,
    },
    {
      feature: { ja: 'トラック試聴', en: 'Track preview', es: 'Vista previa', ko: '트랙 미리보기' } as L3,
      kuon: { ja: '○', en: '✓', es: '✓', ko: '✓' } as L3,
      hofa: { ja: '○', en: '✓', es: '✓', ko: '✓' } as L3,
      sonoris: { ja: '○', en: '✓', es: '✓', ko: '✓' } as L3,
    },
    {
      feature: { ja: '曲間試聴（Gap Listen）', en: 'Gap Listen (crossfade)', es: 'Escuchar pausa (Gap Listen)', ko: '곡간 시청 (Gap Listen)' } as L3,
      kuon: { ja: '○', en: '✓', es: '✓', ko: '✓' } as L3,
      hofa: { ja: '—', en: '—', es: '—', ko: '—' } as L3,
      sonoris: { ja: '—', en: '—', es: '—', ko: '—' } as L3,
    },
    {
      feature: { ja: 'リードイン・プリギャップ表示', en: 'Lead-in / Pre-gap display', es: 'Lead-in / Pre-gap', ko: '리드인 / 프리갭 표시' } as L3,
      kuon: { ja: '○', en: '✓', es: '✓', ko: '✓' } as L3,
      hofa: { ja: '○', en: '✓', es: '✓', ko: '✓' } as L3,
      sonoris: { ja: '○', en: '✓', es: '✓', ko: '✓' } as L3,
    },
    {
      feature: { ja: 'WAVエクスポート', en: 'WAV export', es: 'Exportar WAV', ko: 'WAV 내보내기' } as L3,
      kuon: { ja: '○', en: '✓', es: '✓', ko: '✓' } as L3,
      hofa: { ja: '○', en: '✓', es: '✓', ko: '✓' } as L3,
      sonoris: { ja: '○', en: '✓', es: '✓', ko: '✓' } as L3,
    },
    {
      feature: { ja: 'プライバシー', en: 'Privacy', es: 'Privacidad', ko: '개인 정보 보호' } as L3,
      kuon: { ja: '完全ローカル', en: '100% local', es: '100% local', ko: '100% 로컬' } as L3,
      hofa: { ja: 'ローカル', en: 'Local', es: 'Local', ko: '로컬' } as L3,
      sonoris: { ja: 'ローカル', en: 'Local', es: 'Local', ko: '로컬' } as L3,
    },
    {
      feature: { ja: 'OS対応', en: 'OS support', es: 'Soporte SO', ko: 'OS 지원' } as L3,
      kuon: { ja: '全OS（ブラウザ）', en: 'All (browser)', es: 'Todos (navegador)', ko: '모두 (브라우저)' } as L3,
      hofa: { ja: 'Win / Mac', en: 'Win / Mac', es: 'Win / Mac', ko: 'Win / Mac' } as L3,
      sonoris: { ja: 'Win / Mac', en: 'Win / Mac', es: 'Win / Mac', ko: 'Win / Mac' } as L3,
    },
    {
      feature: { ja: 'DDP制作', en: 'DDP creation', es: 'Creación DDP', ko: 'DDP 생성' } as L3,
      kuon: { ja: '—', en: '—', es: '—', ko: '—' } as L3,
      hofa: { ja: '上位版のみ', en: 'Pro only', es: 'Solo Pro', ko: 'Pro만' } as L3,
      sonoris: { ja: '○', en: '✓', es: '✓', ko: '✓' } as L3,
    },
  ],

  // ── Who is it for ──
  whoLabel: { ja: 'WHO IS IT FOR', en: 'WHO IS IT FOR', es: 'PARA QUIÉN', ko: 'WHO IS IT FOR' } as L3,
  whoTitle: {
    ja: 'こんな方にぴったりです。',
    en: 'Perfect for you if…',
    es: 'Perfecto para ti si…',
    ko: '이런 분들을 위한 것입니다.',
  } as L3,
  whoList: [
    {
      title: {
        ja: 'アーティスト / ミュージシャン',
        en: 'Artists & Musicians',
        es: 'Artistas y Músicos',
        ko: '아티스트 및 뮤지션',
      } as L3,
      desc: {
        ja: 'マスタリングエンジニアからDDPを受け取ったけど、本当に全トラックが正しく入っているか確認したい。でもそのためだけにソフトを買うのはちょっと…。',
        en: 'You received a DDP from your mastering engineer and want to verify all tracks are correct — but buying software just for that feels wrong.',
        es: 'Recibiste un DDP de tu ingeniero de masterización y quieres verificar que todas las pistas están correctas, pero comprar software solo para eso no tiene sentido.',
        ko: '마스터링 엔지니어로부터 DDP를 받았고 모든 트랙이 올바른지 확인하고 싶지만, 그것만을 위해 소프트웨어를 구입하는 것은 이상합니다.',
      } as L3,
    },
    {
      title: {
        ja: 'レーベルオーナー / プロデューサー',
        en: 'Label Owners & Producers',
        es: 'Dueños de sello y Productores',
        ko: '레이블 소유자 및 프로듀서',
      } as L3,
      desc: {
        ja: '複数のアーティストのDDPを定期的にチェックする必要がある。専用ソフトを複数のPCにインストールするコストを削減したい。',
        en: 'You regularly check DDPs from multiple artists and want to cut the cost of installing dedicated software on every machine.',
        es: 'Revisas DDPs de múltiples artistas regularmente y quieres reducir el costo de instalar software dedicado en cada máquina.',
        ko: '여러 아티스트의 DDP를 정기적으로 확인하고 모든 컴퓨터에 전용 소프트웨어를 설치하는 비용을 줄이고 싶습니다.',
      } as L3,
    },
    {
      title: {
        ja: 'マスタリングエンジニア',
        en: 'Mastering Engineers',
        es: 'Ingenieros de masterización',
        ko: '마스터링 엔지니어',
      } as L3,
      desc: {
        ja: 'クライアントに「このURLでDDPの中身を確認できます」と案内したい。相手にソフトのインストールをお願いする必要がなくなる。',
        en: 'Send your clients this URL so they can verify the DDP themselves — no need to ask them to install anything.',
        es: 'Envía a tus clientes esta URL para que verifiquen el DDP por sí mismos — sin necesidad de pedirles que instalen nada.',
        ko: '클라이언트에게 이 URL을 보내서 직접 DDP를 확인하도록 하세요. 아무것도 설치하도록 요청할 필요가 없습니다.',
      } as L3,
    },
  ],

  // ── Tech ──
  techLabel: { ja: 'TECHNOLOGY', en: 'TECHNOLOGY', es: 'TECNOLOGÍA', ko: 'TECHNOLOGY' } as L3,
  techTitle: {
    ja: '信頼性の裏にある技術。',
    en: 'The technology behind the trust.',
    es: 'La tecnología detrás de la confianza.',
    ko: '신뢰 뒤의 기술',
  } as L3,
  techItems: [
    {
      title: { ja: 'DDPプロトコル完全解析', en: 'Full DDP Protocol Parsing', es: 'Análisis completo del protocolo DDP', ko: 'DDP 프로토콜 완전 분석' } as L3,
      desc: {
        ja: 'DDPID（128バイト固定長）、DDPMS（128バイトレコード列）、PQ Descriptor（64バイトレコード列）を正確にパース。DDP v1.01 / v2.00 に対応。',
        en: 'Precisely parses DDPID (128-byte fixed), DDPMS (128-byte records), and PQ Descriptors (64-byte records). Supports DDP v1.01 and v2.00.',
        es: 'Analiza con precisión DDPID (128 bytes fijos), DDPMS (registros de 128 bytes) y descriptores PQ (registros de 64 bytes). Compatible con DDP v1.01 y v2.00.',
        ko: 'DDPID (128바이트 고정), DDPMS (128바이트 레코드) 및 PQ 설명자 (64바이트 레코드)를 정확하게 분석합니다. DDP v1.01 및 v2.00 지원.',
      } as L3,
    },
    {
      title: { ja: 'Web Audio API', en: 'Web Audio API', es: 'Web Audio API', ko: 'Web Audio API' } as L3,
      desc: {
        ja: 'DDP内のリニアPCMデータ（16bit / 44.1kHz / リトルエンディアン / ステレオインターリーブ）をブラウザ内で直接デコードし、遅延なく再生。',
        en: 'Directly decodes linear PCM data (16-bit / 44.1kHz / little-endian / stereo interleaved) inside DDP for instant playback.',
        es: 'Decodifica directamente datos PCM lineal (16-bit / 44.1kHz / little-endian / estéreo entrelazado) dentro del DDP para reproducción instantánea.',
        ko: 'DDP 내의 선형 PCM 데이터 (16비트 / 44.1kHz / 리틀엔디언 / 스테레오 인터리브)를 직접 디코딩하여 즉시 재생합니다.',
      } as L3,
    },
    {
      title: { ja: 'ゼロサーバー・アーキテクチャ', en: 'Zero-Server Architecture', es: 'Arquitectura sin servidor', ko: '제로 서버 아키텍처' } as L3,
      desc: {
        ja: 'File API + TextDecoder + Web Audio API のみで構成。あなたの音声データはネットワークを一切経由しません。Chrome、Firefox、Safari、Edge 対応。',
        en: 'Built with File API + TextDecoder + Web Audio API only. Your audio data never touches the network. Works on Chrome, Firefox, Safari, and Edge.',
        es: 'Construido solo con File API + TextDecoder + Web Audio API. Tus datos de audio nunca tocan la red. Compatible con Chrome, Firefox, Safari y Edge.',
        ko: 'File API + TextDecoder + Web Audio API로만 구축됩니다. 오디오 데이터가 네트워크를 건드리지 않습니다. Chrome, Firefox, Safari 및 Edge에서 작동합니다.',
      } as L3,
    },
  ],

  // ── FAQ ──
  faqLabel: { ja: 'FAQ', en: 'FAQ', es: 'PREGUNTAS FRECUENTES', ko: 'FAQ' } as L3,
  faqTitle: {
    ja: 'よくある質問',
    en: 'Frequently Asked Questions',
    es: 'Preguntas frecuentes',
    ko: '자주 묻는 질문',
  } as L3,
  faqs: [
    {
      q: {
        ja: 'DDPファイルとは何ですか？',
        en: 'What is a DDP file?',
        es: '¿Qué es un archivo DDP?',
        ko: 'DDP 파일이란 무엇입니까?',
      } as L3,
      a: {
        ja: 'DDP（Disc Description Protocol）は、CDマスタリングの最終工程でプレス工場に納品するファイル形式です。トラック情報、PQコード、音声データがひとまとめになったファイルセットで、CDの「設計図」にあたります。',
        en: 'DDP (Disc Description Protocol) is the file format used in the final stage of CD mastering, delivered to pressing plants. It\'s a fileset containing track information, PQ codes, and audio data — essentially the "blueprint" of a CD.',
        es: 'DDP (Disc Description Protocol) es el formato de archivo utilizado en la etapa final de masterización de CD, entregado a las plantas de prensado. Es un conjunto de archivos que contiene información de pistas, códigos PQ y datos de audio — esencialmente el "plano" de un CD.',
        ko: 'DDP(디스크 설명 프로토콜)는 CD 마스터링의 최종 단계에서 프레싱 공장에 전달되는 파일 형식입니다. 트랙 정보, PQ 코드 및 오디오 데이터가 포함된 파일 세트이며, 본질적으로 CD의 "청사진"입니다.',
      } as L3,
    },
    {
      q: {
        ja: '本当に無料ですか？制限はありますか？',
        en: 'Is it really free? Are there any limitations?',
        es: '¿Es realmente gratis? ¿Hay limitaciones?',
        ko: '정말 무료입니까? 제한이 있습니까?',
      } as L3,
      a: {
        ja: 'はい、完全に無料です。トラック数やファイルサイズの制限もありません。広告も表示されません。空音開発はミュージシャンの味方です。',
        en: 'Yes, completely free. No limits on track count or file size. No ads. Kuon R&D is on the side of musicians.',
        es: 'Sí, completamente gratis. Sin límites de cantidad de pistas o tamaño de archivo. Sin anuncios. Kuon R&D está del lado de los músicos.',
        ko: '예, 완전히 무료입니다. 트랙 수 또는 파일 크기에 제한이 없습니다. 광고도 없습니다. Kuon R&D는 음악가의 편입니다.',
      } as L3,
    },
    {
      q: {
        ja: '音声データがサーバーに送信されることはありますか？',
        en: 'Is my audio data sent to any server?',
        es: '¿Se envían mis datos de audio a algún servidor?',
        ko: '내 오디오 데이터가 서버로 전송됩니까?',
      } as L3,
      a: {
        ja: 'いいえ、一切ありません。すべての処理はあなたのブラウザ内で完結します。ネットワーク通信は発生しません。プリリリースの機密音源でも安心してお使いいただけます。',
        en: 'No, never. All processing happens entirely in your browser. No network requests are made. Safe to use with confidential pre-release material.',
        es: 'No, nunca. Todo el procesamiento ocurre completamente en tu navegador. No se realizan solicitudes de red. Seguro para material confidencial previo al lanzamiento.',
        ko: '아니요, 절대 아닙니다. 모든 처리가 브라우저에서 완전히 발생합니다. 네트워크 요청이 없습니다. 기밀 사전 공개 자료에도 안전합니다.',
      } as L3,
    },
    {
      q: {
        ja: 'どのDDPバージョンに対応していますか？',
        en: 'Which DDP versions are supported?',
        es: '¿Qué versiones de DDP son compatibles?',
        ko: '어떤 DDP 버전이 지원됩니까?',
      } as L3,
      a: {
        ja: 'CD-Audio向けのDDP v1.01 および v2.00 に対応しています。CD-Audioの標準仕様（Red Book: 44.1kHz / 16bit / ステレオ）をカバーしています。',
        en: 'Supports DDP v1.01 and v2.00 for CD-Audio. Covers the standard Red Book specification (44.1kHz / 16-bit / stereo).',
        es: 'Compatible con DDP v1.01 y v2.00 para CD-Audio. Cubre la especificación estándar Red Book (44.1kHz / 16-bit / estéreo).',
        ko: 'CD-Audio용 DDP v1.01 및 v2.00을 지원합니다. 표준 Red Book 사양을 포함합니다 (44.1kHz / 16비트 / 스테레오).',
      } as L3,
    },
    {
      q: {
        ja: 'DDPファイルを作成することはできますか？',
        en: 'Can I create DDP files with this tool?',
        es: '¿Puedo crear archivos DDP con esta herramienta?',
        ko: '이 도구로 DDP 파일을 생성할 수 있습니까?',
      } as L3,
      a: {
        ja: 'いいえ。本ツールはDDPの「確認」に特化したリードオンリーツールです。DDPの制作はマスタリングエンジニアの専門領域であり、意図的にその機能は含めていません。',
        en: 'No. This tool is a read-only checker specialized in DDP verification. DDP creation is the domain of mastering engineers, and we intentionally don\'t include that functionality.',
        es: 'No. Esta herramienta es un verificador de solo lectura especializado en verificación de DDP. La creación de DDP es el dominio de los ingenieros de masterización.',
        ko: '아니요. 이 도구는 DDP 검증에 특화된 읽기 전용 검사기입니다. DDP 생성은 마스터링 엔지니어의 전문 영역이며 의도적으로 해당 기능을 포함하지 않았습니다.',
      } as L3,
    },
  ],

  // ── Final CTA ──
  finalTitle: {
    ja: 'DDPの中身、今すぐ確認しませんか？',
    en: 'Ready to check your DDP?',
    es: '¿Listo para verificar tu DDP?',
    ko: 'DDP을 확인할 준비가 되었습니까?',
  } as L3,
  finalSub: {
    ja: '無料・インストール不要・サーバー送信なし。\nブラウザを開くだけで、あなたのCDマスターを確認できます。',
    en: 'Free, no install, no server uploads.\nJust open your browser and verify your CD master.',
    es: 'Gratis, sin instalación, sin subidas al servidor.\nSolo abre tu navegador y verifica tu máster de CD.',
    ko: '무료, 설치 불필요, 서버 업로드 없음.\n브라우저를 열고 CD 마스터를 확인하세요.',
  } as L3,
  finalCta: {
    ja: 'DDP チェッカーを開く',
    en: 'Open DDP Checker',
    es: 'Abrir DDP Checker',
    ko: 'DDP 체커 열기',
  } as L3,

  // ── Footer ──
  footerDev: { ja: '空音開発 Kuon R&D', en: 'Kuon R&D', es: 'Kuon R&D', ko: 'Kuon R&D' } as L3,
  footerAbout: {
    ja: '空音開発は「空と音」——GPS×オーディオの二軸に特化した日本の開発チームです。',
    en: 'Kuon R&D is a Japanese development team specializing in GPS × Audio technology.',
    es: 'Kuon R&D es un equipo de desarrollo japonés especializado en tecnología GPS × Audio.',
    ko: 'Kuon R&D는 GPS × 오디오 기술을 전문으로 하는 일본의 개발 팀입니다.',
  } as L3,
};

// ─────────────────────────────────────────────
// Scroll reveal hook
// ─────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); io.disconnect(); } },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function RevealSection({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useReveal();
  return <div ref={ref} className={`reveal ${className}`} style={style}>{children}</div>;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function DdpCheckerLpPage() {
  const { lang } = useLang();
  const t = (l3: L3) => l3[lang] || l3.en;

  // ── Shared styles ──
  const section: React.CSSProperties = {
    maxWidth: 900,
    margin: '0 auto',
    padding: 'clamp(48px, 10vw, 100px) clamp(16px, 4vw, 40px)',
  };

  const badge: React.CSSProperties = {
    display: 'inline-block',
    fontSize: 11,
    fontFamily: sans,
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: ACCENT,
    border: `1px solid rgba(2,132,199,0.25)`,
    borderRadius: 50,
    padding: '6px 18px',
    marginBottom: 20,
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: serif,
    fontSize: 'clamp(24px, 4.5vw, 40px)',
    fontWeight: 700,
    lineHeight: 1.4,
    letterSpacing: '0.02em',
    color: '#111827',
    whiteSpace: 'pre-line',
    marginBottom: 20,
  };

  const glass: React.CSSProperties = {
    background: 'rgba(255,255,255,0.7)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.9)',
    borderRadius: 20,
    boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
  };

  const ctaPrimary: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    color: '#fff',
    fontFamily: sans,
    fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)',
    fontWeight: 600,
    letterSpacing: '0.1em',
    padding: 'clamp(1rem, 2vw, 1.4rem) clamp(2.5rem, 5vw, 5rem)',
    borderRadius: 50,
    background: `linear-gradient(135deg, ${ACCENT}, #0369a1)`,
    boxShadow: '0 8px 28px rgba(2,132,199,0.3)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: 'none',
  };

  // ── JSON-LD Structured Data ──
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DDP Checker by Kuon R&D',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any (Web Browser)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: t(T.heroSub),
    url: 'https://kuon-rnd.com/ddp-checker',
    author: {
      '@type': 'Organization',
      name: '空音開発 Kuon R&D',
      url: 'https://kuon-rnd.com',
    },
    featureList: 'DDP verification, Track list display, Audio preview, Gap Listen (crossfade preview), WAV download, Lead-in & pre-gap display, 100% local processing',
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: T.faqs.map(faq => ({
      '@type': 'Question',
      name: t(faq.q),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(faq.a),
      },
    })),
  };

  return (
    <>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ═══════════════════════════════════════════ */}
      {/* HERO                                        */}
      {/* ═══════════════════════════════════════════ */}
      <section style={{
        ...section,
        textAlign: 'center',
        paddingTop: 'clamp(60px, 12vw, 120px)',
        paddingBottom: 'clamp(40px, 8vw, 80px)',
      }}>
        <div className="hero-enter-1">
          <span style={badge}>{t(T.heroBadge)}</span>
        </div>
        <h1 className="hero-enter-2" style={{
          ...sectionTitle,
          fontSize: 'clamp(28px, 5.5vw, 52px)',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #111827 30%, #0284c7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {t(T.heroTitle)}
        </h1>
        <p className="hero-enter-3" style={{
          fontFamily: sans,
          fontSize: 'clamp(14px, 2.2vw, 17px)',
          color: '#6b7280',
          lineHeight: 1.8,
          maxWidth: 640,
          margin: '0 auto 40px',
          whiteSpace: 'pre-line',
        }}>
          {t(T.heroSub)}
        </p>
        <div className="hero-enter-4">
          <Link href="/ddp-checker" style={ctaPrimary} className="btn-shimmer">
            {t(T.heroCta)}
          </Link>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 14 }}>
            {t(T.heroCtaSub)}
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* PROBLEM                                     */}
      {/* ═══════════════════════════════════════════ */}
      <section style={{ ...section, paddingTop: 0 }}>
        <RevealSection>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={badge}>{t(T.problemLabel)}</span>
            <h2 style={{ ...sectionTitle, textAlign: 'center' }}>{t(T.problemTitle)}</h2>
          </div>
        </RevealSection>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {T.painPoints.map((p, i) => (
            <RevealSection key={i} className={`reveal-delay-${i + 1}`}>
              <div style={{
                ...glass,
                padding: 'clamp(24px, 4vw, 36px)',
                height: '100%',
              }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{p.icon}</div>
                <h3 style={{
                  fontFamily: serif,
                  fontSize: 'clamp(16px, 2.5vw, 19px)',
                  fontWeight: 600,
                  marginBottom: 12,
                  color: '#111827',
                }}>
                  {t(p.title)}
                </h3>
                <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: '#6b7280', lineHeight: 1.7 }}>
                  {t(p.desc)}
                </p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SOLUTION                                    */}
      {/* ═══════════════════════════════════════════ */}
      <section style={{ ...section }}>
        <RevealSection style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={badge}>{t(T.solutionLabel)}</span>
          <h2 style={{ ...sectionTitle, textAlign: 'center' }}>{t(T.solutionTitle)}</h2>
          <p style={{
            fontFamily: sans,
            fontSize: 'clamp(14px, 2.2vw, 17px)',
            color: '#6b7280',
            lineHeight: 1.8,
            maxWidth: 600,
            margin: '0 auto',
            whiteSpace: 'pre-line',
          }}>
            {t(T.solutionSub)}
          </p>
        </RevealSection>

        {/* Mock UI preview */}
        <RevealSection>
          <div style={{
            ...glass,
            padding: 'clamp(24px, 4vw, 40px)',
            maxWidth: 700,
            margin: '0 auto',
          }}>
            {/* Mini mock header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ marginLeft: 12, fontSize: 12, color: '#9ca3af', fontFamily: mono }}>kuon-rnd.com/ddp-checker</span>
            </div>
            {/* Mock track list */}
            <div style={{ fontSize: 11, fontFamily: mono, color: '#6b7280', marginBottom: 8, letterSpacing: '0.05em' }}>
              DDP 2.00 — 8 tracks — 47:23
            </div>
            {[
              { n: '01', dur: '5:32', isrc: 'JPAB02612345' },
              { n: '02', dur: '6:18', isrc: 'JPAB02612346' },
              { n: '03', dur: '4:47', isrc: 'JPAB02612347' },
              { n: '04', dur: '7:01', isrc: '—' },
            ].map((tr) => (
              <div key={tr.n} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                fontSize: 13,
              }}>
                <span style={{ fontWeight: 600, width: 28 }}>{tr.n}</span>
                <span style={{ fontFamily: mono, flex: 1, marginLeft: 12 }}>{tr.dur}</span>
                <span style={{ fontFamily: mono, fontSize: 11, color: '#9ca3af', flex: 1 }}>{tr.isrc}</span>
                <span style={{ display: 'flex', gap: 6 }}>
                  {tr.n !== '01' && (
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: 50,
                      fontSize: 11,
                      background: tr.n === '02' ? '#7C3AED' : 'rgba(124,58,237,0.08)',
                      color: tr.n === '02' ? '#fff' : '#7C3AED',
                      fontWeight: 500,
                    }}>
                      {tr.n === '02' ? '■ Stop' : '⏮ Gap'}
                    </span>
                  )}
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: 50,
                    fontSize: 11,
                    background: tr.n === '01' ? ACCENT : 'rgba(2,132,199,0.08)',
                    color: tr.n === '01' ? '#fff' : ACCENT,
                    fontWeight: 500,
                  }}>
                    {tr.n === '01' ? '■ Stop' : '▶ Play'}
                  </span>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: 50,
                    fontSize: 11,
                    background: 'rgba(2,132,199,0.08)',
                    color: ACCENT,
                    fontWeight: 500,
                  }}>
                    ↓ WAV
                  </span>
                </span>
              </div>
            ))}
            <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 11, marginTop: 8 }}>⋮</div>
          </div>
        </RevealSection>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* FEATURES                                    */}
      {/* ═══════════════════════════════════════════ */}
      <section style={{ ...section }}>
        <RevealSection style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={badge}>{t(T.featuresLabel)}</span>
          <h2 style={{ ...sectionTitle, textAlign: 'center' }}>
            {lang === 'ja' ? '必要な機能を、\n過不足なく。' : lang === 'es' ? 'Todas las funciones\nque necesitas.' : 'Everything you need.\nNothing you don\'t.'}
          </h2>
        </RevealSection>

        {/* Exclusive feature: Gap Listen (full width highlight) */}
        {T.features.filter(f => 'exclusive' in f && f.exclusive).map((f, i) => (
          <RevealSection key={`exc-${i}`} style={{ marginBottom: 20 }}>
            <div style={{
              ...glass,
              padding: 'clamp(28px, 5vw, 44px)',
              borderLeft: `4px solid #7C3AED`,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.04), rgba(255,255,255,0.7))',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 36, flexShrink: 0 }}>{f.icon}</span>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                    <h3 style={{
                      fontFamily: serif,
                      fontSize: 'clamp(17px, 2.8vw, 22px)',
                      fontWeight: 700,
                      color: '#111827',
                      margin: 0,
                    }}>
                      {t(f.title)}
                    </h3>
                    <span style={{
                      fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
                      padding: '3px 10px', borderRadius: 50,
                      color: '#fff', background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                    }}>
                      {lang === 'ja' ? '他ツールにない機能' : lang === 'es' ? 'EXCLUSIVO' : 'EXCLUSIVE'}
                    </span>
                  </div>
                  <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: '#374151', lineHeight: 1.8, margin: 0 }}>
                    {t(f.desc)}
                  </p>
                </div>
              </div>
            </div>
          </RevealSection>
        ))}

        {/* Other features grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {T.features.filter(f => !('exclusive' in f && f.exclusive)).map((f, i) => (
            <RevealSection key={i} className={`reveal-delay-${(i % 3) + 1}`}>
              <div style={{
                ...glass,
                padding: 'clamp(24px, 4vw, 32px)',
                height: '100%',
              }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{
                  fontFamily: serif,
                  fontSize: 'clamp(15px, 2.2vw, 18px)',
                  fontWeight: 600,
                  marginBottom: 10,
                  color: '#111827',
                }}>
                  {t(f.title)}
                </h3>
                <p style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: '#6b7280', lineHeight: 1.7 }}>
                  {t(f.desc)}
                </p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* HOW TO USE                                  */}
      {/* ═══════════════════════════════════════════ */}
      <section style={{ ...section }}>
        <RevealSection style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={badge}>{t(T.howLabel)}</span>
          <h2 style={{ ...sectionTitle, textAlign: 'center' }}>{t(T.howTitle)}</h2>
        </RevealSection>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24,
        }}>
          {T.steps.map((step, i) => (
            <RevealSection key={i} className={`reveal-delay-${i + 1}`}>
              <div style={{
                ...glass,
                padding: 'clamp(28px, 4vw, 40px)',
                textAlign: 'center',
                height: '100%',
              }}>
                <div style={{
                  fontFamily: mono,
                  fontSize: 36,
                  fontWeight: 700,
                  color: 'rgba(2,132,199,0.15)',
                  marginBottom: 12,
                }}>
                  {step.num}
                </div>
                <h3 style={{
                  fontFamily: serif,
                  fontSize: 'clamp(16px, 2.5vw, 20px)',
                  fontWeight: 600,
                  marginBottom: 12,
                  color: '#111827',
                }}>
                  {t(step.title)}
                </h3>
                <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: '#6b7280', lineHeight: 1.7 }}>
                  {t(step.desc)}
                </p>
              </div>
            </RevealSection>
          ))}
        </div>

        {/* Mid-page CTA */}
        <RevealSection style={{ textAlign: 'center', marginTop: 48 }}>
          <Link href="/ddp-checker" style={ctaPrimary} className="btn-shimmer">
            {t(T.heroCta)}
          </Link>
        </RevealSection>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* COMPARISON                                  */}
      {/* ═══════════════════════════════════════════ */}
      <section style={{ ...section }}>
        <RevealSection style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={badge}>{t(T.compareLabel)}</span>
          <h2 style={{ ...sectionTitle, textAlign: 'center' }}>{t(T.compareTitle)}</h2>
        </RevealSection>

        <RevealSection>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 'clamp(12px, 2vw, 14px)',
              fontFamily: sans,
              ...glass,
              borderRadius: 16,
              overflow: 'hidden',
            }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 12px', textAlign: 'left', color: '#6b7280', fontSize: 12, fontWeight: 600 }}></th>
                  <th style={{
                    padding: '16px 12px',
                    textAlign: 'center',
                    color: '#fff',
                    background: `linear-gradient(135deg, ${ACCENT}, #0369a1)`,
                    fontSize: 13,
                    fontWeight: 700,
                    whiteSpace: 'pre-line',
                    lineHeight: 1.4,
                  }}>
                    {t(T.compareCols.kuon)}
                  </th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600, whiteSpace: 'pre-line', lineHeight: 1.4 }}>
                    {t(T.compareCols.hofa)}
                  </th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600, whiteSpace: 'pre-line', lineHeight: 1.4 }}>
                    {t(T.compareCols.sonoris)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {T.compareRows.map((row, i) => (
                  <tr key={i} style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding: '12px', fontWeight: 500, color: '#111827' }}>{t(row.feature)}</td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: t(row.kuon) === '無料' || t(row.kuon) === 'Free' || t(row.kuon) === 'Gratis' ? ACCENT : '#111827',
                      background: 'rgba(2,132,199,0.03)',
                    }}>
                      {t(row.kuon)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>{t(row.hofa)}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>{t(row.sonoris)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </RevealSection>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* WHO IS IT FOR                               */}
      {/* ═══════════════════════════════════════════ */}
      <section style={{ ...section }}>
        <RevealSection style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={badge}>{t(T.whoLabel)}</span>
          <h2 style={{ ...sectionTitle, textAlign: 'center' }}>{t(T.whoTitle)}</h2>
        </RevealSection>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {T.whoList.map((w, i) => (
            <RevealSection key={i} className={`reveal-delay-${i + 1}`}>
              <div style={{
                ...glass,
                padding: 'clamp(24px, 4vw, 36px)',
                display: 'flex',
                gap: 20,
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  minWidth: 48,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, rgba(2,132,199,0.08), rgba(2,132,199,0.15))`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  fontWeight: 700,
                  color: ACCENT,
                }}>
                  {['🎵', '🏢', '🎛️'][i]}
                </div>
                <div>
                  <h3 style={{
                    fontFamily: serif,
                    fontSize: 'clamp(16px, 2.5vw, 19px)',
                    fontWeight: 600,
                    marginBottom: 8,
                    color: '#111827',
                  }}>
                    {t(w.title)}
                  </h3>
                  <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: '#6b7280', lineHeight: 1.7 }}>
                    {t(w.desc)}
                  </p>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* TECHNOLOGY                                  */}
      {/* ═══════════════════════════════════════════ */}
      <section style={{ ...section }}>
        <RevealSection style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={badge}>{t(T.techLabel)}</span>
          <h2 style={{ ...sectionTitle, textAlign: 'center' }}>{t(T.techTitle)}</h2>
        </RevealSection>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {T.techItems.map((item, i) => (
            <RevealSection key={i} className={`reveal-delay-${i + 1}`}>
              <div style={{
                ...glass,
                padding: 'clamp(24px, 4vw, 36px)',
              }}>
                <h3 style={{
                  fontFamily: mono,
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontWeight: 600,
                  marginBottom: 10,
                  color: ACCENT,
                  letterSpacing: '0.03em',
                }}>
                  {t(item.title)}
                </h3>
                <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: '#6b7280', lineHeight: 1.7 }}>
                  {t(item.desc)}
                </p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* FAQ                                         */}
      {/* ═══════════════════════════════════════════ */}
      <section style={{ ...section }}>
        <RevealSection style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={badge}>{t(T.faqLabel)}</span>
          <h2 style={{ ...sectionTitle, textAlign: 'center' }}>{t(T.faqTitle)}</h2>
        </RevealSection>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 740, margin: '0 auto' }}>
          {T.faqs.map((faq, i) => (
            <RevealSection key={i}>
              <details style={{
                ...glass,
                padding: 0,
                overflow: 'hidden',
                cursor: 'pointer',
              }}>
                <summary style={{
                  padding: 'clamp(16px, 3vw, 24px)',
                  fontFamily: serif,
                  fontSize: 'clamp(14px, 2.2vw, 17px)',
                  fontWeight: 600,
                  color: '#111827',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  {t(faq.q)}
                  <span style={{ fontSize: 18, color: '#9ca3af', marginLeft: 12, flexShrink: 0 }}>＋</span>
                </summary>
                <div style={{
                  padding: '0 clamp(16px, 3vw, 24px) clamp(16px, 3vw, 24px)',
                  fontSize: 'clamp(13px, 2vw, 15px)',
                  color: '#6b7280',
                  lineHeight: 1.8,
                }}>
                  {t(faq.a)}
                </div>
              </details>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* FINAL CTA                                   */}
      {/* ═══════════════════════════════════════════ */}
      <section style={{
        ...section,
        textAlign: 'center',
        paddingTop: 'clamp(40px, 8vw, 80px)',
        paddingBottom: 'clamp(60px, 12vw, 120px)',
      }}>
        <RevealSection>
          <h2 style={{
            ...sectionTitle,
            textAlign: 'center',
            fontSize: 'clamp(24px, 5vw, 44px)',
            marginBottom: 20,
          }}>
            {t(T.finalTitle)}
          </h2>
          <p style={{
            fontFamily: sans,
            fontSize: 'clamp(14px, 2.2vw, 17px)',
            color: '#6b7280',
            lineHeight: 1.8,
            maxWidth: 560,
            margin: '0 auto 40px',
            whiteSpace: 'pre-line',
          }}>
            {t(T.finalSub)}
          </p>
          <Link href="/ddp-checker" style={{
            ...ctaPrimary,
            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
            padding: 'clamp(1.2rem, 2.5vw, 1.6rem) clamp(3rem, 6vw, 6rem)',
          }} className="btn-shimmer">
            {t(T.finalCta)}
          </Link>
        </RevealSection>

        {/* Footer note */}
        <div style={{ marginTop: 80, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 32 }}>
          <p style={{ fontFamily: serif, fontSize: 14, color: '#111827', marginBottom: 6 }}>{t(T.footerDev)}</p>
          <p style={{ fontSize: 12, color: '#9ca3af', maxWidth: 400, margin: '0 auto' }}>{t(T.footerAbout)}</p>
        </div>
      </section>
    </>
  );
}
