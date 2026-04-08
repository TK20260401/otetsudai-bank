import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sizeParam = searchParams.get("size") === "512" ? 512 : 192;

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: sizeParam * 0.6,
          background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: sizeParam * 0.2,
        }}
      >
        🪙
      </div>
    ),
    { width: sizeParam, height: sizeParam }
  );
}
