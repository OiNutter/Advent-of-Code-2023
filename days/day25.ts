import { measure, shuffle } from "../utils/utils"
import { Day } from "../utils/day"

type Edge = [string, string]
type Graph = Map<string, string[]>

class KargerMinCut {
  private graph: Graph

  constructor(graph: Graph) {
    this.graph = new Map(graph) // Make a copy of the graph
  }

  findMinCut(): number {
    let minCutSize = Number.MAX_SAFE_INTEGER

    // Run the algorithm multiple times to improve the chance of finding the minimum cut
    const numIterations = this.graph.size * this.graph.size // Adjust as needed
    for (let i = 0; i < numIterations; i++) {
      const currentCutSize = this.runKarger()
      if (currentCutSize < minCutSize) {
        minCutSize = currentCutSize
      }
    }

    return minCutSize
  }

  private runKarger(): number {
    while (this.graph.size > 2) {
      const [randomNodeA, connections] = this.getRandomNode()
      const randomNodeB =
        connections[Math.floor(Math.random() * connections.length)]

      this.contract(randomNodeA, randomNodeB)
    }

    // The remaining graph has only two nodes, and the cut is the number of edges between them
    const [nodeA, connectionsA] = this.graph.entries().next().value
    const [nodeB, connectionsB] = this.graph.entries().next().value

    return connectionsA.length // or connectionsB.length, as they are the same in an undirected graph
  }

  private getRandomNode(): [string, string[]] {
    const randomIndex = Math.floor(Math.random() * this.graph.size)
    const randomNode = Array.from(this.graph.keys())[randomIndex]
    return [randomNode, this.graph.get(randomNode) || []]
  }

  private contract(nodeA: string, nodeB: string): void {
    // Merge nodeB into nodeA
    const connectionsA = this.graph.get(nodeA) || []
    const connectionsB = this.graph.get(nodeB) || []

    const mergedConnections = [
      ...connectionsA,
      ...connectionsB.filter((connection) => connection !== nodeA),
    ]

    // Update connections in the graph
    this.graph.set(nodeA, mergedConnections)

    // Remove nodeB from the graph
    this.graph.delete(nodeB)

    // Update connections in other nodes
    for (const [node, connections] of this.graph) {
      this.graph.set(
        node,
        connections.map((connection) =>
          connection === nodeB ? nodeA : connection
        )
      )
    }
  }
}

type GraphMap = Map<string, string[]>

export class Solution extends Day {
  components: Record<string, string[]> = {}

  @measure
  prepData(data: string[]): void {
    data.forEach((line) => {
      const [node, neighbours] = line.trim().split(":")
      const edges = neighbours.trim().split(" ")
      if (this.components[node] === undefined) {
        this.components[node] = Array.from(new Set(edges))
      } else {
        this.components[node] = Array.from(
          new Set(this.components[node].concat(edges))
        )
      }

      edges.forEach((edge) => {
        if (this.components[edge] === undefined) this.components[edge] = []

        this.components[edge] = Array.from(
          new Set([...this.components[edge], node])
        )
      })
    })
  }

  walkNodes(start: string, encountered: Record<string, number>) {
    const visited = new Set<string>()
    const q = [start]

    while (q.length > 0) {
      const from = q.shift()
      for (const to of this.components[from]) {
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

    for (const from in this.components) {
      this.walkNodes(from, encountered)
    }

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
    let n: string[] = []
    this.components[from].splice(this.components[from].indexOf(to), 1)
    this.components[to].splice(this.components[to].indexOf(from), 1)
  }

  countNodes(start: string) {
    const visited = new Set<string>()
    const q = [start]

    while (q.length > 0) {
      const from = q.shift()
      for (const to of this.components[from]) {
        if (visited.has(to)) continue

        q.push(to)
        visited.add(to)
      }
    }

    return visited.size
  }

  @measure
  task1() {
    const removed = []
    for (let n = 0; n < 3; n++) {
      const edgeCount = this.countEdges()
      const edge = this.findAndRemoveMax(edgeCount)
      removed.push(edge)
      this.removeEdge(edge)
    }
    const [from, to] = removed[0].split("|")
    const countA = this.countNodes(from)
    const countB = this.countNodes(to)
    this.logAnswer(1, countA * countB)
  }

  @measure
  task2() {
    this.logAnswer(2, null)
  }
}
