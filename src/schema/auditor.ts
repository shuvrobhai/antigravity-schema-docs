import { validateAntigravityPayload, schemaRegistry } from './validator';
import type { WorkspaceFileItem, WorkspaceAuditReport, FileAuditResult, AuditViolation } from '../types';

/**
 * Lightweight frontmatter parser that extracts YAML frontmatter from Markdown files
 */
export function extractFrontmatter(content: string): { frontmatter: Record<string, any> | null; body: string } {
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
  const parsed = parseSimpleYaml(yamlStr);
  return { frontmatter: parsed, body };
}

/**
 * Simple, resilient YAML parser supporting strings, booleans, numbers, lists, and nested objects
 */
export function parseSimpleYaml(yaml: string): Record<string, any> {
  const lines = yaml.split(/\r?\n/);
  const result: Record<string, any> = {};
  let currentKey = '';
  let currentList: any[] | null = null;
  let currentNestedObj: Record<string, any> | null = null;

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
        result[currentKey] = {};
        currentNestedObj = result[currentKey];
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

function parseYamlValue(val: string): any {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val === 'null' || val === '~') return null;
  if (!isNaN(Number(val)) && val !== '') return Number(val);
  // Strip quotes if present
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.substring(1, val.length - 1);
  }
  return val;
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
    let payload: any = null;
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
      } catch (err: any) {
        parseError = `Invalid JSON syntax: ${err.message}`;
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
          cleanPayload.toolPermission = cleanPayload.autoApprove?.execute ? 'allow' : 'request-review';
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
      if (payload.name) {
        discoveredSkills.add(payload.name);
        // Check for kebab-case name requirement
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(payload.name)) {
          const suggestedKebab = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          const fixedPayload = { ...payload, name: suggestedKebab };
          const { body } = extractFrontmatter(file.content);
          const fixedYaml = `---\nname: ${suggestedKebab}\ndescription: ${payload.description || ''}\n${payload.metadata ? `metadata:\n  version: ${payload.metadata.version || '1.0.0'}\n` : ''}---\n${body}`;

          violations.push({
            id: `skill_name_case_${file.path}`,
            file: file.path,
            rule: 'skill_naming_convention',
            message: `Skill name '${payload.name}' must be kebab-case (e.g. 'my-skill-name') with no spaces or capital letters.`,
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
      const agentSkills = Array.isArray(payload.skills) ? payload.skills : [];
      const agentTools = Array.isArray(payload.tools) ? payload.tools : [];
      discoveredAgents.push({
        name: payload.name || file.path,
        file: file.path,
        requiredSkills: agentSkills,
        tools: agentTools,
      });
    }

    // MCP Validation & Extraction
    if (schemaKey === 'mcp_config') {
      hasMcpConfig = true;
      if (payload.mcpServers && typeof payload.mcpServers === 'object') {
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
        crossArtifactFindings.push({
          id: `cross_missing_skill_${agent.name}_${reqSkill}`,
          file: agent.file,
          rule: 'broken_skill_reference',
          message: `Agent '${agent.name}' references skill '${reqSkill}', but no matching skill definition was found in workspace (expected .agents/skills/${reqSkill}/SKILL.md).`,
          severity: 'ERROR',
          fixable: false,
          suggestedFix: `Create .agents/skills/${reqSkill}/SKILL.md or remove '${reqSkill}' from agent skills list.`,
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
        fixMap.set(cf.file, cf.fixedContent);
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
