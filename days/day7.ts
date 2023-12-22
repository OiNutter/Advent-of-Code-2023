import {measure} from "../utils/utils"
import { Day } from "../utils/day"

interface Hand {
  cards: string[]
  bet: number
}

interface Result {
  cards: string[],
  score: number
}

const cardScores = {
  "A": 14,
  "K": 13,
  "Q": 12,
  "J": 11,
  "T": 10
}

const handScores = {
  fiveOfAKind: 700,
  fourOfAKind: 600,
  fullHouse: 500,
  threeOfAKind: 400,
  twoPair: 300,
  onePair: 200,
  highCard: 100
}

export class Solution extends Day {
  
  hands:Record<string, Hand> = {}

  @measure
  prepData(data: string[]): void {
    this.hands = Object.fromEntries(data.map((line) => {
      const [cards, bet] = line.trim().split(/\s+/)
      return [cards, {
        cards: cards.split(""),
        bet: parseInt(bet)
      }]
    }))
  }

  getCardScore(card: string, wildcard = false) {
    if (wildcard && card === "J")
      return 1

    return cardScores[card] ?? parseInt(card)
  }
  
  getHandType(cardCounts: Record<string, number>, wildcard = false) {
    let counts = Object.values(cardCounts)
    let maxCount = Math.max(...counts)
    if (maxCount !== 5 && wildcard) {
      const cards = Object.entries(cardCounts).filter(([_, count]) => count === maxCount)  

      if (!(cards.length === 1 && cards[0][0] === "J")) {
        maxCount += cardCounts["J"] ?? 0
        cardCounts[cards[0][0]] += cardCounts["J"] ?? 0
        cardCounts["J"] = 0
        counts = Object.values(cardCounts)
      } else {
        // J is max count so add to next highest score
     
          const nextHighest = Object.entries(cardCounts).filter(([card, count]) => {
            return (card !== "J")            
          }).sort((a, b) => {
            if (a[1] < b[1])
              return -1
            else if (a[1] > b[1])
              return 1
            else
              return 0
          })[0]

          maxCount += nextHighest[1]
          cardCounts["J"] = maxCount
          cardCounts[nextHighest[0]] = 0
          counts = Object.values(cardCounts)
        
      }
    } 

    if (maxCount === 5) {
      return handScores.fiveOfAKind
    } else if (maxCount === 4) {
      return handScores.fourOfAKind
    } else if (maxCount === 3) {
      return (counts.some(x => x === 2)) ? handScores.fullHouse : handScores.threeOfAKind
    } else if (maxCount === 2) {
      return (counts.filter(x => x === 2).length === 2) ? handScores.twoPair : handScores.onePair
    } else {
      return handScores.highCard
    }
  }

  getHandResult(cards: string[], wildcard = false) {
    const cardCounts = cards.reduce<Record<string, number>>((counts, card) => {
      if (counts[card] === undefined)
        counts[card] = 0

      counts[card]++
      return counts
    },{})

    return this.getHandType(cardCounts, wildcard)
  }

  rankHands(hands: Hand[], wildcard = false) {
    return hands.map<Result>((hand) => {
      return {
        cards: hand.cards, 
        score: this.getHandResult(hand.cards, wildcard)
      }
    }).sort((a, b) => {

      if (a.score < b.score)
        return -1
      else if(a.score > b.score)
        return 1

      for (let i = 0; i < a.cards.length; i++) {
        const aScore = this.getCardScore(a.cards[i], wildcard)
        const bScore = this.getCardScore(b.cards[i], wildcard)

        if (aScore < bScore)
          return -1
        else if (aScore > bScore)
          return 1
      }

      return 0
    })
  }

  @measure
  task1() {
    const ranks = this.rankHands(Object.values(this.hands))
    const winnings = ranks.reduce((pot, result, i) => {
      const bet = this.hands[result.cards.join("")].bet
      return pot + (bet * (i+1))
    }, 0)
    this.logAnswer(1, winnings)
  }

  @measure
  task2() {
    const ranks = this.rankHands(Object.values(this.hands), true)
    const winnings = ranks.reduce((pot, result, i) => {
      const bet = this.hands[result.cards.join("")].bet
      return pot + (bet * (i+1))
    }, 0)

    this.logAnswer(2, winnings)
  }

}