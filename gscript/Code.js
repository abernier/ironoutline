//
// Dependents lists
//
// see: https://www.youtube.com/watch?time_continue=1&v=s-I8Z4nTDak&feature=emb_logo
//

const unitsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("units");

const seqvertSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("seqvert");
/*
[ [ 'Tips & tricks for success', 'Info tabs', 'Module 1', 'Module 2', 'Module 3', '', '' ],
  [ 'Week 1', 'Day 1', 'Day 2', 'Day 2', 'Day 3', 'Day 4', 'Day 5' ],
  [ 'Week 2', 'Day 1', 'Day 2', 'Day 2', 'Day 3', 'Day 4', 'Day 5' ],
  [ 'Week 3', 'Day 1', 'Day 2', 'Day 2', 'Day 3', 'Day 4', 'Day 5' ],
  [ 'Week 4', 'Day 1', 'Day 2', 'Day 2', 'Day 3', 'Day 4', 'Day 5' ],
  [ 'Week 5', 'Day 1', 'Day 2', 'Day 2', 'Day 3', 'Day 4', 'Day 5' ],
  [ 'Week 6', 'Day 1', 'Day 2', 'Day 2', 'Day 3', 'Day 4', 'Day 5' ],
  [ 'Week 7', 'Day 1', 'Day 2', 'Day 2', 'Day 3', 'Day 4', 'Day 5' ],
  [ 'Week 8', 'Day 1', 'Day 2', 'Day 2', 'Day 3', 'Day 4', 'Day 5' ],
  [ 'Week 9', 'Day 1', 'Day 2', 'Day 2', 'Day 3', 'Day 4', 'Day 5' ] ]
*/
const datas = seqvertSheet.getRange(1, 1, seqvertSheet.getLastRow(), seqvertSheet.getLastColumn()).getValues()

const $active = SpreadsheetApp.getActiveSpreadsheet().getRangeByName('active')
const $seq = SpreadsheetApp.getActiveSpreadsheet().getRangeByName('seq')
const $vert = SpreadsheetApp.getActiveSpreadsheet().getRangeByName('vert')
const $seq_index = SpreadsheetApp.getActiveSpreadsheet().getRangeByName('seq_index')
const $vert_index = SpreadsheetApp.getActiveSpreadsheet().getRangeByName('vert_index')

active_col = $active.getColumn()
seq_col = $seq.getColumn()
seq_index_col = $seq_index.getColumn()
vert_col = $vert.getColumn()
vert_index_col = $vert_index.getColumn()

const $ft = [$active, $seq, $vert, $seq_index, $vert_index] // all $ft_*


function alert(msg) {
  SpreadsheetApp.getUi().alert(msg)
}

function forEachRangeCell(range, f) {
  // https://stackoverflow.com/a/13605524/133327
  
  const numRows = range.getNumRows();
  const numCols = range.getNumColumns();
  //console.log('numRows', numRows)
  //console.log('numCols', numCols)
  
  for (let i = 1; i <= numCols; i++) {
    for (let j = 1; j <= numRows; j++) {
      const cell = range.getCell(j,i)
      
      f(cell)
    }
  }
}

function findSeqs(datas) {
  const ret = [];
  
  for (let i = 0; i < datas.length; i++) {
    ret.push(datas[i][0]) // only the title
  }
  
  return ret;
}
function findVerts(seq, datas) {
  for (let i = 0; i < datas.length; i++) {
    if (datas[i][0] === seq) {
      return [i, datas[i].slice(1)] // not the title
    }
  }
  
  return [undefined, []]
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function update() {
  let seqRange;
  
  // seq range: all the cells of 4th column
  seqRange = unitsSheet.getRange($seq.getRow()+1, $seq.getColumn(), unitsSheet.getLastRow()-$seq.getRow(), 1) // 1+1, 6, 258-1, 1
  //console.log('seqRange', seqRange.getValues())

  forEachRangeCell(seqRange, function (cell) {
    const $active = unitsSheet.getRange(cell.getRow(), active_col) // same cell line in the $active column;
    const $seq = unitsSheet.getRange(cell.getRow(), seq_col) // same cell line in the $seq column;
    const $seq_index = unitsSheet.getRange(cell.getRow(), seq_index_col) // same cell line in the $seq_index column
    const $vert = unitsSheet.getRange(cell.getRow(), vert_col); // same cell line in the $vert column
    const $vert_index = unitsSheet.getRange(cell.getRow(), vert_index_col); // same cell line in the $vert_index column
    
    //
    // Update seq
    //
    
    let seq_index;
    
    {
      const val = $seq.getValue()
      //console.log('cell', val)
      
      //
      // update validation
      //
      
      const seqs = findSeqs(datas)
      //console.log('seqs',seqs)
      
      applyValidationToCell(seqs, $seq)
      
      //
      // update index
      //
      
      seq_index = seqs.indexOf(val);
      $seq_index.setValue(seq_index);
    }
    
    //
    // Update vert
    //
    
    {
      const val = $vert.getValue()
      //console.log('cell', val)
      
      //
      // update validation
      //
      
      const seq = $seq.getValue()
      //console.log('seq', seq)
      
      const [i, verts] = findVerts(seq, datas)
      //console.log('verts',verts)
      
      applyValidationToCell(verts, $vert)
      
      //
      // update index
      //
      
      const vert_index = verts.indexOf(val);
      $vert_index.setValue(vert_index);
      
      //
      // Update bg
      //
      
      const rgb = HSVtoRGB((seq_index+1)/(datas.length+1),(vert_index+1)/(datas[0].length+1-1),1);
      //alert(`${rgb.r} ${rgb.g} ${rgb.b}`)
      for (let $cell of [$active, $seq, $seq_index, $vert, $vert_index]) {
        $cell.setBackgroundRGB(rgb.r, rgb.g, rgb.b)
      }
    }
    
  });
}

function sort() {
  const seq_index_col = $seq_index.getColumn()
  const vert_index_col = $vert_index.getColumn()
  
  // https://stackoverflow.com/a/35563828/133327
  unitsSheet.getRange($seq_index.getRow()+1, 1, unitsSheet.getLastRow()-$seq_index.getRow(), unitsSheet.getLastColumn()).sort([
    {column: seq_index_col},
    {column: vert_index_col}
  ]);
}


function replaceAllCellsWithCSV(csvstr) {
  //Logger.log('doSomething', csvstr);
  
  let csvarr = Utilities.parseCsv(csvstr);
  csvarr = csvarr.slice(1) // remove header
  Logger.log('csvarr', csvarr.length);
  
  // Really speed-up trick: before clearing things, delete all rows except 1
  unitsSheet.deleteRows($vert.getRow()+2, unitsSheet.getMaxRows()-2)
  
  const row = $vert.getRow()+1
  const col = 1
  const numRows = unitsSheet.getMaxRows()-$vert.getRow() // 4-1
  const numCols = unitsSheet.getMaxColumns()
  
  //
  // Because inserting new rows copy some style + validation, we need to remove them before
  //
  
  // clear bg for ft_* cells
  for (let $el of $ft) {
    forEachRangeCell(unitsSheet.getRange(row, $el.getColumn(), numRows, 1), function (cell) {
      cell.setBackground(null)
    })
  }
  
  // clear validation for ft_seq + ft_vert cells
  for (let $el of [$seq, $vert]) {
    forEachRangeCell(unitsSheet.getRange(row, $el.getColumn(), numRows, 1), function (cell) {
      cell.clearDataValidations()
    })
  }
  
  //
  //
  //
  
  // Insert new rows
  unitsSheet.insertRowsAfter(unitsSheet.getMaxRows(), csvarr.length - numRows)
  
  // Replace all values with CSV ones
  unitsSheet.getRange(row, col, csvarr.length, numCols).setValues(csvarr)
  
  return csvarr; // pass the arr to the client (might be useful)
}

function importCSV() {
  var html = HtmlService.createHtmlOutputFromFile('importcsv');
  SpreadsheetApp.getUi().showModalDialog(html, 'Import CSV');
}

function onOpen(e) {
  //alert('onOpen')
  
  //
  // see: https://developers.google.com/apps-script/guides/menus
  //
  SpreadsheetApp.getUi() // Or DocumentApp, SlidesApp, or FormApp.
      .createMenu('Ironoutline')
      .addItem('Sort', 'sort')
      .addSeparator()
      .addItem('Import CSV', 'importCSV')
      .addItem('Update (long)', 'update')
      .addToUi();
}

function onEdit(e) {
  // console.log('onEdit', e)
  //return;;;
  
  const range = e.range;
  
  const row = range.getRow();
  const col = range.getColumn();
  //alert(`(${col},${row})`)
  
  const activeSheet = range.getSheet();
  const activeSheetName = activeSheet.getName();
  
  //
  // "seq" columns edits
  //
  
  if (activeSheetName === "units" && col === $seq.getColumn() && row > 1) {
    //alert('coucou')
    
    forEachRangeCell(range, function (cell) {
      const val = cell.getValue();
    
      const $active = unitsSheet.getRange(cell.getRow(), active_col) // same cell line in the $active column;
      const $seq = unitsSheet.getRange(cell.getRow(), seq_col) // same cell line in the $seq column;
      const $seq_index = unitsSheet.getRange(cell.getRow(), seq_index_col) // same cell line in the $seq_index column
      const $vert = unitsSheet.getRange(cell.getRow(), vert_col); // same cell line in the $vert column
      const $vert_index = unitsSheet.getRange(cell.getRow(), vert_index_col); // same cell line in the $vert_index column
      
      if (val === "") {
        $seq_index.clearContent()
        
        $vert.clearContent()
        $vert.clearDataValidations()
        
        $vert_index.clearContent()
      } else {
        console.log('datas', datas);
        
        const [i, verts] = findVerts(val, datas) // [2, ['Day 1', 'Day 2', ...] ]
        $vert.clearContent()
        applyValidationToCell(verts, $vert)
        
        $seq_index.setValue(i)
        $vert_index.clearContent()
      }
      
      // bg color
      for (let $cell of [$active, $seq, $seq_index, $vert, $vert_index]) {
        $cell.setBackground(null)
      }
    })
    
  }
  
  //
  // "vert" columns edits
  //
  
  if (activeSheetName === "units" && col === $vert.getColumn() && row > 1) {
    //alert('coucou2')
    
    forEachRangeCell(range, function (cell) {
      const val = cell.getValue();
      
      const $active = unitsSheet.getRange(cell.getRow(), active_col) // same cell line in the $active column;
      const $seq = unitsSheet.getRange(cell.getRow(), seq_col) // same cell line in the $seq column;
      const $seq_index = unitsSheet.getRange(cell.getRow(), seq_index_col) // same cell line in the $seq_index column
      const $vert = unitsSheet.getRange(cell.getRow(), vert_col); // same cell line in the $vert column
      const $vert_index = unitsSheet.getRange(cell.getRow(), vert_index_col); // same cell line in the $vert_index column
      
      if (val === "") {
        $vert_index.clearContent()
        for (let $cell of [$active, $seq, $seq_index, $vert, $vert_index]) {
          $cell.setBackground(null)
        }
      } else {
        console.log('datas', datas);
        
        const seq_index = Number($seq_index.getValue())
      
        const vert_index = datas[seq_index].indexOf(val) - 1;
        $vert_index.setValue(vert_index);
        
        //alert(`${datas.length} ${datas[0].length}`)
        const rgb = HSVtoRGB((seq_index+1)/(datas.length+1),(vert_index+1)/(datas[0].length+1-1),1);
        //alert(`${rgb.r} ${rgb.g} ${rgb.b}`)
        for (let $cell of [$active, $seq, $seq_index, $vert, $vert_index]) {
          $cell.setBackgroundRGB(rgb.r, rgb.g, rgb.b)
        }
      }
    })
  }
  
  //alert(activeSheet.getLastRow())
  //if (activeSheetName === "ft" && col > 1 && row <= activeSheet.getLastRow()) {
  //  alert('coucou')
  //}
}

function applyValidationToCell(list, cell) {
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(list).setAllowInvalid(false).build()
  
  cell.setDataValidation(rule);
}