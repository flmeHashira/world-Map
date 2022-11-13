const fs= require('fs')
const express = require('express')
// const cors = require('cors');
const app = express()
const port = 3000

app.use(express.static(__dirname + '/public'))
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.get('/', (req, res) => {
  res.sendFile(__dirname +'/index.html')
})


app.get('/countriesData', (req, res) => {
  console.log("sending countires Data")
  res.sendFile(__dirname+'/countries.geojson')
})

app.get('/timeData', (req, res) => {
  console.log("sending time Data\n")
  res.sendFile(__dirname+'/countries_time')
})



app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

