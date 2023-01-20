const { query } = require('express');
const client = require('./dbConnection');

function getItems(table, pid, sortBy) {
    var query = "SELECT * FROM " + table + " WHERE pid = " + pid

    if (sortBy != null){
        query += " ORDER BY " + sortBy
    }

    return new Promise((resolve, reject) => {
        client.query(query, (err, res) => {
            if (err) reject(err)
            resolve(res)
        })
    })
}

function updateMatches(ids, matchesDB, sellers, prevDB) {

    var query = "SELECT * FROM " + matchesDB + " WHERE " + prevDB + "=" + ids.pid
    return new Promise((resolve, reject) => {
        client.query(query, (err, res) => {
            if (err) throw (err)
            if (res.rows.length == 0) {
                query = "INSERT INTO " + matchesDB + '('+prevDB+','
                let i = 0
                sellers.forEach((seller) => {

                    query += seller
                    if (sellers.length - 1 != i) {
                        query += ','
                    }
                    i++
                })
                query += ") values (" + ids.pid + ','
                
                i = 0
                sellers.forEach((seller) => {
                    query += ids[seller]
                    if(sellers.length -1 != i)
                    query += ','
                    i++
                })

                query += ')'

                client.query(query, (err, res) => {
                    if (err) throw (err)
                    resolve()
                })
            } else {
                query = "UPDATE " + matchesDB + " SET "
                let i = 0
                sellers.forEach(seller=>{
            
                    query += seller + "=" + ids[seller]

                    if(sellers.length -1 != i){
                        query+= ','
                    }
                    i++
                })
                query += " WHERE " + prevDB + " = " + ids.pid 

                client.query(query, (err, res) => {
                    if (err) throw (err)
                    resolve()
                })
            }
        })
    })
}

function getPidList(table) {
    var query = "SELECT pid FROM " + table + " WHERE title != ''"

    return new Promise((resolve, reject) => {
        client.query(query, (err, res) => {
            if (err) reject(err)
            resolve(res)

        })
    })
}

async function getMatches(matchesDB, sellers, pricesDB, prevDB) {

    let query = "SELECT * FROM " + matchesDB

    let res = await client.query(query)

    let matchesList = []

    for (let i = 0; i < res.rows.length; i++) {

        let match = {}

        for (let seller = 0; seller < sellers.length; seller++) {
            if (res.rows[i][sellers[seller]] === null) {
                match[sellers[seller]] = { price: "Unlisted", seller: sellers[seller] }
            } else {

                query = "SELECT * FROM " + sellers[seller] + " WHERE id = " + res.rows[i][sellers[seller]]

                let sellerRes = await client.query(query)
                match[sellers[seller]] = { price: sellerRes.rows[0].price ? sellerRes.rows[0].price : "Need to check website", seller: sellers[seller] }
            }
        }

        query = "SELECT * FROM " + prevDB + " WHERE pid = " + res.rows[i][prevDB]

        let matchRes = await client.query(query)

        query = "SELECT updated_price FROM " + pricesDB + " WHERE pid = " + res.rows[i][prevDB]

        let priceRes = await client.query(query)

        match[prevDB] = { image_src:matchRes.rows[0].image_src, pid: matchRes.rows[0].pid, title: matchRes.rows[0].title, variantPrice: matchRes.rows[0].variant_price, costPerItem: matchRes.rows[0].cost_per_item, seller: prevDB, updatedPrice: priceRes.rows[0] ? priceRes.rows[0].updated_price : "Not Updated Yet" }

        matchesList.push(match)
    }

    return (matchesList)
}

async function updatePrices(pid, price, pricesDB) {
    let query = "SELECT pid FROM " + pricesDB + " WHERE pid = " + pid
    client.query(query, (err, res) => {
        if (err) throw err
        if (res.rows.length == 0) {
            query = "INSERT INTO " + pricesDB + " (pid, updated_price) VALUES ('" + pid + "', '" + price + "')"
            client.query(query)
        } else {
            query = "UPDATE " + pricesDB + " SET updated_price = " + price + " WHERE pid = " + pid
            client.query(query)
        }
    })
}

function checkMappingState(seller, pid){

    return new Promise( async (resolve, reject) => {
    let query = "SELECT  " + seller + " FROM aw_matches WHERE animal_wiz = " + pid

    try{
        let res = await client.query(query)
        if(res.rows.length > 0){
            if(res.rows[0][seller] == null){
                resolve("Not Mapped")
            }else{
                resolve("Mapped")
            }
        }else{
            resolve("Not Mapped")
        }
    } catch(err){
        reject(err)
    }
})
}
module.exports = { getItems, updateMatches, getPidList, getMatches, updatePrices, checkMappingState }