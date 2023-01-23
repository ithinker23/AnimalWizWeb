const client = require('./dbConnection');
const config = require('config');

module.exports = {

    getItems : (table, pid, sortBy) => {
    var query = "SELECT * FROM " + table + " WHERE pid = " + pid

    if (sortBy != null) {
        query += " ORDER BY " + sortBy
    }

    return new Promise((resolve, reject) => {
        client.query(query, (err, res) => {
            if (err) reject(err)
            resolve(res)
        })
    })
},

getscrapedcount: (seller) => {
    return new Promise((resolve, reject) => {
        let query = "SELECT COUNT(*) FROM (SELECT distinct pid FROM " + seller + ") as temp"

        client.query(query, (err, res) => {
            if (err) reject(err)

            resolve(res.rows[0].count)
        })
    })


},

getnonscrapedcount: (seller) =>  {
    return new Promise((resolve, reject) => {
        let query = "SELECT COUNT(*) FROM (SELECT aw.pid FROM animal_wiz aw LEFT JOIN " + seller + " sel ON sel.pid = aw.pid WHERE sel.pid IS NULL and aw.title != '') as temp"

        client.query(query, (err, res) => {
            if (err) reject(err)

            resolve(res.rows[0].count)
        })
    })

},

getmappedcount : (seller) => {
    return new Promise((resolve, reject) => {
        let query = "SELECT COUNT(*) FROM (SELECT " + seller + " FROM aw_matches WHERE " + seller + " is not null) as temp"

        client.query(query, (err, res) => {
            if (err) reject(err)

            resolve(res.rows[0].count)
        })
    })

},

getNullItems: (seller) => {
    return new Promise((resolve, reject) => {
        let query = "SELECT aw.title FROM animal_wiz aw LEFT JOIN " + seller + " sel ON sel.pid = aw.pid WHERE sel.pid IS NULL and aw.title != ''"

        client.query(query, (err, res) => {
            if (err) reject(err)

            resolve(res.rows)
        })
    })
},

updateMatches: (pid, id, seller) =>  {
    query = "SELECT "

    client.query(query)

},

getPidList : (table) =>  {
    var query = "SELECT pid FROM " + table + " WHERE title != ''"

    return new Promise((resolve, reject) => {
        client.query(query, (err, res) => {
            if (err) reject(err)
            resolve(res)

        })
    })
},

getMatches: async (sellers, store_name) =>  {

    let query = "SELECT * FROM " + config.get('tables.matchesDB')

    let res = await client.query(query)

    let matchesList = []

    for (let i = 0; i < res.rows.length; i++) {

        let match = {}

        sellers.forEach(async (seller) =>{
            if (res.rows[i][seller] === null) {
                match[seller] = { price: "Unlisted", seller: seller }
            } else {

                query = "SELECT * FROM " + seller + " WHERE id = " + res.rows[i][seller]

                let sellerRes = await client.query(query)
                match[seller] = { price: sellerRes.rows[0].price ? sellerRes.rows[0].price : "Need to check website", seller: seller }
            }
        })

        query = "SELECT * FROM " + store_name + " WHERE pid = " + res.rows[i][store_name]

        let matchRes = await client.query(query)

        match[store_name] = { image_src: matchRes.rows[0].image_src, pid: matchRes.rows[0].pid, title: matchRes.rows[0].title, variantPrice: matchRes.rows[0].variant_price, costPerItem: matchRes.rows[0].cost_per_item, seller: store_name}

        matchesList.push(match)
    }

    return (matchesList)
},

checkMappingState: (seller, pid) =>  {

    return new Promise(async (resolve, reject) => {
        let query = "SELECT  " + seller + " FROM aw_matches WHERE animal_wiz = " + pid

        try {
            let res = await client.query(query)
            if (res.rows.length > 0) {
                if (res.rows[0][seller] == null) {
                    resolve("-1")
                } else {
                    resolve(String(res.rows[0][seller]))
                }
            } else {
                resolve("-1")
            }
        } catch (err) {
            reject(err)
        }
    })
}
}