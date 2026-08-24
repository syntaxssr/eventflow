import { describe, expect, it } from "vitest"

import { MOCK_NOW_ISO, MOCK_TODAY_ISO } from "@/constants/mock-date"
import { createInitialState } from "@/mock"

const state = createInitialState()
const userIds = new Set(state.users.map((user) => user.id))
const eventIds = new Set(state.events.map((event) => event.id))
const taskIds = new Set(state.tasks.map((task) => task.id))
const categoryIds = new Set(state.fileCategories.map((category) => category.id))

/**
 * ชุดทดสอบนี้ทำหน้าที่เป็น "ยาม" ของ Mock Data
 *
 * ข้อมูลจำลองถูกสร้างบางส่วนด้วยสูตรคำนวณ จึงพลาดได้ง่าย
 * เช่น วันที่สร้างงานหลุดไปอยู่ในอนาคต หรืออ้างถึง id ที่ไม่มีอยู่จริง
 */
describe("ความสมบูรณ์ของ Mock Data", () => {
  it("ทุก id ไม่ซ้ำกัน", () => {
    expect(userIds.size).toBe(state.users.length)
    expect(eventIds.size).toBe(state.events.length)
    expect(taskIds.size).toBe(state.tasks.length)
    expect(new Set(state.files.map((f) => f.id)).size).toBe(state.files.length)
    expect(new Set(state.participants.map((p) => p.id)).size).toBe(
      state.participants.length
    )
    expect(new Set(state.employees.map((e) => e.id)).size).toBe(
      state.employees.length
    )
  })

  it("ทะเบียนพนักงานจาก CSV มีลำดับไม่ซ้ำและข้อมูลสำหรับแสดงผลครบ", () => {
    const codes = state.employees.map((e) => e.employeeCode)
    expect(new Set(codes).size).toBe(codes.length)
    expect(state.employees).toHaveLength(117)

    const employeeEmails = new Set<string>()
    const employeesWithoutDepartment = new Set([
      "emp-contact-1",
      "emp-contact-2",
    ])
    for (const employee of state.employees) {
      if (employee.startDate) {
        expect(employee.startDate <= MOCK_TODAY_ISO, employee.id).toBe(true)
      }
      expect(employee.firstName.th, employee.id).not.toBe("")
      expect(employee.firstName.en, employee.id).not.toBe("")
      expect(employee.position.th, employee.id).not.toBe("")
      if (employeesWithoutDepartment.has(employee.id)) {
        expect(employee.department.th, employee.id).toBe("")
        expect(employee.department.en, employee.id).toBe("")
      } else {
        expect(employee.department.th, employee.id).not.toBe("")
      }
      expect(employee.email, employee.id).toMatch(
        /^[a-z0-9]+\.[a-z0-9]+@company\.co\.th$|^employee\d+@company\.co\.th$/
      )
      expect(employeeEmails.has(employee.email), employee.id).toBe(false)
      employeeEmails.add(employee.email)
      expect(employee.phone, employee.id).toBe("0912345678")
    }
  })

  it("ทุกกิจกรรมอ้างถึงผู้รับผิดชอบที่มีอยู่จริง", () => {
    for (const event of state.events) {
      expect(userIds.has(event.ownerId), event.id).toBe(true)
      expect(userIds.has(event.createdBy), event.id).toBe(true)
      expect(userIds.has(event.updatedBy), event.id).toBe(true)
    }
  })

  it("ทุกงานย่อยอ้างถึงกิจกรรมและผู้รับผิดชอบที่มีอยู่จริง", () => {
    for (const task of state.tasks) {
      expect(eventIds.has(task.eventId), task.id).toBe(true)
      expect(task.assigneeIds.length, task.id).toBeGreaterThan(0)
      for (const assigneeId of task.assigneeIds) {
        expect(userIds.has(assigneeId), `${task.id} → ${assigneeId}`).toBe(true)
      }
    }
  })

  it("ความสัมพันธ์ dependsOn ชี้ไปยังงานที่มีอยู่จริงและอยู่กิจกรรมเดียวกัน", () => {
    const taskById = new Map(state.tasks.map((task) => [task.id, task]))
    for (const task of state.tasks) {
      for (const dependencyId of task.dependsOn) {
        const dependency = taskById.get(dependencyId)
        expect(dependency, `${task.id} → ${dependencyId}`).toBeDefined()
        expect(dependency!.eventId).toBe(task.eventId)
      }
    }
  })

  it("`blocks` เป็นข้อมูลย้อนกลับของ `dependsOn` อย่างถูกต้อง", () => {
    const taskById = new Map(state.tasks.map((task) => [task.id, task]))
    for (const task of state.tasks) {
      for (const dependencyId of task.dependsOn) {
        expect(taskById.get(dependencyId)!.blocks).toContain(task.id)
      }
      for (const blockedId of task.blocks) {
        expect(taskById.get(blockedId)!.dependsOn).toContain(task.id)
      }
    }
  })

  it("ไม่มี Circular Dependency ในข้อมูลตั้งต้น", () => {
    const taskById = new Map(state.tasks.map((task) => [task.id, task]))
    const visited = new Set<string>()

    const hasCycle = (id: string, path: Set<string>): boolean => {
      if (path.has(id)) return true
      if (visited.has(id)) return false
      path.add(id)
      for (const next of taskById.get(id)?.dependsOn ?? []) {
        if (hasCycle(next, path)) return true
      }
      path.delete(id)
      visited.add(id)
      return false
    }

    for (const task of state.tasks) {
      expect(hasCycle(task.id, new Set()), task.id).toBe(false)
    }
  })

  it("ไม่มีเหตุการณ์ใดถูกสร้างขึ้นในอนาคต", () => {
    for (const task of state.tasks) {
      expect(task.createdAt.slice(0, 10) <= MOCK_TODAY_ISO, task.id).toBe(true)
    }
    for (const activity of state.activities) {
      expect(
        activity.createdAt <= MOCK_NOW_ISO,
        `${activity.id} ${activity.action} ${activity.createdAt}`
      ).toBe(true)
    }
    for (const file of state.files) {
      for (const version of file.versions) {
        expect(version.uploadedAt.slice(0, 10) <= MOCK_TODAY_ISO, file.id).toBe(
          true
        )
      }
    }
  })

  it("ประวัติการใช้งานเรียงจากใหม่ไปเก่า", () => {
    for (let i = 1; i < state.activities.length; i += 1) {
      expect(
        state.activities[i - 1].createdAt >= state.activities[i].createdAt
      ).toBe(true)
    }
  })

  it("ทุกไฟล์มีเวอร์ชันและชี้ไปยังเวอร์ชันปัจจุบันที่ถูกต้อง", () => {
    for (const file of state.files) {
      expect(file.versions.length, file.id).toBeGreaterThan(0)
      expect(categoryIds.has(file.categoryId), file.id).toBe(true)
      expect(eventIds.has(file.eventId), file.id).toBe(true)
      expect(
        file.versions.some((version) => version.id === file.currentVersionId),
        file.id
      ).toBe(true)
      expect(file.versions.map((v) => v.versionNumber)).toEqual(
        file.versions.map((_, index) => index + 1)
      )
    }
  })

  it("อีเมลผู้เข้าร่วมในกิจกรรมเดียวกันต้องไม่ซ้ำ", () => {
    const seen = new Map<string, Set<string>>()
    for (const participant of state.participants) {
      const emails = seen.get(participant.eventId) ?? new Set<string>()
      expect(
        emails.has(participant.email.toLowerCase()),
        `${participant.eventId} ${participant.email}`
      ).toBe(false)
      emails.add(participant.email.toLowerCase())
      seen.set(participant.eventId, emails)
    }
  })

  it("การแจ้งเตือนทุกรายการมีผู้รับที่มีอยู่จริง", () => {
    for (const notification of state.notifications) {
      expect(userIds.has(notification.userId), notification.id).toBe(true)
      if (notification.actorId) {
        expect(userIds.has(notification.actorId), notification.id).toBe(true)
      }
      expect(notification.href.startsWith("/")).toBe(true)
    }
  })

  it("มีข้อมูลมากพอสำหรับสาธิตระบบ", () => {
    expect(state.events.length).toBeGreaterThanOrEqual(5)
    expect(state.tasks.length).toBeGreaterThanOrEqual(25)
    expect(state.participants.length).toBeGreaterThanOrEqual(60)
    expect(state.files.length).toBeGreaterThanOrEqual(15)
    expect(state.activities.length).toBeGreaterThanOrEqual(50)
  })

  it("มีทั้งงานเกินกำหนดและงานใกล้ครบกำหนดให้สาธิต", () => {
    const overdue = state.tasks.filter(
      (task) => task.status !== "completed" && task.dueDate! < MOCK_TODAY_ISO
    )
    const dueSoon = state.tasks.filter(
      (task) => task.status !== "completed" && task.dueDate === MOCK_TODAY_ISO
    )
    expect(overdue.length).toBeGreaterThan(0)
    expect(dueSoon.length).toBeGreaterThan(0)
  })

  it("กิจกรรมครอบคลุมทุกสถานะ", () => {
    expect(new Set(state.events.map((event) => event.status)).size).toBe(6)
  })
})
