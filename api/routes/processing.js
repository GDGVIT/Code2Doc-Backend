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
            console.log(folder+"/"+file)
            folderFiles.push(folder+"/"+file)
        })

        folderFiles.forEach(file => {
            processLineByLine(file)
        })
        
        return res.json({
            "status":200,
            "message": "getting all file",
            "files": folderFiles
        })
    })

})

function processLineByLine(fileName)
{
    const data = fs.readFileSync(fileName,'UTF-8')

    const lines = data.split(/\r?\n/);

    lines.forEach((line)=>{
        console.log(fileName+": "+line)
    })
}

module.exports = router