export class KargersAlgorithm {
  private graph: number[][];
  private vertices: number[];
  
  constructor(graph: number[][]) {
    this.graph = graph;
    this.vertices = Array.from({ length: graph.length }, (_, i) => i);
  }

  private contract(u: number, v: number): void {
    // Merge vertex v into u
    this.vertices = this.vertices.filter(vertex => vertex !== v);
    for (let i = 0; i < this.graph.length; i++) {
      this.graph[u][i] += this.graph[v][i];
      this.graph[i][u] = this.graph[u][i];
    }

    // Remove self-loops
    this.graph[u][u] = 0;
  }

  private getRandomEdge(): { u: number, v: number } {
    const u = this.vertices[Math.floor(Math.random() * this.vertices.length)];
    const neighbors = this.graph[u].map((weight, v) => (weight > 0 ? v : -1)).filter(v => v !== -1);
    const v = neighbors[Math.floor(Math.random() * neighbors.length)];
    return { u, v };
  }

  public findMinCut(): { cutWeight: number, cut: number[] } {
    while (this.vertices.length > 2) {
      const { u, v } = this.getRandomEdge();
      this.contract(u, v);
    }

    const [cutA, cutB] = this.vertices;
    const cutWeight = this.graph[cutA][cutB];

    return { cutWeight, cut: [cutA, cutB] };
  }
}