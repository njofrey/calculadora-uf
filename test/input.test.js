import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeUfInput, parseUfInput } from '../input.js';

test('acepta decimales con coma o punto', () => {
    assert.equal(normalizeUfInput('1,5'), '1,5');
    assert.equal(normalizeUfInput('1.5'), '1,5');
    assert.equal(parseUfInput(normalizeUfInput('1.5')), 1.5);
});

test('conserva el formato chileno con miles', () => {
    assert.equal(normalizeUfInput('1.000,5'), '1.000,5');
    assert.equal(normalizeUfInput('1.000'), '1.000');
    assert.equal(parseUfInput(normalizeUfInput('1.000,5')), 1000.5);
});

test('limpia caracteres inválidos y completa el cero decimal', () => {
    assert.equal(normalizeUfInput('UF 12a,3'), '12,3');
    assert.equal(normalizeUfInput(',5'), '0,5');
});
