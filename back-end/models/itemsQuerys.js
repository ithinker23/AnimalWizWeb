const client = require('./dbConnection');
const config = require('config');
const Parser = require('json2csv').Parser;

module.exports = {
    submitPrice: (price, pid) => {
        query = "UPDATE " + config.get('tables.storeDB') + " SET recommended_price = '" + price + "' WHERE pid = " + pid
        return new Promise((resolve, reject) => {
            client.query(query, (err, res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
    },

    getItems: (table, pid, sortBy) => {
        let query = "SELECT * FROM " + table + " WHERE pid = " + pid

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
            let query = "SELECT COUNT(*) FROM (SELECT distinct pid FROM " + seller + ") as " + seller + "tempScrapedCount"

            client.query(query, (err, res) => {
                if (err) reject(err)

                resolve(res.rows[0].count)
            })
        })


    },

    getnonscrapedcount: (seller) => {
        return new Promise((resolve, reject) => {
            let query = "SELECT COUNT(*) FROM (SELECT aw.pid FROM " + config.get('tables.storeDB') + " aw LEFT JOIN " + seller + " sel ON sel.pid = aw.pid WHERE sel.pid IS NULL and aw.title != '') as " + seller + "tempNonScrapedCount"

            client.query(query, (err, res) => {
                if (err) reject(err)

                resolve(res.rows[0].count)
            })
        })

    },

    getmappedcount: (seller) => {
        return new Promise((resolve, reject) => {
            let query = "SELECT COUNT(*) FROM (SELECT store_name FROM " + config.get('tables.matchesDB') + " WHERE store_name = '" + seller + "' AND id IS NOT NULL AND pid IS NOT NULL) as " + seller + "tempMappedCount"
            client.query(query, (err, res) => {
                if (err) reject(err)
                resolve(res.rows[0].count)
            })
        })
    },

    getNullItems: (seller) => {
        return new Promise((resolve, reject) => {
            let query = "SELECT aw.title FROM " + config.get('tables.storeDB') + " aw LEFT JOIN " + seller + " sel ON sel.pid = aw.pid WHERE sel.pid IS NULL and aw.title != ''"

            client.query(query, (err, res) => {
                if (err) reject(err)

                resolve(res.rows)
            })
        })
    },

    updateMappings: (pid, id, seller) => {
        return new Promise((resolve, reject) => {
            query = "SELECT store_name FROM " + config.get('tables.matchesDB') + " WHERE pid = " + pid + " AND store_name = '" + seller + "'"

            client.query(query, (err, res) => {
                if (err) reject(err)

                if (res.rows.length == 0) {
                    query = "INSERT INTO " + config.get("tables.matchesDB") + "(store_name,pid,id) VALUES ('" + seller + "'," + pid + "," + id + ")"
                    client.query(query, (err, res) => {
                        if (err) reject(err)
                        resolve({ id: id, seller: seller, pid: pid })
                    })
                } else {
                    query = "UPDATE " + config.get("tables.matchesDB") + " SET id = " + id + " WHERE pid = " + pid + " AND store_name = '" + seller + "'"
                    client.query(query, (err, res) => {
                        if (err) reject(err)
                        resolve({ id: id, seller: seller, pid: pid })
                    })
                }
            })
        })
    },

    getPidList: (table) => {
        let query = "SELECT pid FROM " + table + " WHERE title != ''"

        return new Promise((resolve, reject) => {
            client.query(query, (err, res) => {
                if (err) reject(err)
                resolve(res)

            })
        })
    },

    getPrices: async (sellers) => {
        return new Promise((resolve, reject) => {
            let matchList = []

            let query = "SELECT DISTINCT pid FROM " + config.get('tables.matchesDB')

            client.query(query, async (err, pids) => {
                if (err) reject(err)
                if (pids.rows.length == 0) resolve(matchList)

                for (let PIDindex = 0; PIDindex <= pids.rows.length - 1; PIDindex++) {

                    pid = pids.rows[PIDindex].pid
                    query = "SELECT pid,title,image_src,cost_per_item,variant_price,recommended_price,variant_sku,variant_barcode FROM " + config.get('tables.storeDB') + " WHERE pid = " + pid
                    let animalWizRes = await client.query(query)
                    let info = animalWizRes.rows[0]
                    let match = {}
                    match[config.get('tables.storeDB')] = { pid: info.pid, title: info.title, image_src: info.image_src, costPerItem: info.cost_per_item, variantPrice: info.variant_price, recommendedPrice: info.recommended_price, sku:info.variant_sku, barcode:info.variant_barcode}

                    for (let selIndex = 0; selIndex <= sellers.length - 1; selIndex++) {
                        let seller = sellers[selIndex]

                        query = "SELECT id FROM " + config.get('tables.matchesDB') + " WHERE pid = " + pid + " AND store_name = '" + seller + "'"
                        let idRows = await client.query(query)
                        if (idRows.rows.length > 0) {
                            let pricesQuery = "SELECT price,date_stamp FROM " + config.get('tables.pricesDB') + " WHERE pid = " + pid + " AND store_name = '" + seller + "' AND id = " + idRows.rows[0].id + " ORDER BY price_id DESC LIMIT 3"
                            let sellerRes = await client.query(pricesQuery)
                            let urlsQuery = "SELECT p_url FROM " + seller + " WHERE pid = " + pid + " AND id = " + idRows.rows[0].id
                            let urlRes = await client.query(urlsQuery)
                            match[seller] = { seller: seller }
                            match[seller]['price'] = []
                            match[seller]['price'] = sellerRes.rows
                            if(urlRes.rows.length > 0){
                                match[seller]['url'] = urlRes.rows[0].p_url
                            }else{
                                match[seller]['url'] = ""
                            }
                        } else {
                            match[seller] = { seller: seller }
                            match[seller]['price'] = []
                            match[seller]['url'] = null
                        }
                        if (selIndex >= sellers.length - 1) {
                            matchList.push(match)

                            if (PIDindex >= pids.rows.length - 1) {
                                resolve(matchList)
                            }
                        }
                    }
                }
            })
        })
    },

    checkMappingState: (seller, pid) => {

        return new Promise((resolve, reject) => {
            let query = "SELECT id FROM " + config.get('tables.matchesDB') + " WHERE pid = " + pid + " AND store_name = '" + seller + "'"

            client.query(query, (err, res) => {
                if (err) reject(err)

                if (res.rows.length > 0) {
                    resolve(res.rows[0])
                } else {
                    resolve({ id: "-1" })
                }
            })
        })
    },
    clearMappings: (pid, seller, id) => {
        return new Promise((resolve, reject) => {
            let query = "DELETE FROM " + config.get("tables.matchesDB") + " WHERE pid = " + pid + " AND store_name = '" + seller + "' AND id = " + id
            client.query(query, (err, res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
    },
    getMatchesCSV: () => {
        return new Promise((resolve, reject) => {
            let fields = [{
                label: 'First Name',
                value: 'first_name'
            },
            {
                label: 'Last Name',
                value: 'last_name'
            },
            {
                label: 'Email Address',
                value: 'email_address'
            }]

            let data = { first_name: 'ishan', last_name: 'rana', email_address: 'ishansrana320@fafd.com' }
            const json2csv = new Parser({ fields });
            const csv = json2csv.parse(data);
            resolve(csv);
        })
    },

}