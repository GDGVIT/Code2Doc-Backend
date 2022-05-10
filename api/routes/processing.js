const router = require('express').Router()
const fs = require('fs')

router.get('/',(req,res)=>{
    const folder = './public/uploads/'+req.header('User-Name')
    var folderFiles =[]

    fs.readdir(folder,(err,files) => {
        
        if(err)
        {
            return res.json({
                "status":500,
                "message": "Error in Reading Files"
            })
        }

        files.forEach(file => {
            console.log(file)
            folderFiles.push(file)
        })
        
        return res.json({
            "status":200,
            "message": "getting all file",
            "files": folderFiles
        })
    })

})

module.exports = router