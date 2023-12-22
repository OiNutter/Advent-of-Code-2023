import { Coord, divmod, measure, quadraticInterpolation, range } from "../utils/utils";
import { Day } from "../utils/day";

const ROCK = "#"

export class Solution extends Day {
  
  map: Array<Array<string>> = []
  start: Coord
  memo: Record<string, [number, Set<string>]> = {}
  xSize: number = 1
  ySize: number = 1

  @measure
  prepData(data: string[]): void {
    this.map = data.map(line => line.trim().split(""))
    this.xSize = this.map[0].length
    this.ySize = this.map.length
    for (let y = 0; y < this.ySize; y++) {
      for (let x= 0; x < this.xSize; x++) {
        if (this.map[y][x] === "S") {
          this.start = {x,y}
          return
        }
      }
    }

    
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

  getKey(coord: Coord) {
    return `${coord.x}|${coord.y}`
  }

  @measure
  pathfind(start, maxSteps) {    
    let reached = new Set<string>([this.getKey(start)])

    for (let i = 0; i < maxSteps; i++) {
      const newReached = Array.from(reached).flatMap((r) => {
          
          const [x,y] = r.split("|")
          return this.getNeighbours({x: parseInt(x),y: parseInt(y)})
        })
        reached = new Set(newReached.map(r => this.getKey(r)))
              
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
