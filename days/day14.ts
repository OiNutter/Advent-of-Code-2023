import { divmod, measure, range, sum } from "../utils/utils";
import { Day } from "../utils/day";

const ROUND = "O"
const CUBE = "#"
const SPACE = "."

type Direction = "N" | "S" | "E" | "W"

export class Solution extends Day {
  
  platform: Array<string[]> = []
  originalPlatform: Array<string[]> = []
  memo: Record<string, number> = {}

  @measure
  prepData(data: string[]): void {
    this.platform = data.map((line) => {
      return line.trim().split("")
    })
    this.originalPlatform = [...this.platform]
  }

  drawPlatform() {
    this.platform.forEach(row => {
      console.log(row.join(""))
    })
    console.log("")
  }

  @measure
  getKey() {
    return this.platform.flatMap(row => row.join("")).join("")
  }

  rollPiece(x, y, direction: Direction) {

    const thisPiece = this.platform[y][x]
    
    if (thisPiece !== ROUND)
      return

    let col, row, stop, newX, newY
    switch (direction) {
      case "N": 
        col = [...range(0, y)].map(n => this.platform[n][x])
        stop = col.findLastIndex((p) => p !== SPACE)  
        newY = stop + 1
        if (newY !== y) {
          this.platform[newY][x] = thisPiece
          this.platform[y][x] = SPACE
        }
        break
      case "E":
        row = this.platform[y].slice(x+1)
        
        stop = row.findIndex((p) => p !== SPACE)
        if (stop === -1)
          stop = row.length

        newX = x + stop
      
        if (newX !==x) {
          this.platform[y][newX] = thisPiece
          this.platform[y][x] = SPACE
        }
        break
      case "S":
        col = [...range(y+1, this.platform.length)].map(n => this.platform[n][x])
        
        stop = col.findIndex((p) => p !== SPACE)
        if (stop === -1)
          stop = col.length

        newY = y + stop
        
        if (newY !==y) {
          this.platform[newY][x] = thisPiece
          this.platform[y][x] = SPACE
        }
        break
      case "W":
        row = this.platform[y].slice(0, x)
        stop = row.findLastIndex((p) => p !== SPACE)
        newX = stop + 1
        if (newX !== x) {
          this.platform[y][newX] = thisPiece
          this.platform[y][x] = SPACE
        }
        break
    }

  }

  weighPiece(x, y) {
    const thisPiece = this.platform[y][x]
    if (thisPiece !== ROUND)
      return 0

    const piecesBelow = [...range(y, this.platform.length)].map((i) => {
      return this.platform[i][x]
    })

    return piecesBelow.length
  }

  tiltPlatform(direction: Direction) {
    if (direction === "N" || direction === "W") {
      for (let y = 0; y < this.platform.length; y++) {
        for (let x = 0; x < this.platform[y].length; x++) {
          this.rollPiece(x, y, direction)
        }
      }
    } else {
      for (let y = this.platform.length - 1; y >= 0; y--) {
        for (let x = this.platform[y].length - 1; x >= 0; x--) {
          this.rollPiece(x, y, direction)
        }
      }
    }
  }

  getWeights() {
    const weights = []
    for (let y = 0; y < this.platform.length; y++) {
      for (let x = 0; x < this.platform[y].length; x++) {
       weights.push(this.weighPiece(x, y))
      }
    }
    return weights
  }

  @measure
  task1() {
    this.tiltPlatform("N")
    const weights = this.getWeights()
    this.logAnswer(1, sum(weights));
  }

  @measure
  task2() {
    this.platform = [...this.originalPlatform]
    const cycles = 1000000000
    for (let i = 0; i < cycles; i++) {
      const key = this.getKey()
      if (this.memo[key]) {
        const count = this.memo[key]
        if (i - count !== 0) {
          const [repeats, remainder] = divmod(cycles-i, i - count)
          if (remainder === 0) {
            break
          }
        }
      } else {
        this.memo[key] = i
      }
      this.tiltPlatform("N")
      this.tiltPlatform("W")
      this.tiltPlatform("S")
      this.tiltPlatform("E")
      }

    //console.log("MEMO", this.memo)
    
    const weights = this.getWeights()
    this.logAnswer(2, sum(weights));
  }
}
