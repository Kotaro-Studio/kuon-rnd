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
    title: '이용약관',
    sections: [
      {
        heading: '1. 총칙',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            본 이용약관 (이하 "약관")은 공음 R&D (이하 "당사" 또는 "회사")가 제공하는 서비스 이용에 적용됩니다. 본 서비스에 접근하거나 이용함으로써 본 약관에 동의한 것으로 간주됩니다. 동의하지 않으시면 본 서비스를 이용하지 마세요.
          </p>
        ),
      },
      {
        heading: '2. 서비스 설명',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              당사는 다음 서비스를 제공합니다:
            </p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>오디오 처리 도구 (NORMALIZE, DECLIPPER, MASTER CHECK 등)</li>
              <li>P-86S / X-86S 마이크 판매</li>
              <li>KUON PLAYER (24시간 MP3 공유 서비스)</li>
              <li>Sound Map (GPS 위치 서비스)</li>
              <li>기타 웹 애플리케이션</li>
            </ul>
          </div>
        ),
      },
      {
        heading: '3. 사용자 계정',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>등록</strong><br />
              매직링크 이메일 인증. 비밀번호 불필요. 18세 이상 사용자만 등록 가능합니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>무료 서비스 및 구독</strong><br />
              현재 모든 기능이 무료입니다. 향후 서버 처리 기능 (예: 오디오 분리)의 경우 구독이 필요할 수 있습니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>계정 정보 정확성</strong><br />
              계정 정보를 정확하고 최신으로 유지할 책임은 사용자에게 있습니다. 허위 등록은 본 약관 위반입니다.
            </p>
          </div>
        ),
      },
      {
        heading: '4. 금지사항',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>사용자는 다음을 금지됩니다:</p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>불법적 목적으로 서비스 이용</li>
              <li>저작권 또는 지적재산권 침해</li>
              <li>타인에 대한 괴롭힘, 협박, 명예훼손</li>
              <li>악성 소프트웨어 또는 스파이웨어 업로드</li>
              <li>서버 리소스 악용 (DDoS 공격 등)</li>
              <li>사용자 계정에 대한 무단 접근</li>
              <li>서비스 이용약관 위반 행위</li>
            </ul>
          </div>
        ),
      },
      {
        heading: '5. 지적재산권',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>사용자 컨텐츠</strong><br />
              업로드한 녹음, 댓글, 프로필 정보에 대한 소유권은 사용자에게 있습니다. 게시함으로써 당사가 해당 컨텐츠를 오너스 갤러리에 표시할 권한을 부여합니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>회사 컨텐츠</strong><br />
              회사 로고, 웹사이트 디자인, 소프트웨어 코드 및 알고리즘은 당사가 소유합니다. 무단 복제 또는 개작은 금지됩니다.
            </p>
          </div>
        ),
      },
      {
        heading: '6. KUON PLAYER 이용약관',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>24시간 자동 삭제</strong><br />
              KUON PLAYER에 업로드된 파일은 처음 재생으로부터 24시간 후 자동으로 삭제됩니다. 삭제된 파일은 복구할 수 없습니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>비밀번호 보호</strong><br />
              공유 링크는 비밀번호로 보호됩니다. 비밀번호 보안은 사용자의 책임입니다. 비밀번호 유출로 인한 무단 접근은 사용자의 책임입니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>서비스 보장 없음</strong><br />
              당사는 KUON PLAYER의 가용성을 보장하지 않습니다. 유지보수가 예고 없이 발생할 수 있습니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>금지 컨텐츠</strong><br />
              저작권 침해, 아동 학대 자료, 범죄를 조장하는 컨텐츠 업로드는 불법입니다. 이러한 컨텐츠를 발견하면 삭제하고 필요시 당국에 신고합니다.
            </p>
          </div>
        ),
      },
      {
        heading: '7. 마이크 판매 이용약관',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>수제 제품</strong><br />
              P-86S / X-86S는 고토로 아사히나가 수제로 제조합니다. 개별 변동은 예상되며 인정됩니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>배송</strong><br />
              주문은 결제 확인 후 1-3 영업일 이내에 발송됩니다. 주문 제작 상품은 제조 완료 후 발송됩니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>반품 및 교환</strong><br />
              결함만 해당: 수령 후 3일 이내에 반품/교환 가능. 고객 과실로 인한 반품은 받지 않습니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>구매 제한</strong><br />
              수제 생산 제약으로 인해 고객당 최대 3개까지 구매할 수 있습니다.
            </p>
          </div>
        ),
      },
      {
        heading: '8. 결제',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>결제 수단</strong><br />
              Stripe을 통한 신용카드, Apple Pay, Google Pay.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>카드 정보</strong><br />
              당사는 신용카드 정보를 저장하지 않습니다. 모든 결제 처리는 Stripe이 담당합니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>취소</strong><br />
              주문 후에는 취소할 수 없습니다. 특별한 경우만 문의하세요.
            </p>
          </div>
        ),
      },
      {
        heading: '9. 책임 제한',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>"현상유지" 제공</strong><br />
              본 서비스는 "현상유지"로 제공되며 명시적 또는 암시적 보장이 없습니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>손해배상 제한</strong><br />
              당사의 책임은 지난 12개월 동안 당사에 지불한 총액으로 제한됩니다. 무료 사용자의 경우 당사는 책임이 없습니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>제3자 컨텐츠</strong><br />
              당사는 사용자 생성 컨텐츠에 대한 책임을 지지 않습니다.
            </p>
          </div>
        ),
      },
      {
        heading: '10. 준거법 및 관할권',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            본 약관은 일본법을 따릅니다. 분쟁은 오비히로 지방법원 (1심)의 관할을 받습니다.
          </p>
        ),
      },
      {
        heading: '11. 약관 변경',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            당사는 언제든 예고 없이 본 약관을 수정할 권리를 보유합니다. 변경은 본 페이지에 게시될 때 효력이 발생합니다. 변경 후에도 서비스를 계속 이용하면 수정된 약관에 동의한 것으로 간주됩니다.
          </p>
        ),
      },
      {
        heading: '12. 문의',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            본 약관에 대한 질문은 다음으로 문의하세요:<br />
            이메일: <a href="mailto:369@kotaroasahina.com" style={{ color: '#0066cc' }}>369@kotaroasahina.com</a><br />
            주소: 북해도 오비히로시 지유가오카 5초메 16반지 35, 일본 080-2476
          </p>
        ),
      },
    ],
    lastUpdated: '2026년 4월',
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
