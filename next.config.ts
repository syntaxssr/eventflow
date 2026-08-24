import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ปิดปุ่ม dev indicator มุมจอ — มันลอยทับ Bottom Navigation บนจอมือถือ
  // และทำให้ E2E คลิกเมนูล่างไม่ได้ (มีผลเฉพาะ dev ไม่กระทบ production)
  devIndicators: false,

  // แบบฟอร์ม RSVP ย้ายเข้ากลุ่ม "แบบฟอร์ม" — ลิงก์เก่าที่แชร์กันไว้ยังใช้ได้
  async redirects() {
    return [{ source: "/rsvp-form", destination: "/forms/rsvp", permanent: false }]
  },
};

export default nextConfig;
