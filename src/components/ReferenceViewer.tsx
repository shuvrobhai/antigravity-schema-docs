import React, { useState } from 'react';
import { ReferenceModule } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ChevronLeft, ChevronRight, Copy, Check, Hash, FileText, Share2, Compass, Sparkles, Box, Shield, Terminal, Cpu, Layers, Zap } from 'lucide-react';

interface ReferenceViewerProps {
  module: ReferenceModule;
  allModules: ReferenceModule[];
  onSelectModule: (id: string) => void;
  onOpenExtensibilityStudio?: () => void;
}

export const ReferenceViewer: React.FC<ReferenceViewerProps> = ({
  module,
  allModules,
  onSelectModule,
  onOpenExtensibilityStudio,
}) => {
  const [copied, setCopied] = useState(false);
  const [showToc, setShowToc] = useState(true);

  const currentIndex = allModules.findIndex(m => m.id === module.id);
  const prevModule = currentIndex > 0 ? allModules[currentIndex - 1] : null;
  const nextModule = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;

  const wordCount = module.rawContent.split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(module.rawContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScrollToHeading = (id: string) => {
    const headings = document.querySelectorAll('h1, h2, h3, h4');
    const normalizedTarget = id.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const h of Array.from(headings)) {
      const headingText = (h.textContent || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (headingText.includes(normalizedTarget) || normalizedTarget.includes(headingText)) {
        h.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
  };

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto px-6 lg:px-12 py-8 space-y-8 max-w-4xl mx-auto">
        {/* Module Header */}
        <div className="border-b border-stone-800 pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono font-bold">
                Section §{module.number.toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-stone-500 font-mono">{module.id}</span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenExtensibilityStudio && module.number === 4 && (
                <button
                  onClick={onOpenExtensibilityStudio}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs transition-colors cursor-pointer font-medium shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Extensibility Studio</span>
                </button>
              )}

              <button
                onClick={() => setShowToc(!showToc)}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-400 hover:text-stone-200 text-xs transition-colors cursor-pointer"
                title="Toggle Table of Contents"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showToc ? 'Hide Outline' : 'Show Outline'}</span>
              </button>

              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 text-xs transition-colors cursor-pointer"
                title="Copy Raw Markdown"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy MD'}</span>
              </button>
            </div>
          </div>

          {/* Chapter 4 Extensibility Quick Navigation Bar */}
          {module.number === 4 && (
            <div className="p-4 rounded-xl border border-cyan-800/40 bg-gradient-to-br from-cyan-950/40 to-stone-900/60 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-300 font-mono flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Quick Jump: 7 Extensibility Mechanisms</span>
                </span>
                <span className="text-stone-500 font-mono text-[11px]">Most Searched Reference Chapter</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                {[
                  { label: '4.1 Progressive Engine', target: '4.1 progressive disclosure' },
                  { label: '4.2 Skills System', target: '4.2 skills system' },
                  { label: '4.3 Custom Agents', target: '4.3 custom agents' },
                  { label: '4.4 Plugins', target: '4.4 plugins' },
                  { label: '4.5 MCP Protocol', target: '4.5 model context protocol' },
                  { label: '4.6 Rules & Globs', target: '4.6 rules' },
                  { label: '4.7 Workflows', target: '4.7 workflows' },
                  { label: '4.8 Lifecycle Hooks', target: '4.8 lifecycle hooks' },
                ].map(pill => (
                  <button
                    key={pill.target}
                    onClick={() => handleScrollToHeading(pill.target)}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-900/90 hover:bg-cyan-950 border border-stone-750 hover:border-cyan-800/60 text-stone-300 hover:text-cyan-200 text-left truncate transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="text-cyan-400">›</span>
                    <span className="truncate">{pill.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-stone-400 font-mono">
            <span>{wordCount.toLocaleString()} words</span>
            <span>•</span>
            <span>~{readTimeMinutes} min read</span>
            <span>•</span>
            <span>{module.headings.length} subheadings</span>
          </div>
        </div>

        {/* Rendered Markdown Body */}
        <div className="pb-16">
          <MarkdownRenderer content={module.rawContent} />
        </div>

        {/* Previous / Next Chapter Navigation */}
        <div className="border-t border-stone-800/80 pt-6 pb-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevModule ? (
            <button
              onClick={() => onSelectModule(prevModule.id)}
              className="p-4 rounded-xl bg-stone-900/50 hover:bg-stone-900 border border-stone-800/80 hover:border-stone-700 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono mb-1">
                <ChevronLeft className="w-3.5 h-3.5 text-stone-400 group-hover:text-cyan-400 group-hover:-translate-x-0.5 transition-all" />
                <span>Previous Section</span>
              </div>
              <div className="text-sm font-semibold text-stone-200 group-hover:text-white truncate">
                §{prevModule.number.toString().padStart(2, '0')} {prevModule.title}
              </div>
            </button>
          ) : (
            <div />
          )}

          {nextModule ? (
            <button
              onClick={() => onSelectModule(nextModule.id)}
              className="p-4 rounded-xl bg-stone-900/50 hover:bg-stone-900 border border-stone-800/80 hover:border-stone-700 text-right transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-end gap-1.5 text-xs text-stone-500 font-mono mb-1">
                <span>Next Section</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="text-sm font-semibold text-stone-200 group-hover:text-white truncate">
                §{nextModule.number.toString().padStart(2, '0')} {nextModule.title}
              </div>
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* On This Page / Table of Contents Right Drawer */}
      {showToc && module.headings.length > 0 && (
        <aside className="hidden xl:block w-72 h-full border-l border-stone-800/80 bg-stone-950 p-6 overflow-y-auto shrink-0">
          <div className="space-y-4 sticky top-0">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
              <Hash className="w-3.5 h-3.5 text-cyan-400" />
              <span>On This Page</span>
            </div>

            <nav className="space-y-1.5 text-xs">
              {module.headings.map((h, i) => (
                <button
                  key={i}
                  onClick={() => handleScrollToHeading(h.id)}
                  style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
                  className="w-full text-left text-stone-400 hover:text-cyan-300 py-1 transition-colors truncate block cursor-pointer"
                >
                  {h.title}
                </button>
              ))}
            </nav>

            <div className="border-t border-stone-800/80 pt-4 mt-6">
              <div className="text-[11px] text-stone-500 font-mono">Source Precedence:</div>
              <div className="grid grid-cols-2 gap-1.5 mt-2 text-[10px] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">[DOCS] 1st</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50">[LIVE] 2nd</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/50">[GOOGLE] 3rd</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">[PROTOCOL] 4th</span>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};
