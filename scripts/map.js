
// Variables
var map;
var timeAtEachConcert = 5555; // milliseconds
var colors = {
  blue: '#3255a4',
  red: '#f15060'
};
var eventMarkers = [];
var locationMarker, locationMarkerAccuracy;
var bounds = [
  [7.418380, 58.011527], // Southwest coordinates
  [7.474327, 58.039323]  // Northeast coordinates
];
var defaultImages = ['default3', 'default1', 'default2', 'default4']
var currentEventFeature = null;
var activeEventId = null;
var isPlaying = true;
var distanceToTopForActiveEventInfo = 50;


function initMap() {
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

  map = new mapboxgl.Map({
    container: 'map',
    style: MAPBOX_STYLE_URL,
    center: [7.454231, 58.025881],
    zoom: 15,
    attributionControl: false,
  });

  map.addControl(new mapboxgl.AttributionControl({ compact: true }));
  map.addControl(new mapboxgl.NavigationControl());
  var geolocate = new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true } })
  map.addControl(geolocate);
  map.addControl(new mapboxgl.FullscreenControl());

  geolocate.on('geolocate', function(e) {
    // Only create the marker if it does not exist, otherwise just update the position
    if (locationMarker) {
      locationMarker.setLngLat([e.coords.longitude, e.coords.latitude])
      locationMarkerAccuracy.setLngLat([e.coords.longitude, e.coords.latitude])
    }
    else {
      accuracyMarker = document.createElement('div');
      accuracyMarker.className = 'location-marker-accuracy';
      locationMarkerAccuracy = new mapboxgl.Marker(accuracyMarker, { offset: [-70 / 2, -70 / 2] })
        .setLngLat([e.coords.longitude, e.coords.latitude])
        .addTo(map);

      locationMarker = document.createElement('div');
      locationMarker.className = 'location-marker';
      locationMarker = new mapboxgl.Marker(locationMarker, { offset: [-15 / 2, -15 / 2] })
        .setLngLat([e.coords.longitude, e.coords.latitude])
        .addTo(map);
    }
  });
}

function addPlacesToMap() {
  console.log('Adding places to the map');

  map.addSource('places', {
    type: 'geojson',
    data: placesCollection
  });
  
  map.addLayer({
    'id': 'places',
    'source': 'places',
    'type': 'fill-extrusion',
    'minzoom': 1,
    'paint': {
      'fill-extrusion-color': colors.red,
      'fill-extrusion-height': {
        'type': 'identity',
        'property': 'height'
      },
      'fill-extrusion-base': {
        'type': 'identity',
        'property': 'base-height'
      },
      'fill-extrusion-opacity': 0.8
    }
  });
}

function addEventsToMap() {
  console.log('Adding events to the map');

  eventsCollection.features.forEach(function(eventFeature, i) {
    // create a DOM element for the marker
    var markerDiv = document.createElement('div');
    markerDiv.id = 'event-marker-' + eventFeature.id;
    markerDiv.className = 'event-marker';

    eventFeature.properties.title = eventFeature.properties.artist + ' @ ' + eventFeature.properties.place;
    eventFeature.properties.imageURL = eventFeature.properties.image ? 'images/artists/' + eventFeature.properties.image + '.jpg' : 'images/artists/' + defaultImages[i % defaultImages.length] + '.jpg';
    eventFeature.properties.mandaljazzURL = eventFeature.properties.image ? 'http://mandaljazz.no/artister/' + eventFeature.properties.image : 'http://mandaljazz.no/';

    markerDiv.style.backgroundImage = 'url(' + eventFeature.properties.imageURL + ')';
    addEventSection(eventFeature);

    var $popupDiv = $('<div>')
    .attr('class', 'event-section active')
    .css('background-image', 'url(' + eventFeature.properties.imageURL + ')')
    .html(" \
      <div class='event-info'> \
        <div class='start-time'>" + moment(eventFeature.properties.start).format('dddd HH:mm') + "</div> \
        <div class='title'>" + eventFeature.properties.title + "</div> \
        <div>Les mer på <a class='event-link' href='" + eventFeature.properties.mandaljazzURL + "' target='_blank'>mandaljazz.no</a></div> \
      </div>");

    var popup = new mapboxgl.Popup()
      .setDOMContent($popupDiv.get(0));

    // add marker to map
    marker = new mapboxgl.Marker(markerDiv, { offset: [-30, -30] })
      .setLngLat(eventFeature.geometry.coordinates)
      .setPopup(popup)
      .addTo(map);
    
    eventMarkers.push(marker);
  });

  // Add a footer to the event-sections element
  $eventSectionsFooter = $('<div>')
    .attr('class', 'footer')
    .html(" \
      <h1>Billetter og mer info finner du på <a href='http://mandaljazz.no/' target='_blank'>mandaljazz.no</a></h1> \
      <img src='images/jazzlaug.png' /> \
      <h2>Vi sees på Mandaljazz!</h2>");
  $('#event-sections').append($eventSectionsFooter);

  // Add a click listener after all markers are added to the map
  $('.event-marker').click(function(e) {
    stopPlayback();
    var eventId = e.target.id.replace('event-marker-', '');
    $.each(eventsCollection.features, function(key, eventFeature) {
      if (eventFeature.id === eventId) {
        setActiveEvent(eventFeature, false);
        return false;
      }
    });
    $('html, body').scrollTop($('#' + e.target.id.replace('marker-', '')).position().top + 2);
  })
}


function addEventSection(eventFeature) {
  var $eventDiv = $('<div>')
    .attr('id', 'event-' + eventFeature.id)
    .attr('class', 'event-section')
    .css('background-image', 'url(' + eventFeature.properties.imageURL + ')')
    .html(" \
      <div class='event-info'> \
        <div class='start-time'>" + moment(eventFeature.properties.start).format('dddd HH:mm') + "</div> \
        <div class='title'>" + eventFeature.properties.title + "</div> \
        <div>Les mer på <a class='event-link' href='" + eventFeature.properties.mandaljazzURL + "' target='_blank'>mandaljazz.no</a></div> \
      </div>");

  $('#event-sections').append($eventDiv);
}


function addScrollListener() {
  window.onscroll = function() {
    $.each(eventsCollection.features, function() {
      var eventId = 'event-' + this.id;
      if (isElementOnScreen(eventId)) {
        setActiveEvent(this);
        return false;
      }
    })
  };
}


function setActiveEvent(eventFeature, randomize = true) {
  var eventId = eventFeature.id;
  if (eventId === activeEventId) return;

  // Highlight the active concert in the concert list
  $('#event-' + eventId).addClass('active');
  $('#event-' + activeEventId).removeClass('active');
  // Highlight the current marker when finished flying
  $('#event-marker-' + eventId).addClass('active');
  $('#event-marker-' + activeEventId).removeClass('active');

  var options = {
    center: eventFeature.geometry.coordinates,
    speed: 0.5,                           // Speed of the flight
    curve: 1.3,                           // How far 'out' we should zoom on the flight from A to B
    pitch: getRandomInt(0, 70),           // Pitch for coolness
    bearing: getRandomInt(-10, 10)        // Tilt north direction slightly for even more coolness!
  }

  if (randomize) {
    options.zoom = getRandomInt(15, 19);  // Set a random zoom level for effect
  }
  // Animate the map position based on camera properties
  map.flyTo(options);

  activeEventId = eventId;
}


// Loop through all concerts indefinitely
function playback(index) {
  currentEventFeature = eventsCollection.features[index];

  if (isPlaying) {
    // Scroll to the correct concert section
    $('html, body').animate({ scrollTop: $('#event-' + currentEventFeature.id).position().top + 2 }, 800)
  
    // Once the flight has ended, initiate a timeout that triggers a recursive call
    map.once('moveend', function() {
      setTimeout( function() {
        // Get index of the next event.
        // Modulus length makes it 0 if we're at the last index, i.e. we'll start from the beginning again.
        var nextIndex = (index + 1) % eventsCollection.features.length;
        console.log('nextIndex', nextIndex)

        // Recursive call, fly to next event
        playback(nextIndex);
      }, timeAtEachConcert); // After callback, stay at the location for x milliseconds
    });
  } else {
    setTimeout( function() {
      playback(index);
    }, 2000);
  }
}
