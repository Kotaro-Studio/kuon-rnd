'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─── Design tokens ───
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#8b5cf6';
const GREEN = '#22c55e';
const RED = '#ef4444';

type L5 = Partial<Record<Lang, string>> & { en: string };
const t = (m: L5, lang: Lang) => m[lang] ?? m.en;

export default function SightReadingLP() {
  const { lang } = useLang();
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = '1';
          (e.target as HTMLElement).style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.15 });
    revealRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const addReveal = (el: HTMLElement | null) => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); };

  const revealStyle: React.CSSProperties = {
    opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.7s, transform 0.7s',
  };

  // ─── CONTENT ───
  const hero = {
    title: { ja: '楽譜が読めない人は、\n音楽家にはなれない。', en: 'If you cannot read music,\nyou cannot be a musician.', ko: '악보를 읽을 수 없다면,\n음악가가 될 수 없다.', pt: 'Se voce nao le partituras,\nnao pode ser musico.', es: 'Si no puedes leer partituras,\nno puedes ser musico.' } as L5,
    sub: { ja: '初見力は、すべての演奏の土台。', en: 'Sight reading is the foundation of all performance.', ko: '초견 실력은 모든 연주의 기초.', pt: 'Leitura a primeira vista e a base de toda performance.', es: 'La lectura a primera vista es la base de toda interpretacion.' } as L5,
    cta: { ja: '今すぐトレーニングを始める', en: 'Start Training Now', ko: '지금 바로 훈련 시작', pt: 'Comece a Treinar Agora', es: 'Empieza a Entrenar Ahora' } as L5,
  };

  const pains = [
    { icon: '😰', title: { ja: '音名がすぐに出てこない', en: 'Note names do not come instantly', ko: '음이름이 바로 나오지 않는다', pt: 'Nomes das notas nao vem instantaneamente', es: 'Los nombres de las notas no salen al instante' } as L5, desc: { ja: '五線譜を見て、指で数えて、やっと音名がわかる。初見試験では致命的なロスになる。', en: 'You look at the staff, count with your fingers, and finally get the note name. In a sight reading exam, that delay is fatal.', ko: '오선보를 보고 손가락으로 세고 나서야 음이름을 알 수 있다. 초견 시험에서는 치명적인 지연이다.', pt: 'Voce olha a pauta, conta nos dedos e finalmente descobre a nota. No exame, esse atraso e fatal.', es: 'Miras el pentagrama, cuentas con los dedos y finalmente sabes la nota. En el examen, ese retraso es fatal.' } as L5 },
    { icon: '😵', title: { ja: '調号を見た瞬間にフリーズする', en: 'You freeze when you see the key signature', ko: '조표를 보는 순간 멈춘다', pt: 'Voce congela ao ver a armadura', es: 'Te congelas al ver la armadura' } as L5, desc: { ja: '#が4つ？bが5つ？何調？ — 調号の判定に時間がかかると、曲の構造が見えなくなる。', en: 'Four sharps? Five flats? What key? When key signature identification takes time, you lose sight of the musical structure.', ko: '#이 4개? b가 5개? 무슨 조? 조표 판정에 시간이 걸리면 곡의 구조가 보이지 않게 된다.', pt: 'Quatro sustenidos? Cinco bemois? Que tom? Quando a identificacao da armadura demora, voce perde a estrutura musical.', es: 'Cuatro sostenidos? Cinco bemoles? Que tono? Cuando la identificacion tarda, pierdes la estructura musical.' } as L5 },
    { icon: '😤', title: { ja: 'ヘ音記号・ハ音記号で迷子になる', en: 'You get lost in bass and C clefs', ko: '낮은음자리표와 가온음자리표에서 길을 잃는다', pt: 'Voce se perde nas claves de fa e do', es: 'Te pierdes en las claves de fa y do' } as L5, desc: { ja: 'ト音記号は読めるのに、ヘ音記号になると途端に遅くなる。アルト記号・テノール記号は壊滅的。', en: 'Treble clef is fine, but bass clef slows you down. Alto and tenor clefs are a disaster.', ko: '높은음자리표는 읽는데, 낮은음자리표가 나오면 갑자기 느려진다. 알토와 테너 음자리표는 재앙이다.', pt: 'Clave de sol esta bem, mas a clave de fa te desacelera. Claves de do sao um desastre.', es: 'La clave de sol esta bien, pero la clave de fa te frena. Las claves de do son un desastre.' } as L5 },
  ];

  const modes = [
    { icon: '🎼', title: { ja: '音名読み (Note Reading)', en: 'Note Reading', ko: '음이름 읽기', pt: 'Leitura de Notas', es: 'Lectura de Notas' } as L5, desc: { ja: '五線譜上に表示された音符の音名を4択から答える。レベルが上がると加線・臨時記号が追加。ト音記号からヘ音記号・ハ音記号へ自然に拡張。', en: 'Identify the note displayed on the staff from 4 choices. Higher levels add ledger lines and accidentals. Gradually expands from treble to bass and C clefs.', ko: '오선보에 표시된 음이름을 4지선다로 답한다. 레벨이 오르면 덧줄과 임시표가 추가된다. 높은음자리표에서 낮은음자리표, 가온음자리표로 확장.', pt: 'Identifique a nota na pauta entre 4 opcoes. Niveis mais altos adicionam linhas suplementares e acidentes. Expande gradualmente do sol para fa e do.', es: 'Identifica la nota en el pentagrama entre 4 opciones. Niveles mas altos agregan lineas adicionales y alteraciones. Se expande gradualmente del sol al fa y do.' } as L5 },
    { icon: '🔑', title: { ja: '調号判定 (Key Signature)', en: 'Key Signature ID', ko: '조표 판정', pt: 'Armadura', es: 'Armadura' } as L5, desc: { ja: '表示された調号（#やb）から、何調かを4択で判定する。レベルが上がるとシャープ・フラットの数が増え、短調も出題。全15調を完全網羅。', en: 'Identify the key from the displayed sharps or flats. Higher levels increase accidental count and add minor keys. Covers all 15 key signatures.', ko: '표시된 조표(#, b)로 무슨 조인지 4지선다로 판정한다. 레벨이 오르면 샤프/플랫 수가 늘고 단조도 출제. 15개 조 완전 망라.', pt: 'Identifique o tom pelos sustenidos ou bemois exibidos. Niveis mais altos aumentam os acidentes e adicionam tons menores. Cobre todas as 15 armaduras.', es: 'Identifica el tono por los sostenidos o bemoles mostrados. Niveles mas altos aumentan las alteraciones y agregan tonos menores. Cubre las 15 armaduras.' } as L5 },
    { icon: '🎻', title: { ja: '音部記号 (Clef Reading)', en: 'Clef Reading', ko: '음자리표', pt: 'Leitura de Claves', es: 'Lectura de Claves' } as L5, desc: { ja: 'ト音記号・ヘ音記号・アルト記号・テノール記号のランダム出題。同じ五線上の位置でも、音部記号が変われば音名が変わる。瞬時の切り替え力を鍛える。', en: 'Random questions across treble, bass, alto, and tenor clefs. The same staff position means a different note in each clef. Train your instant clef-switching ability.', ko: '높은음자리표, 낮은음자리표, 알토, 테너 음자리표 랜덤 출제. 같은 오선 위치여도 음자리표가 바뀌면 음이름이 바뀐다. 순간 전환 능력을 기른다.', pt: 'Questoes aleatorias entre claves de sol, fa, do (alto) e do (tenor). A mesma posicao na pauta significa uma nota diferente em cada clave. Treine sua troca instantanea.', es: 'Preguntas aleatorias entre claves de sol, fa, do (alto) y do (tenor). La misma posicion en el pentagrama significa una nota diferente en cada clave. Entrena tu cambio instantaneo.' } as L5 },
    { icon: '🔄', title: { ja: '記譜変換 (Notation Conversion)', en: 'Notation Conversion', ko: '기보 변환', pt: 'Conversao de Notacao', es: 'Conversion de Notacion' } as L5, desc: { ja: 'ドレミ（イタリア語）・ドイツ音名・英語音名・日本音名の4体系を自在に変換する。「H-dur は何調？」「Fis はドレミで？」「Re mayor は日本語で？」— 楽典試験と国際的な音楽現場の両方で通用する記譜力を育てる。', en: 'Convert freely between Italian solfège (Do Re Mi), German, English, and Japanese notation — all four systems. "What key is H-dur?" "What is Fis in solfège?" "What is Re mayor in Japanese?" — Build notation fluency that works in exams AND in international musical settings.', ko: '이탈리아 솔페주(도레미)·독일 음명·영어 음명·일본 음명 4체계를 자유자재로 변환. "H-dur는 무슨 조?" "Fis는 솔페주로?" "Re mayor는 일본어로?" — 시험과 국제 현장 양쪽에서 통하는 기보력.', pt: 'Converta livremente entre solfejo italiano (Do Re Mi), notacao alema, inglesa e japonesa — os quatro sistemas. "Que tom e H-dur?" "O que e Fis em solfejo?" "O que e Re maior em japones?" — Fluencia em notacao que funciona em exames E em ambientes musicais internacionais.', es: 'Convierte libremente entre solfeo italiano (Do Re Mi), notacion alemana, inglesa y japonesa — los cuatro sistemas. "Que tono es H-dur?" "Que es Fis en solfeo?" "Que es Re mayor en japones?" — Fluidez en notacion que funciona en examenes Y en entornos musicales internacionales.' } as L5 },
  ];

  const examBenefits = [
    { num: '01', text: { ja: '楽典試験の音名問題で確実に得点できる', en: 'Score reliably on note name questions in music theory exams', ko: '악전 시험의 음이름 문제에서 확실히 득점', pt: 'Pontue com seguranca em questoes de nomes de notas', es: 'Puntua con seguridad en preguntas de nombres de notas' } as L5 },
    { num: '02', text: { ja: '調号判定が瞬時にできるようになり、聴音試験でも有利', en: 'Instant key signature ID gives you an edge in ear tests too', ko: '조표 판정이 순식간에 가능해져 청음 시험에서도 유리', pt: 'Identificacao instantanea de armadura da vantagem nos exames auditivos', es: 'La identificacion instantanea de armadura te da ventaja en examenes auditivos' } as L5 },
    { num: '03', text: { ja: 'ハ音記号（アルト・テノール）を恐れなくなる', en: 'Stop fearing C clefs (alto and tenor)', ko: '가온음자리표(알토, 테너)를 두려워하지 않게 된다', pt: 'Pare de temer as claves de do (alto e tenor)', es: 'Deja de temer las claves de do (alto y tenor)' } as L5 },
    { num: '04', text: { ja: '初見演奏・初見視唱の基礎が盤石になる', en: 'Build a rock-solid foundation for sight reading and sight singing', ko: '초견 연주와 초견 시창의 기초가 탄탄해진다', pt: 'Construa uma base solida para leitura e canto a primeira vista', es: 'Construye una base solida para lectura y canto a primera vista' } as L5 },
    { num: '05', text: { ja: 'ドレミ（イタリア語）↔ ドイツ音名 ↔ 日本音名の変換が瞬時にできるようになる', en: 'Instantly convert between Italian solfège, German, and Japanese notation systems', ko: '이탈리아 솔페주 ↔ 독일 음명 ↔ 일본 음명 변환이 순식간에 가능해진다', pt: 'Converta instantaneamente entre solfejo italiano, alemao e japones', es: 'Convierte instantaneamente entre solfeo italiano, aleman y japones' } as L5 },
    { num: '06', text: { ja: '合奏・室内楽でスコアリーディングが速くなる', en: 'Faster score reading in ensemble and chamber music', ko: '합주와 실내악에서 스코어 리딩이 빨라진다', pt: 'Leitura de partitura mais rapida em conjunto e musica de camara', es: 'Lectura de partitura mas rapida en conjunto y musica de camara' } as L5 },
    { num: '07', text: { ja: '海外の音楽院・コンセルバトワールでも通用する記譜リテラシー', en: 'Notation literacy that works at international music conservatories', ko: '해외 음악원·콘세르바토리에서도 통용되는 기보 리터러시', pt: 'Alfabetizacao em notacao que funciona em conservatorios internacionais', es: 'Alfabetizacion en notacion que funciona en conservatorios internacionales' } as L5 },
  ];

  const targets = [
    { ja: '音大・音楽学部の入学試験を控えている受験生', en: 'Students preparing for music school entrance exams', ko: '음대·음악학부 입학시험을 앞둔 수험생', pt: 'Estudantes preparando para exames de ingresso em escolas de musica', es: 'Estudiantes preparandose para examenes de ingreso a escuelas de musica' } as L5,
    { ja: 'ソルフェージュの授業で楽譜の読みに苦戦している学生', en: 'Students struggling with music reading in solfege class', ko: '솔페주 수업에서 악보 읽기에 고전하는 학생', pt: 'Estudantes com dificuldade em leitura musical na aula de solfejo', es: 'Estudiantes con dificultad en lectura musical en clase de solfeo' } as L5,
    { ja: 'ヘ音記号・ハ音記号に苦手意識がある管弦楽器奏者', en: 'Orchestral players who struggle with bass and C clefs', ko: '낮은음자리표·가온음자리표에 약한 관현악 연주자', pt: 'Musicos de orquestra com dificuldade em claves de fa e do', es: 'Musicos de orquesta con dificultad en claves de fa y do' } as L5,
    { ja: '吹奏楽部でスコアリーディングを速くしたい指揮者・部長', en: 'Band conductors who want faster score reading', ko: '취주악부에서 스코어 리딩을 빠르게 하고 싶은 지휘자', pt: 'Regentes de banda que querem leitura de partitura mais rapida', es: 'Directores de banda que quieren lectura de partitura mas rapida' } as L5,
    { ja: 'ピアノ・弦楽器を独学で学んでいる大人の学習者', en: 'Adult learners studying piano or strings on their own', ko: '피아노·현악기를 독학하는 성인 학습자', pt: 'Adultos aprendendo piano ou cordas por conta propria', es: 'Adultos aprendiendo piano o cuerdas por su cuenta' } as L5,
    { ja: '音楽理論の基礎を固めたいすべての音楽家', en: 'All musicians who want to solidify music theory fundamentals', ko: '음악 이론의 기초를 다지고 싶은 모든 음악가', pt: 'Todos os musicos que querem solidificar fundamentos de teoria musical', es: 'Todos los musicos que quieren solidificar fundamentos de teoria musical' } as L5,
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: sans, color: '#1e293b' }}>
      {/* ─── HERO ─── */}
      <section style={{
        minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: 'clamp(80px, 15vw, 140px) clamp(16px, 4vw, 32px) clamp(40px, 8vw, 80px)',
      }}>
        <h1 style={{
          fontFamily: serif, fontSize: 'clamp(24px, 6vw, 44px)', fontWeight: 700,
          lineHeight: 1.35, whiteSpace: 'pre-line', marginBottom: 16,
        }}>
          {t(hero.title, lang)}
        </h1>
        <p style={{ fontSize: 'clamp(14px, 3vw, 18px)', color: '#64748b', maxWidth: 520 }}>
          {t(hero.sub, lang)}
        </p>
        <Link href="/sight-reading" style={{
          display: 'inline-block', marginTop: 32, padding: '14px 36px',
          background: ACCENT, color: '#fff', borderRadius: 12, fontSize: 'clamp(14px, 3vw, 17px)',
          fontWeight: 700, textDecoration: 'none', letterSpacing: '0.01em',
        }}>
          {t(hero.cta, lang)}
        </Link>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section ref={addReveal} style={{ ...revealStyle, padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 32px)', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(18px, 4.5vw, 28px)', textAlign: 'center', marginBottom: 32 }}>
          {t({ ja: 'こんな経験、ありませんか？', en: 'Sound familiar?', ko: '이런 경험, 있지 않나요?', pt: 'Isso soa familiar?', es: 'Te suena familiar?' }, lang)}
        </h2>
        <div style={{ display: 'grid', gap: 16 }}>
          {pains.map((p, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 14, padding: 'clamp(16px, 3vw, 24px)',
              borderLeft: `4px solid ${RED}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 'clamp(14px, 3.5vw, 17px)', marginBottom: 6 }}>
                {p.icon} {t(p.title, lang)}
              </div>
              <div style={{ fontSize: 'clamp(13px, 2.8vw, 15px)', color: '#475569', lineHeight: 1.7 }}>
                {t(p.desc, lang)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3 MODES ─── */}
      <section ref={addReveal} style={{ ...revealStyle, padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 32px)', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(18px, 4.5vw, 28px)', textAlign: 'center', marginBottom: 12 }}>
          {t({ ja: '4つのモードで、譜面が読めるようになる。', en: 'Four modes to master music reading.', ko: '4가지 모드로 악보를 읽을 수 있게 된다.', pt: 'Quatro modos para dominar a leitura musical.', es: 'Cuatro modos para dominar la lectura musical.' }, lang)}
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 'clamp(13px, 2.8vw, 15px)', marginBottom: 32 }}>
          {t({ ja: 'レベルが上がると、加線・臨時記号・ハ音記号が自動で追加される。', en: 'As your level increases, ledger lines, accidentals, and C clefs are added automatically.', ko: '레벨이 오르면 덧줄, 임시표, 가온음자리표가 자동으로 추가된다.', pt: 'Conforme seu nivel sobe, linhas suplementares, acidentes e claves de do sao adicionados automaticamente.', es: 'A medida que sube tu nivel, se agregan automaticamente lineas adicionales, alteraciones y claves de do.' }, lang)}
        </p>
        <div style={{ display: 'grid', gap: 16 }}>
          {modes.map((m, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 14, padding: 'clamp(20px, 4vw, 28px)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: `4px solid ${ACCENT}`,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 'clamp(15px, 3.5vw, 18px)', marginBottom: 8 }}>{t(m.title, lang)}</div>
              <div style={{ fontSize: 'clamp(13px, 2.8vw, 15px)', color: '#475569', lineHeight: 1.7 }}>{t(m.desc, lang)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── NOTATION SYSTEM ─── */}
      <section ref={addReveal} style={{ ...revealStyle, padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 32px)', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(18px, 4.5vw, 28px)', textAlign: 'center', marginBottom: 12 }}>
          {t({ ja: 'ドレミ・ドイツ音名・英語音名・日本音名。\n世界の4大記譜体系に完全対応。', en: 'Do-Re-Mi, German, English, and Japanese.\nFull support for the world\u2019s 4 major notation systems.', ko: '도레미·독일 음명·영어 음명·일본 음명.\n세계 4대 기보 체계 완벽 대응.', pt: 'Do-Re-Mi, alema, inglesa e japonesa.\nSuporte completo para os 4 principais sistemas de notacao do mundo.', es: 'Do-Re-Mi, alemana, inglesa y japonesa.\nSoporte completo para los 4 principales sistemas de notacion del mundo.' }, lang)}
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 'clamp(13px, 2.8vw, 15px)', marginBottom: 28, maxWidth: 600, margin: '0 auto 28px' }}>
          {t({ ja: 'ラテンアメリカ・イタリア・フランス・スペイン・ポルトガルで世界最多のシェアを誇るドレミ（固定ド）、クラシックの国際標準ドイツ音名、ジャズ・ポップスの英語音名、日本の楽典試験に必須の日本音名（イロハ）。UI言語（日/英/韓/葡/西）とは独立して4体系を自由に切り替え可能。音大生から海外留学生まで、世界のどの音楽教育にも適応します。', en: 'Italian Do-Re-Mi (fixed-do) is the world\u2019s most widely used notation — used across Latin America, Italy, France, Spain, and Portugal. We also support German (classical international standard), English (jazz/pop), and Japanese (for 楽典 exams). Switch between all 4 systems independently of the UI language (JP/EN/KO/PT/ES). Works for music students anywhere in the world.', ko: '라틴 아메리카·이탈리아·프랑스·스페인·포르투갈에서 세계 최다 점유율을 자랑하는 도레미(고정도), 클래식 국제 표준 독일 음명, 재즈·팝의 영어 음명, 일본 악전 시험 필수의 일본 음명(이로하). UI 언어(일/영/한/포/서)와 독립적으로 4체계를 자유롭게 전환. 세계 어디의 음악 교육에도 대응합니다.', pt: 'O Do-Re-Mi italiano (do-fixo) e a notacao mais utilizada do mundo — em toda a America Latina, Italia, Franca, Espanha e Portugal. Tambem oferecemos notacao alema (padrao classico internacional), inglesa (jazz/pop) e japonesa (para exames). Alterne entre os 4 sistemas independentemente do idioma da interface (JP/EN/KO/PT/ES).', es: 'El Do-Re-Mi italiano (do-fijo) es la notacion mas utilizada del mundo — en toda America Latina, Italia, Francia, Espana y Portugal. Tambien admitimos notacion alemana (estandar clasico internacional), inglesa (jazz/pop) y japonesa (para examenes). Cambia entre los 4 sistemas independientemente del idioma de la interfaz (JP/EN/KO/PT/ES). Funciona para estudiantes de musica en cualquier parte del mundo.' }, lang)}
        </p>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            { sys: 'Do Re Mi (Solfège)', example: 'Do  Do♯  Re  Mi♭  Mi  Fa  Fa♯  Sol  La♭  La  Si♭  Si', note: { ja: 'イタリア式固定ド。ラテンアメリカ（アルゼンチン・メキシコ・ブラジル・スペイン）、イタリア、フランス、ポルトガルで標準。日本の義務教育・ポピュラー音楽でも使用。世界で最も広く使われる記譜体系。', en: 'Italian fixed-do system. The standard in Latin America (Argentina, Mexico, Brazil, Spain), Italy, France, and Portugal. Also used in Japanese general music education and popular music. The world\u2019s most widely used notation.', ko: '이탈리아식 고정도. 라틴 아메리카(아르헨티나, 멕시코, 브라질, 스페인), 이탈리아, 프랑스, 포르투갈의 표준. 일본 의무 교육과 대중음악에서도 사용. 세계에서 가장 널리 사용되는 기보 체계.', pt: 'Sistema italiano do-fixo. O padrao na America Latina (Argentina, Mexico, Brasil, Espanha), Italia, Franca e Portugal. Tambem usado na educacao musical basica japonesa e na musica popular. A notacao mais amplamente usada no mundo.', es: 'Sistema italiano do-fijo. El estandar en America Latina (Argentina, Mexico, Brasil, Espana), Italia, Francia y Portugal. Tambien usado en la educacion musical general japonesa y en la musica popular. La notacion mas ampliamente utilizada en el mundo.' } as L5, color: '#f59e0b' },
            { sys: 'Deutsch', example: 'C  Cis  D  Es  E  F  Fis  G  As  A  B  H', note: { ja: 'H = B♮（シ）、B = B♭（シ♭）。クラシック音楽の国際標準。', en: 'H = B♮, B = B♭. The international standard in classical music.', ko: 'H = B♮, B = B♭. 클래식 음악의 국제 표준.', pt: 'H = B♮, B = B♭. O padrao internacional na musica classica.', es: 'H = B♮, B = B♭. El estandar internacional en musica clasica.' } as L5, color: ACCENT },
            { sys: 'English', example: 'C  C#  D  Eb  E  F  F#  G  Ab  A  Bb  B', note: { ja: 'SPN（Scientific Pitch Notation）。ジャズ・ポップスの標準。', en: 'Scientific Pitch Notation (SPN). The standard in jazz and pop.', ko: 'SPN (과학적 음높이 표기법). 재즈·팝의 표준.', pt: 'SPN (Notacao Cientifica de Altura). O padrao no jazz e pop.', es: 'SPN (Notacion Cientifica de Altura). El estandar en jazz y pop.' } as L5, color: GREEN },
            { sys: '日本音名 (Iroha)', example: 'ハ  嬰ハ  ニ  変ホ  ホ  ヘ  嬰ヘ  ト  変イ  イ  変ロ  ロ', note: { ja: 'イロハ式。楽典試験の必須知識。「嬰」= ♯、「変」= ♭。', en: 'Iroha system. Essential for 楽典 (gakuten) exams. 嬰 = ♯, 変 = ♭.', ko: '이로하식. 악전 시험 필수 지식. 嬰 = ♯, 変 = ♭.', pt: 'Sistema Iroha. Essencial para exames de teoria musical japonesa.', es: 'Sistema Iroha. Esencial para examenes de teoria musical japonesa.' } as L5, color: RED },
          ].map((item, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 14, padding: 'clamp(16px, 3vw, 22px)',
              borderLeft: `4px solid ${item.color}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 'clamp(14px, 3.5vw, 17px)', marginBottom: 6 }}>{item.sys}</div>
              <div style={{ fontFamily: '"SF Mono", "Fira Code", monospace', fontSize: 'clamp(12px, 2.5vw, 14px)', color: '#64748b', marginBottom: 8, letterSpacing: '0.02em', overflowX: 'auto' }}>{item.example}</div>
              <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', color: '#475569', lineHeight: 1.6 }}>{t(item.note, lang)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── EXAM PREP ─── */}
      <section ref={addReveal} style={{ ...revealStyle, padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 32px)', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(18px, 4.5vw, 28px)', textAlign: 'center', marginBottom: 12 }}>
          {t({ ja: '受験対策としての譜読みトレーニング', en: 'Sight reading training for exam prep', ko: '입시 대비 악보 읽기 훈련', pt: 'Treinamento de leitura para preparacao de exames', es: 'Entrenamiento de lectura para preparacion de examenes' }, lang)}
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 'clamp(13px, 2.8vw, 15px)', marginBottom: 32, maxWidth: 560, margin: '0 auto 32px' }}>
          {t({ ja: '音大受験の楽典試験・ソルフェージュ試験で問われる「譜面を正確に速く読む力」。SIGHT READING は、その力を最も効率的に鍛えるために設計されています。', en: 'Music school entrance exams test your ability to read music quickly and accurately. SIGHT READING is designed to build that skill as efficiently as possible.', ko: '음대 입시의 악전 시험과 솔페주 시험에서 묻는 "악보를 정확하고 빠르게 읽는 힘". SIGHT READING은 그 힘을 가장 효율적으로 기르기 위해 설계되었습니다.', pt: 'Exames de ingresso em escolas de musica testam sua capacidade de ler partituras rapida e precisamente. SIGHT READING foi projetado para construir essa habilidade da forma mais eficiente possivel.', es: 'Los examenes de ingreso a escuelas de musica prueban tu capacidad de leer partituras rapida y precisamente. SIGHT READING esta disenado para construir esa habilidad de la forma mas eficiente posible.' }, lang)}
        </p>
        <div style={{ display: 'grid', gap: 14 }}>
          {examBenefits.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{
                fontFamily: serif, fontSize: 24, fontWeight: 700, color: ACCENT, minWidth: 36, lineHeight: 1,
              }}>{b.num}</span>
              <span style={{ fontSize: 'clamp(14px, 3vw, 16px)', lineHeight: 1.6, paddingTop: 2 }}>
                {t(b.text, lang)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── LEVEL SYSTEM ─── */}
      <section ref={addReveal} style={{ ...revealStyle, padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 32px)', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(18px, 4.5vw, 28px)', textAlign: 'center', marginBottom: 12 }}>
          {t({ ja: 'レベルに応じて、自動で難しくなる。', en: 'Difficulty increases automatically with your level.', ko: '레벨에 따라 자동으로 어려워진다.', pt: 'A dificuldade aumenta automaticamente com seu nivel.', es: 'La dificultad aumenta automaticamente con tu nivel.' }, lang)}
        </h2>
        <div style={{
          background: '#fff', borderRadius: 14, padding: 'clamp(20px, 4vw, 28px)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginTop: 24,
        }}>
          {[
            { lv: 'Lv.1-2', text: { ja: 'ト音記号のみ、五線内の音符（加線なし）', en: 'Treble clef only, notes within the staff (no ledger lines)', ko: '높은음자리표만, 오선 안의 음표 (덧줄 없음)', pt: 'Apenas clave de sol, notas dentro da pauta', es: 'Solo clave de sol, notas dentro del pentagrama' } as L5 },
            { lv: 'Lv.3-4', text: { ja: '加線・臨時記号（#, b）が追加', en: 'Ledger lines and accidentals added', ko: '덧줄과 임시표(#, b) 추가', pt: 'Linhas suplementares e acidentes adicionados', es: 'Lineas adicionales y alteraciones agregadas' } as L5 },
            { lv: 'Lv.5-6', text: { ja: 'ヘ音記号が追加、調号に短調も出題', en: 'Bass clef added, minor keys in key signatures', ko: '낮은음자리표 추가, 조표에 단조도 출제', pt: 'Clave de fa adicionada, tons menores nas armaduras', es: 'Clave de fa agregada, tonos menores en las armaduras' } as L5 },
            { lv: 'Lv.7-8', text: { ja: '全範囲の加線、調号は#/b 5つ以上', en: 'Full ledger line range, 5+ sharps/flats', ko: '전 범위 덧줄, 조표는 #/b 5개 이상', pt: 'Faixa completa de linhas suplementares, 5+ acidentes', es: 'Rango completo de lineas adicionales, 5+ alteraciones' } as L5 },
            { lv: 'Lv.9+', text: { ja: 'アルト記号・テノール記号・全15調', en: 'Alto and tenor clefs, all 15 key signatures', ko: '알토·테너 음자리표, 전체 15개 조', pt: 'Claves de do (alto e tenor), todas as 15 armaduras', es: 'Claves de do (alto y tenor), las 15 armaduras' } as L5 },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0',
              borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none',
            }}>
              <span style={{ fontWeight: 700, color: ACCENT, minWidth: 54, fontSize: 14 }}>{item.lv}</span>
              <span style={{ fontSize: 'clamp(13px, 2.8vw, 15px)', color: '#475569' }}>{t(item.text, lang)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TARGETS ─── */}
      <section ref={addReveal} style={{ ...revealStyle, padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 32px)', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(18px, 4.5vw, 28px)', textAlign: 'center', marginBottom: 24 }}>
          {t({ ja: 'こんな人におすすめ', en: 'Who is this for?', ko: '이런 분께 추천', pt: 'Para quem e indicado?', es: 'Para quien es esto?' }, lang)}
        </h2>
        <div style={{
          background: '#fff', borderRadius: 14, padding: 'clamp(20px, 4vw, 28px)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          {targets.map((tg, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0',
              borderBottom: i < targets.length - 1 ? '1px solid #f1f5f9' : 'none',
            }}>
              <span style={{ color: GREEN, fontWeight: 700, fontSize: 16, marginTop: 1 }}>+</span>
              <span style={{ fontSize: 'clamp(13px, 2.8vw, 15px)', lineHeight: 1.6 }}>{t(tg, lang)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section ref={addReveal} style={{
        ...revealStyle,
        textAlign: 'center',
        padding: 'clamp(60px, 10vw, 100px) clamp(16px, 4vw, 32px)',
      }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(20px, 5vw, 32px)', marginBottom: 8 }}>
          {t({ ja: '楽譜は、読めるほど音楽が広がる。', en: 'The better you read, the wider your music.', ko: '악보를 읽을수록 음악이 넓어진다.', pt: 'Quanto melhor voce le, mais ampla sua musica.', es: 'Cuanto mejor lees, mas amplia tu musica.' }, lang)}
        </h2>
        <p style={{ color: '#64748b', fontSize: 'clamp(13px, 3vw, 16px)', marginBottom: 28 }}>
          {t({ ja: '今日の5分が、初見力の土台になる。', en: 'Five minutes today builds the foundation of your sight reading.', ko: '오늘의 5분이 초견 실력의 기초가 된다.', pt: 'Cinco minutos hoje constroem a base da sua leitura.', es: 'Cinco minutos hoy construyen la base de tu lectura.' }, lang)}
        </p>
        <Link href="/sight-reading" style={{
          display: 'inline-block', padding: '14px 36px', background: ACCENT, color: '#fff',
          borderRadius: 12, fontSize: 'clamp(14px, 3vw, 17px)', fontWeight: 700,
          textDecoration: 'none',
        }}>
          {t(hero.cta, lang)}
        </Link>
        <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          <Link href="/ear-training-lp" style={{ fontSize: 14, color: ACCENT, textDecoration: 'none' }}>EAR TRAINING</Link>
          <Link href="/interval-speed-lp" style={{ fontSize: 14, color: ACCENT, textDecoration: 'none' }}>INTERVAL SPEED</Link>
          <Link href="/metronome-lp" style={{ fontSize: 14, color: ACCENT, textDecoration: 'none' }}>METRONOME</Link>
          <Link href="/chord-quiz-lp" style={{ fontSize: 14, color: ACCENT, textDecoration: 'none' }}>CHORD QUIZ</Link>
        </div>
      </section>
    </div>
  );
}
