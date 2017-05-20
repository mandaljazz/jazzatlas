initMap();

map.on('load', function() {
  loadPlaces();

  loadEvents();

  addScrollListener();

  $('body').css('opacity', 1);
});

$(document).ready(function() {
  // Workaround for iOS and Chrome on mobile to take address and bookmark bars into account
  $('#map').css({ height: window.innerHeight });
  // In case user flips orientation or resizes the screen, handle it
  window.addEventListener("resize", function() {
    $('#map').css({ height: window.innerHeight });
    map.resize();
  }, false);

  $('#play-button').click(function() {
    togglePlayback();
  })
})