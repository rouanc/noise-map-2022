const express = require("express")
const mysql = require("mysql")
const SQL = require("sql-template-strings")
const proj4 = require("proj4")
require("dotenv").config()
const app = express()
const port = 3000

proj4.defs([
  [
    "EPSG:4326",
    "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees",
  ],
  [
    "EPSG:3826",
    "+title=TWD97 TM2+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=公尺 +no_defs",
  ],
])
const EPSG3826 = new proj4.Proj("EPSG:3826")
const EPSG4326 = new proj4.Proj("EPSG:4326")

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_DATABASE,
})

app.use(express.static("public"))

app.get("/shp", function (req, res, next) {
  const data = proj4(EPSG4326, EPSG3826, [
    Number(req.query.lng),
    Number(req.query.lat),
  ])
  console.log(data)
  const query = SQL`SELECT count(*) AS floors_count, no ,AsText(shape) AS coordinate FROM taipei3826 
                    WHERE 
                      ST_intersects(
                        Buffer(GEOMFROMTEXT('POINT(${data[0]} ${data[1]})'), 100),
                        shape
                      )
                      GROUP BY no
                      ORDER BY no ASC;`

  connection.query(query, function (error, results, fields) {
    if (error) throw error
    console.log(results)
    // connected!
    console.log(`lat: ${req.query.lat}, lng: ${req.query.lng}`)
    res.send(`lat: ${req.query.lat}, lng: ${req.query.lng}`)
  })
})

app.listen(port, function () {
  console.log("Express app started on " + port)
})
