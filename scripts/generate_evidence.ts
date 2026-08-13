import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { parseYamlFrontmatter } from '../src/lib/markdownCore';

const ROOT = process.cwd();
const EVIDENCE_ROOT = path.join(ROOT, 'evidence');

export interface ProbeFrontmatter {
  probe_id: string;
  title: string;
  status: string;
  version: string;
  executed_at: string;
  platform?: string;
  authority_tier: string;
  category: string;
  tags?: string[];
  source_refs?: string[];
  artifact?: string;
}

export interface SourceFrontmatter {
  source?: number;
  source_id?: string;
  authority_tier?: string;
  category?: string;
  title?: string;
  url?: string;
  final_url?: string;
  fetched?: string;
  retrieved_at?: string;
  status?: number | string;
  sha256?: string;
  refs?: string[];
  file_path?: string;
}

export interface ReportFrontmatter {
  report_id: string;
  title: string;
  status: string;
  date: string;
  scope?: string[];
  source_refs?: string[];
  evidence_refs?: string[];
}

export function generateProbeIndex(version: string = 'agy-1.1.12'): string {
  const versionDir = path.join(EVIDENCE_ROOT, 'probes', version);
  if (!fs.existsSync(versionDir)) return '';

  const files = fs.readdirSync(versionDir).filter(f => /^EV-\d{3}\.md$/.test(f)).sort();
  const rows: string[] = [];

  for (const f of files) {
    const content = fs.readFileSync(path.join(versionDir, f), 'utf-8');
    const { frontmatter } = parseYamlFrontmatter(content);
    const id = frontmatter.probe_id || f.replace('.md', '');
    const title = frontmatter.title || 'Untitled Probe';
    const status = frontmatter.status || 'RESOLVED';
    const category = frontmatter.category || 'CLI & Agent Internals';
    const executedAt = frontmatter.executed_at || '2026-08-13';
    const refs = Array.isArray(frontmatter.source_refs) ? frontmatter.source_refs.join(', ') : '';

    rows.push(`| [${id}](${f}) | ${title} | ${status} | ${category} | ${executedAt} | ${refs} |`);
  }

  return `# Evidence Probes — ${version}

<!-- Generated from probes/${version}/EV-*.md — do not edit. -->

| Probe ID | Title | Status | Category | Executed At | Source Refs |
|---|---|---|---|---|---|
${rows.join('\n')}
`;
}

export function compileAggregateProbeFile(version: string = 'agy-1.1.12'): string {
  const versionDir = path.join(EVIDENCE_ROOT, 'probes', version);
  if (!fs.existsSync(versionDir)) return '';

  const files = fs.readdirSync(versionDir).filter(f => /^EV-\d{3}\.md$/.test(f)).sort();

  const summaryRows: string[] = [];
  const probeSections: string[] = [];

  for (const f of files) {
    const content = fs.readFileSync(path.join(versionDir, f), 'utf-8');
    const { frontmatter, body } = parseYamlFrontmatter(content);
    const id = typeof frontmatter.probe_id === 'string' ? frontmatter.probe_id : f.replace('.md', '');
    const title = frontmatter.title || 'Untitled Probe';
    const resultSummary = Array.isArray(frontmatter.tags) ? frontmatter.tags.join(', ') : 'verified';

    summaryRows.push(`| ${id} | ${title} | ${frontmatter.status || 'RESOLVED'} |`);

    // Clean body and ensure standard EV anchor and section header
    const cleanBody = body.trim();
    probeSections.push(`## ${id} — ${title}\n<a id="${id.toLowerCase()}"></a>\n\n${cleanBody}`);
  }

  return `# Master Evidence File — Antigravity CLI Live Verification

<!-- Generated from probes/${version}/EV-*.md — do not edit. -->

**Live binary:** agy 1.1.12  
**Date:** 2026-08-13  
**Platform:** macOS Darwin 25.4.0 / arm64  
**Redaction:** \`<HOME>\` replaces the user home directory path.

---

## Evidence Summary

| ID | Subject | Result |
|----|---------|--------|
${summaryRows.join('\n')}

---

${probeSections.join('\n\n---\n\n')}
`;
}

export function generateReportIndex(): string {
  const reportsDir = path.join(EVIDENCE_ROOT, 'reports');
  if (!fs.existsSync(reportsDir)) return '';

  const files = fs.readdirSync(reportsDir).filter(f => /^R-\d{3}.*\.md$/.test(f)).sort();
  const rows: string[] = [];

  for (const f of files) {
    const content = fs.readFileSync(path.join(reportsDir, f), 'utf-8');
    const { frontmatter } = parseYamlFrontmatter(content);
    const id = frontmatter.report_id || f.replace(/\.md$/, '');
    const title = frontmatter.title || f;
    const status = frontmatter.status || 'Complete';
    const date = frontmatter.date || '2026-08-14';
    const scope = Array.isArray(frontmatter.scope) ? frontmatter.scope.join(', ') : '';
    const srcRefs = Array.isArray(frontmatter.source_refs) ? frontmatter.source_refs.join(', ') : '';
    const evRefs = Array.isArray(frontmatter.evidence_refs) ? frontmatter.evidence_refs.join(', ') : '';

    rows.push(`| [${id}](${f}) | ${title} | ${status} | ${date} | ${scope} | ${srcRefs} | ${evRefs} |`);
  }

  return `# Evidence Research Reports & Synthesis Whitepapers

<!-- Generated from reports/R-*.md frontmatter — do not edit. -->

| ID | Title | Status | Date | Scope | Source Refs | Evidence Refs |
|---|---|---|---|---|---|---|
${rows.join('\n')}
`;
}

export function generateMasterIndex(): string {
  const probeIndexContent = generateProbeIndex('agy-1.1.12');
  const reportIndexContent = generateReportIndex();

  return `# Google Antigravity Evidence Registry & Grounding Hub

<!-- Generated from evidence/probes/ and evidence/reports/ — do not edit by hand. -->

This directory contains the complete empirical grounding suite, archived web citations, and technical research whitepapers backing all claims in the Google Antigravity Technical Reference (\`antigravity-reference.md\`).

---

## 1. Evidence Directory Organization

\`\`\`text
evidence/
├── index.md                          # Master Grounding Registry & Cross-Matrix
│
├── probes/                           # Atomic Empirical Probe Runs
│   └── agy-1.1.12/
│       ├── index.md                  # Probe status summary for this version
│       ├── EV-001.md                 # Atomic probe specification
│       └── ...
│
├── sources/                          # Point-in-time Web Citations (S-001 .. S-046)
│   ├── index.md                      # Snapshot manifest & hash table
│   ├── docs/                         # Official developer docs (01..30)
│   ├── google/                       # Google Cloud & SDK repos (31..38)
│   ├── protocol/                     # Protocol specifications (39)
│   └── community/                    # Third-party reverse engineering (40..46)
│
├── reports/                          # Synthesized Architectural Research Whitepapers
│   ├── index.md                      # Reports manifest
│   └── R-001-behavioral-contracts.md # Synthesis whitepaper
│
├── artifacts/                        # Raw Terminal Logs & Transcripts
│   └── agy-1.1.12/
│       ├── outputs/                  # Raw stdout/stderr dumps
│       └── transcripts/              # Full session logs
│
├── templates/                        # Authoring Blueprints
│   ├── probe-template.md
│   ├── source-template.md
│   └── report-template.md
│
└── agy-1.1.12/                       # Generated aggregate (backward-compatible)
    └── evidence.md                   # Compiled from probes/agy-1.1.12/EV-*.md
\`\`\`

---

## 2. Source Authority Precedence Hierarchy

| Tier | Tag | Category | Description |
|---|---|---|---|
| **Rank 1** | \`[DOCS]\` | Official Documentation | First-party technical reference & developer manuals (highest authority). |
| **Rank 2** | \`[LIVE]\` | Empirical Observation | Live CLI/TUI instrumentation probe logged under \`evidence/probes/agy-1.1.12/\`. |
| **Rank 3** | \`[GOOGLE]\` | Google Corporate / Cloud | Official Google blog announcements, architecture whitepapers & SDK repos. |
| **Rank 4** | \`[PROTOCOL]\` | Protocol Specification | Standardized protocol specifications (Model Context Protocol, LSP, SSE RFC). |
| **Rank 5** | \`[COMMUNITY]\` | Community / Third-Party | Verified reverse-engineering findings, developer articles & issue trackers. |
| **Rank 6** | \`[INFERRED]\` | Inferred Hypothesis | Synthetic deduction pending live instrumentation or vendor confirmation. |

---

## 3. Empirical Probe Grounding Matrix (agy-1.1.12)

${probeIndexContent.replace(/^# Evidence Probes — [^\n]+\n+<!--[^\n]+-->\n+/, '').trim()}

---

## 4. Synthesized Technical Research Reports

${reportIndexContent.replace(/^# Evidence Research Reports[^\n]+\n+<!--[^\n]+-->\n+/, '').trim()}
`;
}

export function runEvidenceGeneration(checkOnly: boolean = false): boolean {
  const targetFiles: { path: string; generator: () => string }[] = [
    {
      path: path.join(EVIDENCE_ROOT, 'probes', 'agy-1.1.12', 'index.md'),
      generator: () => generateProbeIndex('agy-1.1.12'),
    },
    {
      path: path.join(EVIDENCE_ROOT, 'reports', 'index.md'),
      generator: generateReportIndex,
    },
    {
      path: path.join(EVIDENCE_ROOT, 'index.md'),
      generator: generateMasterIndex,
    },
    {
      path: path.join(EVIDENCE_ROOT, 'agy-1.1.12', 'evidence.md'),
      generator: () => compileAggregateProbeFile('agy-1.1.12'),
    },
  ];

  let hasDiff = false;

  for (const item of targetFiles) {
    const parentDir = path.dirname(item.path);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    const newContent = item.generator();
    const existingContent = fs.existsSync(item.path) ? fs.readFileSync(item.path, 'utf-8') : '';

    if (newContent !== existingContent) {
      hasDiff = true;
      const rel = path.relative(ROOT, item.path);
      if (checkOnly) {
        console.error(`[STALE] ${rel} is out of date. Run npm run generate:evidence to update.`);
      } else {
        fs.writeFileSync(item.path, newContent, 'utf-8');
        console.log(`[GENERATED] ${rel}`);
      }
    } else if (!checkOnly) {
      console.log(`[IN SYNC] ${path.relative(ROOT, item.path)}`);
    }
  }

  return !hasDiff;
}

if (process.argv[1] && process.argv[1].endsWith('generate_evidence.ts')) {
  const isCheck = process.argv.includes('--check');
  const inSync = runEvidenceGeneration(isCheck);
  if (isCheck && !inSync) {
    process.exit(1);
  }
}
