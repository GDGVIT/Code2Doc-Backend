const router = require('express').Router()
const fs = require('fs')

router.get('/', (req, res) => {
  const folder = './public/uploads/' + req.header('User-Name')

  const options = {
    root: folder
  }

  if (!fs.existsSync(folder + '/output.pdf')) {
    return res.status(400).json({
      status: 400,
      message: 'Output File Not Available Yet'
    })
  }

  res.sendFile('output.pdf', options, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log('Sent: File')
    }
  })
})

module.exports = router
