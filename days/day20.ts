import { lcmAll, measure, range } from "../utils/utils"
import { Day } from "../utils/day"

type Flip = "%"
type Conjunction = "&"
type Broadcaster = "broadcaster"
type Pulse = "high" | "low"
type QueueItem = [string, Pulse, string]

interface Module {
  name: string
  type: Flip | Conjunction | Broadcaster
  inputs?: Record<string, Pulse>
  on?: Boolean
  destinations: string[]
}

export class Solution extends Day {
  modules: Record<string, Module>
  originalModules: Record<string, Module>

  @measure
  prepData(data: string[]): void {
    this.modules = Object.fromEntries(
      data.map((line) => {
        const [mod, destinations] = line.trim().split(" -> ")

        const destinationKeys = destinations.split(", ")
        if (mod === "broadcaster") {
          return [
            "broadcaster",
            {
              name: "broadcaster",
              type: "broadcaster",
              destinations: destinationKeys,
              inputs: {},
            } as Module,
          ]
        } else {
          const type = mod.substring(0, 1)
          const name = mod.substring(1)

          if (type === "%") {
            return [
              name,
              {
                name,
                type,
                on: false,
                destinations: destinationKeys,
              } as Module,
            ]
          } else {
            return [
              name,
              {
                name,
                type,
                inputs: {},
                destinations: destinationKeys,
              } as Module,
            ]
          }
        }
      })
    )

    // Set inputs
    Object.values(this.modules).forEach((c) => {
      //find all inputs
      c.inputs = Object.fromEntries(
        Object.values(this.modules)
          .filter((m) => m.destinations.includes(c.name))
          .map((m) => [m.name, "low"])
      )
    })

    this.originalModules = JSON.parse(JSON.stringify(this.modules))
  }

  handlePulse(mod: Module, pulse: Pulse, sender: string): QueueItem[] {
    if (mod.type === "broadcaster") {
      return mod.destinations.map((name) => [name, pulse, mod.name])
    } else if (mod.type === "%") {
      if (pulse === "low") {
        mod.on = !mod.on
        return mod.destinations.map((name) => [
          name,
          mod.on ? "high" : "low",
          mod.name,
        ])
      } else {
        return []
      }
    } else if (mod.type === "&") {
      mod.inputs[sender] = pulse
      // All high?
      const send = Object.values(mod.inputs).find((p) => p !== "high")
        ? "high"
        : "low"
      return mod.destinations.map((name) => [name, send, mod.name])
    }
  }

  pressButton(lookFor: string[] = []) {
    const q: QueueItem[] = [["broadcaster", "low", "start"]]
    let high = 0
    let low = 0
    const encountered = new Set<string>()
    while (q.length > 0) {
      const [target, pulse, sender] = q.shift()
      if (pulse === "high")
        high++
      else
        low++
      
      
      if (this.modules[target] !== undefined) {
        const targets = this.handlePulse(this.modules[target], pulse, sender)
        q.push(...targets)
        targets.forEach((t) => {
          if (lookFor.includes(t[0]) && t[1] === "low")
            encountered.add(t.join("|"))
        })
      }
    }

    return { high, low, encountered }
  }

  @measure
  task1() {
    const { high, low } = [...range(0, 1000)].reduce(
      (totals, i) => {
        const { high, low } = this.pressButton()
        totals.high += high
        totals.low += low
        return totals
      },
      { high: 0, low: 0 }
    )

    this.logAnswer(1, high * low)
  }

  @measure
  task2() {
    if (this.useSample) return

    this.modules = JSON.parse(JSON.stringify(this.originalModules))
    let i = 0
    const first: Record<string, number> = {}

    // Find all roads to rx
    const ends = Object.values(this.modules).filter((m) => m.destinations.includes("rx")).flatMap((m) => {
      return Object.keys(m.inputs)
    })

    while (true) {
      i++
      const { encountered } = this.pressButton(ends)
      encountered.forEach((encounter) => {
        if (first[encounter] === undefined) first[encounter] = i
      })

      if (Object.values(first).length === 4) break
    }
    this.logAnswer(2, lcmAll(Object.values(first)))
  }
}
