initMap();

map.on('load', function() {
  loadPlaces();

  loadEvents();
});

$(document).ready(function() {
  $('#play-button').click(function() {
    isPlaying = !isPlaying;
    $(this).find('.fa').toggleClass('fa-play-circle fa-pause-circle fa-spin');
  })
})