#!/usr/bin/env python3
"""Markdown AST Inspector and Semantic Document Object.

Deep module encapsulating Markdown section slicing, table extraction,
heading hierarchy analysis, and evidence citation discovery with zero external dependencies.
"""
from __future__ import annotations

from dataclasses import dataclass, field
import os
from pathlib import Path
import re
from typing import Any, Dict, List, Optional, Sequence, Set, Tuple


@dataclass(frozen=True)
class Heading:
    """Represents a Markdown heading line."""
    level: int
    title: str
    line_number: int
    raw: str


@dataclass
class Cell:
    """Represents a single cell in a Markdown table."""
    raw: str
    clean: str
    sub_values: List[str] = field(default_factory=list)

    @classmethod
    def parse(cls, raw_text: str) -> Cell:
        raw = raw_text.strip()
        # Clean: strip markdown code backticks, italics/bold markers, and link formatting
        clean = re.sub(r"`([^`]+)`", r"\1", raw)
        clean = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", clean)
        clean = clean.replace("**", "").replace("*", "").strip()

        # Sub-values split on common delimiters (slash, comma, or newline)
        parts = [p.strip(" `*") for p in re.split(r"\s*[/,]\s*", raw) if p.strip(" `*")]
        return cls(raw=raw, clean=clean, sub_values=parts)


class MarkdownTable:
    """Structured representation of a GitHub Flavored Markdown table."""

    def __init__(self, headers: Sequence[str], rows: Sequence[Sequence[str]], start_line: int = 0):
        self.raw_headers = list(headers)
        self.headers = [Cell.parse(h).clean for h in headers]
        self.start_line = start_line
        self._parsed_rows: List[Dict[str, Cell]] = []
        for r in rows:
            row_dict: Dict[str, Cell] = {}
            for idx, h in enumerate(self.headers):
                cell_raw = r[idx] if idx < len(r) else ""
                row_dict[h] = Cell.parse(cell_raw)
            self._parsed_rows.append(row_dict)

    @property
    def row_count(self) -> int:
        return len(self._parsed_rows)

    @property
    def rows(self) -> List[Dict[str, Cell]]:
        return self._parsed_rows

    def column_values(self, column_name: str, strip_code: bool = True) -> List[str]:
        """Returns values for a column across all rows."""
        norm_name = column_name.strip()
        matching_header = None
        for h in self.headers:
            if h.lower() == norm_name.lower():
                matching_header = h
                break
        if not matching_header:
            return []

        values = []
        for r in self._parsed_rows:
            cell = r.get(matching_header)
            if cell:
                values.append(cell.clean if strip_code else cell.raw)
        return values

    def as_dicts(self, strip_code: bool = True) -> List[Dict[str, str]]:
        """Returns rows as simple string dictionaries."""
        out = []
        for r in self._parsed_rows:
            out.append({k: (v.clean if strip_code else v.raw) for k, v in r.items()})
        return out


@dataclass
class CodeBlock:
    """Represents a fenced code block."""
    language: str
    content: str
    start_line: int


class Section:
    """Represents a contiguous section under a Markdown heading."""

    def __init__(self, heading: Optional[Heading], content: str, start_line: int = 0):
        self.heading = heading
        self.content = content
        self.start_line = start_line
        self._tables: Optional[List[MarkdownTable]] = None
        self._code_blocks: Optional[List[CodeBlock]] = None

    @property
    def title(self) -> str:
        return self.heading.title if self.heading else "Root"

    @property
    def level(self) -> int:
        return self.heading.level if self.heading else 0

    @property
    def tables(self) -> List[MarkdownTable]:
        if self._tables is None:
            self._tables = parse_tables_from_text(self.content, self.start_line)
        return self._tables

    def get_table(self, index: int = 0) -> Optional[MarkdownTable]:
        tables = self.tables
        if 0 <= index < len(tables):
            return tables[index]
        return None

    @property
    def code_blocks(self) -> List[CodeBlock]:
        if self._code_blocks is None:
            self._code_blocks = parse_code_blocks_from_text(self.content, self.start_line)
        return self._code_blocks


class MarkdownDoc:
    """High-leverage semantic document inspector for Markdown files."""

    def __init__(self, text: str, source_path: Optional[str] = None):
        self.text = text
        self.source_path = source_path
        self.filename = os.path.basename(source_path) if source_path else "<in-memory>"
        self.lines = text.splitlines()
        self._headings: Optional[List[Heading]] = None
        self._sections: Optional[List[Section]] = None

    @classmethod
    def from_file(cls, path: str | Path) -> MarkdownDoc:
        path_str = str(path)
        with open(path_str, "r", encoding="utf-8") as fh:
            return cls(fh.read(), source_path=path_str)

    @classmethod
    def from_text(cls, text: str, filename: str = "<in-memory>") -> MarkdownDoc:
        return cls(text, source_path=filename)

    @property
    def headings(self) -> List[Heading]:
        if self._headings is None:
            self._headings = []
            in_code = False
            for idx, line in enumerate(self.lines, start=1):
                stripped = line.strip()
                if stripped.startswith("```"):
                    in_code = not in_code
                    continue
                if in_code:
                    continue

                m = re.match(r"^(#{1,6})\s+(.+)$", stripped)
                if m:
                    level = len(m.group(1))
                    title = m.group(2).strip()
                    self._headings.append(Heading(level=level, title=title, line_number=idx, raw=line))
        return self._headings

    @property
    def sections(self) -> List[Section]:
        if self._sections is None:
            self._sections = []
            headings = self.headings
            if not headings:
                self._sections.append(Section(None, self.text, start_line=1))
                return self._sections

            # Pre-heading content (if any)
            first_h_line = headings[0].line_number
            if first_h_line > 1:
                pre_text = "\n".join(self.lines[: first_h_line - 1])
                self._sections.append(Section(None, pre_text, start_line=1))

            for i, h in enumerate(headings):
                start_l = h.line_number
                # Section extends until next heading with level <= current heading level, or EOF
                end_l = len(self.lines)
                for next_h in headings[i + 1 :]:
                    if next_h.level <= h.level:
                        end_l = next_h.line_number - 1
                        break
                sec_text = "\n".join(self.lines[start_l - 1 : end_l])
                self._sections.append(Section(h, sec_text, start_line=start_l))
        return self._sections

    def get_section(self, pattern: str) -> Optional[Section]:
        """Find section by exact title or regex pattern."""
        regex = re.compile(pattern, re.IGNORECASE)
        for sec in self.sections:
            if sec.heading and (sec.heading.title == pattern or regex.search(sec.heading.title)):
                return sec
        return None

    @property
    def tables(self) -> List[MarkdownTable]:
        return parse_tables_from_text(self.text, start_line_offset=1)

    def find_all_ev_ids(self) -> Set[str]:
        """Finds all EV-### empirical IDs cited in this document."""
        return set(re.findall(r"\b(EV-\d{3})\b", self.text))

    def validate_heading_hierarchy(self) -> List[str]:
        """Verifies correct markdown heading nesting hierarchy."""
        errors = []
        prev_level = 0
        for h in self.headings:
            if prev_level > 0 and h.level > prev_level + 1:
                errors.append(
                    f"{self.filename}:{h.line_number} invalid heading jump: H{prev_level} -> H{h.level} ('{h.title}')"
                )
            prev_level = h.level
        return errors


def parse_tables_from_text(text: str, start_line_offset: int = 1) -> List[MarkdownTable]:
    """Parses GFM tables from a block of text."""
    tables: List[MarkdownTable] = []
    lines = text.splitlines()
    in_code = False
    i = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        if stripped.startswith("```"):
            in_code = not in_code
            i += 1
            continue
        if in_code:
            i += 1
            continue

        # Look for table header line followed by separator row
        if "|" in line and i + 1 < len(lines):
            sep_line = lines[i + 1].strip()
            # GFM separator: |---|---| or |:---|:---:|---:|
            if re.match(r"^\|?[\s:]*-{3,}[\s:]*(\|[\s:]*-{3,}[\s:]*)+\|?$", sep_line):
                table_start_line = start_line_offset + i
                headers = [c.strip() for c in line.strip().strip("|").split("|")]
                table_rows: List[List[str]] = []
                i += 2  # Skip header and separator

                while i < len(lines):
                    row_line = lines[i].strip()
                    if not row_line or not ("|" in row_line):
                        break
                    row_cells = [c.strip() for c in row_line.strip("|").split("|")]
                    table_rows.append(row_cells)
                    i += 1

                tables.append(MarkdownTable(headers=headers, rows=table_rows, start_line=table_start_line))
                continue
        i += 1

    return tables


def parse_code_blocks_from_text(text: str, start_line_offset: int = 1) -> List[CodeBlock]:
    """Parses fenced code blocks from a block of text."""
    blocks: List[CodeBlock] = []
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith("```"):
            lang = line[3:].strip()
            start_l = start_line_offset + i
            block_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                block_lines.append(lines[i])
                i += 1
            blocks.append(CodeBlock(language=lang, content="\n".join(block_lines), start_line=start_l))
        i += 1
    return blocks


# --- Self-Test Harness ---
if __name__ == "__main__":
    print("Running MarkdownDoc Inspector unit tests...")

    sample_md = """# Preamble

Some introductory prose.

| Name | Type | Notes |
|---|---|---|
| `toolPermission` | string | Gate permission |
| `commandExecutionPolicy` | enum | `sandbox`, `auto` |

## 5.5 Complete settings.json Schema

### Custom Scripts

| Script Name | Command |
|---|---|
| `title` | `path/to/title.sh` |

```python
def example():
    return True
```
"""
    doc = MarkdownDoc.from_text(sample_md, filename="sample.md")

    # 1. Test headings
    assert len(doc.headings) == 3, f"Expected 3 headings, got {len(doc.headings)}"
    assert doc.headings[0].title == "Preamble"
    assert doc.headings[1].level == 2
    assert len(doc.validate_heading_hierarchy()) == 0

    # 2. Test sections
    sec55 = doc.get_section("5.5 Complete")
    assert sec55 is not None, "Section 5.5 not found"
    assert len(sec55.tables) == 1, f"Expected 1 table in sec 5.5, got {len(sec55.tables)}"

    # 3. Test table parsing
    t = sec55.tables[0]
    assert t.headers == ["Script Name", "Command"]
    assert t.column_values("Script Name") == ["title"]

    # 4. Test root tables
    all_tables = doc.tables
    assert len(all_tables) == 2, f"Expected 2 total tables, got {len(all_tables)}"
    assert "toolPermission" in all_tables[0].column_values("Name")
    assert "commandExecutionPolicy" in all_tables[0].column_values("Name")

    # 5. Test code block extraction
    blocks = sec55.code_blocks
    assert len(blocks) == 1
    assert blocks[0].language == "python"
    assert "def example():" in blocks[0].content

    print("✓ All doc_inspector unit tests passed cleanly.")
