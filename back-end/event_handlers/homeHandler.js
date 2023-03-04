const itemQuerys = require('../models/itemsQuerys')
const client = require('../models/dbConnection')

module.exports = (io, socket, getCeleryID) => {

    socket.on('stopScraper', data => {
        if (activeTasks[data.scraper] != null) {
            let id = activeTasks[data.scraper].taskID
            if (id != null) {
                socket.to(getCeleryID()).emit('stopScraper', id)
                socket.emit('displayNotif', { scraper: data.scraper, msg: data.scraper + " Scraper Has Been Stopped", Title: "Scraper Stopped", isError: false })

            } else {
                socket.emit('displayNotif', { scraper: data.scraper, msg: data.scraper + " Scraper Is Not Running", Title: "Scraper Stop Failed", isError: true })
            }
        } else {
            socket.emit('displayNotif', { scraper: data.scraper, msg: data.scraper + " Scraper Is Not Running", Title: "Scraper Stop Failed", isError: true })
        }
    })

    socket.on('getSellerHomeData', async (data) => {
        let graphData = {}

        let scraped = await itemQuerys.getscrapedcount(data.seller)
        graphData['foundPids'] = scraped

        let nonscraped = await itemQuerys.getnonscrapedcount(data.seller)
        graphData['nullPids'] = nonscraped

        let mapped = await itemQuerys.getmappedcount(data.seller)
        graphData['mappedPids'] = mapped

        let nullItems = await itemQuerys.getNullItems(data.seller)

        socket.emit('updateSellerHomeInfo', { graphData: graphData, itemData: nullItems, seller: data.seller })

    });

    socket.on('getHomeData', async () => {
        console.log("home connected")

        socket.on('startScraper', async (scraperData) => {
            if (Object.hasOwn(activeTasks, scraperData.scraper)) {
                socket.emit('displayNotif', { scraper: scraperData.scraper, msg: scraperData.scraper + " Scraper Has Already Been Started", Title: "Scraper Failed", isError: true })
            } else {
                socket.emit('displayNotif', { scraper: scraperData.scraper, msg: scraperData.scraper + " Scraper Has Successfully Started", Title: "Scraper Running", isError: false })
                activeTasks[scraperData.scraper] = { taskID: null }
                socket.to(getCeleryID()).emit('startScraper', scraperData)
            }
        })

        client.on('notification', async function (msg) {

            let graphData = {}

            let seller = msg.payload

            let scraped = await itemQuerys.getscrapedcount(seller)
            graphData['foundPids'] = scraped

            let nonscraped = await itemQuerys.getnonscrapedcount(seller)
            graphData['nullPids'] = nonscraped

            let mapped = await itemQuerys.getmappedcount(seller)
            graphData['mappedPids'] = mapped

            let nullItems = await itemQuerys.getNullItems(seller)

            socket.emit('updateSellerHomeInfo', { graphData: graphData, itemData: nullItems, seller: seller })
        })

        client.query('LISTEN items_notif')

        socket.on('disconnect', () => {
            client.query('UNLISTEN items_notif')
        })
    })
}