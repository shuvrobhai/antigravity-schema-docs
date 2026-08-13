import React, { useState, useRef, useEffect } from 'react';
import {
  ExternalLink,
  Globe,
  Calendar,
  Layers,
  MapPin,
  Shield,
  CheckCircle2,
  FileCode2,
  Copy,
  Check,
  Hash,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { SourceCitation, MergedSourceItem } from '../types';

export interface CitationTooltipProps {
  children: React.ReactNode;
  source: SourceCitation;
  activeSnapshot?: MergedSourceItem;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  className?: string;
}

const CATEGORY_AUTHORITY_INFO: Record<
  string,
  { rank: string; label: string; desc: string; color: string; badgeCls: string }
> = {
  docs: {
    rank: 'Rank 1 (Highest)',
    label: 'Official Documentation',
    desc: 'First-party technical reference & developer manuals',
    color: 'text-cyan-400',
    badgeCls: 'bg-cyan-950/80 border-cyan-800/80 text-cyan-300',
  },
  live: {
    rank: 'Rank 2',
    label: 'Live Empirical Test',
    desc: 'Empirical runtime observation probe logged in evidence.md',
    color: 'text-amber-400',
    badgeCls: 'bg-amber-950/80 border-amber-800/80 text-amber-300',
  },
  google: {
    rank: 'Rank 3',
    label: 'Google Corporate / Cloud',
    desc: 'Google blog posts, architecture whitepapers & official announcements',
    color: 'text-blue-400',
    badgeCls: 'bg-blue-950/80 border-blue-800/80 text-blue-300',
  },
  protocol: {
    rank: 'Rank 4',
    label: 'Protocol Specification',
    desc: 'Open standard protocol specs (LSP, MCP, SSE RFC)',
    color: 'text-purple-400',
    badgeCls: 'bg-purple-950/80 border-purple-800/80 text-purple-300',
  },
  community: {
    rank: 'Rank 5',
    label: 'Community / Third-Party',
    desc: 'Reverse engineering findings, articles & developer discussions',
    color: 'text-emerald-400',
    badgeCls: 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300',
  },
  inferred: {
    rank: 'Rank 6',
    label: 'Inferred Hypothesis',
    desc: 'Synthetic deduction pending live instrumentation',
    color: 'text-rose-400',
    badgeCls: 'bg-rose-950/80 border-rose-800/80 text-rose-300',
  },
};

export const CitationTooltip: React.FC<CitationTooltipProps> = ({
  children,
  source,
  activeSnapshot,
  placement = 'auto',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const catMeta =
    CATEGORY_AUTHORITY_INFO[source.category.toLowerCase()] ||
    CATEGORY_AUTHORITY_INFO.community;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(source.finalUrl || source.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Compute breakdown of reference locations
  const refBreakdown = {
    modules: source.referenceLocations.filter(l => l.targetType === 'reference').length,
    evidence: source.referenceLocations.filter(l => l.targetType === 'evidence').length,
    adrs: source.referenceLocations.filter(l => l.targetType === 'adr').length,
  };

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex items-center ${className}`}
    >
      {children}

      {isOpen && (
        <div
          ref={tooltipRef}
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          onMouseLeave={handleMouseLeave}
          className="absolute left-0 top-full mt-2 z-50 w-84 sm:w-96 rounded-xl bg-stone-925 border border-stone-750 shadow-2xl p-4 text-left font-sans text-stone-200 pointer-events-auto backdrop-blur-md transition-all duration-150 ease-out animate-in fade-in"
          style={{
            boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
          }}
        >
            {/* Header: Citation numbers and category */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-800">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-800 border border-stone-700 font-mono text-[11px] font-bold text-white">
                  <Hash className="w-3 h-3 text-cyan-400" />
                  Citation #{source.number.toString().padStart(2, '0')}
                </span>

                {source.citationNumbers && source.citationNumbers.length > 1 && (
                  <span className="px-1.5 py-0.5 rounded bg-stone-850 border border-stone-800 text-[10px] font-mono text-stone-400">
                    +{source.citationNumbers.slice(1).map(n => `#${n.toString().padStart(2, '0')}`).join(', ')}
                  </span>
                )}

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${catMeta.badgeCls}`}>
                  [{source.category}]
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyUrl}
                  className="p-1 rounded bg-stone-850 hover:bg-stone-750 text-stone-400 hover:text-white transition-colors cursor-pointer border border-stone-800"
                  title="Copy Citation URL"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>

                <a
                  href={source.finalUrl || source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded bg-stone-850 hover:bg-cyan-950 text-stone-400 hover:text-cyan-300 transition-colors border border-stone-800"
                  title="Open in new tab"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Title & URL preview */}
            <div className="pt-2.5 space-y-1">
              <div className="text-xs font-semibold text-white leading-snug line-clamp-2">
                {source.title}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400/90 truncate">
                <Globe className="w-3 h-3 shrink-0 text-stone-500" />
                <span className="truncate">{source.finalUrl || source.url}</span>
              </div>
            </div>

            {/* Precedence & Authority Explanation */}
            <div className="mt-2.5 p-2 rounded-lg bg-stone-900/90 border border-stone-800/80 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-stone-400 uppercase">Precedence:</span>
                <span className={`font-semibold ${catMeta.color}`}>{catMeta.rank}</span>
              </div>
              <div className="text-[11px] text-stone-300 leading-tight">
                <span className="font-semibold text-stone-200">{catMeta.label}</span> — {catMeta.desc}
              </div>
            </div>

            {/* Grounding & Repository References Info */}
            <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-lg bg-stone-900/60 border border-stone-800/70 space-y-0.5">
                <div className="text-[9px] text-stone-500 uppercase flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-amber-400" />
                  <span>Repo Citations</span>
                </div>
                <div className="text-xs font-bold text-white">
                  {source.referenceLocations.length} locations
                </div>
                <div className="text-[9px] text-stone-400">
                  {refBreakdown.modules} mod • {refBreakdown.evidence} ev • {refBreakdown.adrs} adr
                </div>
              </div>

              <div className="p-2 rounded-lg bg-stone-900/60 border border-stone-800/70 space-y-0.5">
                <div className="text-[9px] text-stone-500 uppercase flex items-center gap-1">
                  <FileCode2 className="w-2.5 h-2.5 text-cyan-400" />
                  <span>Snapshot Archive</span>
                </div>
                <div className="text-[10px] font-bold text-stone-200 truncate">
                  {activeSnapshot?.filename || source.filename}
                </div>
                <div className="text-[9px] text-stone-400">
                  {source.archivedDate || '2026-08-13'} • {source.status || '200 OK'}
                </div>
              </div>
            </div>

            {/* Grouped Duplicates Banner if applicable */}
            {source.isDuplicateGroup && (
              <div className="mt-2.5 p-2 rounded-lg bg-amber-950/40 border border-amber-800/40 flex items-start gap-1.5 text-[10px]">
                <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-stone-300">
                  <span className="font-semibold text-amber-300">
                    {source.duplicateCount} duplicate citations grouped
                  </span>
                  : Merged into this canonical representative record with unified cross-repository references.
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export interface LocationBadgeTooltipProps {
  children: React.ReactNode;
  location: import('../types').SourceReferenceLocation;
  className?: string;
}

export const LocationBadgeTooltip: React.FC<LocationBadgeTooltipProps> = ({
  children,
  location,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(true), 150);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  const matchTypeMap: Record<
    string,
    { title: string; desc: string; cls: string }
  > = {
    badge: {
      title: 'Inline Citation Badge',
      desc: 'Canonical tag embedded directly in reference narrative with authority level and citation ID.',
      cls: 'text-cyan-400 border-cyan-800/60 bg-cyan-950/80',
    },
    text_mention: {
      title: 'Contextual Text Mention',
      desc: 'Named reference or explicit mention in prose requiring grounding verification.',
      cls: 'text-amber-400 border-amber-800/60 bg-amber-950/80',
    },
    works_cited: {
      title: 'Section 19 Works Cited Catalog',
      desc: 'Official tabular registry citation entry with snapshot file mapping and metadata.',
      cls: 'text-emerald-400 border-emerald-800/60 bg-emerald-950/80',
    },
    file_link: {
      title: 'Snapshot File Link',
      desc: 'Relative file link pointing to archived source markdown document.',
      cls: 'text-purple-400 border-purple-800/60 bg-purple-950/80',
    },
    url: {
      title: 'Direct URL Reference',
      desc: 'Direct markdown hyperlink targeting canonical online documentation URL.',
      cls: 'text-blue-400 border-blue-800/60 bg-blue-950/80',
    },
  };

  const matchTypeInfo = matchTypeMap[location.matchType] || {
    title: 'Citation Reference',
    desc: 'Documented link reference in repository documentation.',
    cls: 'text-cyan-400 border-cyan-800/60 bg-cyan-950/80',
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex items-center ${className}`}
    >
      {children}

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl bg-stone-925 border border-stone-750 shadow-2xl p-3 text-left font-sans text-stone-200 pointer-events-auto backdrop-blur-md transition-all duration-150 ease-out"
          style={{
            boxShadow: '0 16px 28px -8px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
          }}
        >
            <div className="flex items-center justify-between gap-1 pb-2 border-b border-stone-800">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${matchTypeInfo.cls}`}>
                {location.matchType.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-mono text-stone-400">Line {location.lineNumber}</span>
            </div>

            <div className="pt-2 space-y-1">
              <div className="text-xs font-semibold text-white">
                {matchTypeInfo.title}
              </div>
              <div className="text-[11px] text-stone-400 leading-tight">
                {matchTypeInfo.desc}
              </div>
            </div>

            <div className="mt-2 p-1.5 rounded-lg bg-stone-950/80 border border-stone-850 text-[10px] font-mono text-stone-300">
              <span className="text-stone-500">Target: </span>
              <span className="text-cyan-300">{location.targetTitle}</span>
              {location.sectionTitle && (
                <span className="text-stone-400 block truncate mt-0.5">
                  § {location.sectionTitle}
                </span>
              )}
            </div>
        </div>
      )}
    </div>
  );
};
