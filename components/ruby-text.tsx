"use client";

import type { ReactNode } from "react";

// 手動ルビ: <R k="漢字" r="かんじ" />
export function R({ k, r }: { k: string; r: string }) {
  return (
    <ruby>
      {k}
      <rt className="text-[0.55em] leading-none text-inherit opacity-70">{r}</rt>
    </ruby>
  );
}

// 漢字→読みの辞書（お手伝い系の頻出漢字）
const RUBY_DICT: [string, string][] = [
  // 家事・掃除
  ["食器洗", "しょっきあら"],
  ["食器", "しょっき"],
  ["洗濯物", "せんたくもの"],
  ["洗濯", "せんたく"],
  ["洗車", "せんしゃ"],
  ["掃除機", "そうじき"],
  ["掃除", "そうじ"],
  ["片付", "かたづ"],
  ["整理整頓", "せいりせいとん"],
  ["床", "ゆか"],
  ["窓拭", "まどふ"],
  ["風呂", "ふろ"],
  ["浴室", "よくしつ"],
  ["玄関", "げんかん"],
  ["台拭", "だいふ"],
  ["布団", "ふとん"],
  ["拭", "ふ"],
  // 料理・食事
  ["料理", "りょうり"],
  ["配膳", "はいぜん"],
  ["箸並", "はしなら"],
  ["箸", "はし"],
  ["夕食", "ゆうしょく"],
  ["朝食", "ちょうしょく"],
  ["昼食", "ちゅうしょく"],
  ["夕飯", "ゆうはん"],
  // 外・庭
  ["芝刈", "しばか"],
  ["草取", "くさと"],
  ["草", "くさ"],
  ["雑草", "ざっそう"],
  ["水", "みず"],
  ["花", "はな"],
  ["植物", "しょくぶつ"],
  ["庭", "にわ"],
  ["落", "お"],
  ["葉", "は"],
  ["雪", "ゆき"],
  // 買い物・生活
  ["買", "か"],
  ["物", "もの"],
  ["靴揃", "くつそろ"],
  ["靴並", "くつなら"],
  ["靴", "くつ"],
  ["新聞", "しんぶん"],
  ["郵便", "ゆうびん"],
  ["手紙", "てがみ"],
  ["車", "くるま"],
  ["肩", "かた"],
  // ペット
  ["犬", "いぬ"],
  ["猫", "ねこ"],
  ["散歩", "さんぽ"],
  // 勉強
  ["宿題", "しゅくだい"],
  ["勉強", "べんきょう"],
  ["読書", "どくしょ"],
  ["本", "ほん"],
  ["時間割", "じかんわり"],
  ["学校", "がっこう"],
  ["準備", "じゅんび"],
  // 身の回り
  ["着替", "きが"],
  ["服", "ふく"],
  ["歯磨", "はみが"],
  ["歯", "は"],
  // その他
  ["分別", "ぶんべつ"],
  ["乾", "かわ"],
  ["収納", "しゅうのう"],
  ["承認", "しょうにん"],
  ["取", "と"],
  ["込", "こ"],
  ["直帰", "ちょっき"],
  ["案件", "あんけん"],
  ["現場", "げんば"],
  ["社内", "しゃない"],
  ["会議室", "かいぎしつ"],
  ["打", "う"],
  ["合", "あ"],
  ["終日", "しゅうじつ"],
  ["外出", "がいしゅつ"],
  ["来社", "らいしゃ"],
  ["接客", "せっきゃく"],
  ["在席", "ざいせき"],
  ["休", "やす"],
  ["出す", "だす"],
  ["燃", "も"],
];

// テキスト内の漢字を自動でルビ付きに変換
export function AutoRuby({ text }: { text: string }): ReactNode {
  if (!text) return null;

  // 辞書を長い順にソート（長い語を先にマッチさせる）
  const sorted = [...RUBY_DICT].sort((a, b) => b[0].length - a[0].length);

  const parts: { text: string; ruby?: string }[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let matched = false;
    for (const [kanji, reading] of sorted) {
      if (remaining.startsWith(kanji)) {
        parts.push({ text: kanji, ruby: reading });
        remaining = remaining.slice(kanji.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      // マッチしなかった1文字をそのまま追加
      if (parts.length > 0 && !parts[parts.length - 1].ruby) {
        parts[parts.length - 1].text += remaining[0];
      } else {
        parts.push({ text: remaining[0] });
      }
      remaining = remaining.slice(1);
    }
  }

  return (
    <>
      {parts.map((p, i) =>
        p.ruby ? (
          <ruby key={i}>
            {p.text}
            <rt className="text-[0.5em] text-inherit opacity-70">{p.ruby}</rt>
          </ruby>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  );
}
