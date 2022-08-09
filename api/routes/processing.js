const router = require('express').Router()
const fs = require('fs')
const PDFDocument = require('pdfkit')
const hljs = require('highlight.js')
const htmlCreator = require('html-creator')
const pdf = require('html-pdf')
const e = require('express')

// Obselete Route
router.get('/obselete', (req, res) => {
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

// New Processing Route
router.get('/', (req, res) => {
  const folder = './public/uploads/' + req.header('User-Name')
  const folderFiles = []

  if (!fs.existsSync(folder)) {
    return res.status(400).json({
      status: 400,
      message: 'User Folder Not Created Yet'
    })
  }

  // Creating HTML Document
  const html = new htmlCreator()

  // adding required CDN Files
  html.document.addElement({ type: 'head', content: [{ type: 'link', attributes: { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/styles/default.min.css' } }] })
  html.document.addElement({ type: 'body', content: [{ type: 'script', attributes: { src: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/highlight.min.js' } }] })

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
      processLineByLine(file, html)
    })

    // Rendering Final HTML
    const htmlContent = html.renderHTML()

    fs.writeFile(folder + '/index.html', htmlContent, (err) => {
      if (err) {
        console.error(err)
        return res.json({
          status: 400,
          err: err
        })
      }

      const htmlFile = fs.readFileSync(folder + '/index.html', 'utf8')

      const options = { format: 'Letter' }

      pdf.create(htmlFile, options).toFile(folder + '/output.pdf', (err, data) => {
        if (err) {
          console.error(err)
          return res.json({
            status: 400,
            err: err
          })
        }
        return res.json({
          status: 200,
          message: 'processing successful',
          files: folderFiles,
          data: data
        })
      })
    })
  })
})

// Process file and adding to document
function processLineByLine (fileName, html) {
  let originalFileName = fileName.split('-')
  originalFileName = originalFileName[originalFileName.length - 1]
  // Start of a File
  html.document.addElementToType('body', { type: 'br' })

  // Put Name of File
  html.document.addElementToType('body', { type: 'h1', content: originalFileName })
  html.document.addElementToType('body', { type: 'hr' })

  const data = fs.readFileSync(fileName, 'utf-8')
  const lines = data.split('\r\n')

  lines.forEach((line) => {

    // replace 4 spaces for tab
    let line2 = line.split('    ')
    let text2 = ''
    line2.forEach(item =>{
      if(item === '') {text2 += '\t'} else { text2 += item}
    })

    // fix tab spaces
    let htmlContent = hljs.highlightAuto(text2).value
    htmlContent = fixTabSpaces(htmlContent)
    // File Contents
    html.document.addElementToType('body', { type: 'p', attributes: { style: 'padding-left: 1rem;font-family: monospace, monospace;' }, content: htmlContent })
  })
}

// Keeps indentation of code
function fixTabSpaces (line) {
  line = line.split('\t')
  let text = ''
  line.forEach(lineItem => {
    if (lineItem === '') { text += '&emsp; ' } else { text += lineItem }
  })
  return text
}

module.exports = router
