module.exports = {

    send404: (req,res) => {
        res.status(404).json({error:"404 NOT FOUND"})
    }

}