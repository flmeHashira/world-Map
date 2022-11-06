const map = L.map('map').setView([20.5937, 78.9629], 4);

// const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     // attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
// }).addTo(map);
var geojson;
const xhr = new XMLHttpRequest();
xhr.open("GET", 'http://localhost:3000/countriesData', true);
xhr.responseType = 'json';
xhr.send();

xhr.onload = async() => {
    // if (xhr.status != 200) { // analyze HTTP status of the response
    //   alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
    // } else { // show the result
    //     console.log(xhr)
    //   alert(`Done, got ${xhr.response.length} bytes`); // response is the server response
    // }
    if(xhr.status!=200)
        console.log(`Error ${xhr.status}: ${xhr.statusText}`);
    else    {
        function style(feature) {
            return {
                fillColor: '#E31A1C',
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }

        // const map = new Map(Object.entries(xhr.response));
        // console.log(map)
        geojson= L.geoJson(xhr.response,{
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);
    }
  };



  function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
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
        click: zoomToFeature
    });
}
