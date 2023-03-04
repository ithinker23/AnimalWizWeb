const querys = require('../models/userQuerys.js')

module.exports = {

    authExpress: async (req, res, next) => {
        let isUser = await querys.checkForUser(req.headers.authorization)
        if (isUser) {
            next()
        } else {
            res.sendStatus(404)
        }
    }
}