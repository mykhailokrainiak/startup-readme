'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { formatUAH, addExpense, totals, toCSV } = require('../lib');

test('formatUAH', () => {
  assert.strictEqual(formatUAH(1234.5), '1 234,50 грн');
});

test('addExpense перевіряє суму та категорію', () => {
  assert.throws(() => addExpense([], '-5', 'їжа'));
  assert.throws(() => addExpense([], '10', ''));
  const items = addExpense([], '99,90', 'кава', 'капучино');
  assert.strictEqual(items[0].amount, 99.9);
});

test('totals групує за категоріями', () => {
  let items = addExpense([], 100, 'їжа');
  items = addExpense(items, 50, 'кава');
  items = addExpense(items, 25, 'їжа');
  assert.deepStrictEqual(totals(items), { byCategory: { 'їжа': 125, 'кава': 50 }, total: 175 });
});

test('toCSV екранує коми та лапки', () => {
  const items = addExpense([], 10, 'кава', 'лате, "велике"');
  const csv = toCSV(items).split('\n');
  assert.strictEqual(csv[0], 'id,date,amount,category,note');
  assert.ok(csv[1].endsWith(',10.00,кава,"лате, ""велике"""'));
});
