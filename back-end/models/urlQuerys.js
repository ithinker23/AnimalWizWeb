const client = require('./dbConnection');

function getSearchUrl(storeName, searchQuery){
    var query = "SELECT base_url, search_query FROM animal_wiz_scraper_urls WHERE store_name = '"+ storeName +"'"

    return new Promise((resolve, reject) => {
        client.query(query, (err, res) => {
            if (err) reject(err)
            resolve(res.rows[0].base_url + res.rows[0].search_query + searchQuery)
        })
    })
}

module.exports = {getSearchUrl}