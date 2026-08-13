.PHONY: help install build build-check watch validate validate-verbose validate-fix fetch-sources check-sources force-fetch-sources clean all

PYTHON ?= python3

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
	@echo "  make validate            Run the 11-stage repository validation suite"
	@echo "  make validate-verbose    Run validation with detailed per-check breakdown"
	@echo "  make validate-fix        Auto-repair drift (rebuild parent & clean orphaned snapshots)"
	@echo ""
	@echo "Evidence & Sources:"
	@echo "  make fetch-sources       Fetch missing citations from §19 into evidence/sources/"
	@echo "  make check-sources       Check if evidence/sources/ is in sync with §19 citations"
	@echo "  make force-fetch-sources Re-fetch all §19 citations and refresh snapshots"
	@echo ""
	@echo "Environment & Maintenance:"
	@echo "  make install             Install required Python dependencies"
	@echo "  make clean               Remove __pycache__, .pyc files, and build temp files"
	@echo "  make all                 Run full test, validation and build verification"

test:
	$(PYTHON) scripts/lib/doc_inspector.py
	$(PYTHON) scripts/lib/evidence_registry.py

all: test validate build-check

install:
	$(PYTHON) -m pip install -r requirements.txt

build:
	$(PYTHON) scripts/build.py

build-check:
	$(PYTHON) scripts/build.py --check

watch:
	$(PYTHON) scripts/build.py --watch

validate:
	$(PYTHON) scripts/validate.py

validate-verbose:
	$(PYTHON) scripts/validate.py --verbose

validate-fix:
	$(PYTHON) scripts/validate.py --fix

fetch-sources:
	$(PYTHON) scripts/fetch_sources.py

check-sources:
	$(PYTHON) scripts/fetch_sources.py --check

force-fetch-sources:
	$(PYTHON) scripts/fetch_sources.py --force

clean:
	find . -name "__pycache__" -type d -prune -exec rm -rf {} +
	find . -name "*.pyc" -delete
	rm -f antigravity-reference.md.tmp
