import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onNavigateLink?: (href: string) => void;
}

// Source authority badge mapping
const SOURCE_TAG_MAP: Record<string, { label: string; bg: string; text: string; border: string }> = {
  '[DOCS]': { label: 'DOCS', bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-700/50' },
  '[LIVE]': { label: 'LIVE', bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-700/50' },
  '[GOOGLE]': { label: 'GOOGLE', bg: 'bg-blue-950/60', text: 'text-blue-300', border: 'border-blue-700/50' },
  '[PROTOCOL]': { label: 'PROTOCOL', bg: 'bg-purple-950/60', text: 'text-purple-300', border: 'border-purple-700/50' },
  '[COMMUNITY]': { label: 'COMMUNITY', bg: 'bg-stone-800', text: 'text-stone-300', border: 'border-stone-700' },
  '[INFERRED]': { label: 'INFERRED', bg: 'bg-rose-950/60', text: 'text-rose-300', border: 'border-rose-700/50' },
  '[RESOLVED]': { label: 'RESOLVED', bg: 'bg-teal-950/60', text: 'text-teal-300', border: 'border-teal-700/50' },
  '[UNRESOLVED]': { label: 'UNRESOLVED', bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-700/50' },
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onNavigateLink }) => {
  return (
    <div className="markdown-body">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children }) {
            const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
            const isInternalAnchor = href?.startsWith('#');

            if (isExternal) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                >
                  {children}
                  <ExternalLink className="w-3 h-3 opacity-70 inline" />
                </a>
              );
            }

            return (
              <a
                href={href}
                onClick={(e) => {
                  if (onNavigateLink && href) {
                    e.preventDefault();
                    onNavigateLink(href);
                  }
                }}
                className="text-cyan-400 hover:underline hover:text-cyan-300 cursor-pointer font-medium"
              >
                {children}
              </a>
            );
          },
          pre({ children }) {
            return <CodeBlockWrapper>{children}</CodeBlockWrapper>;
          },
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const textContent = String(children);

            // Check if this is a source authority tag like [DOCS], [LIVE], etc.
            const trimmed = textContent.trim();
            if (SOURCE_TAG_MAP[trimmed]) {
              const tag = SOURCE_TAG_MAP[trimmed];
              return (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold tracking-wide border ${tag.bg} ${tag.text} ${tag.border} shadow-sm align-middle mx-1`}
                >
                  {tag.label}
                </span>
              );
            }

            // Standard inline code
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-6 border border-stone-800 rounded-lg shadow-sm bg-stone-900/30">
                <table className="w-full text-left border-collapse text-sm">{children}</table>
              </div>
            );
          },
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};

const CodeBlockWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    let text = '';
    React.Children.forEach(children, (child: any) => {
      if (child && child.props && child.props.children) {
        text += String(child.props.children);
      }
    });

    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-stone-800 bg-stone-950">
      <div className="flex items-center justify-between px-4 py-2 bg-stone-900/80 border-b border-stone-800 text-xs text-stone-400 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-stone-700 inline-block" />
          <span>Code Block</span>
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-4 overflow-x-auto font-mono text-sm leading-relaxed text-stone-300">{children}</div>
    </div>
  );
};
