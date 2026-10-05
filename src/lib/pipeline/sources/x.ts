import { featureFlags } from '../../../../config/pipeline'
import type { IngestedItem, SourceAdapter } from './types'

export const xAdapter: SourceAdapter = {
  type: 'x',
  async ingest(source) {
    if (!featureFlags.xSources) {
      return []
    }
    if (source.status !== 'active') {
      return []
    }
    // X costs per read. The flag stays off unless the owner turns it on.
    throw new Error('X ingest is flagged on but the live client is not wired in milestone 1')
  },
}

export function emptyXItems(): IngestedItem[] {
  return []
}
