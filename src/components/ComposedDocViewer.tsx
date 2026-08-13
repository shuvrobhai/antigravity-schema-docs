import React, { useState } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Copy, Check, Download, FileCode, Layers } from 'lucide-react';

interface ComposedDocViewerProps {
  content: string;
}

export const ComposedDocViewer: React.FC<ComposedDocViewerProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const linesCount = content.split('\n').length;
  const wordCount = content.split(/\s+/).length;
  const sizeKb = (content.length / 1024).toFixed(1);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'antigravity-reference.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto px-6 lg:px-12 py-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-stone-800 pb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono font-bold">
              Build Artifact
            </span>
            <span className="text-xs text-stone-500 font-mono">antigravity-reference.md</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 text-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Monolith'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-stone-400" />
              <span>Download (.md)</span>
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">Composed Parent Document</h2>
        <p className="text-sm text-stone-400 leading-relaxed">
          The unified monolithic parent document compiled directly from the 21 source modules in <code className="text-cyan-400">reference/</code> via the composition engine (<code className="text-stone-300">scripts/build.ts</code>).
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-stone-400 pt-1">
          <span>{linesCount.toLocaleString()} total lines</span>
          <span>•</span>
          <span>{wordCount.toLocaleString()} words</span>
          <span>•</span>
          <span>{sizeKb} KB bundle</span>
          <span>•</span>
          <span>Automated build target: `make build`</span>
        </div>
      </div>

      {/* Rendered content */}
      <div className="border border-stone-800 rounded-xl p-6 bg-stone-900/30">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
};
