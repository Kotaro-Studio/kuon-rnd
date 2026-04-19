'use client';

import Link from 'next/link';
import React from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type PrivacyContent = {
  title: string;
  sections: Array<{
    heading: string;
    content: React.ReactNode;
  }>;
  lastUpdated: string;
};

const content: Partial<Record<Lang, PrivacyContent>> & { en: PrivacyContent } = {
  ja: {
    title: 'プライバシーポリシー',
    sections: [
      {
        heading: '1. はじめに',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            空音開発（以下「当サイト」）は、お客様の個人情報の保護を最優先としています。本ポリシーは、当サイトが収集する情報、その利用方法、および保護方法について説明しています。
          </p>
        ),
      },
      {
        heading: '2. 収集される情報',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>メールアドレス</strong><br />
              マジックリンク認証を通じて取得されます。サブスクリプション登録、購入確認、パスワードリセットに使用されます。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>プロフィール情報</strong><br />
              名前、楽器、使用地域などをオプションで登録できます。練習ログの集計や統計分析に使用されます。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>アプリ使用ログ</strong><br />
              KUON PLAYERのアップロード日時・ファイル情報、マスター・チェックの処理ログなどを記録します。サービス改善と不正利用防止のために使用されます。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cookies・localStorage</strong><br />
              kuon_token （HttpOnly Cookie）: セッション認証<br />
              kuon_user （localStorage）: プロフィール情報<br />
              kuon_first_visit_* （localStorage）: 初回訪問時刻（分析用）
            </p>
          </div>
        ),
      },
      {
        heading: '3. Cookie とローカルストレージ',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>kuon_token</strong><br />
              HttpOnly Cookieで、セッション認証に使用。ブラウザのJavaScriptからはアクセス不可。有効期限は30日間です。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>kuon_user</strong><br />
              ユーザープロフィール（名前、楽器、言語設定）を保持。localStorageに保存。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>kuon_first_visit_*</strong><br />
              初回訪問時刻を記録。統計分析用。30日間保持。
            </p>
          </div>
        ),
      },
      {
        heading: '4. 決済情報',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            クレジットカード情報は、Stripe経由で処理されます。当サイトはカード情報を保存しません。Stripeのプライバシーポリシーに従います。（<a href="https://stripe.com/jp/privacy" style={{ color: '#0066cc' }}>https://stripe.com/jp/privacy</a>）
          </p>
        ),
      },
      {
        heading: '5. メール通信',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            購入確認メール、パスワードリセットメール、サブスク更新通知は、Resend API（noreply@kotaroasahina.com）から送信されます。メールアドレスは暗号化して保存されます。購読解除はメール内のリンクから行えます。
          </p>
        ),
      },
      {
        heading: '6. データストレージ',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Cloudflare KV</strong><br />
              ユーザープロフィール、セッション情報、KUON PLAYERのメタデータ（曲名・投稿者名・パスワードハッシュ）を保存。KVの全データは暗号化されます。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cloudflare R2</strong><br />
              KUON PLAYERのアップロードファイル、オーナーズ・ギャラリーの録音ファイルを保存。24時間自動削除（KUON PLAYERのみ）、またはユーザー削除時に物理削除されます。
            </p>
          </div>
        ),
      },
      {
        heading: '7. 第三者サービス',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Stripe</strong><br />
              決済処理。個人情報の取り扱いはStripe Privacy Policyに従います。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Resend</strong><br />
              メール配信。Privacy Policy: <a href="https://resend.com/privacy" style={{ color: '#0066cc' }}>https://resend.com/privacy</a>
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cloudflare</strong><br />
              ホスティング・CDN・KV・R2。Privacy Policy: <a href="https://www.cloudflare.com/privacy/" style={{ color: '#0066cc' }}>https://www.cloudflare.com/privacy/</a>
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Mapbox（Sound Map機能の場合）</strong><br />
              地図表示。ユーザーのGPS座標を取得する場合があります。Privacy Policy: <a href="https://www.mapbox.com/privacy/" style={{ color: '#0066cc' }}>https://www.mapbox.com/privacy/</a>
            </p>
          </div>
        ),
      },
      {
        heading: '8. データ保持と削除',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>ユーザーアカウント削除</strong><br />
              メール（369@kotaroasahina.com）でリクエストいただければ、30日以内にプロフィール・購入履歴を削除します。ただし、サブスク決済やマイク購入の履歴は会計法に基づき最長7年間保持される場合があります。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>アップロードファイル</strong><br />
              KUON PLAYERのファイルは24時間後に自動削除。オーナーズ・ギャラリーのファイルはユーザーが投稿削除をリクエストするまで保持されます。
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cookie・localStorage</strong><br />
              ブラウザ設定で削除可能。ただし、セッションCookieの削除でログアウトします。
            </p>
          </div>
        ),
      },
      {
        heading: '9. セキュリティ',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            当サイトはHTTPS暗号化、HttpOnly Cookie、CSRF保護を実装しています。ただし、インターネット通信の完全な安全を保証することはできません。パスワードを強力に保ち、公開コンピュータでのアクセスは避けてください。
          </p>
        ),
      },
      {
        heading: '10. お子様向けプライバシー',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            当サイトは18才未満のユーザー向けの明示的な対応をしていません。保護者がお子様のアカウント登録に同意された場合、個人情報の管理について保護者に責任があります。
          </p>
        ),
      },
      {
        heading: '11. ポリシーの変更',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            本ポリシーは予告なく変更される可能性があります。重要な変更については、メール通知または本ページのお知らせで周知します。
          </p>
        ),
      },
      {
        heading: '12. お問い合わせ',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            個人情報についてのご質問、削除リクエスト、異議申し立てはこちらまでお問い合わせください:<br />
            メール: <a href="mailto:369@kotaroasahina.com" style={{ color: '#0066cc' }}>369@kotaroasahina.com</a><br />
            住所: 北海道帯広市自由が丘5丁目16番地35
          </p>
        ),
      },
    ],
    lastUpdated: '2026年4月',
  },
  en: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: '1. Introduction',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            Kuon R&D ("we," "us," "our," or "the Site") is committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, and how we protect it.
          </p>
        ),
      },
      {
        heading: '2. Information We Collect',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Email Address</strong><br />
              Collected via magic link authentication. Used for subscription registration, purchase confirmations, and password resets.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Profile Information</strong><br />
              Optional: Name, instrument, region. Used for practice log aggregation and statistical analysis.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>App Usage Logs</strong><br />
              KUON PLAYER upload timestamps, file metadata, MASTER CHECK processing logs. Used for service improvement and abuse prevention.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cookies & localStorage</strong><br />
              kuon_token (HttpOnly Cookie): Session authentication<br />
              kuon_user (localStorage): Profile information<br />
              kuon_first_visit_* (localStorage): First visit timestamp (analytics)
            </p>
          </div>
        ),
      },
      {
        heading: '3. Cookies and Local Storage',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>kuon_token</strong><br />
              HttpOnly cookie used for session authentication. Not accessible via JavaScript. Expires in 30 days.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>kuon_user</strong><br />
              Stores user profile (name, instrument, language preference) in localStorage.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>kuon_first_visit_*</strong><br />
              Records first visit timestamp for analytics. Retained for 30 days.
            </p>
          </div>
        ),
      },
      {
        heading: '4. Payment Information',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            Credit card information is processed via Stripe. We do not store card information. Please see Stripe Privacy Policy: <a href="https://stripe.com/privacy" style={{ color: '#0066cc' }}>https://stripe.com/privacy</a>
          </p>
        ),
      },
      {
        heading: '5. Email Communications',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            Purchase confirmations, password reset emails, and subscription notifications are sent via Resend API (noreply@kotaroasahina.com). Email addresses are encrypted at rest. You can unsubscribe via the link in any email.
          </p>
        ),
      },
      {
        heading: '6. Data Storage',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Cloudflare KV</strong><br />
              Stores user profiles, session information, KUON PLAYER metadata (track names, uploader names, password hashes). All KV data is encrypted.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cloudflare R2</strong><br />
              Stores KUON PLAYER uploads and Owners Gallery recordings. Files are auto-deleted after 24 hours (KUON PLAYER) or upon user deletion request.
            </p>
          </div>
        ),
      },
      {
        heading: '7. Third-Party Services',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Stripe</strong><br />
              Payment processing. See <a href="https://stripe.com/privacy" style={{ color: '#0066cc' }}>https://stripe.com/privacy</a>
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Resend</strong><br />
              Email delivery. See <a href="https://resend.com/privacy" style={{ color: '#0066cc' }}>https://resend.com/privacy</a>
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cloudflare</strong><br />
              Hosting, CDN, KV, R2. See <a href="https://www.cloudflare.com/privacy/" style={{ color: '#0066cc' }}>https://www.cloudflare.com/privacy/</a>
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Mapbox (if Sound Map feature used)</strong><br />
              Map display. May request user GPS coordinates. See <a href="https://www.mapbox.com/privacy/" style={{ color: '#0066cc' }}>https://www.mapbox.com/privacy/</a>
            </p>
          </div>
        ),
      },
      {
        heading: '8. Data Retention and Deletion',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Account Deletion</strong><br />
              Email 369@kotaroasahina.com to request account deletion. We will delete profile and usage logs within 30 days. Payment records may be retained for up to 7 years for accounting compliance.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Uploaded Files</strong><br />
              KUON PLAYER files are auto-deleted after 24 hours. Owners Gallery files are retained until the user requests deletion.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cookies & localStorage</strong><br />
              Delete via browser settings. Note: Deleting kuon_token will log you out.
            </p>
          </div>
        ),
      },
      {
        heading: '9. Security',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            We implement HTTPS encryption, HttpOnly cookies, and CSRF protection. However, no internet transmission is completely secure. Keep passwords strong and avoid accessing from public computers.
          </p>
        ),
      },
      {
        heading: '10. Children\'s Privacy',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            The Site does not explicitly target users under 18. If a parent or guardian consents to a minor's account registration, the parent/guardian is responsible for managing that account's personal information.
          </p>
        ),
      },
      {
        heading: '11. Policy Changes',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            We may update this policy without prior notice. Material changes will be announced via email or notice on this page.
          </p>
        ),
      },
      {
        heading: '12. Contact',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            For questions about personal information, deletion requests, or complaints:<br />
            Email: <a href="mailto:369@kotaroasahina.com" style={{ color: '#0066cc' }}>369@kotaroasahina.com</a><br />
            Address: 5-16-35 Jiyugaoka, Obihiro, Hokkaido 080-2476, Japan
          </p>
        ),
      },
    ],
    lastUpdated: 'April 2026',
  },
  ko: {
    title: '개인정보보호정책',
    sections: [
      {
        heading: '1. 소개',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            공음 R&D(이하 "당사" 또는 "본 웹사이트")는 개인정보 보호를 최우선으로 하고 있습니다. 본 정책은 당사가 수집하는 정보, 그 이용 방법 및 보호 방법을 설명합니다.
          </p>
        ),
      },
      {
        heading: '2. 수집하는 정보',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>이메일 주소</strong><br />
              매직링크 인증을 통해 수집됩니다. 구독 등록, 구매 확인, 비밀번호 재설정에 사용됩니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>프로필 정보</strong><br />
              선택 항목: 이름, 악기, 사용 지역. 연습 로그 집계 및 통계 분석에 사용됩니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>앱 사용 로그</strong><br />
              KUON PLAYER 업로드 타임스탬프, 파일 메타데이터, MASTER CHECK 처리 로그. 서비스 개선 및 악용 방지에 사용됩니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>쿠키 및 localStorage</strong><br />
              kuon_token (HttpOnly 쿠키): 세션 인증<br />
              kuon_user (localStorage): 프로필 정보<br />
              kuon_first_visit_* (localStorage): 첫 방문 타임스탬프 (분석용)
            </p>
          </div>
        ),
      },
      {
        heading: '3. 쿠키 및 로컬 스토리지',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>kuon_token</strong><br />
              세션 인증에 사용되는 HttpOnly 쿠키. JavaScript에서 접근 불가. 30일 후 만료됩니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>kuon_user</strong><br />
              사용자 프로필 (이름, 악기, 언어 설정)을 localStorage에 저장합니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>kuon_first_visit_*</strong><br />
              첫 방문 타임스탬프를 기록합니다. 분석용. 30일간 보유됩니다.
            </p>
          </div>
        ),
      },
      {
        heading: '4. 결제 정보',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            신용카드 정보는 Stripe을 통해 처리됩니다. 당사는 카드 정보를 저장하지 않습니다. Stripe 개인정보보호정책을 참조하세요: <a href="https://stripe.com/privacy" style={{ color: '#0066cc' }}>https://stripe.com/privacy</a>
          </p>
        ),
      },
      {
        heading: '5. 이메일 통신',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            구매 확인 이메일, 비밀번호 재설정 이메일, 구독 알림은 Resend API (noreply@kotaroasahina.com)를 통해 발송됩니다. 이메일 주소는 암호화되어 저장됩니다. 각 이메일의 링크를 통해 구독을 취소할 수 있습니다.
          </p>
        ),
      },
      {
        heading: '6. 데이터 저장',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Cloudflare KV</strong><br />
              사용자 프로필, 세션 정보, KUON PLAYER 메타데이터 (곡명, 업로더명, 비밀번호 해시)를 저장합니다. 모든 KV 데이터는 암호화됩니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cloudflare R2</strong><br />
              KUON PLAYER 업로드 파일 및 오너스 갤러리 녹음을 저장합니다. 파일은 24시간 후 자동 삭제 (KUON PLAYER) 또는 사용자 삭제 요청 시 삭제됩니다.
            </p>
          </div>
        ),
      },
      {
        heading: '7. 제3자 서비스',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Stripe</strong><br />
              결제 처리. <a href="https://stripe.com/privacy" style={{ color: '#0066cc' }}>https://stripe.com/privacy</a> 참조
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Resend</strong><br />
              이메일 배송. <a href="https://resend.com/privacy" style={{ color: '#0066cc' }}>https://resend.com/privacy</a> 참조
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cloudflare</strong><br />
              호스팅, CDN, KV, R2. <a href="https://www.cloudflare.com/privacy/" style={{ color: '#0066cc' }}>https://www.cloudflare.com/privacy/</a> 참조
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Mapbox (Sound Map 기능 사용 시)</strong><br />
              지도 표시. 사용자의 GPS 좌표를 요청할 수 있습니다. <a href="https://www.mapbox.com/privacy/" style={{ color: '#0066cc' }}>https://www.mapbox.com/privacy/</a> 참조
            </p>
          </div>
        ),
      },
      {
        heading: '8. 데이터 보유 및 삭제',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>계정 삭제</strong><br />
              369@kotaroasahina.com 으로 계정 삭제를 요청하면, 30일 이내에 프로필 및 사용 로그를 삭제합니다. 결제 기록은 회계 규정 준수상 최대 7년간 보유될 수 있습니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>업로드된 파일</strong><br />
              KUON PLAYER 파일은 24시간 후 자동 삭제됩니다. 오너스 갤러리 파일은 사용자가 삭제를 요청할 때까지 보유됩니다.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>쿠키 및 localStorage</strong><br />
              브라우저 설정에서 삭제할 수 있습니다. 참고: kuon_token을 삭제하면 로그아웃됩니다.
            </p>
          </div>
        ),
      },
      {
        heading: '9. 보안',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            당사는 HTTPS 암호화, HttpOnly 쿠키, CSRF 보호를 구현하고 있습니다. 그러나 인터넷 통신의 완전한 안전을 보장할 수 없습니다. 강력한 비밀번호를 유지하고 공용 컴퓨터에서의 접근을 피하세요.
          </p>
        ),
      },
      {
        heading: '10. 아동 개인정보',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            본 웹사이트는 18세 미만의 사용자를 명시적으로 대상으로 하지 않습니다. 부모 또는 보호자가 미성년자의 계정 등록에 동의한 경우, 부모 또는 보호자가 해당 계정의 개인정보 관리에 책임이 있습니다.
          </p>
        ),
      },
      {
        heading: '11. 정책 변경',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            당사는 본 정책을 사전 통지 없이 변경할 수 있습니다. 중요한 변경 사항은 이메일 또는 본 페이지의 공지로 안내합니다.
          </p>
        ),
      },
      {
        heading: '12. 문의',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            개인정보에 대한 질문, 삭제 요청, 이의 사항은 다음으로 문의하세요:<br />
            이메일: <a href="mailto:369@kotaroasahina.com" style={{ color: '#0066cc' }}>369@kotaroasahina.com</a><br />
            주소: 북해도 오비히로시 지유가오카 5초메 16반지 35, 일본 080-2476
          </p>
        ),
      },
    ],
    lastUpdated: '2026년 4월',
  },
  pt: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: '1. Introduction',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            Kuon R&D ("we," "us," "our," or "the Site") is committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, and how we protect it.
          </p>
        ),
      },
      {
        heading: '2. Information We Collect',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Email Address</strong><br />
              Collected via magic link authentication. Used for subscription registration, purchase confirmations, and password resets.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Profile Information</strong><br />
              Optional: Name, instrument, region. Used for practice log aggregation and statistical analysis.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>App Usage Logs</strong><br />
              KUON PLAYER upload timestamps, file metadata, MASTER CHECK processing logs. Used for service improvement and abuse prevention.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cookies & localStorage</strong><br />
              kuon_token (HttpOnly Cookie): Session authentication<br />
              kuon_user (localStorage): Profile information<br />
              kuon_first_visit_* (localStorage): First visit timestamp (analytics)
            </p>
          </div>
        ),
      },
      {
        heading: '3. Cookies and Local Storage',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>kuon_token</strong><br />
              HttpOnly cookie used for session authentication. Not accessible via JavaScript. Expires in 30 days.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>kuon_user</strong><br />
              Stores user profile (name, instrument, language preference) in localStorage.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>kuon_first_visit_*</strong><br />
              Records first visit timestamp for analytics. Retained for 30 days.
            </p>
          </div>
        ),
      },
      {
        heading: '4. Payment Information',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            Credit card information is processed via Stripe. We do not store card information. Please see Stripe Privacy Policy: <a href="https://stripe.com/privacy" style={{ color: '#0066cc' }}>https://stripe.com/privacy</a>
          </p>
        ),
      },
      {
        heading: '5. Email Communications',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            Purchase confirmations, password reset emails, and subscription notifications are sent via Resend API (noreply@kotaroasahina.com). Email addresses are encrypted at rest. You can unsubscribe via the link in any email.
          </p>
        ),
      },
      {
        heading: '6. Data Storage',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Cloudflare KV</strong><br />
              Stores user profiles, session information, KUON PLAYER metadata (track names, uploader names, password hashes). All KV data is encrypted.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cloudflare R2</strong><br />
              Stores KUON PLAYER uploads and Owners Gallery recordings. Files are auto-deleted after 24 hours (KUON PLAYER) or upon user deletion request.
            </p>
          </div>
        ),
      },
      {
        heading: '7. Third-Party Services',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Stripe</strong><br />
              Payment processing. See <a href="https://stripe.com/privacy" style={{ color: '#0066cc' }}>https://stripe.com/privacy</a>
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Resend</strong><br />
              Email delivery. See <a href="https://resend.com/privacy" style={{ color: '#0066cc' }}>https://resend.com/privacy</a>
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cloudflare</strong><br />
              Hosting, CDN, KV, R2. See <a href="https://www.cloudflare.com/privacy/" style={{ color: '#0066cc' }}>https://www.cloudflare.com/privacy/</a>
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Mapbox (if Sound Map feature used)</strong><br />
              Map display. May request user GPS coordinates. See <a href="https://www.mapbox.com/privacy/" style={{ color: '#0066cc' }}>https://www.mapbox.com/privacy/</a>
            </p>
          </div>
        ),
      },
      {
        heading: '8. Data Retention and Deletion',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Account Deletion</strong><br />
              Email 369@kotaroasahina.com to request account deletion. We will delete profile and usage logs within 30 days. Payment records may be retained for up to 7 years for accounting compliance.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Uploaded Files</strong><br />
              KUON PLAYER files are auto-deleted after 24 hours. Owners Gallery files are retained until the user requests deletion.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cookies & localStorage</strong><br />
              Delete via browser settings. Note: Deleting kuon_token will log you out.
            </p>
          </div>
        ),
      },
      {
        heading: '9. Security',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            We implement HTTPS encryption, HttpOnly cookies, and CSRF protection. However, no internet transmission is completely secure. Keep passwords strong and avoid accessing from public computers.
          </p>
        ),
      },
      {
        heading: '10. Children\'s Privacy',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            The Site does not explicitly target users under 18. If a parent or guardian consents to a minor's account registration, the parent/guardian is responsible for managing that account's personal information.
          </p>
        ),
      },
      {
        heading: '11. Policy Changes',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            We may update this policy without prior notice. Material changes will be announced via email or notice on this page.
          </p>
        ),
      },
      {
        heading: '12. Contact',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            For questions about personal information, deletion requests, or complaints:<br />
            Email: <a href="mailto:369@kotaroasahina.com" style={{ color: '#0066cc' }}>369@kotaroasahina.com</a><br />
            Address: 5-16-35 Jiyugaoka, Obihiro, Hokkaido 080-2476, Japan
          </p>
        ),
      },
    ],
    lastUpdated: 'April 2026',
  },
  es: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: '1. Introduction',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            Kuon R&D ("we," "us," "our," or "the Site") is committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, and how we protect it.
          </p>
        ),
      },
      {
        heading: '2. Information We Collect',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Email Address</strong><br />
              Collected via magic link authentication. Used for subscription registration, purchase confirmations, and password resets.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Profile Information</strong><br />
              Optional: Name, instrument, region. Used for practice log aggregation and statistical analysis.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>App Usage Logs</strong><br />
              KUON PLAYER upload timestamps, file metadata, MASTER CHECK processing logs. Used for service improvement and abuse prevention.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cookies & localStorage</strong><br />
              kuon_token (HttpOnly Cookie): Session authentication<br />
              kuon_user (localStorage): Profile information<br />
              kuon_first_visit_* (localStorage): First visit timestamp (analytics)
            </p>
          </div>
        ),
      },
      {
        heading: '3. Cookies and Local Storage',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>kuon_token</strong><br />
              HttpOnly cookie used for session authentication. Not accessible via JavaScript. Expires in 30 days.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>kuon_user</strong><br />
              Stores user profile (name, instrument, language preference) in localStorage.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>kuon_first_visit_*</strong><br />
              Records first visit timestamp for analytics. Retained for 30 days.
            </p>
          </div>
        ),
      },
      {
        heading: '4. Payment Information',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            Credit card information is processed via Stripe. We do not store card information. Please see Stripe Privacy Policy: <a href="https://stripe.com/privacy" style={{ color: '#0066cc' }}>https://stripe.com/privacy</a>
          </p>
        ),
      },
      {
        heading: '5. Email Communications',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            Purchase confirmations, password reset emails, and subscription notifications are sent via Resend API (noreply@kotaroasahina.com). Email addresses are encrypted at rest. You can unsubscribe via the link in any email.
          </p>
        ),
      },
      {
        heading: '6. Data Storage',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Cloudflare KV</strong><br />
              Stores user profiles, session information, KUON PLAYER metadata (track names, uploader names, password hashes). All KV data is encrypted.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cloudflare R2</strong><br />
              Stores KUON PLAYER uploads and Owners Gallery recordings. Files are auto-deleted after 24 hours (KUON PLAYER) or upon user deletion request.
            </p>
          </div>
        ),
      },
      {
        heading: '7. Third-Party Services',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Stripe</strong><br />
              Payment processing. See <a href="https://stripe.com/privacy" style={{ color: '#0066cc' }}>https://stripe.com/privacy</a>
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Resend</strong><br />
              Email delivery. See <a href="https://resend.com/privacy" style={{ color: '#0066cc' }}>https://resend.com/privacy</a>
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cloudflare</strong><br />
              Hosting, CDN, KV, R2. See <a href="https://www.cloudflare.com/privacy/" style={{ color: '#0066cc' }}>https://www.cloudflare.com/privacy/</a>
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Mapbox (if Sound Map feature used)</strong><br />
              Map display. May request user GPS coordinates. See <a href="https://www.mapbox.com/privacy/" style={{ color: '#0066cc' }}>https://www.mapbox.com/privacy/</a>
            </p>
          </div>
        ),
      },
      {
        heading: '8. Data Retention and Deletion',
        content: (
          <div style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            <p>
              <strong>Account Deletion</strong><br />
              Email 369@kotaroasahina.com to request account deletion. We will delete profile and usage logs within 30 days. Payment records may be retained for up to 7 years for accounting compliance.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Uploaded Files</strong><br />
              KUON PLAYER files are auto-deleted after 24 hours. Owners Gallery files are retained until the user requests deletion.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Cookies & localStorage</strong><br />
              Delete via browser settings. Note: Deleting kuon_token will log you out.
            </p>
          </div>
        ),
      },
      {
        heading: '9. Security',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            We implement HTTPS encryption, HttpOnly cookies, and CSRF protection. However, no internet transmission is completely secure. Keep passwords strong and avoid accessing from public computers.
          </p>
        ),
      },
      {
        heading: '10. Children\'s Privacy',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            The Site does not explicitly target users under 18. If a parent or guardian consents to a minor's account registration, the parent/guardian is responsible for managing that account's personal information.
          </p>
        ),
      },
      {
        heading: '11. Policy Changes',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            We may update this policy without prior notice. Material changes will be announced via email or notice on this page.
          </p>
        ),
      },
      {
        heading: '12. Contact',
        content: (
          <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
            For questions about personal information, deletion requests, or complaints:<br />
            Email: <a href="mailto:369@kotaroasahina.com" style={{ color: '#0066cc' }}>369@kotaroasahina.com</a><br />
            Address: 5-16-35 Jiyugaoka, Obihiro, Hokkaido 080-2476, Japan
          </p>
        ),
      },
    ],
    lastUpdated: 'April 2026',
  },
};

export default function PrivacyPage() {
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
