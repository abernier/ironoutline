#!/usr/bin/env node
const os = require("os");
const exec = require("util").promisify(require("child_process").exec);
const { readFileSync } = require("fs");
const { resolve } = require("path");
const readline = require("readline");

const uuid = require("uuid");
const yaml = require("js-yaml");

const { csv2json, json2csv } = require("./index.js");

var argv = require("minimist")(process.argv.slice(2));
// console.log('argv', argv);

function help() {
  const man = readFileSync(resolve(__dirname, "./man.txt"), {
    encoding: "utf-8",
  });
  console.log(man);
}

// --help
if (argv.help) {
  help();
  process.exit(0);
}

function readStdin() {
  //
  // resolve with text when stdin ends
  //

  return new Promise(function (resolve, reject) {
    let ret = "";

    //
    // stdin > ret variable
    //
    process.stdin.setEncoding("utf8");
    process.stdin.on("readable", () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        ret += chunk;
      }
    });
    process.stdin.on("end", () => {
      resolve(ret);
    });

    var rl = readline.createInterface({
      input: process.stdin,
      prompt: "",
    });

    rl.prompt();
  });
}

function isUrl(str) {
  try {
    new URL(str);
  } catch (e) {
    return false;
  }

  return true;
}

async function main(command) {
  //
  // parsing arguments depending on command
  //

  if (command === "csv2json") {
    //
    // node --inspect-brk bin.js csv2json pt --tzid=Europe/Paris --start=2021-02-16 --hollidays=2021-04-03,2021-05-01,2021-05-08,2021-05-13 -- wdpt202102par.csv
    //

    const ftpt = argv._[1] || "ft";
    let csvUrlOrPath = argv._[2] || "-";
    const tzid = argv.tzid;
    const start = argv.start;
    const hollidays = argv.hollidays && argv.hollidays.split(",");

    //
    // If `csvUrlOrPath` is a URL => dump it to a local file
    //

    if (isUrl(csvUrlOrPath)) {
      const tmpfile = `${os.tmpdir()}/${uuid.v4()}`;

      await exec(`curl -L --silent --fail "${csvUrlOrPath}" >${tmpfile}`);
      csvUrlOrPath = tmpfile; // local file becomes `csvUrlOrPath`
    }

    //
    // csv text
    //
    // Either from stdin, or from file
    //

    let csv;
    if (csvUrlOrPath === "-") {
      csv = await readStdin();
    } else {
      csv = readFileSync(csvUrlOrPath, { encoding: "utf-8" });
    }

    // Outputs
    const ret = await csv2json(ftpt, csv, { tzid, start, hollidays });

    // yaml support
    if (argv.yaml) {
      console.log(yaml.dump(ret));
    } else {
      console.log(JSON.stringify(ret, null, 4));
    }
  } else if (command === "json2csv") {
    //
    // node --inspect-brk bin.js json2csv --openlink=vscode://file//Users/abernier/ironhack/ironhack-web/lessons/modules-1-2-3/%s -- wdpt202102par.json
    //

    let jsonUrlOrPath = argv._[1] || "-";

    //
    // If `csvUrlOrPath` is a URL => dump it to a local file
    //

    if (isUrl(jsonUrlOrPath)) {
      const tmpfile = `${os.tmpdir()}/${uuid.v4()}`;

      await exec(`curl -L --silent --fail "${jsonUrlOrPath}" >${tmpfile}`);
      jsonUrlOrPath = tmpfile; // local file becomes `jsonUrlOrPath`
    }

    //
    // json text
    //
    // Either from stdin, or from file
    //

    let rawtext;
    if (jsonUrlOrPath === "-") {
      rawtext = await readStdin();
    } else {
      rawtext = readFileSync(jsonUrlOrPath, { encoding: "utf-8" });
    }

    // yaml support
    if (
      argv.yaml ||
      jsonUrlOrPath.endsWith(".yaml") ||
      jsonUrlOrPath.endsWith(".yml")
    ) {
      const o = yaml.load(rawtext);
      rawtext = JSON.stringify(o);
    }

    const json = JSON.parse(rawtext);

    // Outputs
    const ret = await json2csv(json, {
      openlink: argv.openlink,
    });
    console.log(ret);
  } else {
    help();
    process.exit(0);
  }
}

// Run
const command = argv._[0];
main(command).catch((err) => {
  console.error(err);
  process.exit(1);
});
