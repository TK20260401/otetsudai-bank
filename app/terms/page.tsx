import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto py-8 bg-white">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">利用規約</h1>
      <p className="text-sm text-muted-foreground mb-6">最終更新日: 2026年4月9日</p>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">

        {/* ===== 重要: 免責事項・サービスの性質 ===== */}
        <section className="rounded-xl border-2 border-amber-400 bg-amber-50 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
            ⚠️ 【重要】本アプリの性質について
          </h2>
          <p className="font-semibold text-amber-800 mb-3">
            本アプリは、お手伝いの記録・管理を目的とした教育支援ツールです。
          </p>
          <ul className="list-disc pl-6 space-y-2 text-amber-900">
            <li>実際の送金・購入は、保護者が外部アプリ（PayPay、B/43、証券口座等）で<strong>手動で</strong>行います</li>
            <li>本アプリは金融機関ではなく、<strong>資金の預かり・送金・運用は一切行いません</strong></li>
            <li>アプリ内の「残高」「投資」はすべて<strong>記録・シミュレーション上の数値</strong>です</li>
            <li>実際のお金のやり取りは、すべて<strong>保護者の責任と判断</strong>のもとで行ってください</li>
          </ul>
        </section>

        {/* ===== ロードマップ開示 ===== */}
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">📋 開発ロードマップ</h2>
          <p className="text-blue-800 mb-3">本アプリの開発ロードマップを以下に開示します（透明性のため）:</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0">現在</span>
              <div>
                <p className="font-semibold text-blue-900">Phase 1: アプリ内記録管理</p>
                <p className="text-blue-700 text-xs">お手伝い記録 + 外部送金アプリへのリンク（PayPay / B/43 / LINE Pay等）</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-gray-400 text-white text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0">将来</span>
              <div>
                <p className="font-semibold text-gray-700">Phase 2: プリペイドカード連携・銘柄拡充</p>
                <p className="text-gray-500 text-xs">B/43ジュニア等との連携、投資シミュレーション銘柄の拡充（予定）</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-gray-400 text-white text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0">将来</span>
              <div>
                <p className="font-semibold text-gray-700">Phase 3: 銀行API連携・銘柄本格拡充</p>
                <p className="text-gray-500 text-xs">資金移動業ライセンス取得後の実装予定、投資銘柄の本格拡充</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-3 border-t border-blue-200 pt-2">
            ※ Phase 2以降は法人化・各種ライセンス取得後の実装予定です。
            現時点では、本アプリ内で実際のお金が移動することはありません。
          </p>
        </section>

        {/* ===== サービス概要 ===== */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 mb-2">1. サービス概要</h2>
          <p>おこづかいクエスト（以下「本サービス」）は、家庭内のお手伝いを通じてお子様の金融リテラシーを育成するための教育アプリケーションです。保護者がクエスト（お手伝い）を設定し、お子様がクリアすることで仮想的な報酬を獲得・管理する体験を提供します。</p>
        </section>

        {/* ===== 対象年齢 ===== */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 mb-2">2. 対象年齢・利用条件</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>本サービスは、<strong>保護者の監督下</strong>での使用を前提としています（お子様単独での利用は想定していません）</li>
            <li>対象年齢: 未就学児〜中学生（保護者の判断による）</li>
            <li>本サービスの利用には、保護者によるアカウント登録が必要です</li>
            <li>お子様のアカウントは、保護者の責任のもとで作成・管理してください</li>
          </ul>
        </section>

        {/* ===== アカウント管理 ===== */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 mb-2">3. アカウント管理</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>保護者がアカウントの作成・管理・削除の全責任を負います</li>
            <li>家族単位でデータを管理し、データの削除は保護者のみが行えます</li>
            <li>PINコードの管理は保護者の責任となります</li>
          </ul>
        </section>

        {/* ===== 投資シミュレーション ===== */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 mb-2">4. 投資シミュレーションについて</h2>
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
            <p>本サービスの投資機能は<strong>教育目的のシミュレーション</strong>であり、以下の点にご注意ください:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>実際の有価証券の売買は行いません</li>
              <li>投資助言・投資勧誘には該当しません</li>
              <li>シミュレーション結果は実際の投資成果を保証するものではありません</li>
              <li>実際の投資判断は保護者ご自身の責任で行ってください</li>
              <li>銘柄の選択肢は、教育心理学の「選択肢のパラドックス」（選択肢が多すぎると判断が困難になる現象）を考慮し、お子様が無理なく選べる数に意図的に制限しています</li>
              <li>銘柄ラインナップは今後のバージョンアップで段階的に拡充する予定です</li>
            </ul>
          </div>
        </section>

        {/* ===== 禁止事項 ===== */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 mb-2">5. 禁止事項</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>他のユーザーのアカウントへの不正アクセス</li>
            <li>サービスの運営を妨害する行為</li>
            <li>虚偽の情報を登録する行為</li>
            <li>本サービスを商業目的で利用する行為</li>
          </ul>
        </section>

        {/* ===== 免責事項 ===== */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 mb-2">6. 免責事項</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>本サービスは「現状有姿」で提供されます</li>
            <li>外部アプリ（PayPay、B/43、LINE Pay等）での送金トラブルは本サービスの責任外です</li>
            <li>サービスの中断・停止による損害について責任を負いません</li>
            <li>本サービスでの教育効果を保証するものではありません</li>
            <li>実際のお金の管理・移動は保護者の責任となります</li>
          </ul>
        </section>

        {/* ===== サービス変更・終了 ===== */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 mb-2">7. サービスの変更・終了</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>本サービスは予告なく内容の変更・一時停止・終了を行う場合があります</li>
            <li>重要な変更がある場合は、アプリ内で事前に通知するよう努めます</li>
            <li>サービス終了時は、30日前までにユーザーに通知し、データのエクスポート手段を提供します</li>
          </ul>
        </section>

        {/* ===== 規約の変更 ===== */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 mb-2">8. 規約の変更</h2>
          <p>本規約は予告なく変更される場合があります。重要な変更がある場合は、アプリ内で通知します。継続利用をもって改定後の規約に同意したものとみなします。</p>
        </section>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link href="/privacy" className="text-sm text-emerald-600 hover:underline">
          プライバシーポリシー →
        </Link>
        <Link href="/" className="text-sm text-emerald-600 hover:underline">
          ← トップにもどる
        </Link>
      </div>
    </div>
  );
}
