
let geoJsonData, timeData;
let geojson;
let hash = new Map();
let countriesList = [];
const maps ={};
let origin_time;

async function sendXhrRequest(url, cFunction) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        cFunction(xhr.response);
    };
    xhr.open("GET", url, true);
    xhr.send();
}

sendXhrRequest("http://localhost:3000/timeData", timeDataHandle)
sendXhrRequest("http://localhost:3000/countriesData", (data) => {
    geoJsonData = JSON.parse(data);
});

function timeDataHandle(data) {
    timeData = JSON.parse(data);
    console.log(timeData[2])
    timeData.forEach((data) => {
        hash.set(data.name, data.timezone_offset)
        countriesList.push(data.name);
    })
}

function createMap(coord)   {
    let coordArr= coord.split(',');
    maps[0] = L.map("map", {
        maxZoom: 4,
        zoomControl: false,
        zoomSnap: 0.5
    }).setView([coordArr[0], coordArr[1]], 4);
    setGeoLayer()
}
function setGeoLayer() {
    geojson = L.geoJson(geoJsonData, {
        style: style,
        onEachFeature: onEachFeature,
    }).addTo(maps[0]);
}

//Offset Calculate
function offset(origin, number)   {
    if(!Number.isInteger(origin) && Number.isInteger(origin))
        return origin+number-0.6+1;
    else
        return origin+number;
}

//Map Styling
function getColor(country) {
    const obj = timeData.find(o => o.name === country)
    if (typeof obj === 'undefined')
        return '#0808';
    let localTime= obj.timezone_offset;
    let d = offset(origin_time, localTime)
    console.log(obj)
    return d > 11 ? '#800026' :
           d > 9 && d<=10  ? '#BD0026' :
           d >8  && d<=9  ? '#E31A1C' :
           d >7  && d<=8  ? '#FC4E2A' :
           d >6  && d<=7   ? '#FD8D3C' :
           d >3  && d<=6   ? '#FEB24C' :
           d >1  && d<=3   ? '#FED976' :
                      '#FFEDA0';

}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.ADMIN),
        weight: 2,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.7,
    };
}

function highlightFeature(e) {
    let layer = e.target;
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
    maps[0].fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature,
    });
}


//Auto Complete 
const countryInput = document.querySelector('#textbox');
const resList = document.querySelector('.autocompleteList');

function autocompleteMatch(input) {
    if (input == '') {
        return [];
    }
    return countriesList.filter((term) => {
        if (term.toLowerCase().includes(input.toLowerCase()))
            return term;
    });
}
function showResults(val) {
    resList.innerHTML = '';
    let list = '';
    let terms = autocompleteMatch(val);
    terms.forEach((term) => {
        list+= `<li>${term}</li>`
    })
    resList.innerHTML = `${list}`;
  }


//Event Listener for autocomplete

resList.onclick = async (evt) => {
    let country = evt.target.innerHTML;
    let obj = timeData.find(o => o.name === country)
    origin_time = obj.timezone_offset;
    createMap(obj.latlong)
    document.querySelector('.backfiller').remove();
} 

countryInput.addEventListener("keyup", (evt) => {
    showResults(countryInput.value);
    if (evt.key === "Enter") {
        document.querySelector('.backfiller').remove();
    }
});