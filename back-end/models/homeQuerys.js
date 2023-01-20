const client = require('./dbConnection');

function getGraphData(tables){
    
    return new Promise((resolve, reject) => {
        let graphData = {}
        tables.forEach(async (seller,index) => {
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

            if(index >= tables.length - 1){ 
                resolve(graphData)
            }
        });
    })

}
function getItemData(tables){
    
    return new Promise((resolve, reject) => {
        let itemData = {}
        tables.forEach(async (seller,index) => {

            query = "SELECT aw.title FROM animal_wiz aw LEFT JOIN " + seller + " ch ON ch.pid = aw.pid WHERE ch.pid IS NULL and aw.title != ''"

            try{
                let res = await client.query(query)
                itemData[seller + " nullPids"] = res.rows
            }catch (err){
                reject(err)
            }

            if(index >= tables.length - 1){ 
                resolve(itemData)
            }
        });
    })

}
module.exports = {getGraphData, getItemData}