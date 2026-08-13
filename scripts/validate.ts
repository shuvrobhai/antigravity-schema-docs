import * as fs from 'fs';
import * as path from 'path';
import { MarkdownDoc } from './lib/docInspector';
import { EvidenceRegistry } from './lib/evidenceRegistry';
import * as buildTool from './build';
import { runEvidenceGeneration } from './generate_evidence';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'reference');
const PARENT_DOC = path.join(ROOT, 'antigravity-reference.md');
const PREAMBLE = path.join(SRC_DIR, '00-preamble.md');
const WORKS_CITED = path.join(SRC_DIR, '19-works-cited.md');
const SECTION_20 = path.join(SRC_DIR, '20-schema-toolkit-and-native-schemas.md');
const SCHEMAS_DIR = path.join(ROOT, 'schemas');
const ARCHIVE_DIR = path.join(ROOT, 'evidence', 'sources');
const INDEX_PATH = path.join(ARCHIVE_DIR, 'index.md');
const EVIDENCE_FILE = path.join(ROOT, 'evidence', 'agy-1.1.12', 'evidence.md');

// ANSI color styling
const GREEN = '\x1b[92m';
const RED = '\x1b[91m';
const YELLOW = '\x1b[93m';
const CYAN = '\x1b[96m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function colored(text: string, color: string): string {
  if (!process.stdout.isTTY) {
    return text;
  }
  return `${color}${text}${RESET}`;
}

export class ValidationResult {
  name: string;
  passed: boolean = true;
  messages: string[] = [];
  details: string[] = [];

  constructor(name: string) {
    this.name = name;
  }

  passWith(msg: string): void {
    this.messages.push(msg);
  }

  failWith(msg: string): void {
    this.passed = false;
    this.messages.push(msg);
  }

  addDetail(detail: string): void {
    this.details.push(detail);
  }
}

// --- Check 1: Module Contiguity ---
export function checkModuleContiguity(fix: boolean, verbose: boolean): ValidationResult {
  const res = new ValidationResult('Module Contiguity');
  if (!fs.existsSync(SRC_DIR)) {
    res.failWith(`directory ${SRC_DIR} does not exist`);
    return res;
  }

  const files = fs.readdirSync(SRC_DIR).filter(f => /^\d{2}-.*\.md$/.test(f)).sort();
  if (files.length === 0) {
    res.failWith(`no modules found matching ${SRC_DIR}/[0-9][0-9]-*.md`);
    return res;
  }

  const nums = files.map(f => parseInt(f.slice(0, 2), 10));
  const expected = Array.from({ length: nums.length }, (_, i) => i);
  if (JSON.stringify(nums) !== JSON.stringify(expected)) {
    res.failWith(`module numbering not contiguous: found ${nums}, expected 0..${nums.length - 1}`);
  } else {
    const endStr = String(nums.length - 1).padStart(2, '0');
    res.passWith(`${files.length} modules contiguous (00..${endStr})`);
  }

  if (verbose) {
    for (const f of files) {
      res.addDetail(`module: ${f}`);
    }
  }
  return res;
}

// --- Check 2: Composition Build Sync ---
export function checkBuildSync(fix: boolean, verbose: boolean): ValidationResult {
  const res = new ValidationResult('Composition Build Sync');
  const expectedContent = buildTool.compose();
  let currentContent = '';
  if (fs.existsSync(PARENT_DOC)) {
    currentContent = fs.readFileSync(PARENT_DOC, 'utf-8');
  }

  if (currentContent === expectedContent) {
    const lineCount = currentContent.split('\n').length;
    res.passWith(`${path.basename(PARENT_DOC)} is in sync (${lineCount} lines)`);
  } else {
    if (fix) {
      buildTool.doBuild();
      res.passWith(`fixed: rebuilt ${path.basename(PARENT_DOC)}`);
    } else {
      res.failWith(`${path.basename(PARENT_DOC)} is out of sync with reference/ (run npx tsx scripts/build.ts)`);
    }
  }
  return res;
}

// --- Check 3: Table of Contents Sync ---
export function checkTocSync(fix: boolean, verbose: boolean): ValidationResult {
  const res = new ValidationResult('Table of Contents Sync');
  if (!fs.existsSync(PREAMBLE)) {
    res.failWith(`preamble not found at ${PREAMBLE}`);
    return res;
  }

  const preambleDoc = MarkdownDoc.fromFile(PREAMBLE);
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
  const files = fs.readdirSync(SRC_DIR).filter(f => /^\d{2}-.*\.md$/.test(f)).sort();
  for (const f of files) {
    if (f.startsWith('00-')) continue;
    const modDoc = MarkdownDoc.fromFile(path.join(SRC_DIR, f));
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
    for (const err of mismatches) {
      res.failWith(err);
    }
  } else {
    res.passWith(`all ${Object.keys(moduleSections).length} TOC sections match module headings`);
  }

  if (verbose) {
    for (const [secNo, title] of Object.entries(moduleSections)) {
      res.addDetail(`§${secNo}: ${title}`);
    }
  }
  return res;
}

// --- Check 4: Heading Hierarchy ---
export function checkHeadingHierarchy(fix: boolean, verbose: boolean): ValidationResult {
  const res = new ValidationResult('Heading Hierarchy');
  const files = fs.readdirSync(SRC_DIR).filter(f => /^\d{2}-.*\.md$/.test(f)).sort();
  const invalidHeadings: string[] = [];

  for (const f of files) {
    const modDoc = MarkdownDoc.fromFile(path.join(SRC_DIR, f));
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
    for (const err of invalidHeadings) {
      res.failWith(err);
    }
  } else {
    res.passWith('all section and subsection headings follow correct markdown hierarchy');
  }
  return res;
}

// --- Check 5: Source Archive & Manifest Sync ---
export function checkSourceArchiveSync(fix: boolean, verbose: boolean): ValidationResult {
  const res = new ValidationResult('Source Archive Sync');
  const reg = EvidenceRegistry.load(ROOT);
  if (reg.citations.length === 0) {
    res.failWith('no citations loaded from 19-works-cited.md');
    return res;
  }

  const missing = reg.findMissingSnapshots();
  if (missing.length > 0) {
    for (const p of missing) {
      res.failWith(`missing snapshot: ${path.relative(ROOT, p)}`);
    }
  }

  if (!reg.isManifestInSync()) {
    if (fix) {
      reg.syncManifestFile();
      res.passWith(`fixed: regenerated ${path.relative(ROOT, reg.indexPath)}`);
    } else {
      res.failWith(`archive manifest ${path.relative(ROOT, reg.indexPath)} out of sync (run fetch_sources.ts)`);
    }
  } else {
    res.passWith(`all ${reg.citations.length} citations archived and index.md is in sync`);
  }

  if (verbose) {
    for (const c of reg.citations) {
      const dup = c.isDuplicate ? ` (dup of #${c.duplicateOf})` : '';
      res.addDetail(`citation #${String(c.number).padStart(2, '0')} [${c.category}] ${c.title}${dup}`);
    }
  }
  return res;
}

// --- Check 6: Orphan Snapshot Detection ---
export function checkOrphanSnapshots(fix: boolean, verbose: boolean): ValidationResult {
  const res = new ValidationResult('Orphan Snapshots');
  const reg = EvidenceRegistry.load(ROOT);
  const orphans = reg.findOrphanSnapshots();
  if (orphans.length > 0) {
    if (fix) {
      for (const p of orphans) {
        fs.unlinkSync(p);
      }
      res.passWith(`fixed: pruned ${orphans.length} orphaned snapshot(s)`);
    } else {
      for (const p of orphans) {
        res.failWith(`orphaned snapshot: ${path.relative(ROOT, p)}`);
      }
    }
  } else {
    res.passWith('0 orphaned snapshot files in evidence/sources/');
  }
  return res;
}

// --- Check 7: Relative Markdown Links ---
export function checkRelativeMarkdownLinks(fix: boolean, verbose: boolean): ValidationResult {
  const res = new ValidationResult('Relative Markdown Links');
  const brokenLinks: string[] = [];
  let checkedCount = 0;

  const mdFiles = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.md')).sort().map(f => path.join(SRC_DIR, f));
  const scanTargets = [PARENT_DOC, path.join(ROOT, 'README.md'), ...mdFiles];

  for (const filePath of scanTargets) {
    if (!fs.existsSync(filePath)) continue;
    const baseDir = path.dirname(path.resolve(filePath));
    const doc = MarkdownDoc.fromFile(filePath);

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
          if (!fs.existsSync(targetPath)) {
            brokenLinks.push(`${doc.filename}:${lineNo + 1} broken file:// link -> ${linkTarget}`);
          }
          continue;
        }

        const targetRel = linkTarget.split('#')[0];
        if (!targetRel) continue;

        const resolved = path.normalize(path.join(baseDir, targetRel));
        checkedCount++;
        if (!fs.existsSync(resolved)) {
          brokenLinks.push(`${doc.filename}:${lineNo + 1} broken relative link -> '${linkTarget}' (resolved to: ${resolved})`);
        }
      }
    }
  }

  if (brokenLinks.length > 0) {
    for (const err of brokenLinks) {
      res.failWith(err);
    }
  } else {
    res.passWith(`${checkedCount} relative documentation links verified`);
  }
  return res;
}

// --- Check 8: Live Evidence Grounding ---
export function checkEvidenceCitations(fix: boolean, verbose: boolean): ValidationResult {
  const res = new ValidationResult('Live Evidence Grounding');
  if (!fs.existsSync(EVIDENCE_FILE)) {
    res.failWith(`master evidence file missing: ${path.relative(ROOT, EVIDENCE_FILE)}`);
    return res;
  }

  const reg = EvidenceRegistry.load(ROOT);
  const definedEvs = new Set(reg.probes.map(p => p.evId));

  const citedEvs: Record<string, string[]> = {};
  const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.md')).sort();
  for (const f of files) {
    const modDoc = MarkdownDoc.fromFile(path.join(SRC_DIR, f));
    for (const evId of modDoc.findAllEvIds()) {
      if (!citedEvs[evId]) citedEvs[evId] = [];
      citedEvs[evId].push(modDoc.filename);
    }
  }

  const sortedCited = Object.keys(citedEvs).sort();
  const missingDefinitions = sortedCited.filter(ev => !definedEvs.has(ev));

  if (missingDefinitions.length > 0) {
    for (const ev of missingDefinitions) {
      const filesList = Array.from(new Set(citedEvs[ev])).join(', ');
      res.failWith(`cited evidence ${ev} in ${filesList} not defined in ${path.basename(EVIDENCE_FILE)}`);
    }
  } else {
    const firstEv = sortedCited[0] || 'EV-001';
    const lastEv = sortedCited[sortedCited.length - 1] || 'EV-020';
    res.passWith(`all ${sortedCited.length} cited EV IDs (${firstEv}..${lastEv}) are grounded in ${path.basename(EVIDENCE_FILE)}`);
  }

  if (verbose) {
    for (const ev of sortedCited) {
      res.addDetail(`${ev}: cited in ${Array.from(new Set(citedEvs[ev])).join(', ')}`);
    }
  }
  return res;
}

// --- Check 9: Native Schema Integrity & Catalog Sync ---
export function checkNativeSchemas(fix: boolean, verbose: boolean): ValidationResult {
  const res = new ValidationResult('Native Schema Integrity');
  if (!fs.existsSync(SCHEMAS_DIR)) {
    res.failWith(`schemas directory missing: ${path.relative(ROOT, SCHEMAS_DIR)}`);
    return res;
  }

  if (!fs.existsSync(SECTION_20)) {
    res.failWith(`Section 20 reference missing: ${path.relative(ROOT, SECTION_20)}`);
    return res;
  }

  const sec20Doc = MarkdownDoc.fromFile(SECTION_20);
  const matrixSec = sec20Doc.getSection('20.2 Complete 18 Native Schemas');
  if (!matrixSec || matrixSec.tables.length === 0) {
    res.failWith('could not find Section 20.2 schema catalog table');
    return res;
  }

  const matrixTable = matrixSec.tables[0];
  const expectedSchemas: Record<string, { index: number; key: string; name: string; model: string; category: string; target: string }> = {};

  for (const row of matrixTable.asDicts()) {
    const idxStr = (row['#'] || '').trim();
    if (!/^\d+$/.test(idxStr)) continue;
    const idx = parseInt(idxStr, 10);
    const schemaFile = (row['Exported JSON Schema File'] || '').trim();
    const filename = path.basename(schemaFile);
    expectedSchemas[filename] = {
      index: idx,
      key: (row['Key'] || '').trim(),
      name: (row['Schema Name'] || '').trim(),
      model: (row['Pydantic Model Class'] || '').trim(),
      category: (row['Category'] || '').trim(),
      target: (row['Target File / Location'] || '').trim(),
    };
  }

  if (Object.keys(expectedSchemas).length !== 18) {
    res.failWith(`expected 18 schemas from Section 20 matrix, parsed ${Object.keys(expectedSchemas).length}`);
  }

  const missingFiles: string[] = [];
  const invalidJson: string[] = [];

  for (const [filename, meta] of Object.entries(expectedSchemas).sort((a, b) => a[1].index - b[1].index)) {
    const filePath = path.join(SCHEMAS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(filename);
      continue;
    }

    let data: any;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e: any) {
      invalidJson.push(`${filename}: invalid JSON (${e.message})`);
      continue;
    }

    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      invalidJson.push(`${filename}: root must be a JSON object`);
      continue;
    }

    if (!('title' in data) && !('description' in data) && !('$ref' in data) && !('properties' in data) && !('additionalProperties' in data)) {
      invalidJson.push(`${filename}: missing core JSON Schema descriptors`);
      continue;
    }

    if (verbose) {
      res.addDetail(`#${String(meta.index).padStart(2, '0')} ${filename} -> ${meta.model} (${meta.category})`);
    }
  }

  const diskSchemas = fs.readdirSync(SCHEMAS_DIR).filter(f => f.endsWith('.json'));
  const expectedNames = new Set(Object.keys(expectedSchemas));
  const orphanSchemas = diskSchemas.filter(f => !expectedNames.has(f));

  if (missingFiles.length > 0) {
    for (const f of missingFiles) res.failWith(`missing schema file: schemas/${f}`);
  }
  if (invalidJson.length > 0) {
    for (const err of invalidJson) res.failWith(err);
  }
  if (orphanSchemas.length > 0) {
    for (const f of orphanSchemas) res.failWith(`untracked schema file in schemas/: ${f}`);
  }

  if (missingFiles.length === 0 && invalidJson.length === 0 && orphanSchemas.length === 0 && Object.keys(expectedSchemas).length === 18) {
    res.passWith('all 18 native JSON schemas valid and in sync with Section 20 catalog');
  }

  return res;
}

// --- Check 10: Schema-to-Doc Property Parity ---
export function checkSchemaPropertyParity(fix: boolean, verbose: boolean): ValidationResult {
  const res = new ValidationResult('Schema-to-Doc Property Parity');

  // 1. Verify settings.schema.json against reference/05-configuration-system.md §5.5
  const settingsDocPath = path.join(SRC_DIR, '05-configuration-system.md');
  const settingsSchemaPath = path.join(SCHEMAS_DIR, 'settings.schema.json');
  if (fs.existsSync(settingsDocPath) && fs.existsSync(settingsSchemaPath)) {
    const cfgDoc = MarkdownDoc.fromFile(settingsDocPath);
    const settingsJson = JSON.parse(fs.readFileSync(settingsSchemaPath, 'utf-8'));

    const sec55 = cfgDoc.getSection('5.5 Complete settings.json Schema');
    if (sec55) {
      const docKeys = new Set<string>();
      for (const t of sec55.tables) {
        for (const k of t.columnValues('Key')) {
          docKeys.add(k);
        }
      }
      const schemaProps = new Set(Object.keys(settingsJson.properties || {}));

      const missingInSchema: string[] = [];
      for (const k of Array.from(docKeys).sort()) {
        const rootK = k.split('.')[0];
        if (!schemaProps.has(rootK)) {
          missingInSchema.push(k);
        }
      }

      if (missingInSchema.length > 0) {
        for (const k of missingInSchema) {
          res.failWith(`settings.schema.json missing documented property: '${k}' (from §5.5)`);
        }
      } else if (verbose) {
        res.addDetail(`settings.schema.json covers all documented §5.5 keys (${docKeys.size} fields verified)`);
      }
    }

    // Check critical enums in settings
    const cmdEnum = settingsJson.properties?.commandExecutionPolicy?.enum || [];
    for (const val of ['sandbox', 'auto', 'eager', 'off']) {
      if (!cmdEnum.includes(val)) {
        res.failWith(`settings.schema.json commandExecutionPolicy missing enum: '${val}'`);
      }
    }
  }

  // 2. Verify status_line.schema.json against reference/05-configuration-system.md §5.6
  const statuslineSchemaPath = path.join(SCHEMAS_DIR, 'status_line.schema.json');
  if (fs.existsSync(settingsDocPath) && fs.existsSync(statuslineSchemaPath)) {
    const cfgDoc = MarkdownDoc.fromFile(settingsDocPath);
    const slJson = JSON.parse(fs.readFileSync(statuslineSchemaPath, 'utf-8'));

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
      const missingSl = Array.from(slDocKeys).sort().filter(k => !slProps.has(k));
      if (missingSl.length > 0) {
        for (const k of missingSl) {
          res.failWith(`status_line.schema.json missing documented property: '${k}' (from §5.6)`);
        }
      } else if (verbose) {
        res.addDetail(`status_line.schema.json covers all documented §5.6 fields (${slDocKeys.size} verified)`);
      }
    }
  }

  // 3. Verify transcript_step.schema.json against reference/18-remaining-hard-gaps.md §18.1
  const transcriptDocPath = path.join(SRC_DIR, '18-remaining-hard-gaps.md');
  const transcriptSchemaPath = path.join(SCHEMAS_DIR, 'transcript_step.schema.json');
  if (fs.existsSync(transcriptDocPath) && fs.existsSync(transcriptSchemaPath)) {
    const tJson = JSON.parse(fs.readFileSync(transcriptSchemaPath, 'utf-8'));
    const tProps = new Set(Object.keys(tJson.properties || {}));

    if (!tProps.has('created_at')) {
      res.failWith("transcript_step.schema.json missing 'created_at' field documented in §18.1");
    }

    const typeEnums = new Set(tJson.properties?.type?.enum || []);
    for (const coreType of ['USER_INPUT', 'PLANNER_RESPONSE', 'RUN_COMMAND', 'CHECKPOINT', 'VIEW_FILE', 'LIST_DIRECTORY']) {
      if (!typeEnums.has(coreType)) {
        res.failWith(`transcript_step.schema.json missing verified 'type' enum: '${coreType}'`);
      }
    }
    if (verbose) {
      res.addDetail(`transcript_step.schema.json covers all verified §18.1 fields and ${typeEnums.size} type enums`);
    }
  }

  if (res.passed) {
    res.passWith('all documented table properties and enums match native schema definitions');
  }

  return res;
}

// --- Check 11: Cross-Module Evidence Consistency ---
export function checkEvidenceConsistency(fix: boolean, verbose: boolean): ValidationResult {
  const res = new ValidationResult('Cross-Module Evidence Consistency');
  if (!fs.existsSync(EVIDENCE_FILE)) {
    res.failWith(`master evidence file missing: ${path.relative(ROOT, EVIDENCE_FILE)}`);
    return res;
  }

  const reg = EvidenceRegistry.load(ROOT);
  const maxEv = reg.maxEvidenceNumber;
  if (maxEv === 0) {
    res.failWith(`no EV-### identifiers discovered in ${path.basename(EVIDENCE_FILE)}`);
    return res;
  }

  const expectedRange = reg.evidenceRange;

  // Verify 19-works-cited.md summary header
  if (fs.existsSync(WORKS_CITED)) {
    const worksCitedDoc = MarkdownDoc.fromFile(WORKS_CITED);
    const evSummaryMatch = worksCitedDoc.text.match(/EV-001\s+through\s+EV-(\d+)/);
    if (evSummaryMatch) {
      const citedMax = parseInt(evSummaryMatch[1], 10);
      if (citedMax !== maxEv) {
        const citedPadded = String(citedMax).padStart(3, '0');
        const maxPadded = String(maxEv).padStart(3, '0');
        res.failWith(
          `19-works-cited.md evidence summary claims through EV-${citedPadded}, expected through EV-${maxPadded} (${expectedRange})`
        );
      }
    } else {
      const maxPadded = String(maxEv).padStart(3, '0');
      res.failWith(`19-works-cited.md missing standard evidence summary header: 'EV-001 through EV-${maxPadded}'`);
    }
  }

  // Verify no stale unresolved confound claims exist for resolved probes (e.g. EV-020)
  const resolvedProbes = ['EV-020'];
  for (const probe of resolvedProbes) {
    const probeObj = reg.getProbe(probe);
    if (probeObj && probeObj.status === 'CONFIRMED') {
      const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.md'));
      for (const f of files) {
        const modDoc = MarkdownDoc.fromFile(path.join(SRC_DIR, f));
        if (modDoc.text.toLowerCase().includes(`${probe.toLowerCase()} confound unresolved`)) {
          res.failWith(`${modDoc.filename} retains stale 'unresolved confound' text for ${probe}`);
        }
      }
    }
  }

  if (res.passed) {
    res.passWith(`evidence range (${expectedRange}) and confound resolutions synchronized across all modules`);
  }

  return res;
}

// --- Check 12: Evidence Index & Probes Sync ---
export function checkEvidenceIndexSync(fix: boolean, verbose: boolean): ValidationResult {
  const res = new ValidationResult('Evidence Index & Probes Sync');
  if (fix) {
    runEvidenceGeneration(false);
    res.passWith('evidence indexes and aggregate files synchronized');
  } else {
    const inSync = runEvidenceGeneration(true);
    if (!inSync) {
      res.failWith('evidence indexes or aggregate files out of sync (run npx tsx scripts/generate_evidence.ts)');
    } else {
      res.passWith('all probe, report, and master evidence indexes in sync');
    }
  }
  return res;
}

export const CHECKS: Record<string, [string, (fix: boolean, verbose: boolean) => ValidationResult]> = {
  modules: ['Module Contiguity', checkModuleContiguity],
  build: ['Composition Build Sync', checkBuildSync],
  toc: ['Table of Contents Sync', checkTocSync],
  headings: ['Heading Hierarchy', checkHeadingHierarchy],
  sources: ['Source Archive Sync', checkSourceArchiveSync],
  orphans: ['Orphan Snapshots', checkOrphanSnapshots],
  links: ['Relative Markdown Links', checkRelativeMarkdownLinks],
  evidence: ['Live Evidence Grounding', checkEvidenceCitations],
  schemas: ['Native Schema Integrity', checkNativeSchemas],
  parity: ['Schema-to-Doc Property Parity', checkSchemaPropertyParity],
  consistency: ['Cross-Module Evidence Consistency', checkEvidenceConsistency],
  'evidence-index': ['Evidence Index & Probes Sync', checkEvidenceIndexSync],
};

export function runValidation(options: { verbose?: boolean; fix?: boolean; only?: string } = {}): number {
  const selectedChecks = options.only ? [options.only] : Object.keys(CHECKS);

  console.log(`\n${BOLD}Google Antigravity Repository Validation Suite [TypeScript Engine]${RESET}\n`);

  let allPassed = true;
  for (const key of selectedChecks) {
    const checkTuple = CHECKS[key];
    if (!checkTuple) {
      console.error(colored(`error: unknown check '${key}'`, RED));
      return 1;
    }
    const [title, func] = checkTuple;
    const result = func(Boolean(options.fix), Boolean(options.verbose));
    if (result.passed) {
      const statusTag = colored('[PASS]', GREEN);
      const msg = result.messages.length > 0 ? result.messages[0] : 'ok';
      console.log(`${statusTag} ${BOLD}${result.name}${RESET}: ${msg}`);
    } else {
      const statusTag = colored('[FAIL]', RED);
      allPassed = false;
      console.log(`${statusTag} ${BOLD}${result.name}${RESET}`);
      for (const msg of result.messages) {
        console.log(`       ${colored('error:', RED)} ${msg}`);
      }
    }

    if (options.verbose && result.details.length > 0) {
      for (const d of result.details) {
        console.log(`       ${colored('·', CYAN)} ${d}`);
      }
    }
  }

  console.log();
  if (allPassed) {
    console.log(`${colored('✓ All validation checks passed cleanly.', GREEN)}\n`);
    return 0;
  } else {
    console.log(`${colored('✗ Some validation checks failed.', RED)} Use --fix or review errors above.\n`);
    return 1;
  }
}

// CLI Execution
if (process.argv[1]?.endsWith('validate.ts')) {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const fix = args.includes('--fix');
  let only: string | undefined;
  const onlyIdx = args.indexOf('--only');
  if (onlyIdx !== -1 && onlyIdx + 1 < args.length) {
    only = args[onlyIdx + 1];
  }

  const exitCode = runValidation({ verbose, fix, only });
  process.exit(exitCode);
}
