#!/usr/bin/env node
/**
 * Archive cited sources from reference/19-works-cited.md into evidence/sources/.
 *
 * TypeScript port of fetch_sources.py (ADR-0005).
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { EvidenceRegistry, Citation, readSnapshotHeader } from './lib/evidenceRegistry';

const ROOT = process.cwd();
const ARCHIVE_DIR = path.join(ROOT, 'evidence', 'sources');
const INDEX_PATH = path.join(ARCHIVE_DIR, 'index.md');

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const FETCH_TIMEOUT_MS = 30000;

const SOFT_404_URL_PATTERNS = [
  'trk=article_not_found',
  '/404',
  'page_not_found',
  'article_not_found',
  '/error/404',
];

const SOFT_404_TEXT_PATTERNS = [
  'we can’t find the page',
  'we cannot find the page',
  'page you’re looking for may have been moved',
  '404 not found',
  '404: this page could not be found',
];

function escapeYamlScalar(s: string): string {
  if (s.includes('"') || s.includes(':') || s.includes('{') || s.includes('}') || s.trim() !== s) {
    return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  }
  return s;
}

function cleanHtmlChrome(html: string): string {
  // Remove scripts, styles, noscript, svg, nav, header, footer, aside
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '');

  // Extract main/article content if present
  const mainMatch = cleaned.match(/<(main|article|div[^>]*class="[^"]*(?:markdown-body|theme-doc-markdown|main-content)[^"]*")[^>]*>([\s\S]*?)<\/\1>/i);
  if (mainMatch && mainMatch[2] && mainMatch[2].length > 200) {
    cleaned = mainMatch[2];
  }

  return cleaned;
}

function htmlToMarkdown(html: string): string {
  const contentHtml = cleanHtmlChrome(html);
  const pandoc = spawnSync('pandoc', ['-f', 'html', '-t', 'gfm', '--wrap=none', '-'], {
    input: contentHtml,
    encoding: 'utf-8',
    maxBuffer: 50 * 1024 * 1024,
  });

  if (pandoc.error || pandoc.status !== 0) {
    // Fallback if pandoc is not installed: strip remaining HTML tags
    return contentHtml
      .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
      .replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  return pandoc.stdout;
}

async function fetchUrl(url: string, insecure: boolean = false): Promise<{ status: number; finalUrl: string; body: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    if (insecure) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    const resp = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
    });

    const status = resp.status;
    const finalUrl = resp.url || url;
    const text = await resp.text();

    const finalLower = finalUrl.toLowerCase();
    const textLower = text.toLowerCase();

    if (
      SOFT_404_URL_PATTERNS.some(p => finalLower.includes(p)) ||
      SOFT_404_TEXT_PATTERNS.some(p => textLower.includes(p))
    ) {
      throw new Error(`Soft 404 (Page Not Found) at ${finalUrl}`);
    }

    return { status, finalUrl, body: text };
  } finally {
    clearTimeout(timeoutId);
  }
}

function writeSnapshot(citation: Citation, status: number | string, finalUrl: string, fetchedDate: string, markdownBody: string): string {
  const folder = path.join(ARCHIVE_DIR, citation.category);
  fs.mkdirSync(folder, { recursive: true });

  const numPadded = String(citation.number).padStart(2, '0');
  const filePath = path.join(folder, `${numPadded}-${citation.slug}.md`);

  const header = [
    '---',
    `source: ${citation.number}`,
    `category: ${escapeYamlScalar(citation.category)}`,
    `title: ${escapeYamlScalar(citation.title)}`,
    `url: ${escapeYamlScalar(citation.url)}`,
    `final_url: ${escapeYamlScalar(finalUrl)}`,
    `fetched: ${escapeYamlScalar(fetchedDate)}`,
    `status: ${status}`,
    '---',
    '',
  ].join('\n');

  fs.writeFileSync(filePath, header + markdownBody.trim() + '\n', 'utf-8');
  return filePath;
}

export async function run(): Promise<number> {
  const args = process.argv.slice(2);
  const categories: string[] = [];
  let force = false;
  let check = false;
  let prune = false;
  let insecure = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--category' && i + 1 < args.length) {
      categories.push(args[++i].toLowerCase());
    } else if (arg.startsWith('--category=')) {
      categories.push(arg.slice('--category='.length).toLowerCase());
    } else if (arg === '--force') {
      force = true;
    } else if (arg === '--check') {
      check = true;
    } else if (arg === '--prune') {
      prune = true;
    } else if (arg === '--insecure') {
      insecure = true;
    }
  }

  const reg = EvidenceRegistry.load(ROOT);
  const citations = reg.citations;

  if (citations.length === 0) {
    console.error('error: no citations parsed from reference/19-works-cited.md');
    return 1;
  }

  if (prune) {
    const orphans = reg.findOrphanSnapshots();
    if (orphans.length === 0) {
      console.log('ok: no orphaned snapshot files found');
    } else {
      for (const p of orphans) {
        fs.unlinkSync(p);
        console.log(`pruned: ${path.relative(ROOT, p)}`);
      }
    }
    if (!check && !force && categories.length === 0) {
      reg.syncManifestFile();
      console.log(`wrote ${path.relative(ROOT, INDEX_PATH)}`);
      return 0;
    }
  }

  if (check) {
    const missing = reg.findMissingSnapshots();
    const orphans = reg.findOrphanSnapshots();
    const manifestSync = reg.isManifestInSync();

    for (const p of missing) {
      console.error(`missing: ${path.relative(ROOT, p)}`);
    }
    for (const p of orphans) {
      console.error(`orphan:  ${path.relative(ROOT, p)}`);
    }
    if (!manifestSync) {
      console.error('stale: evidence/sources/index.md differs from the archive (run fetch_sources.ts)');
    }

    if (missing.length === 0 && orphans.length === 0 && manifestSync) {
      console.log(`ok: all ${citations.length} citations are archived and index.md is in sync`);
      return 0;
    }
    return 1;
  }

  const scope = categories.length > 0 ? categories : ['docs', 'google', 'protocol', 'community'];
  const selected = citations.filter(c => scope.includes(c.category));
  console.log(`scope: ${selected.length} citations (${scope.join(', ')})`);

  const fetchedDate = new Date().toISOString().split('T')[0];
  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const c of selected) {
    if (c.isDuplicate) continue;

    const snapPath = c.snapshotPath;
    if (fs.existsSync(snapPath) && !force) {
      console.log(`skip  #${String(c.number).padStart(2, '0')} ${c.category.padEnd(9)} ${path.basename(snapPath)} (exists; use --force to re-fetch)`);
      skip++;
      continue;
    }

    try {
      const { status, finalUrl, body } = await fetchUrl(c.url, insecure);
      const markdown = htmlToMarkdown(body);
      writeSnapshot(c, status, finalUrl, fetchedDate, markdown);
      console.log(`ok    #${String(c.number).padStart(2, '0')} ${c.category.padEnd(9)} ${path.basename(snapPath)} (${status}, ${markdown.split('\n').length} lines)`);
      ok++;
    } catch (err: any) {
      console.error(`FAIL  #${String(c.number).padStart(2, '0')} ${c.category.padEnd(9)} ${c.url} -> ${err.message || err}`);
      fail++;
    }
  }

  reg.syncManifestFile();
  console.log(`wrote ${path.relative(ROOT, INDEX_PATH)}`);
  console.log(`done: ${ok} fetched, ${skip} skipped, ${fail} failed`);

  return fail === 0 ? 0 : 1;
}

if (process.argv[1]?.endsWith('fetch_sources.ts')) {
  run().then(code => process.exit(code)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
