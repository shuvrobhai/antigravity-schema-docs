import {
  SourceCitation,
  MergedSourceItem,
  SourceReferenceLocation,
  ReferenceModule,
  EvidenceProbe,
  AdrRecord,
  JsonSchemaItem,
} from '../types';
import { parseFrontmatterMap } from '../lib/markdownCore';

/**
 * Normalizes a URL for canonical matching and duplicate detection.
 * - Strips protocols (http/https)
 * - Lowercases hostname
 * - Removes default ports and trailing slashes
 * - Strips redundant trailing index files (/index.html, /index.md)
 * - Removes standard tracking query parameters (utm_*, ref, source)
 */
export function normalizeCanonicalUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();

  // Strip protocol
  url = url.replace(/^https?:\/\//i, '');

  // Strip www prefix
  url = url.replace(/^www\./i, '');

  // Strip hash anchors
  url = url.split('#')[0];

  // Clean query params (keep query if meaningful, or strip tracking)
  const [base, query] = url.split('?');
  let cleanQuery = '';
  if (query) {
    const params = new URLSearchParams(query);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'source'].forEach(p =>
      params.delete(p)
    );
    const qs = params.toString();
    if (qs) cleanQuery = `?${qs}`;
  }

  let cleanBase = base.toLowerCase().replace(/\/+$/, '');
  cleanBase = cleanBase.replace(/\/(index\.html|index\.md|index)$/i, '');

  return cleanBase + cleanQuery;
}

/**
 * Parses frontmatter fields from markdown content
 */
export function parseSourceFrontmatter(rawContent: string): {
  sourceNum: number;
  category: 'docs' | 'google' | 'protocol' | 'community';
  title: string;
  url: string;
  finalUrl: string;
  fetched: string;
  status: number | string;
  license: string;
  checksum?: string;
} {
  // Single home for frontmatter parsing — the MarkdownDoc Core.
  const meta = parseFrontmatterMap(rawContent);

  // Fallback searches in body if not in frontmatter
  const urlInBody = rawContent.match(/URL:\s*(https?:\/\/[^\s\n\r]+)/i) || rawContent.match(/Source:\s*(https?:\/\/[^\s\n\r]+)/i);

  const numVal = parseInt(meta['source'] || meta['number'] || '0', 10);
  const catVal = (meta['category'] || 'community').toLowerCase() as 'docs' | 'google' | 'protocol' | 'community';
  const urlVal = meta['url'] || (urlInBody ? urlInBody[1] : '');
  const finalUrlVal = meta['final_url'] || urlVal;

  return {
    sourceNum: isNaN(numVal) ? 0 : numVal,
    category: ['docs', 'google', 'protocol', 'community'].includes(catVal) ? catVal : 'community',
    title: meta['title'] || '',
    url: urlVal,
    finalUrl: finalUrlVal,
    fetched: meta['fetched'] || '2026-08-13',
    status: meta['status'] || 200,
    license: meta['license'] || 'CC-BY-4.0',
    checksum: meta['checksum'],
  };
}

export interface RawSourceInput {
  path: string;
  rawContent: string;
}

/**
 * Groups raw source snapshots into unified canonical records by identifying duplicate
 * URLs, matching mirror domains, and merging duplicate entries.
 */
export function groupDuplicateSources(rawInputs: RawSourceInput[]): SourceCitation[] {
  const parsedItems: MergedSourceItem[] = [];

  for (const item of rawInputs) {
    const filename = item.path.split('/').pop() || '';
    const parts = item.path.split('/');
    const folderCategory = (parts[parts.length - 2] || 'community') as 'docs' | 'google' | 'protocol' | 'community';

    const numMatch = filename.match(/^(\d+)-(.*)\.md$/);
    const fileNum = numMatch ? parseInt(numMatch[1], 10) : 0;
    const slug = numMatch ? numMatch[2] : filename.replace('.md', '');

    const meta = parseSourceFrontmatter(item.rawContent);
    const sourceNumber = meta.sourceNum || fileNum;
    const title = meta.title || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const category = meta.category || folderCategory;
    const url = meta.url || `https://antigravity.google/ref/${slug}`;
    const finalUrl = meta.finalUrl || url;

    parsedItems.push({
      number: sourceNumber,
      filename,
      category,
      title,
      url,
      finalUrl,
      rawContent: item.rawContent,
      fetched: meta.fetched,
      status: meta.status,
      license: meta.license,
    });
  }

  // Group by normalized canonical URL
  const groupsByCanonicalUrl = new Map<string, MergedSourceItem[]>();

  for (const item of parsedItems) {
    const normUrl = normalizeCanonicalUrl(item.finalUrl || item.url);
    // If no URL, group by category + title slug
    const groupKey = normUrl || `${item.category}:${item.title.toLowerCase().replace(/[^\w]/g, '')}`;

    if (!groupsByCanonicalUrl.has(groupKey)) {
      groupsByCanonicalUrl.set(groupKey, []);
    }
    groupsByCanonicalUrl.get(groupKey)!.push(item);
  }

  const canonicalCitations: SourceCitation[] = [];

  for (const [canonicalKey, items] of groupsByCanonicalUrl.entries()) {
    // Sort items by citation number ascending
    items.sort((a, b) => a.number - b.number);
    const primary = items[0];

    const citationNumbers = Array.from(new Set(items.map(i => i.number))).sort((a, b) => a - b);
    const filenames = items.map(i => i.filename);
    const slug = primary.filename.replace(/^(\d+)-/, '').replace(/\.md$/, '');
    const isDuplicateGroup = items.length > 1;

    canonicalCitations.push({
      id: primary.filename,
      number: primary.number,
      citationNumbers,
      slug,
      title: primary.title,
      category: primary.category,
      url: primary.url,
      finalUrl: primary.finalUrl,
      canonicalUrl: canonicalKey,
      filename: primary.filename,
      filenames,
      rawContent: primary.rawContent,
      archivedDate: primary.fetched || '2026-08-13',
      license: primary.license,
      status: primary.status,
      isDuplicateGroup,
      duplicateCount: items.length,
      mergedSources: items,
      referenceLocations: [], // Will be populated in indexing phase
    });
  }

  return canonicalCitations.sort((a, b) => a.number - b.number);
}

export interface RepositoryContext {
  referenceModules: ReferenceModule[];
  evidenceDoc: string;
  evidenceProbes: EvidenceProbe[];
  adrRecords: AdrRecord[];
  jsonSchemas: JsonSchemaItem[];
}

/**
 * Indexes all reference locations across the entire repository for each canonical source citation.
 * Scans reference modules, evidence probes, ADRs, and schemas to find all citations.
 */
export function indexSourceReferenceLocations(
  citations: SourceCitation[],
  repo: RepositoryContext
): SourceCitation[] {
  // Build lookup maps for fast matching against citation numbers, URLs, and filenames
  const citationMap = new Map<number, SourceCitation>();
  const urlMap = new Map<string, SourceCitation>();
  const fileMap = new Map<string, SourceCitation>();

  for (const c of citations) {
    for (const num of c.citationNumbers) {
      citationMap.set(num, c);
    }
    if (c.canonicalUrl) {
      urlMap.set(c.canonicalUrl, c);
    }
    const normUrl = normalizeCanonicalUrl(c.url);
    if (normUrl) urlMap.set(normUrl, c);
    if (c.finalUrl) {
      const normFinal = normalizeCanonicalUrl(c.finalUrl);
      if (normFinal) urlMap.set(normFinal, c);
    }
    for (const fn of c.filenames) {
      fileMap.set(fn, c);
    }
  }

  // 1. Scan Reference Modules (reference/*.md)
  for (const mod of repo.referenceModules) {
    const lines = mod.rawContent.split('\n');
    let currentSectionHeading = mod.title;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Track active section heading
      const headingMatch = line.match(/^#{1,4}\s+(.+)$/);
      if (headingMatch) {
        currentSectionHeading = headingMatch[1].replace(/\*\*/g, '').trim();
      }

      // Check for indexed tags: [DOCS:23], [DOCS:23,26], [GOOGLE:38], etc.
      const tagRegex = /\[(DOCS|GOOGLE|PROTOCOL|COMMUNITY|INFERRED|LIVE):([0-9,\s]+)\]/g;
      let tagMatch: RegExpExecArray | null;
      while ((tagMatch = tagRegex.exec(line)) !== null) {
        const fullBadge = tagMatch[0];
        const numTokens = tagMatch[2].split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));

        for (const num of numTokens) {
          const targetCitation = citationMap.get(num);
          if (targetCitation) {
            addUniqueReferenceLocation(targetCitation.referenceLocations, {
              targetType: 'reference',
              targetId: mod.id,
              targetTitle: `§${mod.number.toString().padStart(2, '0')}. ${mod.title}`,
              sectionTitle: currentSectionHeading,
              lineNumber: lineNum,
              lineText: line.trim(),
              contextSnippet: buildContextSnippet(lines, i),
              matchType: 'badge',
              matchedText: fullBadge,
              deepLink: { tab: 'reference', selectedId: mod.id },
            });
          }
        }
      }

      // Check for textual Source citations: "Source #23", "Source 23", "Sources #01, #08", "[^23]"
      const textCitationRegex = /(?:Source|Sources)\s+#?(\d+)|\[\^(\d+)\]/gi;
      let textMatch: RegExpExecArray | null;
      while ((textMatch = textCitationRegex.exec(line)) !== null) {
        const numStr = textMatch[1] || textMatch[2];
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > 0 && num <= 100) {
          const targetCitation = citationMap.get(num);
          if (targetCitation) {
            addUniqueReferenceLocation(targetCitation.referenceLocations, {
              targetType: 'reference',
              targetId: mod.id,
              targetTitle: `§${mod.number.toString().padStart(2, '0')}. ${mod.title}`,
              sectionTitle: currentSectionHeading,
              lineNumber: lineNum,
              lineText: line.trim(),
              contextSnippet: buildContextSnippet(lines, i),
              matchType: 'text_mention',
              matchedText: textMatch[0],
              deepLink: { tab: 'reference', selectedId: mod.id },
            });
          }
        }
      }

      // Check for snapshot file links (e.g. evidence/sources/docs/23-ide-browser.md)
      for (const [fn, targetCitation] of fileMap.entries()) {
        if (line.includes(fn)) {
          addUniqueReferenceLocation(targetCitation.referenceLocations, {
            targetType: 'reference',
            targetId: mod.id,
            targetTitle: `§${mod.number.toString().padStart(2, '0')}. ${mod.title}`,
            sectionTitle: currentSectionHeading,
            lineNumber: lineNum,
            lineText: line.trim(),
            contextSnippet: buildContextSnippet(lines, i),
            matchType: 'file_link',
            matchedText: fn,
            deepLink: { tab: 'reference', selectedId: mod.id },
          });
        }
      }

      // Check for Section 19 Works Cited specific entries
      if (mod.number === 19) {
        const itemMatch = line.match(/^(\d+)\.\s+([^—]+)—\s*(https?:\/\/[^\s\n\r]+)/);
        if (itemMatch) {
          const num = parseInt(itemMatch[1], 10);
          const targetCitation = citationMap.get(num);
          if (targetCitation) {
            addUniqueReferenceLocation(targetCitation.referenceLocations, {
              targetType: 'reference',
              targetId: mod.id,
              targetTitle: `§19. Works Cited Entry #${num}`,
              sectionTitle: currentSectionHeading,
              lineNumber: lineNum,
              lineText: line.trim(),
              contextSnippet: buildContextSnippet(lines, i),
              matchType: 'works_cited',
              matchedText: `Citation #${num}`,
              deepLink: { tab: 'reference', selectedId: mod.id },
            });
          }
        }
      }
    }
  }

  // 2. Scan Evidence Probes (evidence/agy-1.1.12/evidence.md)
  for (const probe of repo.evidenceProbes) {
    const lines = probe.rawContent.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Match Source citations in probe
      const match = line.match(/(?:Source|source)\s+#?(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        const targetCitation = citationMap.get(num);
        if (targetCitation) {
          addUniqueReferenceLocation(targetCitation.referenceLocations, {
            targetType: 'evidence',
            targetId: probe.id,
            targetTitle: `${probe.id}: ${probe.title}`,
            sectionTitle: `${probe.id} Investigation Findings`,
            lineNumber: lineNum,
            lineText: line.trim(),
            contextSnippet: buildContextSnippet(lines, i),
            matchType: 'text_mention',
            matchedText: match[0],
            deepLink: { tab: 'evidence', selectedId: probe.id },
          });
        }
      }
    }
  }

  // 3. Scan Architecture Decision Records (docs/adr/*.md)
  for (const adr of repo.adrRecords) {
    const lines = adr.rawContent.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      for (const [fn, targetCitation] of fileMap.entries()) {
        if (line.includes(fn)) {
          addUniqueReferenceLocation(targetCitation.referenceLocations, {
            targetType: 'adr',
            targetId: adr.id,
            targetTitle: `ADR-${adr.number.toString().padStart(4, '0')}: ${adr.title}`,
            sectionTitle: `ADR Context & Decision`,
            lineNumber: lineNum,
            lineText: line.trim(),
            contextSnippet: buildContextSnippet(lines, i),
            matchType: 'file_link',
            matchedText: fn,
            deepLink: { tab: 'adrs', selectedId: adr.id },
          });
        }
      }
    }
  }

  return citations;
}

function buildContextSnippet(lines: string[], targetIndex: number): string {
  const start = Math.max(0, targetIndex - 1);
  const end = Math.min(lines.length, targetIndex + 2);
  return lines.slice(start, end).join('\n');
}

function addUniqueReferenceLocation(locations: SourceReferenceLocation[], loc: SourceReferenceLocation) {
  const exists = locations.some(
    l => l.targetId === loc.targetId && l.lineNumber === loc.lineNumber && l.matchType === loc.matchType
  );
  if (!exists) {
    locations.push(loc);
  }
}

/**
 * Source Archive summary statistics
 */
export interface SourceArchiveStats {
  totalSnapshots: number;
  uniqueCanonicalRecords: number;
  duplicateGroupsCount: number;
  totalReferenceLocations: number;
  byCategory: {
    docs: number;
    google: number;
    protocol: number;
    community: number;
  };
}

export function computeSourceArchiveStats(citations: SourceCitation[], rawSnapshotCount: number): SourceArchiveStats {
  const duplicateGroups = citations.filter(c => c.isDuplicateGroup);
  const totalReferences = citations.reduce((sum, c) => sum + c.referenceLocations.length, 0);

  const byCat = { docs: 0, google: 0, protocol: 0, community: 0 };
  for (const c of citations) {
    if (byCat[c.category] !== undefined) {
      byCat[c.category]++;
    }
  }

  return {
    totalSnapshots: rawSnapshotCount,
    uniqueCanonicalRecords: citations.length,
    duplicateGroupsCount: duplicateGroups.length,
    totalReferenceLocations: totalReferences,
    byCategory: byCat,
  };
}
