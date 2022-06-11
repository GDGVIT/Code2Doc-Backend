const router = require('express').Router()
const fs = require('fs')
const PDFDocument = require('pdfkit')

router.get('/', (req, res) => {
  const folder = './public/uploads/' + req.header('User-Name')
  const folderFiles = []

  if (!fs.existsSync(folder)) {
    return res.status(400).json({
      status: 400,
      message: 'User Folder Not Created Yet'
    })
  }

  // Creating PDF Document
  const doc = new PDFDocument()

  // Piping Output to PDF Document
  doc.pipe(fs.createWriteStream(folder + '/' + 'output.pdf'))

  fs.readdir(folder, (err, files) => {
    if (err) {
      return res.json({
        status: 500,
        message: 'Error in Reading Files'
      })
    }

    files.forEach(file => {
      folderFiles.push(folder + '/' + file)
    })

    folderFiles.forEach(file => {
      processLineByLine(file, doc)
    })

    doc.end()

    return res.json({
      status: 200,
      message: 'processing successful',
      files: folderFiles
    })
  })
})

// Process file and adding to document
function processLineByLine (fileName, doc) {
  let originalFileName = fileName.split('-')
  originalFileName = originalFileName[originalFileName.length - 1]
  doc.text('FILE: ' + originalFileName)
  doc.text('-------------------------------')
  doc.text(' ')

  const data = fs.readFileSync(fileName, 'utf-8')

  const lines = data.split('\r\n')

  lines.forEach((line) => {
    line = fixTabSpaces(line)
    doc.text(line)
  })
  doc.addPage()
}

// Keeps indentation of code
function fixTabSpaces (line) {
  line = line.split('\t')
  let text = ''
  line.forEach(lineItem => {
    if (lineItem === '') { text += '   ' } else { text += lineItem }
  })
  return text
}

module.exports = router
