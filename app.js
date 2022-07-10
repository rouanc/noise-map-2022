const express = require("express")
const connection = require("./connection")
const app = express()
const proj4 = require("proj4")

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//npm install nodemon --save-dev =>當本地資料夾有變動時會自動重啟server 存於devDependencies裡
const PORT = process.env.PORT || 3000
//app.listen是綁定server到某個port上面 which means bind and listen the connection on the specified host and port.
app.listen(PORT, (err) => {
  if (err) {
    console.error("ERROR!")
  }
  console.log("Server started on PORT 3000...")
})

//dotenv 是將 .env 文件中的環境參數加載到 process.env。
//這個檔要建立在最外層資料夾，在其他文件中先引入 require('dotenv').config()
//後只要再呼叫 PROCESS.ENV.[變數名稱] 就能將此環境參數撈出來了
require("dotenv").config()

//在 Express 中提供靜態檔案如果要提供影像、CSS 檔案和 JavaScript 檔案等之類的靜態檔案
//將含有靜態資產的目錄名稱傳遞給 express.static 中介軟體函數，就能直接開始提供檔案。
app.use(express.static("public"))

//定義坐標系epsg3826 to 4326(Cesium designated)
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

//建構函式 (function constructor) 是一個用來創造新物件的函式，需要和 new 運算子一起搭配使用。
//此加入new 運算子的功能是為了呼叫proj4.Proj()時可以傳入參數
const EPSG3826 = new proj4.Proj("EPSG:3826")
const EPSG4326 = new proj4.Proj("EPSG:4326")

//config for your database 配置資料庫

app.get("/shp", function (req, res, next) {
  const data = proj4(EPSG4326, EPSG3826, [
    Number(req.query.lng),
    Number(req.query.lat),
  ])
  // console.log(data)

  //query 語法要注意 跳脫字元 以及${} 的運用
  const query = `
    SELECT fid, no, floors, shape
    FROM \`taipei3826\`
    WHERE ST_Distance(shape, GeomFromText(\'POINT(${data[0]} ${data[1]})\')) <= 100`
  // console.log(query)
  connection.query(query, function (err, results) {
    if (err) throw err
    const czmlData = [
      {
        id: "document",
        name: "polygon",
        version: "1.0",
      },
    ]

    for (const shape of results) {
      const newCzmlArea = {
        id: shape.fid,
        name: "華山文創園區",
        availability: "2022-06-30T12:00:00Z/2022-06-30T17:00:00Z",
        polygon: {
          positions: { cartographicDegrees: [] },
          height: {
            number: (shape.floors - 1) * 3,
          },
          extrudedHeight: {
            number: 3,
          },
        },
      }
      const allPoints = shape.shape[0]
      for (const point of allPoints) {
        const transform = proj4(EPSG3826, EPSG4326, [point.x, point.y])
        newCzmlArea.polygon.positions.cartographicDegrees.push(
          transform[0],
          transform[1],
          0
        )
      }
      czmlData.push(newCzmlArea)
    }

    res.send(czmlData)
  })
})
