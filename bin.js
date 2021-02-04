#!/usr/bin/env node

const {readFileSync} = require('fs')
const {resolve, basename, extname} = require('path')

const {csv2json, json2csv} = require('./index.js')

var argv = require('minimist')(process.argv.slice(2));
// console.log(argv);

function help() {
  const man = readFileSync(resolve(__dirname, './man.txt'), {encoding: 'utf-8'});
  console.log(man);
}

// --help
if (argv.help) {
  help()
  process.exit(0);
}

//
// parsing arguments depending on command
//

const command = argv._[0]
if (command === 'csv2json') {
  //
  // npx ironoutline csv2json pt outline.csv --tzid=Europe/Paris --start=2020-06-02 --hollidays=2020-06-20,2020-07-04,2020-07-14,2020-08-11,2020-08-13,2020-08-15,2020-08-18,2020-08-20,2020-08-22,2020-09-19,2020-10-17,2020-11-10,2020-11-21
  //
  // or (in dev mode)
  //
  // node --inspect-brk bin.js csv2json pt outline.csv --tzid=Europe/Paris --start=2020-06-02 --hollidays=2020-06-20,2020-07-04,2020-07-14,2020-08-11,2020-08-13,2020-08-15,2020-08-18,2020-08-20,2020-08-22,2020-09-19,2020-10-17,2020-11-10,2020-11-21
  //

  const ftpt = argv._[1] || 'ft'
  const csvUrlOrPath = argv._[2] || "https://docs.google.com/spreadsheets/d/e/2PACX-1vSPb9g-3UgLBIrjBekCEppZ7k733mCQehR9S3OZBxafwQEuXsxkAzC4VkSzOStT6b0Dc851CyLUOc2i/pub?gid=0&single=true&output=csv"
  const start = argv.start
  const hollidays = argv.hollidays && argv.hollidays.split(',')

  csv2json(ftpt, csvUrlOrPath, {start, hollidays}).then(ret => {
    console.log(JSON.stringify(ret, null, 4))
  }).catch(err => {
    console.error(err)
    process.exit(1);
  })
} else if (command === 'json2csv') {
  //
  // npx ironoutline json2csv ft.json
  //
  // or (in dev mode)
  //
  // node --inspect-brk bin.js json2csv ft.json
  //

  // 'ft.json' => {name: 'ft', data: {...}}
  const filepath = resolve(process.cwd(), argv._[1]);

  const json = {
    name: basename(filepath, extname(filepath)),
    data: JSON.parse(readFileSync(filepath, {encoding: 'utf-8'}))
  }

  json2csv(json).then(ret => {
    console.log(ret)
  }).catch(err => {
    console.error(err)
    process.exit(1);
  })

} else {
  help()
  process.exit(0);
}






