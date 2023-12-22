import {measure, sum} from "../utils/utils"
import { Day } from "../utils/day"

interface Game {
  red: number,
  blue: number,
  green: number
}

export class Solution extends Day {

  games: Record<string, Game[]> = {}

  parseCounts(sets: string[]) {
    return sets.map((set) => {
      const colours = set.split(", ")
      const game = {
        red: 0,
        blue: 0,
        green: 0
      }
      colours.forEach((c) => {
        const {colour, count} = /(?<count>\d+) (?<colour>red|blue|green){1}/.exec(c.trim()).groups
        const numCount = parseInt(count)
        game[colour] = numCount
      })

      return game
    })
  }

  parseGame(game: string): [string, Game[]] {
    const bits = game.split(":")
    const {id} = /Game (?<id>\d+)/.exec(bits[0].trim()).groups
    const counts = this.parseCounts(bits[1].split("; "))

    return [id, counts]
  }

  getPossible(required: Game, counts: [string, Game][], comparison: (count: number, max: number) => boolean): number[] {
    return counts.filter(([_, game]) => {
      return comparison(game.red, required.red) && comparison(game.blue, required.blue) && comparison(game.green, required.green)
    }).map(([id, _]) => parseInt(id))
  }
  
  @measure
  prepData(data: string[]): void {
    this.games = Object.fromEntries(data.map((line) => {
      return this.parseGame(line)
    }))
  }

  @measure
  task1() {
    const maxCounts = Object.entries(this.games).map<[string, Game]>(([id, games]) => {
      return [id, games.reduce((counts: Game, current:Game) => {
        if(current.red > counts.red)
          counts.red = current.red

        if (current.blue > counts.blue)
          counts.blue = current.blue
        
        if (current.green > counts.green)
          counts.green = current.green

        return counts
      }, {red: 0, blue: 0, green: 0})]
    })
    const possible = this.getPossible({red: 12, blue: 14, green: 13}, maxCounts,(count:number, max: number) => count <= max)
    this.logAnswer(1, sum(possible))
  }

  @measure
  task2() {
    const products = Object.values(this.games).map<Game>((games) => {
      return games.reduce((counts: Game, current:Game) => {
        if(current.red > counts.red)
          counts.red = current.red

        if (current.blue > counts.blue)
          counts.blue = current.blue
        
        if (current.green > counts.green)
          counts.green = current.green

        return counts
      }, {red: 0, blue: 0, green: 0})
    }).map((game) => {
      return game.red * game.blue * game.green
    })
    this.logAnswer(2, sum(products))
  }

}