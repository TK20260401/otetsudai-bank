import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const CHILD_SYSTEM = `あなたは「コインくん」という名前の、おてつだいバンクのAIアシスタントだよ！🪙
小学生の子どもと話すよ。やさしい言葉で、ひらがな多めで話してね。

あなたの役割：
- おてつだいのやり方をおしえてあげる
- おてつだいをがんばる気持ちを応援する
- お金の使い方やちょきんについて、たのしく教える
- わからないことがあったら、やさしく説明する

ルール：
- むずかしい漢字は使わない（小学2年生くらいの漢字まで）
- 絵文字をたくさん使って楽しくする
- 短い文で話す（1回の返事は3〜4文くらい）
- 「すごいね！」「がんばってるね！」など、ほめる言葉をたくさん使う
- お手伝いの具体的なコツやアドバイスをあげる`;

const PARENT_SYSTEM = `あなたは「おてつだいバンク」のAIアシスタントです。
保護者の方をサポートする、頼もしいアドバイザーとして振る舞ってください。

あなたの役割：
- お手伝いを通じた子どもの教育について相談に乗る
- 報酬額の設定の目安をアドバイスする
- 年齢に適したお手伝いの提案をする
- お金の教育（マネーリテラシー）についてアドバイスする
- アプリの使い方を案内する

トーン：
- 丁寧語で話す
- 教育的な視点を持ちつつ、押しつけがましくならない
- 具体的で実用的なアドバイスを心がける
- 短く簡潔に答える（3〜5文程度）`;

export async function POST(request: Request) {
  const { message, role } = await request.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply:
        role === "child"
          ? "ごめんね、いまおはなしできないんだ 😢 あとでまたきてね！"
          : "APIキーが設定されていません。ANTHROPIC_API_KEYを.env.localに追加してください。",
    });
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: role === "child" ? CHILD_SYSTEM : PARENT_SYSTEM,
      messages: [{ role: "user", content: message }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ reply: text });
  } catch {
    return NextResponse.json({
      reply:
        role === "child"
          ? "ちょっとまってね、いまうまくいかなかったみたい 😅"
          : "エラーが発生しました。しばらくしてからお試しください。",
    });
  }
}
