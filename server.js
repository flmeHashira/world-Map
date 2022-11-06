const express = require('express')
const cors = require('cors');
const app = express()
const port = 3000

app.use(express.static(__dirname + '/public'))
app.use(cors());
app.get('/', (req, res) => {
  res.sendFile(__dirname +'/index.html')
})


app.get('/countriesData', (req, res) => {
  console.log("sending countires Data")
  res.sendFile(__dirname+'/countries.geojson')
})

app.get('/timeData', (req, res) => {
  console.log("sending time Data\n")
  res.sendFile(__dirname+'/countriesdata.json')
})



app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

