import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">利用規約</h1>
      <p className="text-sm text-muted-foreground mb-6">最終更新日: 2026年4月8日</p>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">1. サービス概要</h2>
          <p>おこづかいクエスト（以下「本サービス」）は、家庭内のお手伝いを通じてお子様の金融リテラシーを育成するための教育アプリケーションです。保護者がクエスト（お手伝い）を設定し、お子様がクリアすることで仮想コインを獲得・管理する体験を提供します。</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">2. 利用条件</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>本サービスの利用には、保護者によるアカウント登録が必要です</li>
            <li>お子様のアカウントは、保護者の責任のもとで作成・管理してください</li>
            <li>13歳未満のお子様は、保護者の同意のもとでのみ利用できます</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">3. 仮想コインについて</h2>
          <p className="font-semibold text-red-600">本サービスで使用される「コイン」は、アプリ内でのみ有効な仮想的な単位です。現金、電子マネー、暗号資産等への換金はできません。また、コインには金銭的価値はありません。</p>
          <p className="mt-2">コインは家庭内での教育目的でのみ使用されることを意図しています。実際のお小遣いの管理は、保護者の判断と責任のもとで行ってください。</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">4. 禁止事項</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>他のユーザーのアカウントへの不正アクセス</li>
            <li>サービスの運営を妨害する行為</li>
            <li>虚偽の情報を登録する行為</li>
            <li>本サービスを商業目的で利用する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">5. 免責事項</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>本サービスは「現状有姿」で提供されます</li>
            <li>サービスの中断・停止による損害について責任を負いません</li>
            <li>本サービスでの教育効果を保証するものではありません</li>
            <li>実際のお金の管理は保護者の責任となります</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">6. 規約の変更</h2>
          <p>本規約は予告なく変更される場合があります。重要な変更がある場合は、アプリ内で通知します。</p>
        </section>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-emerald-600 hover:underline">← トップにもどる</Link>
      </div>
    </div>
  );
}
