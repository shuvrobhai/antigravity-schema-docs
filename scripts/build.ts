import * as fs from 'fs';
import * as path from 'path';
import { composeModules } from '../src/lib/documentStore';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'reference');
const OUT_PATH = path.join(ROOT, 'antigravity-reference.md');

export function getModulePaths(): string[] {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`error: directory ${SRC_DIR} does not exist`);
    process.exit(1);
  }

  const files = fs.readdirSync(SRC_DIR)
    .filter(f => /^\d{2}-.*\.md$/.test(f))
    .sort();

  if (files.length === 0) {
    console.error(`error: no modules found in ${SRC_DIR}/`);
    process.exit(1);
  }

  const nums = files.map(f => parseInt(f.slice(0, 2), 10));
  const expected = Array.from({ length: nums.length }, (_, i) => i);
  
  if (JSON.stringify(nums) !== JSON.stringify(expected)) {
    console.error(`error: module numbering not contiguous (found ${nums}); expected 0..${nums.length - 1}`);
    process.exit(1);
  }

  return files.map(f => path.join(SRC_DIR, f));
}

export function compose(): string {
  // Single home for composition: src/lib/documentStore.ts composeModules()
  // (trimEnd + leading-../ link rewrite + GEN_NOTE + separator join). The
  // Integrity Gate's build-sync check crosses the same pure function, so the
  // CLI build and the gate can never drift.
  const modules = getModulePaths().map(p => ({
    filename: path.basename(p),
    content: fs.readFileSync(p, 'utf-8'),
  }));
  return composeModules(modules);
}

export function writeOutput(text: string): void {
  const tmp = OUT_PATH + '.tmp';
  fs.writeFileSync(tmp, text, 'utf-8');
  fs.renameSync(tmp, OUT_PATH);
}

export function doBuild(): string {
  const text = compose();
  writeOutput(text);
  const lineCount = text.split('\n').length;
  console.log(`built ${path.basename(OUT_PATH)} (${lineCount} lines) from ${getModulePaths().length} modules [TS]`);
  return text;
}

export function checkSync(): boolean {
  let current = '';
  if (fs.existsSync(OUT_PATH)) {
    current = fs.readFileSync(OUT_PATH, 'utf-8');
  }
  const generated = compose();
  return current === generated;
}

// CLI Execution
if (process.argv[1]?.endsWith('build.ts')) {
  const args = process.argv.slice(2);
  if (args.includes('--check')) {
    if (checkSync()) {
      console.log('ok: antigravity-reference.md is in sync with reference/');
      process.exit(0);
    } else {
      console.error('stale: antigravity-reference.md differs from reference/ (run npx tsx scripts/build.ts)');
      process.exit(1);
    }
  } else if (args.includes('--watch')) {
    console.log(`watching ${SRC_DIR}/ for changes...`);
    doBuild();
    fs.watch(SRC_DIR, (eventType, filename) => {
      if (filename && /^\d{2}-.*\.md$/.test(filename)) {
        console.log(`change detected: ${filename}`);
        doBuild();
      }
    });
  } else {
    doBuild();
  }
}
