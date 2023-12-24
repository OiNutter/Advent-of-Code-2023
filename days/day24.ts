import { Area, Coord, measure, willPathsIntersect } from "../utils/utils";
import { Day } from "../utils/day";
import {init} from 'z3-solver'

type Coord3d = Coord & {z:number}
type Velocity3d = { dx: number, dy: number, dz: number }

interface Hailstone {
  position: Coord3d
  velocity: Velocity3d
}
export class Solution extends Day {
  
  hailstones: Hailstone[] = []

  @measure
  prepData(data: string[]): void {
    this.hailstones = data.map((line) => {
      const [pos, vel] = line.trim().split(" @ ")
      const [x,y,z] = pos.split(", ").map((n) => parseInt(n.trim()))
      const [dx,dy,dz] = vel.split(", ",).map((n) => parseInt(n.trim()))

      return {
        position: {
          x,y,z
        }, 
        velocity: {
          dx, dy, dz
        }
      }
    })
  }

  checkCollisionsInArea(area: Area) {
    const checked = new Set<string>()
    let intersected = 0
    for (let i = 0; i < this.hailstones.length; i++) {
      for (let j = 0; j < this.hailstones.length; j++) {
        if (i===j)
          continue

        if (checked.has(`${i}|${j}`) || checked.has(`${j}|${i}`))
          continue

        checked.add(`${i}|${j}`)
        const a = this.hailstones[i]
        const b = this.hailstones[j]

        if (willPathsIntersect({start: a.position, velocity: a.velocity}, {start: b.position, velocity: b.velocity}, area))
          intersected++
        
      }
    }
    return intersected
  }

  @measure
  task1() {
    const area = (this.useSample) ? {
      minX: 7,
      minY: 7,
      maxX: 27,
      maxY: 27
    } : {
      minX: 200000000000000,
      minY: 200000000000000,
      maxX: 400000000000000,
      maxY: 400000000000000
    }
    const result = this.checkCollisionsInArea(area)
    this.logAnswer(1, result);
  }

  @measure
  async task2() {
    const {Context} = await init()
    const { Solver, Eq, GE, Real } = Context('main')
    const solver = new Solver()

    const bv = (s: string) => Real.const(s)

    const x = bv('x')
    const y = bv('y')
    const z = bv('z')

    const dx = bv('dx')
    const dy = bv('dy')
    const dz = bv('dz')
        
    this.hailstones.slice(0,3).forEach((hailstone, i) => {
      const {position, velocity} = hailstone
      const tk = bv(`tk${i}`)
      solver.add(GE(tk, 0))
      solver.add(Eq(x.add(dx.mul(tk)), tk.mul(velocity.dx).add(position.x)))
      solver.add(Eq(y.add(dy.mul(tk)), tk.mul(velocity.dy).add(position.y)))
      solver.add(Eq(z.add(dz.mul(tk)), tk.mul(velocity.dz).add(position.z)))
    })

    const solved = await solver.check()
    if (solved === 'unsat')
      throw new Error("Unable to solve")
    
    const model = solver.model()
    const xRes = model.eval(x)
    const yRes = model.eval(y)
    const zRes = model.eval(z)

    const result = Number(xRes.sexpr()) + Number(yRes.sexpr()) + Number(zRes.sexpr())
    this.logAnswer(2, result);
  }
}
