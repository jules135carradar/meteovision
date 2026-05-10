import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180, height: 180,
        background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Outer ring */}
      <div style={{
        position: "absolute", width: 164, height: 164, top: 8, left: 8,
        borderRadius: "50%", border: "3px solid rgba(5,150,105,0.3)",
      }} />
      {/* Inner ring */}
      <div style={{
        position: "absolute", width: 96, height: 96, top: 42, left: 42,
        borderRadius: "50%", border: "4px solid rgba(5,150,105,0.5)",
      }} />
      {/* Top ray */}
      <div style={{ position: "absolute", width: 14, height: 34, top: 8,  left: 83, background: "#059669", borderRadius: 6 }} />
      {/* Bottom ray */}
      <div style={{ position: "absolute", width: 14, height: 34, top: 138, left: 83, background: "#059669", borderRadius: 6 }} />
      {/* Left ray */}
      <div style={{ position: "absolute", height: 14, width: 34, top: 83, left: 8,  background: "#059669", borderRadius: 6 }} />
      {/* Right ray */}
      <div style={{ position: "absolute", height: 14, width: 34, top: 83, left: 138, background: "#059669", borderRadius: 6 }} />
      {/* Dots on rings */}
      <div style={{ position: "absolute", width: 14, height: 14, top: 35,  left: 83,  borderRadius: "50%", background: "#059669", opacity: 0.6 }} />
      <div style={{ position: "absolute", width: 14, height: 14, top: 131, left: 83,  borderRadius: "50%", background: "#059669", opacity: 0.6 }} />
      <div style={{ position: "absolute", width: 14, height: 14, top: 83,  left: 35,  borderRadius: "50%", background: "#059669", opacity: 0.6 }} />
      <div style={{ position: "absolute", width: 14, height: 14, top: 83,  left: 131, borderRadius: "50%", background: "#059669", opacity: 0.6 }} />
      {/* Center circle */}
      <div style={{ position: "absolute", width: 40, height: 40, top: 70, left: 70, borderRadius: "50%", background: "#059669" }} />
    </div>,
    { ...size }
  );
}
