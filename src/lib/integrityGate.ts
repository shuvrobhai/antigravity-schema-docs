/**
 * integrityGate.ts — the Integrity Gate: all 12 repository checks as pure
 * functions over the DocumentStore seam.
 *
 * Ported from scripts/validate.ts so the CLI gate and the web app's Validation
 * Console cross the same seam. Checks are pure: no fs, no console — the store
 * supplies every fact and an optional Repair capability supplies fixes.
 */

import { MarkdownDoc } from './markdownCore';
import {
  CheckResult,
  DocumentStore,
  ModuleDoc,
  composeModules,
  buildManifestText,
  resolveRepoRelative,
  normalizePath,
} from './documentStore';

export interface RunOptions {
  fix?: boolean;
  verbose?: boolean;
}

function ok(id: string, name: string, category: string, message: string, details: string[] = []): CheckResult {
  return { id, name, category, status: 'pass', messages: [message], details };
}

function bad(id: string, name: string, category: string, messages: string[], details: string[] = []): CheckResult {
  return { id, name, category, status: 'fail', messages, details };
}

function na(id: string, name: string, category: string, message: string): CheckResult {
  return { id, name, category, status: 'na', messages: [message], details: [] };
}

function sortedModules(store: DocumentStore): ModuleDoc[] {
  return [...store.getModules()].sort((a, b) => a.number - b.number);
}

// --- Check 1: Module Contiguity ---
export function checkModuleContiguity(store: DocumentStore, opts: RunOptions = {}): CheckResult {
  const res: CheckResult = { id: 'modules', name: 'Module Contiguity', category: 'Architecture', status: 'pass', messages: [], details: [] };
  const modules = sortedModules(store);
  if (modules.length === 0) {
    return bad('modules', 'Module Contiguity', 'Architecture', ['no modules found in the document store']);
  }

  const nums = modules.map(m => m.number);
  const expected = Array.from({ length: nums.length }, (_, i) => i);
  if (JSON.stringify(nums) !== JSON.stringify(expected)) {
    return bad('modules', 'Module Contiguity', 'Architecture', [
      `module numbering not contiguous: found ${nums}, expected 0..${nums.length - 1}`,
    ]);
  }

  const endStr = String(nums.length - 1).padStart(2, '0');
  res.messages.push(`${modules.length} modules contiguous (00..${endStr})`);
  if (opts.verbose) {
    res.details = modules.map(m => `module: ${m.filename}`);
  }
  return res;
}

// --- Check 2: Composition Build Sync ---
export function checkBuildSync(store: DocumentStore, opts: RunOptions = {}): CheckResult {
  const composed = () =>
    composeModules(sortedModules(store).map(m => ({ filename: m.filename, content: m.rawContent })));
  const expectedContent = composed();
  const currentContent = store.getParentComposed() ?? '';

  if (currentContent === expectedContent) {
    const lineCount = currentContent.split('\n').length;
    return ok('build', 'Composition Build Sync', 'Build Artifacts', `antigravity-reference.md is in sync (${lineCount} lines)`);
  }
  if (opts.fix && store.repair) {
    store.repair.rebuildParent();
    if (composed() === (store.getParentComposed() ?? '')) {
      return ok('build', 'Composition Build Sync', 'Build Artifacts', 'fixed: rebuilt antigravity-reference.md');
    }
  }
  return bad('build', 'Composition Build Sync', 'Build Artifacts', [
    'antigravity-reference.md is out of sync with reference/ (run npx tsx scripts/build.ts)',
  ]);
}

// --- Check 3: Table of Contents Sync ---
export function checkTocSync(store: DocumentStore, opts: RunOptions = {}): CheckResult {
  const modules = sortedModules(store);
  const preamble = modules.find(m => m.number === 0);
  if (!preamble) {
    return bad('toc', 'Table of Contents Sync', 'Documentation', ['preamble module (00) not found']);
  }

  const preambleDoc = MarkdownDoc.fromText(preamble.rawContent, preamble.filename);
  const tocSec = preambleDoc.getSection('Table of Contents');
  const tocSections: Record<number, string> = {};
  if (tocSec) {
    for (const line of tocSec.content.split(/\r?\n/)) {
      const m = line.trim().match(/^(\d+)\.\s+(.+)$/);
      if (m) {
        tocSections[parseInt(m[1], 10)] = m[2].trim();
      }
    }
  }

  const moduleSections: Record<number, string> = {};
  for (const mod of modules) {
    if (mod.number === 0) continue;
    const modDoc = MarkdownDoc.fromText(mod.rawContent, mod.filename);
    for (const h of modDoc.headings) {
      const hm = h.title.match(/^(\d+)\.\s+(.+)$/);
      if (hm && h.level === 2) {
        moduleSections[parseInt(hm[1], 10)] = hm[2].trim();
        break;
      }
    }
  }

  const mismatches: string[] = [];
  for (const secNo of Object.keys(moduleSections).map(Number).sort((a, b) => a - b)) {
    const modTitle = moduleSections[secNo];
    const tocTitle = tocSections[secNo];
    if (!tocTitle) {
      mismatches.push(`Section ${secNo} ('${modTitle}') missing from TOC in 00-preamble.md`);
    } else if (modTitle !== tocTitle) {
      mismatches.push(`Section ${secNo} title mismatch: TOC has '${tocTitle}', module has '${modTitle}'`);
    }
  }
  for (const secNo of Object.keys(tocSections).map(Number).sort((a, b) => a - b)) {
    if (!moduleSections[secNo]) {
      mismatches.push(`TOC has Section ${secNo} ('${tocSections[secNo]}') but no matching module exists`);
    }
  }

  if (mismatches.length > 0) {
    return bad('toc', 'Table of Contents Sync', 'Documentation', mismatches);
  }
  const res: CheckResult = {
    id: 'toc',
    name: 'Table of Contents Sync',
    category: 'Documentation',
    status: 'pass',
    messages: [`all ${Object.keys(moduleSections).length} TOC sections match module headings`],
    details: [],
  };
  if (opts.verbose) {
    res.details = Object.entries(moduleSections).map(([secNo, title]) => `§${secNo}: ${title}`);
  }
  return res;
}

// --- Check 4: Heading Hierarchy ---
export function checkHeadingHierarchy(store: DocumentStore, opts: RunOptions = {}): CheckResult {
  const invalidHeadings: string[] = [];
  for (const mod of sortedModules(store)) {
    const modDoc = MarkdownDoc.fromText(mod.rawContent, mod.filename);
    for (const err of modDoc.validateHeadingHierarchy()) {
      invalidHeadings.push(err);
    }
    for (const h of modDoc.headings) {
      if (/^\d+\.\d+/.test(h.title) && h.level === 2) {
        invalidHeadings.push(`${modDoc.filename}:${h.lineNumber} uses H2 for subsection: '${h.title}' (should be H3 '###')`);
      }
    }
  }

  if (invalidHeadings.length > 0) {
    return bad('headings', 'Heading Hierarchy', 'Style & Lint', invalidHeadings);
  }
  return ok('headings', 'Heading Hierarchy', 'Style & Lint', 'all section and subsection headings follow correct markdown hierarchy');
}

// --- Check 5: Source Archive & Manifest Sync ---
export function checkSourceArchiveSync(store: DocumentStore, opts: RunOptions = {}): CheckResult {
  const citations = store.getCitations();
  if (citations.length === 0) {
    return bad('sources', 'Source Archive Sync', 'Grounding', ['no citations loaded from 19-works-cited.md']);
  }

  const missing: string[] = [];
  for (const c of citations) {
    if (!c.isDuplicate && !store.canResolvePath(c.snapshotPath)) {
      missing.push(c.snapshotPath);
    }
  }

  const expectedManifest = buildManifestText(citations, p => store.getSnapshotHeader(p));
  const manifestInSync = store.getManifestText() !== null && store.getManifestText()?.trim() === expectedManifest.trim();

  if (missing.length > 0 || !manifestInSync) {
    if (opts.fix && store.repair) {
      store.repair.syncManifest();
      const afterMissing = citations.filter(c => !c.isDuplicate && !store.canResolvePath(c.snapshotPath));
      if (afterMissing.length === 0) {
        return ok('sources', 'Source Archive Sync', 'Grounding', 'fixed: regenerated evidence/sources/index.md');
      }
    }
    const messages = missing.map(p => `missing snapshot: ${p}`);
    if (!manifestInSync) {
      messages.push('archive manifest evidence/sources/index.md out of sync (run fetch_sources.ts)');
    }
    return bad('sources', 'Source Archive Sync', 'Grounding', messages);
  }

  const res: CheckResult = {
    id: 'sources',
    name: 'Source Archive Sync',
    category: 'Grounding',
    status: 'pass',
    messages: [`all ${citations.length} citations archived and index.md is in sync`],
    details: [],
  };
  if (opts.verbose) {
    res.details = citations.map(c =>
      `citation #${String(c.number).padStart(2, '0')} [${c.category}] ${c.title}${c.isDuplicate ? ` (dup of #${c.duplicateOf})` : ''}`
    );
  }
  return res;
}

// --- Check 6: Orphan Snapshot Detection ---
export function checkOrphanSnapshots(store: DocumentStore, opts: RunOptions = {}): CheckResult {
  const validPaths = new Set(
    store.getCitations().filter(c => !c.isDuplicate).map(c => normalizePath(c.snapshotPath))
  );
  const orphans = store.getSnapshotFiles().filter(f => !validPaths.has(normalizePath(f)));

  if (orphans.length > 0) {
    if (opts.fix && store.repair) {
      const pruned = store.repair.pruneOrphans();
      return ok('orphans', 'Orphan Snapshots', 'Grounding', `fixed: pruned ${pruned} orphaned snapshot(s)`);
    }
    return bad('orphans', 'Orphan Snapshots', 'Grounding', orphans.map(p => `orphaned snapshot: ${p}`));
  }
  return ok('orphans', 'Orphan Snapshots', 'Grounding', '0 orphaned snapshot files in evidence/sources/');
}

// --- Check 7: Relative Markdown Links ---
export function checkRelativeMarkdownLinks(store: DocumentStore, opts: RunOptions = {}): CheckResult {
  const brokenLinks: string[] = [];
  let checkedCount = 0;

  const scanTargets: { path: string; content: string | null }[] = [
    { path: 'antigravity-reference.md', content: store.getParentComposed() },
    { path: 'README.md', content: store.getDocument('README.md') },
    ...store.getModules().map(m => ({ path: m.filename, content: m.rawContent })),
  ];

  for (const target of scanTargets) {
    if (!target.content) continue;
    const baseDir = target.path.includes('/') ? target.path.slice(0, target.path.lastIndexOf('/')) : '';
    const doc = MarkdownDoc.fromText(target.content, target.path);

    for (let lineNo = 0; lineNo < doc.lines.length; lineNo++) {
      const line = doc.lines[lineNo];
      const linkMatches = line.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
      for (const m of linkMatches) {
        const linkTarget = m[2].trim();

        if (linkTarget.startsWith('http://') || linkTarget.startsWith('https://') || linkTarget.startsWith('#') || linkTarget.startsWith('mailto:')) {
          continue;
        }

        if (linkTarget.startsWith('file:///')) {
          let targetPath = linkTarget.slice('file://'.length);
          if (targetPath.includes('#')) {
            targetPath = targetPath.split('#')[0];
          }
          checkedCount++;
          const rel = normalizePath(targetPath);
          if (!store.canResolvePath(rel)) {
            brokenLinks.push(`${target.path}:${lineNo + 1} broken file:// link -> ${linkTarget}`);
          }
          continue;
        }

        const targetRel = linkTarget.split('#')[0];
        if (!targetRel) continue;

        const resolved = resolveRepoRelative(baseDir, targetRel);
        checkedCount++;
        if (!store.canResolvePath(resolved)) {
          brokenLinks.push(`${target.path}:${lineNo + 1} broken relative link -> '${linkTarget}' (resolved to: ${resolved})`);
        }
      }
    }
  }

  if (brokenLinks.length > 0) {
    return bad('links', 'Relative Markdown Links', 'Cross-References', brokenLinks);
  }
  return ok('links', 'Relative Markdown Links', 'Cross-References', `${checkedCount} relative documentation links verified`);
}

// --- Check 8: Live Evidence Grounding ---
export function checkEvidenceCitations(store: DocumentStore, opts: RunOptions = {}): CheckResult {
  const definedEvs = new Set(store.getProbes().map(p => p.evId));

  const citedEvs: Record<string, string[]> = {};
  for (const mod of sortedModules(store)) {
    const modDoc = MarkdownDoc.fromText(mod.rawContent, mod.filename);
    for (const evId of modDoc.findAllEvIds()) {
      if (!citedEvs[evId]) citedEvs[evId] = [];
      citedEvs[evId].push(modDoc.filename);
    }
  }

  const sortedCited = Object.keys(citedEvs).sort();
  const missingDefinitions = sortedCited.filter(ev => !definedEvs.has(ev));

  if (missingDefinitions.length > 0) {
    return bad('evidence', 'Live Evidence Grounding', 'Grounding', missingDefinitions.map(ev => {
      const filesList = Array.from(new Set(citedEvs[ev])).join(', ');
      return `cited evidence ${ev} in ${filesList} not defined in evidence/agy-1.1.12/evidence.md`;
    }));
  }
  const firstEv = sortedCited[0] || 'EV-001';
  const lastEv = sortedCited[sortedCited.length - 1] || 'EV-020';
  return ok(
    'evidence',
    'Live Evidence Grounding',
    'Grounding',
    `all ${sortedCited.length} cited EV IDs (${firstEv}..${lastEv}) are grounded in evidence.md`
  );
}

// --- Check 9: Native Schema Integrity & Catalog Sync ---
export function checkNativeSchemas(store: DocumentStore, opts: RunOptions = {}): CheckResult {
  const modules = sortedModules(store);
  const sec20Module = modules.find(m => m.number === 20);
  if (!sec20Module) {
    return bad('schemas', 'Native Schema Integrity', 'Schemas', ['Section 20 reference module (20) not found']);
  }

  const sec20Doc = MarkdownDoc.fromText(sec20Module.rawContent, sec20Module.filename);
  const matrixSec = sec20Doc.getSection(/^20\.2/);
  if (!matrixSec || matrixSec.tables.length === 0) {
    return bad('schemas', 'Native Schema Integrity', 'Schemas', ['could not find Section 20.2 schema catalog table']);
  }

  const matrixTable = matrixSec.tables[0];
  const expectedSchemas: Record<string, { index: number; key: string; name: string; model: string; category: string; target: string }> = {};

  for (const row of matrixTable.asDicts()) {
    const idxStr = (row['#'] || '').trim();
    if (!/^\d+$/.test(idxStr)) continue;
    const idx = parseInt(idxStr, 10);
    const schemaFile = (row['Exported JSON Schema File'] || '').trim();
    const filename = schemaFile.split('/').pop() || '';
    expectedSchemas[filename] = {
      index: idx,
      key: (row['Key'] || '').trim(),
      name: (row['Schema Name'] || '').trim(),
      model: (row['Pydantic Model Class'] || '').trim(),
      category: (row['Category'] || '').trim(),
      target: (row['Target File / Location'] || '').trim(),
    };
  }

  const errors: string[] = [];
  if (Object.keys(expectedSchemas).length !== 20) {
    errors.push(`expected 20 schemas from Section 20 matrix, parsed ${Object.keys(expectedSchemas).length}`);
  }

  const storeSchemas = new Map(store.getSchemas().map(s => [s.filename, s]));
  for (const [filename, meta] of Object.entries(expectedSchemas).sort((a, b) => a[1].index - b[1].index)) {
    const doc = storeSchemas.get(filename);
    if (!doc) {
      errors.push(`missing schema file: schemas/${filename}`);
      continue;
    }
    if (doc.error) {
      errors.push(`${filename}: invalid JSON (${doc.error})`);
      continue;
    }
    const data = doc.schema;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      errors.push(`${filename}: root must be a JSON object`);
      continue;
    }
    if (!('title' in data) && !('description' in data) && !('$ref' in data) && !('properties' in data) && !('additionalProperties' in data) && !('oneOf' in data) && !('anyOf' in data)) {
      errors.push(`${filename}: missing core JSON Schema descriptors`);
    }
  }

  const diskSchemas = store.getSchemas().map(s => s.filename);
  const expectedNames = new Set(Object.keys(expectedSchemas));
  for (const f of diskSchemas) {
    if (!expectedNames.has(f)) {
      errors.push(`untracked schema file in schemas/: ${f}`);
    }
  }

  if (errors.length > 0) {
    return bad('schemas', 'Native Schema Integrity', 'Schemas', errors);
  }
  const res: CheckResult = {
    id: 'schemas',
    name: 'Native Schema Integrity',
    category: 'Schemas',
    status: 'pass',
    messages: ['all 20 native JSON schemas valid and in sync with Section 20 catalog'],
    details: [],
  };
  if (opts.verbose) {
    res.details = Object.entries(expectedSchemas)
      .sort((a, b) => a[1].index - b[1].index)
      .map(([filename, meta]) => `#${String(meta.index).padStart(2, '0')} ${filename} -> ${meta.model} (${meta.category})`);
  }
  return res;
}

// --- Check 10: Schema-to-Doc Property Parity ---
export function checkSchemaPropertyParity(store: DocumentStore, opts: RunOptions = {}): CheckResult {
  const errors: string[] = [];
  const modules = new Map(sortedModules(store).map(m => [m.number, m]));
  const schemas = new Map(store.getSchemas().map(s => [s.filename, s.schema]));

  // 1. settings.schema.json against §5.5
  const cfgModule = modules.get(5);
  const settingsJson = schemas.get('settings.schema.json');
  if (cfgModule && settingsJson) {
    const cfgDoc = MarkdownDoc.fromText(cfgModule.rawContent, cfgModule.filename);
    const sec55 = cfgDoc.getSection('5.5 Complete settings.json Schema');
    if (sec55) {
      const docKeys = new Set<string>();
      for (const t of sec55.tables) {
        for (const k of t.columnValues('Key')) {
          docKeys.add(k);
        }
      }
      const schemaProps = new Set(Object.keys(settingsJson.properties || {}));
      for (const k of Array.from(docKeys).sort()) {
        const rootK = k.split('.')[0];
        if (!schemaProps.has(rootK)) {
          errors.push(`settings.schema.json missing documented property: '${k}' (from §5.5)`);
        }
      }
    }
    const cmdEnum = settingsJson.properties?.commandExecutionPolicy?.enum || [];
    for (const val of ['sandbox', 'auto', 'eager', 'off']) {
      if (!cmdEnum.includes(val)) {
        errors.push(`settings.schema.json commandExecutionPolicy missing enum: '${val}'`);
      }
    }
  }

  // 2. status_line.schema.json against §5.6
  const slJson = schemas.get('status_line.schema.json');
  if (cfgModule && slJson) {
    const cfgDoc = MarkdownDoc.fromText(cfgModule.rawContent, cfgModule.filename);
    const sec56 = cfgDoc.getSection('5.6 Status Line JSON Payload');
    if (sec56 && sec56.tables.length > 0) {
      const slTable = sec56.tables[0];
      const rawKeys = slTable.columnValues('Field');
      const slDocKeys = new Set<string>();
      for (const rk of rawKeys) {
        for (const subK of rk.split('/')) {
          slDocKeys.add(subK.trim());
        }
      }
      const slProps = new Set(Object.keys(slJson.properties || {}));
      for (const k of Array.from(slDocKeys).sort()) {
        if (!slProps.has(k)) {
          errors.push(`status_line.schema.json missing documented property: '${k}' (from §5.6)`);
        }
      }
    }
  }

  // 3. transcript_step.schema.json against §18.1
  const transcriptModule = modules.get(18);
  const tJson = schemas.get('transcript_step.schema.json');
  if (transcriptModule && tJson) {
    if (!Object.keys(tJson.properties || {}).includes('created_at')) {
      errors.push(`transcript_step.schema.json missing 'created_at' field documented in §18.1`);
    }
    const typeEnums = new Set(tJson.properties?.type?.enum || []);
    for (const coreType of ['USER_INPUT', 'PLANNER_RESPONSE', 'RUN_COMMAND', 'CHECKPOINT', 'VIEW_FILE', 'LIST_DIRECTORY']) {
      if (!typeEnums.has(coreType)) {
        errors.push(`transcript_step.schema.json missing verified 'type' enum: '${coreType}'`);
      }
    }
  }

  if (errors.length > 0) {
    return bad('parity', 'Schema-to-Doc Property Parity', 'Schemas', errors);
  }
  return ok('parity', 'Schema-to-Doc Property Parity', 'Schemas', 'all documented table properties and enums match native schema definitions');
}

// --- Check 11: Cross-Module Evidence Consistency ---
export function checkEvidenceConsistency(store: DocumentStore, opts: RunOptions = {}): CheckResult {
  const probes = store.getProbes();
  const maxEv = probes.length > 0 ? Math.max(...probes.map(p => p.number)) : 0;
  if (maxEv === 0) {
    return bad('consistency', 'Cross-Module Evidence Consistency', 'Consistency', ['no EV-### identifiers discovered in evidence.md']);
  }

  const errors: string[] = [];
  const modules = sortedModules(store);
  const worksCited = modules.find(m => m.number === 19);
  if (worksCited) {
    const worksCitedDoc = MarkdownDoc.fromText(worksCited.rawContent, worksCited.filename);
    const evSummaryMatch = worksCitedDoc.text.match(/EV-001\s+through\s+EV-(\d+)/);
    if (evSummaryMatch) {
      const citedMax = parseInt(evSummaryMatch[1], 10);
      if (citedMax !== maxEv) {
        errors.push(
          `19-works-cited.md evidence summary claims through EV-${String(citedMax).padStart(3, '0')}, ` +
          `expected through EV-${String(maxEv).padStart(3, '0')} (EV-001..EV-${String(maxEv).padStart(3, '0')})`
        );
      }
    } else {
      errors.push(`19-works-cited.md missing standard evidence summary header: 'EV-001 through EV-${String(maxEv).padStart(3, '0')}'`);
    }
  }

  const resolvedProbes = ['EV-020'];
  for (const probe of resolvedProbes) {
    const probeObj = probes.find(p => p.evId === probe);
    if (probeObj && ['CONFIRMED', 'RESOLVED', 'VERIFIED'].includes(probeObj.status)) {
      for (const mod of modules) {
        const modDoc = MarkdownDoc.fromText(mod.rawContent, mod.filename);
        if (modDoc.text.toLowerCase().includes(`${probe.toLowerCase()} confound unresolved`)) {
          errors.push(`${modDoc.filename} retains stale 'unresolved confound' text for ${probe}`);
        }
      }
    }
  }

  if (errors.length > 0) {
    return bad('consistency', 'Cross-Module Evidence Consistency', 'Consistency', errors);
  }
  return ok(
    'consistency',
    'Cross-Module Evidence Consistency',
    'Consistency',
    `evidence range (EV-001..EV-${String(maxEv).padStart(3, '0')}) and confound resolutions synchronized across all modules`
  );
}

// --- Check 12: Evidence Index & Probes Sync ---
export function checkEvidenceIndexSync(store: DocumentStore, opts: RunOptions = {}): CheckResult {
  const capability = store.checkEvidenceIndexSync;
  if (!capability) {
    return na('evidence-index', 'Evidence Index & Probes Sync', 'Consistency', 'not available in this store — run `npx tsx scripts/validate.ts`');
  }
  const result = capability();
  if (!result.inSync) {
    if (opts.fix && store.repair) {
      store.repair.regenerateEvidence();
      return ok('evidence-index', 'Evidence Index & Probes Sync', 'Consistency', 'fixed: evidence indexes and aggregate files synchronized');
    }
    return bad('evidence-index', 'Evidence Index & Probes Sync', 'Consistency', [
      result.message || 'evidence indexes or aggregate files out of sync (run npx tsx scripts/generate_evidence.ts)',
    ]);
  }
  return ok('evidence-index', 'Evidence Index & Probes Sync', 'Consistency', 'all probe, report, and master evidence indexes in sync');
}

export const CHECKS: Record<string, { name: string; category: string; run: (store: DocumentStore, opts?: RunOptions) => CheckResult }> = {
  modules: { name: 'Module Contiguity', category: 'Architecture', run: checkModuleContiguity },
  build: { name: 'Composition Build Sync', category: 'Build Artifacts', run: checkBuildSync },
  toc: { name: 'Table of Contents Sync', category: 'Documentation', run: checkTocSync },
  headings: { name: 'Heading Hierarchy', category: 'Style & Lint', run: checkHeadingHierarchy },
  sources: { name: 'Source Archive Sync', category: 'Grounding', run: checkSourceArchiveSync },
  orphans: { name: 'Orphan Snapshots', category: 'Grounding', run: checkOrphanSnapshots },
  links: { name: 'Relative Markdown Links', category: 'Cross-References', run: checkRelativeMarkdownLinks },
  evidence: { name: 'Live Evidence Grounding', category: 'Grounding', run: checkEvidenceCitations },
  schemas: { name: 'Native Schema Integrity', category: 'Schemas', run: checkNativeSchemas },
  parity: { name: 'Schema-to-Doc Property Parity', category: 'Schemas', run: checkSchemaPropertyParity },
  consistency: { name: 'Cross-Module Evidence Consistency', category: 'Consistency', run: checkEvidenceConsistency },
  'evidence-index': { name: 'Evidence Index & Probes Sync', category: 'Consistency', run: checkEvidenceIndexSync },
};

export function runChecks(store: DocumentStore, options: RunOptions & { only?: string } = {}): CheckResult[] {
  const selected = options.only ? [options.only] : Object.keys(CHECKS);
  const results: CheckResult[] = [];
  for (const key of selected) {
    const check = CHECKS[key];
    if (!check) {
      throw new Error(`unknown check '${key}'`);
    }
    results.push(check.run(store, options));
  }
  return results;
}
