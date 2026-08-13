import React from 'react';
import { AdrRecord } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { FileText, Calendar, Tag } from 'lucide-react';

interface AdrViewerProps {
  adr: AdrRecord;
}

export const AdrViewer: React.FC<AdrViewerProps> = ({ adr }) => {
  return (
    <div className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto px-6 lg:px-12 py-8 space-y-6 max-w-5xl mx-auto">
      {/* ADR Header */}
      <div className="border-b border-stone-800 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-stone-800 text-stone-200 border border-stone-700 text-xs font-mono font-bold">
            ADR-{adr.number.toString().padStart(4, '0')}
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-xs font-mono font-medium">
            {adr.status}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">{adr.title}</h2>

        <div className="flex items-center gap-4 text-xs font-mono text-stone-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span>Date: {adr.date}</span>
          </span>
          <span>•</span>
          <span>Architecture Decision Record</span>
        </div>
      </div>

      {/* Body */}
      <div className="border border-stone-800 rounded-xl p-6 bg-stone-900/30">
        <MarkdownRenderer content={adr.rawContent} />
      </div>
    </div>
  );
};
