const {format} = require('util')

const { parseAsync } = require('json2csv');

async function json2csv(json, options={}) {
  const data = json

  const {openlink} = options // "vscode://file//Users/abernier/ironhack/ironhack-web/lessons/modules-1-2-3/%s"

  //
  // columns headers of the CSV
  //

  const headers = []

  // Headers
  headers.push('name')
  headers.push(`active`)
  headers.push(`seq`)
  headers.push(`vert`)
  headers.push(`seq_index`)
  headers.push(`vert_index`)
  headers.push(`order`)
  headers.push('tag')
  headers.push('file')
  headers.push('openlink')
  headers.push('deliverable_display_name')
  headers.push('deliverable_identifier')
  headers.push('deliverable_description')
  headers.push('deliverable_duedate')

  //
  // data
  //

  const units = []
  const seqs_verts = {}

  data.course.chapter.forEach(chap => {
    chap.sequential.forEach(seq => {
      seq.vertical.forEach(vert => {
        //const unit = units[vert.name] || (units[vert.name] = {})
        const unit = {}

        // Each column => a prop (initialised to undefined)
        headers.forEach(header => {
          unit[header] = undefined
        })

        // Values from json
        unit[`seq`] = chap.name
        unit[`vert`] = seq.name
        unit[`seq_index`] = null
        unit[`vert_index`] = null
        unit[`order`] = null
        
        // Extract tag 'SELF_GUIDED' from name: ex: "[SELF_GUIDED] JS | Numbers as Data Types - Advanced Topics"
        const matches = vert.name.match(/^(!?)\s*(\[([^\]]*)\])?\s*(.*)/) // ex: "![LAB] LAB | Thinking in React"
        unit["tag"] = matches && matches[3] || ''
        unit["name"] = matches[4]
        unit[`active`] = matches && matches[1] ? 'FALSE' : 'TRUE' // 'FALSE' if starting with '!'

        // html component
        const html = vert.component.find(el => el.type === 'html')
        if (html) {
          unit["file"] = html.file

          if (openlink && html.file.length) {
            unit["openlink"] = format(openlink, html.file)
          }
        }

        // deliverable component
        const deliverable = vert.component.find(el => el.type === 'deliverable')
        if (deliverable) {
          unit["deliverable_display_name"] = deliverable.display_name || ""
          unit["deliverable_identifier"] = deliverable.deliverable_identifier || ""
          unit["deliverable_description"] = deliverable.deliverable_description || ""
          unit["deliverable_duedate"] = deliverable.deliverable_duedate || ""
        }

        units.push(unit)

        //
        seqs_verts[chap.name] || (seqs_verts[chap.name] = {})
        seqs_verts[chap.name][seq.name] = 1;
      })
    })
  })

  //
  // `seq_index` and `vert_index`
  //

  units.forEach((unit, i) => {
      const seq = unit[`seq`]
      const vert = unit[`vert`]

      if (seq) {
        const seqs = Object.keys(seqs_verts)
        unit[`seq_index`] = seqs.indexOf(seq)

        if (vert) {
          const verts = Object.keys(seqs_verts[seq])
          unit[`vert_index`] = verts.indexOf(vert)
        }
      }
  })

  //
  // CSV
  //
 
  const myData = Object.values(units)

  const csv = await parseAsync(myData, {
    fields: headers
  })

  return csv
}

module.exports = json2csv