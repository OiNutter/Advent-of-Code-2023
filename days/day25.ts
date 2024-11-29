import { createAdjacencyMatrix, measure } from "../utils/utils"
import { Day } from "../utils/day"
import {mincut} from '@graph-algorithm/minimum-cut' ;
import { StoerWagner } from "../utils/stoerWagner";
import { KargersAlgorithm } from "../utils/karger";

export class Solution extends Day {
  components: Map<string, string[]> = new Map()

  @measure
  prepData(data: string[]): void {
    data.forEach((line) => {
      const [node, neighbours] = line.trim().split(":")
      const edges = neighbours.trim().split(" ")
      if (!this.components.has(node)) {
        this.components.set(node, Array.from(new Set(edges)))
      } else {
        this.components.set(node, Array.from(
          new Set(this.components.get(node).concat(edges))
        ))
      }

      edges.forEach((edge) => {
        if (!this.components.has(edge)) this.components.set(edge,[])

        this.components.set(edge, Array.from(
          new Set([...this.components.get(edge), node])
        ))
      })
    })
  }

  walkNodes(start: string, encountered: Record<string, number>) {
    const visited = new Set<string>()
    const q = [start]

    while (q.length > 0) {
      const from = q.shift()
      for (const to of this.components.get(from)) {
        if (visited.has(to)) continue

        q.push(to)
        visited.add(to)

        const edge = from < to ? `${from}|${to}` : `${to}|${from}`
        if (encountered[edge] === undefined)
          encountered[edge] = 0
        encountered[edge]++
      }
    }
  }

  countEdges() {
    const encountered: Record<string, number> = {}

    this.components.forEach((_, from) => {
      this.walkNodes(from, encountered)
    })

    

    return encountered
  }

  findAndRemoveMax(edges: Record<string, number>) {
    let max = 0
    let maxEdge: string | undefined

    Object.entries(edges).forEach(([k, v]) => {
      if (v > max) {
        max = v
        maxEdge = k
      }
    })
    delete edges[maxEdge]
    return maxEdge
  }

  removeEdge(edge: string) {
    const [from, to] = edge.split("|")
    this.components.get(from).splice(this.components.get(from).indexOf(to), 1)
    this.components.get(to).splice(this.components.get(to).indexOf(from), 1)
  }

  countNodes(start: string) {
    const visited = new Set<string>()
    const q = [start]

    while (q.length > 0) {
      const from = q.shift()
      for (const to of this.components.get(from)) {
        if (visited.has(to)) continue

        q.push(to)
        visited.add(to)
      }
    }

    return visited.size
  }

  @measure
  task1() {
    /* const removed = []
    for (let n = 0; n < 3; n++) {
      const edgeCount = this.countEdges()
      const edge = this.findAndRemoveMax(edgeCount)
      removed.push(edge)
      this.removeEdge(edge)
    }
    const [from, to] = removed[0].split("|")
    const countA = this.countNodes(from)
    const countB = this.countNodes(to)
    this.logAnswer(1, countA * countB) */
  }

  @measure
  task2() {
    const adj = createAdjacencyMatrix(this.components)
    //const sw = new StoerWagner(adj)
    //const {cutWeight, cut} = sw.minCut()
    const karger = new KargersAlgorithm(adj)
    const {cutWeight, cut} = karger.findMinCut()
    console.log(cut)
    this.logAnswer(2, cutWeight)
  }
}
