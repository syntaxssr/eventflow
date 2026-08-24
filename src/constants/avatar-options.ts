import type { LocalizedText } from "@/types/common"

export interface AvatarOption {
  id: string
  name: LocalizedText
  src: string
  backgroundColor: string
}

/**
 * คลังมาสคอตที่ผู้ใช้เลือกได้ร่วมกัน
 * รูปหนึ่งใช้ได้กับผู้ใช้เพียงคนเดียว โดย reducer เป็นผู้บังคับกติกานี้ซ้ำอีกชั้น
 */
export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: "fennec-fox",
    name: { th: "จิ้งจอกเฟนเนก", en: "Fennec fox" },
    src: "/avatars/ip-as-logo/u-01-fennec-fox.png",
    backgroundColor: "#C96852",
  },
  {
    id: "floppy-puppy",
    name: { th: "สุนัขหูตก", en: "Floppy-eared puppy" },
    src: "/avatars/ip-as-logo/u-02-floppy-puppy.png",
    backgroundColor: "#2457E6",
  },
  {
    id: "elephant",
    name: { th: "ช้าง", en: "Elephant" },
    src: "/avatars/ip-as-logo/u-03-elephant.png",
    backgroundColor: "#B8AEF1",
  },
  {
    id: "polar-bear",
    name: { th: "หมีขั้วโลก", en: "Polar bear" },
    src: "/avatars/ip-as-logo/u-04-polar-bear.png",
    backgroundColor: "#1E2E68",
  },
  {
    id: "whale",
    name: { th: "วาฬ", en: "Whale" },
    src: "/avatars/ip-as-logo/u-05-whale.png",
    backgroundColor: "#3D918B",
  },
  {
    id: "lion",
    name: { th: "สิงโต", en: "Lion" },
    src: "/avatars/ip-as-logo/u-06-lion.png",
    backgroundColor: "#C49A34",
  },
  {
    id: "snail",
    name: { th: "หอยทาก", en: "Snail" },
    src: "/avatars/ip-as-logo/u-07-snail.png",
    backgroundColor: "#477BC2",
  },
  {
    id: "axolotl",
    name: { th: "แอกโซลอเติล", en: "Axolotl" },
    src: "/avatars/ip-as-logo/u-08-axolotl.png",
    backgroundColor: "#6477C8",
  },
  {
    id: "seal",
    name: { th: "แมวน้ำ", en: "Seal" },
    src: "/avatars/ip-as-logo/u-09-seal.png",
    backgroundColor: "#617B9B",
  },
  {
    id: "frog",
    name: { th: "กบ", en: "Frog" },
    src: "/avatars/ip-as-logo/u-10-frog.png",
    backgroundColor: "#6A5BA8",
  },
  {
    id: "penguin",
    name: { th: "เพนกวิน", en: "Penguin" },
    src: "/avatars/ip-as-logo/u-11-penguin.png",
    backgroundColor: "#7442DE",
  },
  {
    id: "manta-ray",
    name: { th: "กระเบนราหู", en: "Manta ray" },
    src: "/avatars/ip-as-logo/u-12-manta-ray.png",
    backgroundColor: "#F06A4F",
  },
  {
    id: "rabbit",
    name: { th: "กระต่าย", en: "Rabbit" },
    src: "/avatars/ip-as-logo/u-13-rabbit.png",
    backgroundColor: "#6E8878",
  },
  {
    id: "cat",
    name: { th: "แมว", en: "Cat" },
    src: "/avatars/ip-as-logo/u-14-cat.png",
    backgroundColor: "#75507E",
  },
  {
    id: "capybara",
    name: { th: "คาปิบารา", en: "Capybara" },
    src: "/avatars/ip-as-logo/options/avatar-15-capybara.png",
    backgroundColor: "#A85F57",
  },
  {
    id: "otter",
    name: { th: "นาก", en: "Otter" },
    src: "/avatars/ip-as-logo/options/avatar-16-otter.png",
    backgroundColor: "#2D6DB5",
  },
  {
    id: "red-panda",
    name: { th: "แพนด้าแดง", en: "Red panda" },
    src: "/avatars/ip-as-logo/options/avatar-17-red-panda.png",
    backgroundColor: "#9A78A7",
  },
  {
    id: "owl",
    name: { th: "นกฮูก", en: "Owl" },
    src: "/avatars/ip-as-logo/options/avatar-18-owl.png",
    backgroundColor: "#497A68",
  },
  {
    id: "koala",
    name: { th: "โคอาลา", en: "Koala" },
    src: "/avatars/ip-as-logo/options/avatar-19-koala.png",
    backgroundColor: "#E29A6D",
  },
  {
    id: "panda",
    name: { th: "แพนด้า", en: "Panda" },
    src: "/avatars/ip-as-logo/options/avatar-20-panda.png",
    backgroundColor: "#84A36C",
  },
  {
    id: "raccoon",
    name: { th: "แร็กคูน", en: "Raccoon" },
    src: "/avatars/ip-as-logo/options/avatar-21-raccoon.png",
    backgroundColor: "#6F6B9B",
  },
  {
    id: "duck",
    name: { th: "เป็ด", en: "Duck" },
    src: "/avatars/ip-as-logo/options/avatar-22-duck.png",
    backgroundColor: "#57A6AE",
  },
  {
    id: "hamster",
    name: { th: "แฮมสเตอร์", en: "Hamster" },
    src: "/avatars/ip-as-logo/options/avatar-23-hamster.png",
    backgroundColor: "#C77C8D",
  },
  {
    id: "alpaca",
    name: { th: "อัลปากา", en: "Alpaca" },
    src: "/avatars/ip-as-logo/options/avatar-24-alpaca.png",
    backgroundColor: "#728CC9",
  },
  {
    id: "turtle",
    name: { th: "เต่า", en: "Turtle" },
    src: "/avatars/ip-as-logo/options/avatar-25-turtle.png",
    backgroundColor: "#C87360",
  },
  {
    id: "octopus",
    name: { th: "หมึกยักษ์", en: "Octopus" },
    src: "/avatars/ip-as-logo/options/avatar-26-octopus.png",
    backgroundColor: "#5D62A5",
  },
  {
    id: "crab",
    name: { th: "ปู", en: "Crab" },
    src: "/avatars/ip-as-logo/options/avatar-27-crab.png",
    backgroundColor: "#3E86A5",
  },
  {
    id: "bee",
    name: { th: "ผึ้ง", en: "Bee" },
    src: "/avatars/ip-as-logo/options/avatar-28-bee.png",
    backgroundColor: "#4C827C",
  },
  {
    id: "jellyfish",
    name: { th: "แมงกะพรุน", en: "Jellyfish" },
    src: "/avatars/ip-as-logo/options/avatar-29-jellyfish.png",
    backgroundColor: "#596F9D",
  },
  {
    id: "sheep",
    name: { th: "แกะ", en: "Sheep" },
    src: "/avatars/ip-as-logo/options/avatar-30-sheep.png",
    backgroundColor: "#7F8C5A",
  },
  {
    id: "hippo",
    name: { th: "ฮิปโป", en: "Hippo" },
    src: "/avatars/ip-as-logo/options/avatar-31-hippo.png",
    backgroundColor: "#8C5E7D",
  },
  {
    id: "crocodile",
    name: { th: "จระเข้", en: "Crocodile" },
    src: "/avatars/ip-as-logo/options/avatar-32-crocodile.png",
    backgroundColor: "#B4944E",
  },
  {
    id: "hedgehog",
    name: { th: "เม่นแคระ", en: "Hedgehog" },
    src: "/avatars/ip-as-logo/options/avatar-33-hedgehog.png",
    backgroundColor: "#4E739E",
  },
  {
    id: "bat",
    name: { th: "ค้างคาว", en: "Bat" },
    src: "/avatars/ip-as-logo/options/avatar-34-bat.png",
    backgroundColor: "#A95863",
  },
]
