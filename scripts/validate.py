#!/usr/bin/env python3
"""Unified repository validator for Google Antigravity schema & reference docs.

Runs comprehensive consistency, composition, and integrity checks across the workspace:
  1. Module Contiguity: contiguous 00..NN numbering in reference/
  2. Composition Build Sync: antigravity-reference.md matches compose() output
  3. Table of Contents Sync: 00-preamble.md TOC matches module headings
  4. Heading Hierarchy: no invalid heading nesting (e.g. H2 subheadings under H2)
  5. Source Archive Sync: all §19 citations archived in evidence/sources/ and indexed
  6. Orphan Snapshots: no unindexed/dead files in evidence/sources/
  7. Relative Markdown Links: all relative links in core documentation resolve
  8. Live Evidence Grounding: all EV-### IDs cited in reference/ exist in evidence.md
  9. Native Schema Integrity: all 17 Section 20 JSON schemas valid and in sync
  10. Schema-to-Doc Property Parity: all documented table keys/enums match JSON schemas
  11. Evidence Consistency: evidence ID range and confound resolutions synchronized across modules

Usage:
  scripts/validate.py              run all checks
  scripts/validate.py --verbose    show detailed item breakdown for each check
  scripts/validate.py --fix        auto-repair rebuildable drift (rebuild parent, prune orphans)
  scripts/validate.py --only NAME  run only specific check (e.g. --only build, --only links, --only parity)
"""
import argparse
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from lib.doc_inspector import MarkdownDoc

SRC_DIR = os.path.join(ROOT, "reference")
PARENT_DOC = os.path.join(ROOT, "antigravity-reference.md")
PREAMBLE = os.path.join(SRC_DIR, "00-preamble.md")
WORKS_CITED = os.path.join(SRC_DIR, "19-works-cited.md")
SECTION_20 = os.path.join(SRC_DIR, "20-schema-toolkit-and-native-schemas.md")
SCHEMAS_DIR = os.path.join(ROOT, "schemas")
ARCHIVE_DIR = os.path.join(ROOT, "evidence", "sources")
INDEX_PATH = os.path.join(ARCHIVE_DIR, "index.md")
EVIDENCE_FILE = os.path.join(ROOT, "evidence", "agy-1.1.12", "evidence.md")

# ANSI color styling
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def colored(text: str, color: str) -> str:
    if not sys.stdout.isatty():
        return text
    return f"{color}{text}{RESET}"


class ValidationResult:
    def __init__(self, name: str):
        self.name = name
        self.passed = True
        self.messages = []
        self.details = []

    def pass_with(self, msg: str) -> None:
        self.messages.append(msg)

    def fail_with(self, msg: str) -> None:
        self.passed = False
        self.messages.append(msg)

    def add_detail(self, detail: str) -> None:
        self.details.append(detail)


# --- Check 1: Module Contiguity ---
def check_module_contiguity(fix: bool, verbose: bool) -> ValidationResult:
    res = ValidationResult("Module Contiguity")
    paths = sorted(glob.glob(os.path.join(SRC_DIR, "[0-9][0-9]-*.md")))
    if not paths:
        res.fail_with(f"no modules found matching {SRC_DIR}/[0-9][0-9]-*.md")
        return res

    nums = [int(os.path.basename(p)[:2]) for p in paths]
    expected = list(range(len(nums)))
    if nums != expected:
        res.fail_with(f"module numbering not contiguous: found {nums}, expected 0..{len(nums) - 1}")
    else:
        res.pass_with(f"{len(paths)} modules contiguous (00..{len(paths) - 1:02d})")

    if verbose:
        for p in paths:
            res.add_detail(f"module: {os.path.basename(p)}")
    return res


# --- Check 2: Composition Build Sync ---
def check_build_sync(fix: bool, verbose: bool) -> ValidationResult:
    res = ValidationResult("Composition Build Sync")
    try:
        import build
    except ImportError as e:
        res.fail_with(f"could not import scripts/build.py: {e}")
        return res

    expected_content = build.compose()
    try:
        with open(PARENT_DOC, encoding="utf-8") as fh:
            current_content = fh.read()
    except FileNotFoundError:
        current_content = ""

    if current_content == expected_content:
        res.pass_with(f"{os.path.basename(PARENT_DOC)} is in sync ({len(current_content.splitlines())} lines)")
    else:
        if fix:
            build.do_build()
            res.pass_with(f"fixed: rebuilt {os.path.basename(PARENT_DOC)}")
        else:
            res.fail_with(f"{os.path.basename(PARENT_DOC)} is out of sync with reference/ (run build.py)")

    return res


# --- Check 3: Table of Contents Sync ---
def check_toc_sync(fix: bool, verbose: bool) -> ValidationResult:
    res = ValidationResult("Table of Contents Sync")
    if not os.path.exists(PREAMBLE):
        res.fail_with(f"preamble not found at {PREAMBLE}")
        return res

    preamble_doc = MarkdownDoc.from_file(PREAMBLE)
    toc_sec = preamble_doc.get_section("Table of Contents")
    toc_sections = {}
    if toc_sec:
        for line in toc_sec.content.splitlines():
            m = re.match(r"^(\d+)\.\s+(.+)$", line.strip())
            if m:
                toc_sections[int(m.group(1))] = m.group(2).strip()

    module_sections = {}
    paths = sorted(glob.glob(os.path.join(SRC_DIR, "[0-9][0-9]-*.md")))
    for p in paths:
        base = os.path.basename(p)
        if base.startswith("00-"):
            continue
        mod_doc = MarkdownDoc.from_file(p)
        for h in mod_doc.headings:
            hm = re.match(r"^(\d+)\.\s+(.+)$", h.title)
            if hm and h.level == 2:
                module_sections[int(hm.group(1))] = hm.group(2).strip()
                break

    mismatches = []
    for sec_no in sorted(module_sections):
        mod_title = module_sections[sec_no]
        toc_title = toc_sections.get(sec_no)
        if not toc_title:
            mismatches.append(f"Section {sec_no} ('{mod_title}') missing from TOC in 00-preamble.md")
        elif mod_title != toc_title:
            mismatches.append(f"Section {sec_no} title mismatch: TOC has '{toc_title}', module has '{mod_title}'")

    for sec_no in sorted(toc_sections):
        if sec_no not in module_sections:
            mismatches.append(f"TOC has Section {sec_no} ('{toc_sections[sec_no]}') but no matching module exists")

    if mismatches:
        for err in mismatches:
            res.fail_with(err)
    else:
        res.pass_with(f"all {len(module_sections)} TOC sections match module headings")

    if verbose:
        for sec_no, title in sorted(module_sections.items()):
            res.add_detail(f"§{sec_no}: {title}")
    return res


# --- Check 4: Heading Hierarchy ---
def check_heading_hierarchy(fix: bool, verbose: bool) -> ValidationResult:
    res = ValidationResult("Heading Hierarchy")
    paths = sorted(glob.glob(os.path.join(SRC_DIR, "[0-9][0-9]-*.md")))
    invalid_headings = []
    for p in paths:
        mod_doc = MarkdownDoc.from_file(p)
        for err in mod_doc.validate_heading_hierarchy():
            invalid_headings.append(err)
        # Check that subsection numbers (e.g. 18.1) use level >= 3
        for h in mod_doc.headings:
            if re.match(r"^\d+\.\d+", h.title) and h.level == 2:
                invalid_headings.append(f"{mod_doc.filename}:{h.line_number} uses H2 for subsection: '{h.title}' (should be H3 '###')")

    if invalid_headings:
        for err in invalid_headings:
            res.fail_with(err)
    else:
        res.pass_with("all section and subsection headings follow correct markdown hierarchy")
    return res


# --- Check 5: Source Archive & Manifest Sync ---
def check_source_archive_sync(fix: bool, verbose: bool) -> ValidationResult:
    res = ValidationResult("Source Archive Sync")
    try:
        import fetch_sources
    except ImportError as e:
        res.fail_with(f"could not import fetch_sources.py: {e}")
        return res

    citations = fetch_sources.load_citations()
    if not citations:
        res.fail_with("no citations loaded from 19-works-cited.md")
        return res

    fetch_sources.resolve_duplicates(citations)
    fetch_sources.assign_slugs(citations)

    missing = [
        fetch_sources.snapshot_path(rec)
        for n, rec in sorted(citations.items())
        if not rec.get("duplicate_of") and not os.path.exists(fetch_sources.snapshot_path(rec))
    ]

    index_text = fetch_sources.generate_index(citations)
    index_sync = os.path.exists(INDEX_PATH) and open(INDEX_PATH, encoding="utf-8").read() == index_text

    if missing:
        for p in missing:
            res.fail_with(f"missing snapshot: {os.path.relpath(p, ROOT)}")

    if not index_sync:
        if fix:
            with open(INDEX_PATH, "w", encoding="utf-8") as fh:
                fh.write(index_text)
            res.pass_with(f"fixed: regenerated {os.path.relpath(INDEX_PATH, ROOT)}")
        else:
            res.fail_with(f"archive manifest {os.path.relpath(INDEX_PATH, ROOT)} out of sync (run fetch_sources.py)")
    else:
        active_count = len([c for c in citations.values() if not c.get("duplicate_of")])
        res.pass_with(f"all {len(citations)} citations archived and index.md is in sync")

    if verbose:
        for n, rec in sorted(citations.items()):
            dup = f" (dup of #{rec['duplicate_of']})" if rec.get("duplicate_of") else ""
            res.add_detail(f"citation #{n:02d} [{rec['category']}] {rec['title']}{dup}")
    return res


# --- Check 6: Orphan Snapshot Detection ---
def check_orphan_snapshots(fix: bool, verbose: bool) -> ValidationResult:
    res = ValidationResult("Orphan Snapshots")
    if not os.path.exists(ARCHIVE_DIR):
        res.fail_with(f"archive directory missing: {os.path.relpath(ARCHIVE_DIR, ROOT)}")
        return res

    try:
        import fetch_sources
    except ImportError as e:
        res.fail_with(f"could not import fetch_sources.py: {e}")
        return res

    citations = fetch_sources.load_citations()
    fetch_sources.resolve_duplicates(citations)
    fetch_sources.assign_slugs(citations)
    valid_paths = {
        os.path.abspath(fetch_sources.snapshot_path(rec))
        for rec in citations.values()
        if not rec.get("duplicate_of")
    }

    all_files = []
    for cat in ["docs", "google", "protocol", "community"]:
        cat_dir = os.path.join(ARCHIVE_DIR, cat)
        if os.path.exists(cat_dir):
            for f in os.listdir(cat_dir):
                if f.endswith(".md"):
                    all_files.append(os.path.abspath(os.path.join(cat_dir, f)))

    orphans = [p for p in all_files if p not in valid_paths]
    if orphans:
        if fix:
            for p in orphans:
                os.remove(p)
            res.pass_with(f"fixed: pruned {len(orphans)} orphaned snapshot(s)")
        else:
            for p in orphans:
                res.fail_with(f"orphaned snapshot: {os.path.relpath(p, ROOT)}")
    else:
        res.pass_with("0 orphaned snapshot files in evidence/sources/")

    return res


# --- Check 7: Relative Markdown Links ---
def check_relative_markdown_links(fix: bool, verbose: bool) -> ValidationResult:
    res = ValidationResult("Relative Markdown Links")
    broken_links = []
    checked_count = 0

    scan_targets = [PARENT_DOC, os.path.join(ROOT, "README.md")] + sorted(glob.glob(os.path.join(SRC_DIR, "*.md")))

    for file_path in scan_targets:
        if not os.path.exists(file_path):
            continue
        base_dir = os.path.dirname(os.path.abspath(file_path))
        doc = MarkdownDoc.from_file(file_path)

        for line_no, line in enumerate(doc.lines, start=1):
            for m in re.finditer(r"\[([^\]]+)\]\(([^)]+)\)", line):
                link_target = m.group(2).strip()

                if link_target.startswith(("http://", "https://", "#", "mailto:")):
                    continue

                if link_target.startswith("file:///"):
                    target_path = link_target[len("file://") :]
                    if "#" in target_path:
                        target_path = target_path.split("#")[0]
                    checked_count += 1
                    if not os.path.exists(target_path):
                        broken_links.append(f"{doc.filename}:{line_no} broken file:// link -> {link_target}")
                    continue

                target_rel = link_target.split("#")[0]
                if not target_rel:
                    continue

                resolved = os.path.normpath(os.path.join(base_dir, target_rel))
                checked_count += 1
                if not os.path.exists(resolved):
                    broken_links.append(f"{doc.filename}:{line_no} broken relative link -> '{link_target}' (resolved to: {resolved})")

    if broken_links:
        for err in broken_links:
            res.fail_with(err)
    else:
        res.pass_with(f"{checked_count} relative documentation links verified")

    return res


# --- Check 8: Live Evidence Grounding ---
def check_evidence_citations(fix: bool, verbose: bool) -> ValidationResult:
    res = ValidationResult("Live Evidence Grounding")
    if not os.path.exists(EVIDENCE_FILE):
        res.fail_with(f"master evidence file missing: {os.path.relpath(EVIDENCE_FILE, ROOT)}")
        return res

    evidence_doc = MarkdownDoc.from_file(EVIDENCE_FILE)
    defined_evs = evidence_doc.find_all_ev_ids()

    # Discover cited EV IDs in reference/ modules
    cited_evs = {}
    paths = sorted(glob.glob(os.path.join(SRC_DIR, "*.md")))
    for p in paths:
        mod_doc = MarkdownDoc.from_file(p)
        for ev_id in mod_doc.find_all_ev_ids():
            cited_evs.setdefault(ev_id, []).append(mod_doc.filename)

    missing_definitions = [ev for ev in sorted(cited_evs) if ev not in defined_evs]

    if missing_definitions:
        for ev in missing_definitions:
            res.fail_with(f"cited evidence {ev} in {', '.join(set(cited_evs[ev]))} not defined in {os.path.basename(EVIDENCE_FILE)}")
    else:
        res.pass_with(f"all {len(cited_evs)} cited EV IDs ({sorted(cited_evs)[0]}..{sorted(cited_evs)[-1]}) are grounded in {os.path.basename(EVIDENCE_FILE)}")

    if verbose:
        for ev in sorted(cited_evs):
            res.add_detail(f"{ev}: cited in {', '.join(set(cited_evs[ev]))}")
    return res


# --- Check 9: Native Schema Integrity & Catalog Sync ---
def check_native_schemas(fix: bool, verbose: bool) -> ValidationResult:
    res = ValidationResult("Native Schema Integrity")
    if not os.path.exists(SCHEMAS_DIR):
        res.fail_with(f"schemas directory missing: {os.path.relpath(SCHEMAS_DIR, ROOT)}")
        return res

    if not os.path.exists(SECTION_20):
        res.fail_with(f"Section 20 reference missing: {os.path.relpath(SECTION_20, ROOT)}")
        return res

    sec20_doc = MarkdownDoc.from_file(SECTION_20)
    matrix_sec = sec20_doc.get_section("20.2 Complete 18 Native Schemas")
    if not matrix_sec or not matrix_sec.tables:
        res.fail_with("could not find Section 20.2 schema catalog table")
        return res

    matrix_table = matrix_sec.tables[0]
    expected_schemas = {}
    for row in matrix_table.as_dicts():
        idx_str = row.get("#", "").strip()
        if not idx_str.isdigit():
            continue
        idx = int(idx_str)
        schema_file = row.get("Exported JSON Schema File", "").strip()
        filename = os.path.basename(schema_file)
        expected_schemas[filename] = {
            "index": idx,
            "key": row.get("Key", "").strip(),
            "name": row.get("Schema Name", "").strip(),
            "model": row.get("Pydantic Model Class", "").strip(),
            "category": row.get("Category", "").strip(),
            "target": row.get("Target File / Location", "").strip(),
        }

    if len(expected_schemas) != 18:
        res.fail_with(f"expected 18 schemas from Section 20 matrix, parsed {len(expected_schemas)}")

    missing_files = []
    invalid_json = []

    for filename, meta in sorted(expected_schemas.items(), key=lambda x: x[1]["index"]):
        file_path = os.path.join(SCHEMAS_DIR, filename)
        if not os.path.exists(file_path):
            missing_files.append(filename)
            continue

        try:
            with open(file_path, encoding="utf-8") as fh:
                data = json.load(fh)
        except Exception as e:
            invalid_json.append(f"{filename}: invalid JSON ({e})")
            continue

        if not isinstance(data, dict):
            invalid_json.append(f"{filename}: root must be a JSON object")
            continue

        if "title" not in data and "description" not in data and "$ref" not in data and "properties" not in data and "additionalProperties" not in data:
            invalid_json.append(f"{filename}: missing core JSON Schema descriptors")
            continue

        if verbose:
            res.add_detail(f"#{meta['index']:02d} {filename} -> {meta['model']} ({meta['category']})")

    disk_schemas = set(glob.glob(os.path.join(SCHEMAS_DIR, "*.json")))
    expected_paths = {os.path.join(SCHEMAS_DIR, f) for f in expected_schemas.keys()}
    orphan_schemas = [os.path.basename(p) for p in disk_schemas if p not in expected_paths]

    if missing_files:
        for f in missing_files:
            res.fail_with(f"missing schema file: schemas/{f}")
    if invalid_json:
        for err in invalid_json:
            res.fail_with(err)
    if orphan_schemas:
        for f in orphan_schemas:
            res.fail_with(f"untracked schema file in schemas/: {f}")

    if not missing_files and not invalid_json and not orphan_schemas and len(expected_schemas) == 18:
        res.pass_with(f"all 18 native JSON schemas valid and in sync with Section 20 catalog")

    return res


# --- Check 10: Schema-to-Doc Property Parity ---
def check_schema_property_parity(fix: bool, verbose: bool) -> ValidationResult:
    res = ValidationResult("Schema-to-Doc Property Parity")

    # 1. Verify settings.schema.json against reference/05-configuration-system.md §5.5
    settings_doc_path = os.path.join(SRC_DIR, "05-configuration-system.md")
    settings_schema_path = os.path.join(SCHEMAS_DIR, "settings.schema.json")
    if os.path.exists(settings_doc_path) and os.path.exists(settings_schema_path):
        cfg_doc = MarkdownDoc.from_file(settings_doc_path)
        with open(settings_schema_path, encoding="utf-8") as fh:
            settings_json = json.load(fh)

        sec55 = cfg_doc.get_section("5.5 Complete settings.json Schema")
        if sec55:
            doc_keys = set()
            for t in sec55.tables:
                for k in t.column_values("Key"):
                    doc_keys.add(k)
            schema_props = set(settings_json.get("properties", {}).keys())

            missing_in_schema = []
            for k in sorted(doc_keys):
                root_k = k.split(".")[0]
                if root_k not in schema_props:
                    missing_in_schema.append(k)

            if missing_in_schema:
                for k in missing_in_schema:
                    res.fail_with(f"settings.schema.json missing documented property: '{k}' (from §5.5)")
            elif verbose:
                res.add_detail(f"settings.schema.json covers all documented §5.5 keys ({len(doc_keys)} fields verified)")

        # Check critical enums in settings
        cmd_enum = settings_json.get("properties", {}).get("commandExecutionPolicy", {}).get("enum", [])
        for val in ["sandbox", "auto", "eager", "off"]:
            if val not in cmd_enum:
                res.fail_with(f"settings.schema.json commandExecutionPolicy missing enum: '{val}'")

    # 2. Verify status_line.schema.json against reference/05-configuration-system.md §5.6
    statusline_schema_path = os.path.join(SCHEMAS_DIR, "status_line.schema.json")
    if os.path.exists(settings_doc_path) and os.path.exists(statusline_schema_path):
        cfg_doc = MarkdownDoc.from_file(settings_doc_path)
        with open(statusline_schema_path, encoding="utf-8") as fh:
            sl_json = json.load(fh)

        sec56 = cfg_doc.get_section("5.6 Status Line JSON Payload")
        if sec56 and sec56.tables:
            sl_table = sec56.tables[0]
            raw_keys = sl_table.column_values("Field")
            sl_doc_keys = set()
            for rk in raw_keys:
                for sub_k in rk.split("/"):
                    sl_doc_keys.add(sub_k.strip())

            sl_props = set(sl_json.get("properties", {}).keys())
            missing_sl = [k for k in sorted(sl_doc_keys) if k not in sl_props]
            if missing_sl:
                for k in missing_sl:
                    res.fail_with(f"status_line.schema.json missing documented property: '{k}' (from §5.6)")
            elif verbose:
                res.add_detail(f"status_line.schema.json covers all documented §5.6 fields ({len(sl_doc_keys)} verified)")

    # 3. Verify transcript_step.schema.json against reference/18-remaining-hard-gaps.md §18.1
    transcript_doc_path = os.path.join(SRC_DIR, "18-remaining-hard-gaps.md")
    transcript_schema_path = os.path.join(SCHEMAS_DIR, "transcript_step.schema.json")
    if os.path.exists(transcript_doc_path) and os.path.exists(transcript_schema_path):
        with open(transcript_schema_path, encoding="utf-8") as fh:
            t_json = json.load(fh)

        t_props = set(t_json.get("properties", {}).keys())
        if "created_at" not in t_props:
            res.fail_with("transcript_step.schema.json missing 'created_at' field documented in §18.1")

        type_enums = set(t_json.get("properties", {}).get("type", {}).get("enum", []))
        for core_type in ["USER_INPUT", "PLANNER_RESPONSE", "RUN_COMMAND", "CHECKPOINT", "VIEW_FILE", "LIST_DIRECTORY"]:
            if core_type not in type_enums:
                res.fail_with(f"transcript_step.schema.json missing verified 'type' enum: '{core_type}'")
        if verbose:
            res.add_detail(f"transcript_step.schema.json covers all verified §18.1 fields and {len(type_enums)} type enums")

    if res.passed:
        res.pass_with("all documented table properties and enums match native schema definitions")

    return res


# --- Check 11: Cross-Module Evidence Consistency ---
def check_evidence_consistency(fix: bool, verbose: bool) -> ValidationResult:
    res = ValidationResult("Cross-Module Evidence Consistency")
    if not os.path.exists(EVIDENCE_FILE):
        res.fail_with(f"master evidence file missing: {os.path.relpath(EVIDENCE_FILE, ROOT)}")
        return res

    evidence_doc = MarkdownDoc.from_file(EVIDENCE_FILE)
    ev_ids = evidence_doc.find_all_ev_ids()
    ev_nums = [int(ev.split("-")[1]) for ev in ev_ids]
    if not ev_nums:
        res.fail_with(f"no EV-### identifiers discovered in {os.path.basename(EVIDENCE_FILE)}")
        return res

    max_ev = max(ev_nums)
    expected_range = f"EV-001..EV-{max_ev:03d}"
    expected_count = max_ev

    # Verify 19-works-cited.md summary header
    if os.path.exists(WORKS_CITED):
        works_cited_doc = MarkdownDoc.from_file(WORKS_CITED)
        ev_summary_match = re.search(r"EV-001\s+through\s+EV-(\d+)", works_cited_doc.text)
        if ev_summary_match:
            cited_max = int(ev_summary_match.group(1))
            if cited_max != max_ev:
                res.fail_with(
                    f"19-works-cited.md evidence summary claims through EV-{cited_max:03d}, expected through EV-{max_ev:03d} ({expected_range})"
                )
        else:
            res.fail_with(f"19-works-cited.md missing standard evidence summary header: 'EV-001 through EV-{max_ev:03d}'")

    # Verify no stale unresolved confound claims exist for resolved probes (e.g. EV-020)
    resolved_probes = ["EV-020"]
    for probe in resolved_probes:
        if probe in ev_ids:
            probe_entry = re.search(rf"^###\s+{probe}\b[\s\S]*?(?=^###\s+EV-|\Z)", evidence_doc.text, re.M)
            if probe_entry and "CONFIRMED" in probe_entry.group(0):
                # Search modules for stale ungrounded claims
                for p in glob.glob(os.path.join(SRC_DIR, "*.md")):
                    mod_doc = MarkdownDoc.from_file(p)
                    if f"{probe} confound unresolved" in mod_doc.text.lower():
                        res.fail_with(f"{mod_doc.filename} retains stale 'unresolved confound' text for {probe}")

    if res.passed:
        res.pass_with(f"evidence range ({expected_range}) and confound resolutions synchronized across all modules")

    return res


CHECKS = {
    "modules": ("Module Contiguity", check_module_contiguity),
    "build": ("Composition Build Sync", check_build_sync),
    "toc": ("Table of Contents Sync", check_toc_sync),
    "headings": ("Heading Hierarchy", check_heading_hierarchy),
    "sources": ("Source Archive Sync", check_source_archive_sync),
    "orphans": ("Orphan Snapshots", check_orphan_snapshots),
    "links": ("Relative Markdown Links", check_relative_markdown_links),
    "evidence": ("Live Evidence Grounding", check_evidence_citations),
    "schemas": ("Native Schema Integrity", check_native_schemas),
    "parity": ("Schema-to-Doc Property Parity", check_schema_property_parity),
    "consistency": ("Cross-Module Evidence Consistency", check_evidence_consistency),
}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--verbose", "-v", action="store_true", help="show verbose details for each check")
    parser.add_argument("--fix", action="store_true", help="auto-repair recoverable drift (rebuild parent, prune orphans)")
    parser.add_argument(
        "--only",
        choices=list(CHECKS.keys()),
        help="run only a specific check phase",
    )
    args = parser.parse_args()

    selected_checks = [args.only] if args.only else list(CHECKS.keys())

    print(f"\n{BOLD}Google Antigravity Repository Validation Suite{RESET}\n")

    all_passed = True
    for key in selected_checks:
        title, func = CHECKS[key]
        result = func(args.fix, args.verbose)
        if result.passed:
            status_tag = colored("[PASS]", GREEN)
            msg = result.messages[0] if result.messages else "ok"
            print(f"{status_tag} {BOLD}{result.name}{RESET}: {msg}")
        else:
            status_tag = colored("[FAIL]", RED)
            all_passed = False
            print(f"{status_tag} {BOLD}{result.name}{RESET}")
            for msg in result.messages:
                print(f"       {colored('error:', RED)} {msg}")

        if args.verbose and result.details:
            for d in result.details:
                print(f"       {colored('·', CYAN)} {d}")

    print()
    if all_passed:
        print(f"{colored('✓ All validation checks passed cleanly.', GREEN)}\n")
        return 0
    else:
        print(f"{colored('✗ Some validation checks failed.', RED)} Use --fix or review errors above.\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
