/**
 * Integrity Gate self-tests.
 *
 * 1. Fixture corpus: every check must pass on a clean store and fail (or go
 *    'na') when its specific invariant is violated — the interface is the test
 *    surface.
 * 2. Parity: the shared MarkdownDoc Core must agree with the CLI's docInspector
 *    adapter on the real corpus, and the browser's flat citation model must
 *    reproduce the Evidence Registry's manifest byte-for-byte.
 * 3. End-to-end: the gate passes on the real repository.
 */

import * as fs from 'fs';
import * as path from 'path';
import { runChecks, CHECKS } from '../src/lib/integrityGate';
import type { DocumentStore, ModuleDoc, SchemaDoc, ProbeDoc, CitationDoc, SnapshotInput } from '../src/lib/documentStore';
import {
  composeModules,
  buildManifestText,
  flattenCitations,
  normalizePath,
} from '../src/lib/documentStore';
import { MarkdownDoc as CoreMarkdownDoc, extractHeadings, parseFrontmatterMap } from '../src/lib/markdownCore';
import { MarkdownDoc as CliMarkdownDoc } from './lib/docInspector';
import { EvidenceRegistry, readSnapshotHeader } from './lib/evidenceRegistry';
import { parseSourceFrontmatter } from '../src/data/sourceProcessing';
import { createFsStore } from './validate';

const ROOT = process.cwd();
const CORPUS = path.join(ROOT, 'test/fixtures/corpus');

let failures = 0;
let assertions = 0;

function assert(cond: boolean, msg: string): void {
  assertions++;
  if (cond) {
    console.log(`  \x1b[32m[ok]\x1b[0m ${msg}`);
  } else {
    failures++;
    console.error(`  \x1b[31m[FAIL]\x1b[0m ${msg}`);
  }
}

function statusOf(results: { id: string; status: string }[], id: string): string {
  return results.find(r => r.id === id)?.status ?? 'missing';
}

// ---------------------------------------------------------------------------
// Fixture corpus
// ---------------------------------------------------------------------------

/** Structured corpus modules on disk; the rest (00 preamble + filler modules) are synthesized so the corpus is contiguous 00..20. */
const CORPUS_STRUCTURED = ['01-alpha.md', '05-config.md', '18-gaps.md', '19-works-cited.md', '20-schemas.md'];

const SECTION_TITLES: Record<number, string> = {
  1: 'Alpha Module',
  5: 'Config',
  18: 'Gaps',
  19: 'Works Cited',
  20: 'Schemas',
};

function readCorpusFile(rel: string): string {
  return fs.readFileSync(path.join(CORPUS, rel), 'utf-8');
}

function corpusModules(): ModuleDoc[] {
  const fromDisk = CORPUS_STRUCTURED.map(f => {
    const rawContent = readCorpusFile(`reference/${f}`);
    const m = f.match(/^(\d+)-(.*)\.md$/);
    const slug = m ? m[2] : f.replace('.md', '');
    const headings = extractHeadings(rawContent);
    const title = headings.find(h => h.level === 1)?.title || headings.find(h => h.level === 2)?.title || slug;
    return {
      filename: f,
      number: m ? parseInt(m[1], 10) : 0,
      slug,
      title,
      rawContent,
    };
  });
  const diskNums = new Set(fromDisk.map(m => m.number));

  const all: ModuleDoc[] = [];
  for (let n = 0; n <= 20; n++) {
    const numStr = String(n).padStart(2, '0');
    if (n === 0) {
      const tocLines = Array.from({ length: 20 }, (_, i) => `${i + 1}. ${SECTION_TITLES[i + 1] ?? `Filler ${i + 1}`}`).join('\n');
      all.push({
        filename: '00-preamble.md',
        number: 0,
        slug: 'preamble',
        title: 'Fixture Reference',
        rawContent: `# Fixture Reference\n\n## Table of Contents\n\n${tocLines}\n`,
      });
    } else if (diskNums.has(n)) {
      all.push(fromDisk.find(m => m.number === n)!);
    } else {
      all.push({
        filename: `${numStr}-filler.md`,
        number: n,
        slug: `filler-${n}`,
        title: `${n}. Filler ${n}`,
        rawContent: `## ${n}. Filler ${n}\n\nFiller content.\n`,
      });
    }
  }
  return all;
}

function fixtureSchemas(): SchemaDoc[] {
  const schemas: SchemaDoc[] = [
    {
      filename: 'settings.schema.json',
      schema: {
        title: 'Settings Config',
        description: 'x',
        properties: {
          commandExecutionPolicy: { type: 'string', enum: ['sandbox', 'auto', 'eager', 'off'] },
          agentConfig: { type: 'object' },
        },
      },
    },
    {
      filename: 'status_line.schema.json',
      schema: { title: 'Status Line', description: 'x', properties: { status: { type: 'string' }, project: { type: 'string' } } },
    },
    {
      filename: 'transcript_step.schema.json',
      schema: {
        title: 'Transcript Step',
        description: 'x',
        properties: {
          created_at: { type: 'string' },
          type: { type: 'string', enum: ['USER_INPUT', 'PLANNER_RESPONSE', 'RUN_COMMAND', 'CHECKPOINT', 'VIEW_FILE', 'LIST_DIRECTORY'] },
        },
      },
    },
  ];
  for (let i = 4; i <= 18; i++) {
    const name = `fixture_${String(i).padStart(2, '0')}`;
    schemas.push({ filename: `${name}.schema.json`, schema: { title: name, description: 'x', properties: {} } });
  }
  return schemas;
}

function corpusSnapshots(): SnapshotInput[] {
  const out: SnapshotInput[] = [];
  const root = path.join(CORPUS, 'evidence/sources');
  for (const cat of fs.readdirSync(root)) {
    const catDir = path.join(root, cat);
    if (!fs.statSync(catDir).isDirectory()) continue;
    for (const f of fs.readdirSync(catDir)) {
      if (f.endsWith('.md')) {
        out.push({ path: `evidence/sources/${cat}/${f}`, rawContent: fs.readFileSync(path.join(catDir, f), 'utf-8') });
      }
    }
  }
  return out;
}

interface FixtureOverrides {
  modules?: ModuleDoc[];
  schemas?: SchemaDoc[];
  probes?: ProbeDoc[];
  citations?: CitationDoc[];
  snapshotFiles?: string[];
  manifestText?: string | null;
  parentComposed?: string | null;
  /** null = omit the capability (check 12 -> na); undefined = in-sync stub. */
  evidenceIndexSync?: (() => { inSync: boolean; message?: string }) | null;
}

function buildFixtureStore(overrides: FixtureOverrides = {}): DocumentStore {
  const modules = overrides.modules ?? corpusModules();
  const schemas = overrides.schemas ?? fixtureSchemas();
  const snapshots = corpusSnapshots();
  const citations = overrides.citations ?? flattenCitations(snapshots, c => parseSourceFrontmatter(c));
  const snapshotFiles = overrides.snapshotFiles ?? snapshots.map(s => s.path);
  const parentComposed =
    overrides.parentComposed ?? composeModules(modules.map(m => ({ filename: m.filename, content: m.rawContent })));
  const manifestText =
    overrides.manifestText !== undefined
      ? overrides.manifestText
      : buildManifestText(citations, p => {
          const snap = snapshots.find(s => normalizePath(s.path) === normalizePath(p));
          if (!snap) return null;
          const meta = parseSourceFrontmatter(snap.rawContent);
          return { status: String(meta.status), fetched: meta.fetched };
        });

  const knownPaths = new Set<string>([
    ...modules.map(m => `reference/${m.filename}`),
    ...schemas.map(s => `schemas/${s.filename}`),
    'docs/adr/0001-test.md',
    'README.md',
    ...snapshotFiles,
    'evidence/sources/index.md',
    'antigravity-reference.md',
  ]);

  const docMap = new Map<string, string>();
  docMap.set('README.md', readCorpusFile('README.md'));
  for (const m of modules) docMap.set(`reference/${m.filename}`, m.rawContent);
  for (const s of snapshots) docMap.set(s.path, s.rawContent);
  docMap.set('evidence/sources/index.md', manifestText);
  docMap.set('antigravity-reference.md', parentComposed);

  const headers = new Map<string, { status: string; fetched: string }>();
  for (const s of snapshots) {
    const meta = parseSourceFrontmatter(s.rawContent);
    headers.set(normalizePath(s.path), { status: String(meta.status), fetched: meta.fetched });
  }

  const store: DocumentStore = {
    getModules: () => modules,
    getSchemas: () => schemas,
    getProbes: () => overrides.probes ?? [{ evId: 'EV-001', number: 1, title: 'Probe One', status: 'CONFIRMED' }],
    getCitations: () => citations,
    getSnapshotFiles: () => snapshotFiles,
    getSnapshotHeader: p => headers.get(normalizePath(p)) ?? null,
    getManifestText: () => manifestText,
    getParentComposed: () => parentComposed,
    getDocument: rel => docMap.get(normalizePath(rel)) ?? null,
    canResolvePath: rel => knownPaths.has(normalizePath(rel)),
  };
  const cap = overrides.evidenceIndexSync;
  if (cap === null) {
    // omit — check 12 reports na
  } else {
    store.checkEvidenceIndexSync = cap ?? (() => ({ inSync: true }));
  }
  return store;
}

// ---------------------------------------------------------------------------
// 1. Fixture corpus: every check fails when its invariant breaks
// ---------------------------------------------------------------------------

console.log('\n\x1b[1m=== Integrity Gate: fixture corpus ===\x1b[0m\n');

{
  const clean = runChecks(buildFixtureStore());
  for (const id of Object.keys(CHECKS)) {
    assert(statusOf(clean, id) === 'pass', `clean store: '${id}' passes (got ${statusOf(clean, id)})`);
  }
}

{
  const store = buildFixtureStore({ modules: corpusModules().filter(m => m.number !== 1) });
  assert(statusOf(runChecks(store), 'modules') === 'fail', 'modules: dropped module fails contiguity');
}

{
  const store = buildFixtureStore({ parentComposed: 'CORRUPTED' });
  assert(statusOf(runChecks(store), 'build') === 'fail', 'build: stale parent fails build sync');
}

{
  const store = buildFixtureStore({
    modules: corpusModules().map(m =>
      m.number === 0 ? { ...m, rawContent: m.rawContent.replace('1. Alpha Module', '1. Wrong Title') } : m
    ),
  });
  assert(statusOf(runChecks(store), 'toc') === 'fail', 'toc: TOC/module title mismatch fails');
}

{
  const store = buildFixtureStore({
    modules: corpusModules().map(m =>
      m.number === 1 ? { ...m, rawContent: '# Jumper\n\n### 1.1 Subsection\n\nText.\n' } : m
    ),
  });
  assert(statusOf(runChecks(store), 'headings') === 'fail', 'headings: H1->H3 jump fails');
}

{
  const store = buildFixtureStore({ snapshotFiles: [], manifestText: null });
  assert(statusOf(runChecks(store), 'sources') === 'fail', 'sources: missing snapshot + stale manifest fails');
}

{
  const store = buildFixtureStore({ snapshotFiles: ['evidence/sources/docs/01-hooks.md', 'evidence/sources/docs/99-orphan.md'] });
  assert(statusOf(runChecks(store), 'orphans') === 'fail', 'orphans: extra snapshot file fails');
}

{
  const store = buildFixtureStore({
    modules: corpusModules().map(m =>
      m.number === 1 ? { ...m, rawContent: m.rawContent + '\nSee (EV-099) findings.\n' } : m
    ),
  });
  assert(statusOf(runChecks(store), 'evidence') === 'fail', 'evidence: uncited EV-099 fails grounding');
}

{
  const store = buildFixtureStore({
    modules: corpusModules().map(m =>
      m.number === 1 ? { ...m, rawContent: m.rawContent + '\n[broken](../docs/missing.md)\n' } : m
    ),
  });
  assert(statusOf(runChecks(store), 'links') === 'fail', 'links: broken relative link fails');
}

{
  const store = buildFixtureStore({ schemas: fixtureSchemas().filter(s => s.filename !== 'settings.schema.json') });
  assert(statusOf(runChecks(store), 'schemas') === 'fail', 'schemas: missing catalog schema fails');
}

{
  const store = buildFixtureStore({
    schemas: fixtureSchemas().map(s =>
      s.filename === 'settings.schema.json'
        ? { ...s, schema: { ...s.schema, properties: { agentConfig: { type: 'object' } } } }
        : s
    ),
  });
  assert(statusOf(runChecks(store), 'parity') === 'fail', 'parity: schema/doc property drift fails');
}

{
  const store = buildFixtureStore({
    modules: corpusModules().map(m =>
      m.number === 19 ? { ...m, rawContent: m.rawContent.replace('EV-001 through EV-001', 'EV-001 through EV-002') } : m
    ),
  });
  assert(statusOf(runChecks(store), 'consistency') === 'fail', 'consistency: works-cited EV range mismatch fails');
}

{
  const store = buildFixtureStore({ evidenceIndexSync: () => ({ inSync: false }) });
  assert(statusOf(runChecks(store), 'evidence-index') === 'fail', 'evidence-index: out-of-sync capability fails');
}

{
  const store = buildFixtureStore({ evidenceIndexSync: null });
  assert(statusOf(runChecks(store), 'evidence-index') === 'na', 'evidence-index: missing capability reports na');
}

// ---------------------------------------------------------------------------
// 2. Parity: shared MarkdownDoc Core vs the CLI docInspector adapter
// ---------------------------------------------------------------------------

console.log('\n\x1b[1m=== Parser parity: markdownCore vs docInspector (real corpus) ===\x1b[0m\n');

{
  const realModules = fs.readdirSync(path.join(ROOT, 'reference')).filter(f => /^\d{2}-.*\.md$/.test(f)).sort();
  for (const f of realModules) {
    const abs = path.join(ROOT, 'reference', f);
    const core = CoreMarkdownDoc.fromText(fs.readFileSync(abs, 'utf-8'), f);
    const cli = CliMarkdownDoc.fromFile(abs);
    assert(
      JSON.stringify(core.headings.map(h => [h.level, h.title, h.lineNumber])) ===
        JSON.stringify(cli.headings.map(h => [h.level, h.title, h.lineNumber])),
      `parser parity: ${f} headings`
    );
    assert(
      core.sections.map(s => s.title).join('|') === cli.sections.map(s => s.title).join('|'),
      `parser parity: ${f} sections`
    );
    assert(core.tables.length === cli.tables.length, `parser parity: ${f} tables`);
  }
}

// ---------------------------------------------------------------------------
// 3. Parity: browser citation model vs Evidence Registry + manifest
// ---------------------------------------------------------------------------

console.log('\n\x1b[1m=== Citation model parity: browser store vs EvidenceRegistry (real corpus) ===\x1b[0m\n');

{
  const realSnapshots: SnapshotInput[] = [];
  for (const cat of ['docs', 'google', 'protocol', 'community']) {
    const dir = path.join(ROOT, 'evidence/sources', cat);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.md')) {
        realSnapshots.push({ path: `evidence/sources/${cat}/${f}`, rawContent: fs.readFileSync(path.join(dir, f), 'utf-8') });
      }
    }
  }

  // Frontmatter delegation: parseSourceFrontmatter must agree with the core parser.
  for (const snap of realSnapshots) {
    const core = parseFrontmatterMap(snap.rawContent);
    const typed = parseSourceFrontmatter(snap.rawContent);
    assert(
      core['title'] === typed.title && core['fetched'] === typed.fetched && core['status'] === String(typed.status),
      `frontmatter delegation: ${snap.path} (parseSourceFrontmatter uses the core parser)`
    );
  }

  const reg = EvidenceRegistry.load(ROOT);
  const browserCitations = flattenCitations(realSnapshots, c => parseSourceFrontmatter(c));
  const regByNum = new Map(reg.citations.map(c => [c.number, c]));
  let mismatch = 0;
  for (const c of browserCitations) {
    const r = regByNum.get(c.number);
    if (!r) {
      mismatch++;
      console.error(`  citation #${c.number} present in browser model, missing in registry`);
      continue;
    }
    if (r.title !== c.title || r.category !== c.category || r.isDuplicate !== c.isDuplicate || (r.duplicateOf ?? null) !== (c.duplicateOf ?? null)) {
      mismatch++;
      console.error(`  citation #${c.number} mismatch: title '${r.title}' vs '${c.title}', dup ${r.isDuplicate}/${c.isDuplicate}`);
    }
  }
  assert(mismatch === 0, `citation model parity: browser model matches EvidenceRegistry (${browserCitations.length} citations)`);

  const regManifest = reg.generateManifestText();
  const gateManifest = buildManifestText(browserCitations, p => readSnapshotHeader(path.resolve(ROOT, p)));
  assert(regManifest === gateManifest, 'manifest parity: buildManifestText reproduces generateManifestText byte-for-byte');
}

// ---------------------------------------------------------------------------
// 4. End-to-end: the gate passes on the real repository
// ---------------------------------------------------------------------------

console.log('\n\x1b[1m=== Integrity Gate on the real repository ===\x1b[0m\n');

{
  const realResults = runChecks(createFsStore());
  for (const r of realResults) {
    assert(r.status === 'pass', `real repo: '${r.id}' passes (got ${r.status})`);
  }
}

console.log(`\n\x1b[1mSummary:\x1b[0m ${assertions - failures} passed, ${failures} failed (${assertions} assertions)\n`);
process.exit(failures > 0 ? 1 : 0);
