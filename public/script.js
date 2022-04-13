function getCoord() {
  const val = document.getElementById("address").value
  fetch("http://geocoding.geohealth.tw/position.php", {
    method: "POST",
    body: new URLSearchParams({
      addr: val,
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res)
      if (!res.lat || !res.lng) {
        alert("查無此地！請重新輸入完整地址！")
        return
      } else {
        fetch(
          "./shp?" +
            new URLSearchParams({
              lng: res.lng,
              lat: res.lat,
            })
        ).then((shpRes) => console.log(shpRes))

        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            res.lng,
            res.lat - 0.008,
            300
          ),
          orientation: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-20.0),
          },
        })
      }
    })
}

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4N2RkY2M3Ny00MTA2LTRmNjMtYjBkNS04NDdhNmVlMTBmZDQiLCJpZCI6NDcyNzcsImlhdCI6MTYxNzAzMTkzNn0.nQKrfRXx4K7qz8_FWBnS7EfE7Uj8Jhm49ReO508KGrc"

const viewer = new Cesium.Viewer("cesiumContainer", {
  baseLayerPicker: true,
  vrButton: true,
  geocoder: false,
  navigationHelpButton: false,
  selectionIndicator: true,
  shadows: false,
  showOutline: true,
  timeline: false,
  sceneModePicker: true,
})
//處理選單字串
function loadArea(select) {
  console.log(select.value)
  let path
  switch (select.value) {
    case "central":
      path = "./3Dtiles/central/tileset.json"
      break
    case "east":
      path = "./3Dtiles/east/tileset.json"
      break
    case "south":
      path = "./3Dtiles/south/tileset.json"
      break
    case "west":
      path = "./3Dtiles/west/tileset.json"
      break
    case "north":
      path = "./3Dtiles/north/tileset.json"
      break
    case "xitun":
      path = "./3Dtiles/xitun/tileset.json"
      break
    case "nantun":
      path = "./3Dtiles/nantun/tileset.json"
      break
    case "beitun":
      path = "./3Dtiles/beitun/tileset.json"
      break
    default:
      break
  }

  const tileset = new Cesium.Cesium3DTileset({
    name: "taichung",
    url: path,
  })

  viewer.scene.primitives.add(tileset)
  viewer.flyTo(tileset)
  tileset.style = new Cesium.Cesium3DTileStyle({
    show: "${floors}>=0",
    color: {
      conditions: [
        ["${floors} >= 40", "rgb(26,152,80)"],
        ["${floors} >= 30", "rgb(102,189,99)"],
        ["${floors} >= 25", "rgb(166,217,106)"],
        ["${floors} >= 20", "rgb(217,239,139)"],
        ["${floors} >= 15", "rgb(254,224,139)"],
        ["${floors} >= 10", "rgb(253,174,97)"],
        ["${floors} >= 5", "rgb(245,92,0)"],
        ["true", "rgba(255,97,85,0.5)"],
      ],
    },
  })
}
