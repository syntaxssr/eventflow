import type * as Party from "partykit/server"

/**
 * ห้องเล่นสดของเกมส์ในงาน — 1 ห้อง = 1 PIN
 *
 * โฮสต์เปิดหน้าเกม (จอโปรเจกเตอร์) ผู้เข้าร่วมเข้าด้วย PIN จากมือถือ
 * ห้องไม่เก็บคะแนน เก็บแค่ว่าใครอยู่ในห้องและรอบนี้ใครตอบแล้ว
 *
 * state อยู่ในหน่วยความจำของห้อง ถ้าห้องว่างจนถูก hibernate รายชื่อจะหาย
 * ผู้เล่นที่ยังเปิดจอค้างไว้จะ join กลับเข้ามาเองด้วย playerId เดิม
 */

export const MAX_PLAYERS = 200

type Player = {
  id: string
  name: string
  connected: boolean
  joinedAt: number
}

/** รอบที่กำลังเล่น — โฮสต์เป็นคนกำหนด ผู้เล่นเห็นแค่ช้อยส์ */
type Round = {
  index: number
  choices: string[]
  /** true = ยังกดตอบได้ */
  open: boolean
}

type ClientMessage =
  | { type: "join"; role: "host" }
  | { type: "join"; role: "player"; playerId: string; name: string }
  | { type: "kick"; playerId: string }
  | { type: "round"; round: Round }
  | { type: "answer"; choiceIndex: number }

type ServerMessage =
  | {
      type: "state"
      players: Player[]
      hostOnline: boolean
      round: Round | null
      answeredPlayerIds: string[]
      myAnswer: number | null
    }
  | { type: "rejected"; reason: "full" | "duplicate-name" | "bad-name" }
  | { type: "kicked" }

type ConnectionState = { role: "host" } | { role: "player"; playerId: string }

type Connection = Party.Connection<ConnectionState>

function cleanName(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, 20)
}

export default class QuizRoom implements Party.Server {
  constructor(readonly room: Party.Room) {}

  private players = new Map<string, Player>()
  private round: Round | null = null
  /** playerId → ช้อยส์ที่เลือกในรอบปัจจุบัน */
  private answers = new Map<string, number>()

  onMessage(raw: string, sender: Connection) {
    let message: ClientMessage
    try {
      message = JSON.parse(raw) as ClientMessage
    } catch {
      return
    }

    switch (message.type) {
      case "join":
        if (message.role === "host") {
          sender.setState({ role: "host" })
          this.broadcastState()
          return
        }
        this.joinPlayer(sender, message.playerId, message.name)
        return

      case "kick":
        if (sender.state?.role !== "host") return
        this.players.delete(message.playerId)
        this.answers.delete(message.playerId)
        for (const conn of this.room.getConnections<ConnectionState>()) {
          if (
            conn.state?.role === "player" &&
            conn.state.playerId === message.playerId
          ) {
            this.send(conn, { type: "kicked" })
            conn.close()
          }
        }
        this.broadcastState()
        return

      case "round":
        if (sender.state?.role !== "host") return
        // รอบใหม่ = ล้างคำตอบเดิมทิ้ง รอบเดิมที่แค่ปิดรับคำตอบให้คงไว้
        if (message.round.index !== this.round?.index) this.answers.clear()
        this.round = message.round
        this.broadcastState()
        return

      case "answer": {
        const state = sender.state
        if (state?.role !== "player" || !this.round?.open) return
        if (
          message.choiceIndex < 0 ||
          message.choiceIndex >= this.round.choices.length
        ) {
          return
        }
        // ตอบได้ครั้งเดียวต่อรอบ
        if (this.answers.has(state.playerId)) return
        this.answers.set(state.playerId, message.choiceIndex)
        this.broadcastState()
        return
      }
    }
  }

  onClose(connection: Connection) {
    const state = connection.state
    if (state?.role === "player") {
      const player = this.players.get(state.playerId)
      // ปล่อยชื่อค้างไว้แบบ offline ผู้เล่นที่เน็ตหลุดจะกลับเข้ามาที่เดิมได้
      if (player) this.players.set(player.id, { ...player, connected: false })
    }
    this.broadcastState()
  }

  onError(connection: Connection) {
    this.onClose(connection)
  }

  private joinPlayer(sender: Connection, playerId: string, rawName: string) {
    const name = cleanName(rawName)
    if (name.length < 2) {
      this.send(sender, { type: "rejected", reason: "bad-name" })
      return
    }

    const existing = this.players.get(playerId)
    const nameTaken = [...this.players.values()].some(
      (player) => player.id !== playerId && player.name === name
    )
    if (nameTaken) {
      this.send(sender, { type: "rejected", reason: "duplicate-name" })
      return
    }
    if (!existing && this.players.size >= MAX_PLAYERS) {
      this.send(sender, { type: "rejected", reason: "full" })
      return
    }

    sender.setState({ role: "player", playerId })
    this.players.set(playerId, {
      id: playerId,
      name,
      connected: true,
      joinedAt: existing?.joinedAt ?? Date.now(),
    })
    this.broadcastState()
  }

  private hostOnline() {
    return [...this.room.getConnections<ConnectionState>()].some(
      (conn) => conn.state?.role === "host"
    )
  }

  private stateFor(connection: Connection): ServerMessage {
    const state = connection.state
    const myAnswer =
      state?.role === "player" ? (this.answers.get(state.playerId) ?? null) : null

    return {
      type: "state",
      players: [...this.players.values()].sort(
        (a, b) => a.joinedAt - b.joinedAt
      ),
      hostOnline: this.hostOnline(),
      round: this.round,
      answeredPlayerIds: [...this.answers.keys()],
      myAnswer,
    }
  }

  private send(connection: Connection, message: ServerMessage) {
    connection.send(JSON.stringify(message))
  }

  /** state ต่างกันรายคน (myAnswer) จึงส่งทีละ connection แทน broadcast รวม */
  private broadcastState() {
    for (const conn of this.room.getConnections<ConnectionState>()) {
      this.send(conn, this.stateFor(conn))
    }
  }
}
