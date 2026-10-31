'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const NBSP = ' ';
const DB = process.env.KOPIYKA_FILE || path.join(os.homedir(), '.kopiyka.json');

function formatUAH(amount) {
  const [int, frac] = Math.abs(amount).toFixed(2).split('.');
  const sign = amount < 0 ? '-' : '';
  return `${sign}${int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)},${frac}${NBSP}грн`;
}

function load(file = DB) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
}

function save(items, file = DB) {
  fs.writeFileSync(file, JSON.stringify(items, null, 2));
}

function addExpense(items, amount, category, note = '') {
  const value = Number(String(amount).replace(',', '.'));
  if (!Number.isFinite(value) || value <= 0) throw new Error('Сума має бути додатним числом');
  if (!category) throw new Error('Вкажіть категорію');
  const item = { id: items.length + 1, date: new Date().toISOString().slice(0, 10), amount: value, category, note };
  return [...items, item];
}

function totals(items) {
  const byCategory = {};
  for (const i of items) byCategory[i.category] = (byCategory[i.category] || 0) + i.amount;
  const total = items.reduce((s, i) => s + i.amount, 0);
  return { byCategory, total };
}

function toCSV(items) {
  const esc = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const rows = items.map((i) => [i.id, i.date, i.amount.toFixed(2), i.category, i.note].map(esc).join(','));
  return ['id,date,amount,category,note', ...rows].join('\n') + '\n';
}

module.exports = { formatUAH, load, save, addExpense, totals, toCSV, DB };
