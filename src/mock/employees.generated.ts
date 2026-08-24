// ไฟล์นี้สร้างอัตโนมัติโดย scripts/generate-employee-data.mjs — ห้ามแก้ด้วยมือ
import type { Employee } from "@/types/employee"

export const IMPORTED_EMPLOYEES = [
  {
    "id": "emp-contact-1",
    "employeeCode": "1",
    "firstName": {
      "th": "โคจิ",
      "en": "Koji"
    },
    "lastName": {
      "th": "นาคามูระ",
      "en": "NAKAMURA"
    },
    "nickname": {
      "th": "นาคามูระซัง",
      "en": "Nakamura-san"
    },
    "department": {
      "th": "",
      "en": ""
    },
    "position": {
      "th": "President",
      "en": "President"
    },
    "email": "koji.n@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-2",
    "employeeCode": "2",
    "firstName": {
      "th": "ภาคภูมิ",
      "en": "Parkpoom"
    },
    "lastName": {
      "th": "สินิทธ์วรากุล",
      "en": "Sinitwarakul"
    },
    "nickname": {
      "th": "พี่หนุ่ม",
      "en": "Num"
    },
    "department": {
      "th": "",
      "en": ""
    },
    "position": {
      "th": "System Engineer Director",
      "en": "System Engineer Director"
    },
    "email": "parkpoom.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-3",
    "employeeCode": "3",
    "firstName": {
      "th": "โยชิโนริ",
      "en": "Yoshinori"
    },
    "lastName": {
      "th": "ซากุระอิ",
      "en": "SAKURAI"
    },
    "nickname": {
      "th": "ซากุระอิซัง",
      "en": "Sakurai san"
    },
    "department": {
      "th": "Accounting & Administration Section, Human Resources Section",
      "en": "Accounting & Administration Section, Human Resources Section"
    },
    "position": {
      "th": "General Affairs Director",
      "en": "General Affairs Director"
    },
    "email": "yoshinori.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-4",
    "employeeCode": "4",
    "firstName": {
      "th": "อลิสา",
      "en": "Alisa"
    },
    "lastName": {
      "th": "ลีลายุวัฒนกุล",
      "en": "Leelayuwattanakul"
    },
    "nickname": {
      "th": "นุ่น",
      "en": "Nun"
    },
    "department": {
      "th": "Accounting & Administration Section",
      "en": "Accounting & Administration Section"
    },
    "position": {
      "th": "Assistant Section Manager",
      "en": "Assistant Section Manager"
    },
    "email": "alisa.l@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-5",
    "employeeCode": "5",
    "firstName": {
      "th": "อารีรัตน์",
      "en": "Arrerat"
    },
    "lastName": {
      "th": "ประสงค์เจริญ",
      "en": "Prasongjaroen"
    },
    "nickname": {
      "th": "อารัตน์",
      "en": "Arrat"
    },
    "department": {
      "th": "System Consultant Section",
      "en": "System Consultant Section"
    },
    "position": {
      "th": "Assistant Team Leader",
      "en": "Assistant Team Leader"
    },
    "email": "arrerat.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-6",
    "employeeCode": "6",
    "firstName": {
      "th": "พลอยปภัสร์",
      "en": "Ploypapas"
    },
    "lastName": {
      "th": "ใจบุญ",
      "en": "Jaiboon"
    },
    "nickname": {
      "th": "โอ๊ต",
      "en": "Oat"
    },
    "department": {
      "th": "Engineering Administration & Sales Support Section",
      "en": "Engineering Administration & Sales Support Section"
    },
    "position": {
      "th": "Team Leader",
      "en": "Team Leader"
    },
    "email": "ploypapas.j@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-7",
    "employeeCode": "7",
    "firstName": {
      "th": "เสาวลักษณ์",
      "en": "Saowalak"
    },
    "lastName": {
      "th": "นาคะนันต์",
      "en": "Nakanun"
    },
    "nickname": {
      "th": "หง",
      "en": "Hong"
    },
    "department": {
      "th": "Java Platform Section, Outsourcing Business Section",
      "en": "Java Platform Section, Outsourcing Business Section"
    },
    "position": {
      "th": "Team Leader",
      "en": "Team Leader"
    },
    "email": "saowalak.n@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-8",
    "employeeCode": "8",
    "firstName": {
      "th": "ศันสนีย์",
      "en": "Sansanee"
    },
    "lastName": {
      "th": "แก้วอินทร์",
      "en": "Kaew-in"
    },
    "nickname": {
      "th": "ออม",
      "en": "Aom"
    },
    "department": {
      "th": "Rapid Development Section",
      "en": "Rapid Development Section"
    },
    "position": {
      "th": "Senior Technical Specialist",
      "en": "Senior Technical Specialist"
    },
    "email": "sansanee.k@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-9",
    "employeeCode": "9",
    "firstName": {
      "th": "วีระชัย",
      "en": "Weerachai"
    },
    "lastName": {
      "th": "วงศ์ทองเสริม",
      "en": "Wongthongserm"
    },
    "nickname": {
      "th": "ตุ้ง",
      "en": "Tung"
    },
    "department": {
      "th": "AEON Section, Infrastructure Engineer Section",
      "en": "AEON Section, Infrastructure Engineer Section"
    },
    "position": {
      "th": "Team Leader",
      "en": "Team Leader"
    },
    "email": "weerachai.w@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-10",
    "employeeCode": "10",
    "firstName": {
      "th": "บุณยพัต",
      "en": "Bunyapat"
    },
    "lastName": {
      "th": "ลิ้มรังสรรค์",
      "en": "Limrangsan"
    },
    "nickname": {
      "th": "โย",
      "en": "Yo"
    },
    "department": {
      "th": "JP Software Development & Consultant Section, Rapid Development Section",
      "en": "JP Software Development & Consultant Section, Rapid Development Section"
    },
    "position": {
      "th": "Business Unit Leader",
      "en": "Business Unit Leader"
    },
    "email": "bunyapat.l@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-11",
    "employeeCode": "11",
    "firstName": {
      "th": "วริยาภรณ์",
      "en": "Wariyaphorn"
    },
    "lastName": {
      "th": "นันทสวัสดิ์",
      "en": "Nantasawat"
    },
    "nickname": {
      "th": "แนน",
      "en": "Nan"
    },
    "department": {
      "th": "Automobile Section, Lenovation Solution Section",
      "en": "Automobile Section, Lenovation Solution Section"
    },
    "position": {
      "th": "Team Leader",
      "en": "Team Leader"
    },
    "email": "wariyaphorn.n@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-12",
    "employeeCode": "12",
    "firstName": {
      "th": "หฤทัย",
      "en": "Haruthai"
    },
    "lastName": {
      "th": "ทิพยประไพ",
      "en": "Tipprapai"
    },
    "nickname": {
      "th": "บัว",
      "en": "Bua"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Assistant Team Leader",
      "en": "Assistant Team Leader"
    },
    "email": "haruthai.t@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-13",
    "employeeCode": "13",
    "firstName": {
      "th": "ชเนษฎ์",
      "en": "Chanade"
    },
    "lastName": {
      "th": "ศิริบูรพารัตน์",
      "en": "Siriburaparat"
    },
    "nickname": {
      "th": "เหน็ก",
      "en": "Nex"
    },
    "department": {
      "th": "JP Software Development & Consultant Section",
      "en": "JP Software Development & Consultant Section"
    },
    "position": {
      "th": "Team Leader",
      "en": "Team Leader"
    },
    "email": "chanade.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-14",
    "employeeCode": "14",
    "firstName": {
      "th": "กิตติคุณ",
      "en": "Kittikoon"
    },
    "lastName": {
      "th": "เจริญพานิช",
      "en": "Charoenphanich"
    },
    "nickname": {
      "th": "กบ",
      "en": "Kero"
    },
    "department": {
      "th": "Research & Development Section, Worldwide Innovative  Section",
      "en": "Research & Development Section, Worldwide Innovative  Section"
    },
    "position": {
      "th": "Assistant Team Leader",
      "en": "Assistant Team Leader"
    },
    "email": "kittikoon.c@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-15",
    "employeeCode": "15",
    "firstName": {
      "th": "วรายุทธ",
      "en": "Warayut"
    },
    "lastName": {
      "th": "ขวัญเจริญ",
      "en": "Kwanjaroen"
    },
    "nickname": {
      "th": "ยุทธ",
      "en": "Yut"
    },
    "department": {
      "th": "Software Package Solution Section",
      "en": "Software Package Solution Section"
    },
    "position": {
      "th": "Team Leader",
      "en": "Team Leader"
    },
    "email": "warayut.k@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-16",
    "employeeCode": "16",
    "firstName": {
      "th": "มนตรี",
      "en": "Montree"
    },
    "lastName": {
      "th": "บริพันธ์",
      "en": "Boripan"
    },
    "nickname": {
      "th": "นัท",
      "en": "Nut"
    },
    "department": {
      "th": "Outsourcing Business Section",
      "en": "Outsourcing Business Section"
    },
    "position": {
      "th": "Assistant Team Leader",
      "en": "Assistant Team Leader"
    },
    "email": "montree.b@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-17",
    "employeeCode": "17",
    "firstName": {
      "th": "ทัชธรัญ",
      "en": "Tataran"
    },
    "lastName": {
      "th": "เถาว์เพ็ชร",
      "en": "Thowpet"
    },
    "nickname": {
      "th": "แบงค์",
      "en": "Bank"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Assistant Leader",
      "en": "Assistant Leader"
    },
    "email": "tataran.t@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-18",
    "employeeCode": "18",
    "firstName": {
      "th": "วชิรวิทย์",
      "en": "Wachirawit"
    },
    "lastName": {
      "th": "จันทร์แก้ว",
      "en": "Chankaew"
    },
    "nickname": {
      "th": "ตูม",
      "en": "Toom"
    },
    "department": {
      "th": "Research & Development Section",
      "en": "Research & Development Section"
    },
    "position": {
      "th": "Technical Specialist",
      "en": "Technical Specialist"
    },
    "email": "wachirawit.c@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-19",
    "employeeCode": "19",
    "firstName": {
      "th": "ณัฐพงษ์",
      "en": "Nattapong"
    },
    "lastName": {
      "th": "นามวัฒน์",
      "en": "Namwat"
    },
    "nickname": {
      "th": "บอล",
      "en": "Ball"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Senior Technical Specialist",
      "en": "Senior Technical Specialist"
    },
    "email": "nattapong.n@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-20",
    "employeeCode": "20",
    "firstName": {
      "th": "สุรชัย",
      "en": "Surachai"
    },
    "lastName": {
      "th": "นุ่มประสงค์",
      "en": "Numprasong"
    },
    "nickname": {
      "th": "กอล์ฟ",
      "en": "Golf"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Leader",
      "en": "Leader"
    },
    "email": "surachai.n@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-21",
    "employeeCode": "21",
    "firstName": {
      "th": "สุจินต์",
      "en": "Sujin"
    },
    "lastName": {
      "th": "ตันทพงษ์",
      "en": "Tantapong"
    },
    "nickname": {
      "th": "มะเหมี่ยว",
      "en": "Ma-meaw"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Assistant Leader",
      "en": "Assistant Leader"
    },
    "email": "sujin.t@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-22",
    "employeeCode": "22",
    "firstName": {
      "th": "ธีรดา",
      "en": "Teerada"
    },
    "lastName": {
      "th": "ศิริสัมพันธ์",
      "en": "Sirisumphandh"
    },
    "nickname": {
      "th": "จ๊ะจ๋า",
      "en": "Jaja"
    },
    "department": {
      "th": "Human Resources Section",
      "en": "Human Resources Section"
    },
    "position": {
      "th": "HR Officer",
      "en": "HR Officer"
    },
    "email": "teerada.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-23",
    "employeeCode": "23",
    "firstName": {
      "th": "อรพรรณ",
      "en": "Oraphan"
    },
    "lastName": {
      "th": "ระคำมา",
      "en": "Rakamma"
    },
    "nickname": {
      "th": "ขิง",
      "en": "Khing"
    },
    "department": {
      "th": "JP Software Development & Consultant Section",
      "en": "JP Software Development & Consultant Section"
    },
    "position": {
      "th": "Technical Specialist",
      "en": "Technical Specialist"
    },
    "email": "oraphan.r@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-24",
    "employeeCode": "24",
    "firstName": {
      "th": "รังสิวุฒิ",
      "en": "Rungsiwut"
    },
    "lastName": {
      "th": "อุดม",
      "en": "Udom"
    },
    "nickname": {
      "th": "เบ",
      "en": "Bay"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Assistant Team Leader",
      "en": "Assistant Team Leader"
    },
    "email": "rungsiwut.u@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-25",
    "employeeCode": "25",
    "firstName": {
      "th": "ภัทรพร",
      "en": "Pattaraporn"
    },
    "lastName": {
      "th": "เทพบุญ",
      "en": "Tepboon"
    },
    "nickname": {
      "th": "หญิง",
      "en": "Ying"
    },
    "department": {
      "th": "Human Resources Section",
      "en": "Human Resources Section"
    },
    "position": {
      "th": "Group Manager",
      "en": "Group Manager"
    },
    "email": "pattaraporn.t@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-26",
    "employeeCode": "26",
    "firstName": {
      "th": "มานิตา",
      "en": "Manita"
    },
    "lastName": {
      "th": "เมืองหมุด",
      "en": "Muangmud"
    },
    "nickname": {
      "th": "ชัลมา",
      "en": "Sulma"
    },
    "department": {
      "th": "Accounting & Administration Section",
      "en": "Accounting & Administration Section"
    },
    "position": {
      "th": "Senior Sales Administrator",
      "en": "Senior Sales Administrator"
    },
    "email": "manita.m@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-27",
    "employeeCode": "27",
    "firstName": {
      "th": "ภวิน",
      "en": "Pawin"
    },
    "lastName": {
      "th": "เมฆม่วงแก้ว",
      "en": "Makmoungkaew"
    },
    "nickname": {
      "th": "ไผ่",
      "en": "Pai"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Assistant Leader",
      "en": "Assistant Leader"
    },
    "email": "pawin.m@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-28",
    "employeeCode": "28",
    "firstName": {
      "th": "กิตติคุณ",
      "en": "Kittikun"
    },
    "lastName": {
      "th": "เกษมสุทธิคุณ",
      "en": "Kasamsuttikun"
    },
    "nickname": {
      "th": "โบ๊ท",
      "en": "Boat"
    },
    "department": {
      "th": "Automobile Section",
      "en": "Automobile Section"
    },
    "position": {
      "th": "Assistant Leader",
      "en": "Assistant Leader"
    },
    "email": "kittikun.k@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-29",
    "employeeCode": "29",
    "firstName": {
      "th": "ปัทมา",
      "en": "Patthama"
    },
    "lastName": {
      "th": "มะตัง",
      "en": "Matang"
    },
    "nickname": {
      "th": "นา",
      "en": "Na"
    },
    "department": {
      "th": "Rapid Development Section",
      "en": "Rapid Development Section"
    },
    "position": {
      "th": "Senior Application Support Officer",
      "en": "Senior Application Support Officer"
    },
    "email": "patthama.m@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-30",
    "employeeCode": "30",
    "firstName": {
      "th": "สิปปวิชญ์",
      "en": "Sippavit"
    },
    "lastName": {
      "th": "แซ่หวาง",
      "en": "Saewang"
    },
    "nickname": {
      "th": "เฉิน",
      "en": "Chen"
    },
    "department": {
      "th": "Automobile Section",
      "en": "Automobile Section"
    },
    "position": {
      "th": "Senior Software Developer",
      "en": "Senior Software Developer"
    },
    "email": "sippavit.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-31",
    "employeeCode": "31",
    "firstName": {
      "th": "อนุพันธุ์",
      "en": "Anupun"
    },
    "lastName": {
      "th": "สุวรรณกรกิจ",
      "en": "Suwankornkij"
    },
    "nickname": {
      "th": "แบงค์",
      "en": "Bank"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Senior Software Developer",
      "en": "Senior Software Developer"
    },
    "email": "anupun.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-32",
    "employeeCode": "32",
    "firstName": {
      "th": "สมยศ",
      "en": "Somyot"
    },
    "lastName": {
      "th": "โพธิ์รัตน์",
      "en": "Phorat"
    },
    "nickname": {
      "th": "บอย",
      "en": "Boy"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Leader",
      "en": "Leader"
    },
    "email": "somyot.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-33",
    "employeeCode": "33",
    "firstName": {
      "th": "ยุทธนา",
      "en": "Yutthana"
    },
    "lastName": {
      "th": "สิงห์ทอง",
      "en": "Singthong"
    },
    "nickname": {
      "th": "เอก",
      "en": "Ake"
    },
    "department": {
      "th": "JP Software Development & Consultant Section",
      "en": "JP Software Development & Consultant Section"
    },
    "position": {
      "th": "Technical Specialist",
      "en": "Technical Specialist"
    },
    "email": "yutthana.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-34",
    "employeeCode": "34",
    "firstName": {
      "th": "ณพพร",
      "en": "Nopporn"
    },
    "lastName": {
      "th": "โคสี",
      "en": "Khosee"
    },
    "nickname": {
      "th": "แบงค์",
      "en": "Bank"
    },
    "department": {
      "th": "Automobile Section",
      "en": "Automobile Section"
    },
    "position": {
      "th": "Senior System Analyst",
      "en": "Senior System Analyst"
    },
    "email": "nopporn.k@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-35",
    "employeeCode": "35",
    "firstName": {
      "th": "ปติญญา",
      "en": "Patinya"
    },
    "lastName": {
      "th": "สุมาลี",
      "en": "Sumalee"
    },
    "nickname": {
      "th": "เก๋ง",
      "en": "Keng"
    },
    "department": {
      "th": "Mainframe Specialist Section",
      "en": "Mainframe Specialist Section"
    },
    "position": {
      "th": "Technical Specialist",
      "en": "Technical Specialist"
    },
    "email": "patinya.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-36",
    "employeeCode": "36",
    "firstName": {
      "th": "อลิสา",
      "en": "Alisa"
    },
    "lastName": {
      "th": "เลิศดิษยวรรณ",
      "en": "Lertdisayawan"
    },
    "nickname": {
      "th": "ลิ",
      "en": "Li"
    },
    "department": {
      "th": "JP Software Development & Consultant Section",
      "en": "JP Software Development & Consultant Section"
    },
    "position": {
      "th": "Assistant Leader",
      "en": "Assistant Leader"
    },
    "email": "alisa.le@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-37",
    "employeeCode": "37",
    "firstName": {
      "th": "อัณชวิศศ์",
      "en": "Aunchawis"
    },
    "lastName": {
      "th": "ปาร์มวงศ์",
      "en": "Parmwong"
    },
    "nickname": {
      "th": "ไอซ์",
      "en": "Ice"
    },
    "department": {
      "th": "Mainframe Specialist Section",
      "en": "Mainframe Specialist Section"
    },
    "position": {
      "th": "Leader",
      "en": "Leader"
    },
    "email": "aunchawis.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-38",
    "employeeCode": "38",
    "firstName": {
      "th": "ภัทรวดี",
      "en": "Pattarawadee"
    },
    "lastName": {
      "th": "นิ่มทรงประเสริฐ",
      "en": "Nimsongprasert"
    },
    "nickname": {
      "th": "หยก",
      "en": "Yok"
    },
    "department": {
      "th": "Rapid Development Section",
      "en": "Rapid Development Section"
    },
    "position": {
      "th": "Senior System Analyst",
      "en": "Senior System Analyst"
    },
    "email": "pattarawadee.n@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-39",
    "employeeCode": "39",
    "firstName": {
      "th": "พีรพล",
      "en": "Peerapon"
    },
    "lastName": {
      "th": "จันทะแจ่ม",
      "en": "Chanthachaem"
    },
    "nickname": {
      "th": "บาส",
      "en": "Bas"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Senior Software Developer",
      "en": "Senior Software Developer"
    },
    "email": "peerapon.c@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-40",
    "employeeCode": "40",
    "firstName": {
      "th": "จตุพงษ์",
      "en": "Jatupong"
    },
    "lastName": {
      "th": "สังข์เพ็ชรรัตน์",
      "en": "Sangphetcharat"
    },
    "nickname": {
      "th": "เนม",
      "en": "Name"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Senior Software Developer",
      "en": "Senior Software Developer"
    },
    "email": "jatupong.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-41",
    "employeeCode": "41",
    "firstName": {
      "th": "ศิริรักษ์",
      "en": "Sirirak"
    },
    "lastName": {
      "th": "ทองแท้",
      "en": "Thongthae"
    },
    "nickname": {
      "th": "ปลั๊ก",
      "en": "Pluk"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Technical Specialist",
      "en": "Technical Specialist"
    },
    "email": "sirirak.t@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-42",
    "employeeCode": "42",
    "firstName": {
      "th": "พีรณัฐ",
      "en": "Peeranat"
    },
    "lastName": {
      "th": "อภิธนภัคสมัชญ์",
      "en": "Apitanapaksamuch"
    },
    "nickname": {
      "th": "เก่ง",
      "en": "Keng"
    },
    "department": {
      "th": "JP Software Development & Consultant Section",
      "en": "JP Software Development & Consultant Section"
    },
    "position": {
      "th": "Senior Application Support Officer",
      "en": "Senior Application Support Officer"
    },
    "email": "peeranat.a@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-43",
    "employeeCode": "43",
    "firstName": {
      "th": "ขนิษฐา",
      "en": "Khanittha"
    },
    "lastName": {
      "th": "พึ่งอารมณ์",
      "en": "Pueng-ar-rom"
    },
    "nickname": {
      "th": "แพท",
      "en": "Pat"
    },
    "department": {
      "th": "Rapid Development Section",
      "en": "Rapid Development Section"
    },
    "position": {
      "th": "Quality Assurance Officer",
      "en": "Quality Assurance Officer"
    },
    "email": "khanittha.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-44",
    "employeeCode": "44",
    "firstName": {
      "th": "ชาคริต",
      "en": "Chakrit"
    },
    "lastName": {
      "th": "เทียนเถื่อน",
      "en": "Teanturn"
    },
    "nickname": {
      "th": "พลุ",
      "en": "Plu"
    },
    "department": {
      "th": "Infrastructure Engineer Section",
      "en": "Infrastructure Engineer Section"
    },
    "position": {
      "th": "Senior Technical Engineer",
      "en": "Senior Technical Engineer"
    },
    "email": "chakrit.t@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-45",
    "employeeCode": "45",
    "firstName": {
      "th": "ไกวัล",
      "en": "Kaiwan"
    },
    "lastName": {
      "th": "เฮียงฮะ",
      "en": "Hiangha"
    },
    "nickname": {
      "th": "กาย",
      "en": "Guy"
    },
    "department": {
      "th": "Automobile Section",
      "en": "Automobile Section"
    },
    "position": {
      "th": "Senior Quality Assurance Officer",
      "en": "Senior Quality Assurance Officer"
    },
    "email": "kaiwan.h@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-46",
    "employeeCode": "46",
    "firstName": {
      "th": "ชณิตา",
      "en": "Chanita"
    },
    "lastName": {
      "th": "ลีลาศุภกร",
      "en": "Leelasupakorn"
    },
    "nickname": {
      "th": "แฟง",
      "en": "Faeng"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "System Analyst",
      "en": "System Analyst"
    },
    "email": "chanita.l@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-47",
    "employeeCode": "47",
    "firstName": {
      "th": "นันท์นภัส",
      "en": "Nannaphat"
    },
    "lastName": {
      "th": "บุญดล",
      "en": "Bundon"
    },
    "nickname": {
      "th": "เอิน",
      "en": "Earn"
    },
    "department": {
      "th": "Automobile Section",
      "en": "Automobile Section"
    },
    "position": {
      "th": "Technical Specialist",
      "en": "Technical Specialist"
    },
    "email": "nannaphat.b@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-48",
    "employeeCode": "48",
    "firstName": {
      "th": "ธีรัช",
      "en": "Teeruch"
    },
    "lastName": {
      "th": "แสนคาร",
      "en": "Sankan"
    },
    "nickname": {
      "th": "บอล",
      "en": "Ball"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Senior Software Developer",
      "en": "Senior Software Developer"
    },
    "email": "teeruch.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-49",
    "employeeCode": "49",
    "firstName": {
      "th": "สมโพธิ",
      "en": "Sompot"
    },
    "lastName": {
      "th": "เอี่ยมวรกุล",
      "en": "Iamworakul"
    },
    "nickname": {
      "th": "ขนุน",
      "en": "Ka-nun"
    },
    "department": {
      "th": "JP Software Development & Consultant Section",
      "en": "JP Software Development & Consultant Section"
    },
    "position": {
      "th": "Senior Software Developer",
      "en": "Senior Software Developer"
    },
    "email": "sompot.i@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-50",
    "employeeCode": "50",
    "firstName": {
      "th": "พัทธนันท์",
      "en": "Puttanone"
    },
    "lastName": {
      "th": "ทรัพย์พานิช",
      "en": "Supphanit"
    },
    "nickname": {
      "th": "โอม",
      "en": "Ohm"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "System Analyst",
      "en": "System Analyst"
    },
    "email": "puttanone.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-51",
    "employeeCode": "51",
    "firstName": {
      "th": "จิรวรรณ",
      "en": "Jirawan"
    },
    "lastName": {
      "th": "ประกอบกิจ",
      "en": "Prakobkit"
    },
    "nickname": {
      "th": "นาง",
      "en": "Nang"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Senior System Analyst",
      "en": "Senior System Analyst"
    },
    "email": "jirawan.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-52",
    "employeeCode": "52",
    "firstName": {
      "th": "นูรดิน",
      "en": "Nurdin"
    },
    "lastName": {
      "th": "เซ็งสะ",
      "en": "Sengsa"
    },
    "nickname": {
      "th": "ดิน",
      "en": "Din"
    },
    "department": {
      "th": "Infrastructure Engineer Section",
      "en": "Infrastructure Engineer Section"
    },
    "position": {
      "th": "Technical Engineer",
      "en": "Technical Engineer"
    },
    "email": "nurdin.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-53",
    "employeeCode": "53",
    "firstName": {
      "th": "ครุวาร",
      "en": "Kharuwan"
    },
    "lastName": {
      "th": "ไชโยธา",
      "en": "Chaiyotha"
    },
    "nickname": {
      "th": "ว่าน",
      "en": "Wan"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Software Developer",
      "en": "Software Developer"
    },
    "email": "kharuwan.c@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-54",
    "employeeCode": "54",
    "firstName": {
      "th": "พรเทพ",
      "en": "Pornthep"
    },
    "lastName": {
      "th": "เดชสมบูรณ์รัตน์",
      "en": "Detsomboonrat"
    },
    "nickname": {
      "th": "ก็อบ",
      "en": "Gob"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Technical Specialist",
      "en": "Technical Specialist"
    },
    "email": "pornthep.d@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-55",
    "employeeCode": "55",
    "firstName": {
      "th": "เสรีภาพ",
      "en": "Sareepap"
    },
    "lastName": {
      "th": "อินต๊ะใจ",
      "en": "Intajai"
    },
    "nickname": {
      "th": "ไนซ์",
      "en": "Nice"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Senior Software Developer",
      "en": "Senior Software Developer"
    },
    "email": "sareepap.i@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-56",
    "employeeCode": "56",
    "firstName": {
      "th": "สิริชัย",
      "en": "Sirichai"
    },
    "lastName": {
      "th": "ซ้ายโพธิ์กลาง",
      "en": "Sayphoklang"
    },
    "nickname": {
      "th": "บอย",
      "en": "Boy"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Quality Assurance Officer",
      "en": "Quality Assurance Officer"
    },
    "email": "sirichai.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-57",
    "employeeCode": "57",
    "firstName": {
      "th": "พรรณิภา",
      "en": "Pannipa"
    },
    "lastName": {
      "th": "โชติดิลก",
      "en": "Chotdilok"
    },
    "nickname": {
      "th": "นิ",
      "en": "Ni"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Senior Quality Assurance Officer",
      "en": "Senior Quality Assurance Officer"
    },
    "email": "pannipa.c@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-58",
    "employeeCode": "58",
    "firstName": {
      "th": "กรกช",
      "en": "Korakoch"
    },
    "lastName": {
      "th": "สิริภัทท์",
      "en": "Siripatt"
    },
    "nickname": {
      "th": "ปอ",
      "en": "Por"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Senior System Analyst",
      "en": "Senior System Analyst"
    },
    "email": "korakoch.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-59",
    "employeeCode": "59",
    "firstName": {
      "th": "ตรีศิลป์ชัย",
      "en": "Trisinchai"
    },
    "lastName": {
      "th": "คำจำนงค์",
      "en": "Kamjamnong"
    },
    "nickname": {
      "th": "ดนตรี",
      "en": "Dontri"
    },
    "department": {
      "th": "Rapid Development Section",
      "en": "Rapid Development Section"
    },
    "position": {
      "th": "Software Developer",
      "en": "Software Developer"
    },
    "email": "trisinchai.k@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-60",
    "employeeCode": "60",
    "firstName": {
      "th": "มงคล",
      "en": "Mongkol"
    },
    "lastName": {
      "th": "ประสงค์สุทธิ์",
      "en": "Prasongsut"
    },
    "nickname": {
      "th": "เก่ง",
      "en": "Keng"
    },
    "department": {
      "th": "Software Package Solution Section",
      "en": "Software Package Solution Section"
    },
    "position": {
      "th": "Senior Software Developer",
      "en": "Senior Software Developer"
    },
    "email": "mongkol.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-61",
    "employeeCode": "61",
    "firstName": {
      "th": "กิ่งกนก",
      "en": "Kingkanok"
    },
    "lastName": {
      "th": "สอิ้ง",
      "en": "Sa-ing"
    },
    "nickname": {
      "th": "รัก",
      "en": "Rak"
    },
    "department": {
      "th": "Project Management Office Team",
      "en": "Project Management Office Team"
    },
    "position": {
      "th": "Team Leader",
      "en": "Team Leader"
    },
    "email": "kingkanok.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-62",
    "employeeCode": "62",
    "firstName": {
      "th": "วรากร",
      "en": "Warakorn"
    },
    "lastName": {
      "th": "พิเนตรโชติ",
      "en": "Pineatchot"
    },
    "nickname": {
      "th": "เก่ง",
      "en": "Keng"
    },
    "department": {
      "th": "Automobile Section",
      "en": "Automobile Section"
    },
    "position": {
      "th": "Senior System Analyst",
      "en": "Senior System Analyst"
    },
    "email": "warakorn.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-63",
    "employeeCode": "63",
    "firstName": {
      "th": "ทัศธร",
      "en": "Tasaton"
    },
    "lastName": {
      "th": "คุณวุฒิปณิธิเวช",
      "en": "Khunawutpanitiwet"
    },
    "nickname": {
      "th": "เน็ต",
      "en": "Net"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Assistant Leader",
      "en": "Assistant Leader"
    },
    "email": "tasaton.k@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-64",
    "employeeCode": "64",
    "firstName": {
      "th": "ชาญวิทย์",
      "en": "Chanvit"
    },
    "lastName": {
      "th": "ไพโรจน์",
      "en": "Pairoj"
    },
    "nickname": {
      "th": "เล็ก",
      "en": "Lek"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Senior Software Developer",
      "en": "Senior Software Developer"
    },
    "email": "chanvit.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-65",
    "employeeCode": "65",
    "firstName": {
      "th": "รภา",
      "en": "Rapa"
    },
    "lastName": {
      "th": "ศรีสุวรรณ",
      "en": "Srisuwan"
    },
    "nickname": {
      "th": "แยม",
      "en": "Yam"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Technical Specialist",
      "en": "Technical Specialist"
    },
    "email": "rapa.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-66",
    "employeeCode": "66",
    "firstName": {
      "th": "อิทธิพล",
      "en": "Ittipol"
    },
    "lastName": {
      "th": "ติยะประวัติ",
      "en": "Tiyaprawat"
    },
    "nickname": {
      "th": "แบ้งค์",
      "en": "Bank"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Senior Software Developer",
      "en": "Senior Software Developer"
    },
    "email": "ittipol.t@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-67",
    "employeeCode": "67",
    "firstName": {
      "th": "รัฐนันท์",
      "en": "Rattanan"
    },
    "lastName": {
      "th": "ธนประกอบ",
      "en": "Tanaprakob"
    },
    "nickname": {
      "th": "เอิร์ท",
      "en": "Earth"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Senior System Analyst",
      "en": "Senior System Analyst"
    },
    "email": "rattanan.t@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-68",
    "employeeCode": "68",
    "firstName": {
      "th": "สุรเชษฐ",
      "en": "Sularchet"
    },
    "lastName": {
      "th": "เจริญสุข",
      "en": "Jaronesuk"
    },
    "nickname": {
      "th": "อ๊อด",
      "en": "Aod"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Senior Software Developer",
      "en": "Senior Software Developer"
    },
    "email": "sularchet.j@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-69",
    "employeeCode": "69",
    "firstName": {
      "th": "สุกัญญา",
      "en": "Sukanya"
    },
    "lastName": {
      "th": "วิริยะกิจเจริญชัย",
      "en": "Wiriyakitcharoenchai"
    },
    "nickname": {
      "th": "โอ๋",
      "en": "Oh"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Assistant Team Leader",
      "en": "Assistant Team Leader"
    },
    "email": "sukanya.w@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-70",
    "employeeCode": "70",
    "firstName": {
      "th": "สาธินี",
      "en": "Sathinee"
    },
    "lastName": {
      "th": "ธนาวุธิไกร",
      "en": "Thanavutikrai"
    },
    "nickname": {
      "th": "ฟาง",
      "en": "Fang"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Software Developer",
      "en": "Software Developer"
    },
    "email": "sathinee.t@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-71",
    "employeeCode": "71",
    "firstName": {
      "th": "นิรุจน์",
      "en": "Nirut"
    },
    "lastName": {
      "th": "ขอบทอง",
      "en": "Khobthong"
    },
    "nickname": {
      "th": "รุจน์",
      "en": "Ruj"
    },
    "department": {
      "th": "Research & Development Section",
      "en": "Research & Development Section"
    },
    "position": {
      "th": "Senior Software Developer",
      "en": "Senior Software Developer"
    },
    "email": "nirut.k@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-72",
    "employeeCode": "72",
    "firstName": {
      "th": "อนุชิต",
      "en": "Anuchit"
    },
    "lastName": {
      "th": "มอโท",
      "en": "Moto"
    },
    "nickname": {
      "th": "มาร์ค",
      "en": "Mark"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Software Developer",
      "en": "Software Developer"
    },
    "email": "anuchit.m@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-73",
    "employeeCode": "73",
    "firstName": {
      "th": "พิทยา",
      "en": "Pittaya"
    },
    "lastName": {
      "th": "เอื้อวงศ์อารีย์",
      "en": "Euawongaree"
    },
    "nickname": {
      "th": "พิคท์",
      "en": "Picts"
    },
    "department": {
      "th": "Software Package Solution Section",
      "en": "Software Package Solution Section"
    },
    "position": {
      "th": "Senior Software Developer",
      "en": "Senior Software Developer"
    },
    "email": "pittaya.e@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-74",
    "employeeCode": "74",
    "firstName": {
      "th": "ภัทรนันท์",
      "en": "Pattaranan"
    },
    "lastName": {
      "th": "บุญมา",
      "en": "Boonma"
    },
    "nickname": {
      "th": "ตั้ม",
      "en": "Tum"
    },
    "department": {
      "th": "Mainframe Specialist Section",
      "en": "Mainframe Specialist Section"
    },
    "position": {
      "th": "Software Developer",
      "en": "Software Developer"
    },
    "email": "pattaranan.b@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-75",
    "employeeCode": "75",
    "firstName": {
      "th": "เกศวรา",
      "en": "Kejwara"
    },
    "lastName": {
      "th": "สุธีรวุฒิ",
      "en": "Suteerawut"
    },
    "nickname": {
      "th": "เกศ",
      "en": "Kej"
    },
    "department": {
      "th": "Project Management Office Team",
      "en": "Project Management Office Team"
    },
    "position": {
      "th": "Team Leader",
      "en": "Team Leader"
    },
    "email": "kejwara.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-76",
    "employeeCode": "76",
    "firstName": {
      "th": "วชิราพร",
      "en": "Wachirapron"
    },
    "lastName": {
      "th": "ประเสริฐ",
      "en": "Prasert"
    },
    "nickname": {
      "th": "จูน",
      "en": "June"
    },
    "department": {
      "th": "Worldwide Innovative  Section",
      "en": "Worldwide Innovative  Section"
    },
    "position": {
      "th": "Software Developer",
      "en": "Software Developer"
    },
    "email": "wachirapron.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-77",
    "employeeCode": "77",
    "firstName": {
      "th": "สุพิชชา",
      "en": "Suphitcha"
    },
    "lastName": {
      "th": "วรสิงห์",
      "en": "Worasing"
    },
    "nickname": {
      "th": "ยู",
      "en": "Yu"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Assistant Leader",
      "en": "Assistant Leader"
    },
    "email": "suphitcha.w@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-78",
    "employeeCode": "78",
    "firstName": {
      "th": "ชนาวี",
      "en": "Chanawee"
    },
    "lastName": {
      "th": "บินสัน",
      "en": "Binsun"
    },
    "nickname": {
      "th": "ฟิว",
      "en": "Few"
    },
    "department": {
      "th": "Rapid Development Section",
      "en": "Rapid Development Section"
    },
    "position": {
      "th": "Application Support Officer",
      "en": "Application Support Officer"
    },
    "email": "chanawee.b@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-79",
    "employeeCode": "79",
    "firstName": {
      "th": "นิรันดร์",
      "en": "Niran"
    },
    "lastName": {
      "th": "ปานปรีชา",
      "en": "Panpreecha"
    },
    "nickname": {
      "th": "บอย",
      "en": "Boy"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Software Developer",
      "en": "Software Developer"
    },
    "email": "niran.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-80",
    "employeeCode": "80",
    "firstName": {
      "th": "โทชิฮิโกะ",
      "en": "Toshihiko"
    },
    "lastName": {
      "th": "อัทซึมิ",
      "en": "Atsumi"
    },
    "nickname": {
      "th": "อัทซึมิซัง",
      "en": "Atsumi san"
    },
    "department": {
      "th": "Japanese Sales Section",
      "en": "Japanese Sales Section"
    },
    "position": {
      "th": "General Manager",
      "en": "General Manager"
    },
    "email": "toshihiko.a@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-81",
    "employeeCode": "81",
    "firstName": {
      "th": "คุณานนต์",
      "en": "Kunanon"
    },
    "lastName": {
      "th": "ละม้ายศรี",
      "en": "Lamysri"
    },
    "nickname": {
      "th": "คอปเตอร์",
      "en": "Copter"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Senior Software Developer",
      "en": "Senior Software Developer"
    },
    "email": "kunanon.l@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-82",
    "employeeCode": "82",
    "firstName": {
      "th": "ชุติมา",
      "en": "Chutima"
    },
    "lastName": {
      "th": "ประจำ",
      "en": "Pacham"
    },
    "nickname": {
      "th": "หงษ์",
      "en": "Hong"
    },
    "department": {
      "th": "AEON Section",
      "en": "AEON Section"
    },
    "position": {
      "th": "Senior Business Analyst",
      "en": "Senior Business Analyst"
    },
    "email": "chutima.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-83",
    "employeeCode": "83",
    "firstName": {
      "th": "ณิรินทร์ญา",
      "en": "Nirynya"
    },
    "lastName": {
      "th": "ศิระนิธิกุลภรณ์",
      "en": "Siranithikulporn"
    },
    "nickname": {
      "th": "จิ๊บ",
      "en": "Jib"
    },
    "department": {
      "th": "Human Resources Section",
      "en": "Human Resources Section"
    },
    "position": {
      "th": "HR Officer",
      "en": "HR Officer"
    },
    "email": "nirynya.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-84",
    "employeeCode": "84",
    "firstName": {
      "th": "กรกฎ",
      "en": "Korakod"
    },
    "lastName": {
      "th": "ธรรมรัตน์",
      "en": "Thammarat"
    },
    "nickname": {
      "th": "ข้าวเจ้า",
      "en": "Kaojao"
    },
    "department": {
      "th": "Software Package Solution Section",
      "en": "Software Package Solution Section"
    },
    "position": {
      "th": "Software Developer",
      "en": "Software Developer"
    },
    "email": "korakod.t@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-85",
    "employeeCode": "85",
    "firstName": {
      "th": "ปารมี",
      "en": "Paramee"
    },
    "lastName": {
      "th": "วงค์คำปัน",
      "en": "Wongkhampan"
    },
    "nickname": {
      "th": "ฟลุ๊ค",
      "en": "Fluk"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Software Developer",
      "en": "Software Developer"
    },
    "email": "paramee.w@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-86",
    "employeeCode": "86",
    "firstName": {
      "th": "อรชา",
      "en": "Oracha"
    },
    "lastName": {
      "th": "ศรีบุญเพ็ง",
      "en": "Sriboonpeng"
    },
    "nickname": {
      "th": "อ้อม",
      "en": "Aom"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Senior Business Analyst",
      "en": "Senior Business Analyst"
    },
    "email": "oracha.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-87",
    "employeeCode": "87",
    "firstName": {
      "th": "ฐาณัส",
      "en": "Thanat"
    },
    "lastName": {
      "th": "จำเนียรบุญ",
      "en": "Jumneanbun"
    },
    "nickname": {
      "th": "เต้ย",
      "en": "Toey"
    },
    "department": {
      "th": "Lenovation Solution Section",
      "en": "Lenovation Solution Section"
    },
    "position": {
      "th": "System Analyst",
      "en": "System Analyst"
    },
    "email": "thanat.j@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-88",
    "employeeCode": "88",
    "firstName": {
      "th": "สิรินทรา",
      "en": "Sirinta"
    },
    "lastName": {
      "th": "มนปราณีต",
      "en": "Monpranit"
    },
    "nickname": {
      "th": "พลอย",
      "en": "Ploy"
    },
    "department": {
      "th": "Outsourcing Business Section",
      "en": "Outsourcing Business Section"
    },
    "position": {
      "th": "Application Support Officer",
      "en": "Application Support Officer"
    },
    "email": "sirinta.m@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-89",
    "employeeCode": "89",
    "firstName": {
      "th": "ประทาน",
      "en": "Prathan"
    },
    "lastName": {
      "th": "พุ่มพวง",
      "en": "Phumphuang"
    },
    "nickname": {
      "th": "ฟลุ๊ค",
      "en": "Fluk"
    },
    "department": {
      "th": "Worldwide Innovative  Section",
      "en": "Worldwide Innovative  Section"
    },
    "position": {
      "th": "Data Analyst",
      "en": "Data Analyst"
    },
    "email": "prathan.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-90",
    "employeeCode": "90",
    "firstName": {
      "th": "ภิญญดา",
      "en": "Pinyada"
    },
    "lastName": {
      "th": "ทองมี",
      "en": "Thongmee"
    },
    "nickname": {
      "th": "อั้ม",
      "en": "Aum"
    },
    "department": {
      "th": "Outsourcing Business Section",
      "en": "Outsourcing Business Section"
    },
    "position": {
      "th": "Junior Application Support Officer",
      "en": "Junior Application Support Officer"
    },
    "email": "pinyada.t@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-91",
    "employeeCode": "91",
    "firstName": {
      "th": "เกริกก้อง",
      "en": "Krekkong"
    },
    "lastName": {
      "th": "ลีพัฒนากุล",
      "en": "Leepatthanakul"
    },
    "nickname": {
      "th": "ไมค์",
      "en": "Mike"
    },
    "department": {
      "th": "Outsourcing Business Section",
      "en": "Outsourcing Business Section"
    },
    "position": {
      "th": "Application Support Officer",
      "en": "Application Support Officer"
    },
    "email": "krekkong.l@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-92",
    "employeeCode": "92",
    "firstName": {
      "th": "พัทธนันท์",
      "en": "Phattanan"
    },
    "lastName": {
      "th": "ขวัญกิจไสว",
      "en": "Kwankitsawai"
    },
    "nickname": {
      "th": "ปัทม์",
      "en": "Phat"
    },
    "department": {
      "th": "Rapid Development Section",
      "en": "Rapid Development Section"
    },
    "position": {
      "th": "Senior Software Developer",
      "en": "Senior Software Developer"
    },
    "email": "phattanan.k@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-93",
    "employeeCode": "93",
    "firstName": {
      "th": "วีรนันท์",
      "en": "Weeranan"
    },
    "lastName": {
      "th": "เป็งเขียว",
      "en": "Pengkhiao"
    },
    "nickname": {
      "th": "โจ",
      "en": "Jo"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Junior Software Developer",
      "en": "Junior Software Developer"
    },
    "email": "weeranan.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-94",
    "employeeCode": "94",
    "firstName": {
      "th": "แทนคุณ",
      "en": "Tankun"
    },
    "lastName": {
      "th": "พันธ์แก้ว",
      "en": "Pankaew"
    },
    "nickname": {
      "th": "แป้ง",
      "en": "Pang"
    },
    "department": {
      "th": "Mainframe Specialist Section",
      "en": "Mainframe Specialist Section"
    },
    "position": {
      "th": "Software Developer",
      "en": "Software Developer"
    },
    "email": "tankun.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-95",
    "employeeCode": "95",
    "firstName": {
      "th": "จิระพงศ์",
      "en": "Jirapong"
    },
    "lastName": {
      "th": "วงษ์ใสย์",
      "en": "Wongsai"
    },
    "nickname": {
      "th": "ฟลุ๊ค",
      "en": "Flook"
    },
    "department": {
      "th": "Outsourcing Business Section",
      "en": "Outsourcing Business Section"
    },
    "position": {
      "th": "Oracle Developer",
      "en": "Oracle Developer"
    },
    "email": "jirapong.w@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-96",
    "employeeCode": "96",
    "firstName": {
      "th": "ยุพารัตน์",
      "en": "Yuparat"
    },
    "lastName": {
      "th": "ปาณาราช",
      "en": "Panarach"
    },
    "nickname": {
      "th": "ฝน",
      "en": "Fon"
    },
    "department": {
      "th": "Accounting & Administration Section",
      "en": "Accounting & Administration Section"
    },
    "position": {
      "th": "Accounting & Administrator Officer",
      "en": "Accounting & Administrator Officer"
    },
    "email": "yuparat.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-97",
    "employeeCode": "97",
    "firstName": {
      "th": "ทิพวัลย์",
      "en": "Thipphawan"
    },
    "lastName": {
      "th": "แพทย์กิจ",
      "en": "Phaetkit"
    },
    "nickname": {
      "th": "อุ้ม",
      "en": "Aum"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Business Analyst",
      "en": "Business Analyst"
    },
    "email": "thipphawan.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-98",
    "employeeCode": "98",
    "firstName": {
      "th": "วิภา",
      "en": "Wipha"
    },
    "lastName": {
      "th": "พรหมวัลย์",
      "en": "Promwan"
    },
    "nickname": {
      "th": "บูม",
      "en": "Boom"
    },
    "department": {
      "th": "Outsourcing Business Section",
      "en": "Outsourcing Business Section"
    },
    "position": {
      "th": "Application Support Officer",
      "en": "Application Support Officer"
    },
    "email": "wipha.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-99",
    "employeeCode": "99",
    "firstName": {
      "th": "วรรณชนะ",
      "en": "Wanchana"
    },
    "lastName": {
      "th": "แซ่เหลือ",
      "en": "Saelue"
    },
    "nickname": {
      "th": "ราฟ",
      "en": "Raf"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Software Developer",
      "en": "Software Developer"
    },
    "email": "wanchana.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-100",
    "employeeCode": "100",
    "firstName": {
      "th": "ธีมาพร",
      "en": "Teemaporn"
    },
    "lastName": {
      "th": "สอนอินทร์",
      "en": "Sornin"
    },
    "nickname": {
      "th": "มายด์",
      "en": "Mind"
    },
    "department": {
      "th": "Outsourcing Business Section",
      "en": "Outsourcing Business Section"
    },
    "position": {
      "th": "Quality Assurance Officer",
      "en": "Quality Assurance Officer"
    },
    "email": "teemaporn.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-101",
    "employeeCode": "101",
    "firstName": {
      "th": "พัฒน์ธนกฤต",
      "en": "Pattanakrit"
    },
    "lastName": {
      "th": "มีกิริยา",
      "en": "Meekiriya"
    },
    "nickname": {
      "th": "ซัน",
      "en": "Sun"
    },
    "department": {
      "th": "Outsourcing Business Section",
      "en": "Outsourcing Business Section"
    },
    "position": {
      "th": "Quality Assurance Officer",
      "en": "Quality Assurance Officer"
    },
    "email": "pattanakrit.m@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-102",
    "employeeCode": "102",
    "firstName": {
      "th": "ปฏิพล",
      "en": "Patiphon"
    },
    "lastName": {
      "th": "สงเคราะห์ธรรม",
      "en": "Songkhorthum"
    },
    "nickname": {
      "th": "กอล์ฟ",
      "en": "Golf"
    },
    "department": {
      "th": "Mainframe Specialist Section",
      "en": "Mainframe Specialist Section"
    },
    "position": {
      "th": "Software Developer",
      "en": "Software Developer"
    },
    "email": "patiphon.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-103",
    "employeeCode": "103",
    "firstName": {
      "th": "นัฐณภัทร",
      "en": "Natnapat"
    },
    "lastName": {
      "th": "พิชิตพร",
      "en": "Pichitpron"
    },
    "nickname": {
      "th": "เฟิร์ส",
      "en": "First"
    },
    "department": {
      "th": "Outsourcing Business Section",
      "en": "Outsourcing Business Section"
    },
    "position": {
      "th": "System Engineer",
      "en": "System Engineer"
    },
    "email": "natnapat.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-104",
    "employeeCode": "104",
    "firstName": {
      "th": "ศรวณีย์",
      "en": "Sornwanee"
    },
    "lastName": {
      "th": "ตัวสระเกษ",
      "en": "Tuasaket"
    },
    "nickname": {
      "th": "ลูกหมี",
      "en": "Loogmee"
    },
    "department": {
      "th": "Outsourcing Business Section",
      "en": "Outsourcing Business Section"
    },
    "position": {
      "th": "System Engineer",
      "en": "System Engineer"
    },
    "email": "sornwanee.t@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-105",
    "employeeCode": "105",
    "firstName": {
      "th": "ลัทธพล",
      "en": "Lattapon"
    },
    "lastName": {
      "th": "หมั่นเพียร",
      "en": "Munpiane"
    },
    "nickname": {
      "th": "ตัง",
      "en": "Tang"
    },
    "department": {
      "th": "Outsourcing Business Section",
      "en": "Outsourcing Business Section"
    },
    "position": {
      "th": "System Engineer",
      "en": "System Engineer"
    },
    "email": "lattapon.m@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-106",
    "employeeCode": "106",
    "firstName": {
      "th": "ภาพิชมนทน์",
      "en": "Papitchamon"
    },
    "lastName": {
      "th": "แสนกัน",
      "en": "Sankan"
    },
    "nickname": {
      "th": "เพียว",
      "en": "Pure"
    },
    "department": {
      "th": "Human Resources Section",
      "en": "Human Resources Section"
    },
    "position": {
      "th": "Assistant HR Leader",
      "en": "Assistant HR Leader"
    },
    "email": "papitchamon.s@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-107",
    "employeeCode": "107",
    "firstName": {
      "th": "ทักษิณา",
      "en": "Taksina"
    },
    "lastName": {
      "th": "มาลี",
      "en": "Malee"
    },
    "nickname": {
      "th": "เจี๊ยบ",
      "en": "Jeab"
    },
    "department": {
      "th": "Worldwide Innovative  Section",
      "en": "Worldwide Innovative  Section"
    },
    "position": {
      "th": "Data Analyst",
      "en": "Data Analyst"
    },
    "email": "taksina.m@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-108",
    "employeeCode": "108",
    "firstName": {
      "th": "ศาศวัต",
      "en": "Sasawat"
    },
    "lastName": {
      "th": "ทีจันทึก",
      "en": "Theejanthuek"
    },
    "nickname": {
      "th": "ปาล์ม",
      "en": "Palm"
    },
    "department": {
      "th": "JP Software Development & Consultant Section",
      "en": "JP Software Development & Consultant Section"
    },
    "position": {
      "th": "Junior Software Developer",
      "en": "Junior Software Developer"
    },
    "email": "sasawat.t@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-109",
    "employeeCode": "109",
    "firstName": {
      "th": "เมธาวดี",
      "en": "Methawadee"
    },
    "lastName": {
      "th": "ชูมก",
      "en": "Chumok"
    },
    "nickname": {
      "th": "หญิง",
      "en": "Ying"
    },
    "department": {
      "th": "Software Package Solution Section",
      "en": "Software Package Solution Section"
    },
    "position": {
      "th": "Junior Software Developer",
      "en": "Junior Software Developer"
    },
    "email": "methawadee.c@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-110",
    "employeeCode": "110",
    "firstName": {
      "th": "นูริน",
      "en": "Nurin"
    },
    "lastName": {
      "th": "ขันแก้ว",
      "en": "Khankaew"
    },
    "nickname": {
      "th": "ริน",
      "en": "Rin"
    },
    "department": {
      "th": "Rapid Development Section",
      "en": "Rapid Development Section"
    },
    "position": {
      "th": "Junior Software Developer",
      "en": "Junior Software Developer"
    },
    "email": "nurin.k@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-111",
    "employeeCode": "111",
    "firstName": {
      "th": "ปัญญาพร",
      "en": "Panyaphorn"
    },
    "lastName": {
      "th": "พรมชาติ",
      "en": "Phromchat"
    },
    "nickname": {
      "th": "กิ่ง",
      "en": "Ging"
    },
    "department": {
      "th": "Rapid Development Section",
      "en": "Rapid Development Section"
    },
    "position": {
      "th": "Junior Quality Assurance Officer",
      "en": "Junior Quality Assurance Officer"
    },
    "email": "panyaphorn.p@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-112",
    "employeeCode": "112",
    "firstName": {
      "th": "ลลิตา",
      "en": "Lalita"
    },
    "lastName": {
      "th": "แหล่งสนาม",
      "en": "Langsanam"
    },
    "nickname": {
      "th": "จอย",
      "en": "Joy"
    },
    "department": {
      "th": "Outsourcing Business Section",
      "en": "Outsourcing Business Section"
    },
    "position": {
      "th": "Quality Assurance Officer",
      "en": "Quality Assurance Officer"
    },
    "email": "lalita.l@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-113",
    "employeeCode": "113",
    "firstName": {
      "th": "ณัฐวุฒิ",
      "en": "Nattawut"
    },
    "lastName": {
      "th": "รอดทอง",
      "en": "Rodthong"
    },
    "nickname": {
      "th": "นนท์",
      "en": "Nont"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Software Developer",
      "en": "Software Developer"
    },
    "email": "nattawut.r@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-114",
    "employeeCode": "114",
    "firstName": {
      "th": "ปรฤทธิ์",
      "en": "Porrarit"
    },
    "lastName": {
      "th": "มหัคฆพงศ์",
      "en": "Mahakkapong"
    },
    "nickname": {
      "th": "เป้",
      "en": "Pay"
    },
    "department": {
      "th": "Java Platform Section",
      "en": "Java Platform Section"
    },
    "position": {
      "th": "Senior System Analyst",
      "en": "Senior System Analyst"
    },
    "email": "porrarit.m@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-115",
    "employeeCode": "115",
    "firstName": {
      "th": "มิตสึมาสะ",
      "en": "Mitsumasa"
    },
    "lastName": {
      "th": "อิเคดะ",
      "en": "Ikeda"
    },
    "nickname": {
      "th": "อิเคดะซัง",
      "en": "Ikeda san"
    },
    "department": {
      "th": "Project Management Office Team",
      "en": "Project Management Office Team"
    },
    "position": {
      "th": "Project Manager",
      "en": "Project Manager"
    },
    "email": "mitsumasa.i@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-116",
    "employeeCode": "116",
    "firstName": {
      "th": "วรรณิภา",
      "en": "Wannipa"
    },
    "lastName": {
      "th": "ครึ่งมี",
      "en": "Krungmee"
    },
    "nickname": {
      "th": "ฟอง",
      "en": "Fong"
    },
    "department": {
      "th": "Outsourcing Business Section",
      "en": "Outsourcing Business Section"
    },
    "position": {
      "th": "Senior Quality Assurance Officer",
      "en": "Senior Quality Assurance Officer"
    },
    "email": "wannipa.k@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  },
  {
    "id": "emp-contact-117",
    "employeeCode": "117",
    "firstName": {
      "th": "สารินี",
      "en": "Sarini"
    },
    "lastName": {
      "th": "จันทร์อุ่น",
      "en": "Chanaun"
    },
    "nickname": {
      "th": "พลอย",
      "en": "Ploy"
    },
    "department": {
      "th": "Outsourcing Business Section",
      "en": "Outsourcing Business Section"
    },
    "position": {
      "th": "Senior Quality Assurance Officer",
      "en": "Senior Quality Assurance Officer"
    },
    "email": "sarini.c@company.co.th",
    "phone": "0912345678",
    "startDate": "",
    "status": "active",
    "note": {
      "th": "",
      "en": ""
    }
  }
] satisfies Employee[]
