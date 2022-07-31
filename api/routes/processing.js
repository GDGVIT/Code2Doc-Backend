const router = require('express').Router()
const fs = require('fs')
const PDFDocument = require('pdfkit')
const hljs = require('highlight.js')
const htmlCreator = require('html-creator')
const pdf = require('html-pdf');

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
    
    // fix tab spaces
    line = fixTabSpaces(line)
    // add file text to document
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

// TODO - CLEAN UP
// Test Route for Highlight.jS
router.get('/highlight', (req,res) => {
  
  let html = hljs.highlightAuto('public static void main() { Scanner Sc = new Scanner(System.in)}').value
  console.log(html)
  return res.json({
    status:200,
    val: html
  })
})

// TODO - CLEAN UP
// Test Route for HTML Creator
router.get('/htmlCreate',(req,res) => {

  const html = new htmlCreator();

  // adding required CDN Files
  html.document.addElement({ type: 'head' , content: [{ type: 'link',  attributes:{ rel:'stylesheet',href: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/styles/default.min.css' }}]})
  html.document.addElement({ type: 'body', content: [{type:'script', attributes:{src:'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/highlight.min.js'}}]})
  
  //File Contents
  html.document.addElementToType('body', {type: 'p', content: '<span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-keyword">static</span> <span class="hljs-keyword">void</span> <span class="hljs-title">main</span>()</span> { Scanner Sc = <span class="hljs-keyword">new</span> Scanner(System.<span class="hljs-keyword">in</span>)}'})
  
  //After End of a File
  html.document.addElementToType('body', {type:'br'})
  
  let htmlContent = html.renderHTML();
  console.log(htmlContent);

  fs.writeFile("./public/uploads/"+"index.html", htmlContent, (err) =>{
    if (err) {
      console.error(err);
      return res.json({
        status:400,
        err:err
      })
    }
    return res.json({
      status:200,
      val: htmlContent
    })
  })
})

router.get('/htmlToPdf',(req,res) => {
  let html = fs.readFileSync('./public/uploads/index.html', 'utf8')
  let options = { format: 'Letter' }
  
  pdf.create(html,options).toFile('./public/uploads/output.pdf', (err,data) =>{
    if (err) {
      console.error(err);
      return res.json({
        status:400,
        err:err
      })
    }
    return res.json({
      status:200,
      val: data
    })
  })
})

module.exports = router
