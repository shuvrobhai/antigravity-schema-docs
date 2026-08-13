import React, { useState } from 'react';
import { TabType, ReferenceModule, JsonSchemaItem, EvidenceProbe, SourceCitation, AdrRecord } from '../types';
import { BookOpen, Boxes, ShieldCheck, Database, FileText, CheckCircle2, Search, Filter } from 'lucide-react';

interface SidebarProps {
  activeTab: TabType;
  selectedId: string;
  onSelect: (id: string) => void;
  modules: ReferenceModule[];
  schemas: JsonSchemaItem[];
  evidence: EvidenceProbe[];
  sources: SourceCitation[];
  adrs: AdrRecord[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  selectedId,
  onSelect,
  modules,
  schemas,
  evidence,
  sources,
  adrs,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [sourceCategoryFilter, setSourceCategoryFilter] = useState<string>('all');
  const [evidenceStatusFilter, setEvidenceStatusFilter] = useState<string>('all');

  const q = filterQuery.toLowerCase();

  return (
    <aside className="w-80 h-[calc(100vh-4rem)] border-r border-stone-800 bg-stone-950 flex flex-col shrink-0">
      {/* Search/Filter Bar */}
      <div className="p-3 border-b border-stone-800/80 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            placeholder={`Filter ${activeTab}...`}
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
          />
        </div>

        {/* Reference High-Traffic Extensibility Topic Shortcuts */}
        {activeTab === 'reference' && !filterQuery && (
          <div className="space-y-1 pt-1">
            <div className="text-[10px] uppercase font-mono text-stone-500 font-bold tracking-wider px-1">
              Extensibility Architecture (§04)
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                { label: 'Skills', id: '04-extensibility-architecture' },
                { label: 'Plugins', id: '04-extensibility-architecture' },
                { label: 'Rules', id: '04-extensibility-architecture' },
                { label: 'Hooks', id: '04-extensibility-architecture' },
                { label: 'MCP', id: '04-extensibility-architecture' },
                { label: 'Agents', id: '04-extensibility-architecture' },
              ].map(t => (
                <button
                  key={t.label}
                  onClick={() => onSelect(t.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                    selectedId === '04-extensibility-architecture'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800/80 hover:bg-stone-850'
                  }`}
                >
                  ⚡ {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subcategory filters */}
        {activeTab === 'sources' && (
          <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono py-1">
            {['all', 'docs', 'google', 'protocol', 'community'].map(cat => (
              <button
                key={cat}
                onClick={() => setSourceCategoryFilter(cat)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors capitalize whitespace-nowrap ${
                  sourceCategoryFilter === cat
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold'
                    : 'text-stone-400 hover:text-stone-200 bg-stone-900 border border-stone-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono py-1">
            {['all', 'RESOLVED', 'VERIFIED', 'INVESTIGATING'].map(st => (
              <button
                key={st}
                onClick={() => setEvidenceStatusFilter(st)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors text-[10px] whitespace-nowrap ${
                  evidenceStatusFilter === st
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold'
                    : 'text-stone-400 hover:text-stone-200 bg-stone-900 border border-stone-800/60'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Tab 1: Reference Modules */}
        {activeTab === 'reference' && (
          <div className="space-y-0.5">
            {modules
              .filter(m => !q || m.title.toLowerCase().includes(q) || m.id.toLowerCase().includes(q))
              .map(m => {
                const isSelected = selectedId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => onSelect(m.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/70 border border-cyan-800/60 text-cyan-200 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900 border border-transparent'
                    }`}
                  >
                    <span className={`font-mono text-[11px] font-semibold shrink-0 mt-0.5 ${isSelected ? 'text-cyan-400' : 'text-stone-500'}`}>
                      §{m.number.toString().padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="truncate font-medium">{m.title}</div>
                        {m.number === 4 && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 uppercase font-bold shrink-0">
                            Core
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-500 truncate font-mono mt-0.5">
                        {m.number === 4 ? 'Skills · Plugins · Rules · Hooks · MCP' : m.id}
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        )}

        {/* Tab 2: JSON Schemas */}
        {activeTab === 'schemas' && (
          <div className="space-y-0.5">
            {schemas
              .filter(s => !q || s.title.toLowerCase().includes(q) || s.filename.toLowerCase().includes(q))
              .map(s => {
                const isSelected = selectedId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => onSelect(s.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/70 border border-cyan-800/60 text-cyan-200 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900 border border-transparent'
                    }`}
                  >
                    <Boxes className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isSelected ? 'text-cyan-400' : 'text-stone-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{s.title}</div>
                      <div className="text-[10px] text-stone-500 truncate font-mono flex items-center gap-1.5 mt-0.5">
                        <span>{s.filename}</span>
                        <span>•</span>
                        <span>{s.propertiesCount} props</span>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        )}

        {/* Tab 3: Evidence Probes */}
        {activeTab === 'evidence' && (
          <div className="space-y-0.5">
            {evidence
              .filter(e => {
                const matchesText = !q || e.id.toLowerCase().includes(q) || e.title.toLowerCase().includes(q);
                const matchesStatus = evidenceStatusFilter === 'all' || e.status === evidenceStatusFilter;
                return matchesText && matchesStatus;
              })
              .map(e => {
                const isSelected = selectedId === e.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => onSelect(e.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/70 border border-cyan-800/60 text-cyan-200 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900 border border-transparent'
                    }`}
                  >
                    <span className={`font-mono text-[10px] font-bold shrink-0 mt-0.5 ${isSelected ? 'text-cyan-400' : 'text-stone-500'}`}>
                      {e.id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{e.title}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold ${
                            e.status === 'RESOLVED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                              : e.status === 'VERIFIED'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                              : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          }`}
                        >
                          {e.status}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        )}

        {/* Tab 4: Sources */}
        {activeTab === 'sources' && (
          <div className="space-y-0.5">
            {sources
              .filter(s => {
                const matchesText = !q || s.title.toLowerCase().includes(q) || s.filename.toLowerCase().includes(q);
                const matchesCat = sourceCategoryFilter === 'all' || s.category === sourceCategoryFilter;
                return matchesText && matchesCat;
              })
              .map(s => {
                const isSelected = selectedId === s.id;
                const refCount = s.referenceLocations?.length || 0;
                return (
                  <button
                    key={s.id}
                    onClick={() => onSelect(s.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/70 border border-cyan-800/60 text-cyan-200 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900 border border-transparent'
                    }`}
                  >
                    <span className={`font-mono text-[10px] font-bold shrink-0 mt-0.5 ${isSelected ? 'text-cyan-400' : 'text-stone-500'}`}>
                      #{s.number.toString().padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{s.title}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-stone-500 font-mono uppercase">{s.category}</span>
                        {refCount > 0 && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-stone-850 text-stone-400 border border-stone-800">
                            {refCount} {refCount === 1 ? 'ref' : 'refs'}
                          </span>
                        )}
                        {s.isDuplicateGroup && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-950/60 text-amber-400 border border-amber-800/50">
                            merged
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        )}

        {/* Tab 5: ADRs */}
        {activeTab === 'adrs' && (
          <div className="space-y-0.5">
            {adrs
              .filter(a => !q || a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q))
              .map(a => {
                const isSelected = selectedId === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => onSelect(a.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/70 border border-cyan-800/60 text-cyan-200 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900 border border-transparent'
                    }`}
                  >
                    <FileText className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isSelected ? 'text-cyan-400' : 'text-stone-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{a.title}</div>
                      <div className="text-[10px] text-stone-500 font-mono mt-0.5">ADR-{a.number.toString().padStart(4, '0')} • {a.status}</div>
                    </div>
                  </button>
                );
              })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-stone-800/80 bg-stone-900/40 text-[11px] text-stone-500 font-mono flex items-center justify-between">
        <span>Grounded Reference</span>
        <span className="text-cyan-400">agy-1.1.12</span>
      </div>
    </aside>
  );
};
