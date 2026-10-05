import { Mastra } from '@mastra/core/mastra'
import { weeklyEditionWorkflow } from './workflows/weekly-edition'

export const mastra = new Mastra({
  workflows: { weeklyEditionWorkflow },
})
