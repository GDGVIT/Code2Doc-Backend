require('dotenv').config()

const exp = require('constants')
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const {v4: uuid4} = require('uuid')

const uploadRoute = require('./api/routes/upload')
const processingRoute = require('./api/routes/processing')
const serveOutputFileRoute = require('./api/routes/serveOutputFile')

const app = express()

app.use(express.urlencoded({ extended: true}))
app.use(express.json())

app.use(cors())

app.use('/upload',uploadRoute)
app.use('/process',processingRoute)
app.use('/download',serveOutputFileRoute)

// @TODO - Take Directory Path through Login Token
app.get('/',(req,res)=>{

    const uid = uuid4()
    console.log(uid)

    if(!fs.existsSync("./public/uploads/"+uid))
    {
        fs.mkdirSync("./public/uploads/"+uid)
    }

    return res.json({
        "status": 200,
        "message": "API UP AND RUNNING",
        "userId": uid
    })
})

app.listen(process.env.PORT, ()=>{
    console.log("Listening on Port "+process.env.PORT)
})