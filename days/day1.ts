import {measure, sum} from "../utils/utils"
import { Day } from "../utils/day"

const numberMap = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9
}

export class Solution extends Day {

  getValue(match: string) {
    return numberMap[match] ?? match
  }

  getValues(regex: RegExp) {
    return this.data.map((line) => {
      const matches = line.matchAll(regex)
      const digits = Array.from(matches, (x) => x[1])
      return parseInt(`${this.getValue(digits[0])}${this.getValue(digits[digits.length - 1])}`)
    })
  }

  @measure
  task1() {
    const values = this.getValues(/(\d{1})/g)
    this.logAnswer(1, sum(values))
  }

  @measure
  task2() {
    const values = this.getValues(/(?=(one|two|three|four|five|six|seven|eight|nine|\d){1})/g)
    this.logAnswer(2, sum(values))
  }

}