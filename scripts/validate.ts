import * as fs from 'fs';
import * as path from 'path';
import { runChecks } from '../src/lib/integrityGate';
import type { DocumentStore, ModuleDoc, SchemaDoc, ProbeDoc, CitationDoc } from '../src/lib/documentStore';
import { extractHeadings } from '../src/lib/markdownCore';
import { EvidenceRegistry, readSnapshotHeader } from './lib/evidenceRegistry';
import { runEvidenceGeneration } from './generate_evidence';
import * as buildTool from './build';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'reference');
const PARENT_DOC = path.join(ROOT, 'antigravity-reference.md');
const SCHEMAS_DIR = path.join(ROOT, 'schemas');
const ARCHIVE_DIR = path.join(ROOT, 'evidence', 'sources');
const INDEX_PATH = path.join(ARCHIVE_DIR, 'index.md');
const README_PATH = path.join(ROOT, 'README.md');
const SNAPSHOT_CATEGORIES = ['docs', 'google', 'protocol', 'community'];

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

const registry = EvidenceRegistry.load(ROOT);

function loadModules(): ModuleDoc[] {
  const files = fs.readdirSync(SRC_DIR).filter(f => /^\d{2}-.*\.md$/.test(f)).sort();
  return files.map(f => {
    const rawContent = fs.readFileSync(path.join(SRC_DIR, f), 'utf-8');
    const m = f.match(/^(\d+)-(.*)\.md$/);
    const num = m ? parseInt(m[1], 10) : 0;
    const slug = m ? m[2] : f.replace('.md', '');
    const headings = extractHeadings(rawContent);
    const title = headings.find(h => h.level === 1)?.title || headings.find(h => h.level === 2)?.title || slug;
    return { filename: f, number: num, slug, title, rawContent };
  });
}

function loadSchemas(): SchemaDoc[] {
  return fs.readdirSync(SCHEMAS_DIR).filter(f => f.endsWith('.json')).map(f => {
    try {
      const schema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, f), 'utf-8'));
      return { filename: f, schema };
    } catch (e: any) {
      return { filename: f, error: e?.message || String(e) };
    }
  });
}

function loadProbes(): ProbeDoc[] {
  return registry.probes.map(p => ({ evId: p.evId, number: p.number, title: p.title, status: p.status }));
}

function loadCitations(): CitationDoc[] {
  return registry.citations.map(c => ({
    number: c.number,
    title: c.title,
    url: c.url,
    category: c.category,
    slug: c.slug,
    snapshotPath: path.relative(ROOT, c.snapshotPath),
    isDuplicate: c.isDuplicate,
    duplicateOf: c.duplicateOf ?? null,
  }));
}

function listSnapshotFiles(): string[] {
  const out: string[] = [];
  for (const cat of SNAPSHOT_CATEGORIES) {
    const catDir = path.join(ARCHIVE_DIR, cat);
    if (!fs.existsSync(catDir)) continue;
    for (const fname of fs.readdirSync(catDir)) {
      if (fname.endsWith('.md') && fname !== 'index.md') {
        out.push(path.relative(ROOT, path.join(catDir, fname)));
      }
    }
  }
  return out;
}

function readDoc(relPath: string): string | null {
  const abs = path.resolve(ROOT, relPath);
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, 'utf-8');
}

export function createFsStore(): DocumentStore {
  const store: DocumentStore = {
    getModules: loadModules,
    getSchemas: loadSchemas,
    getProbes: loadProbes,
    getCitations: loadCitations,
    getSnapshotFiles: listSnapshotFiles,
    getSnapshotHeader: (snapshotPath: string) => readSnapshotHeader(path.resolve(ROOT, snapshotPath)),
    getManifestText: () => (fs.existsSync(INDEX_PATH) ? fs.readFileSync(INDEX_PATH, 'utf-8') : null),
    getParentComposed: () => (fs.existsSync(PARENT_DOC) ? fs.readFileSync(PARENT_DOC, 'utf-8') : null),
    getDocument: (relPath: string) =>
      relPath === 'README.md' ? readDoc('README.md') : readDoc(relPath),
    canResolvePath: (relPath: string) => {
      const abs = path.resolve(ROOT, relPath);
      return fs.existsSync(abs);
    },
    checkEvidenceIndexSync: () => ({ inSync: runEvidenceGeneration(true) }),
    repair: {
      rebuildParent: () => {
        buildTool.doBuild();
      },
      pruneOrphans: () => {
        const orphans = registry.findOrphanSnapshots();
        for (const p of orphans) {
          fs.unlinkSync(p);
        }
        return orphans.length;
      },
      syncManifest: () => {
        registry.syncManifestFile();
      },
      regenerateEvidence: () => {
        runEvidenceGeneration(false);
      },
    },
  };
  return store;
}

export function runValidation(options: { verbose?: boolean; fix?: boolean; only?: string } = {}): number {
  const store = createFsStore();
  const results = runChecks(store, options);

  console.log(`\n${BOLD}Google Antigravity Repository Validation Suite [TypeScript Engine]${RESET}\n`);

  let allPassed = true;
  for (const result of results) {
    if (result.status === 'pass') {
      const statusTag = colored('[PASS]', GREEN);
      const msg = result.messages.length > 0 ? result.messages[0] : 'ok';
      console.log(`${statusTag} ${BOLD}${result.name}${RESET}: ${msg}`);
    } else if (result.status === 'na') {
      const statusTag = colored('[N/A]', YELLOW);
      const msg = result.messages.length > 0 ? result.messages[0] : 'not applicable';
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
