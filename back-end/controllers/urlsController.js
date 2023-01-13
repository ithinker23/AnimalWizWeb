var UrlQuerys = require('../models/urlQuerys')

module.exports = {
    getSearchUrl: async (req, res) => {
        let url = await UrlQuerys.getSearchUrl(req.body.storeName, req.body.searchQuery)
        console.log(url)
        res.send(url)
    },
}
