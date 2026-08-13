import React, { useState, useEffect } from 'react';
import { JsonSchemaItem, JsonValue } from '../types';
import Ajv2020 from 'ajv/dist/2020.js';
import { toErrorMessage } from '../lib/errors';
import { Copy, Check, Play, FileJson, AlertCircle, CheckCircle2, RefreshCw, Download } from 'lucide-react';

interface SchemaExplorerProps {
  schemaItem: JsonSchemaItem;
}

/** The subset of a JSON Schema property object the inspector renders. */
interface SchemaPropDef {
  type?: string;
  enum?: JsonValue[];
  default?: JsonValue;
  description?: string;
}

function schemaProps(schema: JsonSchemaItem['schema']): Record<string, SchemaPropDef> {
  const props = schema.properties;
  return props && typeof props === 'object' && !Array.isArray(props) ? (props as Record<string, SchemaPropDef>) : {};
}

const ajv = new Ajv2020({ allErrors: true, strict: false });

export const SchemaExplorer: React.FC<SchemaExplorerProps> = ({ schemaItem }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'playground' | 'raw'>('visual');
  const [copied, setCopied] = useState(false);
  const [testJson, setTestJson] = useState<string>('{}');
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
  } | null>(null);

  // Generate a valid sample JSON when schemaItem changes
  useEffect(() => {
    generateSamplePayload();
    setValidationResult(null);
  }, [schemaItem.id]);

  const generateSamplePayload = () => {
    const sample: Record<string, JsonValue> = {};
    const props = schemaProps(schemaItem.schema);

    for (const [key, value] of Object.entries(props)) {
      if (value.default !== undefined) {
        sample[key] = value.default;
      } else if (value.enum && value.enum.length > 0) {
        sample[key] = value.enum[0];
      } else if (value.type === 'string') {
        sample[key] = key.includes('name') ? 'sample-agent' : 'sample_value';
      } else if (value.type === 'boolean') {
        sample[key] = true;
      } else if (value.type === 'number' || value.type === 'integer') {
        sample[key] = 100;
      } else if (value.type === 'array') {
        sample[key] = [];
      } else if (value.type === 'object') {
        sample[key] = {};
      }
    }

    setTestJson(JSON.stringify(sample, null, 2));
  };

  const handleValidate = () => {
    try {
      const parsed = JSON.parse(testJson);
      const validate = ajv.compile(schemaItem.schema);
      const valid = validate(parsed);

      if (valid) {
        setValidationResult({
          valid: true,
          errors: [],
        });
      } else {
        const errors = (validate.errors || []).map(
          err => `${err.instancePath ? err.instancePath + ' ' : ''}${err.message || 'Validation error'}`
        );
        setValidationResult({
          valid: false,
          errors,
        });
      }
    } catch (e) {
      setValidationResult({
        valid: false,
        errors: [`JSON Syntax Error: ${toErrorMessage(e)}`],
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(schemaItem.schema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(schemaItem.schema, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', schemaItem.filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const properties = schemaProps(schemaItem.schema);

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto px-6 lg:px-12 py-8 space-y-6 max-w-5xl mx-auto">
      {/* Schema Title & Metadata */}
      <div className="border-b border-stone-800 pb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono font-bold">
              JSON Schema Draft-07/2020
            </span>
            <span className="text-xs text-stone-500 font-mono">{schemaItem.filename}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 text-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Schema'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-stone-400" />
              <span>Download</span>
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">{schemaItem.title}</h2>
        <p className="text-sm text-stone-400 leading-relaxed">{schemaItem.description}</p>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-stone-400 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            <span>{schemaItem.propertiesCount} Top-Level Properties</span>
          </span>
          <span>•</span>
          <span>{schemaItem.requiredFields.length} Required Fields</span>
          {schemaItem.schema.additionalProperties !== undefined && (
            <>
              <span>•</span>
              <span>additionalProperties: {String(schemaItem.schema.additionalProperties)}</span>
            </>
          )}
        </div>
      </div>

      {/* Subtabs for Schema View */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('visual')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'visual'
              ? 'bg-stone-800 text-cyan-300 border border-stone-700 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Properties Inspector
        </button>
        <button
          onClick={() => setActiveTab('playground')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'playground'
              ? 'bg-stone-800 text-cyan-300 border border-stone-700 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Play className="w-3 h-3 text-cyan-400" />
          <span>Interactive Validator</span>
        </button>
        <button
          onClick={() => setActiveTab('raw')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'raw'
              ? 'bg-stone-800 text-cyan-300 border border-stone-700 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Raw Schema JSON
        </button>
      </div>

      {/* Visual Properties Inspector */}
      {activeTab === 'visual' && (
        <div className="space-y-4">
          <div className="border border-stone-800 rounded-xl overflow-hidden bg-stone-900/30">
            <div className="px-4 py-3 bg-stone-900/80 border-b border-stone-800 font-mono text-xs font-semibold text-stone-300 flex items-center justify-between">
              <span>Schema Properties Matrix</span>
              <span className="text-stone-500 font-normal">{schemaItem.filename}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 bg-stone-900/40 text-stone-400 font-mono">
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Default / Enums</th>
                    <th className="py-3 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-mono">
                  {Object.entries(properties).map(([propName, propDef]) => {
                    const isRequired = schemaItem.requiredFields.includes(propName);
                    return (
                      <tr key={propName} className="hover:bg-stone-850/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-cyan-300">
                          {propName}
                        </td>
                        <td className="py-3 px-4 text-stone-300">
                          <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700 text-[11px]">
                            {propDef.type || (propDef.enum ? 'enum' : 'any')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {isRequired ? (
                            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60 text-[10px] font-semibold">
                              REQUIRED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-400 text-[10px]">
                              optional
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-stone-400 max-w-[180px] truncate">
                          {propDef.default !== undefined ? (
                            <code className="text-amber-300 text-[11px]">{JSON.stringify(propDef.default)}</code>
                          ) : propDef.enum ? (
                            <div className="flex flex-wrap gap-1">
                              {propDef.enum.slice(0, 3).map(e => (
                                <span key={String(e)} className="text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.2 rounded">
                                  {String(e)}
                                </span>
                              ))}
                              {propDef.enum.length > 3 && <span className="text-[10px] text-stone-500">+{propDef.enum.length - 3}</span>}
                            </div>
                          ) : (
                            <span className="text-stone-600">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-sans text-stone-300 text-xs leading-relaxed max-w-sm">
                          {propDef.description || 'No description provided.'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Interactive JSON Schema Validator / Playground */}
      {activeTab === 'playground' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-2">
            <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <Play className="w-4 h-4 text-cyan-400" />
              <span>Live Schema Validator</span>
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Test JSON payloads against <strong>{schemaItem.filename}</strong> in real-time. Edit the input JSON below and click <strong>Validate JSON</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* JSON Input Area */}
            <div className="border border-stone-800 rounded-xl overflow-hidden bg-stone-950 flex flex-col">
              <div className="px-4 py-2.5 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-xs font-mono">
                <span className="text-stone-300 font-semibold">Test JSON Payload</span>
                <button
                  onClick={generateSamplePayload}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  title="Reset to generated sample"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Sample</span>
                </button>
              </div>
              <textarea
                value={testJson}
                onChange={e => setTestJson(e.target.value)}
                rows={16}
                className="w-full p-4 bg-transparent font-mono text-xs text-stone-200 focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
              <div className="p-3 bg-stone-900/50 border-t border-stone-800 flex items-center justify-between">
                <span className="text-[11px] text-stone-500 font-mono">AJV In-Memory Engine</span>
                <button
                  onClick={handleValidate}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Validate JSON</span>
                </button>
              </div>
            </div>

            {/* Validation Feedback */}
            <div className="border border-stone-800 rounded-xl overflow-hidden bg-stone-950 flex flex-col">
              <div className="px-4 py-2.5 bg-stone-900 border-b border-stone-800 text-xs font-mono text-stone-300 font-semibold">
                Validation Status & Feedback
              </div>

              <div className="p-6 flex-1 flex flex-col justify-center">
                {validationResult === null ? (
                  <div className="text-center space-y-2 text-stone-500 py-8">
                    <FileJson className="w-10 h-10 mx-auto opacity-40" />
                    <p className="text-xs">Click "Validate JSON" to verify test payload against schema.</p>
                  </div>
                ) : validationResult.valid ? (
                  <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-2 text-emerald-200">
                    <div className="flex items-center gap-2 font-bold text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Schema Validation Passed!</span>
                    </div>
                    <p className="text-xs text-emerald-300/80">
                      The provided JSON payload satisfies all constraints and types in {schemaItem.filename}.
                    </p>
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-rose-950/40 border border-rose-800/60 space-y-3 text-rose-200">
                    <div className="flex items-center gap-2 font-bold text-rose-400">
                      <AlertCircle className="w-5 h-5" />
                      <span>Validation Failed ({validationResult.errors.length} error{validationResult.errors.length > 1 ? 's' : ''})</span>
                    </div>
                    <ul className="space-y-1.5 text-xs font-mono">
                      {validationResult.errors.map((err, idx) => (
                        <li key={idx} className="p-2 rounded bg-rose-950/60 border border-rose-900/60 text-rose-300">
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Raw Schema JSON */}
      {activeTab === 'raw' && (
        <div className="border border-stone-800 rounded-xl overflow-hidden bg-stone-950">
          <div className="px-4 py-2.5 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-xs font-mono text-stone-400">
            <span>{schemaItem.filename}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-stone-300 overflow-x-auto leading-relaxed max-h-[600px]">
            {JSON.stringify(schemaItem.schema, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
