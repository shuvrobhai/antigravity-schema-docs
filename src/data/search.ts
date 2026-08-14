import { SearchResultItem } from '../types';
import { referenceModules, jsonSchemas, evidenceProbes, sourceCitations, adrRecords } from './repository';
import { SearchIndex } from '../lib/searchIndex';

// Pre-indexed inverted corpus index
const globalSearchIndex = SearchIndex.buildFromCorpus({
  referenceModules,
  jsonSchemas,
  evidenceProbes,
  sourceCitations,
  adrRecords,
});

/**
 * Executes fast inverted-index query matching across all documentation domains.
 */
export function performSearch(query: string): SearchResultItem[] {
  return globalSearchIndex.search(query);
}
