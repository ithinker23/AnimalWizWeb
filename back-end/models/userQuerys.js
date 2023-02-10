const client = require('./dbConnection');
const config = require('config');
const jwt = require('jsonwebtoken');

module.exports = {
    signUp: async (username, password, sellers) => {
        sellers = sellers.map((seller) => seller.toLowerCase())
        let query = "SELECT user_id FROM " + config.get('tables.users') + " WHERE store_name = '" + username + "'"
        let existingUser = await client.query(query)
        if (existingUser.rows.length == 0) {
            query = "INSERT INTO " + config.get('tables.users') + "(store_name, password, sellers) VALUES ('" + username + "','" + password + "','{" + sellers + "}')"
            await client.query(query)
            return true
        }else{
            return false
        }
    },

    login: async (username, password) => {
        let query = "SELECT user_id,sellers FROM " + config.get('tables.users') + " WHERE store_name = '" + username + "' AND password = '" + password + "'"
        let existingUser = await client.query(query)
        if (existingUser.rows.length > 0) {
            return {successful:true, jwtToken: jwt.sign({username:username}, config.get('auth.token'), { expiresIn: '24h' })}
        }else{
            return {successful:true}
        }
    }
}