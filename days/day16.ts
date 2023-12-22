import { Coord, measure } from "../utils/utils";
import { Day } from "../utils/day";

type Direction = "N" | "S" | "E" | "W";
interface Beam {
  pos: Coord;
  direction: Direction;
}

const DIRECTION_TO_MODS = {
  N: { xMod: 0, yMod: -1 },
  S: { xMod: 0, yMod: 1 },
  E: { xMod: 1, yMod: 0 },
  W: { xMod: -1, yMod: 0 },
};

export class Solution extends Day {
  grid: Array<Array<string>>
  memo: Record<string, { beams: Beam[], tiles: string[]}> = {}

  @measure
  prepData(data: string[]): void {
    this.grid = data.map((line) => {
      return line.trim().split("");
    });
  }

  getMods(direction: Direction) {
    return DIRECTION_TO_MODS[direction];
  }

  onGrid(beam: Beam) {
    return (
      beam.pos.x >= 0 &&
      beam.pos.x < this.grid[0].length &&
      beam.pos.y >= 0 &&
      beam.pos.y < this.grid.length
    );
  }

  bounceBeams(beams: Beam[], useMemo = false) {
    const energised: Set<string> = new Set<string>();
    const visited: Set<string> = new Set<string>()

    while (beams.length > 0) {
      const beam = beams.shift();
      
      const start = `${beam.pos.x},${beam.pos.y},${beam.direction}`
      if (useMemo) {
       
        if (this.memo[start]) {
          beams.push(...this.memo[start].beams.filter((b) => !visited.has(`${b.pos.x},${b.pos.y},${b.direction}`)))
          this.memo[start].tiles.forEach((tile) => {
            visited.add(tile)
            energised.add(tile.replace(/,(N|S|E|W)$/,''))
          })
          //energised.push(...this.memo[start].tiles.map((e => )))
          continue
        }

        this.memo[start] = {
          beams: [],
          tiles: []
        }
      }

     

      while (this.onGrid(beam) && !visited.has(`${beam.pos.x},${beam.pos.y},${beam.direction}`)) {
        // Energise Square
        visited.add(`${beam.pos.x},${beam.pos.y},${beam.direction}`);
        energised.add(`${beam.pos.x},${beam.pos.y}`)
        if (useMemo)
          this.memo[start].tiles.push(`${beam.pos.x},${beam.pos.y},${beam.direction}`)

        // Check square
        const square = this.grid[beam.pos.y][beam.pos.x];
        if (square === "/") {
          if (beam.direction === "E") beam.direction = "N";
          else if (beam.direction === "S") beam.direction = "W";
          else if (beam.direction === "N") beam.direction = "E";
          else if (beam.direction === "W") beam.direction = "S";
        } else if (square === "\\") {
          if (beam.direction === "E") beam.direction = "S";
          else if (beam.direction === "S") beam.direction = "E";
          else if (beam.direction === "N") beam.direction = "W";
          else if (beam.direction === "W") beam.direction = "N";
        } else if (square === "-") {
          if (beam.direction === "N" || beam.direction === "S") {
            beam.direction = "E";
            const { xMod, yMod } = this.getMods("W");
            const newBeam: Beam = {
              pos: {
                x: beam.pos.x + xMod,
                y: beam.pos.y + yMod
              },
              direction: "W",
            }
            beams.push(newBeam);
            if (useMemo)
              this.memo[start].beams.push(structuredClone(newBeam))
          }
        } else if (square === "|") {
          if (beam.direction === "W" || beam.direction === "E") {
            beam.direction = "N";
            const { xMod, yMod } = this.getMods("S");
            const newBeam: Beam = {
              pos: {
                x: beam.pos.x + xMod,
                y: beam.pos.y + yMod
              },
              direction: "S",
            }
            beams.push(newBeam);
            if (useMemo)
              this.memo[start].beams.push(structuredClone(newBeam))
          }
        }

        const { xMod, yMod } = this.getMods(beam.direction);

        beam.pos.x += xMod;
        beam.pos.y += yMod;
      }
      
    }

    return energised.size
  }

  @measure
  task1() {
    const beams: Beam[] = [{ pos: { x: 0, y: 0 }, direction: "E" }];
    const energised = this.bounceBeams(beams, true)
    
    this.logAnswer(1, energised);
  }

  @measure
  task2() {
    const starts: Beam[] = []
    for (let y = 0; y < this.grid.length; y++) {
      starts.push({
        pos: {
          x: 0,
          y
        },
        direction: "E"
      }, {
        pos: {
          x: this.grid[0].length-1,
          y
        },
        direction: "W"
      })

    }

    for (let x = 0; x < this.grid[0].length;x++) {
      starts.push({
        pos: {
          x,
          y:0
        },
        direction: "S"
      }, {
        pos: {
          x,
          y: this.grid.length-1
        },
        direction: "N"
      })

    }

    const possibles = starts.map((start) => {
      return this.bounceBeams([start], true)
    })

    this.logAnswer(2, Math.max(...possibles));
  }
}
