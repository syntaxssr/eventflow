/**
 * โซนของผู้เข้าร่วมงาน — เข้าด้วย PIN ไม่ต้องมีบัญชีและไม่ผ่าน AuthGuard
 */
export default function PlayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex min-h-svh flex-col">{children}</div>
}
