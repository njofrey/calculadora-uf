import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { diaEnChile, leerTablaSii } from '../api/uf.js';

const html = readFileSync(new URL('./fixtures/sii-uf2026.htm', import.meta.url), 'utf8');

test('lee el valor del dia desde la tabla del SII', () => {
    assert.equal(leerTablaSii(html, '2026-11-17'), 41350.42);
    assert.equal(leerTablaSii(html, '2026-11-01'), 41252.94);
    assert.equal(leerTablaSii(html, '2026-11-30'), 41439.89);
});

test('no confunde el dia 1 con el 11 o el 21', () => {
    assert.equal(leerTablaSii(html, '2026-11-11'), 41309.19);
    assert.equal(leerTablaSii(html, '2026-11-21'), 41377.93);
});

test('devuelve null si el dia no existe o no tiene valor', () => {
    assert.equal(leerTablaSii(html, '2026-11-31'), null);
    assert.equal(leerTablaSii('<html></html>', '2026-11-17'), null);
});

test('calcula el dia en hora de Chile, no en UTC', () => {
    // 02:00 UTC del 18 nov = 23:00 del 17 nov en Chile (verano, UTC-3).
    assert.equal(diaEnChile(new Date('2026-11-18T02:00:00Z')), '2026-11-17');
});

test('un dia aun no publicado por el SII devuelve null', () => {
    assert.equal(leerTablaSii(html, '2026-12-01'), 41446.78);
    assert.equal(leerTablaSii(html, '2026-12-11'), null);
});
