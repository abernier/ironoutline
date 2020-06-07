const os = require('os')
const exec = require('util').promisify(require('child_process').exec)

const csvtojson = require('csvtojson')

const uuid = require('uuid')
const moment = require('moment')

const schedule = require('./schedule')

function isUrl(str) {
  try {
    new URL(str)
  } catch(e) {
    return false;
  }

  return true;
}

const tmpfile = `${os.tmpdir()}/${uuid.v4()}`

module.exports = async function (ftpt, csvUrlOrPath, options={}) {
  if (!ftpt || !csvUrlOrPath) {
    throw new Error('2 arguments required')
  }

  const {start, hollidays} = options;

  let csv;

  if (isUrl(csvUrlOrPath)) {
    await exec(`curl --fail "${csvUrlOrPath}" >${tmpfile}`)
    csv = tmpfile
  } else {
    csv = csvUrlOrPath
  }

  let json = await csvtojson().fromFile(csv);

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

  // filter not active lessons
  json = json.filter(el => el[`${ftpt}_active`] === 'TRUE')

  //
  // filter lessons that are not assigned to seq or vert
  //
  json = json.filter(el => {
    const seq_index = el[`${ftpt}_seq_index`]
    const vert_index = el[`${ftpt}_vert_index`]
    
    return (
      seq_index.length >0 && Number(seq_index) >= 0 // test length because Number("") gives 0
      &&
      vert_index.length >0 && Number(vert_index) >= 0
    )
  })

  //
  // order by sort by [seq_index, vert_index, order] ASC
  //
  json.sort(function (a, b) {
    // see: https://stackoverflow.com/a/2784265/133327

    const seq_index1 = Number(a[`${ftpt}_seq_index`])
    const seq_index2 = Number(b[`${ftpt}_seq_index`])

    const vert_index1 = Number(a[`${ftpt}_vert_index`])
    const vert_index2 = Number(b[`${ftpt}_vert_index`])

    const order1 = Number(a[`${ftpt}_order`])
    const order2 = Number(b[`${ftpt}_order`])
    
    if (seq_index1 < seq_index2) return -1;
    if (seq_index1 > seq_index2) return 1;

    if (vert_index1 < vert_index2) return -1;
    if (vert_index1 > vert_index2) return 1;

    if (order1 < order2) return -1;
    if (order1 > order2) return 1;

    return 0;
  })


  let workingDays = []
  if (start) {
    workingDays = schedule(ftpt, start, hollidays)
  }

  json.forEach((el, i) => {
    const seq = el[`${ftpt}_seq`]
    let vert = el[`${ftpt}_vert`]
    
    seqs[seq] || (seqs[seq] = {})

    if (!(vert in seqs[seq])) {
      seqs[seq][vert] = [];
    }

    const tag = el.tag ? `[${el.tag}] ` : '';

    seqs[seq][vert].push({
      name: `${tag}${el.name}`,
      html: [{
        file: el.file
      }]
    })
  });
  // console.log('seqs', seqs)

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

  let day_index = 0;

  Object.keys(seqs).forEach(k => {
    const o1 = {
      name: k, // 'Tips & Tricks for success'
      sequential: []
    }

    Object.keys(seqs[k]).forEach(l => {
      // Upgrade "Halday X" by "Tue, 18th May" from `workingDays`
      let name;
      if (l.match({ft: /^Day/, pt: /^Halfday/}[ftpt]) && day_index < workingDays.length) {
        const strDate = moment(workingDays[day_index]).format("ddd, MMM Do")
        //console.log(day_index, seq, vert, strDate)

        name = strDate

        day_index++
      }

      const o2 = {
        name: (name || l), // Info tabs
        vertical: []
      }

      seqs[k][l].forEach(o3 => {
        o2.vertical.push(o3)
      })

      o1.sequential.push(o2)
    })

    chapter.push(o1)
  })

  return ret;
}