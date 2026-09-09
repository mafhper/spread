import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const required = 'bun.lock'
const forbidden = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'package-lock.yaml',
]

const offenders = forbidden.filter(file => existsSync(resolve(root, file)))

if (!existsSync(resolve(root, required))) {
  console.error(`error: ${required} is required as the single source of truth`)
  process.exit(1)
}

if (offenders.length > 0) {
  for (const file of offenders) {
    console.error(
      `error: ${file} is not allowed; bun.lock is the only supported lockfile`
    )
  }
  process.exit(1)
}

console.log('package manager check passed: bun.lock is the only lockfile')
