import Image from 'next/image';

export default function ProfilePage() {
  // 朝比奈さんのプロフィールテキスト（芸術と科学が融合したバージョン）
  const biography = `
音楽大学にて民族音楽を研究し、卒業後はピアニストとして活動。
北欧スウェーデンでの即興演奏研究、ドイツ・ケルンでのアルバム制作活動を経て、現地ドイツにて Stephan Desire 氏より音響学の基礎を学ぶ。

帰国後は「金田式DC録音」の第一人者・五島昭彦氏に師事。その後芸術工房 Pinocoa を結成し、アルゼンチンタンゴ、クラシック、古楽など世界の様々な作品制作をプロデュースする。

プロデューサーとしての活動を続けながら、株式会社ジオセンス・小林一英氏よりC言語およびGPS技術を学び、村上アーカイブス・村上浩治氏より映像技術を習得。
これにより、「音・映像・テクノロジー」を横断するクリエイターとして独自の制作スタイルを確立。

現在はヴィンテージ機材（Revox等）のレストアや、オリジナルマイク、アンプ、スピーカーの設計開発・製造も手掛けるなど、ハードウェアへの造詣も深める。
一方で、金田式DC録音の五島昭彦氏のもとで再び学び直し、金田明彦氏の発明した「金田式DC録音技術」の奥義を探求。2023年より、音の純度とヒーリング効果を科学するプロトコル「Curanz Sounds」を発信中。

2025年、究極の静寂と音響空間を求め芸術と科学の境界線を探求すると共に、空音開発（kuon-rnd）の代表として、GPS技術を応用した独自のアルゴリズム開発、および高度なWebアプリケーション開発を統合。
次世代のエンジニア育成や技術継承にも情熱を注ぎ、音響工学と最先端テクノロジー、そして芸術表現が高次元で融合する新たな地平を目指している。
  `;

  // --- スタイル定義（芸術家兼技術者らしい、ミニマルで洗練されたデザイン） ---
  const styles = {
    container: {
      padding: '80px 20px', // 余白を大きく取り、凛とした佇まいに
      fontFamily: 'serif', // 上質な明朝体
      lineHeight: '2.0', // 読みやすさと余白の美しさ
      color: '#1a1a1a', // 漆黒ではなく、少し柔らかな黒
      maxWidth: '900px',
      margin: '0 auto',
    },
    profileHeaderSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', // 中央揃え
      textAlign: 'center',
      marginBottom: '100px',
    },
    imageWrapper: {
      width: '200px', 
      height: '200px',
      borderRadius: '50%', // 円形に切り抜く
      overflow: 'hidden', // はみ出しをカット
      marginBottom: '50px',
      boxShadow: '0 15px 50px rgba(0,0,0,0.08)', // 洗練された、薄く柔らかい影
      border: '4px solid #fff', // 白いボーダーで、写真と背景を分離
      backgroundColor: '#fff', 
    },
    titles: {
      fontSize: '14px',
      color: '#aaa',
      letterSpacing: '0.4em', // 文字間隔を広く取り、上質に
      textTransform: 'uppercase', // 欧文は全大文字で、シャープに
      marginBottom: '15px',
      fontFamily: 'sans-serif',
    },
    nameJa: {
      fontSize: '40px',
      fontWeight: 'normal',
      marginTop: '10px',
      marginBottom: '10px',
      letterSpacing: '0.15em',
    },
    nameEn: {
      fontSize: '20px',
      color: '#666',
      fontFamily: 'sans-serif',
      letterSpacing: '0.1em',
    },
    biographySection: {
      textAlign: 'justify', // 両端揃え（上質な書籍のような雰囲気に）
      fontSize: '16.5px',
      maxWidth: '750px',
      margin: '0 auto',
    },
    paragraph: {
      marginBottom: '2.5em', // 段落間の余白を大きく
      textIndent: '1em', // 一字下げ
    },
    footer: {
      marginTop: '150px',
      paddingTop: '30px',
      borderTop: '1px solid #eee',
      textAlign: 'center',
      fontSize: '13px',
      color: '#bbb',
      fontFamily: 'sans-serif',
      letterSpacing: '0.05em',
    },
  } as const;

  return (
    <div style={styles.container}>
      {/* メインコンテンツ */}
      <div style={styles.profileHeaderSection}>
        {/* プロフィール写真エリア（芸術家兼技術者らしい、洗練されたデザイン） */}
        <div style={styles.imageWrapper}>
          <Image
            src="/kotaro.jpeg" 
            alt="朝比奈幸太郎"
            width={200}
            height={200}
            style={{
              objectFit: 'cover', // アスペクト比を保ちながら収める
              width: '100%',
              height: '100%',
            }}
            priority // ページ上部なので優先的に読み込む
          />
        </div>

        <header>
          <p style={styles.titles}>音楽家 / 録音アーティスト / 空音開発 代表</p>
          <h1 style={styles.nameJa}>朝比奈 幸太郎</h1>
          <p style={styles.nameEn}>Kohtaro Asahina</p>
        </header>
      </div>

      <section style={styles.biographySection}>
        {/* テキストを改行コードで分割し、Pタグで囲んで表示 */}
        {biography.trim().split('\n\n').map((paragraph, index) => (
          <p key={index} style={styles.paragraph}>
            {paragraph}
          </p>
        ))}
      </section>

      <footer style={styles.footer}>
        <p>&copy; 2025 Kuon Rnd / Kohtaro Asahina. All rights reserved.</p>
      </footer>
    </div>
  );
}