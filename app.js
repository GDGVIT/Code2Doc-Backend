require('dotenv').config()

const express = require('express')
const cors = require('cors')
const fs = require('fs')
const { v4: uuid4 } = require('uuid')

const uploadRoute = require('./api/routes/upload')
const processingRoute = require('./api/routes/processing')
const serveOutputFileRoute = require('./api/routes/serveOutputFile')
const schedule = require('node-schedule')

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(cors())

app.use('/upload', uploadRoute)
app.use('/process', processingRoute)
app.use('/download', serveOutputFileRoute)

// @TODO - Take Directory Path through Login Token
app.get('/', (req, res) => {
  const uid = uuid4()
  console.log(uid)

  if (!fs.existsSync('./public/uploads/' + uid)) {
    fs.mkdirSync('./public/uploads/' + uid)
  }

  return res.json({
    status: 200,
    message: 'API UP AND RUNNING',
    userId: uid
  })
})

schedule.scheduleJob('59 01 *  * *', () => {
  console.log('Folder Clean Cron Job Started')
  try {
    fs.readdir('./public/uploads/', (err, files) => {
      if (err) {
        console.log(err)
      }
      files.forEach((file) => {
        if (file.toString() !== 'test') {
          console.log(file + 'deleted')
          fs.rmSync('./public/uploads/' + file.toString(), { recursive: true, force: true })
        }
      })
    })
  } catch (e) {
    console.log('ERROR IN CRON JOB:', e)
  }

  console.log('Folder Clean Cron Job Completed')
})

app.listen(process.env.PORT, () => {
  console.log('Listening on Port ' + process.env.PORT)
})
