import React, { useState, useMemo } from 'react';
import { SourceCitation, TabType, SourceReferenceLocation, MergedSourceItem } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { normalizeCanonicalUrl } from '../lib/evidenceRegistry';
import { extractFrontmatterBlock } from '../lib/markdownCore';
import { CitationTooltip, LocationBadgeTooltip } from './CitationTooltip';
import {
  ExternalLink,
  Calendar,
  Globe,
  Layers,
  MapPin,
  FileCode2,
  Copy,
  Check,
  Shield,
  Search,
  Filter,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Hash,
  Link as LinkIcon,
  Info,
  Tag,
} from 'lucide-react';

interface SourceArchiveViewerProps {
  source: SourceCitation;
  allSources: SourceCitation[];
  onNavigate?: (tab: TabType, id: string) => void;
}

/**
 * Normalizes title for secondary duplicate matching when URLs are not present or ambiguous
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Combines and deduplicates reference locations from multiple source entries
 */
function mergeReferenceLocations(locationsList: SourceReferenceLocation[][]): SourceReferenceLocation[] {
  const merged: SourceReferenceLocation[] = [];
  const seenKeys = new Set<string>();

  for (const list of locationsList) {
    if (!list) continue;
    for (const loc of list) {
      const key = `${loc.targetType}:${loc.targetId}:${loc.lineNumber}:${loc.matchType}:${loc.matchedText}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        merged.push(loc);
      }
    }
  }

  // Sort locations by module number/title then line number
  return merged.sort((a, b) => {
    if (a.targetType !== b.targetType) {
      return a.targetType.localeCompare(b.targetType);
    }
    if (a.targetId !== b.targetId) {
      return a.targetId.localeCompare(b.targetId);
    }
    return a.lineNumber - b.lineNumber;
  });
}

export const SourceArchiveViewer: React.FC<SourceArchiveViewerProps> = ({
  source,
  allSources,
  onNavigate,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [selectedSnapshotIndex, setSelectedSnapshotIndex] = useState(0);
  const [locationFilter, setLocationFilter] = useState<'all' | 'reference' | 'evidence' | 'adr'>('all');
  const [activeViewMode, setActiveViewMode] = useState<'snapshot' | 'references' | 'metadata'>('snapshot');

  // 1. Group allSources to detect duplicate entries and produce canonical representative records
  const { groupedSources, representativeSource, duplicateGroupCount } = useMemo(() => {
    const groupsMap = new Map<string, SourceCitation[]>();

    // Index all sources by normalized canonical key
    for (const s of allSources) {
      const normUrl = normalizeCanonicalUrl(s.finalUrl || s.url || s.canonicalUrl || '');
      const groupKey = normUrl || `${s.category}:${normalizeTitle(s.title)}`;

      const group = groupsMap.get(groupKey) ?? [];
      group.push(s);
      groupsMap.set(groupKey, group);
    }

    let dupCount = 0;
    const unifiedList: SourceCitation[] = [];

    for (const [key, items] of groupsMap.entries()) {
      if (items.length > 1) {
        dupCount++;
      }

      // Sort items by citation number ascending
      items.sort((a, b) => a.number - b.number);
      const primary = items[0];

      // Aggregate all citation numbers
      const allNumbers = Array.from(
        new Set(items.flatMap(i => (i.citationNumbers?.length ? i.citationNumbers : [i.number])))
      ).sort((a, b) => a - b);

      // Aggregate all filenames
      const allFilenames = Array.from(
        new Set(items.flatMap(i => (i.filenames?.length ? i.filenames : [i.filename])))
      );

      // Aggregate merged snapshot items
      const mergedSources: MergedSourceItem[] = [];
      const seenFilenames = new Set<string>();

      for (const item of items) {
        if (item.mergedSources && item.mergedSources.length > 0) {
          for (const ms of item.mergedSources) {
            if (!seenFilenames.has(ms.filename)) {
              seenFilenames.add(ms.filename);
              mergedSources.push(ms);
            }
          }
        } else {
          if (!seenFilenames.has(item.filename)) {
            seenFilenames.add(item.filename);
            mergedSources.push({
              number: item.number,
              filename: item.filename,
              category: item.category,
              title: item.title,
              url: item.url,
              finalUrl: item.finalUrl,
              rawContent: item.rawContent,
              fetched: item.archivedDate,
              status: item.status,
              license: item.license,
            });
          }
        }
      }

      // Combine and deduplicate reference locations across all duplicate entries in this group
      const combinedReferenceLocations = mergeReferenceLocations(
        items.map(i => i.referenceLocations || [])
      );

      const representative: SourceCitation = {
        ...primary,
        citationNumbers: allNumbers,
        filenames: allFilenames,
        canonicalUrl: key,
        isDuplicateGroup: items.length > 1 || primary.isDuplicateGroup,
        duplicateCount: Math.max(items.length, primary.duplicateCount || 1),
        mergedSources: mergedSources.length > 0 ? mergedSources : primary.mergedSources,
        referenceLocations: combinedReferenceLocations,
      };

      unifiedList.push(representative);
    }

    // Determine the representative record for the actively selected source
    const targetKey =
      normalizeCanonicalUrl(source.finalUrl || source.url || source.canonicalUrl || '') ||
      `${source.category}:${normalizeTitle(source.title)}`;

    const currentRep =
      unifiedList.find(u => {
        if (u.canonicalUrl && targetKey && u.canonicalUrl === targetKey) return true;
        if (u.id === source.id || u.filename === source.filename) return true;
        if (u.citationNumbers?.includes(source.number)) return true;
        return false;
      }) || source;

    return {
      groupedSources: unifiedList,
      representativeSource: currentRep,
      duplicateGroupCount: dupCount,
    };
  }, [allSources, source]);

  // Use the single representative record for rendering
  const activeRecord = representativeSource;

  const mergedList = activeRecord.mergedSources || [
    {
      number: activeRecord.number,
      filename: activeRecord.filename,
      category: activeRecord.category,
      title: activeRecord.title,
      url: activeRecord.url,
      finalUrl: activeRecord.finalUrl,
      rawContent: activeRecord.rawContent,
      fetched: activeRecord.archivedDate,
      status: activeRecord.status,
      license: activeRecord.license,
    },
  ];

  const currentSnapshot = mergedList[selectedSnapshotIndex] || mergedList[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const filteredLocations = activeRecord.referenceLocations.filter(loc => {
    if (locationFilter === 'all') return true;
    return loc.targetType === locationFilter;
  });

  const totalRepoReferences = activeRecord.referenceLocations.length;
  const totalCombinedReferencesAcrossRepo = groupedSources.reduce(
    (acc, s) => acc + s.referenceLocations.length,
    0
  );

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto px-6 lg:px-12 py-8 space-y-6 max-w-5xl mx-auto">
      {/* Global Repository Sourcing & Deduplication Status Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 flex flex-col justify-between">
          <div className="text-[11px] font-mono text-stone-500 uppercase">Representative Sources</div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{groupedSources.length}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Deduplicated single records</div>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 flex flex-col justify-between">
          <div className="text-[11px] font-mono text-stone-500 uppercase">Combined Citations</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {totalCombinedReferencesAcrossRepo}
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">Across modules & evidence</div>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 flex flex-col justify-between">
          <div className="text-[11px] font-mono text-stone-500 uppercase">Duplicate Groups</div>
          <div className="text-xl font-bold font-mono text-stone-300 mt-1">
            {duplicateGroupCount}
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">Detected & grouped</div>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 flex flex-col justify-between">
          <div className="text-[11px] font-mono text-stone-500 uppercase">This Record References</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{totalRepoReferences}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Combined reference locations</div>
        </div>
      </div>

      {/* Main Canonical Representative Record Header */}
      <div className="border border-stone-800 rounded-2xl p-6 bg-stone-900/40 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Citation Badges with Interactive Tooltips */}
            <CitationTooltip source={activeRecord} activeSnapshot={currentSnapshot}>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800/90 hover:bg-stone-750 border border-stone-700 text-stone-200 text-xs font-mono font-bold transition-all cursor-help shadow-sm">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  Citation #{activeRecord.number.toString().padStart(2, '0')}
                  {activeRecord.citationNumbers.length > 1 && (
                    <span className="text-stone-400 font-normal ml-1">
                      (+{activeRecord.citationNumbers.slice(1).map(n => `#${n.toString().padStart(2, '0')}`).join(', ')})
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-cyan-400/80 ml-0.5 opacity-70 group-hover:opacity-100">ⓘ</span>
              </div>
            </CitationTooltip>

            <CitationTooltip source={activeRecord} activeSnapshot={currentSnapshot}>
              <span
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wide border cursor-help transition-all shadow-sm ${
                  activeRecord.category === 'docs'
                    ? 'bg-cyan-950/80 border-cyan-800/70 text-cyan-300 hover:bg-cyan-900/90'
                    : activeRecord.category === 'google'
                    ? 'bg-blue-950/80 border-blue-800/70 text-blue-300 hover:bg-blue-900/90'
                    : activeRecord.category === 'protocol'
                    ? 'bg-purple-950/80 border-purple-800/70 text-purple-300 hover:bg-purple-900/90'
                    : 'bg-emerald-950/80 border-emerald-800/70 text-emerald-300 hover:bg-emerald-900/90'
                }`}
              >
                [{activeRecord.category}]
              </span>
            </CitationTooltip>

            {activeRecord.isDuplicateGroup && (
              <CitationTooltip source={activeRecord} activeSnapshot={currentSnapshot}>
                <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/70 border border-amber-800/60 text-amber-300 text-xs font-mono cursor-help transition-all shadow-sm">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Single Representative Record ({activeRecord.duplicateCount} duplicates grouped)</span>
                </span>
              </CitationTooltip>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(activeRecord.finalUrl || activeRecord.url)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs transition-colors cursor-pointer"
              title="Copy URL"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
            </button>

            <a
              href={activeRecord.finalUrl || activeRecord.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 text-xs font-medium transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Original Source</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{activeRecord.title}</h1>
          <p className="text-xs font-mono text-cyan-400/90 mt-1 break-all flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 shrink-0 text-stone-500" />
            <span>{activeRecord.finalUrl || activeRecord.url}</span>
          </p>
        </div>

        {/* Metadata Strip */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-2 border-t border-stone-800/80 text-xs font-mono text-stone-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span>Archived: {activeRecord.archivedDate || '2026-08-13'}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-stone-500" />
            <span>License: {activeRecord.license || 'CC-BY-4.0'}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>HTTP Status: {activeRecord.status || '200 OK'}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5 text-stone-400">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {activeRecord.referenceLocations.length}{' '}
              {activeRecord.referenceLocations.length === 1 ? 'Combined Location' : 'Combined Locations'}
            </span>
          </div>
        </div>
      </div>

      {/* Merged Duplicate Selection Switcher (If multiple citations merged into this canonical entry) */}
      {mergedList.length > 1 && (
        <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-semibold">
              <Layers className="w-4 h-4" />
              <span>Identical Source Citations Grouped ({mergedList.length} files)</span>
            </div>
            <span className="text-[11px] font-mono text-stone-500">
              Hover citation badges for metadata preview
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {mergedList.map((m, idx) => {
              // Create a temporary citation proxy for each merged item to feed into the tooltip
              const itemProxy: SourceCitation = {
                ...activeRecord,
                number: m.number,
                title: m.title,
                url: m.url,
                finalUrl: m.finalUrl,
                category: m.category,
                filename: m.filename,
                archivedDate: m.fetched,
                status: m.status,
                license: m.license,
                citationNumbers: [m.number],
                filenames: [m.filename],
              };

              return (
                <CitationTooltip key={m.filename} source={itemProxy} activeSnapshot={m}>
                  <button
                    onClick={() => setSelectedSnapshotIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                      selectedSnapshotIndex === idx
                        ? 'bg-cyan-950 text-cyan-200 border border-cyan-700/80 font-bold shadow'
                        : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>Citation #{m.number.toString().padStart(2, '0')}</span>
                    <span className="text-stone-500 text-[10px]">({m.filename})</span>
                  </button>
                </CitationTooltip>
              );
            })}
          </div>
        </div>
      )}

      {/* View Tabs: Snapshot Markdown vs Combined Reference Locations vs Frontmatter Inspector */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveViewMode('snapshot')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-2 cursor-pointer ${
              activeViewMode === 'snapshot'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/70 font-semibold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Archived Snapshot Content</span>
          </button>

          <button
            onClick={() => setActiveViewMode('references')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-2 cursor-pointer ${
              activeViewMode === 'references'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/70 font-semibold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Combined Reference Locations</span>
            <span className="px-1.5 py-0.2 rounded-full bg-stone-800 text-[10px] text-stone-300">
              {activeRecord.referenceLocations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveViewMode('metadata')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-2 cursor-pointer ${
              activeViewMode === 'metadata'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/70 font-semibold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Provenance & Frontmatter</span>
          </button>
        </div>

        <div className="text-xs font-mono text-stone-500">
          Snapshot: <span className="text-stone-400">{currentSnapshot.filename}</span>
        </div>
      </div>

      {/* Tab 1: Snapshot Markdown Viewer */}
      {activeViewMode === 'snapshot' && (
        <div className="space-y-4">
          <div className="border border-stone-800 rounded-2xl p-6 bg-stone-900/30">
            <MarkdownRenderer content={currentSnapshot.rawContent} />
          </div>
        </div>
      )}

      {/* Tab 2: Combined Reference Locations Explorer */}
      {activeViewMode === 'references' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-stone-900/50 border border-stone-800">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-white">
                Combined Citing Locations across the Repository
              </div>
              <div className="text-xs text-stone-400">
                All modules, empirical evidence probes, and architecture records citing this representative record (
                {activeRecord.citationNumbers.map(n => `#${n.toString().padStart(2, '0')}`).join(', ')}
                ).
              </div>
            </div>

            {/* Filter by target type */}
            <div className="flex items-center gap-1 text-xs font-mono">
              {(['all', 'reference', 'evidence', 'adr'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setLocationFilter(f)}
                  className={`px-2.5 py-1 rounded-lg capitalize cursor-pointer transition-colors ${
                    locationFilter === f
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold'
                      : 'text-stone-400 hover:text-stone-200 bg-stone-900'
                  }`}
                >
                  {f === 'reference' ? 'Modules' : f === 'evidence' ? 'Evidence' : f === 'adr' ? 'ADRs' : 'All'}
                </button>
              ))}
            </div>
          </div>

          {filteredLocations.length === 0 ? (
            <div className="p-8 border border-stone-800/80 rounded-2xl bg-stone-900/20 text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-stone-500 mx-auto" />
              <div className="text-sm text-stone-300">No active inline citations found in this category</div>
              <div className="text-xs text-stone-500">
                This source is archived in the Works Cited registry (§19) and available for ground-truth reference.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLocations.map((loc, idx) => (
                <div
                  key={`${loc.targetId}-${loc.lineNumber}-${idx}`}
                  className="p-4 rounded-xl border border-stone-800/90 bg-stone-900/40 hover:border-cyan-800/50 hover:bg-stone-900/70 transition-all space-y-2.5 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-300 text-[11px] font-mono font-bold">
                        {loc.targetType.toUpperCase()}
                      </span>
                      <span className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {loc.targetTitle}
                      </span>
                      {loc.sectionTitle && (
                        <span className="text-xs text-stone-400 truncate max-w-xs font-mono">
                          › {loc.sectionTitle}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <LocationBadgeTooltip location={loc}>
                        <span className="px-2 py-0.5 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800/50 text-cyan-300 text-[10px] font-mono cursor-help transition-colors">
                          {loc.matchType === 'badge'
                            ? loc.matchedText
                            : loc.matchType === 'text_mention'
                            ? 'Mention'
                            : loc.matchType === 'works_cited'
                            ? 'Works Cited'
                            : 'Link'}
                        </span>
                      </LocationBadgeTooltip>

                      <span className="text-xs font-mono text-stone-500">Line {loc.lineNumber}</span>

                      {onNavigate && (
                        <button
                          onClick={() => onNavigate(loc.deepLink.tab, loc.deepLink.selectedId)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-cyan-950 hover:text-cyan-300 border border-stone-700 hover:border-cyan-700 text-stone-300 text-xs font-mono transition-colors cursor-pointer"
                        >
                          <span>Jump</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Context excerpt box */}
                  <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-850 font-mono text-xs text-stone-300 space-y-1 overflow-x-auto">
                    <div className="text-stone-400 whitespace-pre-wrap">{loc.lineText}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Provenance & Frontmatter Inspector */}
      {activeViewMode === 'metadata' && (
        <div className="border border-stone-800 rounded-2xl p-6 bg-stone-900/30 space-y-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
            OKF Open Data Resource Descriptor
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="text-stone-500 uppercase text-[10px]">Canonical URL</div>
              <div className="text-cyan-300 break-all">{activeRecord.finalUrl || activeRecord.url}</div>

              <div className="text-stone-500 uppercase text-[10px] pt-2">Normalized Matching Key</div>
              <div className="text-stone-300 break-all">{activeRecord.canonicalUrl}</div>

              <div className="text-stone-500 uppercase text-[10px] pt-2">Category Authority</div>
              <div className="text-emerald-300 uppercase">{activeRecord.category}</div>
            </div>

            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="text-stone-500 uppercase text-[10px]">Archived Snapshot File</div>
              <div className="text-stone-300">{currentSnapshot.filename}</div>

              <div className="text-stone-500 uppercase text-[10px] pt-2">Merged Snapshots in Group</div>
              <div className="text-stone-300">{activeRecord.filenames.join(', ')}</div>

              <div className="text-stone-500 uppercase text-[10px] pt-2">Open License</div>
              <div className="text-purple-300">{activeRecord.license || 'CC-BY-4.0'}</div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="text-stone-400 text-xs font-semibold font-sans">Raw Frontmatter Header</div>
            <pre className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 overflow-x-auto text-[11px] leading-relaxed">
              {extractFrontmatterBlock(currentSnapshot.rawContent) ||
                '---\nsource: ' +
                  activeRecord.number +
                  '\ncategory: ' +
                  activeRecord.category +
                  '\ntitle: "' +
                  activeRecord.title +
                  '"\nurl: "' +
                  activeRecord.url +
                  '"\n---'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

