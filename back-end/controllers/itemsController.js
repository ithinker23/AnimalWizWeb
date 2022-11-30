var itemsQuerys = require('../models/itemsQuerys')

module.exports = {
    getItems: async (req, res) => {
        let items = await itemsQuerys.getItems(req.body.table, req.body.pid)
        res.send(items)
    },

    updateMatches: async (req, res) => {
        try {
            await itemsQuerys.updateMatches(req.body.ids, req.body.matchesDB)
            res.sendStatus(200)
        } catch (err) {
            console.log(err)
            res.sendStatus(400)
        }
    },
    getPidList: async (req,res)=>{
        try {
            let result = await itemsQuerys.getPidList(req.body.table)
            res.status(200).json(result)
        } catch (err) {
            console.log(err)
            res.sendStatus(400)
        }
    }
}