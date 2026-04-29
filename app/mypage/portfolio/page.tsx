'use client';

/**
 * /mypage/portfolio — ポートフォリオ編集ページ（CLAUDE.md §48 基準）
 * =========================================================
 * 「私の音楽」の編集面。マイページの「私の音楽」カードから誘導される。
 *
 * 設計原則（余白の知性）:
 *   - 静かな配色（和紙背景・墨字）
 *   - Shippori Mincho を主見出し、Helvetica Neue を入力フィールドに
 *   - 「保存しました！」のような感嘆詞ではなく「保存されました」程度
 *   - キャラクター・マスコット禁止
 *
 * フィールド:
 *   - 名前 / 楽器・職種 / 拠点 / 自己紹介
 *   - 経験レベル / 話せる言語 / 移動可能範囲
 *   - SNS（YouTube / Instagram / X / SoundCloud / Web）
 *   - 仕事を受け付けるか
 *
 * 既存 API（/api/auth/profile PUT）をそのまま使用。
 * 公開プロフィールページ（/u/{slug}）は将来実装。
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';

const INK = '#1a1a1a';
const INK_SOFT = '#475569';
const INK_FAINT = '#94a3b8';
const PAPER = '#fafaf7';
const PAPER_DEEP = '#f5f4ed';
const STAFF_LINE = '#d4d0c4';
const ACCENT_INDIGO = '#3a3a5e';

type L6 = { ja?: string; en: string; es?: string; ko?: string; pt?: string; de?: string };
const t = (m: L6, lang: Lang): string => (m as Record<string, string>)[lang] ?? m.en;

interface FormShape {
  name: string;
  role: string;
  customRoleName: string;
  basedIn: string;
  mobility: string;
  bio: string;
  experienceLevel: string;
  spokenLanguages: string;
  availableForWork: boolean;
  snsYoutube: string;
  snsInstagram: string;
  snsX: string;
  snsSoundcloud: string;
  snsWebsite: string;
}

const EMPTY_FORM: FormShape = {
  name: '', role: '', customRoleName: '', basedIn: '', mobility: '',
  bio: '', experienceLevel: '', spokenLanguages: '', availableForWork: false,
  snsYoutube: '', snsInstagram: '', snsX: '', snsSoundcloud: '', snsWebsite: '',
};

export default function PortfolioEditPage() {
  const { lang } = useLang();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [form, setForm] = useState<FormShape>(EMPTY_FORM);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // 初期ロード — /api/auth/me でユーザー情報取得
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) {
          router.push('/auth/login');
          return;
        }
        const data = await res.json();
        const u = data.user || data;
        setEmail(u.email || '');
        setForm({
          name: u.name || '',
          role: u.role || '',
          customRoleName: u.customRoleName || '',
          basedIn: u.basedIn || '',
          mobility: u.mobility || '',
          bio: u.bio || '',
          experienceLevel: u.experienceLevel || '',
          spokenLanguages: u.spokenLanguages || '',
          availableForWork: u.availableForWork || false,
          snsYoutube: u.snsYoutube || '',
          snsInstagram: u.snsInstagram || '',
          snsX: u.snsX || '',
          snsSoundcloud: u.snsSoundcloud || '',
          snsWebsite: u.snsWebsite || '',
        });
        setAvatarUrl(`/api/auth/avatar/${encodeURIComponent(u.email)}?t=${Date.now()}`);
      } catch {
        router.push('/auth/login');
      }
      setLoading(false);
    })();
  }, [router]);

  // 保存
  const handleSave = async () => {
    setSaving(true);
    setSavedNotice(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSavedNotice(t({
          ja: '保存されました',
          en: 'Saved',
          es: 'Guardado',
          ko: '저장되었습니다',
          pt: 'Salvo',
          de: 'Gespeichert',
        }, lang));
        setTimeout(() => setSavedNotice(null), 3000);
      } else {
        setSavedNotice(t({
          ja: '保存に失敗しました',
          en: 'Failed to save',
          es: 'Error al guardar',
          ko: '저장 실패',
          pt: 'Falha ao salvar',
          de: 'Speichern fehlgeschlagen',
        }, lang));
      }
    } catch {
      setSavedNotice(t({ ja: '通信エラー', en: 'Network error', es: 'Error de red', ko: '통신 오류', pt: 'Erro de rede', de: 'Netzwerkfehler' }, lang));
    }
    setSaving(false);
  };

  // アバターアップロード
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert(t({
        ja: 'ファイルサイズは 2MB 以下にしてください',
        en: 'File must be under 2 MB',
        es: 'El archivo debe ser menor a 2 MB',
        ko: '파일 크기는 2 MB 이하여야 합니다',
        pt: 'O arquivo deve ter menos de 2 MB',
        de: 'Datei muss kleiner als 2 MB sein',
      }, lang));
      return;
    }
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await fetch('/api/auth/avatar', { method: 'POST', body: fd });
      if (res.ok && email) {
        setAvatarUrl(`/api/auth/avatar/${encodeURIComponent(email)}?t=${Date.now()}`);
      }
    } catch { /* ignore */ }
    setAvatarUploading(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: serif, fontSize: '0.95rem', color: INK_FAINT, letterSpacing: '0.05em' }}>...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: PAPER, padding: 'clamp(1.5rem, 4vw, 3rem) 1rem clamp(3rem, 6vw, 5rem)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* ─── パンくず（控えめに） ─── */}
        <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}>
          <Link
            href="/mypage#my-music"
            style={{
              fontFamily: sans,
              fontSize: '0.78rem',
              color: INK_SOFT,
              textDecoration: 'none',
              letterSpacing: '0.05em',
            }}
          >
            ← {t({ ja: 'マイページに戻る', en: 'Back to My Page', es: 'Volver a Mi Página', ko: '마이페이지로 돌아가기', pt: 'Voltar para Minha Página', de: 'Zurück zur Mein-Seite' }, lang)}
          </Link>
        </div>

        {/* ─── 見出し ─── */}
        <div style={{ marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
          <div style={{
            fontFamily: sans,
            fontSize: '0.7rem',
            color: INK_FAINT,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: '0.6rem',
          }}>
            {t({ ja: 'ポートフォリオ編集', en: 'Edit Portfolio', es: 'Editar portafolio', ko: '포트폴리오 편집', pt: 'Editar portfólio', de: 'Portfolio bearbeiten' }, lang)}
          </div>
          <h1 style={{
            fontFamily: serif,
            fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
            fontWeight: 400,
            color: INK,
            letterSpacing: '0.04em',
            margin: 0,
            lineHeight: 1.4,
          }}>
            {t({
              ja: 'あなたの音楽を、言葉に',
              en: 'Your music, in your words',
              es: 'Tu música, en tus palabras',
              ko: '당신의 음악을 글로',
              pt: 'Sua música, em suas palavras',
              de: 'Ihre Musik, in Ihren Worten',
            }, lang)}
          </h1>
          <p style={{
            fontFamily: serif,
            fontSize: '0.9rem',
            color: INK_SOFT,
            fontStyle: 'italic',
            marginTop: '0.6rem',
            lineHeight: 1.7,
          }}>
            {t({
              ja: '記入しなくても構いません。書きたくなったときに、書けばよい。',
              en: 'There is no need to fill anything in. Write when you are ready.',
              es: 'No es necesario llenar nada. Escribe cuando estés listo.',
              ko: '꼭 채울 필요는 없습니다. 마음이 동할 때 쓰십시오.',
              pt: 'Não há necessidade de preencher tudo. Escreva quando quiser.',
              de: 'Sie müssen nichts ausfüllen. Schreiben Sie, wenn Sie bereit sind.',
            }, lang)}
          </p>
        </div>

        {/* ─── アバター ─── */}
        <Section title={t({ ja: 'アバター', en: 'Avatar', es: 'Avatar', ko: '아바타', pt: 'Avatar', de: 'Avatar' }, lang)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: 96, height: 96, borderRadius: '50%',
                overflow: 'hidden', cursor: 'pointer',
                background: PAPER_DEEP,
                border: `1px solid ${STAFF_LINE}`,
                flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {avatarUploading ? (
                <span style={{ fontFamily: serif, fontSize: '0.8rem', color: INK_FAINT }}>...</span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            <div>
              <button
                onClick={() => fileRef.current?.click()}
                style={pillButtonStyle}
              >
                {t({ ja: '画像を選択', en: 'Choose image', es: 'Elegir imagen', ko: '이미지 선택', pt: 'Escolher imagem', de: 'Bild wählen' }, lang)}
              </button>
              <div style={{ fontFamily: sans, fontSize: '0.72rem', color: INK_FAINT, marginTop: '0.5rem', letterSpacing: '0.03em' }}>
                {t({ ja: 'JPEG / PNG / WebP・2 MB まで', en: 'JPEG / PNG / WebP · up to 2 MB', es: 'JPEG / PNG / WebP · hasta 2 MB', ko: 'JPEG / PNG / WebP · 최대 2 MB', pt: 'JPEG / PNG / WebP · até 2 MB', de: 'JPEG / PNG / WebP · bis zu 2 MB' }, lang)}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            </div>
          </div>
        </Section>

        {/* ─── 基本情報 ─── */}
        <Section title={t({ ja: '基本情報', en: 'Basics', es: 'Básico', ko: '기본 정보', pt: 'Básico', de: 'Grundlegendes' }, lang)}>
          <Field label={t({ ja: '名前', en: 'Name', es: 'Nombre', ko: '이름', pt: 'Nome', de: 'Name' }, lang)}>
            <input
              type="text" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
              placeholder={t({ ja: '本名でも活動名でも', en: 'Real name or stage name', es: 'Nombre real o artístico', ko: '본명 또는 활동명', pt: 'Nome real ou artístico', de: 'Echter Name oder Künstlername' }, lang)}
            />
          </Field>

          <Field label={t({ ja: '楽器・職種', en: 'Instrument or role', es: 'Instrumento o rol', ko: '악기 · 역할', pt: 'Instrumento ou função', de: 'Instrument oder Rolle' }, lang)}>
            <input
              type="text" value={form.customRoleName}
              onChange={e => setForm({ ...form, customRoleName: e.target.value })}
              style={inputStyle}
              placeholder={t({ ja: '例: ピアニスト、作曲家、エンジニア', en: 'e.g. Pianist, Composer, Engineer', es: 'ej. Pianista, Compositor, Ingeniero', ko: '예: 피아니스트, 작곡가, 엔지니어', pt: 'ex.: Pianista, Compositor, Engenheiro', de: 'z. B. Pianist, Komponist, Toningenieur' }, lang)}
            />
          </Field>

          <Field label={t({ ja: '拠点', en: 'Based in', es: 'Localización', ko: '거점', pt: 'Localização', de: 'Standort' }, lang)}>
            <input
              type="text" value={form.basedIn}
              onChange={e => setForm({ ...form, basedIn: e.target.value })}
              style={inputStyle}
              placeholder={t({ ja: '例: 東京・帯広・ベルリン', en: 'e.g. Tokyo, Berlin, Buenos Aires', es: 'ej. Tokio, Berlín, Buenos Aires', ko: '예: 도쿄, 베를린, 부에노스아이레스', pt: 'ex.: Tóquio, Berlim, Buenos Aires', de: 'z. B. Tokio, Berlin, Buenos Aires' }, lang)}
            />
          </Field>

          <Field label={t({ ja: '自己紹介', en: 'Bio', es: 'Bio', ko: '자기 소개', pt: 'Bio', de: 'Bio' }, lang)}>
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              rows={5}
              style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' as const, fontFamily: serif, lineHeight: 1.7 }}
              placeholder={t({
                ja: 'あなたの音楽について、自由に。',
                en: 'About your music, in your words.',
                es: 'Sobre tu música, en tus palabras.',
                ko: '당신의 음악에 대해, 자유롭게.',
                pt: 'Sobre sua música, em suas palavras.',
                de: 'Über Ihre Musik, in Ihren Worten.',
              }, lang)}
              maxLength={2000}
            />
            <div style={{ fontFamily: sans, fontSize: '0.7rem', color: INK_FAINT, textAlign: 'right' as const, marginTop: '0.3rem' }}>
              {form.bio.length} / 2000
            </div>
          </Field>
        </Section>

        {/* ─── 経験・対応範囲 ─── */}
        <Section title={t({ ja: '経験・対応範囲', en: 'Experience', es: 'Experiencia', ko: '경험 · 활동 범위', pt: 'Experiência', de: 'Erfahrung' }, lang)}>
          <Field label={t({ ja: '経験レベル', en: 'Experience level', es: 'Nivel de experiencia', ko: '경험 수준', pt: 'Nível de experiência', de: 'Erfahrungsstufe' }, lang)}>
            <input
              type="text" value={form.experienceLevel}
              onChange={e => setForm({ ...form, experienceLevel: e.target.value })}
              style={inputStyle}
              placeholder={t({ ja: '例: 演奏歴 10 年、音大 2 年生', en: 'e.g. 10 years performing, 2nd year conservatory', es: 'ej. 10 años, 2º conservatorio', ko: '예: 연주 10년, 음대 2학년', pt: 'ex.: 10 anos, 2º ano conservatório', de: 'z. B. 10 Jahre, 2. Semester Hochschule' }, lang)}
            />
          </Field>

          <Field label={t({ ja: '話せる言語', en: 'Languages spoken', es: 'Idiomas', ko: '구사 언어', pt: 'Idiomas falados', de: 'Sprachen' }, lang)}>
            <input
              type="text" value={form.spokenLanguages}
              onChange={e => setForm({ ...form, spokenLanguages: e.target.value })}
              style={inputStyle}
              placeholder="日本語, English, Español"
            />
          </Field>

          <Field label={t({ ja: '移動可能範囲', en: 'Travel range', es: 'Rango de viaje', ko: '이동 가능 범위', pt: 'Área de atendimento', de: 'Reichweite' }, lang)}>
            <input
              type="text" value={form.mobility}
              onChange={e => setForm({ ...form, mobility: e.target.value })}
              style={inputStyle}
              placeholder={t({ ja: '例: 道内・首都圏・国内・海外可', en: 'e.g. Local, national, international', es: 'ej. Local, nacional, internacional', ko: '예: 지역, 국내, 해외', pt: 'ex.: Local, nacional, internacional', de: 'z. B. Lokal, national, international' }, lang)}
            />
          </Field>

          <Field label={t({ ja: '仕事を受け付ける', en: 'Available for work', es: 'Disponible para trabajo', ko: '의뢰를 받습니다', pt: 'Disponível para trabalhos', de: 'Für Aufträge verfügbar' }, lang)}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: sans, fontSize: '0.85rem', color: INK_SOFT }}>
              <input
                type="checkbox"
                checked={form.availableForWork}
                onChange={e => setForm({ ...form, availableForWork: e.target.checked })}
                style={{ width: 16, height: 16 }}
              />
              {t({
                ja: '依頼・問い合わせを受け付けます',
                en: 'I am open to inquiries',
                es: 'Estoy abierto a consultas',
                ko: '문의를 받습니다',
                pt: 'Aberto a consultas',
                de: 'Offen für Anfragen',
              }, lang)}
            </label>
          </Field>
        </Section>

        {/* ─── SNS ─── */}
        <Section title={t({ ja: 'SNS・Web', en: 'Links', es: 'Enlaces', ko: '링크', pt: 'Links', de: 'Links' }, lang)}>
          <Field label="YouTube">
            <input
              type="url" value={form.snsYoutube}
              onChange={e => setForm({ ...form, snsYoutube: e.target.value })}
              style={inputStyle}
              placeholder="https://youtube.com/@..."
            />
          </Field>
          <Field label="Instagram">
            <input
              type="url" value={form.snsInstagram}
              onChange={e => setForm({ ...form, snsInstagram: e.target.value })}
              style={inputStyle}
              placeholder="https://instagram.com/..."
            />
          </Field>
          <Field label="X (Twitter)">
            <input
              type="url" value={form.snsX}
              onChange={e => setForm({ ...form, snsX: e.target.value })}
              style={inputStyle}
              placeholder="https://x.com/..."
            />
          </Field>
          <Field label="SoundCloud">
            <input
              type="url" value={form.snsSoundcloud}
              onChange={e => setForm({ ...form, snsSoundcloud: e.target.value })}
              style={inputStyle}
              placeholder="https://soundcloud.com/..."
            />
          </Field>
          <Field label={t({ ja: 'ウェブサイト', en: 'Website', es: 'Sitio web', ko: '웹사이트', pt: 'Site', de: 'Webseite' }, lang)}>
            <input
              type="url" value={form.snsWebsite}
              onChange={e => setForm({ ...form, snsWebsite: e.target.value })}
              style={inputStyle}
              placeholder="https://..."
            />
          </Field>
        </Section>

        {/* ─── 保存ボタン ─── */}
        <div style={{
          display: 'flex',
          gap: '0.8rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginTop: 'clamp(2rem, 4vw, 3rem)',
        }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              fontFamily: sans,
              fontSize: '0.85rem',
              color: PAPER,
              background: saving ? INK_FAINT : INK,
              border: 'none',
              borderRadius: 999,
              padding: '0.7rem 1.8rem',
              cursor: saving ? 'wait' : 'pointer',
              letterSpacing: '0.06em',
              transition: 'background 0.2s ease',
            }}
          >
            {saving
              ? t({ ja: '保存中', en: 'Saving', es: 'Guardando', ko: '저장 중', pt: 'Salvando', de: 'Speichert' }, lang)
              : t({ ja: '保存', en: 'Save', es: 'Guardar', ko: '저장', pt: 'Salvar', de: 'Speichern' }, lang)
            }
          </button>

          <Link
            href="/mypage#my-music"
            style={{
              fontFamily: sans,
              fontSize: '0.85rem',
              color: INK_SOFT,
              textDecoration: 'none',
              padding: '0.7rem 1.4rem',
              letterSpacing: '0.06em',
            }}
          >
            {t({ ja: 'キャンセル', en: 'Cancel', es: 'Cancelar', ko: '취소', pt: 'Cancelar', de: 'Abbrechen' }, lang)}
          </Link>

          {savedNotice && (
            <span style={{
              fontFamily: serif,
              fontSize: '0.85rem',
              color: ACCENT_INDIGO,
              fontStyle: 'italic',
              letterSpacing: '0.02em',
            }}>
              {savedNotice}
            </span>
          )}
        </div>

        {/* ─── 公開プロフィール（将来実装の予告・控えめに） ─── */}
        <div style={{
          marginTop: 'clamp(3rem, 6vw, 5rem)',
          paddingTop: 'clamp(2rem, 4vw, 3rem)',
          borderTop: `1px solid ${STAFF_LINE}`,
        }}>
          <p style={{
            fontFamily: serif,
            fontSize: '0.85rem',
            color: INK_FAINT,
            fontStyle: 'italic',
            lineHeight: 1.8,
            margin: 0,
            textAlign: 'center' as const,
          }}>
            {t({
              ja: '公開プロフィールページ（kuon-rnd.com/u/...）は近日対応予定です。',
              en: 'Public profile pages (kuon-rnd.com/u/...) coming soon.',
              es: 'Páginas de perfil público (kuon-rnd.com/u/...) próximamente.',
              ko: '공개 프로필 페이지 (kuon-rnd.com/u/...) 곧 지원 예정.',
              pt: 'Páginas de perfil público (kuon-rnd.com/u/...) em breve.',
              de: 'Öffentliche Profilseiten (kuon-rnd.com/u/...) bald verfügbar.',
            }, lang)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 共通スタイル（インライン）
// ─────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.9rem',
  background: '#fff',
  border: `1px solid ${STAFF_LINE}`,
  borderRadius: 4,
  fontFamily: sans,
  fontSize: '0.9rem',
  color: INK,
  letterSpacing: '0.02em',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease',
};

const pillButtonStyle: React.CSSProperties = {
  fontFamily: sans,
  fontSize: '0.78rem',
  color: INK,
  background: 'transparent',
  border: `1px solid ${INK}`,
  borderRadius: 999,
  padding: '0.5rem 1.2rem',
  cursor: 'pointer',
  letterSpacing: '0.06em',
};

// ─────────────────────────────────────────
// Section / Field コンポーネント
// ─────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${STAFF_LINE}`,
      borderRadius: 4,
      padding: 'clamp(1.5rem, 3vw, 2rem)',
      marginBottom: 'clamp(1.2rem, 2.5vw, 1.6rem)',
    }}>
      <div style={{
        fontFamily: sans,
        fontSize: '0.7rem',
        color: INK_FAINT,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        marginBottom: 'clamp(1rem, 2vw, 1.4rem)',
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 2vw, 1.3rem)' }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontFamily: sans,
        fontSize: '0.75rem',
        color: INK_SOFT,
        letterSpacing: '0.04em',
        marginBottom: '0.4rem',
        fontWeight: 500,
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}
