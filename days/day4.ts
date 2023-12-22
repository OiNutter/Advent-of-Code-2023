import {measure, sum} from "../utils/utils"
import { Day } from "../utils/day"
import "core-js/full/set/intersection"

interface Card {
  winningNumbers: Set<number>
  myNumbers: Set<number>
  matches: number
}

export class Solution extends Day {
  
  cards: Card[] = []

  @measure
  prepData(data: string[]): void {
    this.cards = data.map((line) => {
      const bits = line.trim().replace(/Card\s+(\d+): /,'').split(' | ')
      const winningNumbers = new Set(bits[0].trim().split(/\s+/).map((n) => parseInt(n.trim())))
      const myNumbers = new Set(bits[1].trim().split(/\s+/).map((n) => parseInt(n.trim())))

      return {
        winningNumbers,
        myNumbers,
        matches: myNumbers.intersection(winningNumbers).size
      }
    })
  }

  calculatePoints() {

    return this.cards.reduce((points, card, i) => {
      return points + ((card.matches > 0) ? Math.pow(2,card.matches-1) : 0)
    }, 0)

  }

  calculateScratchcards() {
    let counts = [...new Array(this.cards.length)].fill(1)
    this.cards.forEach((card, i) => {
      for (let n = 1; n <= card.matches; n++) {
        counts[i+n] += counts[i]
      }
    })
    return sum(counts)
  }

  @measure
  task1() {
    const points = this.calculatePoints()
    this.logAnswer(1, points)
  }

  @measure
  task2() {
    const scratchcards = this.calculateScratchcards()
    this.logAnswer(2, scratchcards)
  }

}