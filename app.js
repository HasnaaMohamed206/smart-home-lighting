// UI Mirror
const GOAL_STATES = {
  morning: {
    living_room: "on",
    kitchen: "on",
    childrens_room: "on",
    bedroom: "off",
    bathroom: "off",
  },
  night: {
    living_room: "off",
    bedroom: "off",
    kitchen: "off",
    bathroom: "off",
    childrens_room: "off",
  },
  movie: {
    living_room: "on",
    bedroom: "off",
    kitchen: "off",
    bathroom: "off",
    childrens_room: "off",
  },
  party: {
    living_room: "on",
    bedroom: "on",
    kitchen: "on",
    bathroom: "on",
    childrens_room: "on",
  },
}

// Smart Home Application
class SmartHome {
  constructor() {
    this.rooms = [
      { id: "living_room", name: "Living Room", status: "off" },
      { id: "bedroom", name: "Bedroom", status: "off" },
      { id: "kitchen", name: "Kitchen", status: "off" },
      { id: "bathroom", name: "Bathroom", status: "off" },
      { id: "childrens_room", name: "Children's Room", status: "off" },
    ]

    this.session = null
    this.currentPlanType = null
    this.init()
  }

  async init() {
    await this.initProlog()
    this.initUI()
    this.updateStats()
  }

  async initProlog() {
    try {
      console.log("[v0] Initializing Tau Prolog...")

      this.session = window.pl.create()

      await new Promise((resolve, reject) => {
        this.session.consult(window.prologProgram, {
          success: () => {
            console.log("[v0] Prolog program loaded successfully!")
            resolve()
          },
          error: (err) => {
            console.error("[v0] Prolog loading error:", err)
            reject(err)
          },
        })
      })

      console.log("[v0] Prolog engine ready!")
    } catch (error) {
      console.error("[v0] Prolog setup error:", error)
      alert("Failed to initialize Prolog engine. Please refresh the page.")
    }
  }

  initUI() {
    this.renderRooms()
    const planButtons = document.querySelectorAll(".btn-plan")
    planButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const planType = e.currentTarget.dataset.plan
        this.selectPlan(planType)
      })
    })
  }

  renderRooms() {
    const grid = document.getElementById("roomsGrid")
    grid.innerHTML = ""

    this.rooms.forEach((room) => {
      const card = this.createRoomCard(room)
      grid.appendChild(card)
    })
  }

  createRoomCard(room) {
    const card = document.createElement("div")
    card.className = `room-card light-${room.status}`
    card.setAttribute("data-room", room.id)

    card.innerHTML = `
            <div class="room-header">
                <div class="room-info">
                    <h3>${room.name}</h3>
                    <p class="room-status">${room.status}</p>
                </div>
                <div class="light-icon-container">
                    <div class="glow-effect"></div>
                    <svg class="light-icon" viewBox="0 0 24 24">
                        <path d="M9 2h6l-1 7h4l-8 13 2-8H8z"/>
                    </svg>
                </div>
            </div>
            <div class="toggle-switch" data-room="${room.id}">
                <div class="toggle-slider">
                    <svg class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                </div>
                <span class="toggle-text off">OFF</span>
                <span class="toggle-text on">ON</span>
            </div>
        `

    const toggleSwitch = card.querySelector(".toggle-switch")
    toggleSwitch.addEventListener("click", () => this.toggleRoom(room.id))

    return card
  }

  toggleRoom(roomId) {
    const room = this.rooms.find((r) => r.id === roomId)
    if (room) {
      room.status = room.status === "on" ? "off" : "on"
      this.updateRoomCard(roomId)
      this.updateStats()
      this.playSound(room.status)
    }
  }

  updateRoomCard(roomId) {
    const card = document.querySelector(`[data-room="${roomId}"]`)
    const room = this.rooms.find((r) => r.id === roomId)

    if (card && room) {
      card.className = `room-card light-${room.status}`
      card.querySelector(".room-status").textContent = room.status

      card.style.animation = "none"
      setTimeout(() => {
        card.style.animation = ""
      }, 10)
    }
  }

  updateStats() {
    const lightsOn = this.rooms.filter((r) => r.status === "on").length
    const lightsOff = this.rooms.length - lightsOn

    document.getElementById("lightsOn").textContent = lightsOn
    document.getElementById("lightsOff").textContent = lightsOff
  }

  async executePlan() {
    if (!this.session) {
      alert("Prolog engine not initialized yet.")
      return
    }

    console.log(`[v0] Executing ${this.currentPlanType}...`)

    // 1. Reset UI
    this.rooms.forEach((room) => {
      room.status = "off"
      this.updateRoomCard(room.id)
    })
    this.updateStats()

    await this.sleep(300)

    // 2. Ask Prolog
    let plan = []
    try {
      plan = await Promise.race([
        this.queryPlan(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Planning timeout")), 5000)
        ),
      ])
    } catch (err) {
      console.error(err)
    }

    console.log("[v0] AI Generated Plan:", plan)

    // 3. If Prolog gave steps → animate
    if (plan && plan.length > 0) {
      await this.applyPlan(plan)
      this.showCelebration()
      return
    }

    // 4. Fallback: Apply goal state directly
    console.warn("[v0] Empty plan – applying goal state manually")

    const goal = GOAL_STATES[this.currentPlanType]
    if (!goal) return

    for (const room of this.rooms) {
      const targetStatus = goal[room.id]
      if (targetStatus && room.status !== targetStatus) {
        room.status = targetStatus
        this.updateRoomCard(room.id)
        this.updateStats()
        this.playSound(targetStatus)
        await this.sleep(300)
      }
    }

    this.showCelebration()
  }

  queryPlan() {
    return new Promise((resolve, reject) => {
      const query = `solve_plan(${this.currentPlanType}, Plan).`
      console.log("[v0] Querying:", query)

      this.session.query(query, {
        success: () => {
          this.session.answer({
            success: (answer) => {
              console.log("[v0] Got answer:", answer)
              const plan = this.parsePrologPlan(answer)
              resolve(plan)
            },
            fail: () => {
              console.warn("[v0] Prolog returned no plan")
              resolve([])
            },
            error: (err) => {
              console.error("[v0] Prolog answer error:", err)
              reject(err)
            },
          })
        },
        error: (err) => {
          console.error("[v0] Prolog query syntax error:", err)
          reject(err)
        },
      })
    })
  }

  parsePrologPlan(answer) {
    console.log("[v0] Parsing Prolog answer...")

    if (!answer || !answer.links || !answer.links.Plan) {
      console.log("[v0] No Plan variable found")
      return []
    }

    const actions = []
    let current = answer.links.Plan

    while (current && current.indicator === "./2") {
      const actionTerm = current.args[0]

      if (actionTerm && actionTerm.id) {
        const actionName = actionTerm.id
        const roomTerm = actionTerm.args ? actionTerm.args[0] : null
        const roomId = roomTerm ? roomTerm.id : null

        if (roomId) {
          actions.push({
            action: actionName,
            room: roomId,
          })
          console.log(`[v0] Parsed action: ${actionName}(${roomId})`)
        }
      }

      current = current.args[1]
    }

    return actions
  }

  async applyPlan(plan) {
    await this.sleep(500)

    for (const step of plan) {
      const newStatus = step.action === "turn_on" ? "on" : "off"
      const room = this.rooms.find((r) => r.id === step.room)

      if (room) {
        room.status = newStatus
        this.updateRoomCard(room.id)
        this.updateStats()
        this.playSound(newStatus)
        await this.sleep(600)
      }
    }
  }

  showCelebration() {
    const celebration = document.createElement("div")
    celebration.className = "celebration"
    celebration.style.position = "fixed"
    celebration.style.top = "0"
    celebration.style.left = "0"
    celebration.style.width = "100vw"
    celebration.style.height = "100vh"
    celebration.style.pointerEvents = "none"
    celebration.style.zIndex = "9999"

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div")
      confetti.style.position = "absolute"
      confetti.style.width = "10px"
      confetti.style.height = "10px"
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`
      confetti.style.left = Math.random() * 100 + "%"
      confetti.style.top = "-10px"
      confetti.style.borderRadius = "50%"
      confetti.style.animation = `fall ${2 + Math.random() * 2}s linear forwards`
      celebration.appendChild(confetti)
    }

    document.body.appendChild(celebration)
    setTimeout(() => celebration.remove(), 4000)

    if (!document.getElementById("confetti-style")) {
      const style = document.createElement("style")
      style.id = "confetti-style"
      style.textContent = `
                @keyframes fall {
                    to {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `
      document.head.appendChild(style)
    }
  }

  playSound(status) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = status === "on" ? 800 : 400
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  selectPlan(planType) {
    this.currentPlanType = planType

    document.querySelectorAll(".btn-plan").forEach((btn) => {
      btn.classList.remove("active")
    })

    document
      .querySelector(`[data-plan="${planType}"]`)
      .classList.add("active")

    this.executePlan()
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Initializing Smart Home App...")
  new SmartHome()
})