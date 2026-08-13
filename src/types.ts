export type TabType = 'reference' | 'auditor' | 'schemas' | 'extensibility' | 'cli' | 'evidence' | 'sources' | 'adrs' | 'validation' | 'composed';

export type SourceAuthority = 'DOCS' | 'LIVE' | 'GOOGLE' | 'PROTOCOL' | 'COMMUNITY' | 'INFERRED';

export type AuditSeverity = 'ERROR' | 'WARNING' | 'INFO' | 'SUCCESS';

export interface AuditViolation {
  id: string;
  file: string;
  rule: string;
  message: string;
  severity: AuditSeverity;
  instancePath?: string;
  expected?: string;
  actual?: any;
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
  schema: Record<string, any>;
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

export interface SourceReferenceLocation {
  targetType: 'reference' | 'evidence' | 'adr' | 'schema' | 'doc';
  targetId: string; // e.g. 04-extensibility-architecture.md
  targetTitle: string; // e.g. §04. Extensibility Architecture
  sectionTitle?: string;
  lineNumber: number;
  lineText: string;
  contextSnippet: string;
  matchType: 'badge' | 'url' | 'file_link' | 'works_cited' | 'text_mention';
  matchedText: string;
  deepLink: { tab: TabType; selectedId: string; headingId?: string };
}

export interface MergedSourceItem {
  number: number;
  filename: string;
  category: 'docs' | 'google' | 'protocol' | 'community';
  title: string;
  url: string;
  finalUrl?: string;
  rawContent: string;
  fetched?: string;
  status?: number | string;
  license?: string;
}

export interface SourceCitation {
  id: string;
  number: number;
  citationNumbers: number[];
  slug: string;
  title: string;
  category: 'docs' | 'google' | 'protocol' | 'community';
  url: string;
  finalUrl?: string;
  canonicalUrl: string;
  filename: string;
  filenames: string[];
  rawContent: string;
  archivedDate?: string;
  license?: string;
  status?: number | string;
  isDuplicateGroup?: boolean;
  duplicateCount?: number;
  mergedSources?: MergedSourceItem[];
  referenceLocations: SourceReferenceLocation[];
}

export interface AdrRecord {
  id: string;
  number: number;
  slug: string;
  title: string;
  status: string;
  date: string;
  rawContent: string;
}

export interface ValidationCheckResult {
  id: string;
  name: string;
  category: string;
  passed: boolean;
  /** 'pass' | 'fail' | 'na' — n/a means the check needs disk access only the CLI has. */
  status: 'pass' | 'fail' | 'na';
  messages: string[];
  details: string[];
}

export interface SearchResultItem {
  type: 'reference' | 'schema' | 'evidence' | 'source' | 'adr';
  id: string;
  title: string;
  subtitle: string;
  snippet: string;
  urlParams: { tab: TabType; selectedId: string };
}
