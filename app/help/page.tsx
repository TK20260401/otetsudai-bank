"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { R } from "@/components/ruby-text";

export default function HelpPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
          ← もどる
        </Button>
        <h1 className="text-2xl font-bold text-primary">📖 <R k="使" r="つか" />い<R k="方" r="かた" /></h1>
      </div>

      {/* クイックスタート */}
      <Card className="mb-6 border-primary/40 bg-primary/10">
        <CardHeader>
          <CardTitle className="text-lg text-primary">
            🚀 かんたん3ステップ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <p className="font-semibold">おうちを<R k="選" r="えら" />んでログイン</p>
                <p className="text-sm text-muted-foreground">
                  トップ<R k="画面" r="がめん" />でおうちを<R k="選" r="えら" />んで、<R k="自分" r="じぶん" />の<R k="名前" r="なまえ" />をタップしよう
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <p className="font-semibold">クエストをやろう</p>
                <p className="text-sm text-muted-foreground">
                  クエストリストからできることを<R k="選" r="えら" />んで「クリア！」を<R k="押" r="お" />そう
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <p className="font-semibold">コインをためよう</p>
                <p className="text-sm text-muted-foreground">
                  おうちの<R k="人" r="ひと" />が<R k="認" r="みと" />めたら、コインがもらえるよ！<R k="貯金" r="ちょきん" />もできるよ
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* こども向け */}
      <Card className="mb-4 border-primary/30">
        <CardHeader>
          <CardTitle className="text-base text-primary">
            🧒 <R k="子" r="こ" />どもの<R k="画面" r="がめん" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-lg">🐷</span>
            <div>
              <p className="font-semibold"><R k="貯金箱" r="ちょきんばこ" /></p>
              <p className="text-muted-foreground">
                <R k="今" r="いま" />のお<R k="金" r="かね" />がわかるよ。「<R k="使" r="つか" />えるお<R k="金" r="かね" />」と「<R k="貯金" r="ちょきん" />」にわかれているよ
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">📋</span>
            <div>
              <p className="font-semibold">クエストリスト</p>
              <p className="text-muted-foreground">
                できるクエストが<R k="並" r="なら" />んでいるよ。アイコンを<R k="見" r="み" />れば、<R k="何" r="なに" />をするかすぐわかるね
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">✅</span>
            <div>
              <p className="font-semibold">「クリア！」ボタン</p>
              <p className="text-muted-foreground">
                クエストをクリアしたらタップ！おうちの<R k="人" r="ひと" />が<R k="認" r="みと" />めたらコインがもらえるよ
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">📜</span>
            <div>
              <p className="font-semibold"><R k="履歴" r="りれき" /></p>
              <p className="text-muted-foreground">
                <R k="今" r="いま" />までもらったコインや、<R k="使" r="つか" />ったコインの<R k="記録" r="きろく" />が<R k="見" r="み" />られるよ
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">🪙</span>
            <div>
              <p className="font-semibold">コインくん（AIアシスタント）</p>
              <p className="text-muted-foreground">
                <R k="右下" r="みぎした" />のボタンをタップすると、コインくんとお<R k="話" r="はなし" />できるよ。クエストのコツを<R k="教" r="おし" />えてくれるよ！
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* おや向け */}
      <Card className="mb-4 border-accent/30">
        <CardHeader>
          <CardTitle className="text-base text-accent">
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
            <span className="text-lg">🪙</span>
            <div>
              <p className="font-semibold">子どもの残高</p>
              <p className="text-muted-foreground">
                各子どもの「使えるお金」「貯金」の残高と貯蓄率が一覧で確認できます
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">📋</span>
            <div>
              <p className="font-semibold">クエスト管理</p>
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
      <Card className="mb-4 border-border">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
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
              Q. <R k="貯金" r="ちょきん" />と「<R k="使" r="つか" />えるお<R k="金" r="かね" />」の<R k="割合" r="わりあい" />は？
            </p>
            <p className="text-muted-foreground">
              A.
              ウォレットの分配比率で設定できます。最初は「使えるお金70%：貯金30%」がおすすめです
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
            <p className="font-semibold">Q. ページを更新（リロード）したらTOP画面に戻った</p>
            <p className="text-muted-foreground">
              A. セキュリティのため、ブラウザのリロード（再読み込み）をするとTOP画面に戻る仕様です。ログイン画面から再度ログインしてください
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
          className="bg-primary hover:bg-accent text-primary-foreground"
          onClick={() => router.push("/")}
        >
          トップにもどる
        </Button>
      </div>
    </div>
  );
}
