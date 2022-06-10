const router = require('express').Router()
const fs = require('fs')
const multer = require('multer')

// Storage Declaration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads/' + req.header('User-Name'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname
    cb(null, uniqueSuffix)
  }
})

// Filter for Files to Upload
function fileFilter (req, file, cb) {
  const formats = req.header('File-Format')
  const formatArray = formats.split(',')
  if (formatArray.includes(file.originalname.split('.')[1])) { cb(null, true) } else { cb(null, false) }
}

const upload = multer({ storage: storage, fileFilter: fileFilter })

router.get('/', (req, res) => {
  return res.json({
    status: 200,
    message: 'Upload Endpoint Working'
  })
})

// EndPoint to Upload File
router.post('/uploadFiles', upload.array('files'), (req, res) => {
  return res.send(req.files)
})

// Clears the Upload Folder of the Client
router.delete('/clearFolder', (req, res) => {
  fs.rmSync('./public/uploads/' + req.header('User-Name'), { recursive: true, force: true })
  return res.json({
    status: 200,
    message: 'folder cleared'
  })
})
module.exports = router
