import { Coord, cantorPair, divmod, measure, quadraticInterpolation, range, reverseCantorPair } from "../utils/utils";
import { Day } from "../utils/day";
import { complex, add } from "mathjs"
import type { Complex } from "mathjs"

const ROCK = "#"

const deltas = [
  complex(0,1),  //South
  complex(0,-1), //North
  complex(1,0), // East
  complex(-1,0), // West
]

export class Solution extends Day {
  
  map: Record<string, string>
  start: Complex
  memo: Record<string, [number, Set<string>]> = {}
  xSize: number = 1
  ySize: number = 1

  @measure
  prepData(data: string[]): void {
    this.map = Object.fromEntries(data.flatMap((line, y) => {
      return line.trim().split("").map((char, x) => {
        if (char === "S")
          this.start = this.getKey2({x,y})

        return [this.getKey2({x,y}).toString(), char]
      }
    )}))
    this.xSize = data[0].trim().length
    this.ySize = data.length
    /* for (let y = 0; y < this.ySize; y++) {
      for (let x= 0; x < this.xSize; x++) {
        if (this.map[y][x] === "S") {
          this.start = {x,y}
          return
        }
      }
    } */

    
  }

  getNeighbours(current: Coord) {
    let dx = [0,-1,0,1],
        dy = [-1,0,1,0]
        
    const neighbours = []

    for (let i = 0; i < 4; i++) {
      let x = current.x + dx[i],
          y = current.y + dy[i]

      let yIndex = y % this.ySize
      if (yIndex < 0)
        yIndex += this.ySize

      let xIndex = x % this.xSize
      if (xIndex < 0)
        xIndex += this.xSize

      if (this.map[yIndex][xIndex] !== ROCK)
        neighbours.push({x, y})
    }
    
    return neighbours

  }

  getNeighbours2(current: Complex) {
    let dx = [0,-1,0,1],
        dy = [-1,0,1,0]
        
    const neighbours = []

    for (let i = 0; i < 4; i++) {
      let newCoord = add(current, deltas[i])

      if (this.map[newCoord.toString()] !== ROCK)
        neighbours.push(newCoord)
    }
    
    return neighbours

  }

  getKey(coord: Coord) {
    return [coord.x,coord.y].join("|")
  }

  getKey2(coord: Coord) {
    return complex(coord.x, coord.y)
  }

  @measure
  pathfind(start, maxSteps) {    
    let reached = new Set<string>([start.toString()])

    for (let i = 0; i < maxSteps; i++) {
      const newReached = Array.from(reached).flatMap((r) => {
          
          return this.getNeighbours2(complex(r))
        })
        reached = new Set(newReached.map(r => this.getKey2(r).toString()))
              
    }

    return reached
  }

  @measure
  task1() {
    const paths = this.pathfind(this.start, (this.useSample) ? 6 : 64)
    this.logAnswer(1, paths.size);
  }

  @measure
  task2() {
    const rep = this.ySize
    const goal = this.useSample ? 50 : 26501365
    const [q,r] = divmod(goal, rep)
    const found = [...range(0,3)].map((i) => {
      return this.pathfind(this.start, r + (rep*i)).size
    })

    const result = quadraticInterpolation(found.map((y,x) => ({x,y})),q)
   
    this.logAnswer(2, result);
  }
}
