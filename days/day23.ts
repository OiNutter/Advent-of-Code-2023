import { measure } from "../utils/utils";
import { Day } from "../utils/day";
import FastPriorityQueue from "fastpriorityqueue";

type Delta = [number, number]

class Coord {
  x: number = 0
  y: number = 0

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  toKey() {
    return `${this.x}:${this.y}`
  }
}

type QueueItem = [Coord, number]

const DELTAS: Record<string, Delta[]> = {
  ">": [[1,0]],
  "<": [[-1,0]],
  "^": [[0,-1]],
  "v": [[0,1]],
  ".": [[0,1],[0,-1],[1,0],[-1,0]]
}

export class Solution extends Day {
  
  map: Array<Array<string>> = []
  coords: Record<string, Coord> = {}
  start: Coord
  end: Coord


  @measure
  prepData(data: string[]): void {
    this.map = data.map((line => line.trim().split("")))

    this.start = new Coord(this.map[0].indexOf("."),0)
    this.end = new Coord(this.map[this.map.length-1].indexOf("."), this.map.length-1)
  }

  getNeighbours(current: Coord, canClimb = false) {
    const char = canClimb ? "." : this.map[current.y][current.x]
    const deltas = DELTAS[char]

    return deltas.map(([dx, dy]) => {
      const nx = current.x + dx,
            ny = current.y + dy

      if (nx < 0 || nx >= this.map[0].length)
        return null

      if (ny < 0 || ny >= this.map.length)
        return null

      return (this.map[ny][nx] !== "#") ? new Coord(nx, ny) : null 
    }).filter(n => n !== null)

  }

  @measure
  pathfind (start:Coord, end: Coord, getNeighbours: (node: Coord) => QueueItem[]) {
    const visited: Record<string, boolean> = {},
          endKey = end.toKey()
    let longestPath:number = 0

    const dfs = (node: Coord, dist: number) => {
      const key= node.toKey()
      visited[key] = true

      if (key === endKey) {
        if (!longestPath || dist > longestPath) {
          longestPath = dist
        }
      }

      for (const [n, alt] of getNeighbours(node)) {
        const nKey = n.toKey()
        if (!visited[nKey]) {
          dfs(n, dist + alt)
        }
      }

      visited[key] = false
    }
    
    dfs(start, 0)

    return longestPath
  }

  @measure
  getIntersections() {
    const intersections= new Set<string>(),
          startKey = this.start.toKey(),
          endKey = this.end.toKey()

    this.map.forEach((row, y) => {
      row.forEach((char, x) => {
        if (char !== "#") {
          const point = new Coord(x,y)
          const key = point.toKey()
          this.coords[key] = point
          const neighbours = this.getNeighbours(point, true)
          if (neighbours.length > 2)
            intersections.add(key)
        }
      })
    })

    intersections.add(startKey)
    intersections.add(endKey)

    return intersections
  }

  @measure
  getDistances() {
    const v = this.getIntersections(),
          globalDistances: Record<string, QueueItem[]> = {}

    

    v.forEach((key) => {
      let q:Coord[] = []
      const seen = new Set<string>()
      let dist = 0
      q.push(this.coords[key])
      seen.add(key)

      while (q.length > 0) {
        dist += 1
        const nq = []
        q.forEach((c) => {
          for (const n of this.getNeighbours(c, true)) {
            const nKey = n.toKey()
            if (seen.has(nKey))
              continue

            if (v.has(nKey)) {
              if (!globalDistances[key])
                globalDistances[key] = []

              globalDistances[key].push([n, dist])
              
            } else {
              nq.push(n)
            }
            seen.add(nKey)
          }
        })
        q = nq
      }
    })

    return globalDistances
  }

  @measure
  task1() {
    const result = this.pathfind(this.start, this.end, (node: Coord) => this.getNeighbours(node).map(n => [n,1]))
    this.logAnswer(1, result);
  }

  @measure
  task2() {
    //compress graph
    const globalDistances = this.getDistances()

    const result = this.pathfind(this.start, this.end, (node: Coord) => {
      const nKey = node.toKey()
      return globalDistances[nKey]
    })
    this.logAnswer(2, result);
  }
}
