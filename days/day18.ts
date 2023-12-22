import { Coord, measure, shoelaceFormula, sum } from "../utils/utils";
import { Day } from "../utils/day";

type Direction = "R" | "L" | "D" | "U"

interface Instruction {
  dir: Direction
  steps: number,
  hex?: string
}

interface Hole {
  pos: Coord,
  hex: string
}

const deltas = {
  "R" : [1,0],
  "L": [-1,0],
  "U": [0,-1],
  "D": [0,1]
}

export class Solution extends Day {
  instructions: Instruction[] = []

  @measure
  prepData(data: string[]): void {
    this.instructions = data.map((line) => {
      const {dir, steps, hex} = /^(?<dir>(R|L|U|D){1}) (?<steps>\d+) \((?<hex>#[a-z0-9]{6})\)$/.exec(line.trim()).groups
      return {
        dir: dir as Direction,
        steps: parseInt(steps),
        hex
      }
    })
  }

  parseHex(hex:string): Instruction {
    const dirs = ["R","D", "L", "U"]
    const steps = parseInt(hex.substring(1,6),16)
    const dir = dirs[parseInt(hex.substring(6))]

    return {
      dir: dir as Direction,
      steps
    }
  }

  digHole(instructions: Instruction[]) {
    const start = {
        x: 0,
        y: 0
      }
    
    const currentPos = {x: 0, y: 0}
    const vertices:Array<Coord> = instructions.map((instruction) => {
      const delta = deltas[instruction.dir]
      currentPos.x += (delta[0] * instruction.steps),
      currentPos.y += (delta[1] * instruction.steps)
      return {
        ...currentPos,
      }
    })
    const perimeter = sum(instructions.map(({steps}) => steps))
    
    const area = shoelaceFormula(vertices)

    return area + (perimeter/2) + 1
  }

  @measure
  task1() {
    const area= this.digHole(this.instructions)
    this.logAnswer(1, area);
  }

  @measure
  task2() {
    const area = this.digHole(this.instructions.map(({hex}) => this.parseHex(hex)))
    this.logAnswer(2, area);
  }
}
