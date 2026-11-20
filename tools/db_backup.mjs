// Backs up or restores the applications database running in docker compose.
//
//   node tools/db_backup.mjs backup               -> backups/lbc-YYYY-MM-DD-HHMM.dump
//   node tools/db_backup.mjs restore <file.dump>   (replaces the current data; asks first)
//
// Backups use pg_dump's custom format (compressed; restore with pg_restore). Keep copies off this machine.
import { spawn } from 'node:child_process'
import { createReadStream, createWriteStream, mkdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { createInterface } from 'node:readline/promises'

const root = join(import.meta.dirname, '..')
const [cmd, file] = process.argv.slice(2)

function run(args, { stdin, stdout } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn('docker', ['compose', ...args], { cwd: root, stdio: [stdin ? 'pipe' : 'inherit', stdout ? 'pipe' : 'inherit', 'inherit'] })
    if (stdin) stdin.pipe(p.stdin)
    if (stdout) p.stdout.pipe(stdout)
    p.on('error', reject)
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`docker compose ${args[0]} exited with ${code}`))))
  })
}

if (cmd === 'backup') {
  const dir = join(root, 'backups')
  mkdirSync(dir, { recursive: true })
  const stamp = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }).replace(/[: ]/g, (c) => (c === ' ' ? '-' : '')).slice(0, 15)
  const out = join(dir, `lbc-${stamp}.dump`)
  await run(['exec', '-T', 'db', 'pg_dump', '-U', 'lbc', '-d', 'lbc', '-Fc'], { stdout: createWriteStream(out) })
  console.log(`Backup written: ${out} (${Math.round(statSync(out).size / 1024)} KB)`)
} else if (cmd === 'restore' && file) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const ok = (await rl.question(`Replace ALL current applications with ${file}? Type "restore" to continue: `)) === 'restore'
  rl.close()
  if (!ok) process.exit(1)
  await run(['exec', '-T', 'db', 'pg_restore', '-U', 'lbc', '-d', 'lbc', '--clean', '--if-exists', '--no-owner'], { stdin: createReadStream(file) })
  console.log('Restore finished.')
} else {
  console.log('Usage: node tools/db_backup.mjs backup | restore <file.dump>')
  process.exitCode = 1
}
