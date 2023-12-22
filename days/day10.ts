import {Coord, measure, shoelaceFormula} from "../utils/utils"
import { Day } from "../utils/day"

type Direction = "N" | "S" | "E" | "W"
interface Pipe {
  [key: string] : Direction
}

const PIPES: Record<string, Pipe> = {
  "|": { "S" : "S", "N" : "N"},
  "-": { "W" : "W", "E" : "E"},
  "L": { "S": "E", "W" : "N"},
  "J": { "S" : "W", "E" : "N"},
  "7": { "E" : "S", "N" : "W"},
  "F": { "N" : "E", "W" : "S"}
}

export class Solution extends Day {
  map: Array<string[]> = []
  start: Coord
  
  @measure
  prepData(data: string[]): void {
    this.map = data.map((line) => {
      return line.trim().split("")
    })

    this.start = this.findStart()    
  }

  drawMap() {
    this.map.forEach((row, y) => {
      console.log(row.join(""))
    })
  }

  getDirection(coord: Coord, direction: Direction) : Direction | null {
    
    const val = this.map[coord.y][coord.x]

    if (PIPES[val] === undefined)
      return null

    return PIPES[val][direction]
  }

  getNeighbour(current: Coord, direction: Direction, steps: number) : [Coord, Direction, number] | null {
    const minX = Math.max(current.x - 1, 0),
      maxX = Math.min(current.x + 1, (this.map[0] ?? []).length - 1),
      minY = Math.max(current.y - 1 , 0),
      maxY = Math.min(current.y + 1, this.map.length - 1)

    let neighbour: Coord | undefined
    if (direction === "N") {
      if (minY === current.y)
        return null

      neighbour = {x: current.x, y: minY}
    } else if (direction === "S") {
      if (maxY === current.y)
        return null

      neighbour = {x: current.x, y: maxY}
    } else if (direction === "E") {
      if (maxX === current.x)
        return null

      neighbour = {x: maxX, y: current.y}
    } else if (direction === "W") {
      if (minX === current.x)
        return null

      neighbour = {x: minX, y: current.y}
    }

    const newDirection = this.getDirection(neighbour, direction)
    return newDirection ? [neighbour, newDirection, steps + 1] : null
  }

  findStart() {
    for (let y = 0; y < this.map.length; y++) {
      const row = this.map[y]
      for (let x = 0; x < row.length; x++) {
        if (row[x] === "S") {
          return {y,x}
        }
      }
    }
  }
  
  @measure
  task1() {    
    
    const points = [
      this.getNeighbour(this.start, "N", 0),
      this.getNeighbour(this.start, "E", 0),
      this.getNeighbour(this.start, "S", 0),
      this.getNeighbour(this.start, "W", 0),
    ].filter(n => n !== null)
    
    const distances: Record<string, number> = {}
    while (points.length > 0) {
      const [point, direction, steps] = points.shift()
      const key = `${point.y},${point.x}`
      if (distances[key] === undefined) {
        distances[key] = steps
        const neighbour = this.getNeighbour(point, direction, steps)
        if (neighbour)
          points.push(neighbour)
      }
    }
    this.logAnswer(1, Math.max(...Object.values(distances)))
  }

  @measure
  task2() {

    const points = [
      this.getNeighbour(this.start, "N", 0) ??
      this.getNeighbour(this.start, "E", 0) ??
      this.getNeighbour(this.start, "S", 0) ??
      this.getNeighbour(this.start, "W", 0)
    ]

    const coords:Coord[]  = [this.start]
    while (points.length > 0) {
      const [point, direction, steps] = points.shift()
      coords.push(point)
      const neighbour = this.getNeighbour(point, direction, steps)
      if (neighbour)
        points.push(neighbour)
    }
    
    this.logAnswer(2, shoelaceFormula(coords) - (coords.length/2) + 1)
  }

}