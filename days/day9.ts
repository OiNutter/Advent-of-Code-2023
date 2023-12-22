import {measure, sum} from "../utils/utils"
import { Day } from "../utils/day"

export class Solution extends Day {
  
  sequences: Array<number[]> = []

  @measure
  prepData(data: string[]): void {
    this.sequences = data.map((line) => {
      return line.trim().split(" ").map((n) => parseInt(n))
    })
  }

  @measure
  task1() {
    const newValues = this.sequences.map((sequence) => {
      // get to 0
      const steps = [[...sequence]]
      while (steps[steps.length-1].filter((n) => n !== 0).length > 0) {
        steps.push([])
        const prevStep = steps[steps.length-2]
        for (let i = 1; i < prevStep.length; i++) {
          steps[steps.length-1].push(prevStep[i] - prevStep[i-1])
        }
      }
      
      let diff = 0
      steps.reverse().slice(1).forEach((step) => {
        diff = step[step.length-1] + diff
      })
      return diff
    })
    
    this.logAnswer(1, sum(newValues))
  }

  @measure
  task2() {
    const newValues = this.sequences.map((sequence) => {
      // get to 0
      const steps = [[...sequence]]
      while (steps[steps.length-1].filter((n) => n !== 0).length > 0) {
        steps.push([])
        const prevStep = steps[steps.length-2]
        for (let i = 1; i < prevStep.length; i++) {
          steps[steps.length-1].push(prevStep[i] - prevStep[i-1])
        }
      }
      
      let diff = 0
      steps.reverse().slice(1).forEach((step) => {
        diff = step[0] - diff
      })
      return diff
    })
    this.logAnswer(2, sum(newValues))
  }

}