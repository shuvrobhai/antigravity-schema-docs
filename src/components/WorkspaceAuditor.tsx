import React, { useState, useMemo } from 'react';
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
  FileText
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

export const WorkspaceAuditor: React.FC = () => {
  const [currentPresetId, setCurrentPresetId] = useState<string>('drifted-legacy');
  const [files, setFiles] = useState<WorkspaceFileItem[]>(PRESET_WORKSPACES[1].files);
  const [selectedFilePath, setSelectedFilePath] = useState<string>(PRESET_WORKSPACES[1].files[0].path);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'ERROR' | 'WARNING' | 'CROSS'>('ALL');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedDiff, setCopiedDiff] = useState(false);

  // Compute live audit report
  const auditReport = useMemo(() => auditWorkspaceFiles(files), [files]);

  const selectedFile = files.find(f => f.path === selectedFilePath) || files[0];

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
      setFiles(preset.files);
      setSelectedFilePath(preset.files[0].path);
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

  // Handle Add File
  const handleAddFile = () => {
    const fileName = prompt('Enter relative path for new workspace file (e.g. .agents/skills/my-skill/SKILL.md):', '.agents/skills/new-skill/SKILL.md');
    if (fileName && fileName.trim()) {
      const cleanPath = fileName.trim();
      if (files.some(f => f.path === cleanPath)) {
        alert('File already exists in workspace.');
        return;
      }
      const initialContent = cleanPath.endsWith('.json')
        ? '{\n  \n}'
        : '---\nname: my-item\ndescription: A brief description\n---\n# My Content\n';
      const newFileItem: WorkspaceFileItem = { path: cleanPath, content: initialContent };
      setFiles(prev => [...prev, newFileItem]);
      setSelectedFilePath(cleanPath);
    }
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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-950 text-stone-100">
      {/* Top Banner & Preset Selector */}
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
                </h2>
                <p className="text-xs text-stone-400">
                  Real-time validation for 18 native JSON schemas, YAML frontmatter, and cross-artifact links.
                </p>
              </div>
            </div>
          </div>

          {/* Preset Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-stone-400 font-medium mr-1 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-stone-500" /> Presets:
            </span>
            {PRESET_WORKSPACES.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentPresetId === preset.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-stone-200 hover:border-stone-700'
                }`}
              >
                {preset.name}
              </button>
            ))}
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
                className="px-2 py-1 bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-bold text-xs rounded transition-all shadow-sm flex items-center gap-1"
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
              Workspace File Tree ({files.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddFile}
                className="text-xs px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3 text-cyan-400" /> Add File
              </button>
            </div>
          </div>

          {/* File Tabs List */}
          <div className="p-2 border-b border-stone-800/60 bg-stone-900/20 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
            {files.map(f => {
              const fileRes = auditReport.fileResults.find(r => r.path === f.path);
              const hasErrors = fileRes?.violations.some(v => v.severity === 'ERROR');
              const hasWarnings = fileRes?.violations.some(v => v.severity === 'WARNING');
              const isSelected = f.path === selectedFilePath;

              return (
                <div
                  key={f.path}
                  onClick={() => setSelectedFilePath(f.path)}
                  className={`group flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono cursor-pointer transition-all ${
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
                  <span className="truncate max-w-[140px]">{f.path}</span>
                  {files.length > 1 && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteFile(f.path);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Live Editor */}
          <div className="flex-1 flex flex-col min-h-0 bg-stone-950">
            <div className="px-4 py-2 bg-stone-900/30 border-b border-stone-800/60 flex items-center justify-between text-xs text-stone-400">
              <span className="font-mono text-cyan-400 font-medium truncate">{selectedFile?.path}</span>
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

        {/* Right Column: Audit Findings, Cross-Artifact Links & Remediation */}
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
                  className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
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
                          className="px-2.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-medium flex items-center gap-1.5 flex-shrink-0 transition-colors shadow-sm"
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
                className="flex-1 sm:flex-initial px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPrompt ? 'Prompt Copied!' : 'Copy AI Remediation Prompt'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
