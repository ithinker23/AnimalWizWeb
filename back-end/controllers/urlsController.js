var UrlQuerys = require('../models/urlQuerys')

module.exports = {
    getSearchUrl: async (req, res) => {
        let url = await UrlQuerys.getSearchUrl(req.body.stores, req.body.searchQuery)
        res.send(url)
    },
}
