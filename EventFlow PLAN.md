# EventFlow — Development Plan

แผนพัฒนา **EventFlow** — Interactive Frontend Prototype สำหรับระบบบริหาร วางแผน และประสานงานกิจกรรมภายในองค์กร

> เอกสารนี้เป็นแผนหลักของโปรเจกต์ อ้างอิงจาก `concept.md` ทั้งหมด
> สถานะ: `[ ]` ยังไม่เริ่ม · `[~]` กำลังทำ · `[x]` เสร็จแล้ว

---

## สารบัญ

- [A. Technical Decisions](#a-technical-decisions)
- [B. Data Model Overview](#b-data-model-overview)
- [C. Project Structure](#c-project-structure)
- [D. Phase Overview](#d-phase-overview)
- [Phase 0 — Project Setup & Design System](#phase-0--project-setup--design-system)
- [Phase 1 — Authentication & Application Shell](#phase-1--authentication--application-shell)
- [Phase 2 — Dashboard](#phase-2--dashboard)
- [Phase 3 — Event Management](#phase-3--event-management)
- [Phase 4 — Task, Kanban & Checklist](#phase-4--task-kanban--checklist)
- [Phase 5 — Timeline, Calendar & Gantt](#phase-5--timeline-calendar--gantt)
- [Phase 6 — File Management, Version History & Trash](#phase-6--file-management-version-history--trash)
- [Phase 7 — Participants & Excel Import](#phase-7--participants--excel-import)
- [Phase 8 — Collaboration & Notifications](#phase-8--collaboration--notifications)
- [Phase 9 — Search, Export, Activity History & Profile](#phase-9--search-export-activity-history--profile)
- [Phase 10 — Accessibility, Responsive & Final QA](#phase-10--accessibility-responsive--final-qa)
- [E. Global Definition of Done](#e-global-definition-of-done)

---

## A. Technical Decisions

| หัวข้อ | เลือกใช้ | เหตุผล |
|---|---|---|
| Framework | Next.js (stable ล่าสุด) + App Router | ตาม requirement, พร้อม deploy Vercel |
| Language | TypeScript (`strict: true`) | Type safety, ต่อยอดเป็นระบบจริง |
| Styling | Tailwind CSS | ตาม requirement |
| UI Kit | shadcn/ui (Radix-based) | Accessible by default, ปรับแต่งได้ |
| Icons | lucide-react | คู่มาตรฐานของ shadcn/ui |
| State | React Context + `useReducer` (in-memory store) | ไม่มี Backend, reset เมื่อ refresh ตาม requirement |
| Persistence | **ไม่ใช้ `localStorage` / `sessionStorage` เลย** | ตาม requirement ข้อ 3 |
| Theme | Custom `ThemeProvider` (React state + `class` บน `<html>`) | ไม่ใช้ `next-themes` เพราะเขียน localStorage — default = System Theme |
| i18n | Custom `LocaleProvider` + dictionary (`th` / `en`) | เบา ควบคุมได้ ไม่ต้องมี route prefix, ครอบคลุม mock data |
| Forms | react-hook-form + zod | Validation + error message ผูกกับ field (a11y) |
| Toast | sonner (ผ่าน shadcn/ui) | Success / Warning / Error feedback |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable | Keyboard-accessible DnD (Kanban, Checklist, Timeline) |
| Charts | Recharts (ผ่าน shadcn/ui chart) | Dashboard visualization |
| Date | date-fns + locale `th` / `enUS` | คำนวณ overdue / due soon / countdown |
| Excel | SheetJS (`xlsx`) | Import/Export ผู้เข้าร่วมและรายงาน |
| PDF | jsPDF + jspdf-autotable | Mock PDF export จากข้อมูลจริงใน store |
| Font | `LINE Seed Sans TH` (self-host `next/font/local`) + fallback stack | ตาม requirement, กัน FOUT |
| Unit Test | Vitest + React Testing Library | เร็ว ตั้งค่าง่ายกับ Vite/Next |
| E2E | Playwright | ตาม requirement |

### กติกาสำคัญของ Prototype

1. **Mock "วันนี้"** — กำหนด `MOCK_TODAY` เป็นค่าคงที่ (เช่น `2026-07-31`) ใน `constants/` และใช้ผ่าน `getToday()` ทุกที่
   → ทำให้ Overdue / Due Soon / Trash countdown / Playwright test ได้ผลคงที่ (deterministic)
2. **Simulated latency** — helper `simulateDelay(ms)` (300–1200ms) ใช้ในทุก async action
3. **Simulated failure** — Dev Utility สั่งให้ action ถัดไป fail ได้ เพื่อทดสอบ Error State + Retry
4. **Bilingual mock data** — field ที่ผู้ใช้เห็นเก็บเป็น `{ th: string; en: string }` ผ่าน type `LocalizedText`
5. **ไม่มีการแบ่งสิทธิ์ตาม Role** — ผู้ใช้ทุกคนดู/แก้ไขได้ทั้งหมด (ตาม concept ข้อ 1)

---

## B. Data Model Overview

Type ทั้งหมดอยู่ใน `src/types/`

```
User            id, firstName, lastName, avatar, position, team, email
Event           id, title, description, startDate, endDate, startTime, endTime,
                location, ownerId, expectedAttendees, status, coverImage,
                createdAt, createdBy, updatedAt, updatedBy, deletedAt?
Task            id, eventId, title, description, assigneeIds[], startDate, dueDate,
                priority, status, notes, checklist[], attachmentIds[],
                dependsOn[], blocks[], createdAt/By, updatedAt/By
ChecklistItem   id, taskId, label, done, order
TimelineItem    id, eventId, phase(before|during|after), date, startTime, endTime,
                title, ownerIds[], location, readiness, note, linkedTaskId?
FileItem        id, eventId, name, categoryId, type, size, versions[],
                currentVersionId, uploadedBy, uploadedAt, deletedAt?, deletedBy?
FileVersion     id, versionNumber, filename, uploadedBy, uploadedAt, size, changeNote
FileCategory    id, name(LocalizedText), isDefault
Participant     id, eventId, firstName, lastName, email, department, phone,
                rsvpStatus, type, note
Comment         id, taskId, authorId, body, parentId?, mentions[], attachments[],
                createdAt, updatedAt?, isEdited, reactions[]
Notification    id, userId, type, title, body, link, isRead, createdAt, relatedIds
Activity        id, actorId, action, targetType, targetId, targetName, eventId,
                createdAt, before?, after?
NotificationSettings  userId, assignedTask, dueSoon, fileChange, mention, timelineChange
```

### Enums (ต้องมีทั้ง label TH/EN + สี + icon)

- `EventStatus` — `draft` · `planning` · `ready` · `in_progress` · `completed` · `cancelled`
- `TaskStatus` — `not_started` · `in_progress` · `awaiting_review` · `completed` · `blocked`
- `Priority` — `low` · `normal` · `high` · `urgent`
- `RsvpStatus` — `pending` · `attending` · `not_attending`
- `ParticipantType` — `employee` · `executive` · `speaker` · `external_guest` · `organizer`

### Derived / Business Rules (ทั้งหมดเป็น pure function → unit test ได้)

| Rule | ที่อยู่ | คำอธิบาย |
|---|---|---|
| Event Progress | `lib/progress.ts` | `tasks.completed / tasks.total * 100` (ไม่นับ checklist ตรง ๆ) |
| Checklist Auto Status | `lib/checklist.ts` | ครบทุกข้อ → task = `completed`; untick ≥1 ข้อ → `in_progress` |
| Overdue | `lib/dueDate.ts` | `dueDate < MOCK_TODAY && status !== completed` → badge (ไม่เปลี่ยน status) |
| Due Soon | `lib/dueDate.ts` | เหลือ ≤ 1 วัน |
| Circular Dependency | `lib/dependency.ts` | DFS ตรวจ cycle ก่อนบันทึกความสัมพันธ์ |
| Blocked Warning | `lib/dependency.ts` | dependency ยังไม่ completed → เตือน + ให้ Override ได้ |
| File Size Validation | `lib/file.ts` | > 50 MB → error message เข้าใจง่าย |
| Trash Countdown | `lib/trash.ts` | `30 - daysSince(deletedAt)` จาก `MOCK_TODAY` |
| Duplicate Email | `lib/import.ts` | เทียบ email แบบ case-insensitive + trim |
| Search / Filter | `lib/search.ts` | Global search + per-page filter/sort |

---

## C. Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Providers + font + metadata "EventFlow"
│   ├── (auth)/login/
│   └── (app)/
│       ├── layout.tsx             # Sidebar + Topbar + BottomNav
│       ├── dashboard/
│       ├── events/                # list · [id] · [id]/tasks · files · timeline · participants
│       ├── my-tasks/
│       ├── files/
│       ├── timeline/
│       ├── participants/
│       ├── notifications/
│       ├── activity/
│       ├── trash/
│       ├── profile/
│       └── settings/notifications/
│   └── design-system/             # หน้า QA ภายใน (ไม่อยู่ใน navigation หลัก)
├── components/
│   ├── ui/                        # shadcn/ui primitives
│   ├── layout/                    # Sidebar, Topbar, BottomNav, MobileDrawer
│   ├── common/                    # PageHeader, EmptyState, ErrorState, Skeletons,
│   │                              # StatusBadge, PriorityBadge, UserAvatar, ConfirmDialog
│   └── dev/                       # DevUtilityPanel (loading/empty/error toggle)
├── features/
│   ├── auth/ dashboard/ events/ tasks/ timeline/ files/
│   ├── participants/ import/ comments/ notifications/
│   ├── activity/ search/ export/ trash/ profile/
├── store/                         # AppStoreProvider + reducers + selectors
├── mock/                          # users, events, tasks, timeline, files, participants,
│                                  # comments, notifications, activities
├── i18n/                          # LocaleProvider, dictionaries/th.ts, dictionaries/en.ts
├── types/  lib/  hooks/  constants/
tests/
├── unit/                          # Vitest
└── e2e/                           # Playwright
```

**กติกา:** component ไฟล์เดียวไม่ควรเกิน ~200 บรรทัด — แตกเป็น sub-component เสมอ

---

## D. Phase Overview

| Phase | ชื่อ | ผลลัพธ์หลัก |
|---|---|---|
| 0 | Project Setup & Design System | โปรเจกต์รันได้ + token สี/ฟอนต์ + shadcn/ui + i18n + theme |
| 1 | Authentication & Application Shell | Login + Sidebar/BottomNav + Switch User + Dev Utility |
| 2 | Dashboard | Card/Chart/Progress + ข้อมูลงานเลี้ยงประจำปี |
| 3 | Event Management | List / Detail / Create / Edit / Duplicate / Cancel / Delete |
| 4 | Task, Kanban & Checklist | 3 Views + Checklist auto-status + Dependency + Overdue |
| 5 | Timeline, Calendar & Gantt | 3 Views + DnD/Resize + Confirmation |
| 6 | File Management & Version History | Upload / Preview / Version / Category / Trash |
| 7 | Participants & Excel Import | RSVP + Bulk + Import Flow + Conflict Resolution |
| 8 | Collaboration & Notifications | Comment/Reply/Mention/Attach + Bell/Page/Settings |
| 9 | Search, Export, Activity & Profile | Global Search + PDF/Excel Export + History + Profile |
| 10 | Accessibility, Responsive & Final QA | a11y audit + responsive + tests + README + Vercel |

> หลังจบแต่ละ Phase ให้ตรวจสอบและแก้ไขทันที **โดยไม่ต้องรอคำยืนยันจากผู้ใช้**

---

## Phase 0 — Project Setup & Design System

> **สถานะ: เสร็จแล้ว** · Next.js 16.2.12 · React 19.2.4 · Tailwind v4 · shadcn/ui (Radix, preset `nova`)

### UI
- [x] สร้างโปรเจกต์ Next.js (App Router, TypeScript, Tailwind, ESLint, `src/`)
- [x] ติดตั้ง shadcn/ui 34 components (button, input, label, textarea, card, dialog, alert-dialog, dropdown-menu, select, tabs, badge, avatar, table, sonner, tooltip, sheet, skeleton, progress, checkbox, switch, calendar, popover, separator, scroll-area, command, collapsible, radio-group, breadcrumb, chart, sidebar, accordion, alert, input-group, form)
- [x] ตั้งค่า font `LINE Seed Sans TH` (self-host 5 น้ำหนัก) ผ่าน `next/font/local` + fallback stack
- [x] กำหนด Design Token: Primary Orange `#F99B35` + brand scale 50–950 + neutral + semantic (success/warning/info/danger) ทั้ง Light & Dark
- [x] ตรวจ Contrast: ปุ่มส้มใช้ข้อความสีเข้ม (8.3:1), `--brand-text` `#a8570a` (5.2:1), focus ring `#d97706` (3.2:1)
- [x] สร้างสีประจำ Status/Priority/RSVP/ParticipantType/Readiness ครบทุกค่า พร้อม icon ประกอบ
- [x] หน้า `/design-system` แสดง token, typography, status badge และ component ทั้งหมด (สำหรับ QA ภายใน)

### Interaction
- [x] `ThemeProvider` — Light / Dark / System, ไม่ใช้ localStorage, สลับได้ทันทีทุกหน้า + init script กัน FOUC
- [x] `LocaleProvider` + hook `useT()` / `tl()` — TH/EN สลับได้ทันที พร้อม type-safe key
- [x] `AppStoreProvider` (Context + useReducer) พร้อม action type ครบทุก domain (reducer ทยอย implement รายเฟส)
- [x] helper `simulateDelay()` / `failIf()` + `DemoProvider.simulate()` สำหรับจำลอง latency/error

### Mock Data
- [x] `constants/mock-date.ts` — `MOCK_TODAY = 2026-07-31` + `getToday()` / `toDateKey()` / `daysBetween()`
- [x] โครง `types/` ครบทุก entity ตามหัวข้อ B
- [x] `mock/createInitialState()` โครงร่างว่าง พร้อมเติมข้อมูลจริงใน Phase ถัดไป

### Responsive
- [x] ใช้ breakpoint มาตรฐานของ Tailwind (`sm 640 / md 768 / lg 1024 / xl 1280`) + `MOBILE_BREAKPOINT` ใน `use-mobile`
- [x] container + spacing scale ใช้ร่วมกันทั้งระบบ

### Accessibility
- [x] `prefers-reduced-motion` — global CSS override + hook `useReducedMotion()`
- [x] Global focus-visible ring (สีส้มเข้ม, contrast ผ่าน AA) ไม่ปิด outline
- [x] `<html lang>` เปลี่ยนตามภาษาที่เลือก
- [x] Badge ทุกชนิดมี icon + ข้อความ ไม่ใช้สีสื่อความหมายเพียงอย่างเดียว

### Testing
- [x] ตั้งค่า Vitest + React Testing Library + `tests/unit` (14 tests ผ่าน)
- [x] ตั้งค่า Playwright + `tests/e2e` + reuse dev server
- [x] Smoke test: หน้าแรก, เข้า Design System, สลับธีม, สลับภาษา, ไม่มี console error (4 tests ผ่าน)
- [x] Unit test: dictionary parity TH/EN + ตรวจอักษรไทยหลุดใน `en`, mock date helpers, auth/system reducer

### Done Criteria
- [x] `npm run dev` / `npm run build` / `npm run lint` / `npm run test` / `npm run e2e` ผ่านทั้งหมด
- [x] TypeScript ไม่มี error
- [x] Theme + Language สลับได้จริงบนหน้า design-system
- [x] ไม่มี console error

---

## Phase 1 — Authentication & Application Shell

> **สถานะ: เสร็จแล้ว** · 15 routes · Unit 43 tests · E2E 21 tests

### UI
- [x] หน้า Login แบบสองคอลัมน์: แผงแบรนด์ + ฟอร์ม (Corporate Email, Password, Show/Hide, Remember Me, ปุ่ม Sign In)
- [x] กล่อง Mock Account Information แบบพับได้ — แสดงผู้ใช้ทั้ง 7 คน + รหัสผ่าน + ปุ่ม fill อัตโนมัติ
- [x] Sidebar (Desktop): Logo, 9 เมนูหลัก + Profile/Settings — collapse เป็นโหมดไอคอนได้ พร้อม tooltip
- [x] Topbar: Global Search (placeholder), Notification Bell + badge, Language Switcher, Theme Switcher, Profile Menu
- [x] Bottom Navigation (Mobile): Home, Events, My Tasks, Notifications, More + More Sheet
- [x] Metadata / Page Title ใช้ template `%s · EventFlow` ทุกหน้า
- [x] หน้า `not-found.tsx` และ `error.tsx` แบบ friendly พร้อมปุ่ม Retry
- [x] `Logo` / `LogoMark` แบบ SVG ในตัว (ไม่พึ่ง asset ภายนอก)
- [x] `PageHeader` / `PageContainer` / `PagePlaceholder` เป็นโครงมาตรฐานของทุกหน้า

### Interaction
- [x] Login validation (required, email format, รหัสผิด → Error State) + Loading State ปุ่ม
- [x] Login สำเร็จ → redirect `/dashboard` + toast ต้อนรับพร้อมชื่อผู้ใช้
- [x] Logout → กลับหน้า Login + ล้าง session
- [x] Route guard: ยังไม่ login เข้า `(app)` → redirect ไป `/login`; login แล้วเข้า `/login` → ไป `/dashboard`
- [x] **Switch Mock User** ใน Profile Menu — ไม่ต้อง logout, ข้อมูลผูกกับ `session.userId` จึงเปลี่ยนตามทุกจุด
- [x] Sidebar collapse + active nav highlight (แถบสีส้มซ้าย + ตัวหนา + พื้นหลังอ่อน)
- [x] Dev Utility Panel (ลอยมุมจอ ทุกหน้า): บังคับ Loading / Empty / Error, สั่งให้ action ถัดไปล้มเหลว, จำลองเครือข่ายช้า, รีเซ็ตข้อมูล

### Mock Data
- [x] Mock Users 7 คน ครบทุกบทบาท: Event Manager, Creative Designer, IT Support, HR Coordinator, Finance Coordinator, MC Coordinator, Venue Coordinator
- [x] แต่ละคนมีชื่อ-นามสกุล/ตำแหน่ง/ทีม (TH+EN), avatar สีประจำตัว, corporate email, เบอร์โทร
- [x] Mock credentials ใช้ login ได้จริง (รหัสผ่านเดียวกันทุกบัญชี แสดงบนหน้า Login)
- [ ] งานที่รับผิดชอบ + Recent Activity ของแต่ละคน → ผูกจริงเมื่อมีข้อมูล Task/Activity ใน Phase 4 และ 9

### Responsive
- [x] Desktop → Sidebar เต็ม / Tablet → Sidebar ย่อได้ / Mobile → Bottom Nav + More Sheet
- [x] Topbar ยุบเป็น icon-only บน mobile (ซ่อนช่องค้นหา)
- [x] Login page ใช้งานได้ดีทุกขนาดจอ (แผงแบรนด์ซ่อนบนจอเล็ก)

### Accessibility
- [x] Form label ผูกกับ input, error message ผูกด้วย `aria-describedby` + `aria-invalid` (ตรวจด้วย E2E)
- [x] Sidebar เป็น `<nav>` + `aria-current="page"`
- [x] Skip to content link
- [x] Profile menu / dropdown / switch user ใช้งานด้วยคีย์บอร์ดได้ (Radix + `menuitemradio`)
- [x] ปุ่ม icon-only มี `aria-label` ทุกปุ่ม
- [x] สี Avatar เลือกสีข้อความอัตโนมัติให้ผ่าน AA (`getReadableTextColor`)

### Testing
- [x] Unit: login schema, mock users + `authenticate()`, `isNavItemActive()`, color contrast (รวม 43 tests)
- [x] E2E 17 เคส: redirect, validation, aria wiring, รหัสผิด, show/hide password, mock account fill, route guard, refresh reset, logout, switch user, ทุกเมนู sidebar, aria-current, collapse sidebar, สลับภาษา, dev utility, console error

### Done Criteria
- [x] เข้าทุก route ใน sidebar ได้ (15 routes build ผ่านทั้งหมด)
- [x] Theme/Language สลับได้ทุกหน้าใน shell
- [x] Switch user เปลี่ยนข้อมูลจริง
- [x] ไม่มีปุ่มที่กดแล้วไม่ทำอะไร
- [x] `lint` / `typecheck` / `build` / `test` / `e2e` ผ่านทั้งหมด

> **ข้อจำกัดที่ทราบ:** `metadata.title` ของแต่ละหน้าเป็นภาษาไทยคงที่ (Next.js สร้าง metadata ฝั่งเซิร์ฟเวอร์ แต่ภาษาเก็บใน client state) — ข้อความบนหน้าจอเปลี่ยนภาษาครบถ้วน มีเพียงชื่อแท็บเบราว์เซอร์ที่ไม่เปลี่ยนตาม

---

## Phase 2 — Dashboard

> **สถานะ: เสร็จแล้ว** · Mock Data ชุดเต็ม (6 events · 43 tasks · 158 participants · 19 files · 100+ activities) · Unit 93 tests · E2E 34 tests

### UI
- [x] Stat Cards 5 ใบ: Upcoming Events, Tasks Due Soon, Overdue Tasks, Incomplete Tasks, Unread Notifications
- [x] Featured Event Card (งานเลี้ยงประจำปี) + cover + progress bar + วันนับถอยหลัง + ผู้รับผิดชอบ
- [x] Donut Chart สรุปงานตามสถานะ + การ์ดสรุปสถานะตอบรับ RSVP
- [x] จำนวนผู้เข้าร่วมแสดงบนการ์ดกิจกรรมและการ์ด RSVP
- [x] List: Recent Files, Recent Activity, My Urgent Tasks
- [x] Skeleton ครบทุก card (สัดส่วนตรงกับเนื้อหาจริง)

### Interaction
- [x] ตัวเลขบน stat card มี count-up animation (`useCountUp`, ปิดเองเมื่อ `prefers-reduced-motion`)
- [x] ทุก stat card เป็นลิงก์พร้อม query filter (เช่น `?scope=all&due=overdue`)
- [x] แถวในชาร์ตและการ์ด RSVP คลิกไปหน้าที่กรองไว้แล้วได้
- [x] ข้อมูลทั้งหมดคำนวณจาก store ผ่าน selectors ไม่มีตัวเลข hardcode
- [x] Loading delay จำลองตอนเข้าหน้า (`usePageState`) + รองรับ Dev Utility บังคับสถานะ

### Mock Data
- [x] Event หลัก "งานเลี้ยงประจำปีของบริษัท 2569" ข้อมูลครบทุก field + cover SVG
- [x] Event รองครบทั้ง 6 สถานะ (draft, planning, ready, in_progress, completed, cancelled)
- [x] Task 43 งาน กระจายทุกสถานะ/priority พร้อม dependency chain, งาน blocked, overdue 4 งาน, due soon 2 งาน
- [x] ผู้เข้าร่วม 158 คน (งานหลัก 83 คน) ครบทุกประเภทและสถานะตอบรับ
- [x] ไฟล์ 19 รายการ มี version history และไฟล์ในถังขยะ
- [x] Activity 100+ รายการ และ Notification แยกตามผู้ใช้

### Responsive
- [x] Stat cards 5 / 2 / 1 คอลัมน์, เนื้อหาหลัก 3 / 1 คอลัมน์
- [x] Chart ย่อตามจอ legend อ่านออกบนมือถือ (ตรวจที่ 390px)

### Accessibility
- [x] Chart มีรายการตัวเลขกำกับข้าง ๆ ไม่ต้องอ่านค่าจากสีอย่างเดียว
- [x] ทุก status/priority มีทั้งไอคอนและข้อความ
- [x] Progress bar มี `aria-label`
- [x] Heading hierarchy ถูกต้อง (h1 หน้า → h2 การ์ด)

### Testing
- [x] Unit: `calculateEventProgress`, `countTasksByStatus`, `isOverdue`, `isDueSoon`, `getDueStatus`, dashboard selectors
- [x] Unit: **ชุดตรวจความสมบูรณ์ของ Mock Data** — id ไม่ซ้ำ, reference ครบ, ไม่มี circular dependency, ไม่มีเหตุการณ์ในอนาคต, อีเมลผู้เข้าร่วมไม่ซ้ำ
- [x] E2E 13 เคส: การ์ดครบ, ตัวเลขในชาร์ตรวมกันถูกต้อง, คลิกไปหน้าเป้าหมายพร้อม filter, สลับผู้ใช้แล้วงานเปลี่ยน, Empty/Error State ผ่าน Dev Utility

### Done Criteria
- [x] ตัวเลขทุกตัวสอดคล้องกับข้อมูลใน store (E2E ตรวจว่าผลรวมในชาร์ตเท่ากับจำนวนงานจริง)
- [x] TH/EN + Light/Dark ถูกต้องทั้งหน้า
- [x] Loading/Empty/Error state ทดสอบผ่าน Dev Utility ได้
- [x] `lint` / `typecheck` / `build` / `test` / `e2e` ผ่านทั้งหมด

> **หมายเหตุการออกแบบ:** การ์ดสรุปด้านบนนับงาน **ของทั้งทีม** ไม่ใช่เฉพาะงานของผู้ใช้ที่ล็อกอิน เพราะทุกคนดูแลกิจกรรมร่วมกันตาม requirement ข้อ 1 ส่วนการ์ด "งานเร่งด่วนของฉัน" เป็นมุมมองส่วนตัว ลิงก์จากการ์ดสรุปจึงพา `scope=all` ไปด้วย ซึ่ง My Tasks จะรองรับใน Phase 4

---

## Phase 3 — Event Management

### UI
- [ ] Event List: Card Grid + Table toggle, cover image, status badge, progress bar, วันที่, ผู้รับผิดชอบ, จำนวนผู้เข้าร่วม
- [ ] Filter bar: status, ช่วงวันที่, ผู้รับผิดชอบ + Active Filter Chips + Clear All + Sort
- [ ] Event Detail: header (cover, ชื่อ, สถานะ, progress, วันที่/เวลา/สถานที่, owner, ปุ่ม action) + Tabs: Overview · Tasks · Timeline · Files · Participants · Activity
- [ ] Create/Edit Event Form (ทุก field ตาม concept ข้อ 10 + upload cover image)
- [ ] Duplicate Event — หน้าตรวจสอบข้อมูลก่อนยืนยัน (แสดงสิ่งที่จะคัดลอก vs ไม่คัดลอก)
- [ ] Empty State ของ Event List พร้อม CTA "สร้างกิจกรรมใหม่"

### Interaction
- [ ] Create / Edit → **Manual Save** + validation + loading + toast
- [ ] เปลี่ยน Event Status ผ่าน dropdown (Cancel ต้องมี Confirmation Dialog แบบ destructive)
- [ ] Delete Event → Confirmation Dialog ระบุชื่อ + ผลกระทบ (จำนวน task/file ที่เกี่ยวข้อง)
- [ ] Duplicate → คัดลอก tasks, checklist, assignees, timeline, file categories, dependency, blocking, notification settings; **ไม่คัดลอก** ไฟล์จริง, version, comment, activity, notification, participants
- [ ] Progress คำนวณอัตโนมัติจาก task และอัปเดตทันทีเมื่อ task เปลี่ยน
- [ ] Unsaved changes → เตือนก่อนออกจากฟอร์ม

### Mock Data
- [ ] Event หลักมี description, poster/cover, owner, ผู้เข้าร่วมคาดการณ์, created/updated metadata ครบ
- [ ] Cover image เป็น asset ใน `public/` (ไม่พึ่ง external URL)

### Responsive
- [ ] Card grid 3/2/1, Detail tabs เลื่อนแนวนอนบน mobile
- [ ] Form เป็น 1 คอลัมน์บน mobile, action bar ติดล่างจอ

### Accessibility
- [ ] Tabs ใช้ Radix Tabs (arrow key ได้)
- [ ] Confirmation dialog focus trap + focus กลับที่ trigger เมื่อปิด
- [ ] ปุ่ม destructive มีข้อความชัด ไม่ใช้แค่สีแดง

### Testing
- [ ] Unit: duplicate event logic (คัดลอก/ไม่คัดลอกถูกต้อง), progress recalculation
- [ ] E2E: สร้าง event → เห็นในลิสต์ → แก้ไข → duplicate → cancel → delete

### Done Criteria
- [ ] CRUD ครบและสะท้อนใน Dashboard ทันที
- [ ] Duplicate ทำงานตรงตาม spec ทุกข้อ
- [ ] ทุก destructive action มี Confirmation Dialog ครบองค์ประกอบ

---

## Phase 4 — Task, Kanban & Checklist

### UI
- [ ] Task Table View: ชื่อ, assignees (avatar group), status, priority, due date, overdue badge, checklist progress, dependency icon
- [ ] Kanban View: 5 คอลัมน์ตาม TaskStatus + WIP count + card แสดง priority/assignee/due
- [ ] Calendar View: task วางตาม due date + สี priority + overdue marker
- [ ] Task Detail (Drawer/Modal): ทุก field + Checklist + Attachment + Dependency/Blocking + Comments (placeholder ถึง Phase 8)
- [ ] Create/Edit Task Form: multi-assignee picker, date range, priority, status, notes
- [ ] Dependency Picker + แสดง "รออะไรอยู่" / "กำลังบล็อกอะไร" พร้อมชื่อ task และ badge
- [ ] My Tasks page: งานของผู้ใช้ปัจจุบัน + group by (due date / event / status)

### Interaction
- [ ] สลับ View 3 แบบใช้ข้อมูลชุดเดียวกัน — แก้ที่ view หนึ่ง อีก 2 view อัปเดตทันที
- [ ] Kanban Drag & Drop เปลี่ยนสถานะ → **Auto Save** (Saving → Saved) + animation ชัดเจน
- [ ] Checklist: เพิ่ม / แก้ไข / ลบ (มี confirm) / จัดลำดับด้วย DnD / ติ๊ก–ยกเลิก / progress `3/5` + progress bar
- [ ] **Auto status**: ติ๊กครบ → task = Completed; ยกเลิกอย่างน้อย 1 ข้อ → กลับเป็น In Progress; ทั้งสองกรณี recalc Event Progress ทันที + toast
- [ ] งานไม่มี checklist → เปลี่ยนสถานะเองได้
- [ ] Dependency: ป้องกัน Circular Dependency + validation message; เริ่มงานที่ยังถูก block → Warning + ให้ Override ได้
- [ ] Overdue: badge อัตโนมัติทุก view (ไม่เปลี่ยน status เดิม) + สร้าง Notification
- [ ] Filter/Sort: status, priority, assignee, due date, overdue + chips + clear all
- [ ] Delete Task → Confirmation Dialog (แจ้งว่ามี task อื่นที่ depend อยู่หรือไม่)

### Mock Data
- [ ] Task ของงานเลี้ยงประจำปีสมจริง (จองสถานที่, ออกแบบโปสเตอร์, เตรียม PowerPoint, ทำ Script พิธีกร, จัดของรางวัล, ตรวจระบบเสียง, สรุปงบประมาณ ฯลฯ)
- [ ] มี dependency chain จริงอย่างน้อย 3 เส้น + งาน blocked 1–2 งาน
- [ ] Checklist หลายงาน (บางงานใกล้ครบ เพื่อสาธิต auto-complete)

### Responsive
- [ ] Mobile: Table → Card View, Kanban → เลื่อนแนวนอน snap ทีละคอลัมน์
- [ ] Calendar บน mobile ใช้ agenda/list mode
- [ ] Task Detail เป็น full-screen sheet บน mobile

### Accessibility
- [ ] DnD มีทางเลือกด้วยคีย์บอร์ด (dnd-kit KeyboardSensor) + `aria-live` ประกาศผลการย้าย
- [ ] Priority/Status มี icon + ข้อความเสมอ
- [ ] Checklist checkbox มี label ที่อ่านออกโดย screen reader

### Testing
- [ ] Unit: `checklistAutoStatus`, `calculateEventProgress`, `isOverdue`, `isDueSoon`, `hasCircularDependency`, `getBlockingTasks`
- [ ] E2E: สร้าง task → assign หลายคน → เพิ่ม checklist → ติ๊กครบ → task auto completed → event progress เพิ่มขึ้น
- [ ] E2E: ลาก card ใน Kanban แล้วสถานะเปลี่ยนใน Table View

### Done Criteria
- [ ] 3 View sync กันสมบูรณ์
- [ ] Auto status + progress ถูกต้องทุกกรณี
- [ ] Circular dependency ป้องกันได้จริง
- [ ] Overdue badge แสดงครบทุกจุด (Dashboard, My Tasks, Table, Kanban, Calendar)

---

## Phase 5 — Timeline, Calendar & Gantt

### UI
- [ ] Vertical Timeline แบ่ง 3 ช่วง: ก่อนวันงาน · วันจัดงาน · หลังจบงาน
- [ ] Timeline Item Card: วันที่, เวลาเริ่ม–สิ้นสุด, กิจกรรม, ผู้รับผิดชอบ, สถานที่, สถานะความพร้อม, หมายเหตุ, task ที่เชื่อมโยง, dependency
- [ ] Calendar View ของ timeline
- [ ] Gantt Chart: แถบเวลา + เส้นเชื่อม dependency + วันนี้ (MOCK_TODAY) marker
- [ ] Create/Edit Timeline Item Form
- [ ] View Switcher (Vertical / Calendar / Gantt)

### Interaction
- [ ] ทั้ง 3 view ใช้ข้อมูลชุดเดียวกัน — แก้ที่ view ใดก็อัปเดตทุก view
- [ ] Drag & Drop เปลี่ยนวัน/ลำดับ, Resize บน Gantt เปลี่ยนช่วงเวลา
- [ ] **Confirmation Dialog ก่อนเปลี่ยนข้อมูลสำคัญ** (วันที่/เวลา/ลำดับที่กระทบ dependency) แสดง before → after
- [ ] เปลี่ยน timeline → สร้าง Notification "Timeline เปลี่ยนแปลง" + Activity log
- [ ] เชื่อม Timeline Item เข้ากับ Task (สถานะ task สะท้อนสถานะความพร้อม)
- [ ] Animation ชัดเจนตอนย้าย/ปรับขนาดบน Gantt

### Mock Data
- [ ] Timeline ครบ 3 ช่วงของงานเลี้ยงประจำปี (เตรียมงาน 6–8 รายการ, วันงาน 10–14 รายการแบบ run-down รายชั่วโมง, หลังงาน 3–4 รายการ)
- [ ] เชื่อมโยงกับ task จริงอย่างน้อยครึ่งหนึ่ง

### Responsive
- [ ] Gantt บน mobile: scroll แนวนอน + sticky ชื่อแถว
- [ ] Vertical timeline เป็น layout เดียวคอลัมน์บน mobile
- [ ] DnD บน touch device ใช้งานได้ (PointerSensor + delay)

### Accessibility
- [ ] Timeline เป็น `<ol>` semantic + เวลาใช้ `<time datetime>`
- [ ] Gantt มีตารางข้อมูลสำรองสำหรับ screen reader
- [ ] ปรับเวลาได้ด้วยคีย์บอร์ด (ฟอร์ม) ไม่ใช่แค่ลาก

### Testing
- [ ] Unit: timeline grouping by phase, overlap detection, gantt position calculation
- [ ] E2E: เพิ่ม timeline item → สลับ view → เห็นข้อมูลตรงกัน → ลากเปลี่ยนวัน → confirm → notification เกิดขึ้น

### Done Criteria
- [ ] 3 view sync สมบูรณ์
- [ ] Confirmation dialog ทำงานก่อนการเปลี่ยนแปลงสำคัญ
- [ ] Gantt แสดง dependency ถูกต้อง

---

## Phase 6 — File Management, Version History & Trash

### UI
- [ ] All Files page + Files tab ใน Event: Grid / List toggle
- [ ] Category sidebar/chips: กำหนดการ, PowerPoint, รายชื่อผู้เข้าร่วม, โปสเตอร์กิจกรรม, Script พิธีกร + เพิ่มหมวดหมู่ใหม่ได้
- [ ] Upload Zone: เลือกไฟล์ + Drag and Drop + หลายไฟล์พร้อมกัน
- [ ] Upload Progress list: progress bar ต่อไฟล์ + Success / Failed / Retry / Cancel
- [ ] File Preview Modal ตามประเภท: Image (แสดงจริง) · PDF (mock document page) · PowerPoint (mock slide thumbnail + slide navigator) · Excel (mock spreadsheet grid) · Word (mock document page)
- [ ] Version History Panel: version number, filename, uploaded by, date, size, change note
- [ ] Trash page: ชื่อไฟล์, ประเภท, event, ผู้ลบ, วันที่ลบ, จำนวนวันคงเหลือ, Restore, Delete Permanently
- [ ] Filter: file type, category, event, uploader, date + Sort

### Interaction
- [ ] Validation ขนาดไฟล์ > 50 MB → error เข้าใจง่าย ระบุชื่อไฟล์และขนาด
- [ ] Validation ประเภทไฟล์ที่รองรับ (PPT, Excel, PDF, Word, Image)
- [ ] Upload จำลอง progress 0→100 พร้อม animation, cancel กลางคันได้, fail แล้ว retry ได้
- [ ] File Actions: ดาวน์โหลด (mock file), เปลี่ยนชื่อ, อัปโหลดเวอร์ชันใหม่ (+ change note), ย้ายหมวดหมู่, ลบ (→ Trash), ดูประวัติเวอร์ชัน, เปิด preview
- [ ] Restore Version → Confirmation Dialog อธิบายว่า "ระบบจะสร้าง Current Version ใหม่จากเวอร์ชันที่เลือก"
- [ ] Trash: Restore กลับที่เดิม, Delete Permanently → Confirmation destructive
- [ ] ทุก action สร้าง Activity log + Notification (file change / new version)
- [ ] Manual Save สำหรับ upload / rename / move category / restore version

### Mock Data
- [ ] ไฟล์ ≥ 15 รายการครอบคลุมทุกประเภทและทุกหมวดหมู่
- [ ] ไฟล์ที่มี version history หลายเวอร์ชัน ≥ 3 ไฟล์ (พร้อม change note สมจริง)
- [ ] ไฟล์ใน Trash ที่เหลือวันต่างกัน (เช่น 28, 15, 3, 1 วัน)
- [ ] Asset ตัวอย่างจริงใน `public/` สำหรับ image preview

### Responsive
- [ ] Grid 4/3/2/1, preview modal เป็น full-screen บน mobile
- [ ] Upload zone รองรับ tap-to-select บน mobile
- [ ] Version history เป็น list บน mobile

### Accessibility
- [ ] Upload zone เข้าถึงด้วยคีย์บอร์ด (button + input file ที่ label ถูกต้อง)
- [ ] Progress ใช้ `role="progressbar"` + `aria-valuenow`
- [ ] Preview modal focus trap + ปิดด้วย Esc
- [ ] `aria-live` ประกาศ upload สำเร็จ/ล้มเหลว

### Testing
- [ ] Unit: `validateFileSize`, `validateFileType`, `getFileIcon`, `trashDaysRemaining`, `restoreVersion` logic
- [ ] E2E: upload ไฟล์ → เห็นใน list → อัปโหลดเวอร์ชันใหม่ → ดู history → restore version → ลบ → เห็นใน Trash → restore

### Done Criteria
- [ ] Upload/Preview/Version/Trash ทำงานครบทุก action
- [ ] Countdown 30 วันคำนวณจาก MOCK_TODAY ถูกต้อง
- [ ] Preview ดูสมจริงทุกประเภทไฟล์

---

## Phase 7 — Participants & Excel Import

### UI
- [ ] Participants page (ต่อ Event): Table + Summary Cards (ทั้งหมด / เข้าร่วม / ไม่เข้าร่วม / ยังไม่ตอบรับ)
- [ ] Table columns: ชื่อ-นามสกุล, อีเมล, แผนก, เบอร์โทร, สถานะตอบรับ, ประเภทผู้เข้าร่วม, หมายเหตุ
- [ ] Badge ประเภทผู้เข้าร่วม (พนักงาน/ผู้บริหาร/วิทยากร/แขกภายนอก/ทีมงานจัดงาน) — สี + ข้อความ
- [ ] Add/Edit Participant Form
- [ ] Bulk selection toolbar (เลือกกี่รายการ / Bulk change RSVP / Bulk delete)
- [ ] **Import Wizard** 5 ขั้น: Upload → Column Mapping → Preview & Validation → Conflict Resolution → Summary & Confirm
- [ ] **Conflict Resolution Screen**: เปรียบเทียบซ้าย (ข้อมูลเดิม) – ขวา (ข้อมูลใหม่จาก Excel), highlight field ที่ต่างกัน, ปุ่มเลือก "ใช้ข้อมูลเดิมทั้งชุด / ใช้ข้อมูลใหม่ทั้งชุด" เท่านั้น
- [ ] Conflict navigation: Previous / Next / Apply to All / Progress `2 จาก 8`
- [ ] Export Excel dialog

### Interaction
- [ ] Search / Filter (type, RSVP, department) / Sort ทุกคอลัมน์ + chips + clear all
- [ ] Bulk Change RSVP → Confirmation Dialog ระบุจำนวนรายการที่กระทบ
- [ ] Import flow: อ่านไฟล์ Excel จริงด้วย SheetJS → map column → ตรวจ required fields → error รายแถว (ระบุแถว/คอลัมน์) → ตรวจ email ซ้ำ → conflict resolution → summary (เพิ่มใหม่ X / อัปเดต Y / ข้าม Z / error N) → Confirm → ผลลัพธ์
- [ ] ห้ามเลือกผสมทีละ field ใน conflict (บังคับเลือกทั้งชุด)
- [ ] Import สำเร็จ → Activity log + toast + ตารางอัปเดต
- [ ] Export Excel รายชื่อ + สถานะตอบรับ (ไฟล์จริงจากข้อมูล mock)
- [ ] Manual Save ทั้ง Import และ Bulk operation

### Mock Data
- [ ] ผู้เข้าร่วม ≥ 60 คน กระจายแผนก/ประเภท/สถานะตอบรับ
- [ ] ไฟล์ Excel ตัวอย่างใน `public/samples/participants-sample.xlsx` (มีทั้งแถวปกติ, แถว error, email ซ้ำ) สำหรับทดสอบ import
- [ ] ปุ่มดาวน์โหลด Template Excel

### Responsive
- [ ] Mobile: table → card view, summary cards 2 คอลัมน์
- [ ] **Conflict comparison บน mobile เปลี่ยนจากซ้าย–ขวาเป็นบน–ล่าง** พร้อม label ชัดเจนว่าอันไหนข้อมูลเดิม/ข้อมูลใหม่
- [ ] Import wizard step indicator ย่อบน mobile

### Accessibility
- [ ] Table มี `<caption>` / `scope` ที่ถูกต้อง
- [ ] Bulk select checkbox มี label "เลือกทั้งหมด" / รายแถวระบุชื่อ
- [ ] Wizard step ประกาศด้วย `aria-live` เมื่อเปลี่ยนขั้น
- [ ] Conflict comparison ไม่พึ่งสีอย่างเดียวในการชี้ field ที่ต่าง (มี icon/ข้อความ "แตกต่าง")

### Testing
- [ ] Unit: `detectDuplicateEmails`, `validateImportRow`, `mapColumns`, `resolveConflicts`, `buildImportSummary`
- [ ] E2E: import ไฟล์ตัวอย่าง → mapping → เห็น error รายแถว → resolve conflict → apply to all → confirm → ตารางอัปเดตถูกต้อง

### Done Criteria
- [ ] Import flow ครบ 11 ขั้นตามสเปก
- [ ] Conflict resolution บังคับเลือกทั้งชุด และรองรับ Apply to All
- [ ] Export Excel ดาวน์โหลดได้จริง

---

## Phase 8 — Collaboration & Notifications

### UI
- [ ] Comment Section ใน Task Detail: input + toolbar (mention, attach), รายการ comment แบบ thread
- [ ] Comment item: avatar, ชื่อ, timestamp (relative + tooltip absolute), เนื้อหา, edited indicator, reply, edit, delete, emoji reaction
- [ ] Mention autocomplete dropdown เมื่อพิมพ์ `@` + highlight mention ในเนื้อหา
- [ ] Attachment chip ในความคิดเห็น + preview
- [ ] Notification Bell + Dropdown (10 รายการล่าสุด + ดูทั้งหมด) + Unread Badge
- [ ] Notification Page: filter ตามประเภท, read/unread, Mark all as read
- [ ] Notification Settings page: toggle 5 ประเภท + สถานะ Saved

### Interaction
- [ ] เพิ่ม / Reply (thread) / แก้ไข (เฉพาะของผู้ใช้ปัจจุบัน) / ลบ (confirm) / reaction
- [ ] Mention → สร้าง Notification ให้ผู้ถูก mention ทันที (เห็นผลเมื่อ switch user)
- [ ] แนบไฟล์ในความคิดเห็น (validation ขนาด/ประเภทเดียวกับ Phase 6)
- [ ] Notification: read/unread, mark as read (คลิกแล้ว), mark all as read, ลิงก์ไปยัง target จริง (task/file/timeline)
- [ ] Notification เกิดอัตโนมัติจาก: assign งานใหม่, ใกล้ครบกำหนด, เกินกำหนด, แก้ไขไฟล์, อัปโหลดเวอร์ชันใหม่, ถูก mention, timeline เปลี่ยน, checklist ครบ, task ถูก block/unblock
- [ ] Notification Settings → **Auto Save** + สถานะ Saving/Saved; ปิดประเภทไหนแล้วต้องไม่สร้าง notification ประเภทนั้น
- [ ] Comment/Notification เปลี่ยนตาม Switch User

### Mock Data
- [ ] Comment thread สมจริงในงานสำคัญ ≥ 5 งาน (มี reply, mention, attachment, edited)
- [ ] Notification ผสม read/unread ครบทุกประเภทสำหรับผู้ใช้แต่ละคน

### Responsive
- [ ] Comment thread ย่อหน้า reply ไม่เกิน 2 ระดับบน mobile
- [ ] Notification dropdown → full sheet บน mobile
- [ ] Mention dropdown ไม่ล้นจอ

### Accessibility
- [ ] Mention combobox: `role="combobox"` + `aria-activedescendant` + arrow/Enter/Esc
- [ ] Unread badge มีข้อความสำหรับ screen reader ("3 การแจ้งเตือนที่ยังไม่อ่าน")
- [ ] Comment ใหม่ประกาศผ่าน `aria-live="polite"`
- [ ] Reaction button มี `aria-pressed`

### Testing
- [ ] Unit: mention parser, notification generator ตาม settings, unread counter, comment tree builder
- [ ] E2E: comment → reply → mention เพื่อนร่วมทีม → switch user → เห็น notification → คลิกแล้วไปที่ task ถูกต้อง

### Done Criteria
- [ ] Comment ครบทุก action
- [ ] Notification สร้างครบ 9 ประเภทและเคารพ settings
- [ ] Mark as read / Mark all as read ทำงานถูกต้อง

---

## Phase 9 — Search, Export, Activity History & Profile

### UI
- [ ] Global Search (Command Palette style, `Ctrl/Cmd + K`) + ผลลัพธ์แยกกลุ่ม: Events, Tasks, Files, Participants, People
- [ ] Search result item แสดง context (event, สถานะ, วันที่) + highlight คำค้น
- [ ] Activity History page: timeline list + filter (actor, action type, event, date range) + search
- [ ] Activity item: ผู้ดำเนินการ, action, target, event, date/time, before → after summary
- [ ] Export Dialog: เลือกรูปแบบ (PDF/Excel) + เลือกข้อมูลที่ต้องการ (checkbox)
- [ ] User Profile page: avatar, ชื่อ, ตำแหน่ง, ทีม, email, งานที่ได้รับมอบหมาย, งานใกล้ครบกำหนด, งานที่เสร็จล่าสุด, recent activity + ลิงก์ไป Notification Settings / Language / Theme

### Interaction
- [ ] Global Search ค้นจาก: ชื่อกิจกรรม, วันที่กิจกรรม, ผู้รับผิดชอบ, สถานะงาน, ชื่องาน, ชื่อไฟล์, ประเภทไฟล์, ผู้เข้าร่วม, แผนก, อีเมล
- [ ] Debounce + Empty result state + Recent search (in-memory)
- [ ] คลิกผลลัพธ์ → ไปหน้าเป้าหมายพร้อม highlight
- [ ] PDF Export: สร้างไฟล์จริงจากข้อมูล mock (ข้อมูลกิจกรรม, progress, task summary, timeline, participant summary, file summary)
- [ ] Excel Export: รายการงาน, timeline, ผู้เข้าร่วม, สถานะตอบรับ, รายการไฟล์, activity history
- [ ] Export มี loading state + toast + ดาวน์โหลดจริง
- [ ] Profile: เปลี่ยน Language / Theme ได้จากหน้านี้

### Mock Data
- [ ] Activity ≥ 60 รายการครอบคลุมทุก action type พร้อม before/after ที่มีความหมาย
- [ ] ข้อมูลย้อนหลังกระจายหลายวัน เพื่อทดสอบ date filter

### Responsive
- [ ] Command palette เป็น full-screen บน mobile
- [ ] Activity list เป็น card, filter อยู่ใน sheet
- [ ] Export dialog scroll ได้บนจอเล็ก

### Accessibility
- [ ] Command palette: `role="dialog"` + combobox pattern + คีย์บอร์ดครบ
- [ ] ผลการค้นหาประกาศจำนวนผ่าน `aria-live`
- [ ] Export progress มี status ที่ screen reader อ่านได้

### Testing
- [ ] Unit: `globalSearch`, filter/sort utilities, activity formatter, export data builder
- [ ] E2E: กด Ctrl+K → ค้นหา → เปิดผลลัพธ์; export Excel และ PDF ดาวน์โหลดสำเร็จ

### Done Criteria
- [ ] Search ครอบคลุมทุกแหล่งข้อมูลตามสเปก
- [ ] Export ได้ไฟล์จริงทั้ง PDF และ Excel
- [ ] Activity History filter/search ทำงานครบ

---

## Phase 10 — Accessibility, Responsive & Final QA

### UI
- [ ] ตรวจความสม่ำเสมอของ spacing, typography, สี, empty/error illustration ทั้งระบบ
- [ ] ตรวจว่าสีส้มถูกใช้เป็น accent ไม่ล้นพื้นที่
- [ ] ตรวจ Light/Dark ทุกหน้า ทุก component (รวม chart, gantt, preview)

### Interaction
- [ ] เดิน Main Flow 20 ขั้นตาม concept ข้อ 4 ครบทั้งหมด
- [ ] ตรวจว่าไม่มีปุ่ม/ลิงก์ที่กดแล้วไม่ทำอะไร
- [ ] ตรวจ Auto Save / Manual Save ตรงตามสเปกทุกจุด
- [ ] ตรวจ Confirmation Dialog ครบทุก destructive action

### Mock Data
- [ ] ทบทวนข้อมูลทั้งหมดให้สมจริงและสอดคล้องกัน (ชื่อ วันที่ ความสัมพันธ์)
- [ ] ตรวจว่า refresh แล้วข้อมูลกลับเป็นค่าเริ่มต้นเสมอ และไม่มีการใช้ localStorage ที่ใดเลย

### Responsive
- [ ] ทดสอบ 360 / 414 / 768 / 1024 / 1280 / 1920 px
- [ ] ตรวจเฉพาะจุด: Sidebar, Bottom Nav, Dashboard Cards, Table, Kanban, Calendar, Gantt, File Preview, Import Excel, Conflict Comparison, Modal, Drawer, Comment Thread
- [ ] ไม่มี horizontal overflow ที่ไม่ตั้งใจ

### Accessibility
- [ ] เดิน Main Flow ด้วยคีย์บอร์ดล้วนได้จนจบ
- [ ] Focus visible ทุก interactive element
- [ ] ตรวจ contrast ทุก status/priority/badge ผ่าน WCAG AA
- [ ] ตรวจว่าไม่มีที่ไหนใช้สีสื่อความหมายเพียงอย่างเดียว
- [ ] `prefers-reduced-motion` ปิด animation หนักได้จริง
- [ ] รัน axe DevTools / Lighthouse a11y ทุกหน้าหลัก แก้ issue ที่พบ

### Testing
- [ ] Unit tests ผ่านทั้งหมด (ครอบคลุมหัวข้อใน concept ข้อ 33)
- [ ] Playwright E2E Main Flow 15 ขั้นผ่านทั้งหมด
- [ ] `npm run build` ผ่าน, TypeScript ไม่มี error, ESLint ไม่มี error
- [ ] ตรวจ console ทุกหน้า ไม่มี error สำคัญ

### Done Criteria
- [ ] สร้าง `README.md` ครบตาม concept ข้อ 34 (Overview, Features, Stack, Installation, Dev/Build/Test/Playwright command, Mock Account, Project Structure, Deploy to Vercel, Prototype Limitations, Reset Behavior, ไม่มี Backend/Database)
- [ ] เพิ่ม `vercel.json` / ตรวจ build config ให้ deploy ได้
- [ ] ตรวจ checklist ใน [E. Global Definition of Done](#e-global-definition-of-done) ครบทุกข้อ

---

## E. Global Definition of Done

ก่อนถือว่างานเสร็จสมบูรณ์ ต้องผ่านทุกข้อ:

- [ ] Source Code รันได้จริง (`npm run dev`)
- [ ] `npm run build` ผ่าน
- [ ] TypeScript ไม่มี error
- [ ] ไม่มี Console Error ที่สำคัญ
- [ ] ทุก Route เปิดได้ (13 หน้าตาม concept ข้อ 6)
- [ ] ไม่มีปุ่มหลักที่กดแล้วไม่ทำงาน
- [ ] Main Flow 20 ขั้นทำงานครบ
- [ ] TH/EN ทำงานทุกหน้า ไม่มีข้อความหลุดภาษา
- [ ] Light/Dark Mode ทำงานทุกหน้า
- [ ] Responsive ใช้งานได้จริงทั้ง Desktop/Tablet/Mobile
- [ ] Loading, Empty, Error State มีครบทุกหน้าที่มีข้อมูล
- [ ] Mock Data สมจริงและสอดคล้องกัน
- [ ] Accessibility พื้นฐานผ่าน (keyboard, focus, contrast, ARIA)
- [ ] Unit Tests ผ่าน
- [ ] Playwright Main Flow ผ่าน
- [ ] `README.md` ครบถ้วน
- [ ] พร้อม Deploy บน Vercel
