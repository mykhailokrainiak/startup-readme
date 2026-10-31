#!/usr/bin/env node
'use strict';
const { formatUAH, load, save, addExpense, totals } = require('./lib');

const [cmd, ...args] = process.argv.slice(2);

try {
  if (cmd === 'add') {
    const [amount, category, ...note] = args;
    const items = addExpense(load(), amount, category, note.join(' '));
    save(items);
    const last = items[items.length - 1];
    console.log(`✔ Додано #${last.id}: ${formatUAH(last.amount)} — ${last.category}`);
  } else if (cmd === 'list') {
    for (const i of load()) {
      console.log(`#${String(i.id).padEnd(3)} ${i.date}  ${formatUAH(i.amount).padStart(14)}  ${i.category.padEnd(10)} ${i.note}`);
    }
  } else if (cmd === 'stats') {
    const { byCategory, total } = totals(load());
    const max = Math.max(...Object.values(byCategory), 1);
    for (const [c, v] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
      const bar = '█'.repeat(Math.round((v / max) * 20));
      console.log(`${c.padEnd(10)} ${bar.padEnd(20)} ${formatUAH(v)}`);
    }
    console.log(`${'Разом'.padEnd(31)} ${formatUAH(total)}`);
  } else {
    console.log('Копійка — облік витрат у терміналі\n');
    console.log('  kopiyka add <сума> <категорія> [нотатка]');
    console.log('  kopiyka list');
    console.log('  kopiyka stats');
  }
} catch (e) {
  console.error(`✖ ${e.message}`);
  process.exitCode = 1;
}
