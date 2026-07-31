# Prompt สำหรับสร้าง EventFlow Interactive Prototype

ให้คุณทำหน้าที่เป็น Senior Product Designer, UX Engineer และ Senior Frontend Developer สร้างเว็บไซต์ต้นแบบชื่อ **EventFlow** ซึ่งเป็นระบบบริหาร วางแผน และประสานงานกิจกรรมภายในองค์กร

เป้าหมายคือสร้าง **Interactive Frontend Prototype ที่สมบูรณ์และพร้อม Deploy บน Vercel** โดยผู้ใช้สามารถทดลองขั้นตอนการทำงานหลักได้จริง แม้ยังไม่มี Backend และ Database

ห้ามสร้างเพียง Static UI หรือหน้าจอที่กดใช้งานไม่ได้ ทุกเมนู ปุ่ม ฟอร์ม การเปลี่ยนสถานะ การอัปโหลดไฟล์ การจัด Timeline การ Comment การเปลี่ยนภาษา และการเปลี่ยน Theme ต้องมี Interaction จำลองที่สมจริง

skill.md ที่จำเป็น สามารถติดตั้งและเรียกใช้ได้เลยคือ skill ux ui pro max https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

---

# 1. Project Overview

## ชื่อระบบ

**EventFlow**

ต้องใช้ชื่อ EventFlow ให้สอดคล้องกันทั้งระบบ ได้แก่:

* หน้า Login
* Sidebar
* Mobile Navigation
* Dashboard
* Page Title
* Metadata
* README
* Mock Content
* ไฟล์แผนงานชื่อ `EventFlow PLAN.md`

## วัตถุประสงค์

EventFlow เป็นระบบสำหรับทีมงานภายในองค์กร ใช้บริหารและประสานงานกิจกรรมตั้งแต่เริ่มวางแผนจนจบกิจกรรม โดยรวบรวมข้อมูลสำคัญไว้ในระบบเดียว เช่น:

* กำหนดการ
* งานและผู้รับผิดชอบ
* Checklist
* Timeline
* PowerPoint ที่ใช้ภายในงาน
* รายชื่อผู้เข้าร่วม
* โปสเตอร์กิจกรรม
* Script พิธีกร
* ไฟล์เอกสารที่เกี่ยวข้อง
* ความคิดเห็นและการสื่อสารระหว่างทีม
* การแจ้งเตือน
* ประวัติการเปลี่ยนแปลง

## กลุ่มผู้ใช้งาน

ผู้ใช้งานหลักคือพนักงานและทีมงานภายในองค์กร

สำหรับ Prototype นี้ ผู้ใช้ทุกคนสามารถดูและแก้ไขข้อมูลกิจกรรมได้ทั้งหมด โดยยังไม่ต้องแบ่งสิทธิ์ตาม Role

---

# 2. Technology Stack

ใช้ Technology Stack ดังนี้:

* Next.js รุ่นปัจจุบันที่เสถียร
* App Router
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide Icons หรือ Icon Library ที่เข้ากับ shadcn/ui
* Responsive Design
* Deploy บน Vercel
* Playwright สำหรับ E2E Testing
* Unit Tests สำหรับ Component และ Utility Function สำคัญ

จัดโครงสร้าง Source Code ให้สะอาด เป็นระบบ และพร้อมต่อยอดเป็นระบบจริงในอนาคต

แยกส่วนประกอบอย่างเหมาะสม เช่น:

* Components
* Features
* Mock Data
* Types
* Utilities
* Hooks
* Constants
* Translations

หลีกเลี่ยงการเขียน Component ขนาดใหญ่ที่รวมทุกอย่างไว้ในไฟล์เดียว

---

# 3. Prototype Scope

ระบบนี้เป็น **Frontend Prototype เท่านั้น**

เงื่อนไขสำคัญ:

* ไม่ต้องมี Backend
* ไม่ต้องมี Database
* ไม่ต้องเชื่อมต่อ API จริง
* ใช้ Mock Data ที่สมจริง
* ไม่ใช้ `localStorage`
* เมื่อ Refresh หน้าเว็บ ให้ข้อมูลกลับไปเป็น Mock Data เริ่มต้น
* การเพิ่ม แก้ไข ลบ และเปลี่ยนสถานะให้ทำงานภายใน Session ปัจจุบัน
* จำลอง Loading Delay ในบาง Action เพื่อให้ Interaction สมจริง
* แสดง Success, Warning และ Error Feedback ด้วย Toast หรือ UI ที่เหมาะสม

ต้องมี Mock Event หลักจำนวน 1 กิจกรรม คือ:

**งานเลี้ยงประจำปีของบริษัท**

สร้างรายละเอียดกิจกรรม งาน Timeline รายชื่อผู้เข้าร่วม ไฟล์ และความคิดเห็นให้สมจริง

---

# 4. Main User Flow

สร้าง Main Flow ที่ผู้ใช้สามารถทดลองได้ครบถ้วนดังนี้:

1. Login เข้าสู่ระบบ
2. เข้าหน้า Dashboard
3. สร้างกิจกรรมใหม่
4. เพิ่มงานย่อย
5. กำหนดผู้รับผิดชอบหลายคน
6. เพิ่ม Checklist
7. กำหนด Due Date และ Priority
8. กำหนด Dependency และ Blocking
9. อัปโหลดไฟล์
10. จัดหมวดหมู่ไฟล์
11. อัปโหลดไฟล์เวอร์ชันใหม่
12. จัด Timeline ของกิจกรรม
13. สลับ Timeline View
14. เพิ่มความคิดเห็น
15. Reply ความคิดเห็น
16. Mention สมาชิก
17. แนบไฟล์ในความคิดเห็น
18. เปลี่ยนสถานะงาน
19. ติดตามความคืบหน้ากิจกรรม
20. ตรวจสอบ Notification และ Activity History

ทุกขั้นตอนต้องเชื่อมโยงกัน ตัวอย่างเช่น เมื่อเปลี่ยนสถานะงานเป็นเสร็จสิ้น Progress ของกิจกรรมต้องอัปเดตตามทันที

---

# 5. Authentication และ Mock Users

## Login

สร้างหน้า Login ด้วย:

* Corporate Email
* Password
* Remember Me แบบ UI จำลอง
* Show/Hide Password
* Validation
* Loading State
* Error State
* Mock Account Information

ไม่ต้องมีระบบสมัครสมาชิก

## Mock Users

สร้าง Mock Users หลายคน โดยแต่ละคนมีข้อมูล:

* ชื่อและนามสกุล
* Avatar
* ตำแหน่งงาน
* ทีม/แผนก
* Corporate Email
* งานที่ได้รับมอบหมาย
* Recent Activity

สร้างข้อมูลให้ดูเหมือนทีมจัดกิจกรรมจริง เช่น:

* Event Manager
* Creative Designer
* IT Support
* HR Coordinator
* Finance Coordinator
* MC Coordinator
* Venue Coordinator

## Switch Mock User

ใน Profile Menu ต้องสามารถสลับ Mock User ได้โดยไม่ต้อง Logout หรือ Login ใหม่

เมื่อสลับผู้ใช้ ให้ข้อมูลต่อไปนี้เปลี่ยนตาม:

* My Tasks
* Profile
* Notifications
* Assigned Tasks
* Mention
* Comments
* Recent Activity

---

# 6. Navigation และ Pages

สร้างหน้าหลักดังนี้:

1. Login
2. Dashboard
3. Event List
4. Event Detail
5. My Tasks
6. All Files
7. Timeline
8. Participants
9. Notifications
10. Activity History
11. User Profile
12. Trash
13. Notification Settings

## Desktop Navigation

ใช้ Left Sidebar โดยมี:

* EventFlow Logo
* Dashboard
* Events
* My Tasks
* Files
* Timeline
* Participants
* Notifications
* Activity History
* Trash
* Profile/Settings

Sidebar ต้อง Collapse ได้

## Mobile Navigation

ใช้ Bottom Navigation โดยแสดงเมนูสำคัญ เช่น:

* Home
* Events
* My Tasks
* Notifications
* More

เมนูที่เหลือให้อยู่ภายในหน้า More หรือ Drawer

---

# 7. Visual Design

ออกแบบให้มีลักษณะ:

* Simple
* Modern
* Clean
* Professional
* Friendly
* เหมาะกับระบบภายในองค์กร
* อ่านง่าย
* ใช้งานง่ายแม้มีข้อมูลจำนวนมาก

## Brand Color

Primary Orange:

`#F99B35`

ใช้สีส้มเป็นสีหลักสำหรับ:

* Primary Button
* Active Navigation
* Progress
* Highlight
* Focus
* Important Action

ใช้สีขาวและ Neutral Color เป็นพื้นฐาน

หลีกเลี่ยงการใช้สีส้มเต็มพื้นที่มากเกินไป ควรใช้เป็น Accent เพื่อรักษาความสะอาดและความเป็นมืออาชีพ

## Theme

รองรับ:

* Light Mode
* Dark Mode
* System Theme หากเหมาะสม

Theme Switcher ต้องทำงานได้จริงทุกหน้า

## Font

ใช้:

`LINE Seed Sans TH`

พร้อมกำหนด Fallback Font ที่เหมาะสมเมื่อโหลด Font ไม่สำเร็จ

## Animation

ใช้ Animation ที่เห็นได้ชัดแต่ไม่รบกวนการใช้งานในส่วน:

* Dashboard Statistics
* Kanban Drag and Drop
* File Upload
* Upload Progress
* Timeline
* Gantt Chart
* Progress Update

ส่วนอื่นใช้ Subtle Transition เช่น:

* Hover
* Modal
* Dropdown
* Tab
* Drawer
* Toast
* Status Change

รองรับ `prefers-reduced-motion`

---

# 8. Internationalization

รองรับภาษา:

* ภาษาไทย
* English

มี Language Switcher ที่เข้าถึงได้ทุกหน้า

เมื่อเปลี่ยนภาษา ข้อความทั้งหมดต้องเปลี่ยนตาม รวมถึง:

* Navigation
* Page Title
* Button
* Form Label
* Placeholder
* Validation
* Status
* Priority
* Notification
* Toast
* Empty State
* Error State
* Confirmation Dialog
* Mock Data ที่แสดงต่อผู้ใช้

ไม่ควรมีข้อความภาษาไทยหรืออังกฤษหลุดปะปนโดยไม่ได้ตั้งใจ

---

# 9. Dashboard

Dashboard ต้องแสดงข้อมูลสำคัญ ได้แก่:

* Upcoming Events
* Tasks Due Soon
* Overdue Tasks
* Incomplete Tasks
* Recent Files
* Recent Activity
* Unread Notifications
* Progress ของแต่ละกิจกรรม
* จำนวนผู้เข้าร่วม
* สรุปสถานะตอบรับ
* สรุปงานตามสถานะ

สร้าง Card, Chart หรือ Progress Visualization ที่เข้าใจง่าย

กิจกรรมหลักต้องเป็นงานเลี้ยงประจำปีของบริษัท พร้อมข้อมูลสมจริง

---

# 10. Event Management

## Event Fields

กิจกรรมต้องมีข้อมูล:

* ชื่อกิจกรรม
* รายละเอียด
* วันที่เริ่มต้น
* วันที่สิ้นสุด
* เวลา
* สถานที่
* ผู้รับผิดชอบหลัก
* จำนวนผู้เข้าร่วม
* สถานะกิจกรรม
* Cover Image หรือ Poster
* Progress
* วันที่สร้าง
* ผู้สร้าง
* วันที่แก้ไขล่าสุด

## Event Status

สถานะกิจกรรมประกอบด้วย:

* ร่าง — Draft
* กำลังวางแผน — Planning
* พร้อมจัดงาน — Ready
* กำลังดำเนินงาน — In Progress
* เสร็จสิ้น — Completed
* ยกเลิก — Cancelled

ใช้สีแยกแต่ละสถานะอย่างชัดเจน และต้องมี Contrast ที่ผ่าน WCAG AA

## Event Progress

คำนวณ Progress อัตโนมัติจาก:

`จำนวนงานย่อยที่เสร็จสิ้น ÷ จำนวนงานย่อยทั้งหมด × 100`

ไม่นับ Checklist โดยตรงเป็น Progress ของกิจกรรม แต่ Checklist จะส่งผลต่อสถานะของงานย่อย

เมื่อสถานะงานเปลี่ยน Progress ต้องอัปเดตทันที

---

# 11. Event Template และ Duplicate Event

ผู้ใช้สามารถคัดลอกกิจกรรมเดิมเพื่อสร้างกิจกรรมใหม่ได้

ข้อมูลที่ต้องคัดลอก:

* งานย่อย
* Checklist
* ผู้รับผิดชอบ
* Timeline
* หมวดหมู่ไฟล์
* Dependency
* Blocking Relationship
* Notification Settings

ข้อมูลที่ไม่ต้องคัดลอก:

* ไฟล์จริง
* File Version เดิม
* ความคิดเห็นเดิม
* Activity History เดิม
* Notification เดิม
* รายชื่อผู้เข้าร่วมเดิม เว้นแต่ผู้ใช้เลือกเพิ่มเติมภายหลัง

แสดงหน้าตรวจสอบข้อมูลก่อนยืนยัน Duplicate Event

---

# 12. Task Management

## Task Fields

งานย่อยแต่ละงานมีข้อมูล:

* ชื่องาน
* รายละเอียด
* ผู้รับผิดชอบหลายคน
* วันที่เริ่ม
* Due Date
* Priority
* Status
* Notes
* Checklist
* Attachment
* Dependency
* Blocking
* Comments
* Created By
* Created Date
* Updated Date

## Task Status

สถานะงานประกอบด้วย:

* ยังไม่เริ่ม — Not Started
* กำลังดำเนินการ — In Progress
* รอตรวจสอบ — Awaiting Review
* เสร็จสิ้น — Completed
* ถูกบล็อก — Blocked

## Priority

ระดับความสำคัญประกอบด้วย:

* ต่ำ — Low
* ปกติ — Normal
* สูง — High
* เร่งด่วน — Urgent

ใช้สีแยกระดับความสำคัญบน:

* Table
* Kanban
* Calendar
* Task Detail
* My Tasks
* Dashboard

อย่าใช้สีเป็นตัวสื่อความหมายเพียงอย่างเดียว ต้องมีข้อความหรือ Icon ประกอบ

## Task Views

ผู้ใช้สามารถสลับดูงานได้ 3 รูปแบบ:

* Table
* Kanban
* Calendar

ทุก View ใช้ข้อมูลชุดเดียวกัน เมื่อแก้ไขข้อมูลใน View หนึ่ง อีก View ต้องอัปเดตทันที

Kanban ต้องรองรับ Drag and Drop ระหว่างสถานะ

---

# 13. Checklist

แต่ละงานย่อยสามารถมี Checklist ภายในงานได้

Checklist ต้องสามารถ:

* เพิ่มรายการ
* แก้ไขรายการ
* ลบรายการ
* จัดลำดับ
* ติ๊กว่าเสร็จแล้ว
* ยกเลิกเครื่องหมาย
* แสดง Progress เช่น `3/5`
* แสดง Progress Bar

พฤติกรรมอัตโนมัติ:

* เมื่อ Checklist ครบทุกข้อ ให้เปลี่ยนสถานะงานเป็น Completed อัตโนมัติ
* เมื่อผู้ใช้ยกเลิก Checklist อย่างน้อยหนึ่งข้อ ให้เปลี่ยนสถานะงานกลับเป็น In Progress อัตโนมัติ
* เมื่อสถานะงานเปลี่ยน ให้คำนวณ Progress ของกิจกรรมใหม่ทันที

กรณีงานไม่มี Checklist ผู้ใช้ยังสามารถเปลี่ยนสถานะงานได้ด้วยตนเอง

---

# 14. Dependency และ Blocking

รองรับความสัมพันธ์ของงานทั้งสองแบบ:

## Dependency

กำหนดว่างานใดต้องเสร็จก่อน งานถัดไปจึงจะเริ่มได้

## Blocking

แสดงว่างานใดกำลังบล็อกงานอื่น

ระบบต้อง:

* แสดงข้อความว่างานกำลังรออะไร
* แสดงชื่อ Task ที่เกี่ยวข้อง
* แสดง Icon หรือ Badge
* ป้องกัน Circular Dependency
* แสดง Validation เมื่อผู้ใช้สร้างความสัมพันธ์ที่ไม่ถูกต้อง
* แสดงความสัมพันธ์บน Task Detail
* แสดงความสัมพันธ์บน Gantt Chart
* แสดง Warning เมื่อพยายามเริ่มงานที่ยังถูกบล็อก

สำหรับ Prototype สามารถให้ผู้ใช้ยืนยัน Override ได้หลังจากเห็น Warning

---

# 15. Due Date และ Overdue

ระบบแจ้งเตือนงานใกล้ครบกำหนดล่วงหน้า:

**1 วัน**

หากเลย Due Date และงานยังไม่ Completed:

* แสดง Badge “เกินกำหนด” หรือ “Overdue” อัตโนมัติ
* ใช้สีเตือนที่ชัดเจน
* ไม่ต้องเปลี่ยน Task Status เดิม
* ตัวอย่าง: งานยังเป็น In Progress แต่มี Badge Overdue เพิ่ม
* แสดงใน Dashboard
* แสดงใน My Tasks
* แสดงใน Task Table
* แสดงใน Kanban
* แสดงใน Calendar
* สร้าง Notification ภายในเว็บไซต์

---

# 16. Timeline

Timeline แบ่งเป็น 3 ช่วง:

* ก่อนวันงาน
* วันจัดงาน
* หลังจบงาน

แต่ละ Timeline Item มีข้อมูล:

* วันที่
* เวลาเริ่มต้น
* เวลาสิ้นสุด
* กิจกรรมหรืองาน
* ผู้รับผิดชอบ
* สถานที่
* สถานะความพร้อม
* หมายเหตุ
* Task ที่เชื่อมโยง
* Dependency ที่เกี่ยวข้อง

## Timeline Views

ผู้ใช้สามารถสลับดูได้ทุกแบบ:

* Vertical Timeline
* Calendar
* Gantt Chart

ทั้งสาม View ต้องใช้ข้อมูลชุดเดียวกัน

เมื่อเปลี่ยนข้อมูลใน View หนึ่ง อีก View ต้องอัปเดตตาม

รองรับ Drag and Drop หรือ Resize ในส่วนที่เหมาะสม เช่น:

* เปลี่ยนเวลา
* เปลี่ยนวัน
* เปลี่ยนลำดับ
* ปรับช่วงเวลาบน Gantt Chart

ก่อนเปลี่ยนข้อมูลสำคัญของ Timeline ให้มี Confirmation Dialog

---

# 17. File Management

## File Categories

หมวดหมู่เริ่มต้นประกอบด้วย:

* กำหนดการ
* PowerPoint
* รายชื่อผู้เข้าร่วม
* โปสเตอร์กิจกรรม
* Script พิธีกร

รองรับการเพิ่มหมวดหมู่เพิ่มเติมใน Prototype

## Supported File Types

รองรับ:

* PowerPoint
* Excel
* PDF
* Word
* Images

กำหนดขนาดไฟล์สูงสุด:

**50 MB ต่อไฟล์**

เมื่อไฟล์เกินขนาด ให้แสดง Validation ที่เข้าใจง่าย

## Upload Methods

รองรับ:

* เลือกไฟล์จากคอมพิวเตอร์
* Drag and Drop
* อัปโหลดหลายไฟล์
* Upload Progress
* Success State
* Failed State
* Retry
* Cancel Upload

## File Preview

สร้าง Preview UI ที่เหมาะสมตามประเภทไฟล์:

* รูปภาพ: แสดงภาพ
* PDF: แสดง Document Preview จำลอง
* PowerPoint: แสดง Slide Thumbnail จำลอง
* Excel: แสดง Spreadsheet Preview จำลอง
* Word: แสดง Document Page Preview จำลอง

ไม่จำเป็นต้อง Parse ไฟล์จริงทั้งหมด แต่ต้องทำ Preview Experience ให้ดูสมจริง

## File Actions

ผู้ใช้สามารถ:

* ดาวน์โหลด
* เปลี่ยนชื่อ
* อัปโหลดเวอร์ชันใหม่
* ย้ายหมวดหมู่
* ลบ
* กู้คืน
* ดูประวัติเวอร์ชัน
* ดูผู้แก้ไข
* ดูวันที่แก้ไข
* เปิด Preview

## File Version History

ระบบต้องเก็บ Mock Version History เช่น:

* Version Number
* Filename
* Uploaded By
* Uploaded Date
* File Size
* Change Note

ผู้ใช้สามารถดูเวอร์ชันเก่าและเลือก Restore Version ได้

ก่อน Restore ต้องมี Confirmation Dialog และอธิบายว่าระบบจะสร้าง Current Version ใหม่จากเวอร์ชันที่เลือก

---

# 18. Trash

ไฟล์ที่ลบต้องถูกย้ายไป Trash เป็นเวลา:

**30 วัน**

Trash ต้องแสดง:

* ชื่อไฟล์
* ประเภทไฟล์
* Event
* ผู้ลบ
* วันที่ลบ
* จำนวนวันที่เหลือก่อนลบถาวร
* Restore Action
* Delete Permanently Action

สำหรับ Prototype ให้จำลอง Countdown จาก Mock Date

ก่อนลบถาวรต้องมี Confirmation Dialog ที่ชัดเจน

---

# 19. Save Behavior

ใช้ทั้ง Auto Save และ Manual Save ตามประเภทข้อมูล

## Auto Save

ใช้กับ:

* เปลี่ยนสถานะงาน
* Drag and Drop Kanban
* จัดลำดับ Checklist
* ติ๊ก Checklist
* Notification Settings
* การแก้ไขเล็กน้อยที่ย้อนกลับได้ง่าย

แสดงสถานะ:

* Saving
* Saved
* Failed to Save

## Manual Save

ใช้กับ:

* สร้างหรือแก้ไขกิจกรรม
* สร้างหรือแก้ไขงาน
* แก้ไข Timeline สำคัญ
* อัปโหลดไฟล์
* เปลี่ยนชื่อไฟล์
* ย้ายหมวดหมู่
* Restore Version
* Import Participants

---

# 20. Confirmation Dialog

การลบหรือเปลี่ยนแปลงข้อมูลสำคัญต้องมี Confirmation Dialog เช่น:

* ลบกิจกรรม
* ยกเลิกกิจกรรม
* ลบงาน
* ลบ Checklist
* ลบไฟล์
* ลบไฟล์ถาวร
* Restore File Version
* เปลี่ยน Timeline สำคัญ
* Duplicate Event
* Import Participants
* เปลี่ยนข้อมูลผู้เข้าร่วมจำนวนมาก

Dialog ต้องแสดง:

* สิ่งที่กำลังจะเกิดขึ้น
* ผลกระทบ
* ชื่อข้อมูลที่ได้รับผลกระทบ
* ปุ่มยืนยันที่สื่อความหมายชัดเจน
* ปุ่มยกเลิก
* Destructive Style สำหรับ Action ที่ย้อนกลับไม่ได้

---

# 21. Participants

สร้างหน้า Participants ภายในแต่ละ Event

ข้อมูลผู้เข้าร่วมประกอบด้วย:

* ชื่อ–นามสกุล
* อีเมล
* แผนก
* เบอร์โทร
* สถานะตอบรับ
* ประเภทผู้เข้าร่วม
* หมายเหตุ

## RSVP Status

สถานะตอบรับประกอบด้วย:

* ยังไม่ตอบรับ
* เข้าร่วม
* ไม่เข้าร่วม

แสดง Summary Card เช่น:

* ผู้เข้าร่วมทั้งหมด
* เข้าร่วม
* ไม่เข้าร่วม
* ยังไม่ตอบรับ

## Participant Type

ประเภทผู้เข้าร่วมประกอบด้วย:

* พนักงาน
* ผู้บริหาร
* วิทยากร
* แขกภายนอก
* ทีมงานจัดงาน

ใช้ Badge และสีช่วยแยกประเภท แต่ต้องมีข้อความกำกับ

## Participant Actions

ผู้ใช้สามารถ:

* เพิ่มรายชื่อ
* แก้ไข
* ลบ
* ค้นหา
* Filter
* Sort
* Bulk Select
* Bulk Change RSVP
* Export Excel
* Import Excel

---

# 22. Import Participants from Excel

รองรับการนำเข้ารายชื่อจาก Excel

Flow การนำเข้า:

1. เลือกหรือ Drag and Drop ไฟล์ Excel
2. แสดง Upload State
3. แสดง Mapping Column
4. แสดง Preview ข้อมูล
5. ตรวจสอบ Required Fields
6. แสดง Error รายแถว
7. ตรวจสอบอีเมลซ้ำ
8. แก้ Conflict
9. แสดง Import Summary
10. Confirm Import
11. แสดงผลสำเร็จหรือผิดพลาด

## Duplicate Email Resolution

เมื่อพบอีเมลซ้ำ ให้เปิดหน้า Conflict Resolution แยกต่างหาก

แสดงข้อมูลแบบเปรียบเทียบซ้าย–ขวา:

* ฝั่งซ้าย: ข้อมูลเดิมในระบบ
* ฝั่งขวา: ข้อมูลใหม่จาก Excel

แสดงทุก Field ที่แตกต่างกันอย่างชัดเจน

ผู้ใช้เลือกได้เฉพาะ:

* ใช้ข้อมูลเดิมทั้งชุด
* ใช้ข้อมูลใหม่ทั้งชุด

ห้ามเลือกผสมทีละ Field

รองรับ:

* เลือกทีละรายการ
* Apply Choice to All
* Next/Previous Conflict
* Conflict Progress เช่น `2 จาก 8`
* Summary ก่อนยืนยัน Import

---

# 23. Comments และ Collaboration

แต่ละ Task ต้องมี Comment Section

รองรับ:

* เพิ่มความคิดเห็น
* Reply แบบ Thread
* Mention สมาชิกด้วย `@`
* แนบไฟล์
* แก้ไขความคิดเห็นของผู้ใช้ปัจจุบัน
* ลบความคิดเห็น
* Timestamp
* Edited Indicator
* Avatar
* Emoji Reaction แบบเรียบง่าย หากเหมาะสม

เมื่อ Mention สมาชิก ให้สร้าง Notification ภายในเว็บไซต์

---

# 24. Notifications

Notification แสดงเฉพาะภายในเว็บไซต์ ไม่ต้องจำลอง Email

ตำแหน่งแสดง:

* Notification Bell
* Notification Dropdown
* Notification Page

ประเภท Notification:

* ได้รับมอบหมายงานใหม่
* งานใกล้ครบกำหนด
* งานเกินกำหนด
* มีการแก้ไขไฟล์
* มีการอัปโหลดเวอร์ชันใหม่
* ถูก Mention
* Timeline เปลี่ยนแปลง
* Checklist เสร็จครบ
* Task ถูก Block หรือ Unblock

รองรับ:

* Read/Unread
* Mark as Read
* Mark All as Read
* Filter ตามประเภท
* ลิงก์ไปยังข้อมูลที่เกี่ยวข้อง
* Unread Badge

## Notification Settings

ผู้ใช้สามารถเปิด–ปิดแยกตามประเภท:

* งานที่ได้รับมอบหมาย
* งานใกล้ครบกำหนด
* การแก้ไขไฟล์
* Mention
* การเปลี่ยนแปลง Timeline

ใช้ Auto Save และแสดง Saved State

---

# 25. Search, Filter และ Sort

สร้าง Global Search ที่ค้นหาได้จาก:

* ชื่อกิจกรรม
* วันที่กิจกรรม
* ผู้รับผิดชอบ
* สถานะงาน
* ชื่องาน
* ชื่อไฟล์
* ประเภทไฟล์
* ผู้เข้าร่วม
* แผนก
* อีเมล

แต่ละหน้าต้องมี Filter และ Sort ที่เหมาะสม

ตัวอย่าง Filter:

* Event Status
* Task Status
* Priority
* Assignee
* Due Date
* Overdue
* File Type
* File Category
* Participant Type
* RSVP Status

แสดง Active Filter เป็น Chip และมี Clear All

---

# 26. Export

รองรับการส่งออกทั้ง:

* PDF
* Excel

## PDF Export

ใช้สำหรับสรุปภาพรวมกิจกรรม เช่น:

* ข้อมูลกิจกรรม
* Progress
* Task Summary
* Timeline
* Participant Summary
* File Summary

สำหรับ Prototype สามารถสร้าง Mock Export Flow และดาวน์โหลดไฟล์ตัวอย่างที่สร้างจากข้อมูล Mock ได้

## Excel Export

ใช้สำหรับ:

* รายการงาน
* Timeline
* รายชื่อผู้เข้าร่วม
* สถานะตอบรับ
* รายการไฟล์
* Activity History

แสดง Export Dialog เพื่อเลือกข้อมูลที่ต้องการส่งออก

---

# 27. Activity History

สร้าง Activity History ที่บันทึก Mock Activity เช่น:

* ใครสร้างกิจกรรม
* ใครแก้ไขกิจกรรม
* ใครสร้างงาน
* ใครเปลี่ยนสถานะงาน
* ใครเพิ่ม Checklist
* ใครอัปโหลดไฟล์
* ใครอัปโหลดเวอร์ชันใหม่
* ใคร Restore Version
* ใครแก้ Timeline
* ใคร Import Participant
* ใครแก้ Conflict
* ใคร Comment หรือ Mention

แต่ละรายการแสดง:

* ผู้ดำเนินการ
* Action
* Target
* Event
* Date/Time
* Before/After Summary หากเหมาะสม

รองรับ Search และ Filter

---

# 28. User Profile

หน้า User Profile แสดง:

* Avatar
* ชื่อ–นามสกุล
* ตำแหน่ง
* ทีม
* Corporate Email
* งานที่ได้รับมอบหมาย
* งานที่ใกล้ครบกำหนด
* งานที่เสร็จล่าสุด
* Recent Activity
* Notification Settings
* Language
* Theme

---

# 29. Loading, Empty และ Error States

ทุกหน้าที่มีข้อมูลต้องมี:

## Loading State

ใช้ Skeleton หรือ Loading Indicator ที่เหมาะสม

## Empty State

ต้องมี:

* Icon หรือ Illustration
* คำอธิบาย
* Suggested Next Action
* CTA ที่กดใช้งานได้

## Error State

ต้องมี:

* ข้อความเข้าใจง่าย
* Retry Button
* ทางเลือกกลับหน้าก่อนหน้า
* ไม่แสดง Technical Error ที่ผู้ใช้ทั่วไปไม่เข้าใจ

สร้าง Demo Toggle หรือ Developer Utility ภายใน Prototype เพื่อทดสอบ Loading, Empty และ Error State ได้

---

# 30. Accessibility

ต้องให้ความสำคัญกับ Accessibility ดังนี้:

* Semantic HTML
* Keyboard Navigation
* Visible Focus State
* Accessible Modal
* Accessible Dropdown
* Accessible Tabs
* Accessible Form Label
* Error Message เชื่อมกับ Field
* ARIA Attribute ตามความจำเป็น
* WCAG AA Contrast
* ไม่ใช้สีเพียงอย่างเดียวในการสื่อความหมาย
* รองรับ Screen Reader ใน Action สำคัญ
* รองรับ `prefers-reduced-motion`

ทดสอบการใช้งาน Main Flow ด้วย Keyboard

---

# 31. Responsive Design

รองรับ:

* Desktop
* Tablet
* Mobile

ตรวจสอบเป็นพิเศษ:

* Sidebar
* Bottom Navigation
* Dashboard Cards
* Table
* Kanban
* Calendar
* Gantt Chart
* File Preview
* Import Excel
* Left–Right Conflict Comparison
* Modal
* Drawer
* Comment Thread

บน Mobile ตารางที่มีข้อมูลมากควรเปลี่ยนเป็น Card View หรือ Horizontal Scroll อย่างเหมาะสม

หน้าเปรียบเทียบข้อมูลซ้ำบน Mobile สามารถเปลี่ยนจากซ้าย–ขวาเป็นบน–ล่าง แต่ยังต้องสื่อว่าเป็นข้อมูลเดิมเทียบกับข้อมูลใหม่อย่างชัดเจน

---

# 32. Development Plan

ก่อนเริ่มเขียน Source Code ให้สร้างไฟล์:

`EventFlow PLAN.md`

แบ่งการพัฒนาเป็น Phase ที่เหมาะสม โดยให้คุณตัดสินใจลำดับเอง

แต่ละ Phase ต้องมี Checklist อย่างน้อยในหัวข้อ:

* UI
* Interaction
* Mock Data
* Responsive
* Accessibility
* Testing
* Done Criteria

ตัวอย่างแนวทาง Phase:

1. Project Setup และ Design System
2. Authentication และ Application Shell
3. Dashboard
4. Event Management
5. Task, Kanban และ Checklist
6. Timeline, Calendar และ Gantt
7. File Management และ Version History
8. Participants และ Excel Import
9. Collaboration และ Notifications
10. Search, Export, Activity และ Profile
11. Accessibility, Responsive และ Final QA

สามารถปรับ Phase ได้ตามความเหมาะสม

หลังจบแต่ละ Phase ให้ดำเนินการตรวจสอบและแก้ไขทันที โดยไม่ต้องรอคำยืนยันจากผู้ใช้

---

# 33. Testing Requirements

## Manual Testing หลังแต่ละ Phase

ตรวจสอบ:

* ทุก Route
* Navigation
* Button
* Form
* Validation
* Modal
* Dropdown
* Status Change
* Drag and Drop
* Theme Switch
* Language Switch
* Responsive
* Console Error
* Accessibility พื้นฐาน

## Unit Tests

เขียน Unit Tests สำหรับส่วนสำคัญ เช่น:

* Event Progress Calculation
* Checklist Auto Status
* Overdue Calculation
* Due Soon Calculation
* File Size Validation
* Duplicate Email Detection
* Import Conflict Resolution
* Search และ Filter Utilities

## Playwright E2E

สร้าง E2E Test สำหรับ Main Flow:

1. Login
2. สร้างกิจกรรม
3. เพิ่ม Task
4. Assign ผู้รับผิดชอบหลายคน
5. เพิ่ม Checklist
6. ติ๊ก Checklist จนครบ
7. ตรวจสอบ Task Auto Completed
8. ตรวจสอบ Event Progress
9. Upload File
10. Add Timeline
11. Comment และ Mention
12. เปิด Notification
13. Import Participants
14. Resolve Duplicate Email
15. Export PDF หรือ Excel

---

# 34. README

สร้าง `README.md` ที่ประกอบด้วย:

* Project Overview
* Features
* Technology Stack
* Installation
* Development Command
* Build Command
* Test Command
* Playwright Command
* Mock Account
* Project Structure
* Deployment to Vercel
* Prototype Limitations
* Reset Behavior หลัง Refresh
* รายละเอียดว่าไม่มี Backend และ Database

---

# 35. Final Quality Requirements

ก่อนถือว่างานเสร็จ ต้องตรวจสอบว่า:

* Source Code Run ได้จริง
* Build ผ่าน
* TypeScript ไม่มี Error
* ไม่มี Console Error ที่สำคัญ
* ทุก Route เปิดได้
* ไม่มีปุ่มหลักที่กดแล้วไม่ทำงาน
* Main Flow ทำงานครบ
* TH/EN ทำงานทุกหน้า
* Light/Dark Mode ทำงานทุกหน้า
* Responsive ใช้งานได้จริง
* Loading, Empty, Error State มีครบ
* Mock Data สมจริง
* Accessibility พื้นฐานผ่าน
* Unit Tests ผ่าน
* Playwright Main Flow ผ่าน
* พร้อม Deploy บน Vercel

---

# 36. Working Instructions

ให้เริ่มดำเนินการทันทีตามลำดับดังนี้:

1. วิเคราะห์ Requirement ทั้งหมด
2. สร้าง `EventFlow PLAN.md`
3. ตั้งค่า Project
4. พัฒนาทีละ Phase
5. ทดสอบหลังจบแต่ละ Phase
6. แก้ไขปัญหาก่อนเข้าสู่ Phase ถัดไป
7. สร้าง README
8. รัน Build และ Tests
9. ตรวจ Final QA
10. เตรียม Project ให้พร้อม Deploy บน Vercel

ไม่ต้องหยุดรอคำยืนยันระหว่าง Phase

หากรายละเอียดเล็กน้อยไม่ได้ระบุไว้ ให้เลือกแนวทางที่เหมาะสมที่สุดกับระบบบริหารกิจกรรมภายในองค์กร โดยรักษาความสอดคล้องของ UX และไม่ตัด Feature หลักที่ระบุไว้

ผลลัพธ์สุดท้ายต้องเป็น Interactive Prototype ที่ดูเป็นผลิตภัณฑ์จริง ไม่ใช่เพียงชุดหน้าจอสำหรับนำเสนอ
