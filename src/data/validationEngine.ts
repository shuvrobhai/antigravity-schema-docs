import { ValidationCheckResult } from '../types';
import { runChecks } from '../lib/integrityGate';
import { documentStore } from './repository';

/**
 * Runs the same 12-check Integrity Gate the CLI uses, over the browser's
 * glob-loaded Reference Corpus store. Check 12 (Evidence Index & Probes Sync)
 * regenerates files on disk, so it reports 'na' here — run the CLI for it.
 */
export function runAllValidations(): ValidationCheckResult[] {
  return runChecks(documentStore).map(r => ({
    id: r.id,
    name: r.name,
    category: r.category,
    passed: r.status === 'pass',
    status: r.status,
    messages: r.messages,
    details: r.details,
  }));
}
