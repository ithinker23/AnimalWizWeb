const itemQuerys = require('../models/itemsQuerys')
const client = require('../models/dbConnection')


module.exports = (io, socket, getCeleryID, activeTasks) => {
    socket.on('PO:getData', async (priceOptimData) => {
        let priceOptimSellers = priceOptimData.sellers
        let res = await itemQuerys.getPrices(priceOptimSellers)

        client.query('LISTEN price_notif')

        client.on('notification', async (msg) => {
            console.log(priceOptimSellers + " 2")
            let newRes = await itemQuerys.getPrices(priceOptimSellers)
    
            socket.emit('postPrices', newRes)
        })

        socket.emit('postPrices', res)
    })

    socket.on('PO:startScraper', async (data) => {
        if (Object.hasOwn(activeTasks, 'priceOptimTask')) {
            socket.emit('displayNotif', { scraper: 'priceOptimTask', msg: "Scraper Has Already Been Started", Title: "Scraper Failed", isError: true })
        } else {
            activeTasks['priceOptimTask'] = { taskID: null }
            socket.emit('displayNotif', { scraper: 'priceOptimTask', msg: "Scraper Has Successfully Started", Title: "Scraper Running", isError: false })
            socket.to(getCeleryID()).emit('updatePrices', data.scraperDatas)
        }
    });

    socket.on('disconnect', () => {
        client.query('UNLISTEN price_notif')
    })
}