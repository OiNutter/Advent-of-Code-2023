import {measure, prod} from "../utils/utils"
import { Day } from "../utils/day"

export class Solution extends Day {
  
  times: number[]
  distances: number[]
  races: Array<Record<number, number>>

  @measure
  prepData(data: string[]): void {
    data.forEach((line) => {
      if (line.startsWith("Time:")) {
        this.times = line.replace("Time:", "").trim().split(/\s+/).map((x) => parseInt(x))
      } else if (line.startsWith("Distance:")) {
        this.distances = line.replace("Distance:", "").trim().split(/\s+/).map((x) => parseInt(x))
      }
    })
  }

  calculateTravel(times, distances) {
    this.races = times.map((maxTime, n) => {
      const travel: Record<number, number> = {}

      for (let i = 1; i < maxTime; i++) {
        const remaining = maxTime - i
        const distance = i * remaining
        if (distance > distances[n])
          travel[i] = distance
      }

      return travel
    })
  }

  @measure
  task1() {
    this.calculateTravel(this.times, this.distances)
    const wins = this.races.map((race) => Object.keys(race).length)
    this.logAnswer(1, prod(wins))
  }

  

  @measure
  task2() {
    const maxTime = parseInt(this.times.join(""))
    const maxDistance = parseInt(this.distances.join(""))

    let start
    let end
    // Get first win
    for (let i = 1; i < maxTime; i++) {
      const remaining = maxTime - i
        const distance = i * remaining
        if (distance > maxDistance) {
          start = i
          break
        }
    }

    // Get last win
    for (let i = maxTime-1; i > 0; i--) {
        const remaining = maxTime - i
        const distance = i * remaining
        
        if (distance > maxDistance) {
          end = i
          break
        }
    }

    this.logAnswer(2, end-start+1)
  }

}