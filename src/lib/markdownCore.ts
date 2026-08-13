/**
 * markdownCore.ts — the MarkdownDoc parsing core.
 *
 * Pure, browser-safe Markdown parsing: headings, sections, tables, code blocks,
 * frontmatter, and anchor slugs, plus the single-line scanners the corpus
 * indexers share (source tags, text citations, file links, works-cited
 * entries). No fs, no path, no network.
 *
 * Single home for ALL parsing — the typed YAML frontmatter parser
 * (extractFrontmatter / parseSimpleYaml / parseYamlFrontmatter) and the line
 * scanners that used to be duplicated across src/data/sourceProcessing.ts and
 * scripts/lib/evidenceRegistry.ts. One parser, two thin adapters:
 * scripts/lib/docInspector.ts adds file I/O; src/data/repository.ts is the
 * glob-backed browser store.
 */

import type { JsonValue } from '../types';

export interface Heading {
  level: number;
  title: string;
  lineNumber: number;
  raw: string;
}

/**
 * Anchor slug for a heading title — the single home for the slug rule.
 * Previously lived in src/data/repository.ts as extractHeadings' inline regex.
 */
export function headingAnchorId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

/** Extract headings the way the web app's reference viewer consumes them. */
export function extractHeadings(markdown: string): { level: number; title: string; id: string }[] {
  const doc = new MarkdownDoc(markdown);
  return doc.headings.map(h => {
    const title = h.title.replace(/\*\*/g, '').replace(/`([^`]+)`/g, '$1');
    return { level: h.level, title, id: headingAnchorId(title) };
  });
}

/**
 * Extract the raw `---...---` frontmatter block (delimiters included), or null.
 */
export function extractFrontmatterBlock(rawContent: string): string | null {
  const match = rawContent.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
  return match ? match[0] : null;
}

/**
 * Extract typed YAML frontmatter from Markdown content.
 * Returns `frontmatter: null` when the document has no (or a malformed) block.
 */
export function extractFrontmatter(content: string): { frontmatter: Record<string, JsonValue> | null; body: string } {
  const trimmed = content.trim();
  if (!trimmed.startsWith('---')) {
    return { frontmatter: null, body: content };
  }

  const match = trimmed.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n([\s\S]*))?$/);
  if (!match) {
    return { frontmatter: null, body: content };
  }

  const yamlStr = match[1];
  const body = match[2] || '';
  return { frontmatter: parseSimpleYaml(yamlStr), body };
}

/**
 * Extract typed YAML frontmatter, defaulting to an empty map when absent.
 * The tolerant counterpart of `extractFrontmatter` for callers that treat a
 * missing frontmatter block as `{}` rather than an error.
 */
export function parseYamlFrontmatter(content: string): { frontmatter: Record<string, JsonValue>; body: string } {
  const { frontmatter, body } = extractFrontmatter(content);
  return { frontmatter: frontmatter ?? {}, body };
}

/**
 * Parse a YAML-ish frontmatter block into a string map (legacy convenience).
 * Scalars are coerced to strings; nested objects and lists become JSON text.
 */
export function parseFrontmatterMap(rawContent: string): Record<string, string> {
  const { frontmatter } = parseYamlFrontmatter(rawContent);
  const meta: Record<string, string> = {};
  for (const [k, v] of Object.entries(frontmatter)) {
    if (typeof v === 'string') meta[k] = v;
    else if (typeof v === 'number' || typeof v === 'boolean' || v === null) meta[k] = String(v);
    else meta[k] = JSON.stringify(v);
  }
  return meta;
}

/**
 * Simple, resilient YAML parser supporting strings, booleans, numbers, lists,
 * and nested objects. Previously owned by src/schema/auditor.ts; consolidated
 * here so every frontmatter consumer shares one implementation.
 */
export function parseSimpleYaml(yaml: string): Record<string, JsonValue> {
  const lines = yaml.split(/\r?\n/);
  const result: Record<string, JsonValue> = {};
  let currentKey = '';
  let currentList: JsonValue[] | null = null;
  let currentNestedObj: Record<string, JsonValue> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Skip empty lines or full comment lines
    if (!line || line.startsWith('#')) continue;

    // Check for list item under a key (e.g. "  - item" or "- item")
    if (line.startsWith('- ')) {
      const itemVal = parseYamlValue(line.substring(2).trim());
      if (currentList) {
        currentList.push(itemVal);
      } else if (currentKey) {
        currentList = [itemVal];
        result[currentKey] = currentList;
      }
      continue;
    }

    // Check for nested indentation (e.g. "  key: value")
    const isIndented = rawLine.startsWith('  ') || rawLine.startsWith('\t');
    if (isIndented && currentKey && !line.startsWith('- ')) {
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const subKey = line.substring(0, colonIdx).trim();
        const subValStr = line.substring(colonIdx + 1).trim();
        const subVal = subValStr ? parseYamlValue(subValStr) : {};

        if (!currentNestedObj) {
          currentNestedObj = {};
          result[currentKey] = currentNestedObj;
        }
        currentNestedObj[subKey] = subVal;
        continue;
      }
    }

    // Root level key: value
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      currentKey = line.substring(0, colonIndex).trim();
      const valPart = line.substring(colonIndex + 1).trim();
      currentList = null;
      currentNestedObj = null;

      if (valPart === '') {
        // Will be populated by subsequent list or nested object lines
        const nested: Record<string, JsonValue> = {};
        result[currentKey] = nested;
        currentNestedObj = nested;
      } else if (valPart.startsWith('[') && valPart.endsWith(']')) {
        // JSON array format: ["a", "b"]
        try {
          result[currentKey] = JSON.parse(valPart);
        } catch {
          result[currentKey] = valPart.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
        }
      } else {
        result[currentKey] = parseYamlValue(valPart);
      }
    }
  }

  return result;
}

function parseYamlValue(val: string): JsonValue {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val === 'null' || val === '~') return null;
  // Only plain decimal literals become numbers: rejects hex (0x10), Infinity,
  // and zero-padded strings like '007' that YAML would treat as text anyway.
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(val)) {
    return Number(val);
  }
  // Strip quotes if present
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.substring(1, val.length - 1);
  }
  return val;
}

// ---------------------------------------------------------------------------
// Line scanning: source tags, text citations, file links, works-cited entries
// ---------------------------------------------------------------------------
// Pure single-line scanners consolidated from src/data/sourceProcessing.ts and
// scripts/lib/evidenceRegistry.ts, so every corpus indexer shares one home for
// the citation-matching rules.

/** One `[TAG]` or `[TAG:23,26]` badge found on a line. */
export interface CitationBadge {
  /** Tag name: DOCS | GOOGLE | PROTOCOL | COMMUNITY | INFERRED | LIVE. */
  tag: string;
  /** Citation numbers for indexed badges (`[DOCS:23,26]`); empty for bare `[DOCS]`. */
  numbers: number[];
  matchedText: string;
}

/**
 * Scan a line for source-tag badges: `[DOCS]`, `[GOOGLE:23]`, `[COMMUNITY:23,26]`.
 * (Formerly inline `tagRegex` in sourceProcessing.ts and `tagMatch` in
 * evidenceRegistry.ts.) Note `[LIVE-1.1.12 · 2026-08-13]` deliberately does not
 * match — the tag must be followed by `]` or `:numbers]`.
 */
export function scanCitationBadges(line: string): CitationBadge[] {
  const badges: CitationBadge[] = [];
  const re = /\[(DOCS|GOOGLE|PROTOCOL|COMMUNITY|INFERRED|LIVE)(?::([0-9,\s]+))?\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    const numbers = m[2]
      ? m[2].split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
      : [];
    badges.push({ tag: m[1], numbers, matchedText: m[0] });
  }
  return badges;
}

/** One textual citation mention found on a line. */
export interface TextMention {
  number: number;
  matchedText: string;
}

/**
 * Scan a line for textual citation mentions: "Source #23", "Source 23",
 * "Sources #01, #08", or footnote-style "[^23]". Only numbers 1..100 count.
 * (Formerly inline `textCitationRegex` in sourceProcessing.ts.)
 */
export function scanTextMentions(line: string): TextMention[] {
  const mentions: TextMention[] = [];
  const re = /(?:Source|Sources)\s+#?(\d+)|\[\^(\d+)\]/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    const numStr = m[1] || m[2];
    const num = parseInt(numStr, 10);
    if (!isNaN(num) && num > 0 && num <= 100) {
      mentions.push({ number: num, matchedText: m[0] });
    }
  }
  return mentions;
}

/**
 * Filenames from `filenames` that appear as substrings anywhere in the line.
 * (Formerly the `line.includes(fn)` loops in sourceProcessing.ts.)
 */
export function scanFileLinks(line: string, filenames: readonly string[]): string[] {
  const found: string[] = [];
  for (const fn of filenames) {
    if (line.includes(fn)) found.push(fn);
  }
  return found;
}

/** One parsed §19 Works Cited entry (list item or table row). */
export interface WorksCitedEntry {
  number: number;
  title: string;
  url: string;
  /** Category tag for table rows (`| 23 | [DOCS] | Title | URL |`); unset for list items. */
  tag?: string;
}

/**
 * Parse a §19 Works Cited line — either a list item ("1. Hooks — https://…")
 * or a table row ("| 23 | [DOCS] | Title | https://… |"). Returns null when the
 * line is not an entry. (Formerly inline `itemMatch` in sourceProcessing.ts and
 * `listItemRe`/`tableRowRe` in evidenceRegistry.ts.)
 */
export function parseWorksCitedEntry(line: string): WorksCitedEntry | null {
  const trimmed = line.trim();

  const table = trimmed.match(/^\|\s*(\d+)\s*\|\s*`?\[([A-Z0-9-]+)\]`?\s*\|\s*(.+?)\s*\|\s*(https?:\/\/\S+)\s*\|/);
  if (table) {
    return { number: parseInt(table[1], 10), tag: table[2], title: table[3].trim(), url: table[4].trim() };
  }

  const list = trimmed.match(/^(\d+)\.\s+(.+?)\s+—\s+(https?:\/\/\S+)/);
  if (list) {
    return { number: parseInt(list[1], 10), title: list[2].trim(), url: list[3].trim().replace(/\)$/, '') };
  }

  return null;
}

export class Cell {
  raw: string;
  clean: string;
  subValues: string[];

  constructor(raw: string, clean: string, subValues: string[] = []) {
    this.raw = raw;
    this.clean = clean;
    this.subValues = subValues;
  }

  static parse(rawText: string): Cell {
    const raw = rawText.trim();
    let clean = raw.replace(/`([^`]+)`/g, '$1');
    clean = clean.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    clean = clean.replace(/\*\*/g, '').replace(/\*/g, '').trim();

    const parts = raw
      .split(/\s*[/,]\s*/)
      .map(p => p.replace(/^[`*]+|[`*]+$/g, '').trim())
      .filter(Boolean);

    return new Cell(raw, clean, parts);
  }
}

export class MarkdownTable {
  rawHeaders: string[];
  headers: string[];
  startLine: number;
  private _parsedRows: Record<string, Cell>[] = [];

  constructor(headers: string[], rows: string[][], startLine: number = 0) {
    this.rawHeaders = [...headers];
    this.headers = headers.map(h => Cell.parse(h).clean);
    this.startLine = startLine;

    for (const r of rows) {
      const rowDict: Record<string, Cell> = {};
      for (let idx = 0; idx < this.headers.length; idx++) {
        const h = this.headers[idx];
        const cellRaw = idx < r.length ? r[idx] : '';
        rowDict[h] = Cell.parse(cellRaw);
      }
      this._parsedRows.push(rowDict);
    }
  }

  get rowCount(): number {
    return this._parsedRows.length;
  }

  get rows(): Record<string, Cell>[] {
    return this._parsedRows;
  }

  columnValues(columnName: string, stripCode: boolean = true): string[] {
    const normName = columnName.trim().toLowerCase();
    let matchingHeader: string | null = null;
    for (const h of this.headers) {
      if (h.toLowerCase() === normName) {
        matchingHeader = h;
        break;
      }
    }
    if (!matchingHeader) {
      return [];
    }

    const values: string[] = [];
    for (const r of this._parsedRows) {
      const cell = r[matchingHeader];
      if (cell) {
        values.push(stripCode ? cell.clean : cell.raw);
      }
    }
    return values;
  }

  asDicts(stripCode: boolean = true): Record<string, string>[] {
    const out: Record<string, string>[] = [];
    for (const r of this._parsedRows) {
      const row: Record<string, string> = {};
      for (const [k, v] of Object.entries(r)) {
        row[k] = stripCode ? v.clean : v.raw;
      }
      out.push(row);
    }
    return out;
  }
}

export interface CodeBlock {
  language: string;
  content: string;
  startLine: number;
}

export class Section {
  heading: Heading | null;
  content: string;
  startLine: number;
  private _tables: MarkdownTable[] | null = null;
  private _codeBlocks: CodeBlock[] | null = null;

  constructor(heading: Heading | null, content: string, startLine: number = 0) {
    this.heading = heading;
    this.content = content;
    this.startLine = startLine;
  }

  get title(): string {
    return this.heading ? this.heading.title : 'Root';
  }

  get level(): number {
    return this.heading ? this.heading.level : 0;
  }

  get tables(): MarkdownTable[] {
    if (this._tables === null) {
      this._tables = parseTablesFromText(this.content, this.startLine);
    }
    return this._tables;
  }

  getTable(index: number = 0): MarkdownTable | null {
    const tables = this.tables;
    if (index >= 0 && index < tables.length) {
      return tables[index];
    }
    return null;
  }

  get codeBlocks(): CodeBlock[] {
    if (this._codeBlocks === null) {
      this._codeBlocks = parseCodeBlocksFromText(this.content, this.startLine);
    }
    return this._codeBlocks;
  }
}

export class MarkdownDoc {
  text: string;
  sourcePath: string | null;
  filename: string;
  lines: string[];
  private _headings: Heading[] | null = null;
  private _sections: Section[] | null = null;

  constructor(text: string, filename: string = '<in-memory>', sourcePath: string | null = null) {
    this.text = text;
    this.filename = filename;
    this.sourcePath = sourcePath;
    this.lines = text.split(/\r?\n/);
  }

  static fromText(text: string, filename: string = '<in-memory>'): MarkdownDoc {
    return new MarkdownDoc(text, filename);
  }

  get headings(): Heading[] {
    if (this._headings === null) {
      this._headings = [];
      let inCode = false;
      for (let idx = 0; idx < this.lines.length; idx++) {
        const line = this.lines[idx];
        const lineNumber = idx + 1;
        const stripped = line.trim();
        if (stripped.startsWith('```')) {
          inCode = !inCode;
          continue;
        }
        if (inCode) {
          continue;
        }

        const m = stripped.match(/^(#{1,6})\s+(.+)$/);
        if (m) {
          const level = m[1].length;
          const title = m[2].trim();
          this._headings.push({ level, title, lineNumber, raw: line });
        }
      }
    }
    return this._headings;
  }

  get sections(): Section[] {
    if (this._sections === null) {
      this._sections = [];
      const headings = this.headings;
      if (headings.length === 0) {
        this._sections.push(new Section(null, this.text, 1));
        return this._sections;
      }

      const firstHLine = headings[0].lineNumber;
      if (firstHLine > 1) {
        const preText = this.lines.slice(0, firstHLine - 1).join('\n');
        this._sections.push(new Section(null, preText, 1));
      }

      for (let i = 0; i < headings.length; i++) {
        const h = headings[i];
        const startL = h.lineNumber;
        let endL = this.lines.length;
        for (let j = i + 1; j < headings.length; j++) {
          const nextH = headings[j];
          if (nextH.level <= h.level) {
            endL = nextH.lineNumber - 1;
            break;
          }
        }
        const secText = this.lines.slice(startL - 1, endL).join('\n');
        this._sections.push(new Section(h, secText, startL));
      }
    }
    return this._sections;
  }

  getSection(pattern: string | RegExp): Section | null {
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
    for (const sec of this.sections) {
      if (sec.heading && (sec.heading.title === pattern || regex.test(sec.heading.title))) {
        return sec;
      }
    }
    return null;
  }

  get tables(): MarkdownTable[] {
    return parseTablesFromText(this.text, 1);
  }

  findAllEvIds(): Set<string> {
    const evIds = new Set<string>();
    const matches = this.text.match(/\b(EV-\d{3})\b/g);
    if (matches) {
      for (const m of matches) {
        evIds.add(m);
      }
    }
    return evIds;
  }

  validateHeadingHierarchy(): string[] {
    const errors: string[] = [];
    let prevLevel = 0;
    for (const h of this.headings) {
      if (prevLevel > 0 && h.level > prevLevel + 1) {
        errors.push(
          `${this.filename}:${h.lineNumber} invalid heading jump: H${prevLevel} -> H${h.level} ('${h.title}')`
        );
      }
      prevLevel = h.level;
    }
    return errors;
  }
}

export function parseTablesFromText(text: string, startLineOffset: number = 1): MarkdownTable[] {
  const tables: MarkdownTable[] = [];
  const lines = text.split(/\r?\n/);
  let inCode = false;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const stripped = line.trim();
    if (stripped.startsWith('```')) {
      inCode = !inCode;
      i++;
      continue;
    }
    if (inCode) {
      i++;
      continue;
    }

    if (line.includes('|') && i + 1 < lines.length) {
      const sepLine = lines[i + 1].trim();
      if (/^\|?[\s:]*\-{3,}[\s:]*(\|[\s:]*-{3,}[\s:]*)+\|?$/.test(sepLine)) {
        const tableStartLine = startLineOffset + i;
        const headers = line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        const tableRows: string[][] = [];
        i += 2;

        while (i < lines.length) {
          const rowLine = lines[i].trim();
          if (!rowLine || !rowLine.includes('|')) {
            break;
          }
          const rowCells = rowLine.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
          tableRows.push(rowCells);
          i++;
        }

        tables.push(new MarkdownTable(headers, tableRows, tableStartLine));
        continue;
      }
    }
    i++;
  }

  return tables;
}

export function parseCodeBlocksFromText(text: string, startLineOffset: number = 1): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const lines = text.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const startL = startLineOffset + i;
      const blockLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        blockLines.push(lines[i]);
        i++;
      }
      blocks.push({ language: lang, content: blockLines.join('\n'), startLine: startL });
    }
    i++;
  }
  return blocks;
}
