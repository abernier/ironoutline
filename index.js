#!/usr/bin/env node

//
// ./bin/mdyaml pt https://docs.google.com/spreadsheets/d/e/2PACX-1vTj9crFXFRl9MjP5ibW7210C-cmkdPI1EgzQK1rTYN0SMFpSGe0piWtf40H3S-LDtPVfbYnaDOpvW_N/pub?output=csv
//

const exec = require('util').promisify(require('child_process').exec)

const ftpt = process.argv[2] || 'ft'
const csvUrl = process.argv[3] || "https://docs.google.com/spreadsheets/d/e/2PACX-1vTj9crFXFRl9MjP5ibW7210C-cmkdPI1EgzQK1rTYN0SMFpSGe0piWtf40H3S-LDtPVfbYnaDOpvW_N/pub?output=csv"
const tmpfile = `/tmp/foo.csv`

async function main() {
  await exec(`curl ${csvUrl} >${tmpfile}`)

  const {stdout, stderr} = await exec(`npx csvtojson ${tmpfile}`)
  //console.log(stdout);

  let json = JSON.parse(stdout);
  //console.log(json, null, 4)

  const chapter = []

  const ret = {
    "course": {
      "name": (ftpt === 'ft' ? "WDFT" : "WDPT"),
      "number": "MASTER",
      "version": "5.0",
      "chapter": chapter
    }
  };

  //
  // 1st pass
  //

  /*
  {
    'Week 1': {
      'Day 1': [
        {name: '', html: {file: ''}}
      ]
    }
  }
  */

  const seqs = {};
  json.forEach(el => {
    seqs[el[`${ftpt}_seq`]] || (seqs[el[`${ftpt}_seq`]] = {})
    seqs[el[`${ftpt}_seq`]][el[`${ftpt}_vert`]] || (seqs[el[`${ftpt}_seq`]][el[`${ftpt}_vert`]] = [])

    if (el.active === 'TRUE') {
      seqs[el[`${ftpt}_seq`]][el[`${ftpt}_vert`]].push({
        name: el.name,
        html: [{
          file: el.file
        }]
      })
    }
    
  });
  //console.log('seqs', seqs)

  //
  // 2nd pass
  //

  /*
  [
    {
      name: 'Week 1',
      sequential: [
        {
          name: 'Day 1',
          vertical: [
            {name: '', html: [{file: ''}]}
          ]
        }
      ]
    }
  ]
  */

  Object.keys(seqs).forEach(k => {
    const o1 = {
      name: k, // 'Tips & Tricks for success'
      sequential: []
    }

    Object.keys(seqs[k]).forEach(l => {
      const o2 = {
        name: l, // Info tabs
        vertical: []
      }

      seqs[k][l].forEach(o3 => {
        o2.vertical.push(o3)
      })

      o1.sequential.push(o2)
    })

    chapter.push(o1)
  })

  console.log(JSON.stringify(ret, null, 4))
}

main().catch(err => {
  console.error(err)
  process.exit(1);
})
