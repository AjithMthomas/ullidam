import { ImageResponse } from "next/og";
import { theme } from "@/theme";

// The WhatsApp / social link preview for /diaspora. Most people abroad will
// meet this page as a forwarded link, often from family, so the preview is
// warm and discreet: no clinical words that could expose the recipient.
export const alt = "Ullidam: a space to talk, in Malayalam, for Malayalis living abroad.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: theme.primary,
          color: theme.onPrimary,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, letterSpacing: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: theme.glow }} />
          ULLIDAM
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, lineHeight: 1.05, maxWidth: 900 }}>A space to talk, in Malayalam.</div>
          <div style={{ fontSize: 34, opacity: 0.82, maxWidth: 860 }}>
            For Malayalis living abroad. Private, online, at a time that suits you.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
