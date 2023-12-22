import {measure} from "../utils/utils"
import { Day } from "../utils/day"

class Range {
  start: number
  size: number

  constructor(start: number, length: number) {
    this.start = start
    this.size = length
  }
}

export class Solution extends Day {
  
  seeds: number[]
  maps: Record<string, [number, number, number][]> = {}

  @measure
  prepData(data: string[]): void {
    let mapTarget: string
    data.forEach((line) => {
      if (line.startsWith("seeds:")) {
        this.seeds = line.replace(/seeds:\s+/,'').split(' ').map((n) => parseInt(n.trim()))
      } else {
        if (/([a-z\-]) map:/.test(line)) {
          mapTarget = line.replace(/\s+map:/,'')
          this.maps[mapTarget] = []
        } else if (line !== "") {
          const matches = /(?<destStart>\d+) (?<sourceStart>\d+) (?<rangeLength>\d+)/.exec(line).groups
          const destStart = parseInt(matches.destStart)
          const sourceStart = parseInt(matches.sourceStart)
          const rangeLength = parseInt(matches.rangeLength)
          this.maps[mapTarget].push([destStart, sourceStart, rangeLength])
        }
      }
    })
  }

  getMapping(target: string, source: number) {
    for (let i = 0; i < this.maps[target].length; i++) {
      const [destStart, sourceStart, rangeLength] = this.maps[target][i]

      if (source >= sourceStart && source < sourceStart + rangeLength) {
        return destStart + (source - sourceStart)
      }

    }

    return source
  }

  @measure
  task1() {
    const locations = this.seeds.map((seed) => {
      const soil = this.getMapping('seed-to-soil', seed)
      const fertilizer = this.getMapping('soil-to-fertilizer', soil)
      const water = this.getMapping('fertilizer-to-water', fertilizer)
      const light = this.getMapping('water-to-light', water)
      const temp = this.getMapping('light-to-temperature', light)
      const humidity = this.getMapping('temperature-to-humidity', temp)
      return this.getMapping('humidity-to-location', humidity)
    })
    this.logAnswer(1, Math.min(...locations))
  }

  getLocation(seed) {
    const soil = this.getMapping('seed-to-soil', seed)
    const fertilizer = this.getMapping('soil-to-fertilizer', soil)
    const water = this.getMapping('fertilizer-to-water', fertilizer)
    const light = this.getMapping('water-to-light', water)
    const temp = this.getMapping('light-to-temperature', light)
    const humidity = this.getMapping('temperature-to-humidity', temp)
    return this.getMapping('humidity-to-location', humidity)
  }

  getMappedRanges(target:string, sourceRange: Range) {
    let start = sourceRange.start,
        end = sourceRange.start + sourceRange.size
    const ranges = []
    const map = this.maps[target].sort((a,b) => {
      if (a[1] < b[1])
        return -1
      else if (a[1] > b[1])
        return 1
      else
        return 0
    })
    
    for (let i = 0; i < map.length; i++) {
      const [destStart, sourceStart, rangeLength] = map[i]

      if (sourceStart + rangeLength < start)
        continue

      if (sourceStart > end)
        continue

      if (start < sourceStart) {
        ranges.push(new Range(start, sourceStart - start))
        start = sourceStart
      }

      const newLength = Math.min(rangeLength - start + sourceStart, end - start);
      const sectionStart = start + destStart - sourceStart;
      ranges.push(new Range(sectionStart, newLength))
      
      start += newLength
    }

    if (start < end) {
      ranges.push(new Range(start, end - start))
    }

    return ranges
  }

  @measure
  task2() {
    const ranges = []
    for (let i = 0; i < this.seeds.length; i+=2) {
      ranges.push(new Range(this.seeds[i], this.seeds[i+1]))
    }

    const locationRanges = this
        .seeds
        .reduce<Array<number[]>>((results, item, index) => {
          const chunkIndex = Math.floor(index/2)
          if (!results[chunkIndex])
            results[chunkIndex] = []

          results[chunkIndex].push(item)
          return results
        },[])
        .map((v) => new Range(v[0], v[1]))
        .flatMap((range) => this.getMappedRanges('seed-to-soil', range))
        .flatMap((soilRange) => this.getMappedRanges('soil-to-fertilizer', soilRange))
        .flatMap((fertilizerRange) => this.getMappedRanges('fertilizer-to-water', fertilizerRange))
        .flatMap((waterRange) => this.getMappedRanges('water-to-light', waterRange))
        .flatMap((lightRange) => this.getMappedRanges('light-to-temperature', lightRange))
        .flatMap((tempRange) => this.getMappedRanges('temperature-to-humidity', tempRange))
        .flatMap((humidityRange) => this.getMappedRanges('humidity-to-location', humidityRange))
    
    const sorted = locationRanges.map((r) => r.start).sort((a, b) => {
      if (a < b)
        return -1
      else if (a > b)
        return 1
      else
        return 0
    })

    this.logAnswer(2, sorted.shift())
  }

}