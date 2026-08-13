import React, { useState, useMemo, useRef } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  FileCode,
  FolderTree,
  Wrench,
  Sparkles,
  Copy,
  Check,
  Upload,
  Download,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layers,
  Bot,
  Zap,
  Sliders,
  FileText,
  FolderOpen,
  Save,
  Eye,
  FilePlus,
  Settings,
  Terminal,
  Shield,
  Folder,
  X
} from 'lucide-react';
import { auditWorkspaceFiles, applyAutoFixes } from '../schema/auditor';
import type { WorkspaceFileItem, AuditViolation } from '../types';

// Preset sample workspaces for instant 1-click loading
const PRESET_WORKSPACES: { id: string; name: string; description: string; files: WorkspaceFileItem[] }[] = [
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

// Manifest Scaffolding Templates
interface ManifestTemplate {
  id: string;
  title: string;
  category: 'core' | 'extensibility' | 'governance';
  defaultPath: string;
  description: string;
  content: string;
}

const MANIFEST_TEMPLATES: ManifestTemplate[] = [
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

const IGNORED_DIRECTORIES = new Set([
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

export const WorkspaceAuditor: React.FC = () => {
  const [currentPresetId, setCurrentPresetId] = useState<string>('drifted-legacy');
  const [files, setFiles] = useState<WorkspaceFileItem[]>(PRESET_WORKSPACES[1].files);
  const [baselineFiles, setBaselineFiles] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    PRESET_WORKSPACES[1].files.forEach(f => {
      map[f.path] = f.content;
    });
    return map;
  });
  const [selectedFilePath, setSelectedFilePath] = useState<string>(PRESET_WORKSPACES[1].files[0].path);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'ERROR' | 'WARNING' | 'CROSS'>('ALL');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // File System Access API Handle State
  const [localDirHandle, setLocalDirHandle] = useState<any | null>(null);
  const [localDirName, setLocalDirName] = useState<string | null>(null);

  // Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('settings');
  const [customNewPath, setCustomNewPath] = useState<string>('settings.json');

  // Diff Confirmation Modal State
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);

  const folderInputRef = useRef<HTMLInputElement>(null);

  // Compute live audit report
  const auditReport = useMemo(() => auditWorkspaceFiles(files), [files]);

  const selectedFile = files.find(f => f.path === selectedFilePath) || files[0];

  // Dirty State Analysis
  const dirtyChanges = useMemo(() => {
    const changes: { path: string; status: 'modified' | 'added' | 'deleted'; oldContent?: string; newContent?: string }[] = [];
    
    // Check modified & added
    for (const f of files) {
      const oldContent = baselineFiles[f.path];
      if (oldContent === undefined) {
        changes.push({ path: f.path, status: 'added', newContent: f.content });
      } else if (oldContent !== f.content) {
        changes.push({ path: f.path, status: 'modified', oldContent, newContent: f.content });
      }
    }

    // Check deleted
    for (const oldPath of Object.keys(baselineFiles)) {
      if (!files.some(f => f.path === oldPath)) {
        changes.push({ path: oldPath, status: 'deleted', oldContent: baselineFiles[oldPath] });
      }
    }

    return changes;
  }, [files, baselineFiles]);

  const isDirty = dirtyChanges.length > 0;

  // Filtered violations
  const allViolations = useMemo(() => {
    const list: (AuditViolation & { source: 'file' | 'cross' })[] = [];
    for (const fr of auditReport.fileResults) {
      for (const v of fr.violations) {
        list.push({ ...v, source: 'file' });
      }
    }
    for (const cf of auditReport.crossArtifactFindings) {
      list.push({ ...cf, source: 'cross' });
    }
    return list;
  }, [auditReport]);

  const filteredViolations = useMemo(() => {
    if (filterSeverity === 'ALL') return allViolations;
    if (filterSeverity === 'ERROR') return allViolations.filter(v => v.severity === 'ERROR');
    if (filterSeverity === 'WARNING') return allViolations.filter(v => v.severity === 'WARNING');
    if (filterSeverity === 'CROSS') return allViolations.filter(v => v.source === 'cross');
    return allViolations;
  }, [allViolations, filterSeverity]);

  // Handle Preset Switching
  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_WORKSPACES.find(p => p.id === presetId);
    if (preset) {
      setCurrentPresetId(presetId);
      setLocalDirHandle(null);
      setLocalDirName(null);
      setFiles(preset.files);
      const map: Record<string, string> = {};
      preset.files.forEach(f => {
        map[f.path] = f.content;
      });
      setBaselineFiles(map);
      setSelectedFilePath(preset.files[0].path);
    }
  };

  // Open Local Directory via File System Access API
  const handleOpenLocalDirectory = async () => {
    if (!('showDirectoryPicker' in window)) {
      // Trigger fallback input
      folderInputRef.current?.click();
      return;
    }

    try {
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
      });

      const loadedFiles: WorkspaceFileItem[] = [];

      async function scanDirectory(handle: any, relativePath: string = '') {
        for await (const [name, entry] of handle.entries()) {
          if (IGNORED_DIRECTORIES.has(name) || (name.startsWith('.') && name !== '.agents')) {
            continue;
          }
          const currentRel = relativePath ? `${relativePath}/${name}` : name;
          if (entry.kind === 'file') {
            if (
              name.endsWith('.json') ||
              name.endsWith('.md') ||
              name.endsWith('.yaml') ||
              name.endsWith('.yml')
            ) {
              try {
                const file = await entry.getFile();
                const content = await file.text();
                loadedFiles.push({ path: currentRel, content });
              } catch (e) {
                console.warn(`Could not read file ${currentRel}:`, e);
              }
            }
          } else if (entry.kind === 'directory') {
            await scanDirectory(entry, currentRel);
          }
        }
      }

      await scanDirectory(dirHandle);

      if (loadedFiles.length === 0) {
        alert(`No configuration or markdown files found in ${dirHandle.name}.`);
        return;
      }

      setLocalDirHandle(dirHandle);
      setLocalDirName(dirHandle.name);
      setCurrentPresetId('local-filesystem');
      setFiles(loadedFiles);
      const baseMap: Record<string, string> = {};
      loadedFiles.forEach(f => {
        baseMap[f.path] = f.content;
      });
      setBaselineFiles(baseMap);
      setSelectedFilePath(loadedFiles[0].path);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to open directory:', err);
        alert('Could not access selected directory: ' + err.message);
      }
    }
  };

  // Fallback Folder Upload via input
  const handleFolderUploadFallback = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const loadedFiles: WorkspaceFileItem[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      let relPath = file.webkitRelativePath || file.name;
      // Strip root folder name from relative path
      if (relPath.includes('/')) {
        relPath = relPath.split('/').slice(1).join('/');
      }

      const parts = relPath.split('/');
      if (parts.some(p => IGNORED_DIRECTORIES.has(p))) {
        continue;
      }

      if (
        relPath.endsWith('.json') ||
        relPath.endsWith('.md') ||
        relPath.endsWith('.yaml') ||
        relPath.endsWith('.yml')
      ) {
        const content = await file.text();
        loadedFiles.push({ path: relPath, content });
      }
    }

    if (loadedFiles.length > 0) {
      setLocalDirHandle(null);
      setLocalDirName('Uploaded Folder');
      setCurrentPresetId('uploaded-folder');
      setFiles(loadedFiles);
      const baseMap: Record<string, string> = {};
      loadedFiles.forEach(f => {
        baseMap[f.path] = f.content;
      });
      setBaselineFiles(baseMap);
      setSelectedFilePath(loadedFiles[0].path);
    }
  };

  // Handle Content Edit
  const handleContentChange = (newContent: string) => {
    setFiles(prev =>
      prev.map(f => (f.path === selectedFilePath ? { ...f, content: newContent } : f))
    );
  };

  // Apply Single Auto-Fix
  const handleApplySingleFix = (violationId: string) => {
    const updated = applyAutoFixes(files, [violationId]);
    setFiles(updated);
  };

  // Apply All Auto-Fixes
  const handleApplyAllFixes = () => {
    const updated = applyAutoFixes(files);
    setFiles(updated);
  };

  // Handle Save to Local Disk
  const handleConfirmSaveToDisk = async () => {
    if (!localDirHandle) {
      // Fallback export as JSON
      handleExportBundle();
      setIsDiffModalOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      // Write modified and added files
      for (const change of dirtyChanges) {
        if (change.status === 'modified' || change.status === 'added') {
          const segments = change.path.split('/');
          let curHandle = localDirHandle;
          for (let i = 0; i < segments.length - 1; i++) {
            curHandle = await curHandle.getDirectoryHandle(segments[i], { create: true });
          }
          const fileHandle = await curHandle.getFileHandle(segments[segments.length - 1], { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(change.newContent || '');
          await writable.close();
        } else if (change.status === 'deleted') {
          const segments = change.path.split('/');
          let curHandle = localDirHandle;
          for (let i = 0; i < segments.length - 1; i++) {
            curHandle = await curHandle.getDirectoryHandle(segments[i], { create: false });
          }
          await curHandle.removeEntry(segments[segments.length - 1]);
        }
      }

      // Refresh baseline
      const newBase: Record<string, string> = {};
      files.forEach(f => {
        newBase[f.path] = f.content;
      });
      setBaselineFiles(newBase);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      setIsDiffModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save to disk:', err);
      alert('Failed to write changes to filesystem: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Open Add Template Modal
  const handleOpenAddModal = () => {
    const initialTmpl = MANIFEST_TEMPLATES[0];
    setSelectedTemplateId(initialTmpl.id);
    setCustomNewPath(initialTmpl.defaultPath);
    setIsTemplateModalOpen(true);
  };

  // Create File From Template
  const handleCreateFromTemplate = () => {
    const cleanPath = customNewPath.trim();
    if (!cleanPath) {
      alert('Please enter a valid file path.');
      return;
    }

    if (files.some(f => f.path === cleanPath)) {
      alert(`File "${cleanPath}" already exists in the workspace.`);
      return;
    }

    const template = MANIFEST_TEMPLATES.find(t => t.id === selectedTemplateId);
    const content = template ? template.content : cleanPath.endsWith('.json') ? '{\n  \n}' : '# ' + cleanPath + '\n';

    const newFileItem: WorkspaceFileItem = { path: cleanPath, content };
    setFiles(prev => [...prev, newFileItem]);
    setSelectedFilePath(cleanPath);
    setIsTemplateModalOpen(false);
  };

  // Handle Delete File
  const handleDeleteFile = (pathToDelete: string) => {
    if (files.length <= 1) {
      alert('Workspace must have at least one file.');
      return;
    }
    const filtered = files.filter(f => f.path !== pathToDelete);
    setFiles(filtered);
    if (selectedFilePath === pathToDelete) {
      setSelectedFilePath(filtered[0].path);
    }
  };

  // Export Workspace Files as JSON Bundle
  const handleExportBundle = () => {
    const blob = new Blob([JSON.stringify(files, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `antigravity-workspace-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate Agent Self-Healing Prompt
  const generateAgentPrompt = () => {
    let promptText = `# Antigravity Workspace Audit Remediation Plan\n\n`;
    promptText += `The Antigravity Workspace Auditor scanned ${auditReport.totalFiles} files and discovered ${auditReport.totalViolations} issues (Score: ${auditReport.score}/100).\n\n`;
    promptText += `## Required Corrections:\n`;

    filteredViolations.forEach((v, idx) => {
      promptText += `\n### Issue ${idx + 1}: ${v.rule} (${v.severity})\n`;
      promptText += `- **File**: \`${v.file}\`\n`;
      promptText += `- **Diagnostic**: ${v.message}\n`;
      if (v.suggestedFix) {
        promptText += `- **Remediation**: ${v.suggestedFix}\n`;
      }
    });

    promptText += `\n## Instruction for AI Agent:\n`;
    promptText += `Please inspect the affected files listed above, correct the configuration drift according to Google Antigravity v1.1 standards, and ensure all cross-artifact skill and tool references resolve cleanly.\n`;
    return promptText;
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generateAgentPrompt());
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Health Score Color
  const getScoreBadge = (score: number) => {
    if (score >= 90) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'EXCELLENT' };
    if (score >= 70) return { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', label: 'GOOD' };
    if (score >= 40) return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', label: 'NEEDS ATTENTION' };
    return { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', label: 'CRITICAL DRIFT' };
  };

  const scoreBadge = getScoreBadge(auditReport.score);
  const fixableCount = allViolations.filter(v => v.fixable).length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-950 text-stone-100 font-sans">
      {/* Hidden file input for universal folder upload fallback */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderUploadFallback}
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
      />

      {/* Top Banner & Control Bar */}
      <div className="border-b border-stone-800/80 bg-stone-900/40 p-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight text-stone-100 flex items-center gap-2">
                  Workspace Diagnostic & Schema Auditor
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                    Dual Engine · CLI & UI
                  </span>
                  {localDirName && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                      <Folder className="w-3 h-3" /> {localDirName}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-stone-400">
                  Audit, edit, and auto-repair 18 native JSON schemas, YAML frontmatter, and cross-artifact links.
                </p>
              </div>
            </div>
          </div>

          {/* Action & Preset Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Open Local Directory Button */}
            <button
              onClick={handleOpenLocalDirectory}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Open a local directory from your filesystem via File System Access API"
            >
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              Open Local Directory
            </button>

            {/* Save to Disk / Sync Button */}
            {isDirty && (
              <button
                onClick={() => setIsDiffModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all flex items-center gap-1.5 shadow-md animate-pulse cursor-pointer"
                title="Review pending changes and save back to local filesystem"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes ({dirtyChanges.length})
              </button>
            )}

            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 px-2 py-1 bg-emerald-950/60 border border-emerald-800 rounded-lg">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}

            {/* Presets */}
            <div className="flex items-center gap-1 bg-stone-900/80 p-1 rounded-lg border border-stone-800">
              <span className="text-[11px] text-stone-500 px-1 font-medium">Presets:</span>
              {PRESET_WORKSPACES.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                    currentPresetId === preset.id
                      ? 'bg-stone-800 text-cyan-300 border border-stone-700 shadow-sm'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Export JSON */}
            <button
              onClick={handleExportBundle}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800 transition-colors cursor-pointer"
              title="Download workspace JSON bundle"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Diagnostic Health Score Bar */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-stone-800/60">
          {/* Score Card */}
          <div className={`p-3 rounded-lg border ${scoreBadge.bg} ${scoreBadge.border} flex items-center justify-between`}>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Health Score</div>
              <div className={`text-xl font-bold font-mono ${scoreBadge.text}`}>
                {auditReport.score}%
              </div>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${scoreBadge.bg} ${scoreBadge.text} border ${scoreBadge.border}`}>
              {scoreBadge.label}
            </span>
          </div>

          {/* Total Files */}
          <div className="p-3 rounded-lg border border-stone-800 bg-stone-900/30 flex items-center gap-3">
            <div className="p-2 rounded bg-stone-800/50 text-stone-300">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Audited Files</div>
              <div className="text-lg font-bold text-stone-200 font-mono">{auditReport.totalFiles}</div>
            </div>
          </div>

          {/* Errors */}
          <div className="p-3 rounded-lg border border-stone-800 bg-stone-900/30 flex items-center gap-3">
            <div className={`p-2 rounded ${auditReport.errorCount > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-stone-800/50 text-stone-400'}`}>
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Errors</div>
              <div className={`text-lg font-bold font-mono ${auditReport.errorCount > 0 ? 'text-rose-400' : 'text-stone-300'}`}>
                {auditReport.errorCount}
              </div>
            </div>
          </div>

          {/* Warnings */}
          <div className="p-3 rounded-lg border border-stone-800 bg-stone-900/30 flex items-center gap-3">
            <div className={`p-2 rounded ${auditReport.warningCount > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-stone-800/50 text-stone-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Warnings</div>
              <div className={`text-lg font-bold font-mono ${auditReport.warningCount > 0 ? 'text-amber-400' : 'text-stone-300'}`}>
                {auditReport.warningCount}
              </div>
            </div>
          </div>

          {/* Auto-Fix Available */}
          <div className="p-3 rounded-lg border border-stone-800 bg-stone-900/30 flex items-center justify-between col-span-2 sm:col-span-1">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Auto-Fixes</div>
              <div className="text-lg font-bold text-cyan-400 font-mono">{fixableCount} Available</div>
            </div>
            {fixableCount > 0 && (
              <button
                onClick={handleApplyAllFixes}
                className="px-2 py-1 bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-bold text-xs rounded transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                title="Apply all automated remediations"
              >
                <Zap className="w-3.5 h-3.5" /> Fix All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Split View */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Workspace File Explorer & Code Editor */}
        <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-stone-800/80 bg-stone-950 overflow-hidden">
          {/* File Tree Header */}
          <div className="h-10 px-4 border-b border-stone-800 bg-stone-900/50 flex items-center justify-between">
            <span className="text-xs font-mono text-stone-300 font-semibold flex items-center gap-2">
              <FolderTree className="w-3.5 h-3.5 text-cyan-400" />
              Workspace Files ({files.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddModal}
                className="text-xs px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded flex items-center gap-1 transition-colors font-medium cursor-pointer"
              >
                <Plus className="w-3 h-3 text-cyan-400" /> Add File
              </button>
            </div>
          </div>

          {/* File Tabs List */}
          <div className="p-2 border-b border-stone-800/60 bg-stone-900/20 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {files.map(f => {
              const fileRes = auditReport.fileResults.find(r => r.path === f.path);
              const hasErrors = fileRes?.violations.some(v => v.severity === 'ERROR');
              const hasWarnings = fileRes?.violations.some(v => v.severity === 'WARNING');
              const isSelected = f.path === selectedFilePath;
              const isFileDirty = baselineFiles[f.path] !== undefined && baselineFiles[f.path] !== f.content;
              const isFileNew = baselineFiles[f.path] === undefined;

              return (
                <div
                  key={f.path}
                  onClick={() => setSelectedFilePath(f.path)}
                  className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-stone-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-stone-900/60 text-stone-400 border border-stone-800/80 hover:bg-stone-800/60 hover:text-stone-200'
                  }`}
                >
                  {hasErrors ? (
                    <XCircle className="w-3 h-3 text-rose-400 flex-shrink-0" />
                  ) : hasWarnings ? (
                    <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  )}
                  <span className="truncate max-w-[150px]">{f.path}</span>
                  {(isFileDirty || isFileNew) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Modified / Unsaved" />
                  )}
                  {files.length > 1 && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteFile(f.path);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity ml-1 cursor-pointer"
                      title="Delete file from workspace"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Live Code Editor */}
          <div className="flex-1 flex flex-col min-h-0 bg-stone-950">
            <div className="px-4 py-2 bg-stone-900/30 border-b border-stone-800/60 flex items-center justify-between text-xs text-stone-400">
              <span className="font-mono text-cyan-400 font-medium truncate flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-stone-500" />
                {selectedFile?.path}
              </span>
              <span className="text-[11px] text-stone-500">Live schema validation as you type</span>
            </div>
            <textarea
              value={selectedFile?.content || ''}
              onChange={e => handleContentChange(e.target.value)}
              className="flex-1 p-4 bg-stone-950 font-mono text-xs text-stone-200 resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/30 leading-relaxed overflow-auto"
              spellCheck={false}
              placeholder="Paste or write workspace configuration content here..."
            />
          </div>
        </div>

        {/* Right Column: Audit Diagnoses, Cross-Artifact Links & Remediation */}
        <div className="w-full lg:w-1/2 flex flex-col bg-stone-950 overflow-hidden">
          {/* Findings Filter Bar */}
          <div className="h-10 px-4 border-b border-stone-800 bg-stone-900/50 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-stone-300 font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Audit Diagnoses ({filteredViolations.length})
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1">
              {(['ALL', 'ERROR', 'WARNING', 'CROSS'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors cursor-pointer ${
                    filterSeverity === sev
                      ? 'bg-stone-800 text-stone-100 font-bold border border-stone-700'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Diagnostic Findings List */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {filteredViolations.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-emerald-500/20 rounded-xl bg-emerald-950/10">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 border border-emerald-500/40">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-emerald-300">Workspace 100% Valid & Compliant</h3>
                <p className="text-xs text-stone-400 mt-1 max-w-sm">
                  All schemas, YAML frontmatters, agent tools, and MCP server links pass native Antigravity v1.1 checks.
                </p>
              </div>
            ) : (
              filteredViolations.map((item, idx) => {
                const isError = item.severity === 'ERROR';
                const isWarning = item.severity === 'WARNING';
                const isCross = item.source === 'cross';

                return (
                  <div
                    key={item.id || idx}
                    className={`p-4 rounded-xl border transition-all ${
                      isError
                        ? 'bg-rose-950/10 border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-950/10 border-amber-500/30'
                        : 'bg-cyan-950/10 border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        {isError ? (
                          <XCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Bot className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-stone-200">{item.file}</span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                                isError
                                  ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                                  : isWarning
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                                  : 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                              }`}
                            >
                              {item.severity}
                            </span>
                            {isCross && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                                Cross-Artifact Link
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-300 mt-1 leading-relaxed">{item.message}</p>
                          {item.suggestedFix && (
                            <div className="mt-2 text-xs bg-stone-900/60 p-2.5 rounded-lg border border-stone-800/80 text-stone-300">
                              <span className="text-cyan-400 font-semibold">Recommended Fix: </span>
                              {item.suggestedFix}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Auto Fix Button */}
                      {item.fixable && (
                        <button
                          onClick={() => handleApplySingleFix(item.id)}
                          className="px-2.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-medium flex items-center gap-1.5 flex-shrink-0 transition-colors shadow-sm cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-cyan-400" />
                          Apply Fix
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Agent Self-Healing Export Bar */}
          <div className="p-4 border-t border-stone-800 bg-stone-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Let Gemini or Antigravity auto-repair your workspace files</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyPrompt}
                className="flex-1 sm:flex-initial px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPrompt ? 'Prompt Copied!' : 'Copy AI Remediation Prompt'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. Add File / Template Scaffolding Modal                                   */}
      {/* ========================================================================= */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-stone-900 border border-stone-750 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 sm:px-6 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FilePlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-100">Add Workspace Manifest</h3>
                  <p className="text-xs text-stone-400">Choose a native Antigravity scaffold or specify a custom path.</p>
                </div>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Template Selection Grid */}
            <div className="p-4 sm:px-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-2 font-mono">
                  Select Manifest Template
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MANIFEST_TEMPLATES.map(t => {
                    const isSelected = selectedTemplateId === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedTemplateId(t.id);
                          setCustomNewPath(t.defaultPath);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/30'
                            : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-200">{t.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-800 text-stone-400 border border-stone-700">
                            {t.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1 leading-snug">{t.description}</p>
                        <div className="text-[10px] font-mono text-cyan-400/90 mt-2 truncate">
                          {t.defaultPath}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Relative Path Input */}
              <div className="pt-2 border-t border-stone-800">
                <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-1.5 font-mono">
                  Relative File Path
                </label>
                <input
                  type="text"
                  value={customNewPath}
                  onChange={e => setCustomNewPath(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-750 rounded-lg text-xs font-mono text-stone-200 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
                  placeholder="e.g. .agents/skills/my-skill/SKILL.md"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:px-6 border-t border-stone-800 bg-stone-900/50 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFromTemplate}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Create File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Save Changes & Diff Confirmation Modal                                 */}
      {/* ========================================================================= */}
      {isDiffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-stone-900 border border-stone-750 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 sm:px-6 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Save className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-100">Review & Save Workspace Changes</h3>
                  <p className="text-xs text-stone-400">
                    {dirtyChanges.length} pending change(s) ready to be written to disk.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDiffModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Changes List */}
            <div className="p-4 sm:px-6 overflow-y-auto flex-1 space-y-3 font-mono">
              {dirtyChanges.map((change, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-200 flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      {change.path}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        change.status === 'added'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : change.status === 'deleted'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {change.status}
                    </span>
                  </div>

                  {/* Content Preview */}
                  {change.status === 'modified' && (
                    <div className="text-[11px] text-stone-400 bg-stone-900/60 p-2.5 rounded border border-stone-850 max-h-32 overflow-y-auto whitespace-pre-wrap">
                      {change.newContent}
                    </div>
                  )}

                  {change.status === 'added' && (
                    <div className="text-[11px] text-emerald-300 bg-stone-900/60 p-2.5 rounded border border-stone-850 max-h-32 overflow-y-auto whitespace-pre-wrap">
                      {change.newContent}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:px-6 border-t border-stone-800 bg-stone-900/50 flex items-center justify-between">
              <div className="text-xs text-stone-400">
                {localDirHandle ? (
                  <span>Will update files directly in <strong>{localDirName}</strong>.</span>
                ) : (
                  <span>Will export updated workspace JSON bundle.</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDiffModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSaveToDisk}
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Saving...' : 'Confirm & Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
