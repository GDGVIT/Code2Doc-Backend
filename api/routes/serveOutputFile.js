const router = require('express').Router()

router.get('/',(req,res)=>{
    const folder = './public/uploads/'+req.header('User-Name')

    var options = {
        root: folder
    }

    res.sendFile("output.pdf",options, (err) =>{
        if(err)
        {
            console.log(err)
        }
        else
        {
            console.log('Sent: File');
        }
    })
})

module.exports = router