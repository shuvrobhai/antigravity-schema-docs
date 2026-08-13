import React, { useState } from 'react';
import { Terminal, Copy, Check, Search, Filter, Shield, Zap, Sparkles, BookOpen, Layers } from 'lucide-react';

interface CliCommandItem {
  id: string;
  category: 'Session & Prompt' | 'Extensibility & Plugins' | 'Subagents & Multi-Agent' | 'Dev & Verification';
  command: string;
  description: string;
  flags?: string[];
  example: string;
  note?: string;
}

const CLI_COMMANDS: CliCommandItem[] = [
  {
    id: 'headless-prompt',
    category: 'Session & Prompt',
    command: 'agy -p "<prompt>"',
    description: 'Execute a one-shot prompt in headless non-interactive mode.',
    flags: ['-p, --prompt', '--output-format <text|json|stream-json>', '--model <pro|flash>'],
    example: 'agy -p "Review src/main.tsx for memory leaks" --output-format json',
    note: 'In headless mode, only global agents (~/.gemini/config/agents/) are loaded; workspace agents require explicit file path.',
  },
  {
    id: 'interactive-tui',
    category: 'Session & Prompt',
    command: 'agy',
    description: 'Launch the interactive Terminal User Interface (TUI) session.',
    flags: ['--model <pro|flash>', '--sandbox', '--verbose'],
    example: 'agy --model pro',
    note: 'Interactive TUI scans global, plugin, and workspace .agents/ scopes.',
  },
  {
    id: 'skills-list',
    category: 'Extensibility & Plugins',
    command: 'agy -p "/skills" --output-format json',
    description: 'List all discovered skills across global, workspace, and plugin directories.',
    flags: ['--output-format json'],
    example: 'agy -p "/skills" --output-format json',
    note: 'Returns array of skills with path, builtin status, and model_invocable flag [EV-012].',
  },
  {
    id: 'agents-list',
    category: 'Subagents & Multi-Agent',
    command: 'agy agents',
    description: 'Enumerate all available custom agents and subagents.',
    flags: [],
    example: 'agy agents',
    note: 'Lists global and plugin-shipped agents. TUI /agents command also lists workspace-scoped agents [EV-004].',
  },
  {
    id: 'agent-run',
    category: 'Subagents & Multi-Agent',
    command: 'agy -p "<prompt>" --agent <name-or-path>',
    description: 'Run a specific subagent in headless execution mode.',
    flags: ['--agent <name>'],
    example: 'agy -p "Run security audit" --agent code-reviewer',
    note: 'Pass relative path to .agents/agents/<name>.md for workspace agents in headless mode.',
  },
  {
    id: 'teamwork-preview',
    category: 'Subagents & Multi-Agent',
    command: '/teamwork-preview',
    description: 'Activate multi-agent coordinated teamwork and automatic error recovery.',
    flags: ['Ultra Plan ($200/mo) only'],
    example: '/teamwork-preview',
    note: 'Allows subagents to auto-coordinate, retry failures, and balance task workloads.',
  },
  {
    id: 'plugin-list',
    category: 'Extensibility & Plugins',
    command: 'agy plugin list',
    description: 'List all imported plugins, their source (antigravity/claude-code/gemini-cli), and active components.',
    flags: [],
    example: 'agy plugin list',
    note: 'Surfaces imported plugins and component list (skills, agents, hooks, commands, mcpServers) [EV-006].',
  },
  {
    id: 'plugin-install',
    category: 'Extensibility & Plugins',
    command: 'agy plugin install <target>',
    description: 'Install a plugin bundle directly or from marketplace registry.',
    flags: ['supports plugin@marketplace syntax'],
    example: 'agy plugin install self-customizer@marketplace',
  },
  {
    id: 'plugin-import',
    category: 'Extensibility & Plugins',
    command: 'agy plugin import [source]',
    description: 'Import plugin configurations from Gemini CLI or Claude Code.',
    flags: ['source: gemini | claude'],
    example: 'agy plugin import gemini',
  },
  {
    id: 'plugin-enable',
    category: 'Extensibility & Plugins',
    command: 'agy plugin enable <name> / agy plugin disable <name>',
    description: 'Toggle activation state of an installed plugin bundle.',
    flags: [],
    example: 'agy plugin enable devops-toolchain',
  },
  {
    id: 'mcp-manager',
    category: 'Extensibility & Plugins',
    command: '/mcp',
    description: 'Open interactive MCP server management console in TUI.',
    flags: [],
    example: '/mcp',
    note: 'Provides status indicators, server latency logs, reconnect triggers, and MCP Store access.',
  },
  {
    id: 'make-build',
    category: 'Dev & Verification',
    command: 'make build',
    description: 'Compose all 21 modular Markdown files in reference/ into monolithic antigravity-reference.md.',
    flags: [],
    example: 'make build',
    note: 'Powered by scripts/build.ts. antigravity-reference.md is a compiled artifact.',
  },
  {
    id: 'make-validate',
    category: 'Dev & Verification',
    command: 'make validate',
    description: 'Run the full 11-check repository integrity and consistency suite.',
    flags: ['make validate-verbose', 'make validate-fix'],
    example: 'make validate',
    note: 'Enforces contiguity, TOC sync, heading hierarchy, evidence grounding, and schema parity.',
  },
  {
    id: 'make-fetch-sources',
    category: 'Dev & Verification',
    command: 'make fetch-sources',
    description: 'Fetch and snapshot all 46 web citations in §19 into evidence/sources/.',
    flags: ['make check-sources', 'make force-fetch-sources'],
    example: 'make fetch-sources',
    note: 'Generates evidence/sources/index.md and archives source Markdown.',
  },
];

export const CliCheatSheet: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['all', 'Session & Prompt', 'Extensibility & Plugins', 'Subagents & Multi-Agent', 'Dev & Verification'];

  const filteredCommands = CLI_COMMANDS.filter(cmd => {
    const matchesCat = selectedCategory === 'all' || cmd.category === selectedCategory;
    const matchesSearch =
      !search ||
      cmd.command.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase()) ||
      cmd.example.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto px-4 lg:px-8 py-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-stone-800 pb-5 space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>CLI Command Catalog</span>
          </span>
          <span className="text-xs text-stone-500 font-mono">agy v1.1.12 Syntax Reference</span>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">Antigravity CLI Command & Flag Reference</h2>
        <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
          Comprehensive cheat sheet for all Antigravity CLI flags, slash commands, plugin managers, headless automation pipelines, and repository make targets.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            placeholder="Search commands, flags, or targets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold'
                  : 'bg-stone-900/60 hover:bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {cat === 'all' ? 'All Commands' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Commands Grid */}
      <div className="space-y-3">
        {filteredCommands.map(cmd => {
          const isCopied = copiedId === cmd.id;
          return (
            <div
              key={cmd.id}
              className="border border-stone-800 rounded-xl p-4 bg-stone-900/30 hover:border-stone-700/80 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-bold text-cyan-300 font-mono bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                      {cmd.command}
                    </code>
                    <span className="px-2 py-0.5 rounded bg-stone-800 text-[10px] font-mono text-stone-400">
                      {cmd.category}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 pt-0.5">{cmd.description}</p>
                </div>

                <button
                  onClick={() => handleCopy(cmd.id, cmd.example)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 text-xs transition-colors cursor-pointer shrink-0"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy Example'}</span>
                </button>
              </div>

              {/* Example box */}
              <div className="bg-stone-950 rounded-lg p-3 border border-stone-850 font-mono text-xs text-stone-300 flex items-center justify-between">
                <span className="text-cyan-400 select-all">$ {cmd.example}</span>
              </div>

              {/* Flags & Note */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                {cmd.flags && cmd.flags.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1 text-stone-400">
                    <span className="text-stone-500">Flags:</span>
                    {cmd.flags.map((f, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300">
                        {f}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div />
                )}

                {cmd.note && (
                  <div className="text-stone-500 italic max-w-xl text-right truncate">
                    💡 {cmd.note}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
