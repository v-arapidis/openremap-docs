import { ImageResponse } from "next/og";

export const alt = "OpenRemap Docs — the wiki for the open-source ECU binary toolkit";
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
          justifyContent: "center",
          padding: "88px 96px",
          background: "#0a0a0f",
          color: "#f5f5f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 18,
              background: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* simple "OR" mark */}
            <div
              style={{
                color: "#0a0a0f",
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              OR
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 52,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            OpenRemap
            <span style={{ color: "#10b981" }}> Docs</span>
          </div>
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 30,
            lineHeight: 1.4,
            color: "#a3a3a3",
            maxWidth: 940,
          }}
        >
          The wiki for the open-source ECU binary toolkit — guides, command
          reference, concepts, and manufacturer internals.
        </div>
      </div>
    ),
    { ...size },
  );
}
