import { ImageResponse } from "next/og";

export const runtime = "edge";

/**
 * OGP画像を動的生成するエンドポイント (1200x630 PNG)
 * Facebook/X/LINE/Slack/Discord/note等すべてのSNSでシェアカード表示
 *
 * 使い方:
 *   <meta property="og:image" content="https://otetsudai-bank-beta.vercel.app/api/og" />
 *
 * タイトル/サブを変えたい場合:
 *   /api/og?title=XXX&sub=YYY
 */

async function loadGoogleFont(family: string, weight: number, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!match) throw new Error("Failed to find font url in Google Fonts CSS");
  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) throw new Error(`Failed to fetch font: ${fontRes.status}`);
  return await fontRes.arrayBuffer();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "おこづかいクエスト";
  const sub = searchParams.get("sub") ?? "お手伝いをクエストに";
  const version = searchParams.get("v") ?? "v0.19.0 プロトタイプ";

  const allText = title + sub + version + "⚔🪙🐾🏆";

  let fontBold: ArrayBuffer | null = null;
  let fontRegular: ArrayBuffer | null = null;
  try {
    fontBold = await loadGoogleFont("Noto Sans JP", 900, allText);
    fontRegular = await loadGoogleFont("Noto Sans JP", 500, allText);
  } catch {
    // フォント取得失敗してもレンダリング継続
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1f0f31 0%, #2a1a4d 50%, #1f0f31 100%)",
          position: "relative",
          padding: "60px 80px",
        }}
      >
        {/* 上部ゴールド装飾バー */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            background: "linear-gradient(90deg, #8A5200 0%, #FFA623 30%, #FFE066 50%, #FFA623 70%, #8A5200 100%)",
          }}
        />
        {/* 下部ゴールド装飾バー */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 12,
            background: "linear-gradient(90deg, #8A5200 0%, #FFA623 30%, #FFE066 50%, #FFA623 70%, #8A5200 100%)",
          }}
        />

        {/* 背景グリッド（ダンジョン感） */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(79,42,147,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(79,42,147,0.2) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            opacity: 0.4,
          }}
        />

        {/* コーナー装飾（宝石4つ） */}
        {[
          { top: 30, left: 30 },
          { top: 30, right: 30 },
          { bottom: 30, left: 30 },
          { bottom: 30, right: 30 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...pos,
              width: 20,
              height: 20,
              display: "flex",
              background: "radial-gradient(circle, #FFE066 30%, #FFA623 60%, #8A5200 100%)",
              borderRadius: 4,
              boxShadow: "0 0 12px #FFA623",
            }}
          />
        ))}

        {/* 左: ピクセルコイン */}
        <div
          style={{
            position: "absolute",
            left: 110,
            top: "50%",
            transform: "translateY(-50%)",
            width: 180,
            height: 180,
            display: "flex",
            borderRadius: 90,
            background: "radial-gradient(circle at 35% 30%, #FFE066 20%, #FFA623 55%, #8A5200 100%)",
            boxShadow: "0 0 40px rgba(255,166,35,0.6), inset 0 -8px 16px rgba(0,0,0,0.3)",
            alignItems: "center",
            justifyContent: "center",
            color: "#8A5200",
            fontSize: 120,
            fontWeight: 900,
          }}
        >
          ¥
        </div>

        {/* 右: ピクセル剣 */}
        <div
          style={{
            position: "absolute",
            right: 110,
            top: "50%",
            transform: "translateY(-50%) rotate(25deg)",
            width: 60,
            height: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* 刃 */}
          <div
            style={{
              width: 20,
              height: 140,
              display: "flex",
              background: "linear-gradient(180deg, #E0E8F0 0%, #A8B0BC 100%)",
              boxShadow: "0 0 20px rgba(224,232,240,0.4)",
            }}
          />
          {/* ツバ */}
          <div
            style={{
              width: 60,
              height: 16,
              display: "flex",
              background: "linear-gradient(180deg, #FFE066 0%, #FFA623 50%, #8A5200 100%)",
            }}
          />
          {/* 柄 */}
          <div
            style={{
              width: 16,
              height: 40,
              display: "flex",
              background: "linear-gradient(180deg, #8A5200 0%, #5C3A1E 100%)",
            }}
          />
        </div>

        {/* センターテキスト */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            zIndex: 2,
          }}
        >
          {/* バージョンバッジ */}
          <div
            style={{
              display: "flex",
              padding: "8px 20px",
              background: "rgba(107,76,219,0.4)",
              border: "2px solid #6b4cdb",
              borderRadius: 20,
              color: "#b79bff",
              fontSize: 22,
              fontWeight: 500,
              marginBottom: 28,
            }}
          >
            {version}
          </div>

          {/* メインタイトル */}
          <div
            style={{
              display: "flex",
              fontSize: 108,
              fontWeight: 900,
              color: "#ffa623",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              textShadow: "0 4px 0 #8a5200, 0 0 40px rgba(255,166,35,0.6)",
            }}
          >
            {title}
          </div>

          {/* サブタイトル */}
          <div
            style={{
              display: "flex",
              fontSize: 44,
              fontWeight: 500,
              color: "#f5f5f5",
              marginTop: 24,
              textShadow: "0 2px 8px rgba(0,0,0,0.6)",
            }}
          >
            {sub}
          </div>

          {/* URL */}
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#a090c0",
              marginTop: 40,
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            otetsudai-bank-beta.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        ...(fontBold
          ? [{ name: "Noto Sans JP", data: fontBold, weight: 900 as const, style: "normal" as const }]
          : []),
        ...(fontRegular
          ? [{ name: "Noto Sans JP", data: fontRegular, weight: 500 as const, style: "normal" as const }]
          : []),
      ],
    }
  );
}
