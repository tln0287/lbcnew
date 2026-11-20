/**
 * Vercel serverless entry: every /api/* request lands here (see tools/vercel-build.mjs).
 * Migrations and the first-admin check run once per cold start, before the first request is handled.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createApp, prepare } from './app.ts'

const app = createApp()
let ready: Promise<void> | null = null

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  ready ??= prepare().catch((err) => {
    ready = null // retry on the next request instead of failing forever
    throw err
  })
  try {
    await ready
  } catch (err) {
    console.error('startup failed', err)
    res.statusCode = 503
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'The application service is starting up. Please try again in a minute.' }))
    return
  }
  app(req, res)
}
