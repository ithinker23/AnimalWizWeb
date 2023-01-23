const client = require('./dbConnection');
const config = require('config');

function getSearchUrl(stores, searchQuerys) {
    return new Promise((resolve, reject) => {
        let urls = {}
        stores.forEach(async (seller, index) => {
            var query = "SELECT base_url, search_query FROM " + config.get('tables.urlsDB') + " WHERE store_name = '" + seller + "'"
            try {
                let res = await client.query(query)
                urls[seller] = res.rows[0].base_url + res.rows[0].search_query + searchQuerys.replaceAll(/[\W_]+/g, " ")
            } catch (err) {
                reject(err)
            }

            if (index >= stores.length - 1) {
                resolve(urls)
            }
        });
    })
}

module.exports = { getSearchUrl }