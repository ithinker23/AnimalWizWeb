module.exports = {

    send404: (req,res) => {
        res.sendStatus(404).json({error:"404 NOT FOUND"})
    }

}