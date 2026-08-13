import fs from 'fs';
import path from 'path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import type { AnySchemaObject } from 'ajv';

interface TestFixture {
  schemaKey: string;
  fixturePath: string;
  expectedValid: boolean;
  name: string;
}

const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
});
// Register standard format validators (uri, email, etc.) so schema `format`
// keywords actually validate instead of being silently ignored.
addFormats(ajv);

const SCHEMAS_DIR = path.resolve('schemas');
const FIXTURES_DIR = path.resolve('test/fixtures');

// Load schemas into Ajv
const schemas = new Map<string, AnySchemaObject>();
const schemaFiles = fs.readdirSync(SCHEMAS_DIR).filter(f => f.endsWith('.schema.json'));

for (const file of schemaFiles) {
  const key = file.replace('.schema.json', '');
  const schemaContent = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, file), 'utf-8'));
  schemas.set(key, schemaContent);
}

function findFixtures(dir: string): TestFixture[] {
  const fixtures: TestFixture[] = [];
  if (!fs.existsSync(dir)) return fixtures;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const schemaKey = entry.name;
      const fixtureFiles = fs.readdirSync(fullPath).filter(f => f.endsWith('.json'));
      for (const f of fixtureFiles) {
        const isInvalid = f.startsWith('invalid');
        fixtures.push({
          schemaKey,
          fixturePath: path.join(fullPath, f),
          expectedValid: !isInvalid,
          name: `${schemaKey}/${f}`,
        });
      }
    }
  }
  return fixtures;
}

export function runSchemaTests(): boolean {
  console.log('\x1b[1m=== Antigravity JSON Schema Test Suite ===\x1b[0m\n');
  const fixtures = findFixtures(FIXTURES_DIR);

  if (fixtures.length === 0) {
    console.error('\x1b[31m[FAIL] No test fixtures found in test/fixtures/\x1b[0m');
    return false;
  }

  let passed = 0;
  let failed = 0;

  for (const fixture of fixtures) {
    const schema = schemas.get(fixture.schemaKey);
    if (!schema) {
      console.error(`\x1b[31m[ERROR]\x1b[0m Unknown schema key for fixture: ${fixture.name}`);
      failed++;
      continue;
    }

    const payload = JSON.parse(fs.readFileSync(fixture.fixturePath, 'utf-8'));
    const validator = ajv.compile(schema);
    const valid = !!validator(payload);

    if (valid === fixture.expectedValid) {
      passed++;
      const tag = fixture.expectedValid ? '\x1b[32m[PASS: VALID]\x1b[0m' : '\x1b[33m[PASS: REJECTED]\x1b[0m';
      console.log(`  ${tag} ${fixture.name}`);
    } else {
      failed++;
      const tag = '\x1b[31m[FAIL]\x1b[0m';
      console.error(`  ${tag} ${fixture.name} (Expected valid=${fixture.expectedValid}, Got valid=${valid})`);
      if (validator.errors) {
        console.error(`    Ajv Errors:`, validator.errors.map(e => `${e.instancePath || 'root'}: ${e.message}`));
      }
    }
  }

  console.log(`\n\x1b[1mSummary:\x1b[0m ${passed} passed, ${failed} failed (${fixtures.length} total fixtures)\n`);
  return failed === 0;
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = runSchemaTests();
  process.exit(success ? 0 : 1);
}
