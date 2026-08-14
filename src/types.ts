import type { AnySchemaObject } from 'ajv';

export type TabType = 'reference' | 'auditor' | 'schemas' | 'extensibility' | 'cli' | 'evidence' | 'sources' | 'adrs' | 'validation' | 'composed';

export type SourceAuthority = 'DOCS' | 'LIVE' | 'GOOGLE' | 'PROTOCOL' | 'COMMUNITY' | 'INFERRED';

/**
 * A plain JSON value — the honest type for parsed YAML/JSON payloads that
 * flow through the parser core and the workspace auditor.
 */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };


export type AuditSeverity = 'ERROR' | 'WARNING' | 'INFO' | 'SUCCESS';

export interface AuditViolation {
  id: string;
  file: string;
  rule: string;
  message: string;
  severity: AuditSeverity;
  instancePath?: string;
  expected?: string;
  actual?: JsonValue;
  fixable: boolean;
  suggestedFix?: string;
  fixedContent?: string;
  fixedFile?: string;
}

export interface WorkspaceFileItem {
  path: string;
  content: string;
  parsedType?: string;
}

export interface FileAuditResult {
  path: string;
  schemaKey?: string;
  schemaTitle?: string;
  valid: boolean;
  violations: AuditViolation[];
  autoFixAvailable: boolean;
}

export interface WorkspaceAuditReport {
  timestamp: string;
  totalFiles: number;
  totalViolations: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  score: number;
  fileResults: FileAuditResult[];
  crossArtifactFindings: AuditViolation[];
  executionTimeMs: number;
}

export interface ReferenceModule {
  id: string;
  slug: string;
  number: number;
  title: string;
  rawContent: string;
  headings: { level: number; title: string; id: string }[];
  summary?: string;
}

export interface JsonSchemaItem {
  id: string;
  name: string;
  filename: string;
  title: string;
  description: string;
  schema: AnySchemaObject;
  propertiesCount: number;
  requiredFields: string[];
}

export interface EvidenceProbe {
  id: string; // e.g. EV-001
  title: string;
  category: string;
  status: 'RESOLVED' | 'UNRESOLVED' | 'VERIFIED' | 'INVESTIGATING';
  date: string;
  description: string;
  findings: string;
  rawContent: string;
}

export type {
  SourceReferenceLocation,
  MergedSourceItem,
  SourceCitation,
} from './lib/evidenceRegistry';

export interface AdrRecord {
  id: string;
  number: number;
  slug: string;
  title: string;
  status: string;
  date: string;
  rawContent: string;
}


export interface SearchResultItem {
  type: 'reference' | 'schema' | 'evidence' | 'source' | 'adr';
  id: string;
  title: string;
  subtitle: string;
  snippet: string;
  urlParams: { tab: TabType; selectedId: string };
}
