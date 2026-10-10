import { authorizeCron, readBearer } from '@/lib/auth'
import { compileEdition } from '@/lib/pipeline/compile'
import { ingestSources } from '@/lib/pipeline/ingest'
import { sendTelegramPreview } from '@/lib/pipeline/telegram'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const auth = authorizeCron(readBearer(request.headers.get('authorization')))
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status })
  }

  const body = (await request.json().catch(() => ({}))) as {
    job?: string
    mock?: boolean
    force?: boolean
  }
  const job = body.job || new URL(request.url).searchParams.get('job')

  if (job === 'ingest') {
    const result = await ingestSources({ mock: body.mock })
    return Response.json(result)
  }

  if (job === 'compile') {
    let result
    try {
      result = await compileEdition({ mock: body.mock, force: body.force })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Compile failed'
      return Response.json({ error: message }, { status: 400 })
    }
    if (result.unchanged) {
      return Response.json(result)
    }
    if (result.passed && !result.autoPublished) {
      await sendTelegramPreview({
        editionWeek: result.editionWeek,
        storyCount: result.storyCount,
        headlines: result.headlines,
        previewToken: result.previewToken,
        passed: result.passed,
      })
    }
    return Response.json(result)
  }

  return Response.json({ error: 'Unknown job' }, { status: 400 })
}

export async function GET() {
  return Response.json({ error: 'Use POST' }, { status: 405 })
}
