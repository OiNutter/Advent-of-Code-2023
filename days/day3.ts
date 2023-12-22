import {measure, sum} from "../utils/utils"
import { Day } from "../utils/day"

export class Solution extends Day {
  
  engine: Array<Array<string>> = []
  maxX: number = 0
  maxY: number = 0

  @measure
  prepData(data: string[]): void {
    this.engine = data.map((line) => {
      return line.split('')
    })
    
    this.maxY = this.engine.length
    this.maxX = this.engine?.[0].length ?? 0
  }

  findParts() {
    return this.engine.flatMap((row, y) => {
      const parts = []
      let part = ''
      let startX: number | undefined
      for (let x = 0; x < row.length; x++) {
        const char = row[x]
        
        if (/\d/.test(char)) {
          part += char
          startX = startX ?? x
          continue
        } else if (part !== '') {

          const isPart = this.isPart(part, startX, y)

          if (isPart)
            parts.push(part)

          part = ''
          startX = undefined
        }
      }
      if (part != '') {
        const isPart = this.isPart(part, startX, y)
        if (isPart)
          parts.push(part)
      }

      return parts
    })
  }

  isPart(char: string, startX: number, startY: number) {
    for (let y = Math.max(0, startY-1); y <= Math.min(startY+1, this.maxY-1); y++) {
      for (let x = Math.max(0, startX-1); x <= Math.min(startX+char.length, this.maxX-1); x++) {
        if (!/\d|\./.test(this.engine[y][x]))
          return true
      }
    }

    return false
  }

  findGearRatios() {
    const gears = this.engine.flatMap((row, y) => {
      const found = []
      for (let x = 0; x<row.length;x++) {
        if (row[x] === "*")
          found.push([y,x])
      }
      return found
    })

    const ratios: Record<string, number[]> = {}

    this.engine.forEach((row, y) => {
      const parts = []
      let part = ''
      let startX: number | undefined
      for (let x = 0; x < row.length; x++) {
        const char = row[x]
        
        if (/\d/.test(char)) {
          part += char
          startX = startX ?? x
          continue
        } else if (part !== '') {

          const found = gears.filter((gear) => {
            const [gearY, gearX] = gear
            return gearY >= y - 1 && gearY <= y + 1 &&
              gearX >= startX - 1 && gearX <= startX + part.length
          })

          found.forEach(([gearY, gearX]) => {
            const key = `${gearY},${gearX}`
            if (!ratios[key])
              ratios[key] = []
            ratios[key].push(parseInt(part))
          })
          part = ''
          startX = undefined
        }
      }
      if (part != '') {
        const found = gears.filter((gear) => {
          const [gearY, gearX] = gear
          return gearY >= y - 1 && gearY <= y + 1 &&
            gearX >= startX - 1 && gearX <= startX + part.length
        })

        found.forEach(([gearY, gearX]) => {
          const key = `${gearY},${gearX}`
          if (!ratios[key])
            ratios[key] = []
          ratios[key].push(parseInt(part))
        })
      }

      return parts
    })

    return Object.values(ratios)
      .filter((v) => v.length === 2).map(([a,b]) => a*b)

  }

  @measure
  task1() {
    const parts = this.findParts()
    this.logAnswer(1, sum(parts.map((x) => parseInt(x))))
  }

  @measure
  task2() {
    const ratios = this.findGearRatios()
    this.logAnswer(2, sum(ratios))
  }

}