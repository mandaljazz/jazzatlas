var loop;

initMap();

map.on('load', function() {
  loadPlaces();

  loadEvents();
});

$(document).ready(function() {
  $('#play-button').click(function() {
    if ($(this).data('is-playing')) {
      console.log('Pausing playback')
      clearInterval(loop);
    } else {
      console.log('Starting playback')
      loop = playback();
    }
    $(this).find('.fa').toggleClass('fa-play-circle fa-stop-circle');
    $(this).data('is-playing', !$(this).data('is-playing'))
  })
})