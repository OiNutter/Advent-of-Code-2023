export class StoerWagner {
  private graph: number[][];
  private n: number;

  constructor(graph: number[][]) {
    this.graph = graph;
    this.n = graph.length;
  }

  private contract(u: number, v: number, mergeTo: number[]): void {
    // Merge vertex v into u
    for (let i = 0; i < this.n; i++) {
      this.graph[u][i] += this.graph[v][i];
      this.graph[i][u] = this.graph[u][i];
    }

    mergeTo[v] = u;
  }

  private minCutPhase(): { cutWeight: number, mergedVertices: number[] } {
    const nodes = Array.from({ length: this.n }, (_, i) => i);
    const mergeTo: number[] = Array(this.n).fill(-1);

    for (let phase = this.n - 1; phase > 0; phase--) {
      const minCutWeights: number[] = Array(phase).fill(Number.MAX_VALUE);

      let last = 0;
      for (let i = 0; i < phase; i++) {
        const current = nodes[i];
        let maxWeight = 0;
        for (let j = 0; j < phase; j++) {
          const other = nodes[j];
          if (mergeTo[other] === -1) {
            minCutWeights[j] += this.graph[current][other];
            if (minCutWeights[j] > maxWeight) {
              maxWeight = minCutWeights[j];
              last = j;
            }
          }
        }
      }

      if (phase === 1) {
        return { cutWeight: minCutWeights[0], mergedVertices: mergeTo };
      }

      this.contract(nodes[last], nodes[phase - 1], mergeTo);
      nodes.splice(last, 1);
    }

    // This should not be reached
    return { cutWeight: 0, mergedVertices: mergeTo };
  }

  public minCut(): { cutWeight: number, cut: number[] } {
    let minCutWeight = Number.MAX_VALUE;
    let minCut: number[] = [];

    for (let i = 0; i < this.n; i++) {
      const { cutWeight, mergedVertices } = this.minCutPhase();
      if (cutWeight < minCutWeight) {
        minCutWeight = cutWeight;
        minCut = mergedVertices;
      }
    }

    const cut: number[] = [];
    for (let i = 0; i < this.n; i++) {
      if (minCut[i] === -1) {
        cut.push(i);
      }
    }

    return { cutWeight: minCutWeight, cut };
  }
}