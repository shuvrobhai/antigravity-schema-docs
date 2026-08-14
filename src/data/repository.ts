import { ReferenceModule, JsonSchemaItem, EvidenceProbe, SourceCitation, AdrRecord, JsonValue } from '../types';
import {
  EvidenceRegistry,
  parseSourceFrontmatter,
  type SourceArchiveStats,
} from '../lib/evidenceRegistry';
import { extractHeadings as parseHeadings, parseYamlFrontmatter } from '../lib/markdownCore';
import { flattenCitations, normalizePath } from '../lib/documentStore';
import type { DocumentStore, CitationDoc } from '../lib/documentStore';

// Load all reference markdown files
const rawReferenceModules = import.meta.glob('/reference/*.md', { query: '?raw', eager: true }) as Record<string, { default: string } | string>;

// Load all schemas
const rawSchemas = import.meta.glob('/schemas/*.schema.json', { eager: true }) as Record<string, unknown>;

// Load ADR files
const rawAdrs = import.meta.glob('/docs/adr/*.md', { query: '?raw', eager: true }) as Record<string, { default: string } | string>;

// Load evidence files
const rawEvidenceDocs = import.meta.glob('/evidence/**/*.md', { query: '?raw', eager: true }) as Record<string, { default: string } | string>;

// Load composed parent document
const rawParentDoc = import.meta.glob('/antigravity-reference.md', { query: '?raw', eager: true }) as Record<string, { default: string } | string>;

// Load README for relative-link scanning (shared with the Integrity Gate)
const rawReadme = import.meta.glob('/README.md', { query: '?raw', eager: true }) as Record<string, { default: string } | string>;

function extractContent(fileData: { default: string } | string): string {
  if (typeof fileData === 'string') return fileData;
  return fileData?.default || '';
}

// 1. Process Reference Modules
export const referenceModules: ReferenceModule[] = Object.entries(rawReferenceModules)
  .map(([path, contentObj]) => {
    const rawContent = extractContent(contentObj);
    const filename = path.split('/').pop() || '';
    const match = filename.match(/^(\d+)-(.*)\.md$/);
    const num = match ? parseInt(match[1], 10) : 0;
    const slug = match ? match[2] : filename.replace('.md', '');

    const headings = parseHeadings(rawContent);
    // Find top-level title (H1 or first H2)
    const titleHeading = headings.find(h => h.level === 1) || headings.find(h => h.level === 2) || { title: slug };

    return {
      id: filename,
      slug,
      number: num,
      title: titleHeading.title,
      rawContent,
      headings,
    };
  })
  .sort((a, b) => a.number - b.number);

// 2. Process JSON Schemas
export const jsonSchemas: JsonSchemaItem[] = Object.entries(rawSchemas)
  .map(([path, schemaObj]) => {
    const raw =
      schemaObj && typeof schemaObj === 'object' && 'default' in schemaObj ? schemaObj.default : schemaObj;
    const schema = (raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}) as Record<string, JsonValue>;
    const filename = path.split('/').pop() || '';
    const name = filename.replace('.schema.json', '');
    const title =
      typeof schema.title === 'string' ? schema.title : name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const description =
      typeof schema.description === 'string' ? schema.description : 'Google Antigravity configuration schema';
    const properties =
      schema.properties && typeof schema.properties === 'object' && !Array.isArray(schema.properties)
        ? schema.properties
        : {};
    const propertiesCount = Object.keys(properties).length;
    const requiredFields = Array.isArray(schema.required)
      ? schema.required.filter((r): r is string => typeof r === 'string')
      : [];

    return {
      id: filename,
      name,
      filename,
      title,
      description,
      schema,
      propertiesCount,
      requiredFields,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

// 3. Process ADR Records
export const adrRecords: AdrRecord[] = Object.entries(rawAdrs)
  .map(([path, contentObj]) => {
    const rawContent = extractContent(contentObj);
    const filename = path.split('/').pop() || '';
    const match = filename.match(/^(\d+)-(.*)\.md$/);
    const num = match ? parseInt(match[1], 10) : 0;
    const slug = match ? match[2] : filename.replace('.md', '');

    const headings = parseHeadings(rawContent);
    const title = headings[0]?.title || slug;

    // extract status & date if present
    const statusMatch = rawContent.match(/\*\*Status:\*\*\s*([^\n\r]+)/i) || rawContent.match(/Status:\s*([^\n\r]+)/i);
    const dateMatch = rawContent.match(/\*\*Date:\*\*\s*([^\n\r]+)/i) || rawContent.match(/Date:\s*([^\n\r]+)/i);

    return {
      id: filename,
      number: num,
      slug,
      title,
      status: statusMatch ? statusMatch[1].trim() : 'Accepted',
      date: dateMatch ? dateMatch[1].trim() : '2026-08',
      rawContent,
    };
  })
  .sort((a, b) => a.number - b.number);

// 4. Process Evidence & Observation Probes
export const evidenceDoc = extractContent(rawEvidenceDocs['/evidence/agy-1.1.12/evidence.md'] || '');
export const evidenceIndexDoc = extractContent(rawEvidenceDocs['/evidence/index.md'] || '');
export const researchReportDoc = extractContent(
  rawEvidenceDocs['/evidence/reports/R-001-behavioral-contracts.md'] ||
    rawEvidenceDocs['/evidence/reports/01-behavioral-contracts-research-report.md'] ||
    rawEvidenceDocs['/evidence/research-report.md'] ||
    ''
);

export function parseEvidenceProbesFromFiles(): EvidenceProbe[] {
  const probeEntries = Object.entries(rawEvidenceDocs)
    .filter(([path]) => path.startsWith('/evidence/probes/') && path.endsWith('.md') && !path.endsWith('index.md'))
    .sort(([a], [b]) => a.localeCompare(b));

  if (probeEntries.length > 0) {
    return probeEntries.map(([path, contentObj]) => {
      const raw = extractContent(contentObj);
      const { frontmatter, body } = parseYamlFrontmatter(raw);

      const filename = path.split('/').pop()?.replace('.md', '') || 'EV-000';
      const id = String(frontmatter['probe_id'] || '') || filename;
      const title = String(frontmatter['title'] || '') || filename;
      const rawStatus = String(frontmatter['status'] || '').toUpperCase();
      const status: EvidenceProbe['status'] =
        rawStatus === 'RESOLVED' || rawStatus === 'VERIFIED' || rawStatus === 'UNRESOLVED' || rawStatus === 'INVESTIGATING'
          ? (rawStatus as EvidenceProbe['status'])
          : 'RESOLVED';
      const category = String(frontmatter['category'] || '') || 'CLI & Agent Internals';
      const executedAt = String(frontmatter['executed_at'] || '') || '2026-08-13';

      return {
        id,
        title,
        category,
        status,
        date: executedAt,
        description: body.slice(0, 300).trim(),
        findings: body.trim(),
        rawContent: raw,
      };
    });
  }

  // Fallback to legacy aggregate parsing
  const probes: EvidenceProbe[] = [];
  const sections = evidenceDoc.split(/(?=##\s+EV-\d+|###\s+EV-\d+)/g);

  for (const sec of sections) {
    const match = sec.match(/(?:##|###)\s+(EV-\d+)[:\s—\-]+([^\n\r]+)/);
    if (match) {
      const id = match[1].trim();
      const title = match[2].trim();
      const isResolved = sec.includes('RESOLVED') || sec.includes('Status: RESOLVED') || sec.includes('✅');
      const isVerified = sec.includes('VERIFIED') || sec.includes('CONFIRMED');
      const status = isResolved ? 'RESOLVED' : isVerified ? 'VERIFIED' : 'INVESTIGATING';

      probes.push({
        id,
        title,
        category: id.startsWith('EV-0') ? 'CLI & Agent Internals' : 'Subagents & Sandbox',
        status,
        date: '2026-08-13',
        description: sec.slice(0, 300),
        findings: sec,
        rawContent: sec,
      });
    }
  }
  return probes;
}

export const evidenceProbes = parseEvidenceProbesFromFiles();

// 5. Process Source Citations (evidence/sources/) via unified EvidenceRegistry
const rawSourceInputs = Object.entries(rawEvidenceDocs)
  .filter(([path]) => path.startsWith('/evidence/sources/') && !path.endsWith('index.md'))
  .map(([path, contentObj]) => ({
    path: path.replace(/^\//, ''),
    rawContent: extractContent(contentObj),
  }));

const worksCitedRaw = rawReferenceModules['/reference/19-works-cited.md']
  ? extractContent(rawReferenceModules['/reference/19-works-cited.md'])
  : '';

export const evidenceRegistry = EvidenceRegistry.fromTexts({
  worksCitedText: worksCitedRaw,
  evidenceText: evidenceDoc,
  snapshots: rawSourceInputs,
});

export const sourceCitations: SourceCitation[] = evidenceRegistry.indexCrossReferences(
  referenceModules,
  adrRecords
);

export const sourceArchiveStats: SourceArchiveStats = evidenceRegistry.getArchiveStats(
  rawSourceInputs.length
);

export const parentComposedDocument = extractContent(rawParentDoc['/antigravity-reference.md'] || '');

// ---------------------------------------------------------------------------
// Reference Corpus store — the browser adapter for the Integrity Gate.
// The named exports above remain a thin facade over this seam; the gate and
// the Validation Console cross it exclusively.
// ---------------------------------------------------------------------------

const buildFlatCitations = (): CitationDoc[] =>
  flattenCitations(rawSourceInputs, raw => parseSourceFrontmatter(raw));

const knownPaths = new Set<string>();
for (const p of Object.keys(rawReferenceModules)) knownPaths.add(normalizePath(p));
for (const p of Object.keys(rawSchemas)) knownPaths.add(normalizePath(p));
for (const p of Object.keys(rawAdrs)) knownPaths.add(normalizePath(p));
for (const p of Object.keys(rawEvidenceDocs)) knownPaths.add(normalizePath(p));
for (const p of Object.keys(rawParentDoc)) knownPaths.add(normalizePath(p));
for (const p of Object.keys(rawReadme)) knownPaths.add(normalizePath(p));

const documentMap = new Map<string, string>();
for (const [p, c] of Object.entries(rawReadme)) documentMap.set(normalizePath(p), extractContent(c));
for (const [p, c] of Object.entries(rawReferenceModules)) documentMap.set(normalizePath(p), extractContent(c));
for (const [p, c] of Object.entries(rawEvidenceDocs)) documentMap.set(normalizePath(p), extractContent(c));
for (const [p, c] of Object.entries(rawParentDoc)) documentMap.set(normalizePath(p), extractContent(c));

const snapshotHeaders = new Map<string, { status: string; fetched: string; license?: string }>();
for (const input of rawSourceInputs) {
  const meta = parseSourceFrontmatter(input.rawContent);
  snapshotHeaders.set(normalizePath(input.path), {
    status: String(meta.status),
    fetched: meta.fetched,
    license: meta.license,
  });
}

/** The browser adapter for the Integrity Gate — glob-backed, read-only. */
export const documentStore: DocumentStore = {
  getModules: () =>
    referenceModules.map(m => ({
      filename: m.id,
      number: m.number,
      slug: m.slug,
      title: m.title,
      rawContent: m.rawContent,
    })),
  getSchemas: () => jsonSchemas.map(s => ({ filename: s.filename, schema: s.schema })),
  getProbes: () =>
    evidenceProbes.map(p => ({
      evId: p.id,
      number: parseInt(p.id.replace('EV-', ''), 10) || 0,
      title: p.title,
      status: p.status,
    })),
  getCitations: buildFlatCitations,
  getSnapshotFiles: () => rawSourceInputs.map(i => normalizePath(i.path)),
  getSnapshotHeader: snapshotPath => snapshotHeaders.get(normalizePath(snapshotPath)) ?? null,
  getManifestText: () => extractContent(rawEvidenceDocs['/evidence/sources/index.md'] || '') || null,
  getParentComposed: () => parentComposedDocument || null,
  getDocument: relPath => documentMap.get(normalizePath(relPath)) ?? null,
  canResolvePath: relPath => knownPaths.has(normalizePath(relPath)),
  // checkEvidenceIndexSync intentionally omitted — regenerates files on disk.
};
