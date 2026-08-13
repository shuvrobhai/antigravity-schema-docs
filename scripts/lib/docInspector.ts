/**
 * docInspector.ts — the CLI adapter over the MarkdownDoc Core.
 *
 * All parsing lives in src/lib/markdownCore.ts (pure, browser-safe). This module
 * only adds file I/O: MarkdownDoc.fromFile() plus the legacy exports, so
 * existing callers (validate.ts, evidenceRegistry.ts) keep working unchanged.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  MarkdownDoc as CoreMarkdownDoc,
  Cell,
  MarkdownTable,
  Section,
  parseTablesFromText,
  parseCodeBlocksFromText,
} from '../../src/lib/markdownCore';
import type { Heading, CodeBlock } from '../../src/lib/markdownCore';

export { Cell, MarkdownTable, Section, parseTablesFromText, parseCodeBlocksFromText };
export type { Heading, CodeBlock };

export class MarkdownDoc extends CoreMarkdownDoc {
  static fromFile(filePath: string): MarkdownDoc {
    const text = fs.readFileSync(filePath, 'utf-8');
    return new MarkdownDoc(text, path.basename(filePath), filePath);
  }
}
