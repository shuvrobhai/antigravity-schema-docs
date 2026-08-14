/**
 * evidenceRegistry.ts — Node.js File System Adapter for EvidenceRegistry.
 *
 * Provides fs-backed factory and file synchronization methods over the pure
 * EvidenceRegistry domain module in src/lib/evidenceRegistry.ts.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  EvidenceRegistry as PureEvidenceRegistry,
  type Citation,
  type EvidenceProbe,
  type RawSourceInput,
  slugFor,
  slugifyTitle,
  normalizeCanonicalUrl,
  parseSnapshotHeader,
  parseSourceFrontmatter,
  TAG_FOLDER,
  GEN_NOTE,
} from '../../src/lib/evidenceRegistry';

export type { Citation, EvidenceProbe, RawSourceInput };
export {
  slugFor,
  slugifyTitle,
  normalizeCanonicalUrl,
  parseSnapshotHeader,
  parseSourceFrontmatter,
  TAG_FOLDER,
  GEN_NOTE,
};

export function readSnapshotHeader(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const text = fs.readFileSync(filePath, 'utf-8');
  return parseSnapshotHeader(text);
}

export class EvidenceRegistry extends PureEvidenceRegistry {
  rootDir: string;
  archiveDir: string;
  indexPath: string;

  constructor(
    citations: Map<number, Citation>,
    probes: Map<string, EvidenceProbe>,
    rootDir: string,
    snapshots?: Map<string, { rawContent: string; header: Record<string, string> }>
  ) {
    super(citations, probes, snapshots);
    this.rootDir = rootDir;
    this.archiveDir = path.join(rootDir, 'evidence', 'sources');
    this.indexPath = path.join(this.archiveDir, 'index.md');
  }

  static load(rootDir?: string): EvidenceRegistry {
    if (!rootDir) {
      rootDir = process.cwd();
    }

    const worksCitedPath = path.join(rootDir, 'reference', '19-works-cited.md');
    const evidencePath = path.join(rootDir, 'evidence', 'agy-1.1.12', 'evidence.md');
    const archiveDir = path.join(rootDir, 'evidence', 'sources');

    const worksCitedText = fs.existsSync(worksCitedPath) ? fs.readFileSync(worksCitedPath, 'utf-8') : '';
    const evidenceText = fs.existsSync(evidencePath) ? fs.readFileSync(evidencePath, 'utf-8') : '';

    const snapshots: RawSourceInput[] = [];
    if (fs.existsSync(archiveDir)) {
      for (const cat of ['docs', 'google', 'protocol', 'community']) {
        const catDir = path.join(archiveDir, cat);
        if (fs.existsSync(catDir)) {
          const files = fs.readdirSync(catDir);
          for (const f of files) {
            if (f.endsWith('.md') && f !== 'index.md') {
              const fullP = path.join(catDir, f);
              const relP = `evidence/sources/${cat}/${f}`;
              snapshots.push({
                path: relP,
                rawContent: fs.readFileSync(fullP, 'utf-8'),
              });
            }
          }
        }
      }
    }

    const pure = PureEvidenceRegistry.fromTexts({
      worksCitedText,
      evidenceText,
      snapshots,
    });

    const snapshotsMap = new Map<string, { rawContent: string; header: Record<string, string> }>();
    for (const s of snapshots) {
      snapshotsMap.set(s.path, {
        rawContent: s.rawContent,
        header: parseSnapshotHeader(s.rawContent),
      });
      // Also index by absolute path for fs compatibility
      snapshotsMap.set(path.join(rootDir, s.path), {
        rawContent: s.rawContent,
        header: parseSnapshotHeader(s.rawContent),
      });
    }

    // Convert citations snapshotPath to absolute path for CLI fs checks
    const fsCitations = new Map<number, Citation>();
    for (const c of pure.citations) {
      fsCitations.set(c.number, {
        ...c,
        snapshotPath: path.join(rootDir, c.snapshotPath),
      });
    }

    const fsProbes = new Map<string, EvidenceProbe>();
    for (const p of pure.probes) {
      fsProbes.set(p.evId, p);
    }

    return new EvidenceRegistry(fsCitations, fsProbes, rootDir, snapshotsMap);
  }

  findMissingSnapshots(): string[] {
    const missing: string[] = [];
    for (const c of this.citations) {
      if (!c.isDuplicate) {
        if (!fs.existsSync(c.snapshotPath)) {
          missing.push(c.snapshotPath);
        }
      }
    }
    return missing;
  }

  findOrphanSnapshots(): string[] {
    const validPaths = new Set(
      this.citations.filter(c => !c.isDuplicate).map(c => path.resolve(c.snapshotPath))
    );
    const orphans: string[] = [];
    for (const cat of ['docs', 'google', 'protocol', 'community']) {
      const catDir = path.join(this.archiveDir, cat);
      if (fs.existsSync(catDir)) {
        const files = fs.readdirSync(catDir);
        for (const fname of files) {
          if (fname.endsWith('.md') && fname !== 'index.md') {
            const absP = path.resolve(path.join(catDir, fname));
            if (!validPaths.has(absP)) {
              orphans.push(absP);
            }
          }
        }
      }
    }
    return orphans;
  }

  isManifestInSync(): boolean {
    if (!fs.existsSync(this.indexPath)) {
      return false;
    }
    const current = fs.readFileSync(this.indexPath, 'utf-8');
    return current.trim() === this.generateManifestText().trim();
  }

  syncManifestFile(): boolean {
    const content = this.generateManifestText();
    fs.writeFileSync(this.indexPath, content, 'utf-8');
    return true;
  }
}

// Self-test harness
if (process.argv[1]?.endsWith('evidenceRegistry.ts')) {
  console.log('Running EvidenceRegistry unit tests [TS]...');
  const reg = EvidenceRegistry.load();
  if (reg.citations.length !== 73) throw new Error(`Expected 73 citations, got ${reg.citations.length}`);
  if (reg.probes.length !== 20) throw new Error(`Expected 20 EV probes, got ${reg.probes.length}`);
  if (reg.maxEvidenceNumber !== 20) throw new Error(`Expected max EV 20, got ${reg.maxEvidenceNumber}`);
  if (reg.evidenceRange !== 'EV-001..EV-020') throw new Error(`Expected EV-001..EV-020, got ${reg.evidenceRange}`);

  const missing = reg.findMissingSnapshots();
  if (missing.length !== 0) throw new Error(`Expected 0 missing snapshots, got ${missing.length}`);

  const orphans = reg.findOrphanSnapshots();
  if (orphans.length !== 0) throw new Error(`Expected 0 orphans, got ${orphans.length}`);

  if (!reg.isManifestInSync()) throw new Error('Manifest index.md out of sync with registry computation');

  console.log(`✓ All EvidenceRegistry tests passed (${reg.citations.length} citations, ${reg.probes.length} probes, 0 orphans) [TS].`);
}
