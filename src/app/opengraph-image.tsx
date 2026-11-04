import { ImageResponse } from "next/og";

export const alt = "WordMelo — online writing tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(145deg, #EEF2F5 0%, #E4ECEF 45%, #D9EFED 100%)",
          color: "#122033",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: "-0.03em",
          }}
        >
          <span>Word</span>
          <span style={{ color: "#0F6F6A" }}>Melo</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              maxWidth: 900,
            }}
          >
            Count words clearly. Write with quieter tools.
          </div>
          <div style={{ fontSize: 28, color: "#5B6778", maxWidth: 820 }}>
            Privacy-first writing utilities that run in your browser.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#0F6F6A" }}>
          wordmelo.com
        </div>
      </div>
    ),
    { ...size },
  );
}
