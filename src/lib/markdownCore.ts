/**
 * markdownCore.ts — the MarkdownDoc parsing core.
 *
 * Pure, browser-safe Markdown parsing: headings, sections, tables, code blocks,
 * frontmatter, and anchor slugs. No fs, no path, no network.
 *
 * The CLI adapter (scripts/lib/docInspector.ts) adds file I/O on top; the web app
 * imports this module directly. One parser, two thin adapters.
 */

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

/** Parse a YAML-ish frontmatter block into a string map. */
export function parseFrontmatterMap(rawContent: string): Record<string, string> {
  const frontmatterMatch = rawContent.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
  const meta: Record<string, string> = {};

  if (frontmatterMatch) {
    const yamlBody = frontmatterMatch[1];
    const lines = yamlBody.split('\n');
    for (const line of lines) {
      const match = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        val = val.replace(/^["']|["']$/g, '');
        meta[key] = val;
      }
    }
  }
  return meta;
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
