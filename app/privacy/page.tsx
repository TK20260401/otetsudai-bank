import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">プライバシーポリシー</h1>
      <p className="text-sm text-muted-foreground mb-6">最終更新日: 2026年4月8日</p>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">1. はじめに</h2>
          <p>おこづかいクエスト（以下「本アプリ」）は、お子様の金融教育を目的としたアプリケーションです。本プライバシーポリシーは、本アプリが収集する情報とその利用方法について説明します。</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">2. 収集する情報</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>保護者の情報</strong>: メールアドレス、パスワード（暗号化保存）、表示名</li>
            <li><strong>お子様の情報</strong>: 表示名（ニックネーム可）、PIN（暗号化保存）</li>
            <li><strong>利用データ</strong>: クエスト完了履歴、ウォレット残高、取引履歴</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">3. 情報の利用目的</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>アカウント認証およびサービス提供</li>
            <li>クエスト管理・ウォレット機能の運営</li>
            <li>AIチャットアシスタントによる教育支援</li>
            <li>サービスの改善</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">4. 第三者提供</h2>
          <p>本アプリは、法令に基づく場合を除き、ユーザーの個人情報を第三者に提供しません。AIチャット機能では、会話内容がAIサービスプロバイダーに送信されますが、個人を特定する情報は含まれません。</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">5. お子様のプライバシー保護</h2>
          <p>本アプリは、お子様の個人情報保護を最優先としています。</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>お子様のアカウントは保護者のみが作成できます</li>
            <li>お子様の情報は暗号化して保存されます</li>
            <li>PINはbcryptハッシュで暗号化保存され、平文では保持しません</li>
            <li>行レベルセキュリティ（RLS）により、他の家族のデータにアクセスできません</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">6. データの削除</h2>
          <p>保護者は、アプリ内の「アカウント削除」機能からいつでもアカウントと関連データを削除できます。削除されたデータは30日後に完全に消去されます。</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">7. お問い合わせ</h2>
          <p>プライバシーに関するお問い合わせは、アプリ内のヘルプページからご連絡ください。</p>
        </section>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-emerald-600 hover:underline">← トップにもどる</Link>
      </div>
    </div>
  );
}
