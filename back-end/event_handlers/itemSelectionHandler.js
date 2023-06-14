const client = require('../models/dbConnection')
const itemQuerys = require('../models/itemsQuerys')

module.exports = (io, socket, getCeleryID, activeTasks) => {

    socket.on('items:startScraper', async (scraperData) => {
        if (Object.hasOwn(activeTasks, scraperData.scraper)) {
            socket.emit('displayNotif', { scraper: scraperData.scraper, msg: scraperData.scraper + " Scraper Has Already Been Started", Title: "Scraper Failed", isError: true })
        } else {
            socket.emit('displayNotif', { scraper: scraperData.scraper, msg: scraperData.scraper + " Scraper Has Successfully Started", Title: "Scraper Running", isError: false })
            activeTasks[scraperData.scraper] = { taskID: null }
            socket.to(getCeleryID()).emit('startScraper', scraperData)

            client.on('notification', async function (msg) {
                let res = await itemQuerys.getItems(scraperData.scraper, scraperData.pid, "similarity")
                socket.emit('scraperItems', { data: res.rows, seller: scraperData.scraper })
            })
        }
    })

    socket.on('items:mapItem', async (data) => {
        let res = await itemQuerys.updateMappings(data['pid'], data['id'], data['seller'])
        socket.emit('postMappedItem', res)
    })

    socket.on('items:clearMapped', async (data) => {
        await itemQuerys.clearMappings(data['pid'], data['seller'], data['id'])
        socket.emit('postMappedItem', { id: "-1", seller: data['seller'], pid: data['pid'] })
    })

    client.query('LISTEN items_notif')

    socket.on('disconnect', () => {
        client.query('UNLISTEN items_notif')
    })
}