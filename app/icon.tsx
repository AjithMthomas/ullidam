import { ImageResponse } from "next/og";
import { theme } from "@/theme";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** The arched doorway with its light, drawn in the current theme (see theme.ts). */
export function BrandMark({ scale }: { scale: number }) {
  const s = (n: number) => n * scale;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.primary,
        borderRadius: s(16),
      }}
    >
      <svg width={s(44)} height={s(44)} viewBox="0 0 32 32">
        <path d="M10 25V15.5a6 6 0 0 1 12 0V25" fill="none" stroke={theme.onPrimary} strokeWidth="2" strokeLinecap="round" />
        <path d="M7.5 25h17" fill="none" stroke={theme.onPrimary} strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="19" r="2.25" fill={theme.tertiary} />
      </svg>
    </div>
  );
}

export default function Icon() {
  return new ImageResponse(<BrandMark scale={1} />, size);
}
