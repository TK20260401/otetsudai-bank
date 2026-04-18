import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto py-8 bg-background">
      <h1 className="text-2xl font-bold text-primary mb-2 drop-shadow-[0_1px_4px_rgba(255,166,35,0.35)]">プライバシーポリシー</h1>
      <p className="text-sm text-muted-foreground mb-6">最終更新日: 2026年4月9日</p>

      <div className="space-y-6 text-sm text-card-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">1. はじめに</h2>
          <p>おこづかいクエスト（以下「本アプリ」）は、お子様の金融教育を目的としたアプリケーションです。本プライバシーポリシーは、本アプリが収集する情報とその利用方法について説明します。お子様のプライバシー保護を最優先とし、個人情報保護法およびCOPPA（児童オンラインプライバシー保護法）の趣旨に配慮して運営しています。</p>
        </section>

        {/* ===== 収集するデータ ===== */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">2. 収集する情報</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>家族情報</strong>: 家族名（ニックネーム可）</li>
            <li><strong>保護者の情報</strong>: メールアドレス、パスワード（暗号化保存）、表示名</li>
            <li><strong>お子様の情報</strong>: 表示名（ニックネーム可）、PIN（bcryptハッシュで暗号化保存）</li>
            <li><strong>利用データ</strong>: お手伝い完了履歴、ウォレット残高記録、取引履歴、投資シミュレーション記録</li>
          </ul>
        </section>

        {/* ===== 収集しないデータ ===== */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">3. 収集しない情報</h2>
          <div className="rounded-lg border border-[#2ecc71]/40 bg-card p-3">
            <p className="font-semibold text-[#58d68d] mb-2">以下の情報は一切収集しません:</p>
            <ul className="list-disc pl-6 space-y-1 text-card-foreground">
              <li>銀行口座情報・口座番号</li>
              <li>クレジットカード情報</li>
              <li>マイナンバー（個人番号）</li>
              <li>位置情報</li>
              <li>お子様の写真・動画</li>
              <li>連絡先（電話帳）情報</li>
            </ul>
          </div>
        </section>

        {/* ===== 利用目的 ===== */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">4. 情報の利用目的</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>アカウント認証およびサービス提供</li>
            <li>お手伝い管理・ウォレット機能の運営</li>
            <li>AIチャットアシスタントによる教育支援</li>
            <li>サービスの改善・不具合修正</li>
          </ul>
        </section>

        {/* ===== データ保存 ===== */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">5. データの保存・管理</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>保存場所</strong>: Supabase（AWSインフラ上）に暗号化して保存</li>
            <li><strong>通信</strong>: すべての通信はTLS（SSL）で暗号化</li>
            <li><strong>PINコード</strong>: bcryptハッシュで暗号化保存（平文では保持しません）</li>
            <li><strong>アクセス制御</strong>: 行レベルセキュリティ（RLS）により、他の家族のデータにアクセスできません</li>
          </ul>
        </section>

        {/* ===== 第三者提供 ===== */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">6. 第三者提供</h2>
          <p>本アプリは、法令に基づく場合を除き、ユーザーの個人情報を第三者に提供しません。</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>広告</strong>: 本アプリに広告は掲載していません</li>
            <li><strong>AIチャット機能</strong>: 会話内容がAIサービスプロバイダー（Anthropic社）に送信されますが、個人を特定する情報は含まれません</li>
            <li><strong>株価データ</strong>: Alpha Vantage APIから取得しますが、ユーザーの個人情報は送信されません</li>
          </ul>
        </section>

        {/* ===== 子供のプライバシー ===== */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">7. お子様のプライバシー保護</h2>
          <div className="rounded-lg border border-[#3498db]/40 bg-card p-3">
            <p className="font-semibold text-[#5dade2] mb-2">お子様の個人情報保護を最優先としています:</p>
            <ul className="list-disc pl-6 space-y-1 text-card-foreground">
              <li>お子様のアカウントは保護者のみが作成できます</li>
              <li>お子様の表示名はニックネームの使用を推奨しています</li>
              <li>お子様の情報は暗号化して保存されます</li>
              <li>PINはbcryptハッシュで暗号化保存され、平文では保持しません</li>
              <li>行レベルセキュリティ（RLS）により、他の家族のデータにアクセスできません</li>
              <li>お子様が直接外部サービスと通信する機能はありません</li>
              <li>投資シミュレーションの銘柄選択肢は、お子様の認知負荷を考慮し、教育心理学に基づいて適切な数に制限しています（「選択肢のパラドックス」への配慮）</li>
            </ul>
          </div>
        </section>

        {/* ===== Cookie ===== */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">8. Cookieの使用</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>本アプリはCookieを使用しません</li>
            <li>セッション管理にはlocalStorageを使用しています</li>
            <li>トラッキング目的のCookieやWeb Beaconは一切使用しません</li>
          </ul>
        </section>

        {/* ===== データ削除 ===== */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">9. データの削除</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>保護者は、アプリ内の「アカウント削除」機能からいつでもアカウントと関連データを削除できます</li>
            <li>削除されたデータは30日後に完全に消去されます</li>
            <li>削除対象: 家族情報、お子様の情報、お手伝い記録、ウォレット情報、取引履歴、メッセージ等のすべての関連データ</li>
          </ul>
        </section>

        {/* ===== お問い合わせ ===== */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">10. お問い合わせ</h2>
          <p>プライバシーに関するお問い合わせは、アプリ内のヘルプページからご連絡ください。</p>
        </section>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link href="/terms" className="text-sm text-primary hover:underline">
          利用規約 →
        </Link>
        <Link href="/" className="text-sm text-primary hover:underline">
          ← トップにもどる
        </Link>
      </div>
    </div>
  );
}
