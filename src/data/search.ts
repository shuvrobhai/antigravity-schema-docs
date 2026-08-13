import { SearchResultItem, TabType } from '../types';
import { referenceModules, jsonSchemas, evidenceProbes, sourceCitations, adrRecords } from './repository';

export function performSearch(query: string): SearchResultItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResultItem[] = [];

  // Dedicated boosts for Extensibility Topics (Chapter 4)
  const EXTENSIBILITY_TOPICS = [
    {
      keywords: ['skill', 'skills', 'skill.md', 'progressive disclosure', 'codelab'],
      title: '§04.2 Skills System & Progressive Disclosure',
      subtitle: 'Extensibility Architecture (04-extensibility-architecture)',
      snippet: 'Skills are agent-triggered open standards for extending capabilities. 3-phase loading: Phase 1 Metadata (~100 tokens), Phase 2 Instructions (<5,000 tokens), Phase 3 Resources.',
      id: '04-extensibility-architecture',
    },
    {
      keywords: ['plugin', 'plugins', 'plugin.json', 'agy plugin', 'marketplace'],
      title: '§04.4 Plugins & Manifest Specification',
      subtitle: 'Extensibility Architecture (04-extensibility-architecture)',
      snippet: 'Namespaced bundles that group skills, rules, MCP servers, hooks, and subagents into a single package. Manifest plugin.json only requires name property.',
      id: '04-extensibility-architecture',
    },
    {
      keywords: ['mcp', 'mcp_config.json', 'model context protocol', 'mcp store', 'serverurl', 'sse'],
      title: '§04.5 Model Context Protocol (MCP) Integration',
      subtitle: 'Extensibility Architecture (04-extensibility-architecture)',
      snippet: 'Open standard connecting agents to tools and APIs. Configured in .agents/mcp_config.json supporting Stdio, Remote (serverUrl), and Google ADC authentication.',
      id: '04-extensibility-architecture',
    },
    {
      keywords: ['hook', 'hooks', 'lifecycle hook', 'hooks.json', 'pretooluse', 'posttooluse', 'preinvocation'],
      title: '§04.8 Lifecycle Hooks & Event Execution',
      subtitle: 'Extensibility Architecture (04-extensibility-architecture)',
      snippet: 'Run custom scripts at PreToolUse, PostToolUse, PreInvocation, PostInvocation, and Stop events with configurable timeouts and matchers.',
      id: '04-extensibility-architecture',
    },
    {
      keywords: ['rule', 'rules', 'gemini.md', 'glob', 'always on', 'model decision'],
      title: '§04.6 Rules & Activation Modes',
      subtitle: 'Extensibility Architecture (04-extensibility-architecture)',
      snippet: 'Define constraints or guidelines up to 12,000 chars per file. Supports Always On, Manual (@), Model Decision, and Glob pattern matching.',
      id: '04-extensibility-architecture',
    },
    {
      keywords: ['agent', 'agents', 'subagent', 'subagents', 'custom agent', 'persona', 'define_subagent'],
      title: '§04.3 Custom Agents & Personas',
      subtitle: 'Extensibility Architecture (04-extensibility-architecture)',
      snippet: 'Reusable persona definitions in Markdown format with YAML frontmatter. Defines tools, execution policies, and model tiers (inherit, pro, flash).',
      id: '04-extensibility-architecture',
    },
    {
      keywords: ['workflow', 'workflows'],
      title: '§04.7 Workflows & Sequential Chains',
      subtitle: 'Extensibility Architecture (04-extensibility-architecture)',
      snippet: 'Markdown step sequences invoked via /workflow-name. Workflows can compose other workflows at the trajectory level.',
      id: '04-extensibility-architecture',
    },
  ];

  for (const topic of EXTENSIBILITY_TOPICS) {
    if (topic.keywords.some(k => q.includes(k) || k.includes(q))) {
      results.push({
        type: 'reference',
        id: topic.id,
        title: `⚡ ${topic.title}`,
        subtitle: topic.subtitle,
        snippet: topic.snippet,
        urlParams: { tab: 'reference', selectedId: topic.id },
      });
    }
  }

  // Search Reference Modules & Headings
  for (const mod of referenceModules) {
    // Check all subheadings
    for (const h of mod.headings) {
      if (h.title.toLowerCase().includes(q)) {
        results.push({
          type: 'reference',
          id: mod.id,
          title: h.title,
          subtitle: `§${mod.number.toString().padStart(2, '0')} ${mod.title}`,
          snippet: `Heading inside ${mod.id}`,
          urlParams: { tab: 'reference', selectedId: mod.id },
        });
      }
    }

    if (mod.title.toLowerCase().includes(q) || mod.slug.toLowerCase().includes(q)) {
      results.push({
        type: 'reference',
        id: mod.id,
        title: `§${mod.number.toString().padStart(2, '0')} ${mod.title}`,
        subtitle: `Reference Module (${mod.id})`,
        snippet: mod.rawContent.slice(0, 140).replace(/^[#\s*]+/, '') + '...',
        urlParams: { tab: 'reference', selectedId: mod.id },
      });
      continue;
    }

    // Content match
    const idx = mod.rawContent.toLowerCase().indexOf(q);
    if (idx !== -1) {
      const start = Math.max(0, idx - 40);
      const snippet = mod.rawContent.slice(start, start + 140).replace(/\n/g, ' ');
      results.push({
        type: 'reference',
        id: mod.id,
        title: `§${mod.number.toString().padStart(2, '0')} ${mod.title}`,
        subtitle: `Reference Module (${mod.id})`,
        snippet: '...' + snippet + '...',
        urlParams: { tab: 'reference', selectedId: mod.id },
      });
    }
  }

  // Search JSON Schemas
  for (const s of jsonSchemas) {
    const propNames = Object.keys(s.schema.properties || {}).join(' ').toLowerCase();
    if (s.name.toLowerCase().includes(q) || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || propNames.includes(q)) {
      results.push({
        type: 'schema',
        id: s.id,
        title: s.title,
        subtitle: `Schema: ${s.filename} (${s.propertiesCount} properties)`,
        snippet: s.description,
        urlParams: { tab: 'schemas', selectedId: s.id },
      });
    }
  }

  // Search Evidence Probes
  for (const probe of evidenceProbes) {
    if (probe.id.toLowerCase().includes(q) || probe.title.toLowerCase().includes(q) || probe.findings.toLowerCase().includes(q)) {
      results.push({
        type: 'evidence',
        id: probe.id,
        title: `${probe.id}: ${probe.title}`,
        subtitle: `Empirical Evidence Probe [${probe.status}]`,
        snippet: probe.description.slice(0, 140).replace(/\n/g, ' ') + '...',
        urlParams: { tab: 'evidence', selectedId: probe.id },
      });
    }
  }

  // Search Sources
  for (const src of sourceCitations) {
    const numMatch = q === `#${src.number}` || q === `${src.number}` || src.citationNumbers.some(n => q === `#${n}` || q === `${n}`);
    const badgeMatch = q.includes(`docs:${src.number}`) || q.includes(`google:${src.number}`) || q.includes(`protocol:${src.number}`) || q.includes(`community:${src.number}`);
    if (
      numMatch ||
      badgeMatch ||
      src.title.toLowerCase().includes(q) ||
      src.slug.toLowerCase().includes(q) ||
      src.category.toLowerCase().includes(q) ||
      src.canonicalUrl.toLowerCase().includes(q) ||
      src.url.toLowerCase().includes(q) ||
      src.rawContent.toLowerCase().includes(q)
    ) {
      results.push({
        type: 'source',
        id: src.id,
        title: `[#${src.number.toString().padStart(2, '0')}] ${src.title}`,
        subtitle: `Archived Source (${src.category.toUpperCase()}) • ${src.referenceLocations.length} in-repo refs`,
        snippet: src.finalUrl || src.url,
        urlParams: { tab: 'sources', selectedId: src.id },
      });
    }
  }

  // Search ADRs
  for (const adr of adrRecords) {
    if (adr.title.toLowerCase().includes(q) || adr.rawContent.toLowerCase().includes(q)) {
      results.push({
        type: 'adr',
        id: adr.id,
        title: `ADR-${adr.number.toString().padStart(4, '0')}: ${adr.title}`,
        subtitle: `Architecture Decision Record (${adr.status})`,
        snippet: adr.rawContent.slice(0, 140).replace(/^[#\s*]+/, '') + '...',
        urlParams: { tab: 'adrs', selectedId: adr.id },
      });
    }
  }

  return results.slice(0, 25);
}
