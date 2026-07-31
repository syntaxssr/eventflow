import localFont from "next/font/local"

/**
 * LINE Seed Sans TH — ฟอนต์หลักของ EventFlow (self-host เพื่อไม่พึ่ง external CDN)
 *
 * ฟอนต์มีน้ำหนักจริง 100 / 400 / 700 / 800 / 900
 * เบราว์เซอร์จะจับคู่ `font-medium` (500) → Regular และ `font-semibold` (600) → Bold
 * ตาม CSS font matching algorithm ซึ่งให้ผลที่คาดเดาได้
 *
 * fallback stack ถูกกำหนดไว้ใน `--font-sans` (globals.css) เพื่อรองรับกรณีโหลดฟอนต์ไม่สำเร็จ
 */
export const lineSeedSansTH = localFont({
  src: [
    {
      path: "../assets/fonts/LINESeedSansTH-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../assets/fonts/LINESeedSansTH-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/LINESeedSansTH-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/LINESeedSansTH-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../assets/fonts/LINESeedSansTH-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-line-seed",
  display: "swap",
  preload: true,
  fallback: [
    "Noto Sans Thai",
    "IBM Plex Sans Thai",
    "Segoe UI",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
  adjustFontFallback: false,
})
