"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
          ← もどる
        </Button>
        <h1 className="text-2xl font-bold text-amber-800">📖 つかいかた</h1>
      </div>

      {/* クイックスタート */}
      <Card className="mb-6 border-amber-300 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg text-amber-800">
            🚀 かんたん3ステップ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <p className="font-semibold">おうちをえらんでログイン</p>
                <p className="text-sm text-muted-foreground">
                  トップ画面でおうちをえらんで、じぶんの名前をタップしよう
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <p className="font-semibold">おてつだいをやろう</p>
                <p className="text-sm text-muted-foreground">
                  おてつだいリストからできることをえらんで「できた！」をおそう
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <p className="font-semibold">コインをためよう</p>
                <p className="text-sm text-muted-foreground">
                  おうちの人がみとめたら、コインがもらえるよ！ちょきんもできるよ
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* こども向け */}
      <Card className="mb-4 border-amber-200">
        <CardHeader>
          <CardTitle className="text-base text-amber-700">
            🧒 こどもの画面
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-lg">🐷</span>
            <div>
              <p className="font-semibold">ちょきんばこ</p>
              <p className="text-muted-foreground">
                いまのおかねがわかるよ。「つかえるお金」と「ちょきん」にわかれているよ
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">📋</span>
            <div>
              <p className="font-semibold">おてつだいリスト</p>
              <p className="text-muted-foreground">
                できるおてつだいがならんでいるよ。アイコンをみれば、なにをするかすぐわかるね
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">✅</span>
            <div>
              <p className="font-semibold">「できた！」ボタン</p>
              <p className="text-muted-foreground">
                おてつだいがおわったらタップ！おうちの人がみとめたらコインがもらえるよ
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">📜</span>
            <div>
              <p className="font-semibold">りれき</p>
              <p className="text-muted-foreground">
                いままでもらったコインや、つかったコインのきろくがみられるよ
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">🪙</span>
            <div>
              <p className="font-semibold">コインくん（AIアシスタント）</p>
              <p className="text-muted-foreground">
                右下のボタンをタップすると、コインくんとおはなしできるよ。おてつだいのコツをおしえてくれるよ！
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* おや向け */}
      <Card className="mb-4 border-violet-200">
        <CardHeader>
          <CardTitle className="text-base text-violet-700">
            👨‍👩‍👧‍👦 おやの画面
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-lg">⏳</span>
            <div>
              <p className="font-semibold">承認待ち</p>
              <p className="text-muted-foreground">
                子どもが「できた！」を押したお手伝いが表示されます。内容を確認して承認または却下しましょう
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">💰</span>
            <div>
              <p className="font-semibold">子どもの残高</p>
              <p className="text-muted-foreground">
                各子どもの「つかえるお金」「ちょきん」の残高と貯蓄率が一覧で確認できます
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">📋</span>
            <div>
              <p className="font-semibold">タスク管理</p>
              <p className="text-muted-foreground">
                お手伝いの追加・編集・削除ができます。報酬額、繰り返し設定（毎日/毎週/1回）、担当の子どもを設定できます
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">💬</span>
            <div>
              <p className="font-semibold">AIアドバイザー</p>
              <p className="text-muted-foreground">
                右下のチャットボタンから、お手伝い教育や報酬設定についてAIに相談できます
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="mb-4 border-gray-200">
        <CardHeader>
          <CardTitle className="text-base text-gray-700">
            ❓ よくあるしつもん
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-semibold">Q. 報酬の金額はどれくらいがいい？</p>
            <p className="text-muted-foreground">
              A.
              年齢や難易度に応じて30円〜500円程度がおすすめです。簡単なもの（靴揃え30円）から難しいもの（お風呂掃除300円）まで段階をつけましょう
            </p>
          </div>
          <div>
            <p className="font-semibold">
              Q. ちょきんと「つかえるお金」のわりあいは？
            </p>
            <p className="text-muted-foreground">
              A.
              ウォレットの分配比率で設定できます。最初は「つかえるお金70%：ちょきん30%」がおすすめです
            </p>
          </div>
          <div>
            <p className="font-semibold">
              Q. 子どもが勝手に「できた！」を押したら？
            </p>
            <p className="text-muted-foreground">
              A.
              親の承認がないとコインは付与されません。必ず確認してから承認してください
            </p>
          </div>
          <div>
            <p className="font-semibold">Q. 家族を追加したい</p>
            <p className="text-muted-foreground">
              A.
              現在は管理者がデータベースから追加します。今後のアップデートで画面から追加できるようにする予定です
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center pb-8">
        <Button
          className="bg-amber-500 hover:bg-amber-600 text-white"
          onClick={() => router.push("/")}
        >
          トップにもどる
        </Button>
      </div>
    </div>
  );
}
