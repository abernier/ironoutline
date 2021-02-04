const { parseAsync } = require('json2csv');

async function json2csv(json) {
  //
  // columns headers of the CSV
  //

  const headers = []

  // name|active|seq|vert|seq_index|vert_index|order|active|seq|vert|seq_index|vert_index|order|tag|file
  headers.push('name')
  //jsons.forEach(json => {
    headers.push(`active`)
    headers.push(`seq`)
    headers.push(`vert`)
    headers.push(`seq_index`)
    headers.push(`vert_index`)
    headers.push(`order`)
  //})
  headers.push('tag')
  headers.push('file')
  headers.push('deliverable_display_name')
  headers.push('deliverable_identifier')
  headers.push('deliverable_description')
  headers.push('deliverable_duedate')

  //
  // data
  //

  //const units = {}
  const units = []
  const seqs_verts = {};

  //jsons.forEach(json => {
    seqs_verts[json.name] || (seqs_verts[json.name] = {})

    json.data.course.chapter.forEach(chap => {
      chap.sequential.forEach(seq => {
        seq.vertical.forEach(vert => {
          //const unit = units[vert.name] || (units[vert.name] = {})
          const unit = {}

          // Each column => a prop (initialised to undefined)
          headers.forEach(header => {
            unit[header] = undefined
          })

          // Values from json
          unit["name"] = vert.name
          unit[`active`] = 'TRUE'
          unit[`seq`] = chap.name
          unit[`vert`] = seq.name
          unit[`seq_index`] = null
          unit[`vert_index`] = null
          unit[`order`] = null
          
          // extract tag 'SELF_GUIDED' from name: ex: "[SELF_GUIDED] JS | Numbers as Data Types - Advanced Topics"
          const matches = vert.name.match(/\[([^\]]*)\].*/)
          unit["tag"] = matches && matches[1] || ''

          // html component
          const html = vert.component.find(el => el.type === 'html')
          if (html) {
            unit["file"] = html.file
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
          seqs_verts[json.name][chap.name] || (seqs_verts[json.name][chap.name] = {})
          seqs_verts[json.name][chap.name][seq.name] = 1;
        })
      })
    })
  //})

  //Object.values(units).forEach((unit, i) => {
  units.forEach((unit, i) => {
    //jsons.forEach(json => {
      const seq = unit[`seq`]
      const vert = unit[`vert`]

      if (seq) {
        const seqs = Object.keys(seqs_verts[json.name])
        unit[`seq_index`] = seqs.indexOf(seq)

        if (vert) {
          const verts = Object.keys(seqs_verts[json.name][seq])
          unit[`vert_index`] = verts.indexOf(vert)
        }
      }

      

    //})
  })
 
  const myData = Object.values(units)

  const csv = await parseAsync(myData, {
    fields: headers
  })

  return csv
}

module.exports = json2csv