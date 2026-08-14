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
  X,
  Edit2,
  ArrowRight
} from 'lucide-react';
import { auditWorkspaceFiles, applyAutoFixes } from '../schema/auditor';
import {
  PRESET_WORKSPACES,
  MANIFEST_TEMPLATES,
  IGNORED_DIRECTORIES,
  computeDirtyChanges,
  type ManifestTemplate,
  type AutoFixDiffItem,
} from '../schema/workspaceSession';
import { toErrorMessage } from '../lib/errors';
import type { WorkspaceFileItem, AuditViolation } from '../types';

function isFileHandle(handle: FileSystemHandle): handle is FileSystemFileHandle {
  return handle.kind === 'file';
}

function isDirectoryHandle(handle: FileSystemHandle): handle is FileSystemDirectoryHandle {
  return handle.kind === 'directory';
}

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
  const [localDirHandle, setLocalDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [localDirName, setLocalDirName] = useState<string | null>(null);

  // Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('settings');
  const [customNewPath, setCustomNewPath] = useState<string>('settings.json');

  // Rename File Modal State
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameOldPath, setRenameOldPath] = useState<string>('');
  const [renameNewPath, setRenameNewPath] = useState<string>('');

  // Diff Confirmation Modal State for Save to Disk
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);

  // Auto-Fix Preview Diff Modal State
  const [isAutoFixModalOpen, setIsAutoFixModalOpen] = useState(false);
  const [pendingAutoFixCandidate, setPendingAutoFixCandidate] = useState<WorkspaceFileItem[]>([]);
  const [pendingAutoFixDiffs, setPendingAutoFixDiffs] = useState<AutoFixDiffItem[]>([]);
  const [pendingAutoFixTitle, setPendingAutoFixTitle] = useState<string>('');

  const folderInputRef = useRef<HTMLInputElement>(null);

  // Compute live audit report
  const auditReport = useMemo(() => auditWorkspaceFiles(files), [files]);

  const selectedFile = files.find(f => f.path === selectedFilePath) || files[0];

  // Dirty State Analysis
  const dirtyChanges = useMemo(() => computeDirtyChanges(files, baselineFiles), [files, baselineFiles]);

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
      folderInputRef.current?.click();
      return;
    }

    try {
      const dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
      });

      const loadedFiles: WorkspaceFileItem[] = [];

      async function scanDirectory(handle: FileSystemDirectoryHandle, relativePath: string = '') {
        for await (const [name, entry] of handle.entries()) {
          if (IGNORED_DIRECTORIES.has(name) || (name.startsWith('.') && name !== '.agents')) {
            continue;
          }
          const currentRel = relativePath ? `${relativePath}/${name}` : name;
          if (isFileHandle(entry)) {
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
          } else if (isDirectoryHandle(entry)) {
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
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('Failed to open directory:', err);
      alert('Could not access selected directory: ' + toErrorMessage(err));
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

  // Jump to relevant file from diagnostic finding
  const handleJumpToFile = (targetFilePath: string) => {
    if (files.some(f => f.path === targetFilePath)) {
      setSelectedFilePath(targetFilePath);
    }
  };

  // Prepare & Preview Auto-Fix Diff (Single Fix)
  const handlePreviewSingleFix = (violation: AuditViolation) => {
    const updated = applyAutoFixes(files, [violation.id]);
    const diffs: AutoFixDiffItem[] = [];

    for (const u of updated) {
      const orig = files.find(f => f.path === u.path);
      if (!orig) {
        diffs.push({ path: u.path, isNew: true, newContent: u.content });
      } else if (orig.content !== u.content) {
        diffs.push({ path: u.path, isNew: false, oldContent: orig.content, newContent: u.content });
      }
    }

    setPendingAutoFixCandidate(updated);
    setPendingAutoFixDiffs(diffs);
    setPendingAutoFixTitle(`Auto-Fix: ${violation.rule} (${violation.file})`);
    setIsAutoFixModalOpen(true);
  };

  // Prepare & Preview Auto-Fix Diff (All Fixes)
  const handlePreviewAllFixes = () => {
    const updated = applyAutoFixes(files);
    const diffs: AutoFixDiffItem[] = [];

    for (const u of updated) {
      const orig = files.find(f => f.path === u.path);
      if (!orig) {
        diffs.push({ path: u.path, isNew: true, newContent: u.content });
      } else if (orig.content !== u.content) {
        diffs.push({ path: u.path, isNew: false, oldContent: orig.content, newContent: u.content });
      }
    }

    setPendingAutoFixCandidate(updated);
    setPendingAutoFixDiffs(diffs);
    setPendingAutoFixTitle(`Auto-Fix All: ${diffs.length} File(s) Remediated`);
    setIsAutoFixModalOpen(true);
  };

  // Confirm Auto-Fixes and apply to workspace
  const handleConfirmApplyAutoFixes = () => {
    if (pendingAutoFixCandidate.length > 0) {
      setFiles(pendingAutoFixCandidate);
      if (pendingAutoFixDiffs.length > 0) {
        setSelectedFilePath(pendingAutoFixDiffs[0].path);
      }
    }
    setIsAutoFixModalOpen(false);
  };

  // Handle Save to Local Disk (rewriting real files)
  const handleConfirmSaveToDisk = async () => {
    let targetHandle = localDirHandle;

    if (!targetHandle) {
      if ('showDirectoryPicker' in window) {
        try {
          targetHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
          setLocalDirHandle(targetHandle);
          setLocalDirName(targetHandle.name);
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          // Fallback export as JSON
          handleExportBundle();
          setIsDiffModalOpen(false);
          return;
        }
      } else {
        handleExportBundle();
        setIsDiffModalOpen(false);
        return;
      }
    }

    setIsSaving(true);
    try {
      // Write modified and added files
      for (const change of dirtyChanges) {
        if (change.status === 'modified' || change.status === 'added') {
          const segments = change.path.split('/');
          let curHandle = targetHandle;
          for (let i = 0; i < segments.length - 1; i++) {
            curHandle = await curHandle.getDirectoryHandle(segments[i], { create: true });
          }
          const fileHandle = await curHandle.getFileHandle(segments[segments.length - 1], { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(change.newContent || '');
          await writable.close();
        } else if (change.status === 'deleted') {
          const segments = change.path.split('/');
          let curHandle = targetHandle;
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
    } catch (err) {
      console.error('Failed to save to disk:', err);
      alert('Failed to write changes to filesystem: ' + toErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  // Open Rename Modal
  const handleOpenRenameModal = (oldPath: string) => {
    setRenameOldPath(oldPath);
    setRenameNewPath(oldPath);
    setIsRenameModalOpen(true);
  };

  // Confirm Rename File
  const handleConfirmRename = () => {
    const cleanNew = renameNewPath.trim();
    if (!cleanNew) {
      alert('Please enter a valid file path.');
      return;
    }
    if (cleanNew !== renameOldPath && files.some(f => f.path === cleanNew)) {
      alert(`File "${cleanNew}" already exists in workspace.`);
      return;
    }

    setFiles(prev =>
      prev.map(f => (f.path === renameOldPath ? { ...f, path: cleanNew } : f))
    );
    if (selectedFilePath === renameOldPath) {
      setSelectedFilePath(cleanNew);
    }
    setIsRenameModalOpen(false);
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
                title="Review pending changes and save directly back to local filesystem"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes ({dirtyChanges.length})
              </button>
            )}

            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 px-2 py-1 bg-emerald-950/60 border border-emerald-800 rounded-lg">
                <Check className="w-3.5 h-3.5" /> Saved to Disk!
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

        {/* Diagnostic Health Score Bar (Clickable Stat Cards) */}
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

          {/* Total Files Card (Click to show ALL) */}
          <div
            onClick={() => setFilterSeverity('ALL')}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              filterSeverity === 'ALL'
                ? 'border-cyan-500/50 bg-stone-850 shadow-sm'
                : 'border-stone-800 bg-stone-900/30 hover:border-stone-700'
            } flex items-center gap-3`}
            title="Click to view all diagnoses"
          >
            <div className="p-2 rounded bg-stone-800/50 text-stone-300">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Audited Files</div>
              <div className="text-lg font-bold text-stone-200 font-mono">{auditReport.totalFiles}</div>
            </div>
          </div>

          {/* Errors Card (Click to filter ERRORS) */}
          <div
            onClick={() => setFilterSeverity('ERROR')}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              filterSeverity === 'ERROR'
                ? 'border-rose-500/60 bg-rose-950/30 shadow-sm'
                : 'border-stone-800 bg-stone-900/30 hover:border-rose-900/50'
            } flex items-center gap-3`}
            title="Click to filter error diagnoses"
          >
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

          {/* Warnings Card (Click to filter WARNINGS) */}
          <div
            onClick={() => setFilterSeverity('WARNING')}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              filterSeverity === 'WARNING'
                ? 'border-amber-500/60 bg-amber-950/30 shadow-sm'
                : 'border-stone-800 bg-stone-900/30 hover:border-amber-900/50'
            } flex items-center gap-3`}
            title="Click to filter warning diagnoses"
          >
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
                onClick={handlePreviewAllFixes}
                className="px-2 py-1 bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-bold text-xs rounded transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                title="Preview diff and apply all automated remediations"
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
                      ? 'bg-stone-800 text-cyan-300 border border-cyan-500/40 shadow-sm ring-1 ring-cyan-500/20'
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

                  {/* Rename File Icon */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleOpenRenameModal(f.path);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-cyan-400 transition-opacity ml-1 cursor-pointer"
                    title="Rename path"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>

                  {/* Delete File Icon */}
                  {files.length > 1 && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteFile(f.path);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity cursor-pointer"
                      title="Delete file from workspace"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenRenameModal(selectedFile?.path)}
                  className="text-[11px] text-stone-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" /> Rename
                </button>
                <span className="text-[11px] text-stone-600">|</span>
                <span className="text-[11px] text-stone-500">Live schema validation</span>
              </div>
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

          {/* Diagnostic Findings List (Click Card to Jump to File) */}
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
                    onClick={() => handleJumpToFile(item.file)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedFilePath === item.file ? 'ring-1 ring-cyan-500/40' : ''
                    } ${
                      isError
                        ? 'bg-rose-950/10 border-rose-500/30 hover:border-rose-500/60'
                        : isWarning
                        ? 'bg-amber-950/10 border-amber-500/30 hover:border-amber-500/60'
                        : 'bg-cyan-950/10 border-cyan-500/30 hover:border-cyan-500/60'
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
                            <span className="font-mono text-xs font-bold text-stone-200 hover:underline">{item.file}</span>
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

                      {/* Auto Fix Button (Opens Diff Preview First) */}
                      {item.fixable && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handlePreviewSingleFix(item);
                          }}
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
      {/* 2. Rename File Path Modal                                                 */}
      {/* ========================================================================= */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-stone-900 border border-stone-750 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 sm:px-6 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-100">Rename File Path</h3>
                  <p className="text-xs text-stone-400">Update file location or rename folder segments.</p>
                </div>
              </div>
              <button
                onClick={() => setIsRenameModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:px-6 space-y-3 font-mono">
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">Current Path</label>
                <div className="text-xs text-stone-400 bg-stone-950 p-2 rounded border border-stone-800 truncate">
                  {renameOldPath}
                </div>
              </div>
              <div>
                <label className="text-[11px] text-stone-300 block mb-1 font-bold">New Path</label>
                <input
                  type="text"
                  value={renameNewPath}
                  onChange={e => setRenameNewPath(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-750 rounded-lg text-xs font-mono text-stone-100 focus:outline-none focus:border-cyan-500/60"
                  placeholder="e.g. .agents/skills/code-reviewer/SKILL.md"
                />
              </div>
            </div>

            <div className="p-4 sm:px-6 border-t border-stone-800 bg-stone-900/50 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsRenameModalOpen(false)}
                className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRename}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Auto-Fix Diff Preview & Confirmation Modal                             */}
      {/* ========================================================================= */}
      {isAutoFixModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-stone-900 border border-stone-750 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-4 sm:px-6 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-100">{pendingAutoFixTitle}</h3>
                  <p className="text-xs text-stone-400">
                    Review automated diff before applying changes to workspace files.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAutoFixModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Diffs List */}
            <div className="p-4 sm:px-6 overflow-y-auto flex-1 space-y-4 font-mono">
              {pendingAutoFixDiffs.length === 0 ? (
                <div className="p-4 text-xs text-stone-400 text-center">No changes generated.</div>
              ) : (
                pendingAutoFixDiffs.map((diff, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-850">
                      <span className="font-bold text-stone-200 flex items-center gap-2">
                        <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                        {diff.path}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          diff.isNew
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                        }`}
                      >
                        {diff.isNew ? 'New Scaffold' : 'Auto-Repaired'}
                      </span>
                    </div>

                    {/* Side by side / diff preview */}
                    {!diff.isNew && diff.oldContent && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-rose-400 mb-1">Before (Original)</div>
                          <pre className="p-2.5 rounded bg-rose-950/20 border border-rose-900/40 text-rose-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                            {diff.oldContent}
                          </pre>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">After (Fixed)</div>
                          <pre className="p-2.5 rounded bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                            {diff.newContent}
                          </pre>
                        </div>
                      </div>
                    )}

                    {diff.isNew && (
                      <div>
                        <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">New File Content</div>
                        <pre className="p-2.5 rounded bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                          {diff.newContent}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:px-6 border-t border-stone-800 bg-stone-900/50 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsAutoFixModalOpen(false)}
                className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApplyAutoFixes}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Confirm & Apply Fixes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. Save Changes & Diff Confirmation Modal (Physical Disk Writer)          */}
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
                  <span>Will prompt folder destination on your computer to save physical files.</span>
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
                  {isSaving ? 'Saving...' : 'Confirm & Save to Disk'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
