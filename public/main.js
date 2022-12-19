let geoJsonData, timeData;
let geojson;        //geojson map layer
let hash = new Map();
let countriesList = [];
const maps ={};
let origin_time;    //UTC Offset of selected Native Region

//Function to request Data from Backend
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
    // console.log(timeData)
    timeData.forEach((data) => {
        hash.set(data.name, data.timezone_offset)
        countriesList.push(data.name);
    })
}

function createMap(coord)   {
    let coordArr= coord.split(',');
    maps[0] = L.map("map", {
        maxZoom: 5,
        // zoomControl: false,
        zoomSnap: 0.5
    }).setView([coordArr[0], coordArr[1]], 3);
    setGeoLayer()
}
function setGeoLayer() {
    geojson = L.geoJson(geoJsonData, {
        style: style,
        onEachFeature: onEachFeature,
    }).addTo(maps[0]);
}


//Returns offset time from chosen origin.
function timeOffset(origin, time) {
    if(origin==0)
        return time;
    if(origin>0) {
        if(time<-12+origin)   {
            let inp_start = -12+origin-1, inp_end = -12;
            let out_start = 12, out_end = -1*inp_start;
            let slope = (out_end-out_start)/(inp_end-inp_start);
            return out_start + slope*(time-inp_start)
        }
        return time-origin;
    }
    else {
        if(time>12+origin)  {
            let inp_start = 12+origin+1, inp_end = 12;
            let out_start = -12, out_end = -1*inp_start;
            let slope = (out_end-out_start)/(inp_end-inp_start);
            return out_start + slope*(time-inp_start);
        }
        return time-origin;
    }
}

//Map Styling
function getColor(country) {
    const obj = timeData.find(o => o.name === country)
    if (typeof obj === 'undefined') {
        return '#f0f0f0';
    }
    let localTime= obj.timezone_offset;
    let offsetTimeArr = timeOffset(Math.floor(origin_time), Math.floor(localTime));
    let d = offsetTimeArr;
    const colorArr = ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'];
    if(d>9)
        return colorArr[0];
    else if(d<-9)
        return colorArr[10];
    else {
        let inp_start = 9, inp_end = -9;
        let out_start = 1, out_end = 9;
        let slope = (out_end-out_start)/(inp_end-inp_start);
        let ans = Math.round(out_start + slope*(d-inp_start))
        return colorArr[ans];
    }

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