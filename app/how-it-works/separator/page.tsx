'use client';

import React from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────────────────────
// How KUON SEPARATOR Works — Meta Demucs v4 Deep Dive
// ─────────────────────────────────────────────────────────────

type L5 = Partial<Record<Lang, string>> & { en: string };
const t = (m: L5, lang: Lang): string => m[lang] ?? m.en;

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", "Consolas", monospace';
const ACCENT = '#0d9488';
const ACCENT_DARK = '#0f766e';
const ACCENT_LIGHT = '#14b8a6';

// ─────────────────────────────────────────────────────────────
// JSON-LD (GEO: AI citation optimization)
// ─────────────────────────────────────────────────────────────
const techArticleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'How KUON SEPARATOR Works — Meta Demucs v4 Hybrid U-Net',
  description:
    'Deep technical dive into Demucs v4 audio source separation: hybrid U-Net, spectrogram + waveform dual-domain processing, cross-domain transformer, MUSDB18-HQ training, production deployment.',
  author: {
    '@type': 'Person',
    name: 'Kotaro Asahina',
    url: 'https://kotaroasahina.com',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Kuon R&D',
    url: 'https://kuon-rnd.com',
  },
  datePublished: '2026-04-23',
  dateModified: '2026-04-23',
  mainEntityOfPage: 'https://kuon-rnd.com/how-it-works/separator',
  image: 'https://kuon-rnd.com/og-separator-technical.jpeg',
  about: [
    { '@type': 'Thing', name: 'Audio Source Separation' },
    { '@type': 'Thing', name: 'Demucs' },
    { '@type': 'Thing', name: 'Deep Learning' },
    { '@type': 'Thing', name: 'U-Net' },
  ],
  keywords:
    'Demucs, audio source separation, U-Net, spectrogram, waveform, cross-domain transformer, MUSDB18, SI-SDR, deep learning, music demixing',
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What AI model does KUON SEPARATOR use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'KUON SEPARATOR uses Meta AI Research\'s Demucs v4 (htdemucs) — a hybrid U-Net model that processes audio in both the spectrogram and raw waveform domains simultaneously, combined via cross-domain attention. It was trained on MUSDB18-HQ and achieves state-of-the-art SI-SDR scores on vocals, drums, bass, and other-instrument stems.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why is audio source separation mathematically hard?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Source separation is a blind source separation (BSS) problem: you have one observation (the mix) but need to recover multiple unknown signals. With N signals and 1 observation, the system is mathematically underdetermined — there are infinitely many possible factorizations. Classical methods (ICA, NMF) required multiple microphones or strong priors. Deep learning solves this by learning strong priors from millions of training examples.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does hybrid spectrogram-waveform processing work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Demucs v4 has two parallel U-Net branches. One processes the Short-Time Fourier Transform (STFT) spectrogram — which captures harmonic content well. The other processes raw waveform samples — which preserves transient details like drum hits and plosives. The two branches exchange information through cross-domain transformer attention, then their outputs are combined. This is why Demucs excels at both tonal instruments and percussive transients.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why deploy on CPU instead of GPU?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'At launch we deploy on Cloud Run with 4 vCPU / 16 GB RAM. CPU inference of Demucs v4 takes ~4-6 minutes per 4-minute song, which is acceptable for a queue-based workflow. This keeps cold-start latency low (no GPU driver overhead) and eliminates per-hour GPU fees for low-volume periods. As MRR grows we will migrate to NVIDIA L4 GPU inference for ~1-minute processing.',
      },
    },
    {
      '@type': 'Question',
      name: 'What privacy guarantees does KUON SEPARATOR provide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Uploaded audio is stored on Cloudflare R2 with a 24-hour lifecycle policy — files auto-delete after 24 hours. We do not train any model on user data. The Demucs v4 weights are pre-trained by Meta and frozen; user audio only flows through inference, never into training. All API calls are authenticated with a shared secret between the Next.js proxy and the Cloud Run worker.',
      },
    },
  ],
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://kuon-rnd.com' },
    { '@type': 'ListItem', position: 2, name: 'How It Works', item: 'https://kuon-rnd.com/how-it-works' },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'KUON SEPARATOR Architecture',
      item: 'https://kuon-rnd.com/how-it-works/separator',
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// i18n content
// ─────────────────────────────────────────────────────────────
const T = {
  heroEyebrow: {
    en: 'Technical Deep Dive',
    ja: '技術解説',
    es: 'Inmersión técnica',
    ko: '기술 해설',
    pt: 'Imersão técnica',
  } as L5,
  heroTitle: {
    en: 'How KUON SEPARATOR Works',
    ja: 'KUON SEPARATOR の仕組み',
    es: 'Cómo funciona KUON SEPARATOR',
    ko: 'KUON SEPARATOR 작동 원리',
    pt: 'Como KUON SEPARATOR Funciona',
  } as L5,
  heroSubtitle: {
    en: 'Meta Demucs v4 hybrid U-Net — how one mixed signal is decomposed into vocals, drums, bass, and other instruments.',
    ja: 'Meta の Demucs v4（htdemucs）ハイブリッド U-Net が、どうやって 1 本のミックス音源から、ボーカル・ドラム・ベース・楽器の 4 ステムを取り出すのか。',
    es: 'La U-Net híbrida Demucs v4 de Meta — cómo una señal mezclada se descompone en voz, batería, bajo y otros instrumentos.',
    ko: 'Meta의 Demucs v4 하이브리드 U-Net이 어떻게 하나의 믹스 신호에서 보컬·드럼·베이스·악기를 분리하는지 알아봅니다.',
    pt: 'A U-Net híbrida Demucs v4 da Meta — como um sinal misto é decomposto em voz, bateria, baixo e outros instrumentos.',
  } as L5,

  sec1Title: {
    en: 'What is Audio Source Separation?',
    ja: '音源分離とは何か',
    es: '¿Qué es la separación de fuentes?',
    ko: '음원 분리란?',
    pt: 'O que é separação de fontes de áudio?',
  } as L5,
  sec1Body: {
    en: 'Audio source separation is the task of recovering individual sound sources from a single mixed recording. Given a stereo master of a pop song, we want to output four separate tracks: the lead vocal, the drum kit, the bass line, and everything else (guitars, keys, strings). To a human ear this feels natural — we can listen to a band and pick out the bassist. To a computer, it is one of the hardest problems in signal processing.',
    ja: '音源分離とは、1 本のミックス録音から、個々の音源を取り出す処理のことです。ポップソングのステレオマスターを入力すると、出力として 4 本の独立したトラック（リードボーカル、ドラムキット、ベースライン、それ以外の楽器すべて）が得られます。人間の耳には自然な作業に感じますが、計算機にとっては信号処理の中でも最も難しい問題のひとつです。',
    es: 'La separación de fuentes es la tarea de recuperar fuentes de sonido individuales de una única grabación mezclada. Dada una master estéreo de una canción pop, queremos obtener cuatro pistas separadas: la voz principal, la batería, la línea de bajo y todo lo demás (guitarras, teclados, cuerdas).',
    ko: '음원 분리는 하나의 믹스 녹음에서 개별 음원을 복구하는 작업입니다. 팝송의 스테레오 마스터를 입력하면 리드 보컬, 드럼 키트, 베이스 라인, 그리고 그 외 모든 악기의 4개 트랙을 출력합니다.',
    pt: 'A separação de fontes é a tarefa de recuperar fontes sonoras individuais de uma única gravação mixada. Dada uma master estéreo de uma música pop, queremos obter quatro faixas separadas: voz principal, bateria, linha de baixo e tudo o mais.',
  } as L5,

  sec2Title: {
    en: 'Why It Is Mathematically Hard',
    ja: 'なぜこれが数学的に難しいのか',
    es: 'Por qué es matemáticamente difícil',
    ko: '왜 수학적으로 어려운가',
    pt: 'Por que é matematicamente difícil',
  } as L5,
  sec2Body1: {
    en: 'Source separation is a classical blind source separation (BSS) problem. If x(t) is the observed mix and s₁(t), …, sₙ(t) are the unknown sources, the mix can be written as x(t) = Σᵢ sᵢ(t). We observe one signal and need to recover n. That system is underdetermined — there are infinitely many n-tuples that sum to x.',
    ja: '音源分離は古典的なブラインド音源分離（BSS）問題です。観測信号 x(t) と未知の音源 s₁(t)…sₙ(t) があるとき、ミックスは x(t) = Σᵢ sᵢ(t) と書けます。1 本の観測から n 本を取り出そうとしているので、この方程式系は劣決定系（underdetermined）です — 和が x になる n 組の組み合わせは無限に存在します。',
    es: 'La separación de fuentes es un problema clásico de separación ciega de fuentes (BSS). Si x(t) es la mezcla y s₁(t), …, sₙ(t) son las fuentes desconocidas, podemos escribir x(t) = Σᵢ sᵢ(t). Es un sistema subdeterminado.',
    ko: '음원 분리는 고전적인 블라인드 음원 분리(BSS) 문제입니다. 관측 x(t) = Σᵢ sᵢ(t)에서 하나의 관측으로 n개의 소스를 복구해야 하므로 수학적으로 불충분(underdetermined)한 시스템입니다.',
    pt: 'A separação de fontes é um problema clássico de separação cega de fontes (BSS). Com x(t) = Σᵢ sᵢ(t), uma observação para n fontes: o sistema é subdeterminado.',
  } as L5,
  sec2Body2: {
    en: 'Independent Component Analysis (ICA) and Non-negative Matrix Factorization (NMF) were the classical answers. ICA needs at least as many microphones as sources. NMF needs strong structural assumptions (non-negative spectral templates). Neither works on a real pop mix where one stereo file contains a dozen instruments and three effects buses. The modern answer — deep neural networks — side-steps the math entirely: rather than solving the system, they learn the statistical shape of vocals, drums, bass, and other-instrument signals from millions of examples, and exploit those priors to pick the most likely decomposition.',
    ja: '独立成分分析（ICA）と非負値行列因子分解（NMF）が古典的な解法でした。ICA は音源と同数以上のマイクが必要です。NMF は非負スペクトルテンプレートという強い構造仮定を必要とします。どちらも、1 本のステレオファイルに十数個の楽器と 3 系統のエフェクトバスが収まっている実際のポップスには通用しません。現代の答えであるディープニューラルネットワークは、数学的にこの方程式を解くのをやめ、代わりに「ボーカル、ドラム、ベース、その他楽器」の統計的な形を、数百万の学習例から学習します。学習した事前確率を使って最も尤もらしい分解を選び取るのです。',
    es: 'ICA y NMF fueron las respuestas clásicas. ICA requiere al menos tantos micrófonos como fuentes. NMF requiere plantillas espectrales no negativas. Ninguno funciona en una mezcla pop real. La respuesta moderna — redes neuronales profundas — aprende los priors estadísticos de voz, batería, bajo y otros instrumentos a partir de millones de ejemplos.',
    ko: '고전적으로는 ICA(독립성분분석)와 NMF(비음수행렬분해)가 답이었습니다. 실제 팝 믹스에는 통하지 않습니다. 현대의 답은 딥러닝 — 수백만 개의 학습 예제로부터 각 소스의 통계적 형태를 학습합니다.',
    pt: 'ICA e NMF foram as respostas clássicas. Nenhum funciona em uma mixagem pop real. A resposta moderna — redes neurais profundas — aprende priors estatísticos de voz, bateria, baixo e outros instrumentos a partir de milhões de exemplos.',
  } as L5,

  sec3Title: {
    en: 'Demucs v4: Hybrid U-Net Architecture',
    ja: 'Demucs v4：ハイブリッド U-Net アーキテクチャ',
    es: 'Demucs v4: Arquitectura U-Net híbrida',
    ko: 'Demucs v4: 하이브리드 U-Net 아키텍처',
    pt: 'Demucs v4: Arquitetura U-Net híbrida',
  } as L5,
  sec3Body1: {
    en: 'Meta AI Research published Demucs in 2019 and has iterated four times. Version 4 (htdemucs / hybrid-transformer-Demucs) runs two U-Net branches in parallel — one on spectrograms, one on raw waveform — and fuses them with a cross-domain transformer. This hybrid design is the single biggest reason Demucs v4 outperforms previous SOTA.',
    ja: 'Meta AI Research は 2019 年に Demucs を公開し、バージョン 4 まで改良を重ねてきました。Demucs v4（htdemucs / hybrid-transformer-Demucs）は、2 本の U-Net ブランチを並列に走らせます — 一方はスペクトログラム、もう一方は生波形を処理 — そして cross-domain transformer でそれらを融合します。このハイブリッド設計が、Demucs v4 が過去の SOTA を超えた最大の理由です。',
    es: 'Meta AI Research publicó Demucs en 2019 y lo iteró cuatro veces. La versión 4 (htdemucs) ejecuta dos ramas U-Net en paralelo — una sobre espectrogramas, otra sobre forma de onda cruda — y las fusiona con un transformer de dominio cruzado.',
    ko: 'Meta AI Research는 2019년에 Demucs를 발표했고 버전 4까지 개선했습니다. Demucs v4(htdemucs)는 2개의 U-Net 분기를 병렬로 실행 — 하나는 스펙트로그램, 다른 하나는 원시 파형 — 하고 cross-domain transformer로 융합합니다.',
    pt: 'Meta AI Research publicou Demucs em 2019 e iterou quatro vezes. Versão 4 (htdemucs) executa dois ramos U-Net em paralelo — um em espectrogramas, outro em forma de onda bruta — e os funde com um transformer de domínio cruzado.',
  } as L5,

  sec4Title: {
    en: 'Why Spectrogram + Waveform?',
    ja: 'なぜスペクトログラム＋波形の二刀流なのか',
    es: '¿Por qué espectrograma + forma de onda?',
    ko: '왜 스펙트로그램 + 파형인가?',
    pt: 'Por que espectrograma + forma de onda?',
  } as L5,
  sec4Body: {
    en: 'Spectrograms (STFT magnitude with phase) are a natural domain for tonal content — chords, sustained vocals, and harmonic overtones all appear as clear horizontal ridges on a frequency-vs-time grid. Waveform-domain models, by contrast, preserve phase exactly and capture transient events — a snare hit, a plosive consonant, a string pluck — that get smeared across multiple spectrogram bins. Neither domain is superior; they each have a "vision" of the signal. Demucs v4 processes both and lets the cross-domain transformer decide how to combine them per frame. This is why its drum stem has crisp transients and its vocal stem has clean pitch.',
    ja: 'スペクトログラム（STFT 振幅＋位相）は、和音・持続するボーカル・倍音のような、トーナル（音程のある）な成分に向いた表現です。これらは周波数-時間グリッド上で水平に伸びる明瞭な線として現れます。一方、波形ドメインのモデルは位相を正確に保持し、スネアの一発、破裂子音、弦のピッキングといった過渡的な事象を正しく捉えます — これらはスペクトログラムでは複数のビンにまたがって滲んでしまいます。どちらが上というわけではなく、それぞれが信号に対して異なる「視点」を持っています。Demucs v4 は両方を並列に処理し、cross-domain transformer にフレームごとの融合を任せます。だから Demucs のドラムステムはトランジェントがパキッとしており、ボーカルステムはピッチが綺麗に残るのです。',
    es: 'Los espectrogramas son un dominio natural para contenido tonal — acordes, voces sostenidas, armónicos aparecen como crestas horizontales claras. Los modelos en dominio de forma de onda preservan la fase exactamente y capturan transitorios (golpes de caja, consonantes, pulsaciones de cuerda). Demucs v4 procesa ambos y deja que el transformer decida cómo combinarlos. Por eso su stem de batería tiene transitorios nítidos y su stem vocal tiene tono limpio.',
    ko: '스펙트로그램은 화성·지속음·배음 같은 음정적 콘텐츠에 자연스러운 도메인입니다. 파형 도메인 모델은 위상을 정확히 보존하고 스네어 타격, 파열 자음, 현 튕김 같은 과도 이벤트를 포착합니다. Demucs v4는 둘 다 처리하고 transformer가 프레임별로 결합 방법을 결정합니다.',
    pt: 'Espectrogramas são um domínio natural para conteúdo tonal — acordes, vozes sustentadas, harmônicos aparecem como cristas horizontais claras. Modelos em domínio de forma de onda preservam a fase exatamente e capturam transitórios (golpes de caixa, consoantes plosivas, pulsações de corda). Demucs v4 processa ambos e deixa o transformer decidir.',
  } as L5,

  sec5Title: {
    en: 'Cross-Domain Transformer',
    ja: 'Cross-Domain Transformer',
    es: 'Transformer de dominio cruzado',
    ko: 'Cross-Domain Transformer',
    pt: 'Transformer de domínio cruzado',
  } as L5,
  sec5Body: {
    en: 'At the U-Net bottleneck, spectrogram features and waveform features meet a transformer with bi-directional cross-attention. In plain terms: for every time-frame, the spectrogram branch gets to "ask" the waveform branch what the transient looked like, and vice-versa. This is the opposite of ensembling (which averages predictions independently). Here the two branches literally condition on each other mid-inference. Meta reports this cross-attention accounts for ~0.5 dB of SI-SDR improvement over the non-hybrid baseline — a large gap at this level of the state of the art.',
    ja: 'U-Net のボトルネック層で、スペクトログラム特徴量と波形特徴量は、双方向 cross-attention を持つ transformer に合流します。平たく言えば、時間フレームごとに、スペクトログラムブランチが波形ブランチに「ここの過渡はどう見えた？」と尋ね、逆もまた然り。これは独立した予測を平均するアンサンブルとは逆の発想です — 2 本のブランチが推論の途中で互いに条件付けし合っているのです。Meta の論文では、この cross-attention が SI-SDR で約 0.5 dB の改善に寄与すると報告されています。SOTA のこの水準では巨大な差です。',
    es: 'En el cuello de botella de la U-Net, los features de espectrograma y forma de onda encuentran un transformer con atención cruzada bidireccional. Cada frame permite que una rama "pregunte" a la otra. Meta reporta ~0.5 dB de mejora SI-SDR sobre la línea base no híbrida — una brecha grande al nivel del estado del arte.',
    ko: 'U-Net 병목 층에서 스펙트로그램과 파형 특징이 양방향 cross-attention transformer에서 만납니다. 각 프레임에서 서로를 조건화합니다. Meta는 비-하이브리드 기준선 대비 약 0.5 dB SI-SDR 개선을 보고합니다.',
    pt: 'No gargalo da U-Net, features de espectrograma e forma de onda encontram um transformer com atenção cruzada bidirecional. Cada ramo "pergunta" ao outro. Meta relata ~0.5 dB de melhoria SI-SDR sobre a linha de base não híbrida.',
  } as L5,

  sec6Title: {
    en: 'Training Data: MUSDB18-HQ',
    ja: '学習データ：MUSDB18-HQ',
    es: 'Datos de entrenamiento: MUSDB18-HQ',
    ko: '학습 데이터: MUSDB18-HQ',
    pt: 'Dados de treinamento: MUSDB18-HQ',
  } as L5,
  sec6Body: {
    en: 'Demucs is trained on MUSDB18-HQ — 150 songs with fully-mixed stereo masters plus their corresponding four isolated stems (vocals, drums, bass, other). 100 songs for training, 50 for test. The magic of supervised training: the network sees the mix, predicts four stems, is penalised by the L1/SI-SDR loss against the ground-truth stems, and the gradient flows back through both U-Net branches and the cross-domain transformer. Over ~120,000 training steps the network internalises what vocals, drums, bass, and "other" sound like in isolation — independent of any single song.',
    ja: 'Demucs は MUSDB18-HQ で学習されます — 完全にミックスされたステレオマスターと、それに対応する 4 本の孤立したステム（ボーカル、ドラム、ベース、その他）が揃った 150 曲のデータセット。訓練に 100 曲、テストに 50 曲。教師あり学習の魔法は、ネットワークがミックスを見て 4 ステムを予測し、ground-truth ステムとの L1 / SI-SDR 損失で罰せられ、その勾配が両方の U-Net ブランチと cross-domain transformer を逆伝搬していくこと。約 12 万ステップの学習を経て、ネットワークはボーカル・ドラム・ベース・「その他」が単独でどう鳴るかを、特定の 1 曲に依存しない形で内在化します。',
    es: 'Demucs se entrena con MUSDB18-HQ — 150 canciones con masters mixtos y sus cuatro stems aislados (voz, batería, bajo, otros). 100 para entrenamiento, 50 para test. La red ve la mezcla, predice cuatro stems, se penaliza con pérdida L1/SI-SDR contra los stems reales, y el gradiente fluye de vuelta a través de ambas ramas U-Net y el transformer.',
    ko: 'Demucs는 MUSDB18-HQ로 학습됩니다 — 150곡의 풀믹스 스테레오 마스터와 그에 대응하는 4개 분리 스템(보컬, 드럼, 베이스, 기타)의 데이터셋. 100곡 훈련용, 50곡 테스트용. 약 12만 스텝의 훈련을 통해 네트워크가 각 소스의 소리를 내재화합니다.',
    pt: 'Demucs é treinado com MUSDB18-HQ — 150 músicas com masters mixados e seus quatro stems isolados (voz, bateria, baixo, outros). 100 para treinamento, 50 para teste. A rede vê a mistura, prevê quatro stems, é penalizada com perda L1/SI-SDR contra os stems reais.',
  } as L5,

  sec7Title: {
    en: 'SI-SDR: How We Know It Actually Works',
    ja: 'SI-SDR：「本当に動いている」ことをどう検証するか',
    es: 'SI-SDR: cómo sabemos que realmente funciona',
    ko: 'SI-SDR: 실제로 작동함을 어떻게 확인하는가',
    pt: 'SI-SDR: como sabemos que realmente funciona',
  } as L5,
  sec7Body: {
    en: 'Scale-Invariant Signal-to-Distortion Ratio (SI-SDR) is the industry-standard metric for source separation quality. It computes the ratio of signal energy to residual distortion energy, after optimally scaling the separated signal. A SI-SDR of 0 dB means distortion equals signal. Demucs v4 achieves roughly: vocals 9.0 dB, drums 10.8 dB, bass 9.6 dB, other 7.6 dB on MUSDB18-HQ test. For reference, the best single-domain models from 2021 sat around 7-8 dB on vocals.',
    ja: 'Scale-Invariant Signal-to-Distortion Ratio（SI-SDR）は、音源分離の品質を測る業界標準の指標です。分離信号を最適にスケーリングしたあと、信号エネルギーと残留歪みエネルギーの比を計算します。SI-SDR = 0 dB は「歪み = 信号」を意味します。Demucs v4 は MUSDB18-HQ テストセットで、ボーカル 9.0 dB、ドラム 10.8 dB、ベース 9.6 dB、その他 7.6 dB を達成しています。参考までに、2021 年時点のシングルドメイン最良モデルはボーカルで 7-8 dB あたりでした。',
    es: 'SI-SDR es la métrica estándar de la industria para calidad de separación de fuentes. Demucs v4 alcanza aprox.: voz 9.0 dB, batería 10.8 dB, bajo 9.6 dB, otros 7.6 dB en el test MUSDB18-HQ.',
    ko: 'SI-SDR은 음원 분리 품질의 업계 표준 지표입니다. Demucs v4는 MUSDB18-HQ 테스트에서 보컬 9.0 dB, 드럼 10.8 dB, 베이스 9.6 dB, 기타 7.6 dB를 달성합니다.',
    pt: 'SI-SDR é a métrica padrão da indústria para qualidade de separação de fontes. Demucs v4 alcança aprox.: voz 9.0 dB, bateria 10.8 dB, baixo 9.6 dB, outros 7.6 dB no test MUSDB18-HQ.',
  } as L5,

  sec8Title: {
    en: 'How KUON SEPARATOR Actually Deploys It',
    ja: 'KUON SEPARATOR は、これを実際にどうデプロイしているか',
    es: 'Cómo lo despliega KUON SEPARATOR',
    ko: 'KUON SEPARATOR가 실제로 배포하는 방식',
    pt: 'Como o KUON SEPARATOR realmente o implanta',
  } as L5,
  sec8Body: {
    en: 'KUON SEPARATOR runs Demucs v4 on Google Cloud Run in the asia-northeast1 region. The container image is 1.4 GB (PyTorch CPU + demucs + htdemucs model pre-baked into the image — no cold-start download). Each instance gets 4 vCPUs and 16 GB RAM. Concurrency is set to 1 per instance to avoid OOM during peak inference. Request lifecycle: user uploads to R2 → Next.js signs the job and calls Cloud Run → Cloud Run downloads from R2, runs inference (4-6 min for a 4-minute song), uploads 4 stem WAVs back to R2 → Next.js returns pre-signed download links. The 24-hour lifecycle rule on R2 guarantees nothing lingers.',
    ja: 'KUON SEPARATOR は Demucs v4 を Google Cloud Run の asia-northeast1 リージョンで走らせています。コンテナイメージは 1.4 GB（PyTorch CPU 版 + demucs + htdemucs モデルをイメージに焼き込み済み — cold start 時のモデルダウンロード不要）。各インスタンスは 4 vCPU と 16 GB RAM。ピーク推論での OOM 回避のため、concurrency は instance あたり 1 に設定。リクエストのライフサイクル：ユーザーが R2 にアップロード → Next.js がジョブを署名して Cloud Run を呼ぶ → Cloud Run が R2 からダウンロード、推論（4 分の曲で 4-6 分）、4 本のステム WAV を R2 にアップロードし戻す → Next.js が pre-signed なダウンロードリンクを返す。R2 の 24 時間ライフサイクルルールが、何も残らないことを保証します。',
    es: 'KUON SEPARATOR ejecuta Demucs v4 en Google Cloud Run en asia-northeast1. Imagen de 1.4 GB (PyTorch CPU + demucs + modelo htdemucs pre-horneado). Cada instancia: 4 vCPUs, 16 GB RAM, concurrency = 1. Inferencia: 4-6 min por canción de 4 min.',
    ko: 'KUON SEPARATOR는 Google Cloud Run asia-northeast1에서 Demucs v4를 실행합니다. 1.4 GB 이미지 (PyTorch CPU + demucs + htdemucs 모델 사전 내장). 인스턴스당 4 vCPU, 16 GB RAM, concurrency = 1. 추론: 4분 곡에 4-6분.',
    pt: 'KUON SEPARATOR executa Demucs v4 no Google Cloud Run em asia-northeast1. Imagem de 1.4 GB (PyTorch CPU + demucs + modelo htdemucs pré-assado). Cada instância: 4 vCPUs, 16 GB RAM, concurrency = 1. Inferência: 4-6 min por música de 4 min.',
  } as L5,

  sec9Title: {
    en: 'Privacy: No Training, 24-Hour Lifecycle',
    ja: 'プライバシー：学習せず、24 時間で自動削除',
    es: 'Privacidad: sin entrenamiento, ciclo de 24 h',
    ko: '프라이버시: 학습 없음, 24시간 라이프사이클',
    pt: 'Privacidade: sem treinamento, ciclo de 24h',
  } as L5,
  sec9Body: {
    en: 'Unlike cloud AI services that monetise by training on your data, KUON SEPARATOR\'s Demucs weights are frozen. Meta released the pre-trained htdemucs model under the MIT license; we use it unchanged. Your uploaded audio flows through inference only — never into training. R2 bucket objects have a 24-hour auto-delete rule at the bucket level. Even if you abandon a download link, the files vanish after one day. Authentication between our Next.js proxy and Cloud Run uses a 32-byte secret bearer token, so nobody except the proxy can hit our worker.',
    ja: '多くのクラウド AI サービスがユーザーデータで追加学習して収益化するのと違い、KUON SEPARATOR の Demucs の重みは凍結されています。Meta は学習済みの htdemucs モデルを MIT ライセンスで公開しており、私たちはそれをそのまま使っています。アップロードされた音声は推論だけを通過し、一度も学習には入りません。R2 バケットのオブジェクトは、バケットレベルで 24 時間の自動削除ルールがかかっています。あなたがダウンロードリンクを放置したとしても、ファイルは 1 日後に消えます。Next.js プロキシと Cloud Run の間の認証は 32 バイトのシークレット bearer トークンで行われ、プロキシ以外の誰もワーカーには到達できません。',
    es: 'A diferencia de servicios cloud que monetizan entrenando con tus datos, los pesos de Demucs en KUON SEPARATOR están congelados. Meta publicó el modelo htdemucs preentrenado bajo licencia MIT; lo usamos sin cambios. Tu audio solo pasa por inferencia. Regla de auto-borrado de 24 h en R2.',
    ko: '사용자 데이터로 추가 학습하는 일반 클라우드 AI 서비스와 달리, KUON SEPARATOR의 Demucs 가중치는 고정되어 있습니다. Meta가 MIT 라이선스로 공개한 htdemucs를 그대로 사용. 업로드된 오디오는 추론만 거칩니다. R2 24시간 자동 삭제 규칙.',
    pt: 'Diferente de serviços cloud que monetizam treinando com seus dados, os pesos Demucs do KUON SEPARATOR estão congelados. Meta publicou o htdemucs pré-treinado sob licença MIT; usamos sem modificar. Seu áudio só passa por inferência. Regra de auto-exclusão de 24h no R2.',
  } as L5,

  sec10Title: {
    en: 'Practical Quality: What Demucs Gets Right',
    ja: '実用的な品質：Demucs が得意なこと',
    es: 'Calidad práctica: lo que Demucs hace bien',
    ko: '실용적 품질: Demucs가 잘하는 것',
    pt: 'Qualidade prática: o que o Demucs acerta',
  } as L5,
  sec10Body: {
    en: 'In practice Demucs v4 produces stems that are usable as-is for karaoke, minus-one practice tracks, re-mixing, and transcription. Vocals separate cleanly from instrumentals even in dense mixes. Drums have crisp kick and snare attacks with very little vocal bleed. Bass isolates well when the bassline is distinct from kick-drum fundamentals. The "other" stem holds guitars, keys, strings, brass, and any effects bus — it is intentionally a catch-all rather than a per-instrument separation. Edge cases: spoken-word overdubs, heavily-processed vocoder parts, and reverb-soaked live recordings are where Demucs can smear.',
    ja: '実際のところ、Demucs v4 の出力ステムはカラオケ・マイナスワン練習トラック・リミックス・採譜に、そのまま使える品質があります。密度の高いミックスでもボーカルは伴奏から綺麗に分離されます。ドラムはキックとスネアのアタックがパキッと残り、ボーカルの混入はごく僅か。ベースは、ベースラインがキックの基音から離れている場合によく分離します。「その他」ステムはギター・鍵盤・ストリングス・ブラス・エフェクトバスを全部含みます — 楽器別ではなく、意図的にまとめたステムです。苦手なケース：語りオーバーダブ、ボコーダーの重い処理、リバーブの深いライブ録音では、Demucs は滲むことがあります。',
    es: 'En la práctica, Demucs v4 produce stems usables tal cual para karaoke, minus-one, remixado y transcripción. Voces limpias, drums con ataques crujientes, bajo bien aislado cuando es distinto del bombo. El stem "other" agrupa guitarras, teclados, cuerdas, metales y efectos — es intencionalmente un cajón de sastre.',
    ko: '실제로 Demucs v4 출력 스템은 노래방, 마이너스원 연습, 리믹스, 채보에 그대로 사용 가능합니다. 보컬은 밀도 높은 믹스에서도 깔끔하게 분리됩니다. "기타" 스템은 기타·키보드·현악·브라스·이펙트를 모두 포함합니다.',
    pt: 'Na prática, Demucs v4 produz stems utilizáveis imediatamente para karaokê, minus-one, remix e transcrição. Vozes limpas, drums com ataques crocantes. O stem "other" agrupa guitarras, teclados, cordas, metais e efeitos.',
  } as L5,

  sec11Title: {
    en: 'Roadmap: From Separation to Understanding',
    ja: 'ロードマップ：分離から「理解」へ',
    es: 'Hoja de ruta: de la separación a la comprensión',
    ko: '로드맵: 분리에서 이해로',
    pt: 'Roteiro: da separação à compreensão',
  } as L5,
  sec11Body: {
    en: 'Source separation is the entry point, not the destination. KUON SEPARATOR feeds a downstream pipeline: KUON TRANSCRIBER (stem → MusicXML score via basic-pitch), KUON INTONATION ANALYZER (stem → cent-precision pitch over time), KUON MINUS-ONE GENERATOR (mute-by-stem karaoke with guide vocals), KUON HARMONY ANALYZER (chord extraction from the "other" stem with music21). Each is a standalone app, but they compose: separate once, then transcribe, analyse, and practise against the result. This is the Pro-subscription flywheel.',
    ja: '音源分離は入口であって終点ではありません。KUON SEPARATOR は下流のパイプラインに接続されます：KUON TRANSCRIBER（ステム → MusicXML 楽譜、basic-pitch 経由）、KUON INTONATION ANALYZER（ステム → セント精度のピッチ時系列）、KUON MINUS-ONE GENERATOR（ステム別ミュートでガイドボーカル付きマイナスワン）、KUON HARMONY ANALYZER（「その他」ステムから music21 でコード抽出）。それぞれが独立したアプリですが、連携します：一度分離すれば、あとは採譜・分析・練習を積み上げていけます。これが Pro サブスクリプションのフライホイールです。',
    es: 'La separación es el punto de entrada, no el destino. KUON SEPARATOR alimenta una cadena: KUON TRANSCRIBER (stem → partitura MusicXML), KUON INTONATION ANALYZER (afinación en centésimas), KUON MINUS-ONE GENERATOR (karaoke con guía), KUON HARMONY ANALYZER (extracción de acordes).',
    ko: '음원 분리는 시작점이지 종착점이 아닙니다. KUON SEPARATOR는 다운스트림 파이프라인을 공급합니다: KUON TRANSCRIBER, KUON INTONATION ANALYZER, KUON MINUS-ONE GENERATOR, KUON HARMONY ANALYZER.',
    pt: 'A separação é o ponto de entrada, não o destino. KUON SEPARATOR alimenta uma pipeline: KUON TRANSCRIBER, KUON INTONATION ANALYZER, KUON MINUS-ONE GENERATOR, KUON HARMONY ANALYZER.',
  } as L5,

  tryCta: {
    en: 'Try KUON SEPARATOR',
    ja: 'KUON SEPARATOR を試す',
    es: 'Prueba KUON SEPARATOR',
    ko: 'KUON SEPARATOR 시도',
    pt: 'Experimente KUON SEPARATOR',
  } as L5,
  relatedTitle: {
    en: 'Related Technical Articles',
    ja: '関連する技術記事',
    es: 'Artículos técnicos relacionados',
    ko: '관련 기술 기사',
    pt: 'Artigos técnicos relacionados',
  } as L5,
  linkDsd: {
    en: 'How KUON DSD Works — Rust × Wasm',
    ja: 'KUON DSD の仕組み — Rust × Wasm',
    es: 'Cómo funciona KUON DSD — Rust × Wasm',
    ko: 'KUON DSD 작동 원리 — Rust × Wasm',
    pt: 'Como KUON DSD Funciona — Rust × Wasm',
  } as L5,
  linkDdp: {
    en: 'How KUON DDP CHECKER Works',
    ja: 'KUON DDP CHECKER の仕組み',
    es: 'Cómo funciona KUON DDP CHECKER',
    ko: 'KUON DDP CHECKER 작동 원리',
    pt: 'Como KUON DDP CHECKER Funciona',
  } as L5,
} as const;

// ─────────────────────────────────────────────────────────────
// Visual: Demucs v4 architecture diagram (SVG)
// ─────────────────────────────────────────────────────────────
function ArchitectureDiagram() {
  return (
    <div style={{ width: '100%', overflowX: 'auto', marginBottom: '2rem' }}>
      <svg
        viewBox="0 0 900 420"
        style={{ width: '100%', minWidth: 600, height: 'auto', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="branchSpec" x1="0" x2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="branchWave" x1="0" x2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.6" />
          </linearGradient>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#555" />
          </marker>
        </defs>

        {/* Input */}
        <rect x="20" y="180" width="140" height="60" rx="8" fill="#1a1a1a" />
        <text x="90" y="208" fill="#fff" fontSize="14" fontFamily={sans} textAnchor="middle" fontWeight="600">
          Mixed Audio
        </text>
        <text x="90" y="226" fill="#94a3b8" fontSize="11" fontFamily={sans} textAnchor="middle">
          stereo WAV
        </text>

        {/* Split arrows */}
        <line x1="160" y1="200" x2="240" y2="100" stroke="#555" strokeWidth="2" markerEnd="url(#arrow)" />
        <line x1="160" y1="220" x2="240" y2="320" stroke="#555" strokeWidth="2" markerEnd="url(#arrow)" />

        {/* Spectrogram branch */}
        <rect x="240" y="60" width="260" height="90" rx="8" fill="url(#branchSpec)" />
        <text x="370" y="95" fill="#fff" fontSize="15" fontFamily={sans} textAnchor="middle" fontWeight="700">
          Spectrogram U-Net
        </text>
        <text x="370" y="116" fill="#fff" fontSize="11" fontFamily={sans} textAnchor="middle" opacity="0.95">
          STFT → encoder → bottleneck
        </text>
        <text x="370" y="132" fill="#fff" fontSize="11" fontFamily={sans} textAnchor="middle" opacity="0.95">
          → decoder → iSTFT
        </text>

        {/* Waveform branch */}
        <rect x="240" y="290" width="260" height="90" rx="8" fill="url(#branchWave)" />
        <text x="370" y="325" fill="#111" fontSize="15" fontFamily={sans} textAnchor="middle" fontWeight="700">
          Waveform U-Net
        </text>
        <text x="370" y="346" fill="#111" fontSize="11" fontFamily={sans} textAnchor="middle">
          Conv1D encoder → bottleneck
        </text>
        <text x="370" y="362" fill="#111" fontSize="11" fontFamily={sans} textAnchor="middle">
          → ConvTranspose decoder
        </text>

        {/* Cross-domain transformer */}
        <rect x="530" y="175" width="170" height="70" rx="8" fill="#6D28D9" />
        <text x="615" y="205" fill="#fff" fontSize="13" fontFamily={sans} textAnchor="middle" fontWeight="700">
          Cross-Domain
        </text>
        <text x="615" y="224" fill="#fff" fontSize="13" fontFamily={sans} textAnchor="middle" fontWeight="700">
          Transformer
        </text>

        {/* Merge arrows */}
        <line x1="500" y1="105" x2="545" y2="185" stroke="#555" strokeWidth="2" markerEnd="url(#arrow)" />
        <line x1="500" y1="335" x2="545" y2="235" stroke="#555" strokeWidth="2" markerEnd="url(#arrow)" />

        {/* Bidirectional attention inside */}
        <text x="615" y="162" fill="#a78bfa" fontSize="10" fontFamily={mono} textAnchor="middle">
          ↕ bi-directional attention ↕
        </text>

        {/* Output stems */}
        <line x1="700" y1="210" x2="740" y2="210" stroke="#555" strokeWidth="2" markerEnd="url(#arrow)" />
        {[
          { y: 60, color: '#10b981', label: 'Vocals' },
          { y: 140, color: '#ef4444', label: 'Drums' },
          { y: 220, color: '#f59e0b', label: 'Bass' },
          { y: 300, color: '#3b82f6', label: 'Other' },
        ].map((s, i) => (
          <g key={i}>
            <rect x="740" y={s.y} width="140" height="50" rx="6" fill={s.color} />
            <text
              x="810"
              y={s.y + 30}
              fill="#fff"
              fontSize="14"
              fontFamily={sans}
              textAnchor="middle"
              fontWeight="600"
            >
              {s.label}
            </text>
          </g>
        ))}
        {/* Output arrows from transformer */}
        <line x1="700" y1="195" x2="740" y2="85" stroke="#ddd" strokeWidth="1.5" />
        <line x1="700" y1="205" x2="740" y2="165" stroke="#ddd" strokeWidth="1.5" />
        <line x1="700" y1="215" x2="740" y2="245" stroke="#ddd" strokeWidth="1.5" />
        <line x1="700" y1="225" x2="740" y2="325" stroke="#ddd" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section primitives
// ─────────────────────────────────────────────────────────────
function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{
        marginTop: 'clamp(3rem, 8vw, 5rem)',
        marginBottom: 'clamp(2rem, 6vw, 4rem)',
      }}
    >
      <h2
        style={{
          fontSize: 'clamp(1.65rem, 4.5vw, 2.25rem)',
          fontFamily: serif,
          fontWeight: 600,
          color: '#111',
          marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
          lineHeight: 1.3,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
        color: '#333',
        lineHeight: 1.85,
        marginBottom: '1rem',
        fontFamily: sans,
        letterSpacing: '0.005em',
      }}
    >
      {children}
    </p>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div
      style={{
        padding: 'clamp(1rem, 2.5vw, 1.5rem)',
        background: '#fff',
        borderRadius: 10,
        border: `2px solid ${color}`,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontFamily: mono,
          fontWeight: 700,
          color,
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
          color: '#555',
          marginTop: 4,
          fontFamily: sans,
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function HowItWorksSeparatorPage() {
  const { lang } = useLang();

  return (
    <>
      {/* JSON-LD for GEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main
        style={{
          maxWidth: 860,
          margin: '0 auto',
          padding: 'clamp(1.5rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem) 4rem',
          fontFamily: sans,
          color: '#1a1a1a',
        }}
      >
        {/* Hero */}
        <header style={{ paddingTop: 'clamp(2rem, 6vw, 4rem)' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: 999,
              background: `${ACCENT}15`,
              color: ACCENT_DARK,
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            {t(T.heroEyebrow, lang)}
          </div>
          <h1
            style={{
              fontSize: 'clamp(2rem, 6vw, 3.25rem)',
              fontFamily: serif,
              fontWeight: 700,
              lineHeight: 1.2,
              color: '#0a0a0a',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}
          >
            {t(T.heroTitle, lang)}
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 2.8vw, 1.3rem)',
              color: '#555',
              lineHeight: 1.7,
              maxWidth: 720,
              fontFamily: sans,
            }}
          >
            {t(T.heroSubtitle, lang)}
          </p>

          <div style={{ marginTop: '2rem' }}>
            <ArchitectureDiagram />
          </div>
        </header>

        <Section title={t(T.sec1Title, lang)}>
          <P>{t(T.sec1Body, lang)}</P>
        </Section>

        <Section title={t(T.sec2Title, lang)}>
          <P>{t(T.sec2Body1, lang)}</P>
          <P>{t(T.sec2Body2, lang)}</P>
        </Section>

        <Section title={t(T.sec3Title, lang)}>
          <P>{t(T.sec3Body1, lang)}</P>
        </Section>

        <Section title={t(T.sec4Title, lang)}>
          <P>{t(T.sec4Body, lang)}</P>
        </Section>

        <Section title={t(T.sec5Title, lang)}>
          <P>{t(T.sec5Body, lang)}</P>
        </Section>

        <Section title={t(T.sec6Title, lang)}>
          <P>{t(T.sec6Body, lang)}</P>
        </Section>

        <Section title={t(T.sec7Title, lang)}>
          <P>{t(T.sec7Body, lang)}</P>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 'clamp(0.75rem, 2vw, 1rem)',
              marginTop: '1.5rem',
            }}
          >
            <Stat value="9.0 dB" label="Vocals SI-SDR" color="#10b981" />
            <Stat value="10.8 dB" label="Drums SI-SDR" color="#ef4444" />
            <Stat value="9.6 dB" label="Bass SI-SDR" color="#f59e0b" />
            <Stat value="7.6 dB" label="Other SI-SDR" color="#3b82f6" />
          </div>
        </Section>

        <Section title={t(T.sec8Title, lang)}>
          <P>{t(T.sec8Body, lang)}</P>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 'clamp(0.75rem, 2vw, 1rem)',
              marginTop: '1.5rem',
            }}
          >
            <Stat value="4 vCPU" label="per Cloud Run instance" color={ACCENT} />
            <Stat value="16 GB" label="RAM per instance" color={ACCENT} />
            <Stat value="1.4 GB" label="container image size" color={ACCENT} />
            <Stat value="24 h" label="R2 lifecycle auto-delete" color={ACCENT} />
          </div>
        </Section>

        <Section title={t(T.sec9Title, lang)}>
          <P>{t(T.sec9Body, lang)}</P>
        </Section>

        <Section title={t(T.sec10Title, lang)}>
          <P>{t(T.sec10Body, lang)}</P>
        </Section>

        <Section title={t(T.sec11Title, lang)}>
          <P>{t(T.sec11Body, lang)}</P>
        </Section>

        {/* CTA + Related */}
        <section
          style={{
            marginTop: 'clamp(4rem, 10vw, 6rem)',
            padding: 'clamp(2rem, 5vw, 3rem)',
            borderRadius: 16,
            background: `linear-gradient(135deg, ${ACCENT_DARK} 0%, ${ACCENT_LIGHT} 100%)`,
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <Link
            href="/separator-lp"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: '#fff',
              color: ACCENT_DARK,
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
              textDecoration: 'none',
              letterSpacing: '0.02em',
              boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
            }}
          >
            {t(T.tryCta, lang)} →
          </Link>
        </section>

        <Section title={t(T.relatedTitle, lang)}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            <Link
              href="/how-it-works/dsd"
              style={{
                display: 'block',
                padding: 'clamp(1.25rem, 3vw, 1.5rem)',
                borderRadius: 12,
                border: '1px solid #e5e5e5',
                background: '#fff',
                textDecoration: 'none',
                color: '#111',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#7C3AED', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                DSD
              </div>
              <div style={{ fontSize: '1.05rem', fontFamily: serif, marginTop: 6, fontWeight: 600 }}>
                {t(T.linkDsd, lang)}
              </div>
            </Link>
            <Link
              href="/how-it-works/ddp"
              style={{
                display: 'block',
                padding: 'clamp(1.25rem, 3vw, 1.5rem)',
                borderRadius: 12,
                border: '1px solid #e5e5e5',
                background: '#fff',
                textDecoration: 'none',
                color: '#111',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                DDP
              </div>
              <div style={{ fontSize: '1.05rem', fontFamily: serif, marginTop: 6, fontWeight: 600 }}>
                {t(T.linkDdp, lang)}
              </div>
            </Link>
          </div>
        </Section>
      </main>
    </>
  );
}
