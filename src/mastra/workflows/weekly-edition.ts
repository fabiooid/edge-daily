import { createStep, createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'
import { compileEdition } from '../../lib/pipeline/compile'
import { ingestSources } from '../../lib/pipeline/ingest'

const inputSchema = z.object({
  job: z.enum(['ingest', 'compile']).default('compile'),
  mock: z.boolean().optional(),
})

const ingestStep = createStep({
  id: 'ingest',
  inputSchema,
  outputSchema: inputSchema.extend({
    fetched: z.number(),
  }),
  execute: async ({ inputData }) => {
    if (inputData.job === 'compile' && inputData.mock) {
      return { ...inputData, fetched: 0 }
    }
    const result = await ingestSources({ mock: inputData.mock })
    return { ...inputData, fetched: result.fetched }
  },
})

const compileStep = createStep({
  id: 'compile',
  inputSchema: ingestStep.outputSchema,
  outputSchema: z.object({
    editionWeek: z.string(),
    passed: z.boolean(),
    storyCount: z.number(),
  }),
  execute: async ({ inputData }) => {
    if (inputData.job === 'ingest') {
      return { editionWeek: 'skipped', passed: true, storyCount: 0 }
    }
    const result = await compileEdition({ mock: inputData.mock })
    return {
      editionWeek: result.editionWeek,
      passed: result.passed,
      storyCount: result.storyCount,
    }
  },
})

export const weeklyEditionWorkflow = createWorkflow({
  id: 'weekly-edition',
  inputSchema,
  outputSchema: compileStep.outputSchema,
})
  .then(ingestStep)
  .then(compileStep)
  .commit()
