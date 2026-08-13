import Ajv2020 from 'ajv/dist/2020.js';
import type { ErrorObject, AnySchemaObject, ValidateFunction } from 'ajv';
import fs from 'fs';
import path from 'path';

// Load all 19 JSON schemas eager-loaded by Vite in browser, or via fs in Node
let rawSchemas: Record<string, unknown> = {};

if (typeof import.meta.glob === 'function') {
  rawSchemas = import.meta.glob('/schemas/*.schema.json', { eager: true });
} else {
  // Node.js fallback
  try {
    const schemasDir = path.resolve('schemas');
    if (fs.existsSync(schemasDir)) {
      const files = fs.readdirSync(schemasDir).filter(f => f.endsWith('.schema.json'));
      for (const file of files) {
        const full = path.join(schemasDir, file);
        rawSchemas[`/schemas/${file}`] = JSON.parse(fs.readFileSync(full, 'utf-8'));
      }
    }
  } catch (e) {
    // Ignore in non-Node environments
  }
}

export interface SchemaValidationResult {
  valid: boolean;
  schemaName: string;
  errors?: string[];
  rawErrors?: ErrorObject[];
}

export interface SchemaDescriptor {
  key: string;
  filename: string;
  title: string;
  category: string;
  schema: AnySchemaObject;
  targetPath: string;
}

const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
});

// Compile cache
const compiledValidators = new Map<string, ValidateFunction>();
export const schemaRegistry = new Map<string, SchemaDescriptor>();

// Initialize registry
for (const [path, rawModule] of Object.entries(rawSchemas)) {
  const mod = rawModule && typeof rawModule === 'object' && 'default' in rawModule ? rawModule.default : rawModule;
  const schema = (mod ?? {}) as AnySchemaObject;
  const filename = path.split('/').pop() || '';
  const key = filename.replace('.schema.json', '');

  const descriptor: SchemaDescriptor = {
    key,
    filename,
    title: schema.title || key,
    category: schema.category || 'Core Config',
    schema,
    targetPath: schema.$id || filename,
  };

  schemaRegistry.set(key, descriptor);
  try {
    const validate = ajv.compile(schema);
    compiledValidators.set(key, validate);
  } catch (err) {
    console.warn(`Failed to compile schema: ${filename}`, err);
  }
}

/**
 * Validate any payload object against one of the 19 Antigravity native schemas.
 */
export function validateAntigravityPayload(schemaKey: string, payload: unknown): SchemaValidationResult {
  const descriptor = schemaRegistry.get(schemaKey);
  if (!descriptor) {
    return {
      valid: false,
      schemaName: schemaKey,
      errors: [`Schema '${schemaKey}' not found in registry. Available keys: ${Array.from(schemaRegistry.keys()).join(', ')}`],
    };
  }

  let validator = compiledValidators.get(schemaKey);
  if (!validator) {
    validator = ajv.compile(descriptor.schema);
    compiledValidators.set(schemaKey, validator);
  }

  const valid = !!validator(payload);

  if (valid) {
    return {
      valid: true,
      schemaName: descriptor.title,
    };
  }

  const errors = (validator.errors || []).map((err: ErrorObject) => {
    const propPath = err.instancePath ? `Field '${err.instancePath.replace(/^\//, '')}'` : 'Root';
    return `${propPath} ${err.message}${err.params ? ` (${JSON.stringify(err.params)})` : ''}`;
  });

  return {
    valid: false,
    schemaName: descriptor.title,
    errors,
    rawErrors: validator.errors || [],
  };
}

/**
 * Get all available schema descriptors
 */
export function getAllSchemas(): SchemaDescriptor[] {
  return Array.from(schemaRegistry.values());
}
