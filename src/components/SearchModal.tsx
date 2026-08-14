import React, { useState, useEffect, useRef } from 'react';
import { SearchResultItem, TabType } from '../types';
import { performSearch } from '../data/search';
import { Search, BookOpen, Boxes, ShieldCheck, Database, FileText, X, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: TabType, selectedId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const res = performSearch(query);
    setResults(res);
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter') {
        if (results[selectedIndex]) {
          const item = results[selectedIndex];
          onNavigate(item.urlParams.tab, item.urlParams.selectedId);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onNavigate, onClose]);

  if (!isOpen) return null;

  const getIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'reference':
        return BookOpen;
      case 'schema':
        return Boxes;
      case 'evidence':
        return ShieldCheck;
      case 'source':
        return Database;
      case 'adr':
        return FileText;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div
        className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input header */}
        <div className="p-4 border-b border-stone-800 flex items-center gap-3 bg-stone-950">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search all 21 chapters, 19 schemas, 20 evidence logs, 59 sources..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-stone-500 focus:outline-none font-mono"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-stone-500 hover:text-stone-300">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 rounded bg-stone-800 text-[10px] font-mono text-stone-400 border border-stone-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-stone-500 text-xs space-y-2">
              <p>Type keywords to search documentation, CLI parameters, JSON properties, and live evidence logs.</p>
              <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-stone-400">
                <span>Try:</span>
                <button onClick={() => setQuery('commandExecutionPolicy')} className="text-cyan-400 hover:underline">
                  commandExecutionPolicy
                </button>
                <span>•</span>
                <button onClick={() => setQuery('EV-001')} className="text-cyan-400 hover:underline">
                  EV-001
                </button>
                <span>•</span>
                <button onClick={() => setQuery('sandbox')} className="text-cyan-400 hover:underline">
                  sandbox
                </button>
                <span>•</span>
                <button onClick={() => setQuery('hooks')} className="text-cyan-400 hover:underline">
                  hooks
                </button>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-xs">
              No results found for "<span className="text-stone-300 font-mono">{query}</span>"
            </div>
          ) : (
            results.map((item, index) => {
              const Icon = getIcon(item.type);
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={`${item.type}-${item.id}-${index}`}
                  onClick={() => {
                    onNavigate(item.urlParams.tab, item.urlParams.selectedId);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/70 border border-cyan-800/60 text-white shadow-sm'
                      : 'text-stone-400 hover:bg-stone-850 border border-transparent'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isSelected ? 'bg-cyan-900/50 text-cyan-300' : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-stone-200 truncate text-sm">{item.title}</span>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase shrink-0">{item.type}</span>
                    </div>
                    <div className="text-[11px] text-stone-400 font-mono truncate mt-0.5">{item.subtitle}</div>
                    <div className="text-xs text-stone-400 line-clamp-1 mt-1 font-sans opacity-80">{item.snippet}</div>
                  </div>

                  {isSelected && <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0 self-center" />}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-800 bg-stone-950/80 text-[11px] text-stone-500 font-mono flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  );
};
