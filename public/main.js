
let geojson;
let hash = new Map();
let countriesList =[];
const countryInput = document.querySelector('#textbox');


const map = L.map("map", {
    maxZoom: 4,
     zoomControl: false 
}).setView([20.5937, 78.9629], 4);

//Data Handling
async function sendXhrRequest(url, cFunction) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        cFunction(xhr.response);
    };
    xhr.open("GET", url, true);
    xhr.send();
}

sendXhrRequest("http://localhost:3000/countriesData", setGeoLayer); //GET country data
sendXhrRequest("http://localhost:3000/timeData", timeData);

function setGeoLayer(data) {
    const countriesData = JSON.parse(data);
    geojson = L.geoJson(countriesData, {
        style: style,
        onEachFeature: onEachFeature,
    }).addTo(map);
}

function timeData(data) {
    const timeData = JSON.parse(data);
    timeData.forEach((data) => {
        hash.set(data.name, data.timezone_offset)
        countriesList.push(data.name);
    })
    // console.log(countriesList)
}


//Map Styling
function getColor() {
    
}


function style(feature) {
    return {
        fillColor: "#808080",
        weight: 2,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.7,
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: "#666",
        dashArray: "",
        fillOpacity: 0.7,
    });

    layer.bringToFront();
}
function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature,
    });
}


//Auto Complete 
function autocompleteMatch(input) {
    if (input == '') {
      return [];
    }
    let reg = new RegExp(input)
    return search_terms.filter(function(term) {
        if (term.match(reg)) {
          return term;
        }
    });
  }

countryInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        document.querySelector('.leaflet-pane').style.filter=null;
        document.querySelector('.backfiller').remove();
    }
});


window.onload = () => {
    document.querySelector('.leaflet-pane').style.filter= 'blur(1.5px)'
}