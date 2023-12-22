import { measure, sum } from "../utils/utils";
import { Day } from "../utils/day";

interface Part {
  x: number
  m: number
  a: number
  s: number
}

type Condition = {
  prop: string
  comp: string
  val: number
  target: string
}

interface Workflow {
  testFunc: TestFunction
  tests: Condition[]
  fallback: string
}

type TestFunction = (x: number, m: number, a: number, s: number) => string
const ACCEPTED = "A"
const REJECTED = "R"

const checkRegex = /(?<prop>x|m|a|s){1}(?<comp><|>){1}(?<val>\d+)/

export class Solution extends Day {
  
  workflows: Record<string, Workflow>
  parts: Part[]

  @measure
  prepData(data: string[]): void {
    const groups = {
      workflows: [],
      parts: []
    }
    let target = "workflows"
    data.forEach((line) => {
      if (line.trim() === "") {
        target = "parts"
        return
      }

      groups[target].push(line.trim())
    })

    this.workflows = Object.fromEntries(
      groups.workflows.map((line) => {
        const {name, conditions} = /^(?<name>[a-z]+){(?<conditions>([a-zAR]+(?:<|>)\d+:[a-zAR]+,){1,3}[a-zAR]+)}$/g.exec(line).groups
        return [name, this.parseConditions(conditions)]
      })
    )

    this.parts = groups.parts.map((line) => {
      const {x,m,a,s} = /{x=(?<x>\d+),m=(?<m>\d+),a=(?<a>\d+),s=(?<s>\d+)}/.exec(line).groups
      return {
        x: parseInt(x),
        m: parseInt(m),
        a: parseInt(a),
        s: parseInt(s)
      }
    })
  }

  parseConditions(conditions: string) : Workflow {
    const checks = conditions.split(",")
    const tests = []
    const func = checks.map((check, i) => {
      if (i < checks.length-1) {
        const [test, target] = check.split(":")
        const {prop, comp, val} = checkRegex.exec(test).groups
        tests.push({prop, comp, val: parseInt(val), target})
        return `if (${test}) return "${target}"`
      } else {
        return `return "${check}"`
      }
      
    }).join(";")

    return {testFunc: eval(`(x,m,a,s) => {${func}}`), tests, fallback: checks[checks.length-1]}
  }

  runWorkflows({x,m,a,s}: Part) {
    let target = "in"
      
      while (target !== ACCEPTED && target !== REJECTED) {
        let workflow = this.workflows[target]
        target = workflow.testFunc(x,m,a,s)
      }

      return target
  }

  @measure
  task1() {

    const accepted = []
    const rejected = []
    this.parts.forEach((part) => {
      const result = this.runWorkflows(part)

      if (result === ACCEPTED)
        accepted.push(part)

    })

    this.logAnswer(1, sum(accepted.map(({x,m,a,s}) => x+m+a+s)));
  }

  @measure
  task2() {
    let accepted = []
    

    // Find lowest x
    type Range = [number, number]
    type State = [string, Range, Range, Range, Range]
    const q: State[] = [["in", [1,4000], [1,4000], [1,4000], [1,4000]]]

    const testRange = (test: Condition, range) => {
      const {comp, val, target} = test
      
      if (comp === "<") {
        if (range[0] < val) {
          const newTop = Math.min(val-1, range[1])
          const newBottom = range[0]
          if (newTop !== range[1])
            range[0] = val
          else
            throw new Error()

          return [target, [newBottom, newTop]]
        }
      } else if (comp === ">") {
        if (range[1] > val) {
          const newBottom = Math.max(val+1, range[0])
          const newTop = range[1]
          if (newBottom!== range[0])
            range[1] = val
          else
            throw new Error()

          return [target, [newBottom, newTop]]
        }
      }

      return [null, null]
    }
    while (q.length > 0) {
      const [name, xRange, mRange, aRange ,sRange] = q.shift()

      if (name === ACCEPTED) {
        accepted.push([[...xRange], [...mRange], [...aRange], [...sRange]])
        continue
      }

      if (name === REJECTED)
        continue

      const workflow = this.workflows[name]

      for (const test of workflow.tests) {
        let next, newRange
        switch (test.prop) {
          case "x":
            [next, newRange] = testRange(test, xRange)
            if (newRange)
              q.push([next, newRange, [...mRange], [...aRange],[...sRange]])
            break
          case "m":
            [next, newRange] = testRange(test, mRange)
            if (newRange)
              q.push([next, [...xRange], newRange, [...aRange],[...sRange]])
            break
          case "a":
            [next, newRange] = testRange(test, aRange)
            if (newRange)
              q.push([next, [...xRange], [...mRange], newRange, [...sRange]])
            break
          case "s":
            [next, newRange] = testRange(test, sRange)
            if (newRange)
              q.push([next, [...xRange], [...mRange], [...aRange],newRange])
            break
        }
      }
      if (workflow.fallback)
        q.push([workflow.fallback,[...xRange],[...mRange],[...aRange],[...sRange]])
    } 
    
    const result = sum(accepted.map(([xRange,mRange,aRange,sRange]) => {
      return (xRange[1] - xRange[0] + 1) * (mRange[1] - mRange[0] + 1) * (aRange[1] - aRange[0] + 1) * (sRange[1] - sRange[0] + 1)
    }))
    
    this.logAnswer(2, result);
  }
}
