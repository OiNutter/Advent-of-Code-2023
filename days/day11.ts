import { Coord, getManhattanDistance, measure, sum } from "../utils/utils";
import { Day } from "../utils/day";

const GALAXY = "#";

export class Solution extends Day {
  map: Array<string[]> = [];
  galaxies: Coord[] = [];
  emptyColumns: number[] = [];
  emptyRows: number[] = [];

  @measure
  prepData(data: string[]): void {
    this.map = data.map((line) => {
      return line.trim().split("");
    });
    this.findGalaxies();
    this.findEmptyColumns();
    this.findEmptyRows();
  }

  drawMap() {
    this.map.forEach((row, y) => {
      console.log(row.join(""));
    });
  }

  findEmptyRows() {
    // Expand empty rows
    for (let y = 0; y < this.map.length; y++) {
      if (!this.map[y].includes(GALAXY)) this.emptyRows.push(y);
    }
  }

  findEmptyColumns() {
    for (let x = 0; x < this.map[0].length; x++) {
      let hasGalaxy = false;
      for (let y = 0; y < this.map.length; y++) {
        if (this.map[y][x] === GALAXY) hasGalaxy = true;
      }

      if (!hasGalaxy) this.emptyColumns.push(x);
    }
  }

  findGalaxies() {
    // find galaxies
    this.galaxies = [];
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        if (this.map[y][x] === GALAXY) this.galaxies.push({ x, y });
      }
    }
  }

  getDistances(expansion: number) {
    expansion--;
    const distances: Record<string, number> = {};
    this.galaxies.forEach((start: Coord, i) => {
      this.galaxies.forEach((target: Coord, j) => {
        const key = `${i}|${j}`;
        if (i === j || distances[key] || distances[`${j}|${i}`]) return;

        const emptyRows = this.emptyRows.filter((y) => {
          return (
            y > Math.min(start.y, target.y) && y < Math.max(start.y, target.y)
          );
        }).length;
        const emptyColumns = this.emptyColumns.filter((x) => {
          return (
            x > Math.min(start.x, target.x) && x < Math.max(start.x, target.x)
          );
        }).length;

        distances[key] =
          getManhattanDistance(start, target) +
          expansion * emptyRows +
          expansion * emptyColumns;
      });
    });
    return Object.values(distances);
  }

  @measure
  task1() {
    const distances = this.getDistances(2);

    this.logAnswer(1, sum(distances));
  }

  @measure
  task2() {
    const distances = this.getDistances(1000000);

    this.logAnswer(2, sum(distances));
  }
}
