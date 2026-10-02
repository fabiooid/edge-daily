import { spawn } from 'node:child_process'

const role = process.env.PROCESS_ROLE || 'web'
const port = process.env.PORT || '3000'

const command =
  role === 'pipeline'
    ? ['npx', 'tsx', 'scripts/pipeline.ts', process.env.PIPELINE_JOB || 'compile']
    : ['npx', 'next', 'start', '--port', port]

const child = spawn(command[0], command.slice(1), {
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code) => {
  process.exit(code ?? 1)
})
