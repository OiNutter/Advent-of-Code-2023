import { measure } from "../utils/utils";
import { Day } from "../utils/day";

const OPERATIONAL = "."
const DAMAGED = "#"
const UNKNOWN = "?"

interface Row {
  springs: string
  counts: number[]
  key: string
}

export class Solution extends Day {
  
  rows: Row[] = []
  memo: Record<string, string[]> = {}

  @measure
  prepData(data: string[]): void {
    this.rows = data.map(line => {
      const [springs, counts] = line.trim().split(" ")
      return {
        springs,
        counts: counts.split(",").map(n => parseInt(n)),
        key: springs
      }
    })
  }

  checkMatch(arrangement: string, counts: number[]) {
    //console.log("REGEX", `^\.*${counts.map((c) => `${DAMAGED}{${c}}`).join(`\\${OPERATIONAL}+`)}\.*$`)
    const regExp = new RegExp(`^\\.*${counts.map((c) => `${DAMAGED}{${c}}`).join(`\\${OPERATIONAL}+`)}\\.*$`)
    return regExp.test(arrangement)
  }

  getArrangements(row: Row) {
    let {springs, counts} = row
    const memo: Record<string, number> = {
      [`0|0|0`]: 1
    }

    springs += "."

    // Loop over each character as a start point
    for (let i = 0; i < springs.length; i++) {
      const c = springs[i]
      // Loop over each group to see if they're all achievable
      for (let j = 0; j <= counts.length; j++) {
        const group = counts[j] ?? 0
        // look forward to find the end of the group
        for (let k = 0; k <= group+1; k++) {
          const current = memo[`${i}|${j}|${k}`]
          if (!current)
            continue

          let key
          switch(c) {
            case OPERATIONAL:
              if (k === 0) {
                key = `${i+1}|${j}|${k}`
                if (!memo[key])
                  memo[key] = 0
                memo[key] += current
              } 
              if (group === k) {
                key = `${i+1}|${j+1}|0`
                if (!memo[key])
                  memo[key] = 0
                memo[key] += current
              }
              
              break
            case DAMAGED:
              if (group >= k) {
                key = `${i+1}|${j}|${k+1}`
                if (!memo[key])
                  memo[key] = 0
                memo[key] += current
              }
              break
            case UNKNOWN:

              if (k === 0) {
                key = `${i+1}|${j}|0`
                if (!memo[key])
                  memo[key] = 0
                memo[key] += current
              }

              if (group === k) {
                key = `${i+1}|${j+1}|0`
                if (!memo[key])
                  memo[key] = 0
                memo[key] += current
              }

              if (group >= k) {
                key = `${i+1}|${j}|${k+1}`
                if (!memo[key])
                  memo[key] = 0
                memo[key] += current
              }
              break
            default:
              throw new Error("UNRECOGNISED CHARACTER FOUND")
              break
          }
        }
      }
    }

    return memo[`${springs.length}|${counts.length}|0`]
  }

  unfold(rows: Row[]) {
    return rows.map(({springs, counts}) => {
      return {
        springs: new Array(5).fill(springs).join("?"),
        counts: new Array(5).fill(counts).flat(),
        key: springs
      }
    })
  }

  
  @measure
  task1() {
    const numPermutations = this.rows.reduce((permutations, r) => {
      const count = this.getArrangements(r)
      //console.log(r.springs, count)
      return permutations + count
    }, 0)
    this.logAnswer(1, numPermutations);
  }

  @measure
  task2() {
    const numPermutations = this.unfold(this.rows).reduce((permutations, r) => {
      const count = this.getArrangements(r)
      return permutations + count
    }, 0)
    this.logAnswer(2, numPermutations);
  }
}
