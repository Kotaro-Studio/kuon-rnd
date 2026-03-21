import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      
      {/* 1. Hero セクション */}
      <section className={styles.hero}>
        <h1 className={styles.catchcopy}>芸術と科学の<br />境界線を越える</h1>
        <p className={styles.subcopy}>
          音響工学・Webテクノロジー・GPSアルゴリズムを<br />
          高次元で融合させる研究開発スタジオ
        </p>
      </section>

      {/* 2. 空音開発の3本柱（Engineering） */}
      <section className={styles.pillars}>
        <h2 className={styles.sectionTitle}>CORE TECHNOLOGIES</h2>
        <div className={styles.pillarGrid}>
          
          <div className={styles.pillarCard}>
            <h3 className={styles.pillarTitle}>Acoustic Engineering</h3>
            <p className={styles.pillarText}>
              オリジナルマイク・アンプ・スピーカーの設計開発。金田式DC録音技術の探求と、Revox等ヴィンテージ機材の高度なレストアを行います。
            </p>
          </div>

          <div className={styles.pillarCard}>
            <h3 className={styles.pillarTitle}>Web Application</h3>
            <p className={styles.pillarText}>
              モダンなWeb技術を用いた、高速かつ美しく堅牢な独自アプリケーションの設計・構築を行います。
            </p>
          </div>

          <div className={styles.pillarCard}>
            <h3 className={styles.pillarTitle}>GPS & Algorithm</h3>
            <p className={styles.pillarText}>
              C言語と最新のGPS技術を応用した独自のアルゴリズム設計。ハードウェアとソフトウェアを繋ぐコアシステムを開発します。
            </p>
          </div>

        </div>
      </section>

      {/* 3. PROJECTSセクション（完璧に計算された余白とタイポグラフィ） */}
      <section className={styles.projects}>
        <h2 className={styles.sectionTitle}>PROJECTS</h2>
        <div className={styles.projectsGrid}>
          
          <Link href="https://curanzsounds.com" className={styles.projectCard} target="_blank" rel="noopener noreferrer">
            <div>
              <h3 className={styles.projectName}>Curanz Sounds</h3>
              <p className={styles.projectDesc}>音の純度とヒーリング効果を科学するオーディオセラピー</p>
            </div>
            <div className={styles.cardFooter}>
              <span className={styles.arrow}>→</span>
            </div>
          </Link>

          <Link href="https://kotarohattori.com" className={styles.projectCard} target="_blank" rel="noopener noreferrer">
            <div>
              <h3 className={styles.projectName}>Kotaro Studio</h3>
              <p className={styles.projectDesc}>音楽活動およびヴィンテージ音響機材の販売</p>
            </div>
            <div className={styles.cardFooter}>
              <span className={styles.arrow}>→</span>
            </div>
          </Link>

          <Link href="https://academy.kotarohattori.com" className={styles.projectCard} target="_blank" rel="noopener noreferrer">
            <div>
              <h3 className={styles.projectName}>Time Machine<br />Records</h3>
              <p className={styles.projectDesc}>金田式DC録音専門レーベル</p>
            </div>
            <div className={styles.cardFooter}>
              <span className={styles.arrow}>→</span>
            </div>
          </Link>

        </div>
      </section>

      {/* 4. 代表プロフィールへの誘導 */}
      <section className={styles.about}>
        <div className={styles.aboutImageWrapper}>
          <Image
            src="/kotaro.jpeg"
            alt="朝比奈幸太郎"
            width={120}
            height={120}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>
        <h3 className={styles.aboutNameJa}>朝比奈 幸太郎</h3>
        <p className={styles.aboutTitle}>音楽家 / 録音アーティスト / 空音開発 代表</p>
        
        <Link href="/profile" className={styles.aboutLink}>
          詳細なプロフィールを見る
        </Link>
      </section>

      {/* フッター */}
      <footer className={styles.footer}>
        <p>&copy; 2025 Kuon Rnd. All rights reserved.</p>
      </footer>

    </div>
  );
}


