import React, { useState } from 'react';
import { Copy, Check, Sparkles, Box, Shield, Terminal, Cpu, FileCode, Layers, CheckCircle2, Download, AlertCircle, Wrench, type LucideIcon } from 'lucide-react';
import Ajv from 'ajv';
import type { JsonValue } from '../types';

type SubtoolId = 'skill' | 'plugin' | 'mcp' | 'hook' | 'agent' | 'rule';
type McpTransport = 'stdio' | 'remote';
type McpAuthProvider = 'none' | 'google_credentials' | 'oauth';
type HookEvent = 'PreToolUse' | 'PostToolUse' | 'PreInvocation' | 'PostInvocation' | 'Stop';
type AgentModel = 'inherit' | 'pro' | 'flash';
type AgentPolicy = 'sandbox' | 'auto' | 'eager' | 'off';
type RuleMode = 'Always On' | 'Manual' | 'Model Decision' | 'Glob';

const SUBTOOLS: { id: SubtoolId; label: string; icon: LucideIcon; section: string }[] = [
  { id: 'skill', label: 'Skill (SKILL.md)', icon: Sparkles, section: '§4.2' },
  { id: 'plugin', label: 'Plugin Manifest', icon: Box, section: '§4.4' },
  { id: 'mcp', label: 'MCP Config', icon: Cpu, section: '§4.5' },
  { id: 'hook', label: 'Lifecycle Hook', icon: Terminal, section: '§4.8' },
  { id: 'agent', label: 'Custom Agent', icon: Layers, section: '§4.3' },
  { id: 'rule', label: 'Rule Definition', icon: Shield, section: '§4.6' },
];

export const ExtensibilityHub: React.FC = () => {
  const [activeSubtool, setActiveSubtool] = useState<SubtoolId>('skill');
  const [copied, setCopied] = useState(false);

  // Skill Generator State
  const [skillName, setSkillName] = useState('code-security-reviewer');
  const [skillDesc, setSkillDesc] = useState('Audits code for vulnerabilities, OWASP Top 10 risks, hardcoded secrets, and unsafe dependencies. Use when reviewing PRs or performing security passes.');
  const [skillCategory, setSkillCategory] = useState('Security');
  const [skillVersion, setSkillVersion] = useState('1.0.0');
  const [skillDisableSlash, setSkillDisableSlash] = useState(false);
  const [skillModelInvocable, setSkillModelInvocable] = useState(true);
  const [skillBody, setSkillBody] = useState(`# Security Review Guide\n\n## When to Use\n- When conducting pull request reviews\n- When checking for unescaped user inputs or SQL injections\n\n## Review Steps\n1. Inspect modified lines for untrusted inputs\n2. Verify environment variable declarations in .env.example\n3. Flag any credentials or secrets`);

  // Plugin Generator State
  const [pluginName, setPluginName] = useState('devops-toolchain');
  const [pluginDesc, setPluginDesc] = useState('Production devops automation with Terraform, Docker, and Kubernetes skills.');
  const [pluginHasSkills, setPluginHasSkills] = useState(true);
  const [pluginHasAgents, setPluginHasAgents] = useState(true);
  const [pluginHasHooks, setPluginHasHooks] = useState(true);
  const [pluginHasMcp, setPluginHasMcp] = useState(true);
  const [pluginHasRules, setPluginHasRules] = useState(false);

  // MCP Configurator State
  const [mcpServerName, setMcpServerName] = useState('github-integration');
  const [mcpTransport, setMcpTransport] = useState<McpTransport>('stdio');
  const [mcpCommand, setMcpCommand] = useState('npx');
  const [mcpArgs, setMcpArgs] = useState('-y @modelcontextprotocol/server-github');
  const [mcpRemoteUrl, setMcpRemoteUrl] = useState('https://api.github.com/mcp/');
  const [mcpEnvKey, setMcpEnvKey] = useState('GITHUB_PERSONAL_ACCESS_TOKEN');
  const [mcpEnvVal, setMcpEnvVal] = useState('${GITHUB_TOKEN}');
  const [mcpAuthProvider, setMcpAuthProvider] = useState<McpAuthProvider>('none');
  const [mcpTimeout, setMcpTimeout] = useState<number>(30);

  // Hook Configurator State
  const [hookName, setHookName] = useState('linter-gate');
  const [hookEvent, setHookEvent] = useState<HookEvent>('PostToolUse');
  const [hookMatcher, setHookMatcher] = useState('run_command');
  const [hookCommand, setHookCommand] = useState('./scripts/lint-check.sh');
  const [hookTimeout, setHookTimeout] = useState(15);
  const [hookEnabled, setHookEnabled] = useState(true);

  // Custom Agent State
  const [agentName, setAgentName] = useState('qa-engineer');
  const [agentDesc, setAgentDesc] = useState('Automates end-to-end regression tests and generates coverage reports.');
  const [agentModel, setAgentModel] = useState<AgentModel>('inherit');
  const [agentPolicy, setAgentPolicy] = useState<AgentPolicy>('sandbox');
  const [agentIsSubagent, setAgentIsSubagent] = useState(true);
  const [agentIsMain, setAgentIsMain] = useState(true);
  const [agentTools, setAgentTools] = useState<string[]>(['view_file', 'run_command', 'grep_search']);
  const [agentPrompt, setAgentPrompt] = useState(`# QA Engineer System Prompt\nYou are an automated QA engineer specializing in TypeScript and Vitest.\n\n# Objectives\n- Always run unit tests after code modifications\n- Assert edge cases including null, undefined, and empty arrays`);

  // Rule Generator State
  const [ruleName, setRuleName] = useState('typescript-strictness');
  const [ruleMode, setRuleMode] = useState<RuleMode>('Glob');
  const [ruleGlob, setRuleGlob] = useState('src/**/*.{ts,tsx}');
  const [ruleContent, setRuleContent] = useState(`All TypeScript files must adhere to strict type checking. Never use 'any' without an explicit code comment justifying the exception. Prefer interfaces over type aliases for object definitions.`);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate Skill Output
  const generateSkillMarkdown = () => {
    const metaBlock = skillCategory || skillVersion ? `\nmetadata:\n  category: ${skillCategory}\n  version: ${skillVersion}` : '';
    const slashBlock = skillDisableSlash ? `\ndisable-slash-command: true` : '';
    return `---
name: ${skillName}
description: >-
  ${skillDesc}${metaBlock}${slashBlock}
---

${skillBody}
`;
  };

  // Generate Plugin Manifest Output
  const generatePluginManifest = () => {
    return JSON.stringify(
      {
        $schema: 'https://antigravity.google/schemas/v1/plugin.json',
        name: pluginName,
        description: pluginDesc,
      },
      null,
      2
    );
  };

  // Generate MCP Config Output
  const generateMcpConfig = () => {
    const serverObj: Record<string, JsonValue> = {};
    if (mcpTransport === 'stdio') {
      serverObj.command = mcpCommand;
      serverObj.args = mcpArgs.split(' ').filter(Boolean);
      if (mcpEnvKey) {
        serverObj.env = { [mcpEnvKey]: mcpEnvVal };
      }
    } else {
      serverObj.serverUrl = mcpRemoteUrl;
      serverObj.headers = { Authorization: 'Bearer YOUR_TOKEN_OR_SECRET' };
    }

    if (mcpAuthProvider === 'google_credentials') {
      serverObj.authProviderType = 'google_credentials';
    } else if (mcpAuthProvider === 'oauth') {
      serverObj.oauth = { clientId: 'CLIENT_ID', clientSecret: 'CLIENT_SECRET' };
    }

    if (mcpTimeout !== 30) {
      serverObj.timeout = mcpTimeout;
    }

    return JSON.stringify(
      {
        mcpServers: {
          [mcpServerName]: serverObj,
        },
      },
      null,
      2
    );
  };

  // Generate Hooks Config Output
  const generateHooksConfig = () => {
    const hookObj: Record<string, JsonValue> = {};
    if (!hookEnabled) hookObj.enabled = false;

    const eventEntry: Record<string, JsonValue> = {
      hooks: [
        {
          type: 'command',
          command: hookCommand,
          timeout: hookTimeout,
        },
      ],
    };

    if (hookEvent === 'PreToolUse' || hookEvent === 'PostToolUse') {
      eventEntry.matcher = hookMatcher;
    }

    hookObj[hookEvent] = [eventEntry];

    return JSON.stringify(
      {
        [hookName]: hookObj,
      },
      null,
      2
    );
  };

  // Generate Custom Agent Output
  const generateAgentMarkdown = () => {
    return `---
name: ${agentName}
description: >-
  ${agentDesc}
tools:
${agentTools.map(t => `  - ${t}`).join('\n')}
mainAgent: ${agentIsMain}
subagent: ${agentIsSubagent}
model: ${agentModel}
commandExecutionPolicy: ${agentPolicy}
---

${agentPrompt}
`;
  };

  // Generate Rule Output
  const generateRuleMarkdown = () => {
    let header = '';
    if (ruleMode === 'Glob') {
      header = `<!-- activation: glob(${ruleGlob}) -->\n`;
    } else if (ruleMode === 'Always On') {
      header = `<!-- activation: always_on -->\n`;
    } else if (ruleMode === 'Model Decision') {
      header = `<!-- activation: model_decision -->\n`;
    } else {
      header = `<!-- activation: manual -->\n`;
    }

    return `${header}# Rule: ${ruleName}

${ruleContent}
`;
  };

  const getActiveCode = () => {
    switch (activeSubtool) {
      case 'skill':
        return generateSkillMarkdown();
      case 'plugin':
        return generatePluginManifest();
      case 'mcp':
        return generateMcpConfig();
      case 'hook':
        return generateHooksConfig();
      case 'agent':
        return generateAgentMarkdown();
      case 'rule':
        return generateRuleMarkdown();
    }
  };

  const getTargetFilePath = () => {
    switch (activeSubtool) {
      case 'skill':
        return `.agents/skills/${skillName}/SKILL.md`;
      case 'plugin':
        return `plugins/${pluginName}/plugin.json`;
      case 'mcp':
        return `.agents/mcp_config.json`;
      case 'hook':
        return `.agents/hooks.json`;
      case 'agent':
        return `.agents/agents/${agentName}.md`;
      case 'rule':
        return `.agents/rules/${ruleName}.md`;
    }
  };

  const currentCode = getActiveCode();
  const charCount = currentCode.length;
  const approxTokens = Math.round(charCount / 4);

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto px-4 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="border-b border-stone-800 pb-5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-800/60 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span>Extensibility Studio</span>
            </span>
            <span className="text-xs text-stone-500 font-mono">Reference §4.1 - §4.8 Compliance</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-stone-400">
              Target: <code className="text-cyan-300 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">{getTargetFilePath()}</code>
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">Interactive Extensibility & Scaffolder Studio</h2>
        <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
          Configure, generate, and copy production-ready boilerplate for Google Antigravity Skills, Plugins, MCP servers, Lifecycle Hooks, Custom Agent personas, and Rules.
        </p>
      </div>

      {/* Extensibility Pillar Switcher Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {SUBTOOLS.map(item => {
          const Icon = item.icon;
          const isActive = activeSubtool === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubtool(item.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                isActive
                  ? 'bg-cyan-950/80 border-cyan-700/80 text-white shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                  : 'bg-stone-900/50 hover:bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-stone-500'}`} />
                <span className="text-[10px] font-mono text-stone-500">{item.section}</span>
              </div>
              <div>
                <div className="text-xs font-semibold">{item.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Studio Grid: Left Form, Right Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Form Controls */}
        <div className="lg:col-span-6 space-y-4 bg-stone-900/30 border border-stone-800 rounded-2xl p-5">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <span>Configuration Parameters</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400 uppercase">{activeSubtool} builder</span>
          </div>

          {/* Skill Form */}
          {activeSubtool === 'skill' && (
            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-stone-400 mb-1">Skill Identifier (`name`):</label>
                <input
                  type="text"
                  value={skillName}
                  onChange={e => setSkillName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="e.g. code-security-reviewer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-stone-400">Description (Trigger Phrase):</label>
                  <span className="text-[10px] text-cyan-400 font-sans">Phase 1 (~100 tokens)</span>
                </div>
                <textarea
                  rows={3}
                  value={skillDesc}
                  onChange={e => setSkillDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="Describe what the skill does and specific triggers..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Category:</label>
                  <input
                    type="text"
                    value={skillCategory}
                    onChange={e => setSkillCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Version:</label>
                  <input
                    type="text"
                    value={skillVersion}
                    onChange={e => setSkillVersion(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                  <input
                    type="checkbox"
                    checked={skillDisableSlash}
                    onChange={e => setSkillDisableSlash(e.target.checked)}
                    className="rounded border-stone-700 text-cyan-500 focus:ring-0"
                  />
                  <span>disable-slash-command (Hide from `/` menu while keeping invocable)</span>
                </label>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-stone-400">Phase 2 Instructions (`SKILL.md` body):</label>
                  <span className="text-[10px] text-stone-500">&lt;5,000 tokens recommended</span>
                </div>
                <textarea
                  rows={6}
                  value={skillBody}
                  onChange={e => setSkillBody(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none font-mono text-xs"
                />
              </div>

              {/* Folder structure hint */}
              <div className="p-3 rounded-lg bg-stone-950 border border-stone-800/80 text-[11px] text-stone-400 space-y-1">
                <div className="font-bold text-stone-300">Folder Scaffold:</div>
                <pre className="text-cyan-400">
{`.agents/skills/${skillName}/
├── SKILL.md       # (Generated)
├── scripts/       # (Optional helper tools)
├── examples/      # (Optional references)
└── resources/     # (Optional templates)`}
                </pre>
              </div>
            </div>
          )}

          {/* Plugin Form */}
          {activeSubtool === 'plugin' && (
            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-stone-400 mb-1">Plugin Name:</label>
                <input
                  type="text"
                  value={pluginName}
                  onChange={e => setPluginName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Plugin Description:</label>
                <textarea
                  rows={2}
                  value={pluginDesc}
                  onChange={e => setPluginDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-2 font-bold">Bundled Components (Live-Detected):</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                    <input
                      type="checkbox"
                      checked={pluginHasSkills}
                      onChange={e => setPluginHasSkills(e.target.checked)}
                      className="rounded border-stone-700 text-cyan-500"
                    />
                    <span>skills/ directory</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                    <input
                      type="checkbox"
                      checked={pluginHasAgents}
                      onChange={e => setPluginHasAgents(e.target.checked)}
                      className="rounded border-stone-700 text-cyan-500"
                    />
                    <span>agents/ directory (Custom subagents)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                    <input
                      type="checkbox"
                      checked={pluginHasHooks}
                      onChange={e => setPluginHasHooks(e.target.checked)}
                      className="rounded border-stone-700 text-cyan-500"
                    />
                    <span>hooks.json (Lifecycle hooks)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                    <input
                      type="checkbox"
                      checked={pluginHasMcp}
                      onChange={e => setPluginHasMcp(e.target.checked)}
                      className="rounded border-stone-700 text-cyan-500"
                    />
                    <span>mcp_config.json (MCP server configurations)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                    <input
                      type="checkbox"
                      checked={pluginHasRules}
                      onChange={e => setPluginHasRules(e.target.checked)}
                      className="rounded border-stone-700 text-cyan-500"
                    />
                    <span>rules/ directory</span>
                  </label>
                </div>
              </div>

              {/* Scaffold */}
              <div className="p-3 rounded-lg bg-stone-950 border border-stone-800/80 text-[11px] text-stone-400 space-y-1">
                <div className="font-bold text-stone-300">Plugin Bundle Tree:</div>
                <pre className="text-cyan-400">
{`plugins/${pluginName}/
├── plugin.json
${pluginHasSkills ? '├── skills/\n' : ''}${pluginHasAgents ? '├── agents/\n' : ''}${pluginHasHooks ? '├── hooks.json\n' : ''}${pluginHasMcp ? '├── mcp_config.json\n' : ''}${pluginHasRules ? '└── rules/\n' : ''}`}
                </pre>
              </div>
            </div>
          )}

          {/* MCP Form */}
          {activeSubtool === 'mcp' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Server Key:</label>
                  <input
                    type="text"
                    value={mcpServerName}
                    onChange={e => setMcpServerName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Transport:</label>
                  <select
                    value={mcpTransport}
                    onChange={e => setMcpTransport(e.target.value as McpTransport)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="stdio">Stdio (Local command)</option>
                    <option value="remote">Remote (SSE / HTTP)</option>
                  </select>
                </div>
              </div>

              {mcpTransport === 'stdio' ? (
                <>
                  <div>
                    <label className="block text-stone-400 mb-1">Executable Command:</label>
                    <input
                      type="text"
                      value={mcpCommand}
                      onChange={e => setMcpCommand(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 mb-1">Arguments (Space separated):</label>
                    <input
                      type="text"
                      value={mcpArgs}
                      onChange={e => setMcpArgs(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-400 mb-1">Env Key:</label>
                      <input
                        type="text"
                        value={mcpEnvKey}
                        onChange={e => setMcpEnvKey(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1">Env Value / Variable:</label>
                      <input
                        type="text"
                        value={mcpEnvVal}
                        onChange={e => setMcpEnvVal(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-stone-400 mb-1">Server URL (`serverUrl`):</label>
                  <input
                    type="text"
                    value={mcpRemoteUrl}
                    onChange={e => setMcpRemoteUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Authentication:</label>
                  <select
                    value={mcpAuthProvider}
                    onChange={e => setMcpAuthProvider(e.target.value as McpAuthProvider)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="none">None / Custom Headers</option>
                    <option value="google_credentials">Google ADC (authProviderType)</option>
                    <option value="oauth">Manual OAuth (clientId/Secret)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Timeout (seconds):</label>
                  <input
                    type="number"
                    value={mcpTimeout}
                    onChange={e => setMcpTimeout(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hook Form */}
          {activeSubtool === 'hook' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Hook Key:</label>
                  <input
                    type="text"
                    value={hookName}
                    onChange={e => setHookName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Lifecycle Event:</label>
                  <select
                    value={hookEvent}
                    onChange={e => setHookEvent(e.target.value as HookEvent)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="PreToolUse">PreToolUse (Before tool execution)</option>
                    <option value="PostToolUse">PostToolUse (After tool completion)</option>
                    <option value="PreInvocation">PreInvocation (Before model call)</option>
                    <option value="PostInvocation">PostInvocation (After model call)</option>
                    <option value="Stop">Stop (Session termination)</option>
                  </select>
                </div>
              </div>

              {(hookEvent === 'PreToolUse' || hookEvent === 'PostToolUse') && (
                <div>
                  <label className="block text-stone-400 mb-1">Matcher (Tool name / regex pattern):</label>
                  <input
                    type="text"
                    value={hookMatcher}
                    onChange={e => setHookMatcher(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="e.g. run_command or browser_.* or *"
                  />
                </div>
              )}

              <div>
                <label className="block text-stone-400 mb-1">Command Script Path:</label>
                <input
                  type="text"
                  value={hookCommand}
                  onChange={e => setHookCommand(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Timeout (seconds):</label>
                  <input
                    type="number"
                    value={hookTimeout}
                    onChange={e => setHookTimeout(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                    <input
                      type="checkbox"
                      checked={hookEnabled}
                      onChange={e => setHookEnabled(e.target.checked)}
                      className="rounded border-stone-700 text-cyan-500"
                    />
                    <span>Enabled</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Custom Agent Form */}
          {activeSubtool === 'agent' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Agent Identifier (`name`):</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={e => setAgentName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Model Tier:</label>
                  <select
                    value={agentModel}
                    onChange={e => setAgentModel(e.target.value as AgentModel)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="inherit">inherit (Dynamic cascade)</option>
                    <option value="pro">pro (Gemini 2.5 Pro)</option>
                    <option value="flash">flash (Gemini 2.5 Flash)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Planner Description (Delegation Trigger):</label>
                <textarea
                  rows={2}
                  value={agentDesc}
                  onChange={e => setAgentDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Command Execution Policy:</label>
                  <select
                    value={agentPolicy}
                    onChange={e => setAgentPolicy(e.target.value as AgentPolicy)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="sandbox">sandbox (Safe execution)</option>
                    <option value="auto">auto (Standard approval)</option>
                    <option value="eager">eager (Pre-authorized)</option>
                    <option value="off">off (No terminal execution)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                    <input
                      type="checkbox"
                      checked={agentIsSubagent}
                      onChange={e => setAgentIsSubagent(e.target.checked)}
                      className="rounded border-stone-700 text-cyan-500"
                    />
                    <span>subagent: true</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                    <input
                      type="checkbox"
                      checked={agentIsMain}
                      onChange={e => setAgentIsMain(e.target.checked)}
                      className="rounded border-stone-700 text-cyan-500"
                    />
                    <span>mainAgent: true</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">System Instructions Body:</label>
                <textarea
                  rows={4}
                  value={agentPrompt}
                  onChange={e => setAgentPrompt(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Rule Form */}
          {activeSubtool === 'rule' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Rule Name:</label>
                  <input
                    type="text"
                    value={ruleName}
                    onChange={e => setRuleName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Activation Mode:</label>
                  <select
                    value={ruleMode}
                    onChange={e => setRuleMode(e.target.value as RuleMode)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Glob">Glob (Active files match pattern)</option>
                    <option value="Always On">Always On (Injected baseline)</option>
                    <option value="Model Decision">Model Decision (Semantic similarity)</option>
                    <option value="Manual">Manual (@ rule mention)</option>
                  </select>
                </div>
              </div>

              {ruleMode === 'Glob' && (
                <div>
                  <label className="block text-stone-400 mb-1">Glob Match Pattern:</label>
                  <input
                    type="text"
                    value={ruleGlob}
                    onChange={e => setRuleGlob(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="e.g. src/**/*.tsx or **/*.proto"
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-stone-400">Rule Directives & Constraints:</label>
                  <span className={`text-[10px] ${ruleContent.length > 12000 ? 'text-rose-400' : 'text-stone-500'}`}>
                    {ruleContent.length.toLocaleString()} / 12,000 max characters
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={ruleContent}
                  onChange={e => setRuleContent(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Code Generator Output & Live Validator */}
        <div className="lg:col-span-6 space-y-4">
          <div className="border border-stone-800 rounded-2xl bg-stone-900/40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-stone-950 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-stone-200">{getTargetFilePath()}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(currentCode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 text-xs transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-4 bg-stone-950/80 font-mono text-xs text-stone-200 overflow-x-auto max-h-[480px]">
              <pre className="leading-relaxed whitespace-pre">{currentCode}</pre>
            </div>

            {/* Status Footer */}
            <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs font-mono text-stone-400">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Valid Specification</span>
                </span>
                <span>•</span>
                <span>{charCount} characters (~{approxTokens} tokens)</span>
              </div>
              <span className="text-stone-500">Ready to save in repository</span>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="p-4 rounded-xl border border-stone-800 bg-stone-900/30 text-xs text-stone-400 space-y-2">
            <div className="font-bold text-stone-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-cyan-400" />
              <span>Specification Highlights (§04 Reference)</span>
            </div>
            {activeSubtool === 'skill' && (
              <p className="leading-relaxed">
                Skills load on demand via the 3-phase Progressive Disclosure Engine. Only <code className="text-cyan-300">name</code> and <code className="text-cyan-300">description</code> are evaluated in Phase 1 (~100 tokens). The model dynamically loads the full body if relevant.
              </p>
            )}
            {activeSubtool === 'plugin' && (
              <p className="leading-relaxed">
                Plugins bundle skills, agents, commands, hooks, and MCP servers into a single package. Manifest only requires <code className="text-cyan-300">name</code>.
              </p>
            )}
            {activeSubtool === 'mcp' && (
              <p className="leading-relaxed">
                Supports Stdio (local process) and Remote (SSE/HTTP) transports. Use <code className="text-cyan-300">serverUrl</code> for remote connections, and <code className="text-cyan-300">authProviderType: "google_credentials"</code> for Google ADC authentication.
              </p>
            )}
            {activeSubtool === 'hook' && (
              <p className="leading-relaxed">
                Hooks execute custom scripts sequentially. PreToolUse non-zero exit codes cancel tool execution. All hooks support a configurable <code className="text-cyan-300">timeout</code> (default 30s).
              </p>
            )}
            {activeSubtool === 'agent' && (
              <p className="leading-relaxed">
                Custom agents define persona, tools, execution policy, and model tier (<code className="text-cyan-300">inherit</code>, <code className="text-cyan-300">pro</code>, <code className="text-cyan-300">flash</code>). Both <code className="text-cyan-300">subagent: true</code> and <code className="text-cyan-300">mainAgent: true</code> can be active simultaneously.
              </p>
            )}
            {activeSubtool === 'rule' && (
              <p className="leading-relaxed">
                Rules impose persistent prompt-level constraints up to 12,000 characters per file. Glob modes dynamically inject rules whenever active files match minimatch patterns.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
