#!/usr/bin/env node

const {readFileSync} = require('fs')
const {resolve} = require('path')

const main = require('./index.js')

var argv = require('minimist')(process.argv.slice(2));
// console.log(argv);

const ftpt = argv._[0] || 'ft'
const csvUrlOrPath = argv._[1] || "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3uDAa59iofq3f6asa9YJoHxjzmuF0s6SoklVTeRkK7RhrZphPF9RhY1epZAgQNVPW7I8nKFjiH9e-/pub?gid=0&single=true&output=csv"
const start = argv.start
const hollidays = argv.hollidays && argv.hollidays.split(',')
const help = argv.help

const man = readFileSync(resolve(__dirname, './man.txt'), {encoding: 'utf-8'});
if (help) {
  console.log(man);
  process.exit(0);
}

main(ftpt, csvUrlOrPath, {start, hollidays}).then(ret => {
  console.log(JSON.stringify(ret, null, 4))
}).catch(err => {
  console.error(err)
  process.exit(1);
})
