"use client"

import { jsPDF } from "jspdf"
import * as XLSX from "xlsx"

import { currentVersion } from "@/lib/file"
import type { FileItem } from "@/types/file"

/**
 * ดาวน์โหลดไฟล์ mock เป็นไฟล์จริง
 *
 * เนื้อหาไฟล์ไม่ได้ถูกเก็บใน Prototype จึงสร้างไฟล์แทนตามประเภท:
 * - รูปที่ผู้ใช้เพิ่งอัปโหลด → ใช้เนื้อหาจริงจาก object URL
 * - PDF / Excel → สร้างไฟล์จริงจากข้อมูล metadata ของไฟล์นั้น
 * - ประเภทอื่น (Word/PowerPoint/รูป mock) → ไฟล์ .txt สรุปข้อมูลไฟล์
 */
export async function downloadMockFile(file: FileItem): Promise<void> {
  const version = currentVersion(file)

  // รูปที่มีตัวอย่างจริง (จากการอัปโหลดใน session หรือ SVG ใน public/)
  if (file.type === "image" && version.previewUrl) {
    const response = await fetch(version.previewUrl)
    saveBlob(await response.blob(), file.name)
    return
  }

  const manifest = [
    ["EventFlow — mock file"],
    ["Filename", version.filename],
    ["Version", `v${version.versionNumber}`],
    ["Size", `${version.size} bytes`],
    ["Uploaded at", version.uploadedAt],
    ["Change note", version.changeNote.en],
  ]

  if (file.type === "pdf") {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(version.filename, 14, 20)
    doc.setFontSize(10)
    manifest.slice(1).forEach((row, index) => {
      doc.text(`${row[0]}: ${row[1]}`, 14, 32 + index * 7)
    })
    doc.save(file.name)
    return
  }

  if (file.type === "excel") {
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(manifest),
      "Info"
    )
    XLSX.writeFile(workbook, file.name)
    return
  }

  // Word / PowerPoint / รูปที่ไม่มีตัวอย่าง — แนบเป็นไฟล์ข้อความสรุปแทน
  const text = manifest.map((row) => row.join(": ")).join("\n")
  saveBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), `${file.name}.txt`)
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
