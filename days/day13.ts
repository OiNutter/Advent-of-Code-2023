import { measure, reverseString } from "../utils/utils";
import { Day } from "../utils/day";

interface Pattern {
  rows: string[]
  cols: string[]
}

export class Solution extends Day {
  patterns: Pattern[] = []

  found: { rows: number[]; cols: number[] }[] = [];

  @measure
  prepData(data: string[]): void {
    let index = 0;
    this.patterns.push({
      rows: [],
      cols: []
    })
    data.forEach((line) => {
      if (line.trim() === "") {
        index++;
        this.patterns.push({
          rows: [],
          cols: []
        })
      } else {
        this.patterns[index].rows.push(line.trim())
      }
    });

    this.patterns.forEach((pattern) => {
      for (let x = 0; x < pattern.rows[0].length; x++)
        pattern.cols.push(pattern.rows.map((row) => row[x]).join(""))
    })
  }

  drawPatterns() {
    this.patterns.forEach((pattern) => {
      pattern.rows.forEach((row) => {
        console.log(row);
      });
      console.log("");
    });
  }

  getDiffs(str: string, index: number) {
    let left = reverseString(str.substring(0, index+1))
    let right = str.substring(index+1)
    const len = Math.min(left.length, right.length)
    left = left.substring(0,len)
    right = right.substring(0,len)
    if (left !== right) {
      return left.split("").reduce((count, char, i) => {
        return count + ((char !== right[i]) ? 1 : 0)
      },0)
    }

    return 0
  }

  summarise(rows: number, cols: number) {
    return cols + (100 * rows)
  }

  findReflections(fixSmudge = false) {
    let rows = 0
    let cols = 0

    this.patterns.forEach((pattern, p) => {
      //cols
      for (let x = 0; x < pattern.cols.length-1; x++) {
        
        let diffs = 0
        for (let y = 0; y < pattern.rows.length; y++) {
          const row = pattern.rows[y]
          diffs += this.getDiffs(row, x)
        }
        
        if ((!fixSmudge && diffs === 0) || (fixSmudge && diffs === 1)) {
          cols += x+1
          break
        }
      }

      //rows
      for (let y = 0; y < pattern.rows.length-1; y++) {
        
        let diffs = 0
        for (let x = 0; x < pattern.cols.length; x++) {
          const col = pattern.cols[x]
          diffs += this.getDiffs(col, y)
        }

        if ((!fixSmudge && diffs === 0) || (fixSmudge && diffs === 1)) {
          rows += y+1
          break
        } 
        
      }

    })

    return {rows, cols}
  }
  
  @measure
  task1() {
    const {rows, cols} = this.findReflections()
    this.logAnswer(1, this.summarise(rows, cols));
  }

  @measure
  task2() {
    const {rows, cols} = this.findReflections(true)
    this.logAnswer(2, this.summarise(rows, cols));
  }
}
