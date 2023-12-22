import {readFileSync} from "fs"
import path from "path"
import {measure} from "./utils"

export class Day {
  useSample: boolean = false
  filename: string
  data: string[]

  constructor(filename: string, useSample = false) {
    this.useSample = useSample
    this.filename = filename
  }

  logAnswer(task: number, answer: string | number) {
    console.log(`The answer to task ${task} is: `, answer)
  }

  logTime(start:number) {
    console.log(`--- ${+Date.now() - start} seconds ---`)
  }

  @measure
  prepData(data: string[]) {
    this.data = data
  }

  task1() {

  }

  task2() {

  }

  @measure
  run(task?: 1 | 2) {
    const data = readFileSync(path.join("inputs", this.filename), 'utf8')

    console.log("--- Data Prep ---")
    this.prepData(data.trim().split("\n"))

    if (!task || task === 1) {
      console.log("--- Task 1 ---")
      this.task1()
    }

    if (!task || task === 2) {
      console.log("--- Task 2")
      this.task2()
    }

    console.log("--- Total Time ---")
  }

}