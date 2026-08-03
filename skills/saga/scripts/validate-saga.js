#!/usr/bin/env node
/**
 * validate-saga.js — validates project.saga.json against
 * references/saga.schema.json using a small hand-rolled validator.
 *
 * Deliberately dependency-free (no ajv) so this runs with plain Node and
 * doesn't require `npm install` before the skill's last step can execute.
 * It supports the subset of JSON Schema draft-07 actually used by
 * saga.schema.json: type, required, properties, items, enum, minItems,
 * minimum, minLength. That is a real limitation — this is not a general
 * JSON Schema validator — but it is enough to catch the mistakes that
 * actually happen when an LLM assembles this file (missing required field,
 * wrong confidence enum value, empty narration array, etc).
 *
 * Usage:
 *   node scripts/validate-saga.js <project.saga.json> [schema.json]
 * Exit code 0 = valid, 1 = invalid (errors printed to stderr).
 */
'use strict';
const fs = require('fs');
const path = require('path');

function validate(data, schema, pointer, errors) {
  if (schema.type) {
    const actual = Array.isArray(data) ? 'array' : typeof data;
    const expected = schema.type;
    const ok =
      (expected === 'integer' && Number.isInteger(data)) ||
      (expected === 'number' && actual === 'number') ||
      expected === actual;
    if (!ok) {
      errors.push(`${pointer}: expected type "${expected}", got "${actual}"`);
      return; // type mismatch makes deeper checks meaningless
    }
  }

  if (schema.enum && !schema.enum.includes(data)) {
    errors.push(`${pointer}: value ${JSON.stringify(data)} not in enum ${JSON.stringify(schema.enum)}`);
  }

  if (typeof data === 'string') {
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      errors.push(`${pointer}: string shorter than minLength ${schema.minLength}`);
    }
  }

  if (typeof data === 'number') {
    if (schema.minimum !== undefined && data < schema.minimum) {
      errors.push(`${pointer}: ${data} is below minimum ${schema.minimum}`);
    }
  }

  if (Array.isArray(data)) {
    if (schema.minItems !== undefined && data.length < schema.minItems) {
      errors.push(`${pointer}: array has ${data.length} items, needs at least ${schema.minItems}`);
    }
    if (schema.items) {
      data.forEach((item, i) => validate(item, schema.items, `${pointer}[${i}]`, errors));
    }
  }

  if (schema.type === 'object' || (data && typeof data === 'object' && !Array.isArray(data) && schema.properties)) {
    for (const req of schema.required || []) {
      if (!(req in data)) {
        errors.push(`${pointer}: missing required property "${req}"`);
      }
    }
    for (const [key, subSchema] of Object.entries(schema.properties || {})) {
      if (key in data) {
        validate(data[key], subSchema, `${pointer}.${key}`, errors);
      }
    }
  }
}

function main() {
  const dataFile = process.argv[2];
  const schemaFile = process.argv[3] || path.join(__dirname, '..', 'references', 'saga.schema.json');

  if (!dataFile) {
    console.error('usage: node validate-saga.js <project.saga.json> [schema.json]');
    process.exit(2);
  }

  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const schema = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));

  const errors = [];
  validate(data, schema, '$', errors);

  if (errors.length) {
    console.error(`✗ ${dataFile} failed validation (${errors.length} issue${errors.length > 1 ? 's' : ''}):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(`✓ ${dataFile} is valid against ${path.basename(schemaFile)}`);
}

main();
