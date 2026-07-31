import type { th } from "./dictionaries/th"

/**
 * โครงสร้างพจนานุกรม — อ้างอิงจากภาษาไทยเป็นต้นแบบ
 * แปลงค่าทุกใบเป็น `string` เพื่อให้ภาษาอื่นใส่ข้อความของตัวเองได้
 */
export type Dictionary = {
  [Section in keyof typeof th]: {
    [Key in keyof (typeof th)[Section]]: string
  }
}

/** ทุก key ที่ใช้ได้ในรูปแบบ `section.key` เช่น `auth.signIn` */
export type TranslationKey = {
  [Section in keyof Dictionary & string]: `${Section}.${keyof Dictionary[Section] & string}`
}[keyof Dictionary & string]
