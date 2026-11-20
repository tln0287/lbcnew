// Builds the project for Vercel using the Build Output API (https://vercel.com/docs/build-output-api/v3):
//   .vercel/output/static/              the built site (site/dist)
//   .vercel/output/functions/api.func/  the API server bundled into one file, plus its SQL migrations
//   .vercel/output/config.json          routes: /api/* -> function, /docs/* -> lbc.edu.in, SPA fallback
//
// Run by Vercel (site/vercel.json buildCommand, Root Directory = site). Locally: cd site && node ../tools/vercel-build.mjs
import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { build } from '../server/node_modules/esbuild/lib/main.js'

const root = join(import.meta.dirname, '..')
// Vercel looks for .vercel/output in the project's Root Directory (site/ on the lbcnew project), i.e. the cwd
const out = join(process.cwd(), '.vercel', 'output')
const fn = join(out, 'functions', 'api.func')

rmSync(out, { recursive: true, force: true })
mkdirSync(fn, { recursive: true })

// 1. the site
execSync('npm run build', { cwd: join(root, 'site'), stdio: 'inherit' })
cpSync(join(root, 'site', 'dist'), join(out, 'static'), {
  recursive: true,
  // the mirrored documents (~6 GB) are not deployed; /docs/* redirects to lbc.edu.in instead
  filter: (src) => !src.includes(`${join('dist', 'docs')}`),
})

// 2. the API function
await build({
  entryPoints: [join(root, 'server', 'src', 'vercel.ts')],
  outfile: join(fn, 'index.mjs'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  external: ['pg-native'], // optional native driver pg tries to load; not used
  // CommonJS dependencies (pg, express) call require(); give the ESM bundle one
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
  logLevel: 'info',
})
cpSync(join(root, 'server', 'migrations'), join(fn, 'migrations'), { recursive: true })
// (the bundle finds migrations/ beside itself)
writeFileSync(
  join(fn, '.vc-config.json'),
  JSON.stringify({ runtime: 'nodejs22.x', handler: 'index.mjs', launcherType: 'Nodejs', shouldAddHelpers: false, supportsResponseStreaming: true }, null, 2),
)
writeFileSync(join(fn, 'package.json'), JSON.stringify({ type: 'module' }))

// 3. routing
writeFileSync(
  join(out, 'config.json'),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { src: '^/api(?:/.*)?$', dest: '/api' },
        { src: '^/docs/(.*)$', status: 308, headers: { Location: 'https://lbc.edu.in/$1' } },
        { src: '^/admin(?:/.*)?$', headers: { 'X-Robots-Tag': 'noindex, nofollow' }, continue: true },
        { src: '^/assets/(.*)$', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }, continue: true },
        { handle: 'filesystem' },
        { src: '^/(.*)$', dest: '/index.html' },
      ],
    },
    null,
    2,
  ),
)

if (!existsSync(join(out, 'static', 'index.html'))) throw new Error('site build missing index.html')
console.log(`Vercel output ready in ${out}`)
