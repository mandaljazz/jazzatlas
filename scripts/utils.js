function isElementOnScreen(id) {
  var element = document.getElementById(id);
  var bounds = element.getBoundingClientRect();
  return (
    bounds.top < window.innerHeight &&
    bounds.bottom > distanceToTopForActiveEventInfo
  );
}

// Returns a random number between min (inclusive) and max (exclusive)
function getRandomInt(min, max) {
  return Math.random() * (max - min) + min;
}

function togglePlayback() {
  isPlaying = !isPlaying;
  $("#play-button")
    .find(".fa")
    .toggleClass("fa-play-circle fa-pause-circle fa-spin");
}

function stopPlayback() {
  isPlaying = false;
  $("#play-button")
    .find(".fa")
    .addClass("fa-play-circle");
  $("#play-button")
    .find(".fa")
    .removeClass("fa-pause-circle fa-spin");
}
