/**
 * 外部決済アプリ ディープリンク定義
 *
 * 承認完了後に親が子供の代わりに決済アプリを起動するためのリンク集。
 * iOS/Android のユニバーサルリンク / Intent URL を使用。
 * アプリ未インストール時はストアページにフォールバック。
 */

export type PaymentApp = {
  id: string;
  name: string;
  icon: string;
  /** アプリ起動用ディープリンク（金額埋め込み可） */
  deepLink: (amount: number) => string;
  /** フォールバック（ストア or Web） */
  fallbackUrl: string;
  /** 対応プラットフォーム */
  platforms: ("ios" | "android" | "web")[];
  /** 説明文 */
  description: string;
};

export const PAYMENT_APPS: PaymentApp[] = [
  {
    id: "paypay",
    name: "PayPay",
    icon: "💳",
    deepLink: () => "paypay://",
    fallbackUrl: "https://paypay.ne.jp/app/",
    platforms: ["ios", "android"],
    description: "PayPayアプリで支払い",
  },
  {
    id: "b43",
    name: "B/43",
    icon: "💴",
    deepLink: () => "b43://",
    fallbackUrl: "https://b43.jp/",
    platforms: ["ios", "android"],
    description: "B/43カードで支払い（親子カード対応）",
  },
  {
    id: "linepay",
    name: "LINE Pay",
    icon: "🟢",
    deepLink: () => "line://pay",
    fallbackUrl: "https://pay.line.me/",
    platforms: ["ios", "android"],
    description: "LINE Payで送金・支払い",
  },
];

/**
 * ディープリンクでアプリを起動する。
 * アプリが見つからない場合はフォールバックURLを開く。
 */
export function openPaymentApp(app: PaymentApp, amount: number): void {
  const deepLink = app.deepLink(amount);
  const fallback = app.fallbackUrl;

  // モバイル: ディープリンクを試行 → タイムアウトでフォールバック
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  if (isIOS || isAndroid) {
    const start = Date.now();
    window.location.href = deepLink;

    // 2秒以内にアプリが開かなければストアへ
    setTimeout(() => {
      if (Date.now() - start < 2500) {
        window.open(fallback, "_blank", "noopener");
      }
    }, 2000);
  } else {
    // PC: 情報ページを開く
    window.open(fallback, "_blank", "noopener");
  }
}
