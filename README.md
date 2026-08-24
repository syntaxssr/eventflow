# EventFlow

**Interactive Frontend Prototype** — ระบบบริหาร วางแผน และประสานงานกิจกรรมภายในองค์กร

EventFlow รวบรวมทุกอย่างที่ทีมจัดกิจกรรมต้องใช้ไว้ในที่เดียว ตั้งแต่กำหนดการ งานย่อยและผู้รับผิดชอบ Checklist ไทม์ไลน์ ไฟล์เอกสาร รายชื่อผู้เข้าร่วม ไปจนถึงความคิดเห็นและการแจ้งเตือน — ทุกเมนู ทุกปุ่ม ทุกฟอร์มกดใช้งานได้จริง แม้ยังไม่มี Backend

> โปรเจกต์นี้เป็น **Frontend Prototype เท่านั้น** — ไม่มี Backend, ไม่มี Database, ไม่เรียก API จริง ข้อมูลทั้งหมดเป็น Mock Data ในหน่วยความจำ

## Features

- **Dashboard** — สถิติงาน/กิจกรรม, Progress, Donut Chart สรุปสถานะงาน, สรุป RSVP, ไฟล์และความเคลื่อนไหวล่าสุด
- **Event Management** — สร้าง/แก้ไข/คัดลอก (Duplicate พร้อมหน้าตรวจสอบ)/ยกเลิก/ลบกิจกรรม พร้อม 6 สถานะ
- **Tasks** — 3 มุมมอง (Table / Kanban ลากวางได้ / Calendar), ผู้รับผิดชอบหลายคน, Priority, Dependency + Blocking พร้อมกันวงกลม, Overdue/Due Soon badge
- **Checklist** — ติ๊กครบแล้วงานเสร็จอัตโนมัติ และคำนวณ Progress ของกิจกรรมใหม่ทันที
- **Timeline** — 3 มุมมอง (Vertical / Calendar / Gantt พร้อมเส้น dependency), แบ่งช่วงก่อนงาน–วันงาน–หลังงานอัตโนมัติ
- **Files** — อัปโหลดแบบลากวาง, Progress/Retry/Cancel, Preview ตามประเภท, Version History + Restore, หมวดหมู่, Trash แบบนับถอยหลัง 30 วัน
- **Participants** — ตาราง + สรุป RSVP, Bulk change, **Import Excel 5 ขั้น** (Mapping → ตรวจ error รายแถว → Conflict Resolution แบบเลือกทั้งชุด) และ Export Excel
- **Collaboration** — Comment แบบ Thread, Mention ด้วย `@`, แนบไฟล์, Emoji Reaction
- **Notifications** — กระดิ่ง + หน้ารวม + ตั้งค่ารายประเภท (ปิดแล้วไม่สร้างการแจ้งเตือนจริง) ครอบคลุม 9 เหตุการณ์
- **Global Search** — Command Palette (`Ctrl/Cmd + K`) ค้นทุกแหล่งข้อมูล คลิกแล้วเปิดของจริงให้ทันที
- **Export** — PDF สรุปกิจกรรม และ Excel แยกชีต (สร้างไฟล์จริงจากข้อมูล mock)
- **Activity History** — บันทึกทุกการเปลี่ยนแปลง พร้อมตัวกรองครบและค่าก่อน–หลัง
- **TH/EN + Light/Dark** — สลับได้ทุกหน้า รวมถึงเนื้อหา Mock Data
- **Accessibility** — Keyboard navigation, focus ring, ARIA, WCAG AA contrast, `prefers-reduced-motion`

## Technology Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix) + lucide-react |
| State | React Context + `useReducer` (in-memory store) |
| Forms | react-hook-form + zod |
| Drag & Drop | dnd-kit |
| Charts | Recharts |
| Excel / PDF | SheetJS (xlsx) / jsPDF + jspdf-autotable |
| Font | LINE Seed Sans TH (self-host) |
| Testing | Vitest + React Testing Library / Playwright |

## Installation

```bash
npm install
```

## Commands

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | เปิด dev server ที่ http://localhost:3001 |
| `npm run build` | สร้าง production build |
| `npm start` | รัน production build |
| `npm run lint` | ตรวจ ESLint |
| `npm run typecheck` | ตรวจ TypeScript |
| `npm run test` | รัน Unit tests (Vitest) |
| `npm run e2e` | รัน Playwright E2E (เปิด dev server ให้อัตโนมัติ) |
| `npm run e2e:install` | ติดตั้ง Chromium สำหรับ Playwright ครั้งแรก |

## Mock Accounts

เข้าสู่ระบบด้วยบัญชีทดลอง (รหัสผ่านเดียวกันทุกบัญชี: **`eventflow`**)

| อีเมล | บทบาท |
|---|---|
| `paweena.s@company.co.th` | Event Manager |
| `thanakrit.w@company.co.th` | Creative Designer |
| `siriporn.j@company.co.th` | HR Coordinator |
| `anucha.p@company.co.th` | IT Support |
| `kamonchanok.r@company.co.th` | Finance Coordinator |
| `nattawut.s@company.co.th` | MC Coordinator |
| `pimchanok.a@company.co.th` | Venue Coordinator |

หน้า Login มีกล่อง "บัญชีทดลองใช้งาน" ให้กดกรอกอัตโนมัติ และสลับผู้ใช้ได้จาก Profile Menu โดยไม่ต้อง login ใหม่

ไฟล์ตัวอย่างสำหรับทดสอบ Import ผู้เข้าร่วม: `public/samples/participants-sample.xlsx` (มีแถวปกติ แถว error และอีเมลซ้ำ)

## Project Structure

```
src/
├── app/            # Next.js App Router — (auth)/login และ (app)/ 13 หน้า
├── components/     # ui (shadcn) · layout (Sidebar/Topbar/BottomNav) · common · dev
├── features/       # แยกตามโดเมน: events, tasks, timeline, files, participants,
│                   # comments, notifications, search, export, activity, profile
├── store/          # AppStoreProvider + reducer + selectors (in-memory)
├── mock/           # Mock Data ทุกชุด (users, events, tasks, ...)
├── i18n/           # LocaleProvider + dictionaries th/en
├── lib/            # Pure functions (progress, dependency, import, search, ...)
├── hooks/ constants/ types/
tests/
├── unit/           # Vitest
└── e2e/            # Playwright (รวม main-flow 15 ขั้น และ axe a11y audit)
```

## Deployment to Vercel

โปรเจกต์พร้อม deploy ได้ทันที ไม่ต้องตั้งค่า environment variable ใด ๆ

1. Push โค้ดขึ้น GitHub
2. [vercel.com/new](https://vercel.com/new) → Import repository
3. Vercel ตรวจพบ Next.js อัตโนมัติ → กด **Deploy**

หรือใช้ CLI: `npx vercel`

## Prototype Limitations

- **ไม่มี Backend / Database / API จริง** — การเพิ่ม แก้ไข ลบ ทำงานภายใน session ปัจจุบันเท่านั้น
- **จดจำการเข้าสู่ระบบ** — เมื่อเลือก “จดจำฉันไว้” ระบบเก็บเฉพาะ `userId`, เวลาเข้าสู่ระบบ และสถานะ remember ใน `localStorage` (ไม่เก็บอีเมลหรือรหัสผ่าน) และล้างทันทีเมื่อออกจากระบบ
- **ข้อมูล Mock Reset เมื่อ Refresh** — ข้อมูลกิจกรรม งาน และข้อมูลธุรกิจอื่นกลับเป็น Mock Data เริ่มต้น ส่วน session ที่เลือกจดจำไว้ยังคงอยู่
- **วันที่ในระบบตรึงไว้ที่ 31 ก.ค. 2026** (`MOCK_TODAY`) เพื่อให้ Overdue / Due Soon / นับถอยหลังถังขยะ คงที่และทดสอบซ้ำได้
- ความหน่วงของการบันทึกเป็นการจำลอง (300–1200ms) — ทดสอบ Loading/Error state ได้จากแผง "เครื่องมือทดสอบ" มุมจอ
- เนื้อหาไฟล์ไม่ได้ถูกเก็บจริง — การดาวน์โหลดสร้างไฟล์จากข้อมูล metadata (PDF/Excel เป็นไฟล์จริง) และ PDF Export ใช้ข้อความอังกฤษ (ฟอนต์ไทย woff2 ฝังใน jsPDF ไม่ได้)
