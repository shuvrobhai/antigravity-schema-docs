import React from 'react';
import { TabType } from '../types';
import { BookOpen, Boxes, ShieldCheck, Database, FileText, CheckCircle2, Search, FileCode, Wrench, Terminal, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenSearch: () => void;
  schemaCount: number;
  moduleCount: number;
  evidenceCount: number;
  sourceCount: number;
  adrCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  schemaCount,
  moduleCount,
  evidenceCount,
  sourceCount,
  adrCount = 5,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; count?: number; highlight?: boolean }[] = [
    { id: 'reference', label: 'Reference', icon: BookOpen, count: moduleCount },
    { id: 'auditor', label: 'Workspace Auditor', icon: LayoutDashboard, highlight: true },
    { id: 'extensibility', label: 'Extensibility Studio', icon: Wrench },
    { id: 'schemas', label: 'JSON Schemas', icon: Boxes, count: schemaCount },
    { id: 'cli', label: 'CLI Reference', icon: Terminal },
    { id: 'evidence', label: 'Evidence & Logs', icon: ShieldCheck, count: evidenceCount },
    { id: 'sources', label: 'Web Sources', icon: Database, count: sourceCount },
    { id: 'adrs', label: 'ADRs', icon: FileText, count: adrCount },
    { id: 'validation', label: 'Integrity Suite', icon: CheckCircle2, count: 11 },
    { id: 'composed', label: 'Parent Doc', icon: FileCode },
  ];

  return (
    <header className="h-16 border-b border-stone-800/80 bg-stone-950/90 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-base shadow-inner">
          agy
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>Google Antigravity</span>
              <span className="text-stone-500 font-normal">/</span>
              <span className="text-cyan-400 font-medium font-mono text-xs">Schema & Technical Reference</span>
            </h1>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              v1.1.12 · 2026-08-13
            </span>
          </div>
          <p className="text-[11px] text-stone-400 hidden sm:block">Modular specification, 18 schemas & evidence validation suite</p>
        </div>
      </div>

      {/* Center Tabs */}
      <nav className="hidden md:flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800/80">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-stone-800 text-cyan-300 shadow-sm border border-stone-700/60'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-stone-500'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isActive ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50' : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Tools & Search Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 text-xs transition-colors cursor-pointer group shadow-sm"
        >
          <Search className="w-3.5 h-3.5 text-stone-400 group-hover:text-cyan-400 transition-colors" />
          <span className="hidden sm:inline text-stone-400 group-hover:text-stone-300">Quick search...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-stone-800 text-[10px] font-mono text-stone-400 border border-stone-700">
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  );
};
