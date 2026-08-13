import { ReferenceModule, JsonSchemaItem, EvidenceProbe, SourceCitation, AdrRecord } from '../types';
import {
  groupDuplicateSources,
  indexSourceReferenceLocations,
  computeSourceArchiveStats,
  SourceArchiveStats,
} from './sourceProcessing';

// Load all reference markdown files
const rawReferenceModules = import.meta.glob('/reference/*.md', { query: '?raw', eager: true }) as Record<string, { default: string } | string>;

// Load all schemas
const rawSchemas = import.meta.glob('/schemas/*.schema.json', { eager: true }) as Record<string, { default: any } | any>;

// Load ADR files
const rawAdrs = import.meta.glob('/docs/adr/*.md', { query: '?raw', eager: true }) as Record<string, { default: string } | string>;

// Load evidence files
const rawEvidenceDocs = import.meta.glob('/evidence/**/*.md', { query: '?raw', eager: true }) as Record<string, { default: string } | string>;

// Load composed parent document
const rawParentDoc = import.meta.glob('/antigravity-reference.md', { query: '?raw', eager: true }) as Record<string, { default: string } | string>;

function extractContent(fileData: { default: string } | string): string {
  if (typeof fileData === 'string') return fileData;
  return fileData?.default || '';
}

function extractHeadings(markdown: string) {
  const lines = markdown.split('\n');
  const headings: { level: number; title: string; id: string }[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawTitle = match[2].trim();
      const cleanTitle = rawTitle.replace(/\*\*/g, '').replace(/`([^`]+)`/g, '$1');
      const slugId = cleanTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      headings.push({ level, title: cleanTitle, id: slugId });
    }
  }
  return headings;
}

// 1. Process Reference Modules
export const referenceModules: ReferenceModule[] = Object.entries(rawReferenceModules)
  .map(([path, contentObj]) => {
    const rawContent = extractContent(contentObj);
    const filename = path.split('/').pop() || '';
    const match = filename.match(/^(\d+)-(.*)\.md$/);
    const num = match ? parseInt(match[1], 10) : 0;
    const slug = match ? match[2] : filename.replace('.md', '');

    const headings = extractHeadings(rawContent);
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
    const schema = (schemaObj && typeof schemaObj === 'object' && 'default' in schemaObj) ? schemaObj.default : schemaObj;
    const filename = path.split('/').pop() || '';
    const name = filename.replace('.schema.json', '');
    const title = schema.title || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const description = schema.description || 'Google Antigravity configuration schema';
    const properties = schema.properties || {};
    const propertiesCount = Object.keys(properties).length;
    const requiredFields = Array.isArray(schema.required) ? schema.required : [];

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

    const headings = extractHeadings(rawContent);
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
      const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      const fmText = m ? m[1] : '';
      const body = m ? m[2] : raw;

      const getFm = (k: string) => {
        const line = fmText.split(/\r?\n/).find(l => l.trim().startsWith(`${k}:`));
        if (!line) return '';
        return line.slice(line.indexOf(':') + 1).trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
      };

      const filename = path.split('/').pop()?.replace('.md', '') || 'EV-000';
      const id = getFm('probe_id') || filename;
      const title = getFm('title') || filename;
      const rawStatus = getFm('status').toUpperCase();
      const status: EvidenceProbe['status'] =
        rawStatus === 'RESOLVED' || rawStatus === 'VERIFIED' || rawStatus === 'UNRESOLVED' || rawStatus === 'INVESTIGATING'
          ? (rawStatus as EvidenceProbe['status'])
          : 'RESOLVED';
      const category = getFm('category') || 'CLI & Agent Internals';
      const executedAt = getFm('executed_at') || '2026-08-13';

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

// 5. Process Source Citations (evidence/sources/) with Duplicate Identification and Location Indexing
const rawSourceInputs = Object.entries(rawEvidenceDocs)
  .filter(([path]) => path.startsWith('/evidence/sources/') && !path.endsWith('index.md'))
  .map(([path, contentObj]) => ({
    path,
    rawContent: extractContent(contentObj),
  }));

const rawGroupedCitations = groupDuplicateSources(rawSourceInputs);

export const sourceCitations: SourceCitation[] = indexSourceReferenceLocations(rawGroupedCitations, {
  referenceModules,
  evidenceDoc,
  evidenceProbes,
  adrRecords,
  jsonSchemas,
});

export const sourceArchiveStats: SourceArchiveStats = computeSourceArchiveStats(
  sourceCitations,
  rawSourceInputs.length
);

export const parentComposedDocument = extractContent(rawParentDoc['/antigravity-reference.md'] || '');
