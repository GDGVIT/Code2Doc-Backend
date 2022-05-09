const router = require('express').Router()
const multer = require('multer')

var storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'./public/uploads')
    },
    filename: (req,file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
})

const upload = multer({storage: storage})

router.get('/',(req,res)=>{
    res.send("Uploads Endpoint")
})

router.post('/testUpload',upload.single('file'),(req,res) =>{
    console.log('storage location is ', req.hostname +'/' + req.file.path);
    return res.send(req.file); 
})

module.exports = router