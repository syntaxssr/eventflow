import { GamesShell } from "@/features/games/games-shell"
import { PresentationModeProvider } from "@/features/games/presentation-mode-provider"
import { QuizRoomProvider } from "@/features/games/quiz-room-provider"

/**
 * โซนเกมส์ = 3 การ์ดตายตัวเสมอ — แถบควบคุมบนสุด, เกมที่กำลังเล่นซ้าย, คนในห้องขวา
 *
 * ห้องกับโหมดเต็มจออยู่บน layout จึงไม่หลุดเวลาเปลี่ยนหน้าเกม — สลับเกม
 * ในหน้า /games/* คือการเปลี่ยนแค่เนื้อหาในการ์ดเกม โครง 3 การ์ดไม่ขยับ
 */
export default function GamesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QuizRoomProvider>
      <PresentationModeProvider>
        <GamesShell>{children}</GamesShell>
      </PresentationModeProvider>
    </QuizRoomProvider>
  )
}
