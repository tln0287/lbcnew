import naacJson from '../data/naac.json'
import type { NaacSet } from './data'

/** Kept separate so the large NAAC index only loads on pages that need it. */
export const naac = naacJson as unknown as { ug: NaacSet; pg: NaacSet }
