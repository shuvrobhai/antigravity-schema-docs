import React, { useState } from 'react';
import { runChecks } from '../lib/integrityGate';
import { documentStore } from '../data/repository';
import type { CheckResult } from '../lib/documentStore';
import { CheckCircle2, AlertTriangle, Info, RefreshCw, Terminal, Shield, Check, ChevronDown, ChevronRight } from 'lucide-react';

export const ValidationConsole: React.FC = () => {
  const [results, setResults] = useState<CheckResult[]>(() => runChecks(documentStore));
  const [running, setRunning] = useState(false);
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);

  const handleRunAll = () => {
    setRunning(true);
    setTimeout(() => {
      setResults(runChecks(documentStore));
      setRunning(false);
    }, 400);
  };

  const allPassed = results.every(r => r.status !== 'fail');
  const passedCount = results.filter(r => r.status === 'pass').length;
  const naCount = results.filter(r => r.status === 'na').length;

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto px-6 lg:px-12 py-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-stone-800 pb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono font-bold">
              12 Checks · Browser Preview
            </span>
            <span className="text-xs text-stone-500 font-mono">scripts/validate.ts</span>
          </div>

          <button
            onClick={handleRunAll}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'Running Checks...' : 'Re-run Integrity Suite'}</span>
          </button>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">Repository Integrity & Consistency Suite</h2>
        <p className="text-sm text-stone-400 leading-relaxed">
          Enforces structural contiguity, schema parity, evidence grounding, heading hierarchy, and source archive synchronization across all modules.
        </p>

        {/* Status Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
            allPassed
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {allPassed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm">
                {allPassed ? 'All 12 Integrity Checks Passed' : `${results.length - passedCount} Integrity Checks Failed`}
              </div>
              <div className="text-xs opacity-80 font-mono mt-0.5">
                {passedCount} of {results.length} checks passing{naCount > 0 ? ` · ${naCount} n/a in browser (run CLI)` : ''}
              </div>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-stone-900/80 border border-stone-700">
            Exit Code: {allPassed ? 0 : 1}
          </span>
        </div>
      </div>

      {/* 12 Checks List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-stone-300 font-mono uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Integrity Verification Pipeline</span>
        </h3>

        <div className="space-y-2">
          {results.map((res, index) => {
            const isExpanded = expandedCheck === res.id;
            return (
              <div
                key={res.id}
                className="border border-stone-800 rounded-xl overflow-hidden bg-stone-900/30 hover:border-stone-700 transition-colors"
              >
                <div
                  onClick={() => setExpandedCheck(isExpanded ? null : res.id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs text-stone-500 font-bold w-6">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    {res.status === 'na' ? (
                      <Info className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : res.status === 'pass' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-stone-200 truncate">{res.name}</div>
                      <div className="text-xs text-stone-400 font-mono mt-0.5">{res.messages[0]}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-stone-800 text-[10px] font-mono text-stone-400">
                      {res.category}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-stone-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    )}
                  </div>
                </div>

                {isExpanded && res.details.length > 0 && (
                  <div className="px-4 pb-4 pt-2 border-t border-stone-800/80 bg-stone-950/60 font-mono text-xs space-y-1.5">
                    <div className="text-[11px] text-stone-500 uppercase">Check Breakdown / Verified Artifacts:</div>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
                      {res.details.map((d, i) => (
                        <div key={i} className="text-stone-300 flex items-start gap-2">
                          <span className="text-cyan-500 shrink-0">›</span>
                          <span className="truncate">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
