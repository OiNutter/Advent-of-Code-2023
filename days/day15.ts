import { measure, sum } from "../utils/utils";
import { Day } from "../utils/day";


export class Solution extends Day {

  sequence: string[] = []
  lenses: number[] = new Array(9).fill(0).map((_, i) => i+1)
  boxes: Array<string[]> = new Array(256).fill(0).map(() => [])

  @measure
  prepData(data: string[]): void {
    this.sequence = data.join("").split(",")
  }

  checksum(str: string) {
    return str.split("").reduce((val, char) => {

      const ascii = char.charCodeAt(0)
      val += ascii
      val *= 17

      return val %= 256
    }, 0)
  }

  focalPower(box: number, slot: number, focalLength: number) {
    return (1+box) * (1+slot) * focalLength
  }

  doOperation(op: string) {
    if (op.includes("=")) {
      // Add lens
      const [label, focalLength] = op.split("=")
      const box = this.checksum(label)
      const found = this.boxes[box].findIndex((l) => l.startsWith(`${label}|`))

      const newLens = `${label}|${focalLength}`
      // replace lens
      if (found !== -1) {
        this.boxes[box][found] = newLens
      } else {
        this.boxes[box].push(newLens)
      }
    } else if (op.includes("-")) {
      // Remove lens
      const label = op.replace("-","")
      const box = this.checksum(label)
      const found = this.boxes[box].findIndex((l) => l.startsWith(`${label}|`))
      if (found !== -1)
        this.boxes[box].splice(found, 1)
    }
    //console.log(JSON.stringify(this.boxes))
  }

  @measure
  task1() {
    const values = this.sequence.map(this.checksum)
    this.logAnswer(1, sum(values));
  }

  @measure
  task2() {
    this.sequence.map((op: string) => {
      this.doOperation(op)
    })
    const powers = this.boxes.flatMap((box, i) => {
      return box.map((lens, j) => {
        const [_, focalLength] = lens.split("|")
        return this.focalPower(i, j, parseInt(focalLength))
      })
    })
    this.logAnswer(2, sum(powers));
  }
}
