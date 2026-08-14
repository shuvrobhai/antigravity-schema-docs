/**
 * searchIndex.ts — Lightweight in-memory inverted search index.
 *
 * Pre-tokenizes corpus records (reference modules, headings, native JSON schemas,
 * evidence probes, archived sources, and ADRs) for fast client-side query matching
 * without repeated multi-pass scans.
 */

import type {
  SearchResultItem,
  ReferenceModule,
  JsonSchemaItem,
  EvidenceProbe,
  SourceCitation,
  AdrRecord,
} from '../types';

export interface IndexedDocument {
  item: SearchResultItem;
  terms: Set<string>;
  boost: number;
}

export interface CorpusSearchInput {
  referenceModules: ReferenceModule[];
  jsonSchemas: JsonSchemaItem[];
  evidenceProbes: EvidenceProbe[];
  sourceCitations: SourceCitation[];
  adrRecords: AdrRecord[];
}

export const EXTENSIBILITY_TOPIC_BOOSTS = [
  {
    keywords: ['skill', 'skills', 'skill.md', 'progressive disclosure', 'codelab'],
    title: '§04.2 Skills System & Progressive Disclosure',
    subtitle: 'Extensibility Architecture (04-extensibility-architecture)',
    snippet: 'Skills are agent-triggered open standards for extending capabilities. 3-phase loading: Phase 1 Metadata (~100 tokens), Phase 2 Instructions (<5,000 tokens), Phase 3 Resources.',
    id: '04-extensibility-architecture',
    boost: 2.0,
  },
  {
    keywords: ['plugin', 'plugins', 'plugin.json', 'agy plugin', 'marketplace'],
    title: '§04.4 Plugins & Manifest Specification',
    subtitle: 'Extensibility Architecture (04-extensibility-architecture)',
    snippet: 'Namespaced bundles that group skills, rules, MCP servers, hooks, and subagents into a single package. Manifest plugin.json only requires name property.',
    id: '04-extensibility-architecture',
    boost: 2.0,
  },
  {
    keywords: ['mcp', 'mcp_config.json', 'model context protocol', 'mcp store', 'serverurl', 'sse'],
    title: '§04.5 Model Context Protocol (MCP) Integration',
    subtitle: 'Extensibility Architecture (04-extensibility-architecture)',
    snippet: 'Open standard connecting agents to tools and APIs. Configured in .agents/mcp_config.json supporting Stdio, Remote (serverUrl), and Google ADC authentication.',
    id: '04-extensibility-architecture',
    boost: 2.0,
  },
  {
    keywords: ['hook', 'hooks', 'lifecycle hook', 'hooks.json', 'pretooluse', 'posttooluse', 'preinvocation'],
    title: '§04.8 Lifecycle Hooks & Event Execution',
    subtitle: 'Extensibility Architecture (04-extensibility-architecture)',
    snippet: 'Run custom scripts at PreToolUse, PostToolUse, PreInvocation, PostInvocation, and Stop events with configurable timeouts and matchers.',
    id: '04-extensibility-architecture',
    boost: 2.0,
  },
  {
    keywords: ['rule', 'rules', 'gemini.md', 'glob', 'always on', 'model decision'],
    title: '§04.6 Rules & Activation Modes',
    subtitle: 'Extensibility Architecture (04-extensibility-architecture)',
    snippet: 'Define constraints or guidelines up to 12,000 chars per file. Supports Always On, Manual (@), Model Decision, and Glob pattern matching.',
    id: '04-extensibility-architecture',
    boost: 2.0,
  },
  {
    keywords: ['agent', 'agents', 'subagent', 'subagents', 'custom agent', 'persona', 'define_subagent'],
    title: '§04.3 Custom Agents & Personas',
    subtitle: 'Extensibility Architecture (04-extensibility-architecture)',
    snippet: 'Reusable persona definitions in Markdown format with YAML frontmatter. Defines tools, execution policies, and model tiers (inherit, pro, flash).',
    id: '04-extensibility-architecture',
    boost: 2.0,
  },
  {
    keywords: ['workflow', 'workflows'],
    title: '§04.7 Workflows & Sequential Chains',
    subtitle: 'Extensibility Architecture (04-extensibility-architecture)',
    snippet: 'Markdown step sequences invoked via /workflow-name. Workflows can compose other workflows at the trajectory level.',
    id: '04-extensibility-architecture',
    boost: 2.0,
  },
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[#§`*_()[\]{}|:;.,'"<>?!\\/=-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2);
}

export class SearchIndex {
  private docs: IndexedDocument[] = [];
  private termIndex: Map<string, Set<number>> = new Map();

  public addDocument(item: SearchResultItem, rawTerms: string[], boost: number = 1.0): void {
    const docIndex = this.docs.length;
    const termSet = new Set<string>();

    for (const term of rawTerms) {
      for (const token of tokenize(term)) {
        termSet.add(token);
        let posting = this.termIndex.get(token);
        if (!posting) {
          posting = new Set<number>();
          this.termIndex.set(token, posting);
        }
        posting.add(docIndex);
      }
    }

    this.docs.push({
      item,
      terms: termSet,
      boost,
    });
  }

  public search(query: string, limit: number = 25): SearchResultItem[] {
    const cleanQ = query.trim().toLowerCase();
    if (!cleanQ) return [];

    const queryTokens = tokenize(cleanQ);
    if (queryTokens.length === 0) {
      queryTokens.push(cleanQ);
    }

    const scores = new Map<number, number>();

    // 1. Term and prefix matching
    for (const qToken of queryTokens) {
      for (const [term, posting] of this.termIndex.entries()) {
        let matchWeight = 0;
        if (term === qToken) {
          matchWeight = 3.0; // exact token match
        } else if (term.startsWith(qToken)) {
          matchWeight = 1.5; // prefix match
        } else if (term.includes(qToken) && qToken.length >= 3) {
          matchWeight = 0.8; // substring match
        }

        if (matchWeight > 0) {
          for (const docIdx of posting) {
            const current = scores.get(docIdx) || 0;
            scores.set(docIdx, current + matchWeight * this.docs[docIdx].boost);
          }
        }
      }
    }

    // 2. Direct exact title/id boosts
    for (let i = 0; i < this.docs.length; i++) {
      const doc = this.docs[i];
      const titleLower = doc.item.title.toLowerCase();
      const idLower = doc.item.id.toLowerCase();

      if (titleLower.includes(cleanQ) || idLower.includes(cleanQ)) {
        const current = scores.get(i) || 0;
        scores.set(i, current + 5.0 * doc.boost);
      }
    }

    // Sort by score descending and deduplicate by item.id + item.type
    const sortedIndices = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    const results: SearchResultItem[] = [];
    const seen = new Set<string>();

    for (const idx of sortedIndices) {
      const item = this.docs[idx].item;
      const key = `${item.type}:${item.id}:${item.title}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push(item);
        if (results.length >= limit) break;
      }
    }

    return results;
  }

  public static buildFromCorpus(corpus: CorpusSearchInput): SearchIndex {
    const index = new SearchIndex();

    // 1. Topic Boosts
    for (const topic of EXTENSIBILITY_TOPIC_BOOSTS) {
      index.addDocument(
        {
          type: 'reference',
          id: topic.id,
          title: `⚡ ${topic.title}`,
          subtitle: topic.subtitle,
          snippet: topic.snippet,
          urlParams: { tab: 'reference', selectedId: topic.id },
        },
        [...topic.keywords, topic.title, topic.subtitle, topic.snippet],
        topic.boost
      );
    }

    // 2. Reference Modules & Headings
    for (const mod of corpus.referenceModules) {
      // Subheadings
      for (const h of mod.headings) {
        index.addDocument(
          {
            type: 'reference',
            id: mod.id,
            title: h.title,
            subtitle: `§${mod.number.toString().padStart(2, '0')} ${mod.title}`,
            snippet: `Heading inside ${mod.id}`,
            urlParams: { tab: 'reference', selectedId: mod.id },
          },
          [h.title, mod.title, mod.id, mod.slug],
          1.2
        );
      }

      // Module document
      index.addDocument(
        {
          type: 'reference',
          id: mod.id,
          title: `§${mod.number.toString().padStart(2, '0')} ${mod.title}`,
          subtitle: `Reference Module (${mod.id})`,
          snippet: mod.rawContent.slice(0, 140).replace(/^[#\s*]+/, '') + '...',
          urlParams: { tab: 'reference', selectedId: mod.id },
        },
        [mod.title, mod.id, mod.slug, mod.rawContent],
        1.0
      );
    }

    // 3. JSON Schemas
    for (const s of corpus.jsonSchemas) {
      const propNames = Object.keys(s.schema.properties || {}).join(' ');
      index.addDocument(
        {
          type: 'schema',
          id: s.id,
          title: s.title,
          subtitle: `Schema: ${s.filename} (${s.propertiesCount} properties)`,
          snippet: s.description,
          urlParams: { tab: 'schemas', selectedId: s.id },
        },
        [s.name, s.title, s.description, s.filename, propNames],
        1.1
      );
    }

    // 4. Evidence Probes
    for (const probe of corpus.evidenceProbes) {
      index.addDocument(
        {
          type: 'evidence',
          id: probe.id,
          title: `${probe.id}: ${probe.title}`,
          subtitle: `Empirical Evidence Probe [${probe.status}]`,
          snippet: probe.description.slice(0, 140).replace(/\n/g, ' ') + '...',
          urlParams: { tab: 'evidence', selectedId: probe.id },
        },
        [probe.id, probe.title, probe.description, probe.findings, probe.status],
        1.1
      );
    }

    // 5. Sources
    for (const src of corpus.sourceCitations) {
      const citationTerms = [
        `#${src.number}`,
        `${src.number}`,
        ...src.citationNumbers.map(n => `#${n}`),
        ...src.citationNumbers.map(n => `${n}`),
        `docs:${src.number}`,
        `google:${src.number}`,
        `protocol:${src.number}`,
        `community:${src.number}`,
        src.title,
        src.slug,
        src.category,
        src.canonicalUrl,
        src.url,
        src.finalUrl || '',
        src.rawContent,
      ];

      index.addDocument(
        {
          type: 'source',
          id: src.id,
          title: `[#${src.number.toString().padStart(2, '0')}] ${src.title}`,
          subtitle: `Archived Source (${src.category.toUpperCase()}) • ${src.referenceLocations.length} in-repo refs`,
          snippet: src.finalUrl || src.url,
          urlParams: { tab: 'sources', selectedId: src.id },
        },
        citationTerms,
        1.0
      );
    }

    // 6. ADRs
    for (const adr of corpus.adrRecords) {
      index.addDocument(
        {
          type: 'adr',
          id: adr.id,
          title: `ADR-${adr.number.toString().padStart(4, '0')}: ${adr.title}`,
          subtitle: `Architecture Decision Record (${adr.status})`,
          snippet: adr.rawContent.slice(0, 140).replace(/^[#\s*]+/, '') + '...',
          urlParams: { tab: 'adrs', selectedId: adr.id },
        },
        [adr.id, adr.title, `ADR-${adr.number}`, adr.status, adr.rawContent],
        1.0
      );
    }

    return index;
  }
}

// Self-test execution when run directly
if (typeof process !== 'undefined' && process.argv[1]?.includes('searchIndex')) {
  console.log('Running SearchIndex unit tests [TS]...');
  const idx = new SearchIndex();

  idx.addDocument(
    {
      type: 'reference',
      id: '04-extensibility-architecture.md',
      title: 'Extensibility Architecture',
      subtitle: '§04 Reference',
      snippet: 'Skills, plugins, hooks',
      urlParams: { tab: 'reference', selectedId: '04-extensibility-architecture.md' },
    },
    ['extensibility', 'skills', 'plugins', 'hooks'],
    1.5
  );

  idx.addDocument(
    {
      type: 'schema',
      id: 'settings.schema.json',
      title: 'Settings Schema',
      subtitle: 'Native Schema',
      snippet: 'Configuration schema',
      urlParams: { tab: 'schemas', selectedId: 'settings.schema.json' },
    },
    ['settings', 'schema', 'permissions', 'commandExecutionPolicy'],
    1.0
  );

  const skillResults = idx.search('skills');
  if (skillResults.length === 0 || skillResults[0].id !== '04-extensibility-architecture.md') {
    throw new Error('SearchIndex assertion failed: query "skills" did not return expected module');
  }

  const schemaResults = idx.search('commandExecutionPolicy');
  if (schemaResults.length === 0 || schemaResults[0].id !== 'settings.schema.json') {
    throw new Error('SearchIndex assertion failed: query "commandExecutionPolicy" did not return settings schema');
  }

  const emptyResults = idx.search('');
  if (emptyResults.length !== 0) {
    throw new Error('SearchIndex assertion failed: empty query should return empty array');
  }

  console.log('✓ All SearchIndex unit tests passed cleanly.');
}
