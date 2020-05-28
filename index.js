#!/usr/bin/env node

//
// node index.js pt "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3uDAa59iofq3f6asa9YJoHxjzmuF0s6SoklVTeRkK7RhrZphPF9RhY1epZAgQNVPW7I8nKFjiH9e-/pub?gid=0&single=true&output=csv"
//

const os = require('os')
const exec = require('util').promisify(require('child_process').exec)

const uuid = require('uuid')

const ftpt = process.argv[2] || 'ft'
const csvUrl = process.argv[3] || "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3uDAa59iofq3f6asa9YJoHxjzmuF0s6SoklVTeRkK7RhrZphPF9RhY1epZAgQNVPW7I8nKFjiH9e-/pub?gid=0&single=true&output=csv"
const tmpfile = `${os.tmpdir()}/${uuid.v4()}`

async function main() {
  await exec(`curl --fail "${csvUrl}" >${tmpfile}`)

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
    if (el[`${ftpt}_active`] === 'TRUE') {
      seqs[el[`${ftpt}_seq`]] || (seqs[el[`${ftpt}_seq`]] = {})
      seqs[el[`${ftpt}_seq`]][el[`${ftpt}_vert`]] || (seqs[el[`${ftpt}_seq`]][el[`${ftpt}_vert`]] = [])

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
