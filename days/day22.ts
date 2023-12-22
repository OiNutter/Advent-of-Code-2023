import { Coord, compareNumbers, measure, sum } from "../utils/utils";
import { Day } from "../utils/day";

type Limit = {min: number, max: number}

interface BoundingBox {
  x: Limit
  y: Limit
  z: Limit
}

type Coord3D = Coord & {z: number }
class Brick {
  index: number
  start: Coord3D
  end: Coord3D
  supporting: Brick[] = []
  supportedBy: Brick[] = []
  boundingBox: BoundingBox
  lowestZ: number
  
  constructor(index: number, start: Coord3D, end: Coord3D) {
    this.index = index
    this.start = start
    this.end = end
    this.boundingBox = this.getBoundingBox()
    this.lowestZ = this.getLowestZ()
  }

  getLowestZ() {
    return Math.min(this.start.z, this.end.z)
  }

  getBoundingBox() {
    return {
      x: {
        min: Math.min(this.start.x, this.end.x),
        max: Math.max(this.start.x, this.end.x)
      },
      y: {
        min: Math.min(this.start.y, this.end.y),
        max: Math.max(this.start.y, this.end.y)
      },
      z: {
        min: Math.min(this.start.z, this.end.z),
        max: Math.max(this.start.z, this.end.z)
      }
    }
  }

  getCollisions(bricks: Brick[]) {
    return bricks.filter(brick => {
      const box1 = this.boundingBox
      const box2 = brick.boundingBox

      return (box1.x.max >= box2.x.min && box1.x.min <= box2.x.max) &&
            (box1.y.max >= box2.y.min && box1.y.min <= box2.y.max) &&
            (box1.z.max >= box2.z.min && box1.z.min <= box2.z.max)
    })
  }

  drop() {
    this.start.z--
    this.end.z--
    this.boundingBox = this.getBoundingBox()
    this.lowestZ = this.getLowestZ()
  }
  
  settle() {
    this.start.z++
    this.end.z++
    this.boundingBox = this.getBoundingBox()
    this.lowestZ = this.getLowestZ()
  }

  getCollapses(alreadyCollapsed: Set<number>) {
    let collapses = 0
    alreadyCollapsed.add(this.index)
    this.supporting.forEach(b => {
      const supportedBy = new Set<number>(b.supportedBy.map(f => f.index))
      const diff = supportedBy.difference(alreadyCollapsed)
      if (diff.size === 0)
        collapses+= 1 + b.getCollapses(alreadyCollapsed)
    })
    return collapses
  }
}

export class Solution extends Day {
  bricks: Brick[] = []

  @measure
  prepData(data: string[]): void {
    const bricks = data.map((brick, i) => {
      const [start, end] = brick.split("~").map((end) => {
        const [x,y,z] = end.split(",").map((n) => parseInt(n))
        return {x,y,z}
      })
      return new Brick(i, start, end)
    })

    this.bricks = this.dropBricks(bricks.sort((a,b) => compareNumbers(a.lowestZ, b.lowestZ)))
  }

  getDisintegrations(bricks: Brick[]) {
    const disintegrations = []
    bricks.forEach((brick) => {
      if (brick.supporting.length > 0) {
        let unsupported = false
        for (const b of brick.supporting) {
          if (b.supportedBy.length === 1) {
            unsupported = true
            break
          }
        }
        if (!unsupported)
          disintegrations.push(brick)
      } else {
        disintegrations.push(brick)
      }
    })
    return disintegrations
  }

  @measure
  dropBricks(bricks: Brick[]) {
    let floor = 1
    const fallen: Brick[] = []

    bricks.forEach((brick) => {
      while (brick.lowestZ > floor) {
        brick.drop()
        const collisions = brick.getCollisions(fallen)
        if (collisions.length > 0) {
          brick.settle()
          collisions.forEach((collision) => {
            collision.supporting.push(brick)
            brick.supportedBy.push(collision)
          })
          break
        }
      }
      fallen.push(brick)
    })

    return fallen
  }

  @measure
  task1() {
    
    const disintegrations = this.getDisintegrations(this.bricks)   
    this.logAnswer(1, disintegrations.length);
  }

  @measure
  task2() {
    let collapses = this.bricks.map((brick) => {
      if (brick.supporting.length > 0) {
        const totalCollapse = brick.getCollapses(new Set<number>())
        return totalCollapse        
      }
      return 0
    })

    this.logAnswer(2, sum(collapses));
  }
}
