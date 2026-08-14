/**
 * manifestGenerator.ts — Pure typed manifest generation engine.
 *
 * Encapsulates strongly-typed configurations, path resolution, and YAML/JSON
 * formatting for Antigravity extensibility manifests:
 * - SKILL.md (Skill frontmatter + body)
 * - plugin.json (Plugin metadata)
 * - mcp_config.json (Model Context Protocol server configurations)
 * - hooks.json (Lifecycle event hooks)
 * - agent.md (Custom subagent definition)
 * - rule.md (Behavioral rule constraint)
 */

import type { JsonValue } from '../types';

export type SubtoolId = 'skill' | 'plugin' | 'mcp' | 'hook' | 'agent' | 'rule';
export type McpTransport = 'stdio' | 'remote';
export type McpAuthProvider = 'none' | 'google_credentials' | 'oauth';
export type HookEvent = 'PreToolUse' | 'PostToolUse' | 'PreInvocation' | 'PostInvocation' | 'Stop';
export type AgentModel = 'inherit' | 'pro' | 'flash';
export type AgentPolicy = 'sandbox' | 'auto' | 'eager' | 'off';
export type RuleMode = 'Always On' | 'Manual' | 'Model Decision' | 'Glob';

export interface SkillOptions {
  name: string;
  description: string;
  category?: string;
  version?: string;
  disableSlashCommand?: boolean;
  modelInvocable?: boolean;
  body: string;
}

export interface PluginOptions {
  name: string;
  description: string;
  hasSkills?: boolean;
  hasAgents?: boolean;
  hasHooks?: boolean;
  hasMcp?: boolean;
  hasRules?: boolean;
}

export interface McpOptions {
  serverName: string;
  transport: McpTransport;
  command: string;
  args: string;
  remoteUrl: string;
  envKey: string;
  envVal: string;
  authProvider: McpAuthProvider;
  timeout: number;
}

export interface HookOptions {
  name: string;
  event: HookEvent;
  matcher: string;
  command: string;
  timeout: number;
  enabled: boolean;
}

export interface AgentOptions {
  name: string;
  description: string;
  model: AgentModel;
  policy: AgentPolicy;
  isSubagent: boolean;
  isMain: boolean;
  tools: string[];
  prompt: string;
}

export interface RuleOptions {
  name: string;
  mode: RuleMode;
  glob?: string;
  content: string;
}

export interface GeneratedManifestResult {
  path: string;
  filename: string;
  content: string;
  charCount: number;
  approxTokens: number;
}

// Default presets
export const DEFAULT_SKILL_OPTIONS: SkillOptions = {
  name: 'code-security-reviewer',
  description: 'Audits code for vulnerabilities, OWASP Top 10 risks, hardcoded secrets, and unsafe dependencies. Use when reviewing PRs or performing security passes.',
  category: 'Security',
  version: '1.0.0',
  disableSlashCommand: false,
  modelInvocable: true,
  body: `# Security Review Guide

## When to Use
- When conducting pull request reviews
- When checking for unescaped user inputs or SQL injections

## Review Steps
1. Inspect modified lines for untrusted inputs
2. Verify environment variable declarations in .env.example
3. Flag any credentials or secrets`,
};

export const DEFAULT_PLUGIN_OPTIONS: PluginOptions = {
  name: 'devops-toolchain',
  description: 'Production devops automation with Terraform, Docker, and Kubernetes skills.',
  hasSkills: true,
  hasAgents: true,
  hasHooks: true,
  hasMcp: true,
  hasRules: false,
};

export const DEFAULT_MCP_OPTIONS: McpOptions = {
  serverName: 'github-integration',
  transport: 'stdio',
  command: 'npx',
  args: '-y @modelcontextprotocol/server-github',
  remoteUrl: 'https://api.github.com/mcp/',
  envKey: 'GITHUB_PERSONAL_ACCESS_TOKEN',
  envVal: '${GITHUB_TOKEN}',
  authProvider: 'none',
  timeout: 30,
};

export const DEFAULT_HOOK_OPTIONS: HookOptions = {
  name: 'linter-gate',
  event: 'PostToolUse',
  matcher: 'run_command',
  command: './scripts/lint-check.sh',
  timeout: 15,
  enabled: true,
};

export const DEFAULT_AGENT_OPTIONS: AgentOptions = {
  name: 'qa-engineer',
  description: 'Automates end-to-end regression tests and generates coverage reports.',
  model: 'inherit',
  policy: 'sandbox',
  isSubagent: true,
  isMain: true,
  tools: ['view_file', 'run_command', 'grep_search'],
  prompt: `# QA Engineer System Prompt
You are an automated QA engineer specializing in TypeScript and Vitest.

# Objectives
- Always run unit tests after code modifications
- Assert edge cases including null, undefined, and empty arrays`,
};

export const DEFAULT_RULE_OPTIONS: RuleOptions = {
  name: 'typescript-strictness',
  mode: 'Glob',
  glob: 'src/**/*.{ts,tsx}',
  content: `All TypeScript files must adhere to strict type checking. Never use 'any' without an explicit code comment justifying the exception. Prefer interfaces over type aliases for object definitions.`,
};

function formatResult(path: string, content: string): GeneratedManifestResult {
  const parts = path.split('/');
  const filename = parts[parts.length - 1] || path;
  const charCount = content.length;
  const approxTokens = Math.round(charCount / 4);
  return {
    path,
    filename,
    content,
    charCount,
    approxTokens,
  };
}

/**
 * Generates formatted SKILL.md markdown with valid frontmatter.
 */
export function generateSkillManifest(opts: SkillOptions): GeneratedManifestResult {
  const metaBlock = opts.category || opts.version ? `\nmetadata:\n  category: ${opts.category || 'General'}\n  version: ${opts.version || '1.0.0'}` : '';
  const slashBlock = opts.disableSlashCommand ? `\ndisable-slash-command: true` : '';
  const content = `---
name: ${opts.name}
description: >-
  ${opts.description}${metaBlock}${slashBlock}
---

${opts.body}
`;
  return formatResult(`.agents/skills/${opts.name}/SKILL.md`, content);
}

/**
 * Generates formatted plugin.json manifest.
 */
export function generatePluginManifest(opts: PluginOptions): GeneratedManifestResult {
  const content = JSON.stringify(
    {
      $schema: 'https://antigravity.google/schemas/v1/plugin.json',
      name: opts.name,
      description: opts.description,
    },
    null,
    2
  );
  return formatResult(`plugins/${opts.name}/plugin.json`, content);
}

/**
 * Generates formatted mcp_config.json configuration.
 */
export function generateMcpManifest(opts: McpOptions): GeneratedManifestResult {
  const serverObj: Record<string, JsonValue> = {};
  if (opts.transport === 'stdio') {
    serverObj.command = opts.command;
    serverObj.args = opts.args.split(' ').filter(Boolean);
    if (opts.envKey) {
      serverObj.env = { [opts.envKey]: opts.envVal };
    }
  } else {
    serverObj.serverUrl = opts.remoteUrl;
    serverObj.headers = { Authorization: 'Bearer YOUR_TOKEN_OR_SECRET' };
  }

  if (opts.authProvider === 'google_credentials') {
    serverObj.authProviderType = 'google_credentials';
  } else if (opts.authProvider === 'oauth') {
    serverObj.oauth = { clientId: 'CLIENT_ID', clientSecret: 'CLIENT_SECRET' };
  }

  if (opts.timeout !== 30) {
    serverObj.timeout = opts.timeout;
  }

  const content = JSON.stringify(
    {
      mcpServers: {
        [opts.serverName]: serverObj,
      },
    },
    null,
    2
  );
  return formatResult('.agents/mcp_config.json', content);
}

/**
 * Generates formatted hooks.json configuration.
 */
export function generateHookManifest(opts: HookOptions): GeneratedManifestResult {
  const hookObj: Record<string, JsonValue> = {};
  if (!opts.enabled) hookObj.enabled = false;

  const eventEntry: Record<string, JsonValue> = {
    hooks: [
      {
        type: 'command',
        command: opts.command,
        timeout: opts.timeout,
      },
    ],
  };

  if (opts.event === 'PreToolUse' || opts.event === 'PostToolUse') {
    eventEntry.matcher = opts.matcher;
  }

  hookObj[opts.event] = [eventEntry];

  const content = JSON.stringify(
    {
      [opts.name]: hookObj,
    },
    null,
    2
  );
  return formatResult('.agents/hooks.json', content);
}

/**
 * Generates formatted agent markdown file with frontmatter.
 */
export function generateAgentManifest(opts: AgentOptions): GeneratedManifestResult {
  const content = `---
name: ${opts.name}
description: >-
  ${opts.description}
tools:
${opts.tools.map(t => `  - ${t}`).join('\n')}
mainAgent: ${opts.isMain}
subagent: ${opts.isSubagent}
model: ${opts.model}
commandExecutionPolicy: ${opts.policy}
---

${opts.prompt}
`;
  return formatResult(`.agents/agents/${opts.name}.md`, content);
}

/**
 * Generates formatted rule markdown file with header or frontmatter.
 */
export function generateRuleManifest(opts: RuleOptions): GeneratedManifestResult {
  let header = '';
  if (opts.mode === 'Glob') {
    header = `<!-- activation: glob(${opts.glob || '*'}) -->\n`;
  } else if (opts.mode === 'Always On') {
    header = `<!-- activation: always_on -->\n`;
  } else if (opts.mode === 'Model Decision') {
    header = `<!-- activation: model_decision -->\n`;
  } else {
    header = `<!-- activation: manual -->\n`;
  }

  const content = `${header}# Rule: ${opts.name}

${opts.content}
`;
  return formatResult(`.agents/rules/${opts.name}.md`, content);
}

// Self-test suite when executed directly
if (typeof process !== 'undefined' && process.argv[1]?.includes('manifestGenerator')) {
  console.log('Running ManifestGenerator unit tests [TS]...');
  const skill = generateSkillManifest(DEFAULT_SKILL_OPTIONS);
  if (!skill.content.includes('name: code-security-reviewer') || !skill.path.endsWith('SKILL.md')) {
    throw new Error('Skill manifest generation assertion failed');
  }

  const plugin = generatePluginManifest(DEFAULT_PLUGIN_OPTIONS);
  if (!plugin.content.includes('"name": "devops-toolchain"') || !plugin.path.endsWith('plugin.json')) {
    throw new Error('Plugin manifest generation assertion failed');
  }

  const mcp = generateMcpManifest(DEFAULT_MCP_OPTIONS);
  if (!mcp.content.includes('github-integration') || !mcp.path.endsWith('mcp_config.json')) {
    throw new Error('MCP manifest generation assertion failed');
  }

  const hook = generateHookManifest(DEFAULT_HOOK_OPTIONS);
  if (!hook.content.includes('linter-gate') || !hook.path.endsWith('hooks.json')) {
    throw new Error('Hook manifest generation assertion failed');
  }

  const agent = generateAgentManifest(DEFAULT_AGENT_OPTIONS);
  if (!agent.content.includes('name: qa-engineer') || !agent.path.endsWith('qa-engineer.md')) {
    throw new Error('Agent manifest generation assertion failed');
  }

  const rule = generateRuleManifest(DEFAULT_RULE_OPTIONS);
  if (!rule.content.includes('# Rule: typescript-strictness') || !rule.path.endsWith('typescript-strictness.md')) {
    throw new Error('Rule manifest generation assertion failed');
  }

  console.log('✓ All 6 ManifestGenerator tests passed cleanly.');
}

