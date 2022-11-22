const mysql = require("mysql")

const conn = mysql.createConnection({
	host:"your hostname",
	user:"your username",
	password:"your password",
	database:"your database name"
})

module.exports = {conn}
