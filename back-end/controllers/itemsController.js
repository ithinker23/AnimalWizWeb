var itemsQuerys = require('../models/itemsQuerys')

module.exports = {
    getItems: async (req, res) => {
        let items = await itemsQuerys.getItems(req.body.table, req.body.pid, req.body.sortBy)
        res.send(items)
    },

    getPidList: async (req,res)=>{
        try {
            let result = await itemsQuerys.getPidList(req.body.table)
            res.status(200).json(result)
        } catch (err) {
            res.sendStatus(400)
        }
    },

    checkMappingState: async (req,res)=>{
        try {
            let result = await itemsQuerys.checkMappingState(req.body.seller, req.body.pid)
            res.send(result)
        } catch (err) {
            res.sendStatus(400)
        }

    },
    getMatchesCSV: async (req,res) => {
        try {
            let result = await itemsQuerys.getMatchesCSV(req.body.store)
            res.send(result)
        } catch (err) {
            res.sendStatus(400)
        }
    },

}