'use client';

import Link from 'next/link';
import React from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type TermsContent = {
  title: string;
  sections: Array<{
    heading: string;
    content: React.ReactNode;
  }>;
  lastUpdated: string;
};

const content: Partial<Record<Lang, TermsContent>> & { en: TermsContent } = {
  ja: {
    title: '利用規約',
    sections: [
      {
        heading: '1. 総則',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            本利用規約（以下「本規約」）は、空音開発（以下「当社」）が提供するサービス全般に適用されます。ユーザーが本サービスにアクセスまたは利用することで、本規約に同意したものとみなします。
          </p>
        ),
      },
      {
        heading: '2. サービスの説明',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              当社は以下のサービスを提供します:
            </p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>オーディオ処理ツール（NORMALIZE、DECLIPPER、MASTER CHECKなど）</li>
              <li>P-86S / X-86S マイク販売</li>
              <li>KUON PLAYER（24時間MP3共有サービス）</li>
              <li>Sound Map（GPS位置情報サービス）</li>
              <li>その他のウェブアプリケーション</li>
            </ul>
          </div>
        ),
      },
      {
        heading: '3. ユーザーアカウント',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>アカウント登録</strong><br />
              マジックリンク認証によるメールアドレス登録。パスワードは不要です。18才以上のユーザーのみ登録可能です。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>無料層とサブスクリプション</strong><br />
              現在、全機能は無料で利用可能です。将来、一部のサーバー処理機能（音源分離など）がサブスクリプション化される場合があります。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>アカウント情報の正確性</strong><br />
              ユーザーは登録情報を正確・最新に保つ責任があります。虚偽情報の登録は利用規約違反となります。
            </p>
          </div>
        ),
      },
      {
        heading: '4. 禁止事項',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>ユーザーは以下を禁止されています:</p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>違法な目的でのサービス利用</li>
              <li>著作権・知的財産権の侵害</li>
              <li>嫌がらせ、脅迫、誹謗中傷</li>
              <li>マルウェア・スパイウェアのアップロード</li>
              <li>サーバー処理機能の過度な利用（DoS攻撃など）</li>
              <li>他のユーザーのアカウント不正アクセス</li>
              <li>本サービスの利用条件に違反する行為</li>
            </ul>
          </div>
        ),
      },
      {
        heading: '5. 知的財産権',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>ユーザー著作権</strong><br />
              ユーザーがアップロード・投稿した録音、コメント、プロフィール情報に対する著作権はユーザーが保持します。ユーザーは、当社がこれらの内容をオーナーズ・ギャラリーに掲載する際、許可が必要な場合は明示的に同意するものとします。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>プラットフォーム著作権</strong><br />
              当社のロゴ、ウェブデザイン、ソフトウェアコード、アルゴリズムは当社が著作権を保有します。ユーザーによる無断複製・翻案は禁止です。
            </p>
          </div>
        ),
      },
      {
        heading: '6. KUON PLAYER 固有の利用規約',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>24時間自動削除</strong><br />
              KUON PLAYERにアップロードされたファイルは、最初の再生から24時間後に自動削除されます。削除後の復旧はできません。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>パスワード保護</strong><br />
              共有リンクはパスワード保護されています。パスワード漏洩による不正アクセスはユーザーの責任です。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>サービス可用性の保証なし</strong><br />
              当社はKUON PLAYERのサービス可用性を保証しません。予告なくメンテナンスが発生する場合があります。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>違法なコンテンツ禁止</strong><br />
              著作権違反、児童虐待材料、犯罪を助長するコンテンツのアップロードは違法です。発見した場合は削除し、必要に応じて当局に報告します。
            </p>
          </div>
        ),
      },
      {
        heading: '7. マイク販売の利用規約',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>ハンドメイド製品</strong><br />
              P-86S / X-86S は朝比奈幸太郎が一本一本ハンドメイドで製造します。完全な工業製品ではなく、個体差が存在することをご了承ください。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>配送</strong><br />
              決済確認後 1〜3営業日以内に発送します。受注生産品の場合は製作完了後に発送されます。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>返品・交換</strong><br />
              初期不良のみ到着から3日以内の返品・交換を受け付けます。お客様都合での返品は受け付けません。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>購入制限</strong><br />
              ハンドメイド製造のため、お一人様3点までの購入制限があります。
            </p>
          </div>
        ),
      },
      {
        heading: '8. 決済',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>支払い方法</strong><br />
              Stripe経由のクレジットカード、Apple Pay、Google Payでの決済。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>決済秘密情報</strong><br />
              当社はクレジットカード情報を保存しません。全ての決済処理はStripeが担当します。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>キャンセル</strong><br />
              ご注文後のキャンセルはお受けできません。重大な問題がある場合のみご相談ください。
            </p>
          </div>
        ),
      },
      {
        heading: '9. 責任制限',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>「現状のまま」提供</strong><br />
              当サービスは「現状のまま」提供されます。当社は明示的・黙示的な一切の保証を行いません。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>損害賠償の制限</strong><br />
              当社の過失による損害賠償は、ユーザーが過去12ヶ月間に当社に支払った金額を上限とします。無料利用の場合、当社は損害賠償責任を負いません。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>第三者のコンテンツ</strong><br />
              ユーザー投稿コンテンツについて、当社は責任を負いません。
            </p>
          </div>
        ),
      },
      {
        heading: '10. 準拠法と管轄',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            本規約は日本法に準拠します。紛争は帯広簡易裁判所（帯広地方裁判所）を第一審管轄裁判所とします。
          </p>
        ),
      },
      {
        heading: '11. 規約変更',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            当社は本規約を予告なく変更する権利を有します。変更は本ページへの掲載時点で有効となります。ユーザーが変更後もサービスを利用した場合、新しい規約に同意したものとみなします。
          </p>
        ),
      },
      {
        heading: '12. お問い合わせ',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            本規約についてのご質問は以下までお問い合わせください:<br />
            メール: <a href="mailto:369@kotaroasahina.com" style={{ color: '#0066cc' }}>369@kotaroasahina.com</a><br />
            住所: 北海道帯広市自由が丘5丁目16番地35
          </p>
        ),
      },
    ],
    lastUpdated: '2026年4月',
  },
  en: {
    title: 'Terms of Service',
    sections: [
      {
        heading: '1. Introduction',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            These Terms of Service ("Terms") govern your use of services provided by Kuon R&D ("we," "us," "our," or "Company"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.
          </p>
        ),
      },
      {
        heading: '2. Service Description',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              The Company provides:
            </p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Audio Processing Tools (NORMALIZE, DECLIPPER, MASTER CHECK, etc.)</li>
              <li>P-86S / X-86S Microphone Sales</li>
              <li>KUON PLAYER (24-hour MP3 sharing service)</li>
              <li>Sound Map (GPS location service)</li>
              <li>Other web applications</li>
            </ul>
          </div>
        ),
      },
      {
        heading: '3. User Accounts',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Registration</strong><br />
              Magic link email authentication. No password required. Only users 18+ may register.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Free Tier & Subscription</strong><br />
              Currently, all features are free. In the future, server-intensive features (e.g., audio separation) may require subscription.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Account Accuracy</strong><br />
              You are responsible for keeping account information accurate and current. False registration is a violation of these Terms.
            </p>
          </div>
        ),
      },
      {
        heading: '4. Prohibited Conduct',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>You may not:</p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Use the Service for illegal purposes</li>
              <li>Infringe copyright or intellectual property</li>
              <li>Harass, threaten, or defame others</li>
              <li>Upload malware or spyware</li>
              <li>Abuse server resources (DoS attacks, etc.)</li>
              <li>Gain unauthorized access to user accounts</li>
              <li>Violate the Service terms of use</li>
            </ul>
          </div>
        ),
      },
      {
        heading: '5. Intellectual Property',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Your Content</strong><br />
              You retain ownership of recordings, comments, and profile information you upload. By posting, you grant the Company permission to display your content in the Owners Gallery if applicable.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Company Content</strong><br />
              Company logos, website design, software code, and algorithms are owned by the Company. Unauthorized copying or adaptation is prohibited.
            </p>
          </div>
        ),
      },
      {
        heading: '6. KUON PLAYER Terms',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>24-Hour Auto-Deletion</strong><br />
              Files uploaded to KUON PLAYER are automatically deleted 24 hours after first playback. Deleted files cannot be recovered.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Password Protection</strong><br />
              Sharing links are password-protected. You are responsible for password security. Unauthorized access due to password leakage is your responsibility.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>No Service Guarantee</strong><br />
              The Company does not guarantee KUON PLAYER availability. Maintenance may occur without notice.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Prohibited Content</strong><br />
              Uploading copyrighted material, child abuse material, or content promoting crime is illegal. We will delete such content and report to authorities as needed.
            </p>
          </div>
        ),
      },
      {
        heading: '7. Microphone Sales Terms',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Handmade Products</strong><br />
              P-86S / X-86S are handmade by Kotaro Asahina. Individual variations are expected and accepted.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Shipping</strong><br />
              Orders ship 1–3 business days after payment confirmation. Custom orders ship after production completion.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Returns & Exchanges</strong><br />
              Defects only: returns/exchanges within 3 days of receipt. Customer-initiated returns are not accepted.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Purchase Limit</strong><br />
              Maximum 3 items per customer due to handmade production constraints.
            </p>
          </div>
        ),
      },
      {
        heading: '8. Payment',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Payment Methods</strong><br />
              Credit card, Apple Pay, Google Pay via Stripe.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Card Information</strong><br />
              The Company does not store credit card information. All payment processing is handled by Stripe.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cancellation</strong><br />
              Orders cannot be cancelled after placement. Contact us for exceptional cases only.
            </p>
          </div>
        ),
      },
      {
        heading: '9. Limitation of Liability',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>"As-Is" Provision</strong><br />
              The Service is provided "as is" with no warranties, express or implied.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Damages Cap</strong><br />
              Company liability is capped at the total amount you paid the Company in the prior 12 months. For free users, the Company has no liability.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Third-Party Content</strong><br />
              The Company is not responsible for user-generated content.
            </p>
          </div>
        ),
      },
      {
        heading: '10. Governing Law and Jurisdiction',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            These Terms are governed by Japanese law. Disputes are subject to the jurisdiction of the Obihiro District Court (first instance).
          </p>
        ),
      },
      {
        heading: '11. Modification of Terms',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            The Company reserves the right to modify these Terms at any time without notice. Changes become effective upon posting to this page. Continued use of the Service constitutes acceptance of modified Terms.
          </p>
        ),
      },
      {
        heading: '12. Contact',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            For questions about these Terms:<br />
            Email: <a href="mailto:369@kotaroasahina.com" style={{ color: '#0066cc' }}>369@kotaroasahina.com</a><br />
            Address: 5-16-35 Jiyugaoka, Obihiro, Hokkaido 080-2476, Japan
          </p>
        ),
      },
    ],
    lastUpdated: 'April 2026',
  },
  ko: {
    title: 'Terms of Service',
    sections: [
      {
        heading: '1. Introduction',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            These Terms of Service ("Terms") govern your use of services provided by Kuon R&D ("we," "us," "our," or "Company"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.
          </p>
        ),
      },
      {
        heading: '2. Service Description',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              The Company provides:
            </p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Audio Processing Tools (NORMALIZE, DECLIPPER, MASTER CHECK, etc.)</li>
              <li>P-86S / X-86S Microphone Sales</li>
              <li>KUON PLAYER (24-hour MP3 sharing service)</li>
              <li>Sound Map (GPS location service)</li>
              <li>Other web applications</li>
            </ul>
          </div>
        ),
      },
      {
        heading: '3. User Accounts',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Registration</strong><br />
              Magic link email authentication. No password required. Only users 18+ may register.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Free Tier & Subscription</strong><br />
              Currently, all features are free. In the future, server-intensive features (e.g., audio separation) may require subscription.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Account Accuracy</strong><br />
              You are responsible for keeping account information accurate and current. False registration is a violation of these Terms.
            </p>
          </div>
        ),
      },
      {
        heading: '4. Prohibited Conduct',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>You may not:</p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Use the Service for illegal purposes</li>
              <li>Infringe copyright or intellectual property</li>
              <li>Harass, threaten, or defame others</li>
              <li>Upload malware or spyware</li>
              <li>Abuse server resources (DoS attacks, etc.)</li>
              <li>Gain unauthorized access to user accounts</li>
              <li>Violate the Service terms of use</li>
            </ul>
          </div>
        ),
      },
      {
        heading: '5. Intellectual Property',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Your Content</strong><br />
              You retain ownership of recordings, comments, and profile information you upload. By posting, you grant the Company permission to display your content in the Owners Gallery if applicable.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Company Content</strong><br />
              Company logos, website design, software code, and algorithms are owned by the Company. Unauthorized copying or adaptation is prohibited.
            </p>
          </div>
        ),
      },
      {
        heading: '6. KUON PLAYER Terms',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>24-Hour Auto-Deletion</strong><br />
              Files uploaded to KUON PLAYER are automatically deleted 24 hours after first playback. Deleted files cannot be recovered.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Password Protection</strong><br />
              Sharing links are password-protected. You are responsible for password security. Unauthorized access due to password leakage is your responsibility.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>No Service Guarantee</strong><br />
              The Company does not guarantee KUON PLAYER availability. Maintenance may occur without notice.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Prohibited Content</strong><br />
              Uploading copyrighted material, child abuse material, or content promoting crime is illegal. We will delete such content and report to authorities as needed.
            </p>
          </div>
        ),
      },
      {
        heading: '7. Microphone Sales Terms',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Handmade Products</strong><br />
              P-86S / X-86S are handmade by Kotaro Asahina. Individual variations are expected and accepted.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Shipping</strong><br />
              Orders ship 1–3 business days after payment confirmation. Custom orders ship after production completion.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Returns & Exchanges</strong><br />
              Defects only: returns/exchanges within 3 days of receipt. Customer-initiated returns are not accepted.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Purchase Limit</strong><br />
              Maximum 3 items per customer due to handmade production constraints.
            </p>
          </div>
        ),
      },
      {
        heading: '8. Payment',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Payment Methods</strong><br />
              Credit card, Apple Pay, Google Pay via Stripe.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Card Information</strong><br />
              The Company does not store credit card information. All payment processing is handled by Stripe.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cancellation</strong><br />
              Orders cannot be cancelled after placement. Contact us for exceptional cases only.
            </p>
          </div>
        ),
      },
      {
        heading: '9. Limitation of Liability',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>"As-Is" Provision</strong><br />
              The Service is provided "as is" with no warranties, express or implied.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Damages Cap</strong><br />
              Company liability is capped at the total amount you paid the Company in the prior 12 months. For free users, the Company has no liability.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Third-Party Content</strong><br />
              The Company is not responsible for user-generated content.
            </p>
          </div>
        ),
      },
      {
        heading: '10. Governing Law and Jurisdiction',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            These Terms are governed by Japanese law. Disputes are subject to the jurisdiction of the Obihiro District Court (first instance).
          </p>
        ),
      },
      {
        heading: '11. Modification of Terms',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            The Company reserves the right to modify these Terms at any time without notice. Changes become effective upon posting to this page. Continued use of the Service constitutes acceptance of modified Terms.
          </p>
        ),
      },
      {
        heading: '12. Contact',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            For questions about these Terms:<br />
            Email: <a href="mailto:369@kotaroasahina.com" style={{ color: '#0066cc' }}>369@kotaroasahina.com</a><br />
            Address: 5-16-35 Jiyugaoka, Obihiro, Hokkaido 080-2476, Japan
          </p>
        ),
      },
    ],
    lastUpdated: 'April 2026',
  },
  pt: {
    title: 'Terms of Service',
    sections: [
      {
        heading: '1. Introduction',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            These Terms of Service ("Terms") govern your use of services provided by Kuon R&D ("we," "us," "our," or "Company"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.
          </p>
        ),
      },
      {
        heading: '2. Service Description',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              The Company provides:
            </p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Audio Processing Tools (NORMALIZE, DECLIPPER, MASTER CHECK, etc.)</li>
              <li>P-86S / X-86S Microphone Sales</li>
              <li>KUON PLAYER (24-hour MP3 sharing service)</li>
              <li>Sound Map (GPS location service)</li>
              <li>Other web applications</li>
            </ul>
          </div>
        ),
      },
      {
        heading: '3. User Accounts',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Registration</strong><br />
              Magic link email authentication. No password required. Only users 18+ may register.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Free Tier & Subscription</strong><br />
              Currently, all features are free. In the future, server-intensive features (e.g., audio separation) may require subscription.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Account Accuracy</strong><br />
              You are responsible for keeping account information accurate and current. False registration is a violation of these Terms.
            </p>
          </div>
        ),
      },
      {
        heading: '4. Prohibited Conduct',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>You may not:</p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Use the Service for illegal purposes</li>
              <li>Infringe copyright or intellectual property</li>
              <li>Harass, threaten, or defame others</li>
              <li>Upload malware or spyware</li>
              <li>Abuse server resources (DoS attacks, etc.)</li>
              <li>Gain unauthorized access to user accounts</li>
              <li>Violate the Service terms of use</li>
            </ul>
          </div>
        ),
      },
      {
        heading: '5. Intellectual Property',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Your Content</strong><br />
              You retain ownership of recordings, comments, and profile information you upload. By posting, you grant the Company permission to display your content in the Owners Gallery if applicable.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Company Content</strong><br />
              Company logos, website design, software code, and algorithms are owned by the Company. Unauthorized copying or adaptation is prohibited.
            </p>
          </div>
        ),
      },
      {
        heading: '6. KUON PLAYER Terms',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>24-Hour Auto-Deletion</strong><br />
              Files uploaded to KUON PLAYER are automatically deleted 24 hours after first playback. Deleted files cannot be recovered.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Password Protection</strong><br />
              Sharing links are password-protected. You are responsible for password security. Unauthorized access due to password leakage is your responsibility.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>No Service Guarantee</strong><br />
              The Company does not guarantee KUON PLAYER availability. Maintenance may occur without notice.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Prohibited Content</strong><br />
              Uploading copyrighted material, child abuse material, or content promoting crime is illegal. We will delete such content and report to authorities as needed.
            </p>
          </div>
        ),
      },
      {
        heading: '7. Microphone Sales Terms',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Handmade Products</strong><br />
              P-86S / X-86S are handmade by Kotaro Asahina. Individual variations are expected and accepted.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Shipping</strong><br />
              Orders ship 1–3 business days after payment confirmation. Custom orders ship after production completion.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Returns & Exchanges</strong><br />
              Defects only: returns/exchanges within 3 days of receipt. Customer-initiated returns are not accepted.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Purchase Limit</strong><br />
              Maximum 3 items per customer due to handmade production constraints.
            </p>
          </div>
        ),
      },
      {
        heading: '8. Payment',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Payment Methods</strong><br />
              Credit card, Apple Pay, Google Pay via Stripe.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Card Information</strong><br />
              The Company does not store credit card information. All payment processing is handled by Stripe.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cancellation</strong><br />
              Orders cannot be cancelled after placement. Contact us for exceptional cases only.
            </p>
          </div>
        ),
      },
      {
        heading: '9. Limitation of Liability',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>"As-Is" Provision</strong><br />
              The Service is provided "as is" with no warranties, express or implied.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Damages Cap</strong><br />
              Company liability is capped at the total amount you paid the Company in the prior 12 months. For free users, the Company has no liability.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Third-Party Content</strong><br />
              The Company is not responsible for user-generated content.
            </p>
          </div>
        ),
      },
      {
        heading: '10. Governing Law and Jurisdiction',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            These Terms are governed by Japanese law. Disputes are subject to the jurisdiction of the Obihiro District Court (first instance).
          </p>
        ),
      },
      {
        heading: '11. Modification of Terms',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            The Company reserves the right to modify these Terms at any time without notice. Changes become effective upon posting to this page. Continued use of the Service constitutes acceptance of modified Terms.
          </p>
        ),
      },
      {
        heading: '12. Contact',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            For questions about these Terms:<br />
            Email: <a href="mailto:369@kotaroasahina.com" style={{ color: '#0066cc' }}>369@kotaroasahina.com</a><br />
            Address: 5-16-35 Jiyugaoka, Obihiro, Hokkaido 080-2476, Japan
          </p>
        ),
      },
    ],
    lastUpdated: 'April 2026',
  },
  es: {
    title: 'Terms of Service',
    sections: [
      {
        heading: '1. Introduction',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            These Terms of Service ("Terms") govern your use of services provided by Kuon R&D ("we," "us," "our," or "Company"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.
          </p>
        ),
      },
      {
        heading: '2. Service Description',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              The Company provides:
            </p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Audio Processing Tools (NORMALIZE, DECLIPPER, MASTER CHECK, etc.)</li>
              <li>P-86S / X-86S Microphone Sales</li>
              <li>KUON PLAYER (24-hour MP3 sharing service)</li>
              <li>Sound Map (GPS location service)</li>
              <li>Other web applications</li>
            </ul>
          </div>
        ),
      },
      {
        heading: '3. User Accounts',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Registration</strong><br />
              Magic link email authentication. No password required. Only users 18+ may register.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Free Tier & Subscription</strong><br />
              Currently, all features are free. In the future, server-intensive features (e.g., audio separation) may require subscription.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Account Accuracy</strong><br />
              You are responsible for keeping account information accurate and current. False registration is a violation of these Terms.
            </p>
          </div>
        ),
      },
      {
        heading: '4. Prohibited Conduct',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>You may not:</p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Use the Service for illegal purposes</li>
              <li>Infringe copyright or intellectual property</li>
              <li>Harass, threaten, or defame others</li>
              <li>Upload malware or spyware</li>
              <li>Abuse server resources (DoS attacks, etc.)</li>
              <li>Gain unauthorized access to user accounts</li>
              <li>Violate the Service terms of use</li>
            </ul>
          </div>
        ),
      },
      {
        heading: '5. Intellectual Property',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Your Content</strong><br />
              You retain ownership of recordings, comments, and profile information you upload. By posting, you grant the Company permission to display your content in the Owners Gallery if applicable.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Company Content</strong><br />
              Company logos, website design, software code, and algorithms are owned by the Company. Unauthorized copying or adaptation is prohibited.
            </p>
          </div>
        ),
      },
      {
        heading: '6. KUON PLAYER Terms',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>24-Hour Auto-Deletion</strong><br />
              Files uploaded to KUON PLAYER are automatically deleted 24 hours after first playback. Deleted files cannot be recovered.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Password Protection</strong><br />
              Sharing links are password-protected. You are responsible for password security. Unauthorized access due to password leakage is your responsibility.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>No Service Guarantee</strong><br />
              The Company does not guarantee KUON PLAYER availability. Maintenance may occur without notice.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Prohibited Content</strong><br />
              Uploading copyrighted material, child abuse material, or content promoting crime is illegal. We will delete such content and report to authorities as needed.
            </p>
          </div>
        ),
      },
      {
        heading: '7. Microphone Sales Terms',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Handmade Products</strong><br />
              P-86S / X-86S are handmade by Kotaro Asahina. Individual variations are expected and accepted.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Shipping</strong><br />
              Orders ship 1–3 business days after payment confirmation. Custom orders ship after production completion.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Returns & Exchanges</strong><br />
              Defects only: returns/exchanges within 3 days of receipt. Customer-initiated returns are not accepted.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Purchase Limit</strong><br />
              Maximum 3 items per customer due to handmade production constraints.
            </p>
          </div>
        ),
      },
      {
        heading: '8. Payment',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Payment Methods</strong><br />
              Credit card, Apple Pay, Google Pay via Stripe.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Card Information</strong><br />
              The Company does not store credit card information. All payment processing is handled by Stripe.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cancellation</strong><br />
              Orders cannot be cancelled after placement. Contact us for exceptional cases only.
            </p>
          </div>
        ),
      },
      {
        heading: '9. Limitation of Liability',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>"As-Is" Provision</strong><br />
              The Service is provided "as is" with no warranties, express or implied.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Damages Cap</strong><br />
              Company liability is capped at the total amount you paid the Company in the prior 12 months. For free users, the Company has no liability.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Third-Party Content</strong><br />
              The Company is not responsible for user-generated content.
            </p>
          </div>
        ),
      },
      {
        heading: '10. Governing Law and Jurisdiction',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            These Terms are governed by Japanese law. Disputes are subject to the jurisdiction of the Obihiro District Court (first instance).
          </p>
        ),
      },
      {
        heading: '11. Modification of Terms',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            The Company reserves the right to modify these Terms at any time without notice. Changes become effective upon posting to this page. Continued use of the Service constitutes acceptance of modified Terms.
          </p>
        ),
      },
      {
        heading: '12. Contact',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            For questions about these Terms:<br />
            Email: <a href="mailto:369@kotaroasahina.com" style={{ color: '#0066cc' }}>369@kotaroasahina.com</a><br />
            Address: 5-16-35 Jiyugaoka, Obihiro, Hokkaido 080-2476, Japan
          </p>
        ),
      },
    ],
    lastUpdated: 'April 2026',
  },
};

export default function TermsPage() {
  const { lang } = useLang();
  const currentContent = content[lang] || content.en;

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        color: '#333',
        fontFamily:
          '"Helvetica Neue", Arial, sans-serif',
        padding: 'clamp(1.5rem, 5vw, 3rem)',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 2.5rem)',
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: '0.5rem',
              fontFamily:
                '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif',
            }}
          >
            {currentContent.title}
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#666' }}>
            {lang === 'ja' ? 'Last Updated: ' : 'Last Updated: '}{currentContent.lastUpdated}
          </p>
        </div>

        {/* Sections */}
        <div style={{ marginBottom: '2rem' }}>
          {currentContent.sections.map((section, index) => (
            <section key={index} style={{ marginBottom: '2rem' }}>
              <h2
                style={{
                  fontSize: 'clamp(1.3rem, 4vw, 1.5rem)',
                  fontWeight: 600,
                  marginBottom: '0.8rem',
                  fontFamily:
                    '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif',
                  color: '#222',
                }}
              >
                {section.heading}
              </h2>
              <div style={{ lineHeight: 1.8, color: '#444' }}>
                {section.content}
              </div>
            </section>
          ))}
        </div>

        {/* Back Link */}
        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #ddd' }}>
          <Link href="/" style={{ color: '#0066cc', textDecoration: 'none' }}>
            ← {lang === 'ja' ? 'トップへ戻る' : 'Back to Top'}
          </Link>
        </div>
      </div>
    </main>
  );
}
