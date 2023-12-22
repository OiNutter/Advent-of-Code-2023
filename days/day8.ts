import {lcmAll, measure} from "../utils/utils"
import { Day } from "../utils/day"

interface Node {
  label: string,
  left: string,
  right: string
}

export class Solution extends Day {
  
  instructions: Array<"L" | "R"> = []
  nodes: Record<string, Node>

  @measure
  prepData(data: string[]): void {
    this.instructions = data.shift().trim().split("") as Array<"L" | "R">

    // Remove empty line
    data.shift()

    this.nodes = Object.fromEntries(data.map((line) => {
      const {label, left, right} = /(?<label>[0-9A-Z]{3}) = \((?<left>[0-9A-Z]{3}), (?<right>[0-9A-Z]{3})\)/.exec(line.trim()).groups
      return [label, {
        label,
        left,
        right
      }]
    }))

  }

  

  @measure
  task1() {
    
    let step = 0
    let currentNode = "AAA"
    let count = 0

    while (currentNode !== "ZZZ") {
      count++
      const instruction = this.instructions[step]
      const start = this.nodes[currentNode]
      currentNode = (instruction === "L") ? start.left : start.right
      step++
      if (step >= this.instructions.length)
        step = 0
    }
       
    this.logAnswer(1, count)
  }

  @measure
  task2() {
    let step = 0
    let currentNodes = Object.keys(this.nodes).filter((n) => n.endsWith("A"))
    const starts = [...currentNodes]
    let counts = currentNodes.map(() => 0)

    while (currentNodes.filter(n => !n.endsWith("Z")).length !== 0) {
      const instruction = this.instructions[step]
      currentNodes = currentNodes.map((n, i) => {
        if (n.endsWith("Z"))
          return n
        const start = this.nodes[n]
        n = (instruction === "L") ? start.left : start.right
        counts[i]++
        return n
      })

      step++
      if (step >= this.instructions.length)
        step = 0
    }
    
    this.logAnswer(2, lcmAll(counts))
  }

}