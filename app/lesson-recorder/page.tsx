'use client';

/**
 * /lesson-recorder — KUON LESSON RECORDER (Workers AI Whisper)
 *
 * 音楽レッスン録音を AI 書き起こし → 要約 → アクション項目化。
 * Prelude プランから利用可能。Workers AI で完結し、サーバーコスト極小。
 *
 * 機能:
 *   - ブラウザでマイク録音 (MediaRecorder)
 *   - 既存音声ファイルアップロード (MP3/WAV/M4A/OGG/WebM, 25MB)
 *   - リアルタイム波形可視化 (Web Audio API)
 *   - 多言語自動検出 + 音楽用語プロンプト注入
 *   - Llama 3.3 で 3 行サマリー + アクション項目 + 音楽用語ハイライト
 *   - 過去レッスン一覧・意味検索 (Vectorize)
 *   - Markdown / PDF / SRT / JSON エクスポート
 *
 * 哲学: §49 「正解は一つではない」を継承。AI 要約は提案であり押付けない。
 */

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { AuthGate } from '@/components/AuthGate';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ──────────────────────────────────────────────────────────────────────────
// Tokens (余白の知性 美学・§48 準拠)
// ──────────────────────────────────────────────────────────────────────────
const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace';

const INK = '#1a1a1a';
const INK_SOFT = '#475569';
const INK_FAINT = '#94a3b8';
const PAPER = '#fafaf7';
const PAPER_DEEP = '#f5f4ed';
const STAFF_LINE = '#d4d0c4';
const ACCENT = '#9c7c3a';
const ACCENT_DEEP = '#7a5e26';
const RED = '#dc2626';
const GREEN = '#15803d';
const BLUE = '#3a3a5e';

// ──────────────────────────────────────────────────────────────────────────
// 型
// ──────────────────────────────────────────────────────────────────────────
type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang): string => (m as Record<string, string>)[lang] ?? m.en;

interface LessonMeta {
  id: string;
  email: string;
  title: string;
  instrument?: string;
  teacher?: string;
  language: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
  hasAudio: boolean;
  hasSummary: boolean;
  hasTranslation: boolean;
}
interface Segment {
  start: number;
  end: number;
  text: string;
  speaker?: 'teacher' | 'student' | 'unknown';
}
interface Summary {
  abstract: string;
  keyPoints: string[];
  actionItems: string[];
  musicTerms: Array<{ term: string; explanation: string; theoryLink?: string }>;
  mood: 'encouraging' | 'neutral' | 'concerning';
  nextLessonHints: string[];
}
interface Lesson {
  meta: LessonMeta;
  segments: Segment[];
  fullText: string;
  summary?: Summary;
  translations?: Record<string, string>;
}

const INSTRUMENTS_JA = ['ピアノ', 'ヴァイオリン', 'チェロ', 'ヴィオラ', 'コントラバス', 'フルート', 'クラリネット', 'オーボエ', 'ファゴット', 'ホルン', 'トランペット', 'トロンボーン', 'チューバ', '声楽', 'ギター', 'ハープ', '打楽器', 'その他'];
const INSTRUMENTS_EN = ['Piano', 'Violin', 'Cello', 'Viola', 'Double Bass', 'Flute', 'Clarinet', 'Oboe', 'Bassoon', 'Horn', 'Trumpet', 'Trombone', 'Tuba', 'Voice', 'Guitar', 'Harp', 'Percussion', 'Other'];

// ──────────────────────────────────────────────────────────────────────────
// メイン
// ──────────────────────────────────────────────────────────────────────────
export default function LessonRecorderPage() {
  return (
    <AuthGate appName="lesson-recorder">
      <LessonRecorderApp />
    </AuthGate>
  );
}

function LessonRecorderApp() {
  const { lang } = useLang();
  const [view, setView] = useState<'home' | 'recording' | 'processing' | 'result' | 'archive'>('home');
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [archiveLessons, setArchiveLessons] = useState<LessonMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ lessonId: string; title: string; snippet: string; score: number }>>([]);
  const [searching, setSearching] = useState(false);

  // 録音状態
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0); // 0-1

  // メタフォーム
  const [title, setTitle] = useState('');
  const [instrument, setInstrument] = useState('');
  const [teacher, setTeacher] = useState('');
  const [language, setLanguage] = useState('auto');

  // 処理状態
  const [progressMessage, setProgressMessage] = useState('');

  // refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // ── アーカイブ取得 ──
  useEffect(() => {
    void fetchArchive();
  }, []);

  const fetchArchive = useCallback(async () => {
    try {
      const res = await fetch('/api/lesson-recorder/lessons');
      if (!res.ok) return;
      const data = await res.json();
      setArchiveLessons(data.lessons || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // ── 録音開始 ──
  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;

      // 波形メーター
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const updateLevel = () => {
        const buf = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i];
        const avg = sum / buf.length / 255;
        setAudioLevel(avg);
        rafRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      // MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || 'audio/webm' });
        setRecordedBlob(blob);
      };
      recorder.start(1000);
      setRecording(true);
      setRecordSeconds(0);
      timerRef.current = window.setInterval(() => setRecordSeconds((s) => s + 1), 1000);
      setView('recording');
    } catch (e) {
      console.error(e);
      setError(t({ ja: 'マイクへのアクセスが許可されませんでした', en: 'Microphone access denied' }, lang));
    }
  }, [lang]);

  // ── 録音停止 ──
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  }, []);

  // ── ファイル選択 ──
  const handleFileSelect = useCallback((file: File) => {
    setRecordedBlob(file);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
    setView('recording');
  }, [title]);

  // ── 書き起こし送信 ──
  const submitTranscribe = useCallback(async () => {
    if (!recordedBlob) return;
    setView('processing');
    setProgressMessage(t({ ja: '音声を Workers AI Whisper で書き起こし中…', en: 'Transcribing with Workers AI Whisper…' }, lang));
    setError(null);

    try {
      const fd = new FormData();
      fd.append('audio', recordedBlob, 'lesson.webm');
      fd.append('language', language);
      fd.append('title', title || (lang === 'ja' ? 'レッスン録音' : 'Lesson Recording'));
      if (instrument) fd.append('instrument', instrument);
      if (teacher) fd.append('teacher', teacher);
      fd.append('musicVocab', 'true');

      const res = await fetch('/api/lesson-recorder/transcribe', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        if (errBody.code === 'QUOTA_EXCEEDED') {
          setError(t({
            ja: `今月の書き起こし回数 (${errBody.limit} 回) を使い切りました。プランをアップグレードするか、来月までお待ちください。`,
            en: `You've used all ${errBody.limit} transcriptions for this month. Upgrade your plan or wait until next month.`,
          }, lang));
        } else if (errBody.code === 'NOT_INCLUDED') {
          setError(t({
            ja: 'このアプリは Prelude プラン以上で利用可能です。',
            en: 'This app requires Prelude plan or higher.',
          }, lang));
        } else {
          setError(errBody.error || errBody.message || 'Transcription failed');
        }
        setView('home');
        return;
      }

      const data = await res.json();
      setProgressMessage(t({ ja: '🎼 AI 要約を生成中…', en: '🎼 Generating AI summary…' }, lang));

      // 自動で要約も生成
      const sumRes = await fetch('/api/lesson-recorder/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: data.lessonId }),
      });
      let summary: Summary | undefined;
      if (sumRes.ok) {
        const sumData = await sumRes.json();
        summary = sumData.summary;
      }

      const lesson: Lesson = {
        meta: data.meta,
        segments: data.segments,
        fullText: data.fullText,
        summary,
      };
      setCurrentLesson(lesson);
      setView('result');
      void fetchArchive();
    } catch (e) {
      console.error(e);
      setError(t({ ja: 'エラーが発生しました', en: 'An error occurred' }, lang));
      setView('home');
    }
  }, [recordedBlob, language, title, instrument, teacher, lang, fetchArchive]);

  // ── レッスン読み込み ──
  const loadLesson = useCallback(async (id: string) => {
    setView('processing');
    setProgressMessage(t({ ja: '読み込み中…', en: 'Loading…' }, lang));
    try {
      const res = await fetch(`/api/lesson-recorder/lessons/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentLesson(data.lesson);
        setView('result');
      } else {
        setError('Lesson not found');
        setView('archive');
      }
    } catch (e) {
      setError('Load failed');
      setView('archive');
    }
  }, [lang]);

  // ── レッスン削除 ──
  const deleteLesson = useCallback(async (id: string) => {
    if (!confirm(t({ ja: 'このレッスンを削除しますか?', en: 'Delete this lesson?' }, lang))) return;
    await fetch(`/api/lesson-recorder/lessons/${id}`, { method: 'DELETE' });
    void fetchArchive();
    if (currentLesson?.meta.id === id) setView('archive');
  }, [lang, fetchArchive, currentLesson]);

  // ── 検索 ──
  const runSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch('/api/lesson-recorder/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, topK: 8 }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.matches || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  // ── リセット ──
  const reset = useCallback(() => {
    setRecordedBlob(null);
    setRecordSeconds(0);
    setTitle('');
    setInstrument('');
    setTeacher('');
    setCurrentLesson(null);
    setView('home');
    setError(null);
  }, []);

  // ──────────────────────────────────────────────────────────────────────
  // レンダリング
  // ──────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: PAPER, minHeight: '100vh', color: INK }}>
      <header style={{
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem) clamp(1rem, 2vw, 1.5rem)',
        maxWidth: 1100, margin: '0 auto',
      }}>
        <div style={{ fontFamily: mono, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.32em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>
          KUON · Lesson Recorder · Powered by Workers AI
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 400, letterSpacing: '0.04em', lineHeight: 1.4, margin: 0, color: INK }}>
          {t({
            ja: 'レッスン録音を、知識に変える。',
            en: 'Turn lesson recordings into knowledge.',
            es: 'Convierte grabaciones en conocimiento.',
            ko: '레슨 녹음을 지식으로.',
            pt: 'Transforme gravações em conhecimento.',
            de: 'Aus Aufnahmen wird Wissen.',
          }, lang)}
        </h1>
        <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 'clamp(0.95rem, 1.6vw, 1.05rem)', color: INK_SOFT, lineHeight: 2, marginTop: '1rem', maxWidth: 720, letterSpacing: '0.02em' }}>
          {t({
            ja: '録音 → 書き起こし → 3 行サマリー → アクション項目。Workers AI が音楽専門用語を理解し、教師と生徒の発話を自動で識別します。',
            en: 'Record → transcribe → 3-line summary → action items. Workers AI understands musical terminology and automatically distinguishes teacher and student.',
            es: 'Grabar → transcribir → resumen → acciones. Workers AI entiende terminología musical.',
            ko: '녹음 → 받아쓰기 → 요약 → 액션 항목. Workers AI가 음악 용어를 이해합니다.',
            pt: 'Gravar → transcrever → resumo → ações. Workers AI entende terminologia musical.',
            de: 'Aufnehmen → Transkribieren → Zusammenfassung → Aktionen. Workers AI versteht Musikterminologie.',
          }, lang)}
        </p>
      </header>

      {/* Tab navigation */}
      <nav style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(1.5rem, 4vw, 3rem)', marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <TabButton
          active={view === 'home' || view === 'recording'}
          onClick={() => view !== 'recording' && setView('home')}
          label={t({ ja: '新しいレッスン', en: 'New Lesson', es: 'Nueva clase', ko: '새 레슨', pt: 'Nova aula', de: 'Neue Lektion' }, lang)}
        />
        <TabButton
          active={view === 'archive'}
          onClick={() => setView('archive')}
          label={`${t({ ja: 'アーカイブ', en: 'Archive', es: 'Archivo', ko: '보관함', pt: 'Arquivo', de: 'Archiv' }, lang)} (${archiveLessons.length})`}
        />
      </nav>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(1.5rem, 4vw, 3rem) clamp(4rem, 8vw, 6rem)' }}>
        {error && (
          <div style={{ background: '#fff1f2', border: `1px solid ${RED}`, color: RED, padding: '1rem 1.2rem', borderRadius: 4, marginBottom: '1.5rem', fontSize: '0.9rem', fontFamily: sans, lineHeight: 1.7 }}>
            {error}
          </div>
        )}

        {/* HOME (新規レッスン入力) */}
        {view === 'home' && (
          <HomeView
            lang={lang}
            title={title} setTitle={setTitle}
            instrument={instrument} setInstrument={setInstrument}
            teacher={teacher} setTeacher={setTeacher}
            language={language} setLanguage={setLanguage}
            onStartRecording={startRecording}
            onFileSelect={handleFileSelect}
          />
        )}

        {/* RECORDING (録音中 or アップロード後) */}
        {view === 'recording' && (
          <RecordingView
            lang={lang}
            recording={recording}
            seconds={recordSeconds}
            audioLevel={audioLevel}
            recordedBlob={recordedBlob}
            onStop={stopRecording}
            onSubmit={submitTranscribe}
            onCancel={reset}
            title={title}
            instrument={instrument}
            teacher={teacher}
          />
        )}

        {/* PROCESSING */}
        {view === 'processing' && (
          <ProcessingView lang={lang} message={progressMessage} />
        )}

        {/* RESULT (書き起こし + 要約) */}
        {view === 'result' && currentLesson && (
          <ResultView
            lang={lang}
            lesson={currentLesson}
            onReset={reset}
            onUpdateLesson={setCurrentLesson}
          />
        )}

        {/* ARCHIVE */}
        {view === 'archive' && (
          <ArchiveView
            lang={lang}
            lessons={archiveLessons}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            searching={searching}
            onSearch={runSearch}
            onClickLesson={loadLesson}
            onDelete={deleteLesson}
          />
        )}
      </main>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// サブコンポーネント
// ──────────────────────────────────────────────────────────────────────────

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: sans, fontSize: '0.85rem', fontWeight: active ? 600 : 400,
        letterSpacing: '0.05em',
        background: active ? INK : 'transparent', color: active ? PAPER : INK,
        border: `1px solid ${active ? INK : STAFF_LINE}`,
        padding: '0.6rem 1.2rem', borderRadius: 3, cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {label}
    </button>
  );
}

function HomeView({
  lang, title, setTitle, instrument, setInstrument, teacher, setTeacher,
  language, setLanguage, onStartRecording, onFileSelect,
}: any) {
  const fileRef = useRef<HTMLInputElement>(null);
  const instruments = lang === 'ja' ? INSTRUMENTS_JA : INSTRUMENTS_EN;

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Meta input form */}
      <div style={{ background: '#fff', border: `1px solid ${STAFF_LINE}`, borderRadius: 4, padding: 'clamp(1.5rem, 3vw, 2.4rem)' }}>
        <h2 style={{ fontFamily: serif, fontSize: '1.3rem', fontWeight: 400, letterSpacing: '0.04em', margin: '0 0 1.5rem 0', color: INK }}>
          {t({ ja: 'レッスン情報', en: 'Lesson Info', es: 'Info de clase', ko: '레슨 정보', pt: 'Info da aula', de: 'Stundendetails' }, lang)}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
          <Field label={t({ ja: 'タイトル', en: 'Title' }, lang)} required>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder={t({ ja: '例: 第 3 楽章レッスン', en: 'e.g. Movement III lesson' }, lang)}
              style={inputStyle()}
            />
          </Field>
          <Field label={t({ ja: '楽器', en: 'Instrument' }, lang)}>
            <select value={instrument} onChange={(e) => setInstrument(e.target.value)} style={inputStyle()}>
              <option value="">{t({ ja: '— 選択 —', en: '— Select —' }, lang)}</option>
              {instruments.map((i: string) => <option key={i} value={i}>{i}</option>)}
            </select>
          </Field>
          <Field label={t({ ja: '先生', en: 'Teacher' }, lang)}>
            <input value={teacher} onChange={(e) => setTeacher(e.target.value)}
              placeholder={t({ ja: '例: 朝比奈幸太郎', en: 'e.g. Kotaro Asahina' }, lang)}
              style={inputStyle()}
            />
          </Field>
          <Field label={t({ ja: '言語', en: 'Language' }, lang)}>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} style={inputStyle()}>
              <option value="auto">{t({ ja: '自動検出', en: 'Auto-detect' }, lang)}</option>
              <option value="ja">日本語</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="it">Italiano</option>
              <option value="ko">한국어</option>
              <option value="pt">Português</option>
              <option value="zh">中文</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Action choices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
        <ActionCard
          icon="●"
          accent={RED}
          title={t({ ja: '今すぐ録音', en: 'Record now', es: 'Grabar ahora', ko: '지금 녹음', pt: 'Gravar agora', de: 'Jetzt aufnehmen' }, lang)}
          desc={t({ ja: 'マイクで直接録音し、すぐに書き起こし', en: 'Record directly via microphone', es: 'Graba directamente', ko: '마이크로 직접 녹음', pt: 'Grave pelo microfone', de: 'Direkt mit Mikrofon aufnehmen' }, lang)}
          onClick={onStartRecording}
        />
        <ActionCard
          icon="↑"
          accent={ACCENT}
          title={t({ ja: 'ファイルをアップロード', en: 'Upload file', es: 'Subir archivo', ko: '파일 업로드', pt: 'Carregar arquivo', de: 'Datei hochladen' }, lang)}
          desc={t({ ja: 'MP3 / WAV / M4A / OGG · 最大 25MB', en: 'MP3 / WAV / M4A / OGG · max 25MB' }, lang)}
          onClick={() => fileRef.current?.click()}
        />
      </div>
      <input
        ref={fileRef} type="file"
        accept="audio/mpeg,audio/wav,audio/mp4,audio/m4a,audio/ogg,audio/webm,audio/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileSelect(f);
        }}
      />

      {/* Privacy + price callout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
        <InfoCard label="🔒" title={t({ ja: 'プライバシー保護', en: 'Privacy first' }, lang)} body={t({ ja: '音声は処理後即座に Workers AI から削除されます。書き起こしテキストのみ保存。', en: 'Audio is deleted from Workers AI immediately after processing. Only text is stored.' }, lang)} />
        <InfoCard label="◆" title={t({ ja: 'Prelude プラン以上', en: 'Prelude plan and up' }, lang)} body={t({ ja: '月 20 回 (Prelude) / 80 回 (Concerto) / 200 回 (Symphony)', en: '20/mo (Prelude) / 80/mo (Concerto) / 200/mo (Symphony)' }, lang)} />
        <InfoCard label="✦" title={t({ ja: '音楽専門用語に対応', en: 'Music vocabulary aware' }, lang)} body={t({ ja: 'カデンツ・モーダル・ピチカート等を正しく認識', en: 'Cadence, modal, pizzicato etc. recognized correctly' }, lang)} />
      </div>
    </div>
  );
}

function RecordingView({ lang, recording, seconds, audioLevel, recordedBlob, onStop, onSubmit, onCancel, title }: any) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div style={{ background: '#fff', border: `1px solid ${STAFF_LINE}`, borderRadius: 4, padding: 'clamp(2rem, 4vw, 3rem)' }}>
      {recording ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', position: 'relative', marginBottom: '2rem' }}>
            <div style={{
              width: 140, height: 140, borderRadius: '50%',
              background: `radial-gradient(circle, ${RED} 0%, #f87171 60%, #fca5a5 100%)`,
              opacity: 0.85 + audioLevel * 0.15,
              transform: `scale(${1 + audioLevel * 0.15})`,
              transition: 'transform 0.1s ease, opacity 0.1s ease',
              boxShadow: `0 0 ${20 + audioLevel * 60}px rgba(220,38,38,${0.3 + audioLevel * 0.4})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3rem', color: 'white',
            }}>●</div>
          </div>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 400, color: INK, margin: '0 0 0.5rem 0', letterSpacing: '0.05em' }}>
            {mm}:{ss}
          </h2>
          <p style={{ fontFamily: sans, fontSize: '0.9rem', color: INK_SOFT, marginBottom: '2rem' }}>
            {t({ ja: '録音中… 静かにレッスンに集中してください', en: 'Recording… focus on the lesson' }, lang)}
          </p>
          <button onClick={onStop} style={{ ...primaryBtnStyle(INK), padding: '1rem 2.5rem', fontSize: '1rem' }}>
            {t({ ja: '停止して書き起こす', en: 'Stop & transcribe' }, lang)}
          </button>
        </div>
      ) : recordedBlob ? (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: serif, fontSize: '1.4rem', fontWeight: 400, marginBottom: '1rem' }}>
            {t({ ja: '録音準備完了', en: 'Ready to transcribe' }, lang)}
          </h2>
          <p style={{ fontFamily: sans, color: INK_SOFT, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            {title || t({ ja: 'レッスン録音', en: 'Lesson Recording' }, lang)}
          </p>
          <p style={{ fontFamily: mono, fontSize: '0.85rem', color: INK_FAINT, marginBottom: '2rem' }}>
            {(recordedBlob.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <audio controls src={URL.createObjectURL(recordedBlob)} style={{ width: '100%', maxWidth: 500, marginBottom: '2rem' }} />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onCancel} style={secondaryBtnStyle()}>
              {t({ ja: 'やり直す', en: 'Restart' }, lang)}
            </button>
            <button onClick={onSubmit} style={primaryBtnStyle(ACCENT)}>
              {t({ ja: '書き起こしを開始', en: 'Start transcription' }, lang)}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProcessingView({ lang, message }: any) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${STAFF_LINE}`, borderRadius: 4, padding: 'clamp(3rem, 6vw, 5rem)', textAlign: 'center' }}>
      <div style={{ display: 'inline-block', marginBottom: '2rem' }}>
        <div style={{
          width: 56, height: 56, border: `3px solid ${STAFF_LINE}`,
          borderTopColor: ACCENT, borderRadius: '50%',
          animation: 'kuonSpin 1s linear infinite',
        }} />
      </div>
      <h2 style={{ fontFamily: serif, fontSize: '1.3rem', fontWeight: 400, color: INK, margin: '0 0 1rem 0' }}>
        {message || t({ ja: '処理中…', en: 'Processing…' }, lang)}
      </h2>
      <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT, lineHeight: 1.8, maxWidth: 500, margin: '0 auto' }}>
        {t({
          ja: 'Cloudflare Workers AI でリアルタイム処理中。所要時間は録音長の約 1/10 です。',
          en: 'Real-time processing on Cloudflare Workers AI. Takes ~10% of recording length.',
        }, lang)}
      </p>
      <style>{`@keyframes kuonSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ResultView({ lang, lesson, onReset, onUpdateLesson }: any) {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'export'>('summary');
  const [exporting, setExporting] = useState(false);

  const exportMarkdown = useCallback(() => {
    const md = formatMarkdown(lesson);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, `${lesson.meta.title}.md`);
  }, [lesson]);

  const exportSrt = useCallback(() => {
    const srt = formatSrt(lesson.segments);
    const blob = new Blob([srt], { type: 'application/x-subrip;charset=utf-8' });
    downloadBlob(blob, `${lesson.meta.title}.srt`);
  }, [lesson]);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(lesson, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `${lesson.meta.title}.json`);
  }, [lesson]);

  const exportText = useCallback(() => {
    const blob = new Blob([lesson.fullText], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `${lesson.meta.title}.txt`);
  }, [lesson]);

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ background: '#fff', border: `1px solid ${STAFF_LINE}`, borderRadius: 4, padding: 'clamp(1.5rem, 3vw, 2rem)' }}>
        <div style={{ fontFamily: mono, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.18em', marginBottom: '0.6rem', textTransform: 'uppercase' }}>
          {new Date(lesson.meta.createdAt).toLocaleDateString(lang)}
          {lesson.meta.instrument && ` · ${lesson.meta.instrument}`}
          {lesson.meta.teacher && ` · ${lesson.meta.teacher}`}
          {' · '}
          {Math.floor(lesson.meta.duration / 60)}:{String(Math.floor(lesson.meta.duration % 60)).padStart(2, '0')}
        </div>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 400, color: INK, margin: 0, letterSpacing: '0.03em' }}>
          {lesson.meta.title}
        </h2>
      </div>

      {/* Tab */}
      <div style={{ display: 'flex', gap: '0.4rem', borderBottom: `1px solid ${STAFF_LINE}`, paddingBottom: '0.7rem' }}>
        <SubTab active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} label={t({ ja: 'AI 要約', en: 'AI Summary' }, lang)} />
        <SubTab active={activeTab === 'transcript'} onClick={() => setActiveTab('transcript')} label={t({ ja: '全文', en: 'Transcript' }, lang)} />
        <SubTab active={activeTab === 'export'} onClick={() => setActiveTab('export')} label={t({ ja: 'エクスポート', en: 'Export' }, lang)} />
      </div>

      {/* Content */}
      {activeTab === 'summary' && (
        <SummaryView lesson={lesson} lang={lang} onUpdate={onUpdateLesson} />
      )}
      {activeTab === 'transcript' && (
        <TranscriptView lesson={lesson} lang={lang} />
      )}
      {activeTab === 'export' && (
        <ExportView
          lang={lang}
          onMarkdown={exportMarkdown} onSrt={exportSrt}
          onJson={exportJson} onText={exportText}
        />
      )}

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <button onClick={onReset} style={secondaryBtnStyle()}>
          {t({ ja: '新しいレッスンを開始', en: 'New lesson' }, lang)}
        </button>
      </div>
    </div>
  );
}

function SummaryView({ lesson, lang }: any) {
  if (!lesson.summary) {
    return (
      <div style={{ background: '#fff', border: `1px solid ${STAFF_LINE}`, borderRadius: 4, padding: '2rem', textAlign: 'center', color: INK_SOFT, fontFamily: sans }}>
        {t({ ja: '要約は生成されていません', en: 'Summary not generated' }, lang)}
      </div>
    );
  }
  const s = lesson.summary as Summary;
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Card title={t({ ja: '要旨', en: 'Abstract' }, lang)}>
        <p style={{ fontFamily: serif, fontSize: '1.05rem', lineHeight: 2, color: INK, margin: 0, fontStyle: 'italic' }}>
          {s.abstract}
        </p>
      </Card>
      {s.keyPoints.length > 0 && (
        <Card title={t({ ja: '主な指摘', en: 'Key Points' }, lang)}>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', fontFamily: sans, fontSize: '0.95rem', lineHeight: 2, color: INK }}>
            {s.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </Card>
      )}
      {s.actionItems.length > 0 && (
        <Card title={t({ ja: 'アクション項目 (次回までに)', en: 'Action Items' }, lang)} accent>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', fontFamily: sans, fontSize: '0.95rem', lineHeight: 2, color: INK }}>
            {s.actionItems.map((p, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{p}</li>)}
          </ul>
        </Card>
      )}
      {s.musicTerms && s.musicTerms.length > 0 && (
        <Card title={t({ ja: '出てきた音楽用語', en: 'Music terms' }, lang)}>
          <div style={{ display: 'grid', gap: '0.7rem' }}>
            {s.musicTerms.map((mt, i) => (
              <div key={i} style={{ paddingBottom: '0.7rem', borderBottom: i < s.musicTerms.length - 1 ? `1px solid ${STAFF_LINE}` : 'none' }}>
                <div style={{ fontFamily: serif, fontSize: '1rem', fontWeight: 500, color: ACCENT_DEEP }}>
                  {mt.term}
                  {mt.theoryLink && (
                    <Link href={mt.theoryLink} style={{ fontFamily: mono, fontSize: '0.7rem', color: ACCENT, marginLeft: '0.6rem', textDecoration: 'none' }}>
                      → {t({ ja: 'Theory Suite で学ぶ', en: 'Learn in Theory Suite' }, lang)}
                    </Link>
                  )}
                </div>
                <div style={{ fontFamily: sans, fontSize: '0.88rem', color: INK_SOFT, lineHeight: 1.85, marginTop: '0.3rem' }}>
                  {mt.explanation}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {s.nextLessonHints && s.nextLessonHints.length > 0 && (
        <Card title={t({ ja: '次回への示唆', en: 'For next lesson' }, lang)}>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', fontFamily: serif, fontSize: '0.95rem', lineHeight: 1.95, color: INK_SOFT, fontStyle: 'italic' }}>
            {s.nextLessonHints.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </Card>
      )}
    </div>
  );
}

function TranscriptView({ lesson, lang }: any) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${STAFF_LINE}`, borderRadius: 4, padding: 'clamp(1.5rem, 3vw, 2.4rem)' }}>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {lesson.segments.map((seg: Segment, i: number) => {
          const speakerColor = seg.speaker === 'teacher' ? ACCENT_DEEP : seg.speaker === 'student' ? BLUE : INK_FAINT;
          const speakerLabel =
            seg.speaker === 'teacher' ? t({ ja: '先生', en: 'Teacher' }, lang) :
            seg.speaker === 'student' ? t({ ja: '生徒', en: 'Student' }, lang) :
            t({ ja: '？', en: '?' }, lang);
          const mm = String(Math.floor(seg.start / 60)).padStart(2, '0');
          const ss = String(Math.floor(seg.start % 60)).padStart(2, '0');
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 80px 1fr', gap: '0.8rem', alignItems: 'baseline' }}>
              <span style={{ fontFamily: mono, fontSize: '0.7rem', color: INK_FAINT }}>{mm}:{ss}</span>
              <span style={{ fontFamily: sans, fontSize: '0.7rem', color: speakerColor, fontWeight: 600, letterSpacing: '0.08em' }}>{speakerLabel}</span>
              <span style={{ fontFamily: serif, fontSize: '0.95rem', color: INK, lineHeight: 1.85 }}>{seg.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExportView({ lang, onMarkdown, onSrt, onJson, onText }: any) {
  const items = [
    { label: 'Markdown (.md)', desc: t({ ja: 'Notion / Obsidian に貼り付け可能', en: 'Paste into Notion/Obsidian' }, lang), onClick: onMarkdown },
    { label: 'SubRip (.srt)', desc: t({ ja: '動画に字幕として読込める', en: 'Use as video subtitles' }, lang), onClick: onSrt },
    { label: 'Plain text (.txt)', desc: t({ ja: 'シンプルなテキスト全文', en: 'Plain transcript text' }, lang), onClick: onText },
    { label: 'JSON (.json)', desc: t({ ja: '完全なデータ (タイムスタンプ含む)', en: 'Complete data with timestamps' }, lang), onClick: onJson },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
      {items.map((it) => (
        <button key={it.label} onClick={it.onClick} style={{
          background: '#fff', border: `1px solid ${STAFF_LINE}`, borderRadius: 4,
          padding: '1.4rem 1.6rem', cursor: 'pointer', textAlign: 'left',
          transition: 'border-color 0.2s ease',
        }}>
          <div style={{ fontFamily: serif, fontSize: '1rem', color: INK, marginBottom: '0.4rem' }}>{it.label}</div>
          <div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_SOFT, lineHeight: 1.7 }}>{it.desc}</div>
        </button>
      ))}
    </div>
  );
}

function ArchiveView({ lang, lessons, searchQuery, setSearchQuery, searchResults, searching, onSearch, onClickLesson, onDelete }: any) {
  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          placeholder={t({ ja: '過去レッスンを意味検索 (例: フレーズの作り方)', en: 'Semantic search past lessons' }, lang)}
          style={{ ...inputStyle(), flex: 1 }}
        />
        <button onClick={onSearch} style={primaryBtnStyle(INK)} disabled={searching}>
          {searching ? '...' : t({ ja: '検索', en: 'Search' }, lang)}
        </button>
      </div>

      {searchResults.length > 0 && (
        <div>
          <h3 style={{ fontFamily: mono, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>
            {t({ ja: '検索結果', en: 'Search results' }, lang)}
          </h3>
          <div style={{ display: 'grid', gap: '0.7rem' }}>
            {searchResults.map((r: any) => (
              <button key={r.lessonId} onClick={() => onClickLesson(r.lessonId)} style={cardBtnStyle()}>
                <div style={{ fontFamily: serif, fontSize: '1rem', color: INK, marginBottom: '0.3rem' }}>{r.title}</div>
                <div style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_SOFT, lineHeight: 1.7 }}>{r.snippet}</div>
                <div style={{ fontFamily: mono, fontSize: '0.65rem', color: ACCENT, marginTop: '0.4rem' }}>
                  {t({ ja: '一致度', en: 'Match' }, lang)}: {(r.score * 100).toFixed(0)}%
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <h3 style={{ fontFamily: mono, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '1rem 0 0.5rem 0' }}>
        {t({ ja: 'すべてのレッスン', en: 'All lessons' }, lang)} ({lessons.length})
      </h3>
      {lessons.length === 0 ? (
        <div style={{ background: PAPER_DEEP, padding: '3rem', textAlign: 'center', borderRadius: 4, fontFamily: serif, color: INK_SOFT, fontStyle: 'italic' }}>
          {t({ ja: 'まだレッスンがありません。最初の録音を試してみましょう。', en: 'No lessons yet. Try your first recording.' }, lang)}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.7rem' }}>
          {lessons.map((l: LessonMeta) => (
            <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.7rem', alignItems: 'center' }}>
              <button onClick={() => onClickLesson(l.id)} style={cardBtnStyle()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
                  <span style={{ fontFamily: serif, fontSize: '1rem', color: INK }}>{l.title}</span>
                  <span style={{ fontFamily: mono, fontSize: '0.7rem', color: INK_FAINT, flexShrink: 0 }}>
                    {new Date(l.createdAt).toLocaleDateString(lang)}
                  </span>
                </div>
                <div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_SOFT, marginTop: '0.3rem', display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
                  {l.instrument && <span>{l.instrument}</span>}
                  {l.teacher && <span>· {l.teacher}</span>}
                  <span>· {Math.floor(l.duration / 60)}:{String(Math.floor(l.duration % 60)).padStart(2, '0')}</span>
                  {l.hasSummary && <span style={{ color: GREEN }}>· {t({ ja: '要約済', en: 'Summarized' }, lang)}</span>}
                </div>
              </button>
              <button onClick={() => onDelete(l.id)} style={{ background: 'transparent', border: 'none', color: INK_FAINT, cursor: 'pointer', padding: '0.5rem', fontSize: '0.85rem' }} title="Delete">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// 共通スタイル + 小コンポーネント
// ──────────────────────────────────────────────────────────────────────────
function inputStyle(): React.CSSProperties {
  return {
    fontFamily: sans, fontSize: '0.92rem',
    padding: '0.7rem 0.9rem',
    border: `1px solid ${STAFF_LINE}`,
    borderRadius: 3, background: '#fff', color: INK,
    width: '100%', boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  };
}
function primaryBtnStyle(color: string): React.CSSProperties {
  return {
    fontFamily: serif, fontSize: '0.95rem', fontWeight: 500,
    background: color, color: PAPER, border: 'none',
    padding: '0.85rem 1.8rem', borderRadius: 3, cursor: 'pointer',
    letterSpacing: '0.08em', transition: 'all 0.25s ease',
  };
}
function secondaryBtnStyle(): React.CSSProperties {
  return {
    fontFamily: sans, fontSize: '0.88rem',
    background: 'transparent', color: INK_SOFT,
    border: `1px solid ${STAFF_LINE}`,
    padding: '0.7rem 1.4rem', borderRadius: 3, cursor: 'pointer',
    transition: 'all 0.2s ease',
  };
}
function cardBtnStyle(): React.CSSProperties {
  return {
    background: '#fff', border: `1px solid ${STAFF_LINE}`, borderRadius: 4,
    padding: '1.2rem 1.4rem', textAlign: 'left' as const, cursor: 'pointer',
    transition: 'border-color 0.2s ease, transform 0.2s ease',
    width: '100%',
  };
}

function Field({ label, required, children }: any) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ fontFamily: mono, fontSize: '0.65rem', color: INK_FAINT, letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
        {label}{required && <span style={{ color: RED }}> *</span>}
      </span>
      {children}
    </label>
  );
}
function ActionCard({ icon, accent, title, desc, onClick }: any) {
  return (
    <button onClick={onClick} style={{
      background: '#fff', border: `1px solid ${STAFF_LINE}`, borderRadius: 4,
      padding: '2rem 1.6rem', cursor: 'pointer', textAlign: 'center',
      transition: 'all 0.25s ease', display: 'block', width: '100%',
    }}>
      <div style={{ fontSize: '2rem', color: accent, marginBottom: '1rem', fontFamily: serif }}>{icon}</div>
      <div style={{ fontFamily: serif, fontSize: '1.15rem', fontWeight: 500, color: INK, marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontFamily: sans, fontSize: '0.82rem', color: INK_SOFT, lineHeight: 1.8 }}>{desc}</div>
    </button>
  );
}
function InfoCard({ label, title, body }: any) {
  return (
    <div style={{ background: PAPER_DEEP, padding: '1.2rem 1.3rem', borderRadius: 3 }}>
      <div style={{ fontFamily: serif, fontSize: '1.5rem', color: ACCENT, marginBottom: '0.4rem' }}>{label}</div>
      <div style={{ fontFamily: sans, fontSize: '0.85rem', fontWeight: 600, color: INK, marginBottom: '0.4rem', letterSpacing: '0.02em' }}>{title}</div>
      <div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_SOFT, lineHeight: 1.85 }}>{body}</div>
    </div>
  );
}
function Card({ title, children, accent }: any) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${accent ? ACCENT : STAFF_LINE}`, borderRadius: 4, padding: '1.4rem 1.6rem' }}>
      <h3 style={{ fontFamily: mono, fontSize: '0.7rem', color: accent ? ACCENT_DEEP : INK_FAINT, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 1rem 0', fontWeight: 600 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
function SubTab({ active, onClick, label }: any) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', border: 'none',
      padding: '0.6rem 1.2rem 0.5rem',
      fontFamily: sans, fontSize: '0.85rem',
      color: active ? INK : INK_FAINT,
      fontWeight: active ? 600 : 400,
      cursor: 'pointer',
      borderBottom: active ? `2px solid ${ACCENT}` : '2px solid transparent',
      transition: 'all 0.2s ease',
    }}>{label}</button>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────
function formatMarkdown(lesson: Lesson): string {
  const lines: string[] = [];
  lines.push(`# ${lesson.meta.title}\n`);
  lines.push(`*${new Date(lesson.meta.createdAt).toLocaleString()}*\n`);
  if (lesson.meta.instrument) lines.push(`- 楽器: ${lesson.meta.instrument}`);
  if (lesson.meta.teacher) lines.push(`- 先生: ${lesson.meta.teacher}`);
  lines.push(`- 言語: ${lesson.meta.language}`);
  lines.push(`- 長さ: ${Math.floor(lesson.meta.duration / 60)}:${String(Math.floor(lesson.meta.duration % 60)).padStart(2, '0')}\n`);
  if (lesson.summary) {
    lines.push(`## 要旨\n\n${lesson.summary.abstract}\n`);
    if (lesson.summary.keyPoints.length) {
      lines.push(`## 主な指摘\n`);
      lesson.summary.keyPoints.forEach((p) => lines.push(`- ${p}`));
      lines.push('');
    }
    if (lesson.summary.actionItems.length) {
      lines.push(`## アクション項目\n`);
      lesson.summary.actionItems.forEach((p) => lines.push(`- [ ] ${p}`));
      lines.push('');
    }
    if (lesson.summary.musicTerms?.length) {
      lines.push(`## 音楽用語\n`);
      lesson.summary.musicTerms.forEach((mt) => {
        lines.push(`### ${mt.term}\n${mt.explanation}\n`);
      });
    }
    if (lesson.summary.nextLessonHints?.length) {
      lines.push(`## 次回への示唆\n`);
      lesson.summary.nextLessonHints.forEach((p) => lines.push(`- ${p}`));
      lines.push('');
    }
  }
  lines.push(`## 全文\n`);
  lesson.segments.forEach((seg) => {
    const mm = String(Math.floor(seg.start / 60)).padStart(2, '0');
    const ss = String(Math.floor(seg.start % 60)).padStart(2, '0');
    const sp = seg.speaker === 'teacher' ? '**[先生]**' : seg.speaker === 'student' ? '**[生徒]**' : '';
    lines.push(`*${mm}:${ss}* ${sp} ${seg.text}`);
  });
  lines.push(`\n---\n`);
  lines.push(`Generated by KUON Lesson Recorder · kuon-rnd.com`);
  return lines.join('\n');
}

function formatSrt(segments: Segment[]): string {
  const fmtTime = (s: number) => {
    const hh = String(Math.floor(s / 3600)).padStart(2, '0');
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(Math.floor(s % 60)).padStart(2, '0');
    const ms = String(Math.floor((s % 1) * 1000)).padStart(3, '0');
    return `${hh}:${mm}:${ss},${ms}`;
  };
  return segments
    .map((seg, i) => `${i + 1}\n${fmtTime(seg.start)} --> ${fmtTime(seg.end)}\n${seg.text}\n`)
    .join('\n');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
