require('dotenv').config()

const exp = require('constants')
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const uploadRoute = require('./api/routes/upload')

const app = express()

app.use(express.urlencoded({ extended: true}))
app.use(express.json())

app.use(cors())

app.use('/upload',uploadRoute)

app.get('/',(req,res)=>{
    res.json({
        "status": 200,
        "message": "API UP AND RUNNING"
    })
})

app.listen(process.env.PORT, ()=>{
    console.log("Listening on Port "+process.env.PORT)
})