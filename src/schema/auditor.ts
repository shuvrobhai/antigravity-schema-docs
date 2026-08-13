import { validateAntigravityPayload, schemaRegistry } from './validator';
import { extractFrontmatter } from '../lib/markdownCore';
import { toErrorMessage } from '../lib/errors';
import type { WorkspaceFileItem, WorkspaceAuditReport, FileAuditResult, AuditViolation } from '../types';

/** Narrow a parsed payload to a plain JSON object. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Determine which schema applies to a given workspace file path
 */
export function identifyFileSchemaKey(filePath: string): string | null {
  const norm = filePath.replace(/\\/g, '/').toLowerCase();

  if (norm.endsWith('settings.json') || norm.endsWith('.gemini/settings.json') || norm === 'antigravity.json') {
    return 'settings';
  }
  if (norm.endsWith('mcp_config.json') || norm.endsWith('.gemini/mcp_config.json')) {
    return 'mcp_config';
  }
  if (norm.endsWith('hooks.json') || norm.endsWith('.gemini/hooks.json')) {
    return 'hooks';
  }
  if (norm.endsWith('keybindings.json') || norm.endsWith('.gemini/keybindings.json')) {
    return 'keybindings';
  }
  if (norm.includes('/skills/') && norm.endsWith('skill.md')) {
    return 'skill';
  }
  if ((norm.includes('/agents/') || norm.startsWith('agents/')) && norm.endsWith('.md') && !norm.endsWith('agents.md')) {
    return 'agent';
  }
  if ((norm.includes('/rules/') || norm.startsWith('rules/')) && norm.endsWith('.md')) {
    return 'rule';
  }
  if ((norm.includes('/workflows/') || norm.startsWith('workflows/')) && norm.endsWith('.md')) {
    return 'workflow';
  }
  if (norm.endsWith('plugin.json')) {
    return 'plugin';
  }
  if (norm.endsWith('status_line.json')) {
    return 'status_line';
  }
  if (norm.endsWith('transcript.json') || norm.endsWith('transcript_step.json')) {
    return 'transcript_step';
  }

  return null;
}

/**
 * Core Workspace Audit Engine: Validates files individually & checks cross-artifact integrity
 */
export function auditWorkspaceFiles(files: WorkspaceFileItem[]): WorkspaceAuditReport {
  const startTime = Date.now();
  const fileResults: FileAuditResult[] = [];
  const crossArtifactFindings: AuditViolation[] = [];

  // Track discovered components for cross-artifact validation
  const discoveredSkills = new Set<string>();
  const discoveredAgents: { name: string; file: string; requiredSkills: string[]; tools: string[] }[] = [];
  const discoveredMcpServers = new Set<string>();
  let hasSettings = false;
  let hasMcpConfig = false;

  for (const file of files) {
    const schemaKey = identifyFileSchemaKey(file.path);
    const violations: AuditViolation[] = [];
    let autoFixAvailable = false;

    if (!schemaKey) {
      // General file (e.g. AGENTS.md or unstructured file)
      if (file.path.toLowerCase().endsWith('agents.md')) {
        // Basic check for AGENTS.md
        if (file.content.length < 20) {
          violations.push({
            id: `agents_md_too_short_${file.path}`,
            file: file.path,
            rule: 'agents_md_substance',
            message: 'AGENTS.md file is nearly empty. It should define clear persistent project rules and conventions.',
            severity: 'WARNING',
            fixable: false,
            suggestedFix: 'Add instructions, commands, and project conventions to AGENTS.md',
          });
        }
      }

      fileResults.push({
        path: file.path,
        valid: violations.length === 0,
        violations,
        autoFixAvailable: false,
      });
      continue;
    }

    const descriptor = schemaRegistry.get(schemaKey);
    let payload: unknown = null;
    let parseError: string | null = null;
    let isMarkdownFrontmatter = false;

    if (file.path.endsWith('.md')) {
      isMarkdownFrontmatter = true;
      const { frontmatter } = extractFrontmatter(file.content);
      if (!frontmatter) {
        parseError = 'Missing or malformed YAML frontmatter (must start and end with "---")';
      } else {
        payload = frontmatter;
      }
    } else {
      try {
        payload = JSON.parse(file.content);
      } catch (err) {
        parseError = `Invalid JSON syntax: ${toErrorMessage(err)}`;
      }
    }

    if (parseError) {
      violations.push({
        id: `parse_error_${file.path}`,
        file: file.path,
        rule: 'syntax_error',
        message: parseError,
        severity: 'ERROR',
        fixable: false,
        suggestedFix: isMarkdownFrontmatter 
          ? 'Add valid YAML frontmatter headers at the top of the file: ---\\nname: my-item\\ndescription: my desc\\n---'
          : 'Fix JSON syntax (check for trailing commas or unquoted strings)',
      });

      fileResults.push({
        path: file.path,
        schemaKey,
        schemaTitle: descriptor?.title || schemaKey,
        valid: false,
        violations,
        autoFixAvailable: false,
      });
      continue;
    }

    // Both sources must yield a JSON object at the root. Guarding here also
    // keeps `in`/property access from throwing on scalar or array payloads.
    if (!isRecord(payload)) {
      const shape = Array.isArray(payload) ? 'array' : typeof payload;
      violations.push({
        id: `root_type_error_${file.path}`,
        file: file.path,
        rule: 'syntax_error',
        message: `Payload must be a JSON object at the root (got ${shape}).`,
        severity: 'ERROR',
        fixable: false,
        suggestedFix: isMarkdownFrontmatter
          ? 'Add valid YAML frontmatter headers at the top of the file: ---\\nname: my-item\\ndescription: my desc\\n---'
          : 'Fix JSON syntax (wrap the contents in { } if you meant to declare an object)',
      });

      fileResults.push({
        path: file.path,
        schemaKey,
        schemaTitle: descriptor?.title || schemaKey,
        valid: false,
        violations,
        autoFixAvailable: false,
      });
      continue;
    }

    // Inspect Legacy Keys & Auto-Fix opportunities for Settings
    if (schemaKey === 'settings') {
      hasSettings = true;
      const legacyKeysDetected: string[] = [];

      if ('geminiModel' in payload) legacyKeysDetected.push('geminiModel');
      if ('theme' in payload) legacyKeysDetected.push('theme');
      if ('autoApprove' in payload) legacyKeysDetected.push('autoApprove');

      if (legacyKeysDetected.length > 0) {
        const cleanPayload = { ...payload };
        if ('geminiModel' in cleanPayload) {
          cleanPayload.model = cleanPayload.geminiModel;
          delete cleanPayload.geminiModel;
        }
        if ('theme' in cleanPayload) {
          cleanPayload.colorScheme = cleanPayload.theme;
          delete cleanPayload.theme;
        }
        if ('autoApprove' in cleanPayload) {
          const autoApprove = cleanPayload.autoApprove;
          cleanPayload.toolPermission = isRecord(autoApprove) && autoApprove.execute ? 'allow' : 'request-review';
          delete cleanPayload.autoApprove;
        }

        violations.push({
          id: `legacy_settings_keys_${file.path}`,
          file: file.path,
          rule: 'deprecated_settings_format',
          message: `Detected deprecated settings keys: ${legacyKeysDetected.join(', ')}. In Antigravity v1.1+, use standard keys ('colorScheme', 'toolPermission').`,
          severity: 'WARNING',
          fixable: true,
          suggestedFix: 'Migrate deprecated keys to modern Antigravity standard settings schema.',
          fixedContent: JSON.stringify(cleanPayload, null, 2),
        });
        autoFixAvailable = true;
      }
    }

    // Skill Validation & Extraction
    if (schemaKey === 'skill') {
      const skillName = typeof payload.name === 'string' ? payload.name : '';
      if (skillName) {
        discoveredSkills.add(skillName);
        // Check for kebab-case name requirement
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(skillName)) {
          const suggestedKebab = skillName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          const { body } = extractFrontmatter(file.content);
          const description = typeof payload.description === 'string' ? payload.description : '';
          const metadata = isRecord(payload.metadata) ? payload.metadata : null;
          const rawVersion = metadata?.version;
          const version =
            typeof rawVersion === 'string' || typeof rawVersion === 'number' ? rawVersion : '1.0.0';
          const fixedYaml = `---\nname: ${suggestedKebab}\ndescription: ${description}\n${metadata ? `metadata:\n  version: ${version}\n` : ''}---\n${body}`;

          violations.push({
            id: `skill_name_case_${file.path}`,
            file: file.path,
            rule: 'skill_naming_convention',
            message: `Skill name '${skillName}' must be kebab-case (e.g. 'my-skill-name') with no spaces or capital letters.`,
            severity: 'ERROR',
            fixable: true,
            suggestedFix: `Rename skill to '${suggestedKebab}'`,
            fixedContent: fixedYaml,
          });
          autoFixAvailable = true;
        }
      }
    }

    // Agent Validation & Extraction
    if (schemaKey === 'agent') {
      const agentSkills = Array.isArray(payload.skills)
        ? payload.skills.filter((s): s is string => typeof s === 'string')
        : [];
      const agentTools = Array.isArray(payload.tools)
        ? payload.tools.filter((t): t is string => typeof t === 'string')
        : [];
      discoveredAgents.push({
        name: typeof payload.name === 'string' ? payload.name : file.path,
        file: file.path,
        requiredSkills: agentSkills,
        tools: agentTools,
      });
    }

    // MCP Validation & Extraction
    if (schemaKey === 'mcp_config') {
      hasMcpConfig = true;
      if (payload.mcpServers && typeof payload.mcpServers === 'object' && !Array.isArray(payload.mcpServers)) {
        for (const serverName of Object.keys(payload.mcpServers)) {
          discoveredMcpServers.add(serverName);
        }
      }
    }

    // Native Schema Validation
    const validation = validateAntigravityPayload(schemaKey, payload);
    if (!validation.valid && validation.errors) {
      for (const err of validation.errors) {
        violations.push({
          id: `schema_err_${file.path}_${Math.random().toString(36).substring(2, 7)}`,
          file: file.path,
          rule: `schema_violation_${schemaKey}`,
          message: err,
          severity: 'ERROR',
          fixable: false,
          suggestedFix: `Ensure fields match ${descriptor?.title || schemaKey} schema specification.`,
        });
      }
    }

    fileResults.push({
      path: file.path,
      schemaKey,
      schemaTitle: descriptor?.title || schemaKey,
      valid: violations.filter(v => v.severity === 'ERROR').length === 0,
      violations,
      autoFixAvailable,
    });
  }

  // === CROSS-ARTIFACT INTEGRITY CHECKS ===

  // 1. Check if Agents reference non-existent Skills
  for (const agent of discoveredAgents) {
    for (const reqSkill of agent.requiredSkills) {
      if (!discoveredSkills.has(reqSkill)) {
        const skillPath = `.agents/skills/${reqSkill}/SKILL.md`;
        const skillScaffold = `---
name: ${reqSkill}
description: Automated scaffold for ${reqSkill} skill.
metadata:
  version: 1.0.0
---
# ${reqSkill.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

Operational instructions and procedures for the ${reqSkill} skill.
`;
        crossArtifactFindings.push({
          id: `cross_missing_skill_${agent.name}_${reqSkill}`,
          file: agent.file,
          rule: 'broken_skill_reference',
          message: `Agent '${agent.name}' references skill '${reqSkill}', but no matching skill definition was found in workspace (expected ${skillPath}).`,
          severity: 'ERROR',
          fixable: true,
          suggestedFix: `Scaffold missing skill at ${skillPath}.`,
          fixedFile: skillPath,
          fixedContent: skillScaffold,
        });
      }
    }
  }

  // 2. Check if MCP is configured when tools/skills refer to MCP
  if (discoveredMcpServers.size > 0 && !hasSettings) {
    crossArtifactFindings.push({
      id: 'cross_mcp_without_settings',
      file: 'mcp_config.json',
      rule: 'mcp_settings_parity',
      message: 'Workspace configures MCP servers in mcp_config.json, but is missing a root settings.json to govern tool permissions and runtime sandboxing.',
      severity: 'INFO',
      fixable: true,
      suggestedFix: 'Add a standard settings.json with commandExecutionPolicy and toolPermission.',
      fixedContent: JSON.stringify({
        "$schema": "https://antigravity.google/schemas/v1/settings.schema.json",
        "toolPermission": "request-review",
        "commandExecutionPolicy": "sandbox",
        "colorScheme": "dark"
      }, null, 2),
    });
  }

  // Calculate Metrics
  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;

  for (const fr of fileResults) {
    for (const v of fr.violations) {
      if (v.severity === 'ERROR') errorCount++;
      else if (v.severity === 'WARNING') warningCount++;
      else if (v.severity === 'INFO') infoCount++;
    }
  }

  for (const cf of crossArtifactFindings) {
    if (cf.severity === 'ERROR') errorCount++;
    else if (cf.severity === 'WARNING') warningCount++;
    else if (cf.severity === 'INFO') infoCount++;
  }

  const totalViolations = errorCount + warningCount + infoCount;
  // Health score calculation (100 base, deductions for errors and warnings)
  const score = Math.max(0, Math.min(100, Math.round(100 - (errorCount * 25) - (warningCount * 8))));

  return {
    timestamp: new Date().toISOString(),
    totalFiles: files.length,
    totalViolations,
    errorCount,
    warningCount,
    infoCount,
    score,
    fileResults,
    crossArtifactFindings,
    executionTimeMs: Date.now() - startTime,
  };
}

/**
 * Apply auto-fixes to workspace files
 */
export function applyAutoFixes(files: WorkspaceFileItem[], fixViolationIds?: string[]): WorkspaceFileItem[] {
  const report = auditWorkspaceFiles(files);
  const updatedFiles = [...files];

  const fixMap = new Map<string, string>();

  // Collect fixes from file violations
  for (const fr of report.fileResults) {
    for (const v of fr.violations) {
      if (v.fixable && v.fixedContent) {
        if (!fixViolationIds || fixViolationIds.includes(v.id)) {
          fixMap.set(v.file, v.fixedContent);
        }
      }
    }
  }

  // Collect fixes from cross-artifact findings (e.g. creating new missing file)
  for (const cf of report.crossArtifactFindings) {
    if (cf.fixable && cf.fixedContent) {
      if (!fixViolationIds || fixViolationIds.includes(cf.id)) {
        fixMap.set(cf.fixedFile || cf.file, cf.fixedContent);
      }
    }
  }

  for (const [path, newContent] of fixMap.entries()) {
    const existingIndex = updatedFiles.findIndex(f => f.path === path);
    if (existingIndex !== -1) {
      updatedFiles[existingIndex] = { ...updatedFiles[existingIndex], content: newContent };
    } else {
      updatedFiles.push({ path, content: newContent });
    }
  }

  return updatedFiles;
}
