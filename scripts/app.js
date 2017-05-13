initMap();

map.on('load', function() {
  loadPlaces();

  loadEvents();

  addScrollListener();

  $('body').css('opacity', 1);
});

$(document).ready(function() {
  $('#play-button').click(function() {
    togglePlayback();
  })
})