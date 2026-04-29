'use client';

/**
 * /theory/m0/l01 — M0-01「音とは何か」
 * =========================================================
 * Kuon オリジナル M0 (Pre-notational) 第 1 弾。
 * OMT v2 範囲外 — 「譜面を読む前に音そのものに触れる」入門。
 *
 * 設計原則:
 *   Layer 1 (Story): 音とは何か — 空気の振動 / 耳の構造 / 周波数と知覚
 *   Layer 2 (Living Score): 周波数スライダー + 音色比較
 *   Layer 3 (Memory): 5 枚のフラッシュカード
 *
 * §49 整合性: 「音楽の定義」は文化と個人で異なる、という出発点。
 * §51 不適用 — このレッスンに五線譜は登場しない。
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace';

const INK = '#1a1a1a';
const INK_SOFT = '#475569';
const INK_FAINT = '#94a3b8';
const PAPER = '#fafaf7';
const PAPER_DEEP = '#f5f4ed';
const STAFF_LINE_COLOR = '#d4d0c4';
const ACCENT_INDIGO = '#3a3a5e';
const ACCENT_GOLD = '#9c7c3a';

type L6 = { ja?: string; en: string; es?: string; ko?: string; pt?: string; de?: string };
const t = (m: L6, lang: Lang): string => (m as Record<string, string>)[lang] ?? m.en;

// ─────────────────────────────────────────────────────────────
// Web Audio: 任意周波数のサイン波再生
// ─────────────────────────────────────────────────────────────
type Waveform = 'sine' | 'triangle' | 'square' | 'sawtooth';

function playFreq(freq: number, waveform: Waveform = 'sine', duration = 1.0) {
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = waveform;
  osc.frequency.value = freq;
  const t0 = ctx.currentTime;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(0.18, t0 + 0.02);
  g.gain.setValueAtTime(0.18, t0 + duration - 0.1);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration);
  setTimeout(() => ctx.close(), (duration + 0.2) * 1000);
}

// ─────────────────────────────────────────────────────────────
// Layer 3 フラッシュカード
// ─────────────────────────────────────────────────────────────
const FLASHCARDS: { q: L6; a: L6 }[] = [
  {
    q: { ja: '物理的に「音」とは何か?', en: 'What is "sound" physically?', es: '¿Qué es el sonido físicamente?', ko: '물리적으로 "소리"란?', pt: 'O que é o "som" fisicamente?', de: 'Was ist „Klang" physikalisch?' },
    a: { ja: '空気 (または水・物体) の規則的な振動。空気分子が前後に動き、その波が耳に届く。波の振動数 (周波数) が「音の高さ」、波の大きさ (振幅) が「音の大きさ」、波の形が「音色」を決める。', en: 'A regular vibration in air (or water, or solid bodies). Air molecules oscillate, and the wave reaches your ear. The frequency of the wave determines pitch, amplitude determines loudness, waveform shape determines timbre.', es: 'Una vibración regular en el aire. Las moléculas oscilan y la onda llega al oído. La frecuencia determina la altura, la amplitud el volumen, la forma de onda el timbre.', ko: '공기의 규칙적 진동. 공기 분자가 진동하며 파동이 귀에 도달. 주파수가 높이, 진폭이 크기, 파형이 음색을 결정.', pt: 'Uma vibração regular no ar. As moléculas oscilam e a onda chega ao ouvido. Frequência determina a altura, amplitude o volume, forma de onda o timbre.', de: 'Eine regelmäßige Schwingung in der Luft. Luftmoleküle schwingen, die Welle erreicht das Ohr. Frequenz = Tonhöhe, Amplitude = Lautstärke, Wellenform = Klangfarbe.' },
  },
  {
    q: { ja: '人間の耳が聴こえる周波数の範囲は?', en: 'What is the audible frequency range for humans?', es: '¿Qué rango de frecuencias oye el ser humano?', ko: '인간이 들을 수 있는 주파수 범위?', pt: 'Qual a faixa de frequência audível para humanos?', de: 'Welchen Frequenzbereich hört der Mensch?' },
    a: { ja: '個人差はあるが、一般に約 20 Hz から 20,000 Hz (20 kHz) まで。20 Hz より低い音は身体で「振動」として感じ、20 kHz より高い音は犬・コウモリには聴こえても人間には聴こえない。年齢とともに高音域は徐々に失われる。', en: 'Roughly 20 Hz to 20,000 Hz (20 kHz), with individual variation. Below 20 Hz we feel vibration in the body; above 20 kHz dogs and bats hear what humans cannot. The upper range narrows gradually with age.', es: 'Aproximadamente de 20 Hz a 20,000 Hz, con variación individual. Por debajo de 20 Hz sentimos vibración corporal.', ko: '대략 20 Hz 부터 20,000 Hz 까지, 개인차 있음. 20 Hz 이하는 몸으로 진동을 느끼고, 20 kHz 이상은 개나 박쥐만 듣는다. 나이와 함께 고음역은 좁아진다.', pt: 'Aproximadamente 20 Hz a 20,000 Hz, com variação individual. Abaixo de 20 Hz sentimos vibração corporal.', de: 'Etwa 20 Hz bis 20.000 Hz, individuell verschieden. Unter 20 Hz spüren wir die Schwingung körperlich, über 20 kHz hören Hunde und Fledermäuse, was wir nicht mehr hören.' },
  },
  {
    q: { ja: '「音色 (timbre)」とは何か?', en: 'What is timbre?', es: '¿Qué es el timbre?', ko: '"음색" 이란 무엇인가?', pt: 'O que é o timbre?', de: 'Was ist Klangfarbe?' },
    a: { ja: '同じ高さ・同じ大きさの音でも、ピアノ・ヴァイオリン・人の声で「違う」と感じる、その「違い」のこと。物理的には波形 (波の形) と倍音構成 (どの周波数がどの強さで含まれているか) が決める。脳が「楽器の指紋」として認識する。', en: 'The character that distinguishes two sounds of identical pitch and loudness — what makes a piano sound different from a violin or human voice. Physically determined by waveform shape and overtone composition. The brain recognizes it as the "fingerprint" of an instrument.', es: 'El carácter que distingue dos sonidos de misma altura y volumen — lo que hace que el piano suene distinto de un violín. Determinado por la forma de onda y los armónicos.', ko: '같은 높이·같은 크기의 소리도 피아노·바이올린·목소리에서 다르게 느껴지는 그 "차이". 물리적으로는 파형과 배음 구성이 결정. 뇌가 "악기의 지문" 으로 인식.', pt: 'O caráter que distingue dois sons de mesma altura e volume — o que faz um piano soar diferente de um violino. Determinado pela forma de onda e harmônicos.', de: 'Der Charakter, der zwei Klänge gleicher Höhe und Lautstärke unterscheidet — warum ein Klavier anders klingt als eine Geige. Physikalisch durch Wellenform und Obertonzusammensetzung bestimmt.' },
  },
  {
    q: { ja: '音は空気が振動する波である。では、宇宙空間 (真空) で音は伝わるか?', en: 'Sound is a wave through air. Can it travel in the vacuum of space?', es: 'El sonido es una onda en el aire. ¿Viaja en el vacío del espacio?', ko: '소리는 공기를 통하는 파동이다. 우주 진공에서 소리는 전달되는가?', pt: 'O som é uma onda no ar. Pode viajar no vácuo do espaço?', de: 'Schall ist eine Welle in der Luft. Kann er sich im Weltall ausbreiten?' },
    a: { ja: '伝わらない。音は媒質 (空気・水・固体) の中の振動なので、媒質がない真空では物理的に伝播しない。映画で宇宙の戦闘シーンが「無音」なのが本来正確で、爆発音が聞こえるのは演出。これが「音楽は媒質を必要とする芸術」と呼ばれる理由。', en: 'No. Sound is vibration through a medium (air, water, solid), so it cannot propagate in vacuum. The "silence of space" in movies is physically correct; the explosion sounds we hear are dramatic license. This is why music is called "an art that requires a medium."', es: 'No. El sonido es vibración en un medio. El silencio cósmico de las películas es físicamente correcto.', ko: '전달되지 않는다. 소리는 매질 (공기·물·고체) 의 진동이므로 진공에서는 물리적으로 전파되지 않는다. 영화의 우주 전투가 무음인 것이 본래 정확.', pt: 'Não. O som é vibração em um meio. O silêncio do espaço nos filmes é fisicamente correto.', de: 'Nein. Schall ist eine Schwingung in einem Medium. Die „Stille des Weltalls" in Filmen ist physikalisch korrekt.' },
  },
  {
    q: { ja: 'では「音楽」と「単なる音」の違いは何か?', en: 'What distinguishes "music" from mere "sound"?', es: '¿Qué distingue la música del simple sonido?', ko: '"음악" 과 "단순한 소리" 의 차이는?', pt: 'O que distingue música de mero som?', de: 'Was unterscheidet „Musik" von bloßem „Klang"?' },
    a: { ja: 'これは物理学では決まらない、文化と個人が決める問い。Bach にとっての音楽、Coltrane にとっての音楽、武満徹にとっての音楽、John Cage にとっての音楽は皆違う。Cage の「4分33秒」は音楽家の沈黙すら音楽になり得ると主張した。Kuon の立場は §49 と整合する — 「正解は一つではない」。あなたが音楽と感じたものが、あなたにとっての音楽である。', en: 'A question physics cannot answer — culture and individuals decide. Bach\'s definition, Coltrane\'s definition, Takemitsu\'s definition, Cage\'s definition all differ. Cage\'s "4\'33\"" claimed even silence can become music. Kuon\'s stance aligns with §49: there is no single right answer. What you experience as music is your music.', es: 'No es cuestión física — la cultura y el individuo deciden. Las definiciones de Bach, Coltrane, Takemitsu y Cage difieren. La postura de Kuon: no hay una sola respuesta correcta.', ko: '물리학으로 정해지지 않는다 — 문화와 개인이 정한다. 바흐·콜트레인·다케미츠·케이지의 정의는 모두 다르다. 케이지의 "4분 33초" 는 침묵조차 음악이 될 수 있다고 주장. 당신이 음악으로 느낀 것이 당신의 음악.', pt: 'A física não responde — cultura e indivíduo decidem. As definições de Bach, Coltrane, Takemitsu e Cage diferem. A posição da Kuon: não há uma única resposta certa.', de: 'Die Physik beantwortet das nicht — Kultur und Individuum entscheiden. Die Definitionen von Bach, Coltrane, Takemitsu und Cage unterscheiden sich. Cages „4\'33\"" beanspruchte: auch Stille kann Musik sein.' },
  },
];

// ─────────────────────────────────────────────────────────────
// メイン
// ─────────────────────────────────────────────────────────────
type Mode = 'frequency' | 'timbre';

export default function LessonM0L01() {
  const { lang } = useLang();
  const [mode, setMode] = useState<Mode>('frequency');

  return (
    <div style={{ background: PAPER, minHeight: '100vh', color: INK }}>

      {/* パンくず + タイトル */}
      <div style={{
        maxWidth: 880, margin: '0 auto',
        padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2rem)',
      }}>
        <div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_SOFT, letterSpacing: '0.05em', marginBottom: '1.4rem' }}>
          <Link href="/theory" style={{ color: INK_SOFT, textDecoration: 'none' }}>
            ← {t({ ja: '目次へ戻る', en: 'Back to contents', es: 'Volver al índice', ko: '목차로', pt: 'Voltar', de: 'Zum Inhalt' }, lang)}
          </Link>
        </div>
        <div style={{ fontFamily: mono, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.28em', marginBottom: '0.7rem' }}>
          M0 · LESSON 01
        </div>
        <h1 style={{
          fontFamily: serif, fontSize: 'clamp(1.85rem, 4.5vw, 2.85rem)',
          fontWeight: 400, letterSpacing: '0.04em', lineHeight: 1.4, margin: 0, color: INK,
          wordBreak: 'keep-all' as const,
        }}>
          {t({
            ja: '音とは何か',
            en: 'What is Sound?',
            es: '¿Qué es el sonido?',
            ko: '소리란 무엇인가',
            pt: 'O que é o som?',
            de: 'Was ist Klang?',
          }, lang)}
        </h1>
      </div>

      {/* ═══════ Layer 1: STORY ═══════ */}
      <section style={{
        maxWidth: 720, margin: '0 auto',
        padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)',
      }}>
        <LayerLabel num="I" name={t({ ja: '物語', en: 'Story', es: 'Historia', ko: '이야기', pt: 'História', de: 'Geschichte' }, lang)} />
        <div style={{
          fontFamily: serif, fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
          color: INK, lineHeight: 2.05, letterSpacing: '0.03em',
          wordBreak: 'keep-all' as const,
        }}>
          <p style={{ margin: '0 0 1.6rem 0', whiteSpace: 'pre-line' as const }}>
            {t({
              ja: `音楽を学ぼうとするあなたへ、最初に贈る問いは — 「そもそも、音とは何か?」です。
譜面を読む前に、音そのものに触れてみましょう。
ピアノの鍵盤を叩く。
弦を弾く。
歌う。
そのとき、何が起きているのでしょうか。`,
              en: `For you who are about to study music, the first question is — "What is sound, really?"
Before reading any notation, let us touch sound itself.
Strike a piano key.
Pluck a string.
Sing.
What is happening, exactly?`,
              es: `Para ti que vas a estudiar música, la primera pregunta es — "¿Qué es realmente el sonido?"
Antes de leer cualquier notación, toquemos el sonido mismo.
Pulsa una tecla de piano.
Pulsa una cuerda.
Canta.
¿Qué ocurre, exactamente?`,
              ko: `음악을 배우려는 당신에게 처음 던지는 질문 — "그래서 소리란 무엇인가?"
기보를 읽기 전에, 소리 그 자체에 닿아 봅시다.
피아노 건반을 두드린다.
현을 튕긴다.
노래한다.
그때 무엇이 일어나고 있는가.`,
              pt: `Para você que vai estudar música, a primeira pergunta é — "Afinal, o que é o som?"
Antes de ler qualquer notação, toquemos o som em si.
Pressione uma tecla.
Belisque uma corda.
Cante.
O que está acontecendo, exatamente?`,
              de: `Für Sie, die Musik lernen wollen, lautet die erste Frage — „Was ist Klang eigentlich?"
Bevor wir Noten lesen, berühren wir den Klang selbst.
Schlagen Sie eine Klaviertaste.
Zupfen Sie eine Saite.
Singen Sie.
Was geschieht da genau?`,
            }, lang)}
          </p>
          <p style={{ margin: '0 0 1.6rem 0', whiteSpace: 'pre-line' as const }}>
            {t({
              ja: `物理的には、音は空気の振動です。
鍵盤を叩くと、弦が震え、空気の分子を前後に押す。
その押し波が空間を伝わり、あなたの鼓膜に到達する。
鼓膜は振動を蝸牛 (内耳) に伝え、神経信号として脳に届けられる。
脳が「ピアノの音だ」と認識する — その瞬間、音は「経験」になります。
音とは、振動と知覚のあいだに立ち上がる現象です。`,
              en: `Physically, sound is the vibration of air.
When you strike a key, a string trembles and pushes air molecules back and forth.
That pressure wave travels through space and reaches your eardrum.
The eardrum passes the vibration to the cochlea, which sends nerve signals to the brain.
The brain recognizes "this is a piano" — and at that moment, sound becomes experience.
Sound is the phenomenon that emerges between vibration and perception.`,
              es: `Físicamente, el sonido es vibración del aire.
Al pulsar una tecla, una cuerda vibra y empuja las moléculas del aire.
Esa onda de presión viaja por el espacio y llega a tu tímpano.
El tímpano transmite la vibración a la cóclea, que envía señales al cerebro.
El cerebro reconoce "esto es un piano" — y en ese instante, el sonido se vuelve experiencia.
El sonido es el fenómeno que surge entre vibración y percepción.`,
              ko: `물리적으로 소리는 공기의 진동입니다.
건반을 두드리면 현이 떨려 공기 분자를 앞뒤로 밀어냅니다.
그 압력파가 공간을 전파하여 당신의 고막에 닿습니다.
고막은 진동을 달팽이관에 전하고, 신경 신호로 뇌에 도달합니다.
뇌가 "피아노 소리다" 라 인식하는 순간 — 소리는 "경험" 이 됩니다.
소리란 진동과 지각 사이에서 일어나는 현상입니다.`,
              pt: `Fisicamente, o som é vibração do ar.
Ao pressionar uma tecla, uma corda vibra e empurra moléculas de ar.
Essa onda de pressão viaja pelo espaço e atinge seu tímpano.
O tímpano transmite a vibração à cóclea, que envia sinais ao cérebro.
O cérebro reconhece "é um piano" — e nesse instante, o som se torna experiência.
O som é o fenômeno que emerge entre vibração e percepção.`,
              de: `Physikalisch ist Klang die Schwingung der Luft.
Schlagen Sie eine Taste, zittert eine Saite und drückt Luftmoleküle hin und her.
Diese Druckwelle wandert durch den Raum und erreicht Ihr Trommelfell.
Das Trommelfell überträgt die Schwingung zur Cochlea, die Nervensignale ans Gehirn sendet.
Das Gehirn erkennt: „Das ist ein Klavier" — und in diesem Moment wird Klang zu Erfahrung.
Klang ist das Phänomen, das zwischen Schwingung und Wahrnehmung entsteht.`,
            }, lang)}
          </p>
          <p style={{ margin: '0 0 1.6rem 0', whiteSpace: 'pre-line' as const }}>
            {t({
              ja: `波の振動数 — つまり 1 秒間に空気が何回振動するか — を「周波数」と呼び、Hz (ヘルツ) の単位で測ります。
440 Hz は「ラ」、261.6 Hz は「ド」。
これは物理的事実ですが、「ラ」「ド」と呼ぶこと自体は人間が決めた約束です。
人間の耳が聴こえるのは、おおよそ 20 Hz から 20,000 Hz の範囲。
それを越える振動は、犬やコウモリには聴こえても、私たちには沈黙です。
逆に、地球の大気の超低周波振動は、私たちには「揺れ」として身体で感じられる。
聴覚は、宇宙の音のごく一部しか拾わない、限定的な窓です。`,
              en: `The number of times the wave vibrates per second is called frequency, measured in Hz (Hertz).
440 Hz is "A," 261.6 Hz is "C."
The physics is universal, but the names are human conventions.
Human ears hear roughly between 20 Hz and 20,000 Hz.
Vibrations beyond this range may be audible to dogs and bats but are silent to us.
Conversely, the Earth's ultra-low frequency oscillations we feel as bodily tremor.
Hearing is a narrow window into the universe of sound.`,
              es: `El número de veces que la onda vibra por segundo se llama frecuencia, medida en Hz.
440 Hz es "La," 261.6 Hz es "Do."
La física es universal, pero los nombres son convenciones humanas.
Los humanos oímos aproximadamente de 20 Hz a 20.000 Hz.
La audición es una ventana estrecha al universo del sonido.`,
              ko: `파동이 1 초에 진동하는 횟수를 "주파수" 라 하고, Hz (헤르츠) 단위로 측정합니다.
440 Hz 는 "라", 261.6 Hz 는 "도".
물리는 보편적이지만 이름은 인간의 약속입니다.
인간의 귀는 대략 20 Hz 부터 20,000 Hz 까지 들을 수 있습니다.
청각은 우주의 소리 중 극히 일부만 잡는 좁은 창입니다.`,
              pt: `O número de vibrações por segundo é a frequência, medida em Hz.
440 Hz é "Lá," 261.6 Hz é "Dó."
A física é universal, os nomes são convenções humanas.
Humanos ouvem aproximadamente de 20 Hz a 20,000 Hz.
A audição é uma janela estreita para o universo do som.`,
              de: `Die Anzahl der Schwingungen pro Sekunde nennt man Frequenz, gemessen in Hz.
440 Hz heißt „A", 261,6 Hz heißt „C".
Die Physik ist universell, die Namen sind menschliche Konventionen.
Menschen hören etwa zwischen 20 Hz und 20.000 Hz.
Das Gehör ist ein schmales Fenster ins Klang-Universum.`,
            }, lang)}
          </p>
          <p style={{ margin: 0, whiteSpace: 'pre-line' as const }}>
            {t({
              ja: `では、いつから音は「音楽」になるのか。
物理学では決まりません。
Bach にとっての音楽、Coltrane にとっての音楽、武満徹にとっての音楽、John Cage にとっての音楽は、すべて違いました。
Cage の「4 分 33 秒」は、演奏家が一切音を出さない作品です。それでも音楽です。
あなたが音楽だと感じたものが、あなたにとっての音楽です。
この問いに「正解は一つ」を求めない姿勢から、Kuon の音楽教育は始まります。`,
              en: `When does sound become music?
Physics cannot answer.
Bach's definition, Coltrane's definition, Takemitsu's definition, John Cage's definition — all differed.
Cage's "4'33"" is a piece in which the performer makes no sound. Yet it is music.
What you experience as music is your music.
Kuon's music education begins from the refusal to seek a single right answer to this question.`,
              es: `¿Cuándo el sonido se vuelve música?
La física no responde.
Las definiciones de Bach, Coltrane, Takemitsu y Cage difieren.
"4'33"" de Cage es una pieza sin sonido del intérprete. Y sin embargo es música.
Lo que experimentas como música es tu música.
La educación musical de Kuon comienza al renunciar a una única respuesta correcta.`,
              ko: `소리는 언제 음악이 되는가?
물리학으로는 답이 나오지 않습니다.
바흐·콜트레인·다케미츠·케이지의 정의는 모두 달랐습니다.
케이지의 "4 분 33 초" 는 연주자가 일절 소리를 내지 않는 작품. 그래도 음악입니다.
당신이 음악이라 느낀 것이 당신의 음악입니다.
이 질문에 "정답은 하나" 를 요구하지 않는 자세에서 Kuon 의 음악 교육이 시작됩니다.`,
              pt: `Quando o som se torna música?
A física não responde.
As definições de Bach, Coltrane, Takemitsu e Cage diferiram.
"4'33"" de Cage é uma peça sem som do intérprete. Ainda assim é música.
O que você experiencia como música é a sua música.
A educação musical da Kuon começa por recusar uma única resposta certa.`,
              de: `Wann wird Klang zu Musik?
Die Physik gibt keine Antwort.
Bachs Definition, Coltranes, Takemitsus, Cages — alle verschieden.
Cages „4'33\"" ist ein Werk, in dem der Interpret keinen Ton macht. Und doch ist es Musik.
Was Sie als Musik erleben, ist Ihre Musik.
Die Musikerziehung von Kuon beginnt mit der Weigerung, auf diese Frage eine einzige richtige Antwort zu suchen.`,
            }, lang)}
          </p>

          {/* 前方参照 */}
          <aside style={{
            marginTop: 'clamp(1.5rem, 3vw, 2rem)',
            padding: 'clamp(0.9rem, 2vw, 1.2rem) clamp(1.1rem, 2.5vw, 1.5rem)',
            background: PAPER_DEEP,
            border: `1px solid ${STAFF_LINE_COLOR}`,
            borderLeft: `2px solid ${ACCENT_INDIGO}`,
            borderRadius: 4,
            fontFamily: serif,
            fontSize: '0.88rem',
            color: INK_SOFT,
            lineHeight: 1.85,
            letterSpacing: '0.02em',
            whiteSpace: 'pre-line' as const,
            wordBreak: 'keep-all' as const,
          }}>
            {t({
              ja: `※ M0 (音楽との最初の出会い) は譜面を一切読まない 15 レッスンの入門ブロックです。
リズムを身体で感じ、声を出し、世界の音楽に触れ、楽器の家族を知る — そこから始めます。
記譜法を学ぶ M1 は、M0 を経てからでも、いきなりでも構いません。あなたの選択次第です。`,
              en: `Note: M0 (First Encounter with Music) is a 15-lesson pre-notational block. No staff reading.
Feel rhythm in the body, sing, encounter world music, meet instrument families — we start there.
M1 (notation) can come after M0, or directly. Your choice.`,
              es: `Nota: M0 es un bloque pre-notacional de 15 lecciones. Sin lectura de pentagrama.
Siente el ritmo en el cuerpo, canta, conoce la música del mundo. Empezamos ahí.
M1 puede venir después de M0 o directamente. Tu elección.`,
              ko: `※ M0 (음악과의 첫 만남) 은 기보를 일절 읽지 않는 15 레슨 입문 블록.
리듬을 몸으로 느끼고, 노래하고, 세계의 음악에 닿고, 악기 가족을 알기 — 거기서 시작.
M1 은 M0 후에도, 바로 들어가도 좋습니다.`,
              pt: `Nota: M0 é um bloco pré-notacional de 15 lições. Sem leitura de pauta.
Sinta o ritmo no corpo, cante, conheça músicas do mundo. Começamos aí.
M1 pode vir depois de M0 ou direto. Sua escolha.`,
              de: `Hinweis: M0 ist ein vornotationaler 15-Lektionen-Block. Kein Notenlesen.
Rhythmus im Körper spüren, singen, Weltmusik kennenlernen, Instrumentenfamilien begegnen.
M1 (Notation) kann nach M0 oder direkt kommen. Ihre Wahl.`,
            }, lang)}
          </aside>
        </div>
      </section>

      {/* ═══════ Layer 2: LIVING SCORE ═══════ */}
      <section style={{
        background: '#fff',
        borderTop: `1px solid ${STAFF_LINE_COLOR}`,
        borderBottom: `1px solid ${STAFF_LINE_COLOR}`,
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem)',
      }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <LayerLabel num="II" name={t({ ja: 'Living Score (音そのものに触れる)', en: 'Living Score (touch sound itself)', es: 'Living Score (toca el sonido)', ko: 'Living Score (소리에 닿기)', pt: 'Living Score (toque o som)', de: 'Living Score (Klang berühren)' }, lang)} />

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: 'clamp(1.4rem, 3vw, 2rem)', flexWrap: 'wrap' as const }}>
            <ModeButton active={mode === 'frequency'} onClick={() => setMode('frequency')}
              label={t({ ja: '周波数の世界', en: 'The world of frequencies', es: 'Mundo de frecuencias', ko: '주파수의 세계', pt: 'Mundo das frequências', de: 'Welt der Frequenzen' }, lang)} />
            <ModeButton active={mode === 'timbre'} onClick={() => setMode('timbre')}
              label={t({ ja: '音色の違い', en: 'Different timbres', es: 'Diferentes timbres', ko: '음색의 차이', pt: 'Timbres diferentes', de: 'Verschiedene Klangfarben' }, lang)} />
          </div>

          {mode === 'frequency' && <FrequencyMode lang={lang} />}
          {mode === 'timbre' && <TimbreMode lang={lang} />}
        </div>
      </section>

      {/* ═══════ Layer 3: MEMORY ═══════ */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)' }}>
        <LayerLabel num="III" name={t({ ja: '記憶 (フラッシュカード)', en: 'Memory (Flashcards)', es: 'Memoria (Tarjetas)', ko: '기억 (플래시카드)', pt: 'Memória (Cartões)', de: 'Erinnern (Karten)' }, lang)} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '0.9rem' }}>
          {FLASHCARDS.map((c, i) => <FlashcardItem key={i} card={c} lang={lang} />)}
        </div>
      </section>

      {/* ═══════ RELATED KUON TOOLS ═══════ */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem) 0' }}>
        <div style={{ fontFamily: mono, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.22em', textTransform: 'uppercase' as const, marginBottom: '1.2rem' }}>
          {t({ ja: '関連するツール', en: 'Related tools', es: 'Herramientas relacionadas', ko: '관련 도구', pt: 'Ferramentas relacionadas', de: 'Verwandte Werkzeuge' }, lang)}
        </div>
        <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: '0.9rem', color: INK_SOFT, lineHeight: 1.85, margin: '0 0 1.4rem 0' }}>
          {t({
            ja: '音そのものに触れる Kuon の無料ツール群。実楽器・実声で「振動から知覚へ」を体験できます。',
            en: 'Free Kuon tools that let you touch sound itself. Experience "from vibration to perception" with real instruments and voice.',
            es: 'Herramientas gratuitas para tocar el sonido. Experimenta de la vibración a la percepción.',
            ko: '소리에 직접 닿는 Kuon 무료 도구. 실제 악기와 목소리로 "진동에서 지각까지" 를 체험.',
            pt: 'Ferramentas gratuitas para tocar o som. Experimente da vibração à percepção.',
            de: 'Kostenlose Kuon-Tools, um Klang zu berühren. Vom Schwingen zur Wahrnehmung erleben.',
          }, lang)}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '0.9rem' }}>
          <RelatedTool href="/tuner-lp" title="KUON TUNER PRO" desc={t({
            ja: '高精度チューナー。歌った音・楽器の音を Hz 単位で測定。「物理量としての音」を可視化。',
            en: 'High-precision tuner. Measure your voice and instrument in Hz. Visualize sound as physical quantity.',
            es: 'Afinador de alta precisión. Mide voz e instrumentos en Hz.',
            ko: '고정밀 튜너. 목소리·악기를 Hz 단위로 측정.',
            pt: 'Afinador de alta precisão. Meça voz e instrumentos em Hz.',
            de: 'Präzisions-Stimmgerät. Stimme und Instrument in Hz messen.',
          }, lang)} />
          <RelatedTool href="/frequency-lp" title="KUON FREQUENCY" desc={t({
            ja: 'ソルフェジオ周波数のサイン波プレーヤー。174Hz〜963Hz の純粋な振動を直接体感する。',
            en: 'Solfeggio frequency sine wave player. Experience pure vibrations from 174 Hz to 963 Hz directly.',
            es: 'Reproductor de frecuencias solfeggio. Experimenta vibraciones puras de 174 a 963 Hz.',
            ko: '솔페지오 주파수 사인파 플레이어. 174Hz~963Hz 순수 진동 체험.',
            pt: 'Reprodutor de frequências solfeggio. Experimente vibrações puras de 174 a 963 Hz.',
            de: 'Solfeggio-Frequenz-Sinuswellen-Player. Reine Schwingungen von 174 bis 963 Hz.',
          }, lang)} />
          <RelatedTool href="/analyzer" title="KUON ANALYZER" desc={t({
            ja: 'スペクトラム解析。録音した音の倍音構造を可視化し、「音色の正体」を見る。',
            en: 'Spectrum analyzer. Visualize the overtone structure of recorded sound — see the "identity of timbre."',
            es: 'Analizador de espectro. Visualiza la estructura armónica del sonido grabado.',
            ko: '스펙트럼 분석. 녹음한 소리의 배음 구조 시각화.',
            pt: 'Analisador de espectro. Visualize a estrutura harmônica do som gravado.',
            de: 'Spektrumanalysator. Obertonstruktur aufgezeichneter Klänge sichtbar machen.',
          }, lang)} />
        </div>
      </section>

      {/* ═══════ FOOTER NAV ═══════ */}
      <footer style={{
        maxWidth: 880, margin: '0 auto',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)',
        borderTop: `1px solid ${STAFF_LINE_COLOR}`,
        marginTop: 'clamp(2rem, 5vw, 4rem)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '1rem' }}>
          <div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, letterSpacing: '0.04em' }}>
            {t({ ja: 'M0 音楽との最初の出会い · Lesson 1 / 15', en: 'M0 First Encounter with Music · Lesson 1 / 15', es: 'M0 Primer encuentro · 1 / 15', ko: 'M0 음악과의 첫 만남 · 레슨 1 / 15', pt: 'M0 Primeiro encontro · Lição 1 / 15', de: 'M0 Erste Begegnung · Lektion 1 / 15' }, lang)}
          </div>
          <Link href="/theory" style={{
            fontFamily: sans, fontSize: '0.85rem', color: INK,
            textDecoration: 'none', padding: '0.7rem 1.4rem',
            border: `1px solid ${INK}`, borderRadius: 999, letterSpacing: '0.06em',
          }}>
            {t({ ja: '目次へ戻る', en: 'Back to contents', es: 'Volver', ko: '목차로', pt: 'Voltar', de: 'Zum Inhalt' }, lang)}
          </Link>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FrequencyMode — 周波数スライダー (20 Hz - 20 kHz, log scale)
// ─────────────────────────────────────────────────────────────
function FrequencyMode({ lang }: { lang: Lang }) {
  const [logFreq, setLogFreq] = useState(Math.log10(440)); // start at A4
  const freq = Math.round(Math.pow(10, logFreq));

  // ラベル位置 (Hz)
  const MARKERS = [
    { hz: 20, labelJa: '20 Hz', labelEn: '20 Hz' },
    { hz: 100, labelJa: '100 Hz', labelEn: '100 Hz' },
    { hz: 440, labelJa: '440 Hz (ラ)', labelEn: '440 Hz (A)' },
    { hz: 1000, labelJa: '1 kHz', labelEn: '1 kHz' },
    { hz: 5000, labelJa: '5 kHz', labelEn: '5 kHz' },
    { hz: 20000, labelJa: '20 kHz', labelEn: '20 kHz' },
  ];

  const description = t({
    ja: `現在: ${freq} Hz`,
    en: `Now: ${freq} Hz`,
    es: `Ahora: ${freq} Hz`,
    ko: `현재: ${freq} Hz`,
    pt: `Agora: ${freq} Hz`,
    de: `Jetzt: ${freq} Hz`,
  }, lang);

  let context = '';
  if (freq < 30) context = t({ ja: '— 多くの人にとって聴覚閾値以下。身体で「揺れ」として感じる帯域。', en: '— Below most hearing thresholds. Felt as bodily vibration.', es: '— Por debajo del umbral. Se siente como vibración corporal.', ko: '— 가청 한계 아래. 몸으로 진동으로 느낌.', pt: '— Abaixo do limiar. Sentido como vibração corporal.', de: '— Unter der Hörschwelle. Als Körperschwingung wahrgenommen.' }, lang);
  else if (freq < 250) context = t({ ja: '— 低音域。コントラバス、男性低音、地震、雷の領域。', en: '— Low range. Double bass, male bass voice, earthquakes, thunder.', es: '— Grave. Contrabajo, voz masculina grave.', ko: '— 저음역. 콘트라베이스, 남성 저음.', pt: '— Grave. Contrabaixo, voz masculina grave.', de: '— Tiefer Bereich. Kontrabass, tiefe Männerstimme.' }, lang);
  else if (freq < 2000) context = t({ ja: '— 人間の話し声・歌の中心帯。ピアノの中央音域。最も繊細に聴こえる範囲。', en: '— Range of human speech and song. Piano middle register. Where the ear is most sensitive.', es: '— Rango del habla y canto. Registro medio de piano.', ko: '— 사람 말소리·노래 중심대. 피아노 중음역.', pt: '— Voz humana e canto. Registro médio de piano.', de: '— Sprechen und Singen. Klavier-Mittellage.' }, lang);
  else if (freq < 8000) context = t({ ja: '— 高音域。フルートの上限、ヴァイオリン、子音 (s, sh) の帯域。', en: '— High range. Top of flute, violin, consonants (s, sh).', es: '— Agudo. Top de la flauta, violín.', ko: '— 고음역. 플루트 상단, 바이올린.', pt: '— Agudo. Topo da flauta, violino.', de: '— Hoher Bereich. Flötenoberton, Violine.' }, lang);
  else if (freq < 16000) context = t({ ja: '— 超高音域。シンバル、エアコン、CD オーディオの「空気感」を担う。', en: '— Very high. Cymbals, air conditioning, the "air" of CD audio.', es: '— Muy agudo. Címbalos, aire de audio.', ko: '— 초고음역. 심벌즈, 공기감.', pt: '— Muito agudo. Pratos, ar de áudio.', de: '— Sehr hoch. Becken, Audio-„Luft".' }, lang);
  else context = t({ ja: '— 多くの大人には聴こえない帯域。若年層・犬・コウモリの領域。', en: '— Inaudible to many adults. Younger ears, dogs, bats.', es: '— Inaudible para muchos adultos. Oídos jóvenes, perros.', ko: '— 많은 성인이 못 듣는 대역. 젊은 청자, 개, 박쥐.', pt: '— Inaudível para muitos adultos. Ouvidos jovens, cães.', de: '— Für viele Erwachsene unhörbar. Junge Ohren, Hunde.' }, lang);

  return (
    <div>
      <p style={{ fontFamily: serif, fontStyle: 'italic', color: INK_SOFT, marginBottom: '1.5rem', lineHeight: 1.85, whiteSpace: 'pre-line' as const, wordBreak: 'keep-all' as const }}>
        {t({
          ja: `スライダーを動かすと、空気が振動する速度 (周波数) が変わります。
20 Hz から 20,000 Hz まで、人間の聴覚範囲を旅してください。
低い音は身体に響き、高い音は耳の奥にだけ届きます。
「再生」を押すと、現在の周波数の純粋なサイン波が鳴ります。`,
          en: `Move the slider to change how fast the air vibrates (frequency).
From 20 Hz to 20,000 Hz, travel through the human hearing range.
Low frequencies resonate in the body; high frequencies reach only the inner ear.
Press "Play" to hear a pure sine wave at the current frequency.`,
          es: `Mueve el control para cambiar la frecuencia.
De 20 Hz a 20.000 Hz, recorre el rango auditivo humano.
Las frecuencias bajas resuenan en el cuerpo; las altas solo en el oído interno.`,
          ko: `슬라이더를 움직여 공기 진동 속도 (주파수) 를 바꾸세요.
20 Hz 부터 20,000 Hz 까지 인간 청각 범위를 여행.
낮은 음은 몸에 울리고, 높은 음은 귓속에만 닿습니다.`,
          pt: `Mova o controle para mudar a frequência.
De 20 Hz a 20,000 Hz, percorra o alcance auditivo humano.
Frequências baixas ressoam no corpo; altas só no ouvido interno.`,
          de: `Bewegen Sie den Regler, um die Frequenz zu ändern.
Von 20 Hz bis 20.000 Hz durch den menschlichen Hörbereich reisen.
Tiefe Frequenzen schwingen im Körper, hohe nur im Innenohr.`,
        }, lang)}
      </p>

      {/* スライダー */}
      <div style={{
        padding: 'clamp(1.5rem, 3vw, 2rem)',
        background: PAPER,
        border: `1px solid ${STAFF_LINE_COLOR}`,
        borderRadius: 4,
      }}>
        <div style={{
          fontFamily: serif,
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          color: ACCENT_INDIGO,
          textAlign: 'center' as const,
          letterSpacing: '0.04em',
          marginBottom: '0.4rem',
        }}>
          {freq.toLocaleString()} <span style={{ fontFamily: mono, fontSize: '0.5em', color: INK_FAINT, letterSpacing: '0.1em' }}>Hz</span>
        </div>
        <div style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: '0.88rem',
          color: INK_SOFT,
          textAlign: 'center' as const,
          marginBottom: '1.5rem',
          letterSpacing: '0.02em',
          lineHeight: 1.7,
          wordBreak: 'keep-all' as const,
        }}>
          {description} {context}
        </div>

        <input
          type="range"
          min={Math.log10(20)} max={Math.log10(20000)} step={0.001}
          value={logFreq}
          onChange={e => setLogFreq(parseFloat(e.target.value))}
          style={{
            width: '100%',
            accentColor: ACCENT_INDIGO,
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0.5rem',
          fontFamily: mono,
          fontSize: '0.65rem',
          color: INK_FAINT,
          letterSpacing: '0.04em',
        }}>
          {MARKERS.map(m => (
            <span key={m.hz}>{lang === 'ja' || lang === 'ko' ? m.labelJa : m.labelEn}</span>
          ))}
        </div>

        <div style={{ textAlign: 'center' as const, marginTop: '1.5rem' }}>
          <button onClick={() => playFreq(freq)} style={{
            fontFamily: sans, fontSize: '0.95rem',
            background: INK, color: PAPER, border: 'none', borderRadius: 999,
            padding: '0.85rem 2rem', cursor: 'pointer', letterSpacing: '0.06em',
          }}>
            ♪ {t({ ja: '再生', en: 'Play', es: 'Reproducir', ko: '재생', pt: 'Tocar', de: 'Abspielen' }, lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TimbreMode — 同じ周波数 (440 Hz) を 4 つの波形で
// ─────────────────────────────────────────────────────────────
function TimbreMode({ lang }: { lang: Lang }) {
  const TIMBRES: { wave: Waveform; name: L6; desc: L6 }[] = [
    {
      wave: 'sine',
      name: { ja: 'サイン波', en: 'Sine', es: 'Sinusoidal', ko: '사인파', pt: 'Senoidal', de: 'Sinus' },
      desc: { ja: '純粋な単一周波数。倍音を持たない。最も単純で、口笛・電子機器のテスト音に近い柔らかさ。', en: 'A pure single frequency, no overtones. The simplest waveform — soft like a whistle or electronic test tone.', es: 'Una sola frecuencia pura, sin armónicos. Como un silbido o tono de prueba.', ko: '순수한 단일 주파수, 배음 없음. 휘파람·전자 테스트 톤처럼 부드러움.', pt: 'Uma única frequência pura, sem harmônicos. Como um assobio ou tom de teste.', de: 'Reine Einzelfrequenz, keine Obertöne. So weich wie ein Pfeifen.' },
    },
    {
      wave: 'triangle',
      name: { ja: '三角波', en: 'Triangle', es: 'Triangular', ko: '삼각파', pt: 'Triangular', de: 'Dreieck' },
      desc: { ja: '奇数倍音のみ、減衰が早い。フルートの低音域に近い、丸みのある木の音。', en: 'Odd harmonics only, fast decay. Resembles low flute — a rounded, woody tone.', es: 'Solo armónicos impares, decaen rápido. Parecido a flauta grave.', ko: '홀수 배음만, 감쇠 빠름. 플루트 저음대처럼 둥근 나무 소리.', pt: 'Só harmônicos ímpares, decaimento rápido. Parecido com flauta grave.', de: 'Nur ungerade Obertöne, schnelles Abklingen. Wie tiefe Flöte — runder, hölzerner Ton.' },
    },
    {
      wave: 'square',
      name: { ja: '矩形波', en: 'Square', es: 'Cuadrada', ko: '사각파', pt: 'Quadrada', de: 'Rechteck' },
      desc: { ja: '奇数倍音が強い。クラリネットや初期テレビゲームの音に近い、芯のあるブザー的な響き。', en: 'Strong odd harmonics. Close to clarinet or early video game sound — a buzzy, focused tone.', es: 'Armónicos impares fuertes. Como clarinete o videojuego antiguo.', ko: '홀수 배음 강함. 클라리넷·초기 비디오게임처럼 심 있는 소리.', pt: 'Harmônicos ímpares fortes. Como clarinete ou videogame antigo.', de: 'Starke ungerade Obertöne. Wie Klarinette oder alte Videospiele.' },
    },
    {
      wave: 'sawtooth',
      name: { ja: 'のこぎり波', en: 'Sawtooth', es: 'Diente de sierra', ko: '톱니파', pt: 'Dente de serra', de: 'Sägezahn' },
      desc: { ja: '全倍音 (奇数+偶数) を含む。ヴァイオリン・ブラス・アナログシンセに近い、明るく豊かな音。', en: 'All harmonics (odd + even). Close to violin, brass, analog synth — bright and rich.', es: 'Todos los armónicos. Como violín, metales, sintetizador analógico.', ko: '모든 배음 (홀수+짝수). 바이올린·금관·아날로그 신스처럼 밝고 풍부.', pt: 'Todos os harmônicos. Como violino, metais, sinte analógico.', de: 'Alle Obertöne. Wie Violine, Blechbläser, Analogsynth — hell und reich.' },
    },
  ];

  return (
    <div>
      <p style={{ fontFamily: serif, fontStyle: 'italic', color: INK_SOFT, marginBottom: '1.5rem', lineHeight: 1.85, whiteSpace: 'pre-line' as const, wordBreak: 'keep-all' as const }}>
        {t({
          ja: `下の 4 つはすべて、同じ周波数 440 Hz (= ラの音) です。
しかし聴こえる印象は驚くほど違う — それが「音色」です。
波の形と倍音の構成が、楽器の「指紋」を作っています。
ピアノとヴァイオリンが「同じドの音」を出しても違って聴こえるのは、この原理によります。`,
          en: `All four below are the same frequency: 440 Hz (the pitch "A").
Yet they sound astonishingly different — that is "timbre."
Wave shape and harmonic content create the "fingerprint" of an instrument.
Piano and violin playing "the same C" sound different for this reason.`,
          es: `Los cuatro de abajo son la misma frecuencia: 440 Hz (la "La").
Pero suenan asombrosamente distintos — eso es el timbre.
La forma de onda y armónicos crean la "huella digital" del instrumento.`,
          ko: `아래 4 가지는 모두 같은 주파수 440 Hz (= 라 음).
하지만 들리는 인상은 놀랍도록 다릅니다 — 그것이 "음색".
파형과 배음 구성이 악기의 "지문" 을 만듭니다.`,
          pt: `Os quatro abaixo são a mesma frequência: 440 Hz (o "Lá").
Mas soam surpreendentemente diferentes — isso é o timbre.
Forma de onda e harmônicos criam a "impressão digital" do instrumento.`,
          de: `Alle vier unten sind dieselbe Frequenz: 440 Hz (das „A").
Doch sie klingen erstaunlich verschieden — das ist „Klangfarbe".
Wellenform und Obertöne erzeugen den „Fingerabdruck" eines Instruments.`,
        }, lang)}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
        gap: 'clamp(0.9rem, 2vw, 1.2rem)',
      }}>
        {TIMBRES.map(t_ => (
          <button
            key={t_.wave}
            onClick={() => playFreq(440, t_.wave, 1.5)}
            style={{
              padding: 'clamp(1.3rem, 2.5vw, 1.6rem)',
              background: PAPER,
              border: `1px solid ${STAFF_LINE_COLOR}`,
              borderRadius: 4,
              textAlign: 'left' as const,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column' as const,
              gap: '0.7rem',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = INK; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = STAFF_LINE_COLOR; }}
          >
            <div style={{ fontFamily: sans, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
              440 Hz
            </div>
            <h3 style={{
              fontFamily: serif, fontSize: 'clamp(1.05rem, 1.8vw, 1.2rem)',
              fontWeight: 500, color: INK, margin: 0, letterSpacing: '0.03em', lineHeight: 1.4,
            }}>
              {t(t_.name, lang)}
            </h3>
            {/* SVG 波形ビジュアル */}
            <WaveformSvg waveform={t_.wave} />
            <p style={{
              fontFamily: serif, fontSize: '0.85rem', color: INK_SOFT,
              lineHeight: 1.75, margin: 0, letterSpacing: '0.02em',
              wordBreak: 'keep-all' as const,
            }}>
              {t(t_.desc, lang)}
            </p>
            <div style={{
              fontFamily: sans, fontSize: '0.72rem', color: ACCENT_GOLD,
              letterSpacing: '0.05em', marginTop: '0.3rem',
            }}>
              ♪ {t({ ja: 'クリックで再生', en: 'Click to play', es: 'Clic para reproducir', ko: '클릭하여 재생', pt: 'Clique para tocar', de: 'Zum Abspielen klicken' }, lang)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// WaveformSvg — 4 つの波形ビジュアル
// ─────────────────────────────────────────────────────────────
function WaveformSvg({ waveform }: { waveform: Waveform }) {
  const W = 200, H = 50, MID = H / 2, AMP = 18;
  const points: string[] = [];
  const cycles = 2;
  const step = 1;
  for (let x = 0; x <= W; x += step) {
    const phase = (x / W) * cycles * 2 * Math.PI;
    let y = 0;
    if (waveform === 'sine') y = Math.sin(phase);
    else if (waveform === 'triangle') {
      const p = (phase / Math.PI) % 2;
      y = p < 1 ? -1 + 2 * p : 3 - 2 * p;
    } else if (waveform === 'square') {
      y = Math.sin(phase) >= 0 ? 1 : -1;
    } else { // sawtooth
      const p = (phase / (2 * Math.PI)) % 1;
      y = -1 + 2 * p;
    }
    points.push(`${x},${MID - y * AMP}`);
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 200 }}>
      <line x1={0} x2={W} y1={MID} y2={MID} stroke={STAFF_LINE_COLOR} strokeWidth={0.5} strokeDasharray="2,2" />
      <polyline points={points.join(' ')} fill="none" stroke={ACCENT_INDIGO} strokeWidth={1.2} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// 共通サブコンポーネント
// ─────────────────────────────────────────────────────────────
function LayerLabel({ num, name }: { num: string; name: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: '0.85rem',
      marginBottom: 'clamp(1.4rem, 3vw, 1.8rem)',
      paddingBottom: '0.7rem', borderBottom: `1px solid ${STAFF_LINE_COLOR}`,
    }}>
      <span style={{ fontFamily: serif, fontSize: 'clamp(1.4rem, 2.5vw, 1.7rem)', color: ACCENT_GOLD, letterSpacing: '0.04em', lineHeight: 1 }}>{num}</span>
      <span style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_SOFT, letterSpacing: '0.18em', textTransform: 'uppercase' as const, fontWeight: 600 }}>{name}</span>
    </div>
  );
}

function ModeButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: sans, fontSize: '0.82rem',
      color: active ? PAPER : INK_SOFT,
      background: active ? INK : 'transparent',
      border: `1px solid ${active ? INK : STAFF_LINE_COLOR}`,
      borderRadius: 999, padding: '0.55rem 1.2rem', cursor: 'pointer',
      letterSpacing: '0.05em', fontWeight: 500, transition: 'all 0.2s ease',
    }}>
      {label}
    </button>
  );
}

function FlashcardItem({ card, lang }: { card: { q: L6; a: L6 }; lang: Lang }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button onClick={() => setFlipped(f => !f)} style={{
      background: flipped ? PAPER_DEEP : '#fff',
      border: `1px solid ${STAFF_LINE_COLOR}`, borderRadius: 4,
      padding: 'clamp(1.2rem, 2.5vw, 1.5rem)', cursor: 'pointer',
      textAlign: 'left' as const, fontFamily: serif, fontSize: '0.92rem',
      color: INK, lineHeight: 1.85, letterSpacing: '0.02em',
      transition: 'all 0.3s ease', minHeight: 120,
      display: 'flex', flexDirection: 'column' as const, justifyContent: 'flex-start' as const,
    }}>
      <div style={{ fontFamily: mono, fontSize: '0.65rem', color: INK_FAINT, letterSpacing: '0.16em', textTransform: 'uppercase' as const, marginBottom: '0.7rem' }}>
        {flipped ? t({ ja: '答え', en: 'Answer', es: 'Respuesta', ko: '답', pt: 'Resposta', de: 'Antwort' }, lang) : t({ ja: '問い', en: 'Question', es: 'Pregunta', ko: '질문', pt: 'Pergunta', de: 'Frage' }, lang)}
      </div>
      <div style={{ wordBreak: 'keep-all' as const, whiteSpace: 'pre-line' as const }}>
        {flipped ? t(card.a, lang) : t(card.q, lang)}
      </div>
    </button>
  );
}

function RelatedTool({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{
        background: '#fff', border: `1px solid ${STAFF_LINE_COLOR}`, borderRadius: 4,
        padding: 'clamp(1.1rem, 2vw, 1.4rem)', height: '100%',
        transition: 'all 0.25s ease', cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = INK; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = STAFF_LINE_COLOR; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <div style={{ fontFamily: sans, fontSize: '0.78rem', fontWeight: 600, color: INK, letterSpacing: '0.06em', marginBottom: '0.55rem' }}>{title}</div>
        <p style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_SOFT, lineHeight: 1.7, margin: 0, letterSpacing: '0.01em' }}>{desc}</p>
        <div style={{ fontFamily: sans, fontSize: '0.7rem', color: ACCENT_INDIGO, marginTop: '0.85rem', letterSpacing: '0.04em' }}>{'→'}</div>
      </div>
    </Link>
  );
}
