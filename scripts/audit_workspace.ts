import fs from 'fs';
import path from 'path';
import { auditWorkspaceFiles, applyAutoFixes } from '../src/schema/auditor';
import type { WorkspaceFileItem } from '../src/types';

function scanDirectory(dir: string, baseDir: string = dir): WorkspaceFileItem[] {
  const items: WorkspaceFileItem[] = [];
  if (!fs.existsSync(dir)) return items;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    // Skip node_modules, .git, dist, build directories
    if (['node_modules', '.git', 'dist', 'build', '.cache'].includes(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      items.push(...scanDirectory(fullPath, baseDir));
    } else if (entry.isFile()) {
      // Check if file is an Antigravity relevant config/markdown file
      const norm = entry.name.toLowerCase();
      if (
        norm.endsWith('.json') ||
        norm.endsWith('.md') ||
        norm === 'agents.md' ||
        norm === 'gemini.md' ||
        norm.endsWith('skill.md')
      ) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          items.push({ path: relPath, content });
        } catch (err) {
          // ignore unreadable files
        }
      }
    }
  }

  return items;
}

export function runCli() {
  const args = process.argv.slice(2);
  const isJson = args.includes('--json');
  const isFix = args.includes('--fix');
  let targetDir = '.';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir' && args[i + 1]) {
      targetDir = args[i + 1];
    } else if (!args[i].startsWith('--')) {
      targetDir = args[i];
    }
  }

  const resolvedDir = path.resolve(targetDir);
  const files = scanDirectory(resolvedDir);

  if (files.length === 0) {
    if (isJson) {
      console.log(JSON.stringify({ status: 'EMPTY', message: `No agent or configuration files found in ${targetDir}` }, null, 2));
    } else {
      console.log(`\x1b[33m[WARN]\x1b[0m No agent, skill, or schema configuration files found in '${targetDir}'.`);
    }
    process.exit(0);
  }

  const report = auditWorkspaceFiles(files);

  if (isFix && report.totalViolations > 0) {
    const fixedFiles = applyAutoFixes(files);
    let fixesApplied = 0;

    for (const ff of fixedFiles) {
      const orig = files.find(f => f.path === ff.path);
      if (!orig || orig.content !== ff.content) {
        const dest = path.join(resolvedDir, ff.path);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, ff.content, 'utf-8');
        fixesApplied++;
      }
    }

    if (!isJson) {
      console.log(`\x1b[32m[AUTO-FIX]\x1b[0m Applied ${fixesApplied} automatic remediations to workspace files.\n`);
    }
  }

  if (isJson) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.errorCount > 0 ? 1 : 0);
  }

  // Terminal UI output
  console.log('\x1b[1m\x1b[36m=== Google Antigravity Workspace Audit Report ===\x1b[0m');
  console.log(`Target Directory: \x1b[34m${resolvedDir}\x1b[0m`);
  console.log(`Files Audited:    \x1b[33m${report.totalFiles}\x1b[0m`);
  console.log(`Workspace Score:  \x1b[1m${report.score >= 80 ? '\x1b[32m' : report.score >= 50 ? '\x1b[33m' : '\x1b[31m'}${report.score} / 100\x1b[0m\n`);

  console.log('\x1b[1mFile Diagnoses:\x1b[0m');
  for (const fr of report.fileResults) {
    const statusTag = fr.valid
      ? '\x1b[32m[PASS]\x1b[0m'
      : fr.violations.some(v => v.severity === 'ERROR')
      ? '\x1b[31m[FAIL]\x1b[0m'
      : '\x1b[33m[WARN]\x1b[0m';

    console.log(`  ${statusTag} \x1b[1m${fr.path}\x1b[0m ${fr.schemaTitle ? `(${fr.schemaTitle})` : ''}`);

    for (const v of fr.violations) {
      const sevTag = v.severity === 'ERROR' ? '\x1b[31mERROR\x1b[0m' : '\x1b[33mWARN\x1b[0m';
      console.log(`    • [${sevTag}] ${v.message}`);
      if (v.suggestedFix) {
        console.log(`      \x1b[36mFix:\x1b[0m ${v.suggestedFix}`);
      }
    }
  }

  if (report.crossArtifactFindings.length > 0) {
    console.log('\n\x1b[1mCross-Artifact Integrity Findings:\x1b[0m');
    for (const cf of report.crossArtifactFindings) {
      const sevTag = cf.severity === 'ERROR' ? '\x1b[31mERROR\x1b[0m' : '\x1b[33mWARN\x1b[0m';
      console.log(`  • [${sevTag}] \x1b[1m${cf.rule}\x1b[0m: ${cf.message}`);
      if (cf.suggestedFix) {
        console.log(`    \x1b[36mRemediation:\x1b[0m ${cf.suggestedFix}`);
      }
    }
  }

  console.log(`\n\x1b[1mSummary:\x1b[0m ${report.errorCount} errors, ${report.warningCount} warnings, ${report.infoCount} notices in ${report.executionTimeMs}ms.\n`);

  process.exit(report.errorCount > 0 ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli();
}
