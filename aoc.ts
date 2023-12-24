import { ArgumentsCamelCase } from "yargs"
import yargs from "yargs/yargs"
import { range } from "./utils/utils"
import { copyFile, writeFile } from "fs/promises"

const days = [...range(1, 26)]
type Day = (typeof days)[number]

interface DefaultAOCArgs {
  day: Day
}

interface AOCArgs extends DefaultAOCArgs {
  task?: 1 | 2
  filename?: string
}

const addDefaultParams = (yargs) => {
  return yargs.positional("day", {
    describe: "Which day to run",
    type: "number",
    require: true,
    choices: [...range(1, 26)],
  })
}

const addParams = (yargs) => {
  return addDefaultParams(yargs)
    .option("task", {
      alias: "-t",
      require: false,
      type: "number",
      choices: [1, 2],
    })
    .option("filename", {
      alias: "-f",
      require: false,
      type: "string",
    })
}

const runCode = async (
  day: Day,
  dataType: "full" | "sample",
  task?: 1 | 2,
  filename?: string
) => {
  const { Solution } = await import(`./days/day${day}`)
  new Solution(filename ?? `day${day}.${dataType}`, dataType === "sample").run(task)
}

const createNew = async (day: Day) => {
  await copyFile("./templates/solution.tmpl", `./days/day${day}.ts`)
  await writeFile(`./inputs/day${day}.sample`,"","utf-8")
  await writeFile(`./inputs/day${day}.full`, "", "utf-8")
}

yargs(process.argv.slice(2))
  .scriptName("aoc")
  .usage("$0 <cmd> <day>")
  .command(
    "full [day]",
    "Run with full data",
    (yargs) => {
      return addParams(yargs)
    },
    async ({ day, task, filename }: ArgumentsCamelCase<AOCArgs>) => {
      await runCode(day, "full", task, filename)
    }
  )
  .command(
    "sample [day]",
    "Run with sample data",
    (yargs) => {
      return addParams(yargs)
    },
    async ({ day, task, filename }: ArgumentsCamelCase<AOCArgs>) => {
      await runCode(day, "sample", task, filename)
    }
  )
  .command(
    "new [day]",
    "Create skeleton solution and input files for given day",
    (yargs) => {
      return addDefaultParams(yargs)
    },
    async ({ day }: ArgumentsCamelCase<DefaultAOCArgs>) => {
      await createNew(day)
    }
  )
  .help().argv
