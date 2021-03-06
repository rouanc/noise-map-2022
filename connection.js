const mysql = require("mysql")
require("dotenv").config()

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_DATABASE,
})

connection.connect((err) => {
  if (!err) {
    console.log("Connected!")
  } else {
    console.log(err)
  }
})

module.exports = connection
