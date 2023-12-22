export class GridNode {
  x: number;
  y: number;
  g: number = 0; // Cost from start to current node
  h: number = 0; // Heuristic (estimated cost from current node to goal)
  f: number = 0; // Total cost (g + h)
  parent: GridNode | null = null;
  weight: number = 0
  closed: boolean = false
  inOpenSet: boolean = false

  constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
  }
}

interface AStarOpts {
  heuristic?: (a:GridNode, b:GridNode) => number,
  successors?: (current: GridNode, grid: Array<Array<number>>) => GridNode[]
  compareNode?: (node: GridNode, neighbor:GridNode) => boolean
}

export function astar(grid: number[][], start: [number, number], end: [number, number], options: AStarOpts = {}): GridNode[] | null {
  const openSet: GridNode[] = [];
  //const closedSet: GridNode[] = [];

  const startNode = new GridNode(start[0], start[1]);
  const endNode = new GridNode(end[0], end[1]);

  openSet.push(startNode)
  startNode.inOpenSet = true

  while (openSet.length > 0) {
      // Find the node with the lowest total cost (f) in the open set
      //assumption lowest index is the first one to begin with
      let lowestIndex = 0;
      for (let i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowestIndex].f) {
          lowestIndex = i;
        }
      }
      const currentNode = openSet[lowestIndex];

      // Move the current node from openSet to closedSet
      openSet.splice(lowestIndex, 1);
      currentNode.inOpenSet = false
      //closedSet.push(currentNode);

      // If the current node is the goal, reconstruct and return the path
      if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
          return reconstructPath(currentNode);
      }

      currentNode.closed = true

      // Generate neighbors for the current node
      const neighbors = (options.successors ?? getNeighbors)(currentNode, grid);
      

      for (const neighbor of neighbors) {
          // Skip neighbors in the closed set or blocked cells
          if (neighbor.closed)
            continue

          // Calculate the tentative cost from start to neighbor
          const tentativeG = currentNode.g + neighbor.weight

          // If neighbor is not in the open set or the new path is shorter
          const openSetNeighbor = openSet.find((node) => (options.compareNode ?? compareNode)(node, neighbor));

          if (!openSetNeighbor) {
            openSet.push(neighbor)

          } else if (tentativeG >= openSetNeighbor.g)
            continue

          neighbor.parent = currentNode;
          neighbor.g = tentativeG;
          neighbor.h = (options.heuristic ?? heuristic)(neighbor, endNode);
          neighbor.f = neighbor.g + neighbor.h;          
      }
  }

  // If open set is empty and goal is not reached, no path exists
  return null;
}

function reconstructPath(node: GridNode): GridNode[] {
  const path: GridNode[] = [];
  let current = node;
  while (current !== null) {
      path.unshift(current);
      current = current.parent!;
  }
  return path;
}

function getNeighbors(node: GridNode, grid: number[][]): GridNode[] {
  const neighbors: GridNode[] = [];
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Assuming 4-connected grid

  for (const dir of directions) {
      const newX = node.x + dir[0];
      const newY = node.y + dir[1];

      if (newX >= 0 && newX < grid[0].length && newY >= 0 && newY < grid.length) {
          neighbors.push(new GridNode(newX, newY));
      }
  }

  return neighbors;
}

function heuristic(node: GridNode, goal: GridNode): number {
  // Simple Manhattan distance as the heuristic
  return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
}

function compareNode(node, neighbor) {
  return node.x === neighbor.x && node.y === neighbor.y
}