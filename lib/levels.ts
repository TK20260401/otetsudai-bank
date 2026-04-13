/**
 * レベルアップシステム — 育成キャラクター
 *
 * 累計獲得額に基づくランク。
 * 対象: 未就学児〜中3（特別支援含む）— シンプルでわかりやすい名前。
 * 人型キャラクターが装備を纏って成長していく。
 */

export type Level = {
  level: number;
  title: string;
  icon: string;
  minAmount: number;
  /** キャラクターの見た目（人型の成長段階） */
  character: string;
  /** 装備・外見の説明 */
  appearance: string;
  /** キャラクターのセリフ（通常時） */
  greeting: string;
  /** セリフ（活発時：直近3日以内にクエストクリア） */
  greetingActive: string;
  /** セリフ（さみしい時：3日以上クエストなし） */
  greetingLonely: string;
};

export const LEVELS: Level[] = [
  {
    level: 1, title: "かけだしぼうけんしゃ", icon: "🗡️", minAmount: 0,
    character: "👶",
    appearance: "ぬののふく",
    greeting: "ぼうけん、はじめるよ！",
    greetingActive: "やったー！クエストたのしい！",
    greetingLonely: "いっしょに ぼうけん しようよ〜",
  },
  {
    level: 2, title: "みならいきし", icon: "🛡️", minAmount: 1000,
    character: "🧒",
    appearance: "かわのよろい",
    greeting: "おてつだい、まかせて！",
    greetingActive: "きょうも がんばるぞ！",
    greetingLonely: "クエスト、ないのかな…？",
  },
  {
    level: 3, title: "クエストナイト", icon: "⚔️", minAmount: 3000,
    character: "🧑",
    appearance: "てつのよろい",
    greeting: "いちにんまえの きし だ！",
    greetingActive: "つぎのクエストも クリアするぞ！",
    greetingLonely: "たまには クエストに でかけたいな…",
  },
  {
    level: 4, title: "シルバーマスター", icon: "🥈", minAmount: 5000,
    character: "🧝",
    appearance: "ぎんのよろい＋マント",
    greeting: "みんなの ちからに なりたい！",
    greetingActive: "ぎんの ちからが みなぎる！",
    greetingLonely: "マントが ほこりを かぶってきた…",
  },
  {
    level: 5, title: "ゴールドマスター", icon: "🥇", minAmount: 10000,
    character: "🦸",
    appearance: "きんのよろい＋えいゆうのマント",
    greeting: "でんせつは ここから はじまる！",
    greetingActive: "きんいろに かがやいてるよ！",
    greetingLonely: "えいゆうも やすみは ひつようだけど…",
  },
  {
    level: 6, title: "プラチナヒーロー", icon: "💎", minAmount: 30000,
    character: "🧙",
    appearance: "かがやく よろい＋けんじゃのつえ",
    greeting: "おうこくの へいわは まかせろ！",
    greetingActive: "つえの ちからが あふれてる！",
    greetingLonely: "つえの ひかりが よわまってきた…",
  },
  {
    level: 7, title: "でんせつのゆうしゃ", icon: "👑", minAmount: 50000,
    character: "👑",
    appearance: "おうかん＋せいけん",
    greeting: "せかいを すくった でんせつの ゆうしゃ！",
    greetingActive: "でんせつは まだまだ つづく！",
    greetingLonely: "ゆうしゃも たまには さみしいんだ…",
  },
];

/** 累計獲得額から現在のレベルを取得 */
export function getCurrentLevel(totalEarned: number): Level {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (totalEarned >= level.minAmount) {
      current = level;
    } else {
      break;
    }
  }
  return current;
}

/** 次のレベルまでの進捗（0〜100） */
export function getLevelProgress(totalEarned: number): {
  current: Level;
  next: Level | null;
  progress: number;
  remaining: number;
} {
  const current = getCurrentLevel(totalEarned);
  const currentIndex = LEVELS.indexOf(current);
  const next = currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;

  if (!next) {
    return { current, next: null, progress: 100, remaining: 0 };
  }

  const range = next.minAmount - current.minAmount;
  const earned = totalEarned - current.minAmount;
  const progress = Math.min(Math.round((earned / range) * 100), 100);
  const remaining = next.minAmount - totalEarned;

  return { current, next, progress, remaining };
}
