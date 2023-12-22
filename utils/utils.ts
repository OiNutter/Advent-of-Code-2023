import { Day } from "./day"

export function measure(
  target: Day,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value
  descriptor.value = function (...args: any[]) {
    const start = performance.now()
    try {
      //console.log(`${propertyKey} started at: ${start.format("HH:mm:ss")}`)
      return originalMethod?.apply(this, args)
    } finally {
      const end = performance.now()
      const duration = end - start
      //console.log(`${propertyKey} finished at: ${end.format("HH:mm:ss")}`)
      console.log(
        `${propertyKey} execution time: ${duration ?? 0} milliseconds`
      )
    }
  }
}

export function sum(arr: number[]) {
  return arr.reduce((total, current) => {
    return total + current
  }, 0)
}

export function prod(arr: number[]) {
  return arr.reduce((total, current) => {
    return total * current
  }, 1)
}

export function divmod(n: number, x: number): [number, number] {
  return [Math.floor(n / x), n % x]
}

export function* range(start, end, step = 1) {
  if (start === end) return
  yield start
  if (start + step >= end) return
  yield* range(start + step, end, step)
}

export function reverseString(str: string) {
  const bits = str.split("")
  const reversed = bits.reverse()
  return reversed.join("")
}

export function primeFactors(n: number): number[] {
  const factors = []
  let divisor = 2

  while (n >= 2) {
    if (n % divisor == 0) {
      factors.push(divisor)
      n = n / divisor
    } else {
      divisor++
    }
  }
  return factors
}

export const gcd = (a, b) => (b == 0 ? a : gcd(b, a % b))
export const lcm = (a, b) => (a / gcd(a, b)) * b
export const lcmAll = (ns) => ns.reduce(lcm, 1)

export type Direction = "N" | "S" | "E" | "W"
export interface Coord {
  x: number
  y: number
}

export function shoelaceFormula(coords: Coord[]): number {
  const n: number = coords.length
  let area: number =
    0.5 *
    Math.abs(
      coords.reduce((acc, val, i) => {
        const nextCoord = coords[(i + 1) % n]
        return acc + (val.x * nextCoord.y - nextCoord.x * val.y)
      }, 0)
    )

  return area
}

export function calculatePolygonArea(vertices: Coord[]): number {
  const n = vertices.length

  if (n < 3) {
    // A polygon must have at least 3 vertices
    return 0
  }

  let area = 0

  for (let i = 0; i < n; i++) {
    const xi = vertices[i].x
    const yi = vertices[i].y
    const xi1 = vertices[(i + 1) % n].x
    const yi1 = vertices[(i + 1) % n].y

    area += xi * yi1 - xi1 * yi
  }

  // The area is the absolute value of half the sum
  area = Math.abs(area) / 2

  return area
}

export function findOutsideEdgeVertices(loop: Coord[]): Coord[] {
  const n = loop.length

  if (n < 3) {
    // A loop must have at least 3 vertices to form a closed area
    return []
  }

  const outsideEdgeVertices: Coord[] = []

  for (let i = 0; i < n; i++) {
    const currentVertex = loop[i]
    const nextVertex = loop[(i + 1) % n]

    // Calculate the vector from the current vertex to the next vertex
    const vectorX = nextVertex.x - currentVertex.x
    const vectorY = nextVertex.y - currentVertex.y

    // Calculate the normal vector (perpendicular to the edge) pointing outward
    const normalVectorX = -vectorY
    const normalVectorY = vectorX

    // Add the new vertex on the outside edge
    const outsideEdgeVertex: Coord = {
      x: currentVertex.x + normalVectorX,
      y: currentVertex.y + normalVectorY,
    }

    outsideEdgeVertices.push(outsideEdgeVertex)
  }

  return outsideEdgeVertices
}

function getCentroid(points: Coord[]): Coord {
  const n = points.length
  const centroid = points.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 }
  )
  return { x: centroid.x / n, y: centroid.y / n }
}

function calculateAngle(point: Coord, centroid: Coord): number {
  const x = point.x - centroid.x
  const y = point.y - centroid.y
  return Math.atan2(y, x)
}

export function orderPointsClockwise(points: Coord[]): Coord[] {
  const centroid = getCentroid(points)

  // Sort points based on polar angle relative to the centroid
  points.sort(
    (a, b) => calculateAngle(a, centroid) - calculateAngle(b, centroid)
  )

  return points
}

export function isPointInsidePolygon(point: Coord, polygon: Coord[]): boolean {
  const x = point.x
  const y = point.y
  let isInside = false

  if (polygon.find((coord) => coord.x === point.x && coord.y === point.y))
    return false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi

    if (intersect) {
      isInside = !isInside
    }
  }

  return isInside
}

export function countPointsInsideLoop(points: Coord[], loop: Coord[]): number {
  return points.reduce(
    (count, point) => (isPointInsidePolygon(point, loop) ? count + 1 : count),
    0
  )
}

export function getManhattanDistance(start: Coord, end: Coord) {
  return Math.abs(end.x - start.x) + Math.abs(end.y - start.y)
}

export function compareNumbers(a, b) {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export function linearInterpolation(
  a: number,
  b: number,
  c: number,
  n: number
): number {
  if (n < 1) {
    return a
  } else if (n < 2) {
    return b
  } else if (n < 3) {
    return c
  }

  const t = (n - 1) / 2

  const interpolatedValue =
    (1 - t) * ((1 - t) * a + t * b) + t * ((1 - t) * b + t * c)

  return interpolatedValue
}

export function quadraticInterpolation(points: Coord[], n: number) {
  if (points.length < 3)
    throw new Error("Quadratic Interpolation requires at least 3 points")

  const a =
      (points[0].y * (n - points[1].x) * (n - points[2].x)) /
      (points[0].x - points[1].x) /
      (points[0].x - points[2].x),
    b =
      (points[1].y * (n - points[0].x) * (n - points[2].x)) /
      (points[1].x - points[0].x) /
      (points[1].x - points[2].x),
    c =
      (points[2].y * (n - points[0].x) * (n - points[1].x)) /
      (points[2].x - points[0].x) /
      (points[2].x - points[1].x)

  return a + b + c
}
