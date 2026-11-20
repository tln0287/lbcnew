/**
 * Manage dashboard administrators.
 *
 *   npm run admin -- list
 *   npm run admin -- add <username>        (asks for the password; or set ADMIN_NEW_PASSWORD)
 *   npm run admin -- password <username>   (sets a new password and signs that admin out everywhere)
 *   npm run admin -- remove <username>
 */
import { createInterface } from 'node:readline/promises'
import { hashPassword, MIN_PASSWORD } from './auth.ts'
import { pool } from './db.ts'
import { migrate } from './migrate.ts'

async function askPassword() {
  if (process.env.ADMIN_NEW_PASSWORD) return process.env.ADMIN_NEW_PASSWORD
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const pw = await rl.question(`Password (at least ${MIN_PASSWORD} characters): `)
  const again = await rl.question('Repeat password: ')
  rl.close()
  if (pw !== again) throw new Error('The passwords do not match.')
  return pw
}

const [cmd, rawUser] = process.argv.slice(2)
const username = rawUser?.trim().toLowerCase()

try {
  await migrate()
  if (cmd === 'list') {
    const { rows } = await pool.query('SELECT username, created_at, last_login_at FROM admins ORDER BY username')
    console.table(rows)
  } else if ((cmd === 'add' || cmd === 'password') && username) {
    const pw = await askPassword()
    if (pw.length < MIN_PASSWORD) throw new Error(`The password must be at least ${MIN_PASSWORD} characters.`)
    const hash = await hashPassword(pw)
    if (cmd === 'add') {
      await pool.query('INSERT INTO admins (username, password_hash) VALUES ($1, $2)', [username, hash])
      console.log(`Administrator "${username}" added.`)
    } else {
      const r = await pool.query('UPDATE admins SET password_hash = $2 WHERE username = $1 RETURNING id', [username, hash])
      if (!r.rowCount) throw new Error(`No administrator called "${username}".`)
      await pool.query('DELETE FROM admin_sessions WHERE admin_id = $1', [r.rows[0].id])
      console.log(`Password changed for "${username}".`)
    }
  } else if (cmd === 'remove' && username) {
    const r = await pool.query('DELETE FROM admins WHERE username = $1', [username])
    console.log(r.rowCount ? `Administrator "${username}" removed.` : `No administrator called "${username}".`)
  } else {
    console.log('Usage: npm run admin -- list | add <username> | password <username> | remove <username>')
    process.exitCode = 1
  }
} catch (err) {
  console.error(err instanceof Error ? err.message : err)
  process.exitCode = 1
} finally {
  await pool.end()
}
