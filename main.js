import './style.css';
import {Map, View, Feature, Overlay} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, transform } from 'ol/proj';
import { Vector as LayerVector } from 'ol/layer';
import { Vector as SourceVector } from 'ol/source';
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';
import { uniqueRandomNumber } from './random_number';

const krasnoyarskLonLat = [92.797553, 55.994306];
const webMercator = fromLonLat(krasnoyarskLonLat);

const apiWeather = 'add ur api token from openWeather'
const apiFlight = 'add ur api token from airLab'

var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var overlay = new Overlay({
    element: container,
    autoPan: {  
      animation: {
        duration: 250,
      },
    },
});

closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

var markerSource = new SourceVector();

fetch(`https://airlabs.co/api/v9/flights?api_key=${apiFlight}`)
.then((response) => {
  return response.json();
})
.then((data) => {
  for (let i = 0; i < data.response.length/50; i++){
    let j = uniqueRandomNumber(0,data.response.length);
    var markerFeature = new Feature({
      geometry: new Point(fromLonLat([data.response[j].lng, data.response[j].lat]))
    });
    markerSource.addFeature(markerFeature);
  };
})
.catch(error => console.error('Error:', error));

var flightLayer = new LayerVector({
  source: markerSource,
  style: new Style({
    image: new Icon({
      src: './assets/marker_plane.png',
      size: [512, 512],
      scale: 0.025
    })
  })
});


const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    flightLayer
  ],
  overlays: [overlay],
  target: 'map',
  view: new View({
    center: webMercator,
    zoom: 5
  })
});

map.on('singleclick', function (evt) {
  const coordinate = evt.coordinate;
  const hdms = transform(coordinate, 'EPSG:3857', 'EPSG:4326');

  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${hdms[1]}&lon=${hdms[0]}&appid=${apiWeather}&units=metric&lang=ru`)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    if (data.name == ''){
      content.innerHTML = '<p>Название места: ' + 'Неопознано' + '</p>';
    }
    else {
      content.innerHTML = '<p>Название места: ' + data.name + '</p>';
    };

    content.innerHTML += '<p> Температура: ' + data.main.temp + '</p>' + '<p> Чувствуется как: ' + data.main.feels_like + '</p>' + '<p> Скорость ветра: ' + data.wind.speed + '</p>' + '<p> Метеоусловия: ' + data.weather[0].description + '</p>';
    
  })
  .catch(error => console.error('Error:', error));

  overlay.setPosition(coordinate);
});


document.addEventListener('DOMContentLoaded', function () {
  var popup = document.getElementById('popup');
  var contentHeight = popup.offsetHeight;

  if (contentHeight > 400) {
    popup.classList.add('tall');
  }
});
