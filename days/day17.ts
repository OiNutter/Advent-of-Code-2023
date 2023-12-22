import { measure } from "../utils/utils"
import { Day } from "../utils/day"
import Heap from "heap-js"

type State = [number, number, number, [number, number]]

export class Solution extends Day {
  map: Array<Array<number>>
  @measure
  prepData(data: string[]): void {
    this.map = data.map((line) => {
      return line
        .trim()
        .split("")
        .map((c) => parseInt(c))
    })
  }

  getNeighbours(node: State, ultra = false) {
    const [x, y, v, dir] = node
    const [dx, dy] = dir
    const left = [-dy, dx]
    const right = [dy, -dx]
    const opts = []
    if (v < ((ultra) ? 10 : 3) && x+dx >= 0 && x+dx < this.map[0].length && y+dy >= 0 && y+dy < this.map.length) {
      opts.push([[x+dx, y+dy, v+1, dir], this.map[y+dy][x+dx]])
    }

    for (const [dx, dy] of [left, right]) {
      if (x+dx >= 0 && x+dx < this.map[0].length && y+dy >= 0 && y+dy < this.map.length && (!ultra || v >= 4)) {
        opts.push([[x+dx, y+dy, 1, [dx, dy]], this.map[y+dy][x+dx]])
      }
    }

    return opts
  }

  pathfind(ultra = false) {
    const visited = new Set<string>()
    const start1: State = [0,0,0,[1,0]]
    const start2: State = [0,0,0,[0,1]]
    const dist = {
      [JSON.stringify(start1)]: 0,
      [JSON.stringify(start2)]: 0
    }
    const Q = new Heap<[number, State]>((a, b) => {
      if (a[0] < b[0])
        return -1
      if (a[0] > b[0])
        return 1

      return 0
    })
    Q.init([
      [0, start1],
      [0, start2]
    ])
    let target:State = [this.map[0].length -1, this.map.length -1, 0, [0,0]]
    while (Q.length > 0) {
      const [_, u]: [number, State] = Q.pop()
      const uString = JSON.stringify(u)
      if (visited.has(uString))
        continue

      visited.add(uString)

      if (u[0] === target[0] && u[1] === target[1] && (!ultra || u[2] >= 4)) {
        target = u
        break
      }

      for (const [v, cost] of this.getNeighbours(u, ultra)) {
        const vString = JSON.stringify(v)
        if (visited.has(vString))
          continue

        const alt = dist[uString] + cost
        if (dist[vString] === undefined || alt < dist[vString]) {
          dist[vString] = alt
          Q.push([alt, v])
        }
      }
    }

    return dist[JSON.stringify(target)]
  }

  @measure
  task1() {
    const cost = this.pathfind(false)
    this.logAnswer(1, cost)
  }

  @measure
  task2() {
    const cost = this.pathfind(true)
    this.logAnswer(2, cost)
  }
}
