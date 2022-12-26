let geoJsonData, timeData;
let geojson;        //geojson map layer
let hash = new Map();
let countriesList = [];
const maps ={};
let origin_time, vectorGrid, props, marker=null;  //UTC Offset of selected Native Region
let timer;


function timeDataHandle(data) {
    timeData = data;
    timeData.forEach((data) => {
        hash.set(data.name, data.timezone_offset)
        countriesList.push(data.name);
    })
}


function createMap(coord)   {
    let coordArr= coord.split(',');
    maps[0] = L.map("map", {
        maxZoom: 5,
        minZoom: 3,
        // zoomControl: false,
        zoomSnap: 0.5,
        maxBounds: [[-90, -180],[90, 180]],
        // worldCopyJump: true,
        // trackResize: true,
    }).setView([coordArr[0], coordArr[1]], 3);
    setGeoLayer()
    setVectorLayer()
    legend.addTo(maps[0]);
    info.addTo(maps[0]);
}

//Add tile layer

function setGeoLayer() {
    geojson = L.geoJson(geoJsonData, {
        style: style,
        onEachFeature: onEachFeature,
    }).addTo(maps[0]);
}

function setVectorLayer()   {
        vectorGrid = L.vectorGrid.slicer( geoJsonData, {
        rendererFactory: L.svg.tile,
        vectorTileLayerStyles: {
            sliced: function(properties, zoom) {
                return {
                    fillColor: getColorCountry(properties.ADMIN),
                     fillOpacity: 0.7,
                    stroke: false,
                    fill: true
                }
            }
        },
        interactive: true,
        getFeatureId: function(f) {
            return f.properties.ADMIN;
        }
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



// Legend and Widgets

let legend = L.control({position: 'bottomright'}),
    info = L.control();

legend.onAdd = function (map) {
    let grades = [-9,-7,-5,-3,-1,2,4,6,8,9];
    let div = L.DomUtil.create('div', 'info legend'),
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    div.innerHTML +=
    '<i style="background:'+getColor(-11)+'"></i>'+'<'+grades[0]+'<br>'; 

    for (let i = 0; i < grades.length-1; i++) {
        div.innerHTML +=
            '<i style="background:'+getColor(grades[i])+'"></i> ' +
            grades[i] +'&nbsp;'+ '&ndash;'+'&nbsp;' + grades[i + 1] + '<br>';
    }
    div.innerHTML +=
    '<i style="background:'+getColor(11)+'"></i>'+'>'+9+'<br>'; 

    return div;
};

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML =  (props ?
        '<b>' + props.ADMIN + '</b><br />'
        : 'Hover over a country');
};

info.detail = function (props)  {
    let obj = timeData.find(o => o.name === props.ADMIN)
    let offset1 = new Date().getTimezoneOffset(),
        offset2 = obj.timezone_offset;

    offset2 = (offset2+"").split(".");
    let hrs = offset2[0], mins;
    (offset2.length ==1)?   mins=0: mins = offset2[1];
    if(mins==3)
        mins = 30;
    offset1 = offset1*60*1000;
    offset2 = (hrs*60*60*1000)+(mins*60*1000);
    
    let initDate = new Date().getTime(); 
    let date = new Date(initDate + offset1 + offset2+1125);

    let hh = date.getHours();
    let mm = date.getMinutes();
    let ss = date.getSeconds();
    
    if(hh<10)   hh = "0" + hh;
    if(mm < 10) mm = "0" + mm;
    if(ss < 10) ss = "0" + ss;
      
    let time = `${hh}:${mm}:${ss}`;
    
    offset2 = obj.timezone_offset;
    if(offset2>0)
        offset2= "+"+offset2;

    this._div.innerHTML =  `<div>
    <h4>Date and Time</h4>
    <b>${props.ADMIN}</b><br>
    <p id="time">${time}<\p>
    <p>${date.toDateString()} (UTC${offset2})</p></div>`;
    
    timer = setTimeout(function(){ info.detail(props) }, 1000);
}

//Map Styling

function getColorCountry(country)  {
    const obj = timeData.find(o => o.name === country)
    if (typeof obj === 'undefined') {
        return '#f0f0f0';
    }
    let localTime= obj.timezone_offset;
    let offsetTimeArr = timeOffset(Math.floor(origin_time), Math.floor(localTime));
    return getColor(offsetTimeArr);
}

function getColor(d) {
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
        fillColor: '#FFFF',
        weight: 2,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0,
    };
}

function highlightFeature(e) {
    let layer = e.target;
    // clearTimeout(timer);
    layer.setStyle({
        weight: 5,
        color: "#666",
        dashArray: "",
        fillOpacity: 0,
    });
    layer.bringToFront();
    props = layer.feature.properties;
    info.update(props);
}
function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    maps[0].fitBounds(e.target.getBounds());
    if(marker)
        maps[0].removeLayer(marker)
    props = e.target.feature.properties;
    clearTimeout(timer);
    info.detail(props);
    marker = L.marker(e.latlng).addTo(maps[0]);
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

document.addEventListener("DOMContentLoaded", () => {
    fetch('countries_time.json')
    .then((response) => response.json())
    .then((data) => {
        timeDataHandle(data)
    });
   
    fetch('countries.geojson')
    .then((response) => response.json())
    .then((data) => {
        geoJsonData = data
    });
    
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
});
