/**
 * workspaceSession.ts — Headless Workspace Session & Scaffolding Engine.
 *
 * Encapsulates in-memory workspace file system state, preset catalogs,
 * scaffolding template generation, line-by-line diff calculation, and
 * integrated audit execution.
 *
 * Framework-agnostic: zero React or DOM dependencies.
 */

import { auditWorkspaceFiles, applyAutoFixes } from './auditor';
import { toErrorMessage } from '../lib/errors';
import type { WorkspaceFileItem, WorkspaceAuditReport, AuditViolation } from '../types';

export interface PresetWorkspaceItem {
  id: string;
  name: string;
  description: string;
  files: WorkspaceFileItem[];
}

export interface ManifestTemplate {
  id: string;
  title: string;
  category: 'core' | 'extensibility' | 'governance';
  defaultPath: string;
  description: string;
  content: string;
}

export interface AutoFixDiffItem {
  path: string;
  isNew: boolean;
  oldContent?: string;
  newContent: string;
}

export interface LineDiffEntry {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DirtyChangeItem {
  path: string;
  status: 'modified' | 'added' | 'deleted';
  oldContent?: string;
  newContent?: string;
}

export const PRESET_WORKSPACES: PresetWorkspaceItem[] = [
  {
    id: 'standard-production',
    name: 'Production-Ready Agent',
    description: 'Fully compliant Antigravity workspace with agent, skill, hooks, and MCP servers.',
    files: [
      {
        path: 'settings.json',
        content: JSON.stringify(
          {
            "$schema": "https://antigravity.google/schemas/v1/settings.schema.json",
            "toolPermission": "request-review",
            "commandExecutionPolicy": "sandbox",
            "colorScheme": "dark",
            "enableTerminalSandbox": true,
            "allowNonWorkspaceAccess": false,
            "trustedWorkspaces": ["/workspace/project"]
          },
          null,
          2
        ),
      },
      {
        path: 'mcp_config.json',
        content: JSON.stringify(
          {
            "$schema": "https://antigravity.google/schemas/v1/mcp_config.schema.json",
            "mcpServers": {
              "filesystem": {
                "command": "npx",
                "args": ["-y", "@modelcontextprotocol/server-filesystem", "/workspace"],
                "disabled": false
              }
            }
          },
          null,
          2
        ),
      },
      {
        path: 'hooks.json',
        content: JSON.stringify(
          {
            "security-guard": {
              "enabled": true,
              "PreToolUse": [
                {
                  "matcher": "run_command",
                  "hooks": [
                    {
                      "type": "command",
                      "command": "./scripts/guard.sh"
                    }
                  ]
                }
              ]
            }
          },
          null,
          2
        ),
      },
      {
        path: '.agents/skills/security-audit/SKILL.md',
        content: `---
name: security-audit
description: Audits code for secrets, CVEs, and input sanitization vulnerabilities.
metadata:
  version: 1.0.0
---
# Security Audit Skill
Instructions for security scanning and safe coding standards.`,
      },
      {
        path: '.agents/agents/security-reviewer.md',
        content: `---
name: security-reviewer
description: Automated security reviewer and vulnerability scanner.
model: inherit
commandExecutionPolicy: sandbox
skills:
  - security-audit
tools:
  - view_file
  - grep_search
---
# Security Reviewer Agent
System instructions for running security audits.`,
      },
      {
        path: 'AGENTS.md',
        content: `# Project Agent Conventions\n\n- Always run validation checks before pushing.\n- Never bypass sandbox execution policies.`,
      },
    ],
  },
  {
    id: 'drifted-legacy',
    name: 'Drifted / Legacy Workspace',
    description: 'Contains common beginner mistakes: deprecated gemini keys, uppercase skill names, and broken references.',
    files: [
      {
        path: 'settings.json',
        content: JSON.stringify(
          {
            "geminiModel": "gemini-3.7-flash",
            "theme": "tokyo night",
            "commandExecutionPolicy": "sandbox"
          },
          null,
          2
        ),
      },
      {
        path: '.agents/skills/Code Reviewer/SKILL.md',
        content: `---
name: Code Reviewer With Spaces
description: Performs pull request reviews
---
# Code Review Instructions`,
      },
      {
        path: '.agents/agents/lead-architect.md',
        content: `---
name: lead-architect
description: System design agent
skills:
  - missing-cloud-deploy-skill
tools:
  - view_file
---
# Architect Prompt`,
      },
      {
        path: 'mcp_config.json',
        content: JSON.stringify(
          {
            "mcpServers": {
              "github": {
                "command": "docker",
                "args": ["run", "-i", "mcp/github"],
                "disabled": false
              }
            }
          },
          null,
          2
        ),
      },
    ],
  },
];

export const MANIFEST_TEMPLATES: ManifestTemplate[] = [
  {
    id: 'settings',
    title: 'Workspace Settings',
    category: 'core',
    defaultPath: 'settings.json',
    description: 'Core runtime settings, model defaults, and sandbox security controls.',
    content: JSON.stringify(
      {
        "$schema": "https://antigravity.google/schemas/v1/settings.schema.json",
        "toolPermission": "request-review",
        "commandExecutionPolicy": "sandbox",
        "colorScheme": "dark",
        "enableTerminalSandbox": true,
        "allowNonWorkspaceAccess": false,
        "trustedWorkspaces": ["."]
      },
      null,
      2
    ),
  },
  {
    id: 'mcp_config',
    title: 'MCP Server Config',
    category: 'core',
    defaultPath: 'mcp_config.json',
    description: 'Model Context Protocol tool, resource, and prompt connectors.',
    content: JSON.stringify(
      {
        "$schema": "https://antigravity.google/schemas/v1/mcp_config.schema.json",
        "mcpServers": {
          "filesystem": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "."],
            "disabled": false
          }
        }
      },
      null,
      2
    ),
  },
  {
    id: 'hooks',
    title: 'Lifecycle Hooks',
    category: 'core',
    defaultPath: 'hooks.json',
    description: 'PreToolUse / PostToolUse determinism and validation guards.',
    content: JSON.stringify(
      {
        "workspace-guards": {
          "enabled": true,
          "PreToolUse": [
            {
              "matcher": "run_command",
              "hooks": [
                {
                  "type": "command",
                  "command": "./scripts/guard.sh"
                }
              ]
            }
          ]
        }
      },
      null,
      2
    ),
  },
  {
    id: 'skill',
    title: 'Agent Skill (SKILL.md)',
    category: 'extensibility',
    defaultPath: '.agents/skills/my-skill/SKILL.md',
    description: 'Domain workflow recipe with YAML frontmatter and strict kebab-case naming.',
    content: `---
name: my-skill
description: Performs specialized analysis or code operations.
metadata:
  version: 1.0.0
---
# My Skill

Detailed domain procedures and operational rules for the agent.
`,
  },
  {
    id: 'agent',
    title: 'Subagent Definition',
    category: 'extensibility',
    defaultPath: '.agents/agents/my-agent.md',
    description: 'Autonomous delegated agent persona with scoped tools and skill attachments.',
    content: `---
name: my-agent
description: Specialized assistant for specific project subtasks.
model: inherit
commandExecutionPolicy: sandbox
skills:
  - my-skill
tools:
  - view_file
  - grep_search
---
# Agent Persona

System instructions defining the operational scope and behavior.
`,
  },
  {
    id: 'rule',
    title: 'Agent Behavioral Rule',
    category: 'governance',
    defaultPath: '.agents/rules/my-rule.md',
    description: 'Behavioral boundary constraint or coding standard.',
    content: `---
name: my-rule
description: Coding standard constraint.
activation: always
---
# Coding Standard Rule

Instructions on patterns to follow and anti-patterns to avoid.
`,
  },
  {
    id: 'agents_md',
    title: 'AGENTS.md Guidance',
    category: 'governance',
    defaultPath: 'AGENTS.md',
    description: 'Repository-level global agent conventions and essential command references.',
    content: `# AGENTS.md — Workspace Guidelines

## Essential Commands
- \`npm test\` — run local verification suite
- \`npm run build\` — compile production build

## Conventions
- Follow strict typing and keep modules small.
`,
  },
  {
    id: 'keybindings',
    title: 'CLI Keybindings',
    category: 'core',
    defaultPath: 'keybindings.json',
    description: 'Custom keyboard shortcuts for interactive CLI operations.',
    content: JSON.stringify(
      {
        "bindings": [
          {
            "key": "ctrl+e",
            "action": "explain_selection"
          }
        ]
      },
      null,
      2
    ),
  },
];

export const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.nuxt',
  '.venv',
  'venv',
  '__pycache__',
  '.freebuff',
  '.turbo',
  'coverage',
  '.cache'
]);

/**
 * Computes a line-by-line unified diff between two text versions.
 */
export function computeUnifiedLineDiff(oldText: string = '', newText: string = ''): LineDiffEntry[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const entries: LineDiffEntry[] = [];

  // Fast path: identical text
  if (oldText === newText) {
    return oldLines.map((line, idx) => ({
      type: 'unchanged',
      text: line,
      oldLineNumber: idx + 1,
      newLineNumber: idx + 1,
    }));
  }

  // Simple Myers/LCS approximation for line diffs
  let oldIdx = 0;
  let newIdx = 0;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    if (oldIdx < oldLines.length && newIdx < newLines.length && oldLines[oldIdx] === newLines[newIdx]) {
      entries.push({
        type: 'unchanged',
        text: oldLines[oldIdx],
        oldLineNumber: oldIdx + 1,
        newLineNumber: newIdx + 1,
      });
      oldIdx++;
      newIdx++;
    } else if (newIdx < newLines.length && (oldIdx >= oldLines.length || !oldLines.slice(oldIdx).includes(newLines[newIdx]))) {
      entries.push({
        type: 'added',
        text: newLines[newIdx],
        newLineNumber: newIdx + 1,
      });
      newIdx++;
    } else {
      entries.push({
        type: 'removed',
        text: oldLines[oldIdx],
        oldLineNumber: oldIdx + 1,
      });
      oldIdx++;
    }
  }

  return entries;
}

/**
 * Computes modified, added, and deleted file status against baseline files.
 */
export function computeDirtyChanges(
  currentFiles: WorkspaceFileItem[],
  baselineMap: Record<string, string>
): DirtyChangeItem[] {
  const changes: DirtyChangeItem[] = [];

  // Check added & modified
  for (const f of currentFiles) {
    const oldContent = baselineMap[f.path];
    if (oldContent === undefined) {
      changes.push({ path: f.path, status: 'added', newContent: f.content });
    } else if (oldContent !== f.content) {
      changes.push({ path: f.path, status: 'modified', oldContent, newContent: f.content });
    }
  }

  // Check deleted
  for (const oldPath of Object.keys(baselineMap)) {
    if (!currentFiles.some(f => f.path === oldPath)) {
      changes.push({ path: oldPath, status: 'deleted', oldContent: baselineMap[oldPath] });
    }
  }

  return changes;
}

/**
 * Headless Workspace Session Engine.
 */
export class WorkspaceSession {
  private _files: WorkspaceFileItem[];
  private _baselineFiles: Record<string, string>;
  private _selectedFilePath: string;
  private _currentPresetId: string;
  private _cachedAuditReport: WorkspaceAuditReport | null = null;

  constructor(files: WorkspaceFileItem[], presetId: string = 'custom') {
    this._files = [...files];
    this._currentPresetId = presetId;
    this._baselineFiles = {};
    for (const f of files) {
      this._baselineFiles[f.path] = f.content;
    }
    this._selectedFilePath = files[0]?.path || '';
  }

  static fromPreset(presetId: string): WorkspaceSession {
    const preset = PRESET_WORKSPACES.find(p => p.id === presetId) || PRESET_WORKSPACES[0];
    return new WorkspaceSession(preset.files, preset.id);
  }

  static fromFiles(files: WorkspaceFileItem[], presetId: string = 'custom'): WorkspaceSession {
    return new WorkspaceSession(files, presetId);
  }

  get files(): WorkspaceFileItem[] {
    return this._files;
  }

  get presetId(): string {
    return this._currentPresetId;
  }

  get selectedFilePath(): string {
    return this._selectedFilePath;
  }

  get selectedFile(): WorkspaceFileItem | undefined {
    return this._files.find(f => f.path === this._selectedFilePath) || this._files[0];
  }

  setSelectedFile(path: string): void {
    if (this._files.some(f => f.path === path)) {
      this._selectedFilePath = path;
    }
  }

  setFileContent(path: string, content: string): void {
    this._files = this._files.map(f => (f.path === path ? { ...f, content } : f));
    this._cachedAuditReport = null;
  }

  addFile(path: string, content: string): boolean {
    const norm = path.trim().replace(/^\/+/, '');
    if (!norm) return false;
    if (this._files.some(f => f.path === norm)) {
      this.setFileContent(norm, content);
      return true;
    }
    this._files = [...this._files, { path: norm, content }];
    this._selectedFilePath = norm;
    this._cachedAuditReport = null;
    return true;
  }

  renameFile(oldPath: string, newPath: string): boolean {
    const normNew = newPath.trim().replace(/^\/+/, '');
    if (!normNew || normNew === oldPath) return false;
    if (this._files.some(f => f.path === normNew)) return false;

    this._files = this._files.map(f => (f.path === oldPath ? { ...f, path: normNew } : f));
    if (this._selectedFilePath === oldPath) {
      this._selectedFilePath = normNew;
    }
    this._cachedAuditReport = null;
    return true;
  }

  deleteFile(path: string): boolean {
    if (!this._files.some(f => f.path === path)) return false;
    this._files = this._files.filter(f => f.path !== path);
    if (this._selectedFilePath === path) {
      this._selectedFilePath = this._files[0]?.path || '';
    }
    this._cachedAuditReport = null;
    return true;
  }

  loadPreset(presetId: string): boolean {
    const preset = PRESET_WORKSPACES.find(p => p.id === presetId);
    if (!preset) return false;

    this._currentPresetId = presetId;
    this._files = [...preset.files];
    this._baselineFiles = {};
    for (const f of preset.files) {
      this._baselineFiles[f.path] = f.content;
    }
    this._selectedFilePath = preset.files[0]?.path || '';
    this._cachedAuditReport = null;
    return true;
  }

  scaffoldTemplate(templateId: string, customPath?: string): WorkspaceFileItem | null {
    const tmpl = MANIFEST_TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return null;

    const targetPath = (customPath || tmpl.defaultPath).trim().replace(/^\/+/, '');
    this.addFile(targetPath, tmpl.content);
    return { path: targetPath, content: tmpl.content };
  }

  audit(): WorkspaceAuditReport {
    if (!this._cachedAuditReport) {
      this._cachedAuditReport = auditWorkspaceFiles(this._files);
    }
    return this._cachedAuditReport;
  }

  getDirtyChanges(): DirtyChangeItem[] {
    return computeDirtyChanges(this._files, this._baselineFiles);
  }

  isDirty(): boolean {
    return this.getDirtyChanges().length > 0;
  }

  markClean(): void {
    this._baselineFiles = {};
    for (const f of this._files) {
      this._baselineFiles[f.path] = f.content;
    }
  }

  /**
   * Previews candidate changes for single or batch auto-fixes.
   */
  computeAutoFixCandidate(violationIds?: string[]): {
    candidateFiles: WorkspaceFileItem[];
    diffs: AutoFixDiffItem[];
  } {
    const updated = applyAutoFixes(this._files, violationIds);
    const diffs: AutoFixDiffItem[] = [];

    for (const u of updated) {
      const orig = this._files.find(f => f.path === u.path);
      if (!orig) {
        diffs.push({ path: u.path, isNew: true, newContent: u.content });
      } else if (orig.content !== u.content) {
        diffs.push({ path: u.path, isNew: false, oldContent: orig.content, newContent: u.content });
      }
    }

    return { candidateFiles: updated, diffs };
  }

  applyAutoFixCandidate(candidateFiles: WorkspaceFileItem[]): void {
    this._files = candidateFiles;
    this._cachedAuditReport = null;
  }

  exportJson(): string {
    const payload: Record<string, string> = {};
    for (const f of this._files) {
      payload[f.path] = f.content;
    }
    return JSON.stringify(payload, null, 2);
  }
}
