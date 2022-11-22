const mysql = require("mysql")

const conn = mysql.createConnection({
	host:"localhost",
	user:"root",
	password:"hello",
	database:"users"
})

module.exports = {conn}