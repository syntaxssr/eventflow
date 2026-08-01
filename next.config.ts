import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ปิดปุ่ม dev indicator มุมจอ — มันลอยทับ Bottom Navigation บนจอมือถือ
  // และทำให้ E2E คลิกเมนูล่างไม่ได้ (มีผลเฉพาะ dev ไม่กระทบ production)
  devIndicators: false,
};

export default nextConfig;
