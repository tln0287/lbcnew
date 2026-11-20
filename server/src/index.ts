/** Long-running Node server (development, Docker). On Vercel, src/vercel.ts is the entry instead. */
import { createApp, prepare } from './app.ts'
import { pool } from './db.ts'

await prepare()
const app = createApp()

const port = Number(process.env.PORT ?? 8787)
const server = app.listen(port, () => console.log(`LBC server listening on http://localhost:${port}`))

for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, () => {
    server.close(() => void pool.end().then(() => process.exit(0)))
  })
}
