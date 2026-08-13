import React, { useState } from 'react';
import { EvidenceProbe } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ShieldCheck, FileSearch, CheckCircle2, Clock, Info } from 'lucide-react';

interface EvidenceMatrixProps {
  probes: EvidenceProbe[];
  selectedProbeId: string;
  onSelectProbe: (id: string) => void;
  fullEvidenceDoc: string;
  evidenceIndexDoc?: string;
  researchReportDoc: string;
}

export const EvidenceMatrix: React.FC<EvidenceMatrixProps> = ({
  probes,
  selectedProbeId,
  onSelectProbe,
  fullEvidenceDoc,
  evidenceIndexDoc,
  researchReportDoc,
}) => {
  const [viewMode, setViewMode] = useState<'probes' | 'index' | 'report' | 'full_evidence'>('probes');

  const selectedProbe = probes.find(p => p.id === selectedProbeId) || probes[0];

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto px-6 lg:px-12 py-8 space-y-6 max-w-5xl mx-auto">
      {/* Evidence Section Header */}
      <div className="border-b border-stone-800 pb-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300 text-xs font-mono font-bold">
              [LIVE-1.1.12 · 2026-08-13]
            </span>
            <span className="text-xs text-stone-500 font-mono">empirical_testing_logs</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('probes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'probes'
                  ? 'bg-stone-800 text-cyan-300 border border-stone-700 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Probe Matrix ({probes.length})
            </button>
            <button
              onClick={() => setViewMode('index')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'index'
                  ? 'bg-stone-800 text-cyan-300 border border-stone-700 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Master Registry
            </button>
            <button
              onClick={() => setViewMode('report')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'report'
                  ? 'bg-stone-800 text-cyan-300 border border-stone-700 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Research Reports
            </button>
            <button
              onClick={() => setViewMode('full_evidence')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'full_evidence'
                  ? 'bg-stone-800 text-cyan-300 border border-stone-700 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Raw Evidence.md
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">Empirical Evidence & Grounding Matrix</h2>
        <p className="text-sm text-stone-400 leading-relaxed">
          All documentation claims in the Google Antigravity Technical Reference are mapped directly to live system observation runs and reproducible CLI/TUI telemetry logs.
        </p>

        {/* Source Precedence Legend */}
        <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-stone-300 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            Source Authority Tiers:
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 font-mono text-[11px]">
            1. [DOCS] Official Docs
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/60 text-amber-300 font-mono text-[11px]">
            2. [LIVE] Empirical Probes
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-950/70 border border-blue-800/60 text-blue-300 font-mono text-[11px]">
            3. [GOOGLE] Blog/Whitepapers
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800/60 text-purple-300 font-mono text-[11px]">
            4. [PROTOCOL] LSP/MCP
          </span>
        </div>
      </div>

      {/* Mode 1: Probe Inspector */}
      {viewMode === 'probes' && selectedProbe && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-stone-900/40 border border-stone-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-mono font-bold text-cyan-400">{selectedProbe.id}</span>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-mono font-semibold ${
                    selectedProbe.status === 'RESOLVED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                      : selectedProbe.status === 'VERIFIED'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                      : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                  }`}
                >
                  {selectedProbe.status}
                </span>
              </div>
              <span className="text-xs text-stone-500 font-mono">Verified: {selectedProbe.date}</span>
            </div>

            <h3 className="text-lg font-bold text-white">{selectedProbe.title}</h3>

            <div className="border-t border-stone-800 pt-4">
              <MarkdownRenderer content={selectedProbe.findings} />
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Master Registry */}
      {viewMode === 'index' && evidenceIndexDoc && (
        <div className="border border-stone-800 rounded-xl p-6 bg-stone-900/30">
          <MarkdownRenderer content={evidenceIndexDoc} />
        </div>
      )}

      {/* Mode 3: Research Report */}
      {viewMode === 'report' && (
        <div className="border border-stone-800 rounded-xl p-6 bg-stone-900/30">
          <MarkdownRenderer content={researchReportDoc} />
        </div>
      )}

      {/* Mode 4: Raw evidence.md */}
      {viewMode === 'full_evidence' && (
        <div className="border border-stone-800 rounded-xl p-6 bg-stone-900/30">
          <MarkdownRenderer content={fullEvidenceDoc} />
        </div>
      )}
    </div>
  );
};
