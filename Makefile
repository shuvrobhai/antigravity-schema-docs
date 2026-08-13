.PHONY: help install build build-check watch test test-schemas audit validate validate-verbose validate-fix generate-evidence check-evidence fetch-sources check-sources force-fetch-sources clean all

TSX ?= npx tsx

help:
	@echo "Google Antigravity Schema & Technical Reference Toolchain"
	@echo ""
	@echo "Build & Composition:"
	@echo "  make build               Compose reference/*.md modules into antigravity-reference.md"
	@echo "  make build-check         Check if antigravity-reference.md is in sync with reference/"
	@echo "  make watch               Watch reference/*.md and rebuild automatically on change"
	@echo ""
	@echo "Validation & Quality:"
	@echo "  make test                Run standalone unit tests for internal toolchain libraries"
	@echo "  make validate            Run the repository validation suite (12 checks)"
	@echo "  make validate-verbose    Run validation with detailed per-check breakdown"
	@echo "  make validate-fix        Auto-repair drift (rebuild parent, sync evidence & clean orphans)"
	@echo ""
	@echo "Evidence & Sources:"
	@echo "  make generate-evidence   Generate all probe, report, and master evidence indexes"
	@echo "  make check-evidence      Check if evidence indexes and aggregate are in sync"
	@echo "  make fetch-sources       Fetch missing citations from §19 into evidence/sources/"
	@echo "  make check-sources       Check if evidence/sources/ is in sync with §19 citations"
	@echo "  make force-fetch-sources Re-fetch all §19 citations and refresh snapshots"
	@echo ""
	@echo "Environment & Maintenance:"
	@echo "  make install             Install dependencies"
	@echo "  make clean               Remove build temp files"
	@echo "  make all                 Run full test, validation and build verification"

test:
	$(TSX) scripts/test_schemas.ts
	$(TSX) scripts/audit_workspace.ts --dir test/fixtures/workspaces/valid-agent-workspace
	$(TSX) scripts/lib/evidenceRegistry.ts

test-schemas:
	$(TSX) scripts/test_schemas.ts

audit:
	$(TSX) scripts/audit_workspace.ts

all: test validate build-check

install:
	npm install

build:
	$(TSX) scripts/build.ts

build-check:
	$(TSX) scripts/build.ts --check

watch:
	$(TSX) scripts/build.ts --watch

validate:
	$(TSX) scripts/validate.ts

validate-verbose:
	$(TSX) scripts/validate.ts --verbose

validate-fix:
	$(TSX) scripts/validate.ts --fix

generate-evidence:
	$(TSX) scripts/generate_evidence.ts

check-evidence:
	$(TSX) scripts/generate_evidence.ts --check

fetch-sources:
	$(TSX) scripts/fetch_sources.ts

check-sources:
	$(TSX) scripts/fetch_sources.ts --check

force-fetch-sources:
	$(TSX) scripts/fetch_sources.ts --force

clean:
	rm -f antigravity-reference.md.tmp
