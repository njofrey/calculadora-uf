import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_UF, normalizeUfInput, parseUfInput } from '../input.js';

test('acepta decimales solo con coma explícita', () => {
    assert.equal(normalizeUfInput('1,5'), '1,5');
    assert.equal(parseUfInput(normalizeUfInput('1,5')), 1.5);
});

test('permite escribir cifras grandes tecla por tecla con puntos automáticos o manuales', () => {
    for (const [typed, expected, amount] of [
        ['14700', '14.700', 14700],
        ['17.000', '17.000', 17000],
        ['970000', '970.000', 970000],
        ['14700,5', '14.700,5', 14700.5]
    ]) {
        let displayed = '';
        for (const key of typed) displayed = normalizeUfInput(displayed + key);
        assert.equal(displayed, expected);
        assert.equal(parseUfInput(displayed), amount);
        assert.equal(normalizeUfInput(typed), expected);
    }
});

test('permite borrar un dígito de una cifra con miles sin crear decimales', () => {
    assert.equal(normalizeUfInput('14.70'), '1.470');
    assert.equal(normalizeUfInput('1.47'), '147');
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

test('limita cantidades absurdamente grandes', () => {
    assert.equal(normalizeUfInput('17.000.000.000.00'), '1.000.000');
    assert.equal(normalizeUfInput('17.000.000.000,5'), '1.000.000,5');
    assert.equal(parseUfInput(normalizeUfInput('17.000.000.000.00')), MAX_UF);
});
