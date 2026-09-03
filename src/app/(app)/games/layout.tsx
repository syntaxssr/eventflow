import { GamesLayoutGrid } from "@/features/games/games-layout-grid"
import { PresentationModeProvider } from "@/features/games/presentation-mode-provider"
import { QuizRoomProvider } from "@/features/games/quiz-room-provider"

/**
 * โซนเกมส์ = 2 การ์ดเสมอ — เกมที่กำลังเล่นทางซ้าย คนในห้องทางขวา
 *
 * ห้องอยู่บน layout จึงไม่หลุดเวลาเปลี่ยนหน้าเกม รายชื่อผู้เล่นคงอยู่ตลอดงาน
 * โหมดเต็มจอก็อยู่บนนี้เช่นกัน เพื่อให้ครอบทั้งสองการ์ดพร้อมกันได้
 */
export default function GamesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QuizRoomProvider>
      <PresentationModeProvider>
        <GamesLayoutGrid>{children}</GamesLayoutGrid>
      </PresentationModeProvider>
    </QuizRoomProvider>
  )
}
