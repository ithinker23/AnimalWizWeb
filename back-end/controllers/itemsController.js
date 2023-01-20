var itemsQuerys = require('../models/itemsQuerys')

module.exports = {
    getItems: async (req, res) => {
        let items = await itemsQuerys.getItems(req.body.table, req.body.pid, req.body.sortBy)
        res.send(items)
    },

    updateMatches: async (req, res) => {
        try {
            await itemsQuerys.updateMatches(req.body.ids, req.body.matchesDB, req.body.sellers, req.body.prevDB)
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
    },
    getMatches: async (req,res)=>{
        try {
            let result = await itemsQuerys.getMatches(req.body.matchesDB, req.body.sellers, req.body.pricesDB, req.body.prevDB)
            res.status(200).json(result)
        } catch (err) {
            console.log(err)
            res.sendStatus(400)
        }
    },
    updatePrices: async (req,res)=>{
        try {
            await itemsQuerys.updatePrices(req.body.pid, req.body.price, req.body.pricesDB)
            res.status(200)
        } catch (err) {
            console.log(err)
            res.sendStatus(400)
        }
    },

    checkMappingState: async (req,res)=>{
        try {
            let result = await itemsQuerys.checkMappingState(req.body.seller, req.body.pid)
            res.send(result)
        } catch (err) {
            console.log(err)
            res.sendStatus(400)
        }

    }

}