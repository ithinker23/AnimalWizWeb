const axios = require('axios');

module.exports = {

    scrape: async (req,res) => {
        let response = await axios.post('http://localhost:5002/scrape',{pid:req.body.pid, url:req.body.url, scrapers:req.body.scrapers, mode:req.body.mode})
        res.send(response.data)
    }

}