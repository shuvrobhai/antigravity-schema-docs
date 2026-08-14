import React, { lazy, Suspense, useState, useEffect } from 'react';
import { TabType } from './types';
import {
  referenceModules,
  jsonSchemas,
  evidenceProbes,
  sourceCitations,
  adrRecords,
  parentComposedDocument,
  evidenceDoc,
  evidenceIndexDoc,
  researchReportDoc,
} from './data/repository';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Tab views are lazy-loaded so the initial bundle only ships the app shell;
// heavy deps (ajv, react-markdown) load per-tab on first visit.
const ReferenceViewer = lazy(() => import('./components/ReferenceViewer').then(m => ({ default: m.ReferenceViewer })));
const WorkspaceAuditor = lazy(() => import('./components/WorkspaceAuditor').then(m => ({ default: m.WorkspaceAuditor })));
const SchemaExplorer = lazy(() => import('./components/SchemaExplorer').then(m => ({ default: m.SchemaExplorer })));
const ExtensibilityHub = lazy(() => import('./components/ExtensibilityHub').then(m => ({ default: m.ExtensibilityHub })));
const CliCheatSheet = lazy(() => import('./components/CliCheatSheet').then(m => ({ default: m.CliCheatSheet })));
const EvidenceMatrix = lazy(() => import('./components/EvidenceMatrix').then(m => ({ default: m.EvidenceMatrix })));
const SourceArchiveViewer = lazy(() => import('./components/SourceArchiveViewer').then(m => ({ default: m.SourceArchiveViewer })));
const AdrViewer = lazy(() => import('./components/AdrViewer').then(m => ({ default: m.AdrViewer })));
const ValidationConsole = lazy(() => import('./components/ValidationConsole').then(m => ({ default: m.ValidationConsole })));
const ComposedDocViewer = lazy(() => import('./components/ComposedDocViewer').then(m => ({ default: m.ComposedDocViewer })));
const SearchModal = lazy(() => import('./components/SearchModal').then(m => ({ default: m.SearchModal })));

const VALID_TABS: TabType[] = [
  'reference',
  'auditor',
  'schemas',
  'extensibility',
  'cli',
  'evidence',
  'sources',
  'adrs',
  'validation',
  'composed',
];

function isTabType(value: string): value is TabType {
  return (VALID_TABS as readonly string[]).includes(value);
}

const TabFallback: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm">
    Loading…
  </div>
);

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('reference');
  const [selectedModuleId, setSelectedModuleId] = useState<string>(referenceModules[0]?.id || '');
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>(jsonSchemas[0]?.id || '');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>(evidenceProbes[0]?.id || '');
  const [selectedSourceId, setSelectedSourceId] = useState<string>(sourceCitations[0]?.id || '');
  const [selectedAdrId, setSelectedAdrId] = useState<string>(adrRecords[0]?.id || '');

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Deep linking via URL hash support
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) return;
      const [tab, id] = hash.split('/');
      if (isTabType(tab)) {
        setActiveTab(tab);
        if (id) {
          if (tab === 'reference') setSelectedModuleId(id);
          else if (tab === 'schemas') setSelectedSchemaId(id);
          else if (tab === 'evidence') setSelectedEvidenceId(id);
          else if (tab === 'sources') setSelectedSourceId(id);
          else if (tab === 'adrs') setSelectedAdrId(id);
        }
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  // Update hash when active navigation changes
  useEffect(() => {
    let hash = `#${activeTab}`;
    if (activeTab === 'reference' && selectedModuleId) hash += `/${selectedModuleId}`;
    else if (activeTab === 'schemas' && selectedSchemaId) hash += `/${selectedSchemaId}`;
    else if (activeTab === 'evidence' && selectedEvidenceId) hash += `/${selectedEvidenceId}`;
    else if (activeTab === 'sources' && selectedSourceId) hash += `/${selectedSourceId}`;
    else if (activeTab === 'adrs' && selectedAdrId) hash += `/${selectedAdrId}`;
    
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash);
    }
  }, [activeTab, selectedModuleId, selectedSchemaId, selectedEvidenceId, selectedSourceId, selectedAdrId]);

  // Global keyboard shortcut for search (Cmd+K, Ctrl+K, or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (tab: TabType, id: string) => {
    setActiveTab(tab);
    if (tab === 'reference') setSelectedModuleId(id);
    else if (tab === 'schemas') setSelectedSchemaId(id);
    else if (tab === 'evidence') setSelectedEvidenceId(id);
    else if (tab === 'sources') setSelectedSourceId(id);
    else if (tab === 'adrs') setSelectedAdrId(id);
  };

  const currentModule = referenceModules.find(m => m.id === selectedModuleId) || referenceModules[0];
  const currentSchema = jsonSchemas.find(s => s.id === selectedSchemaId) || jsonSchemas[0];
  const currentSource = sourceCitations.find(s => s.id === selectedSourceId) || sourceCitations[0];
  const currentAdr = adrRecords.find(a => a.id === selectedAdrId) || adrRecords[0];

  const getSelectedIdForTab = () => {
    switch (activeTab) {
      case 'reference':
        return selectedModuleId;
      case 'schemas':
        return selectedSchemaId;
      case 'evidence':
        return selectedEvidenceId;
      case 'sources':
        return selectedSourceId;
      case 'adrs':
        return selectedAdrId;
      default:
        return '';
    }
  };

  const handleSelectIdForTab = (id: string) => {
    switch (activeTab) {
      case 'reference':
        setSelectedModuleId(id);
        break;
      case 'schemas':
        setSelectedSchemaId(id);
        break;
      case 'evidence':
        setSelectedEvidenceId(id);
        break;
      case 'sources':
        setSelectedSourceId(id);
        break;
      case 'adrs':
        setSelectedAdrId(id);
        break;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-stone-950 text-stone-100 overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        schemaCount={jsonSchemas.length}
        moduleCount={referenceModules.length}
        evidenceCount={evidenceProbes.length}
        sourceCount={sourceCitations.length}
        adrCount={adrRecords.length}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (shown on multi-item tabs) */}
        {activeTab !== 'validation' && activeTab !== 'composed' && activeTab !== 'extensibility' && activeTab !== 'cli' && activeTab !== 'auditor' && (
          <Sidebar
            activeTab={activeTab}
            selectedId={getSelectedIdForTab()}
            onSelect={handleSelectIdForTab}
            modules={referenceModules}
            schemas={jsonSchemas}
            evidence={evidenceProbes}
            sources={sourceCitations}
            adrs={adrRecords}
          />
        )}

        {/* Viewport Content */}
        <main className="flex-1 flex overflow-hidden bg-stone-950">
          <Suspense fallback={<TabFallback />}>
          {activeTab === 'reference' && currentModule && (
            <ReferenceViewer
              module={currentModule}
              allModules={referenceModules}
              onSelectModule={setSelectedModuleId}
              onOpenExtensibilityStudio={() => setActiveTab('extensibility')}
            />
          )}

          {activeTab === 'auditor' && <WorkspaceAuditor />}

          {activeTab === 'extensibility' && <ExtensibilityHub />}

          {activeTab === 'cli' && <CliCheatSheet />}

          {activeTab === 'schemas' && currentSchema && (
            <SchemaExplorer schemaItem={currentSchema} />
          )}

          {activeTab === 'evidence' && (
            <EvidenceMatrix
              probes={evidenceProbes}
              selectedProbeId={selectedEvidenceId}
              onSelectProbe={setSelectedEvidenceId}
              fullEvidenceDoc={evidenceDoc}
              evidenceIndexDoc={evidenceIndexDoc}
              researchReportDoc={researchReportDoc}
            />
          )}

          {activeTab === 'sources' && currentSource && (
            <SourceArchiveViewer
              source={currentSource}
              allSources={sourceCitations}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'adrs' && currentAdr && <AdrViewer adr={currentAdr} />}

          {activeTab === 'validation' && <ValidationConsole />}

          {activeTab === 'composed' && (
            <ComposedDocViewer content={parentComposedDocument} />
          )}
          </Suspense>
        </main>
      </div>

      {/* Global Spotlight Search Modal */}
      <Suspense fallback={null}>
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onNavigate={handleNavigate}
        />
      </Suspense>
    </div>
  );
};
