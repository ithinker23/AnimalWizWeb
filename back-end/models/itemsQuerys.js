const client = require('./dbConnection');

function getItems(table, pid) {
    var query = "SELECT * FROM " + table + " WHERE pid = " + pid
    console.log("SENDING DATA, query: " + query)
    return new Promise((resolve, reject) => {
        client.query(query, (err, res) => {
            if (err) reject(err)
            resolve(res)
        })
    })
}

function updateMatches(ids, matchesDB) {
    var query = "SELECT * FROM " + matchesDB + " WHERE aw_pid=" + ids.pid
    return new Promise((resolve, reject) => {
    client.query(query, (err, res) => {
        if (err) throw(err)
        if (res.rows.length == 0) {
            query = "INSERT INTO " + matchesDB + " (aw_pid, az_id ,ch_id) values (" + ids.pid + ", " + ids.amazon + ", " + ids.chewy + ")"
            client.query(query, (err, res) => {
                if (err) throw(err)
                resolve()
            })
        } else {
            query = "UPDATE " + matchesDB + " SET az_id=" + ids.amazon + ", ch_id=" + ids.chewy + " WHERE aw_pid=" + ids.pid + ""
            client.query(query, (err, res) => {
                if (err) throw(err)
                resolve()
            })
        }
    })
})
}

function getPidList(table){
    var query = "SELECT pid FROM " + table + " WHERE title != ''"
    return new Promise((resolve, reject) => {
        client.query(query, (err,res) =>{
            if (err) reject(err)
            resolve(res)

        })
    })
}

module.exports = { getItems, updateMatches, getPidList }