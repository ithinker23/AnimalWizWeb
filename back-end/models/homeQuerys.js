const client = require('./dbConnection');

function getGraphData(seller){
    
    return new Promise(async (resolve, reject) => {
        let graphData = {}
        let query = "SELECT COUNT(*) FROM (SELECT DISTINCT pid FROM "+ seller +") as tmp"
            
        try{
            let res = await client.query(query)
            graphData[seller + " foundPids"] = res.rows[0].count
        }catch (err){
            reject(err)
        }

        query = "SELECT count(*) FROM animal_wiz aw LEFT JOIN " + seller + " ch ON ch.pid = aw.pid WHERE ch.pid IS NULL and aw.title != ''"

        try{
            let res = await client.query(query)
            graphData[seller + " nullPids"] = res.rows[0].count
        }catch (err){
            reject(err)
        }

        query = "SELECT count(*) FROM aw_matches WHERE " + seller + " is not null"

        try{
            let res = await client.query(query)
            graphData[seller + " mappedPids"] = res.rows[0].count
        }catch (err){
            reject(err)
        }
        resolve(graphData)
    });
}

function getItemData(seller){
    
    return new Promise(async (resolve, reject) => {
        query = "SELECT aw.title FROM animal_wiz aw LEFT JOIN " + seller + " ch ON ch.pid = aw.pid WHERE ch.pid IS NULL and aw.title != ''"

        try{
            let res = await client.query(query)
            resolve(res.rows)
        }catch (err){
            reject(err)
        }
    });
}

module.exports = {getGraphData, getItemData}