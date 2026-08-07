import type { Comment } from "@/types/comment"

/**
 * ความคิดเห็นตัวอย่างในงานสำคัญ 5 งานของงานเลี้ยงประจำปี
 *
 * เวลาของ mention ตรงกับ Notification "ถูกกล่าวถึง" ใน mock/notifications.ts
 * เพื่อให้เรื่องราวสอดคล้องกันเมื่อผู้ใช้คลิกตามการแจ้งเตือน
 */
export const MOCK_COMMENTS: Comment[] = [
  /* ---- t-5: ส่งไฟล์อาร์ตเวิร์กให้โรงพิมพ์ ---- */
  {
    id: "c-1",
    taskId: "t-5",
    authorId: "u-2",
    body: {
      th: "อัปเดตอาร์ตเวิร์กโปสเตอร์เป็นเวอร์ชัน 3 แล้ว แก้สีตามที่โรงแรมขอ ไฟล์แนบด้านล่างครับ",
      en: "Poster artwork is now on version 3 with the colour fixes the hotel asked for — file attached.",
    },
    parentId: null,
    mentionIds: [],
    attachments: [
      {
        id: "ca-1",
        filename: "poster-golden-night-v3.pdf",
        size: 8_912_000,
        type: "pdf",
      },
    ],
    reactions: [{ emoji: "👍", userIds: ["u-1", "u-6"] }],
    createdAt: "2026-07-30T11:40:00+07:00",
    updatedAt: null,
    isEdited: false,
  },
  {
    id: "c-2",
    taskId: "t-5",
    authorId: "u-1",
    body: {
      th: "@หฤทัย ทิพยประไพ ช่วยยืนยันกับโรงพิมพ์อีกทีว่าแบ็คดรอปใช้ขนาด 6x3 เมตร แล้วส่งใบเสนอราคาเข้ามาในงานนี้ด้วยนะคะ",
      en: "@Haruthai Tipprapai please double-check with the printer that the backdrop is 6x3 m and drop the quotation into this task.",
    },
    parentId: "c-1",
    mentionIds: ["u-2"],
    attachments: [],
    reactions: [],
    createdAt: "2026-07-30T14:20:00+07:00",
    updatedAt: null,
    isEdited: false,
  },
  {
    id: "c-3",
    taskId: "t-5",
    authorId: "u-2",
    body: {
      th: "รับทราบครับ โรงพิมพ์ยืนยันแล้วว่า 6x3 เมตร ราคาเดิม ส่งของวันที่ 10 ก.ย.",
      en: "Confirmed — 6x3 m at the original price, delivery on 10 Sep.",
    },
    parentId: "c-2",
    mentionIds: [],
    attachments: [],
    reactions: [{ emoji: "🎉", userIds: ["u-1"] }],
    createdAt: "2026-07-31T09:05:00+07:00",
    updatedAt: null,
    isEdited: false,
  },

  /* ---- t-6: สรุปเมนูอาหารกับโรงแรม ---- */
  {
    id: "c-4",
    taskId: "t-6",
    authorId: "u-5",
    body: {
      th: "@พีรพล จันทะแจ่ม ยอดล่าสุด มังสวิรัติ 6 ที่ ฮาลาล 9 ที่ ขอให้ยืนยันกับโรงแรมภายในศุกร์นี้นะคะ งบยังอยู่ในกรอบ",
      en: "@Papitchamon Sankan latest count is 6 vegetarian and 9 halal seats — please confirm with the hotel by this Friday. Still within budget.",
    },
    parentId: null,
    mentionIds: ["u-7"],
    attachments: [],
    reactions: [],
    createdAt: "2026-07-28T16:10:00+07:00",
    updatedAt: "2026-07-28T16:25:00+07:00",
    isEdited: true,
  },
  {
    id: "c-5",
    taskId: "t-6",
    authorId: "u-7",
    body: {
      th: "รับเรื่องค่ะ นัดชิมเมนูกับเชฟวันพุธหน้า เดี๋ยวสรุปผลในงานนี้อีกที",
      en: "On it — menu tasting with the chef is next Wednesday, will report back here.",
    },
    parentId: "c-4",
    mentionIds: [],
    attachments: [],
    reactions: [{ emoji: "🙏", userIds: ["u-5", "u-1"] }],
    createdAt: "2026-07-29T08:50:00+07:00",
    updatedAt: null,
    isEdited: false,
  },

  /* ---- t-8: สรุปยอดจองโต๊ะรอบแรก ---- */
  {
    id: "c-6",
    taskId: "t-8",
    authorId: "u-1",
    body: {
      th: "@กิตติคุณ เจริญพานิช ขอไฟล์สรุปยอดจองโต๊ะรายแผนกจากระบบหน่อยค่ะ จะเอาไปวางผังที่นั่งต่อ",
      en: "@Kittikoon Charoenphanich could you pull the per-department booking summary from the system? Need it for the seating chart.",
    },
    parentId: null,
    mentionIds: ["u-3"],
    attachments: [],
    reactions: [],
    createdAt: "2026-07-29T09:35:00+07:00",
    updatedAt: null,
    isEdited: false,
  },
  {
    id: "c-7",
    taskId: "t-8",
    authorId: "u-3",
    body: {
      th: "จัดให้ค่ะ แนบไฟล์ Excel ยอดจองล่าสุด 62 โต๊ะ ครบทุกแผนกแล้ว",
      en: "Here you go — Excel attached with the latest 62 table bookings across every department.",
    },
    parentId: "c-6",
    mentionIds: [],
    attachments: [
      {
        id: "ca-2",
        filename: "table-bookings-round1.xlsx",
        size: 214_500,
        type: "excel",
      },
    ],
    reactions: [{ emoji: "❤️", userIds: ["u-1"] }],
    createdAt: "2026-07-29T13:15:00+07:00",
    updatedAt: null,
    isEdited: false,
  },

  /* ---- t-15: ตรวจสอบระบบเสียงและแสง ---- */
  {
    id: "c-8",
    taskId: "t-15",
    authorId: "u-1",
    body: {
      th: "@ธีรดา ศิริสัมพันธ์ ทีมเทคนิคโรงแรมขอเลื่อนทดสอบระบบเป็นบ่ายสอง วันเดิม สะดวกไหมคะ",
      en: "@Teerada Sirisumphandh the hotel's technical team asked to move the rig test to 2 pm same day — does that work?",
    },
    parentId: null,
    mentionIds: ["u-4"],
    attachments: [],
    reactions: [],
    createdAt: "2026-07-24T11:00:00+07:00",
    updatedAt: null,
    isEdited: false,
  },
  {
    id: "c-9",
    taskId: "t-15",
    authorId: "u-4",
    body: {
      th: "สะดวกครับ เดี๋ยวพาทีม MC ไปลองไมค์พร้อมกันเลย จะได้จบในรอบเดียว",
      en: "Works for me — I'll bring the MC team to test the mics in the same session.",
    },
    parentId: "c-8",
    mentionIds: [],
    attachments: [],
    reactions: [{ emoji: "👍", userIds: ["u-1", "u-6"] }],
    createdAt: "2026-07-24T11:32:00+07:00",
    updatedAt: null,
    isEdited: false,
  },

  /* ---- t-17: จัดทำลำดับพิธีการ (Run Down) ---- */
  {
    id: "c-10",
    taskId: "t-17",
    authorId: "u-1",
    body: {
      th: "@อัณชวิศศ์ ปาร์มวงศ์ ร่าง Run Down รอบสองอยู่ในแท็บไฟล์แล้ว ช่วงมอบรางวัลขยับไป 19:45 ตามที่ประชุมกันนะคะ",
      en: "@Aunchawis Parmwong the second run-down draft is in the Files tab — the awards segment moves to 19:45 as agreed.",
    },
    parentId: null,
    mentionIds: ["u-6"],
    attachments: [],
    reactions: [],
    createdAt: "2026-07-26T13:45:00+07:00",
    updatedAt: null,
    isEdited: false,
  },
  {
    id: "c-11",
    taskId: "t-17",
    authorId: "u-6",
    body: {
      th: "เห็นแล้วครับ ผมปรับสคริปต์พิธีกรช่วงเปิดงานให้สั้นลง 5 นาทีเพื่อชดเชยเวลา เดี๋ยวอัปโหลดเวอร์ชันใหม่",
      en: "Got it — I trimmed the opening MC script by five minutes to compensate. Uploading the new version shortly.",
    },
    parentId: "c-10",
    mentionIds: [],
    attachments: [],
    reactions: [],
    createdAt: "2026-07-26T15:20:00+07:00",
    updatedAt: "2026-07-26T15:26:00+07:00",
    isEdited: true,
  },
  {
    id: "c-12",
    taskId: "t-17",
    authorId: "u-1",
    body: {
      th: "เยี่ยมมาก ขอบคุณค่ะ 🙏",
      en: "Perfect, thank you! 🙏",
    },
    parentId: "c-11",
    mentionIds: [],
    attachments: [],
    reactions: [{ emoji: "😄", userIds: ["u-6"] }],
    createdAt: "2026-07-26T16:02:00+07:00",
    updatedAt: null,
    isEdited: false,
  },
]
