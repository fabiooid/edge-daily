import { spawn } from 'node:child_process'

function run(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', env: process.env })
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} ${args.join(' ')} failed with ${code}`))
    })
  })
}

async function main() {
  process.env.ALLOW_PGLITE = process.env.ALLOW_PGLITE || 'true'
  process.env.PGLITE_PATH = process.env.PGLITE_PATH || '.data/edge-weekly'
  await run('npx', ['tsx', 'scripts/migrate.ts'])
  await run('npx', ['tsx', 'scripts/seed-sources.ts'])
  await run('npx', ['tsx', 'scripts/import-archive.ts'])
  await run('npx', ['tsx', 'scripts/seed-demo-edition.ts'])
  console.log('Demo data is ready. Run npm run dev to view the site.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
