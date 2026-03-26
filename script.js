/*
  script.js - Detailed comments (Hindi)

  Purpose / contract:
  - Input: an audio file named `sound.mp3` located next to the HTML.
  - Output: attempt to play background audio at 50% volume, looping.
  - Behavior: try autoplay; if browser blocks autoplay, wait for a user gesture
    (click or key press) and then start playback.

  Error modes / notes:
  - Modern browsers disallow autoplay of unmuted audio until a user gesture.
  - audio.play() returns a Promise which rejects if playback is blocked.
  - We catch that rejection and install a one-time gesture listener to start audio.

  Edge cases considered:
  - Page loaded before this script runs (we check readyState and use DOMContentLoaded).
  - Play promise rejects even after gesture (we log the failure).
  - User never interacts (audio will not auto-start; consider showing a "Tap to start" button).
*/

// --- Audio object and basic settings ---
// `Audio` is the HTML5 audio constructor. We pass the file path to create an audio element.
// Concepts used: Web Audio / HTMLMediaElement, properties (volume, loop).
var audio = new Audio("sound.mp3");
// volume: 0.0 (muted) to 1.0 (max)
audio.volume = 0.5; // set to 50% so it's not too loud
// loop: when true, playback restarts automatically at the end
audio.loop = true;

// --- startAudioAfterGesture function ---
// Function responsibilities:
// 1) Call audio.play() which returns a Promise.
// 2) If the Promise resolves, audio started successfully.
// 3) If the Promise rejects (autoplay blocked), register one-time event listeners
//    for a user gesture (click or keydown) and then call audio.play() again.
// Concepts used: Promises, .then/.catch, event listeners, feature detection.
function startAudioAfterGesture() {
  // audio.play() returns a Promise that resolves when playback begins.
  audio
    .play()
    .then(function () {
      // Success path: audio started playing.
      // Useful when autoplay is allowed (e.g., user has previously granted permission).
      console.log("Audio started");
    })
    .catch(function (err) {
      // Failure path: most likely the browser blocked autoplay.
      // We fallback to waiting for a user gesture. This is required by browser policy.
      console.log("Autoplay blocked, will wait for user gesture.", err);

      // `userStart` is a small helper that tries to play audio when the user interacts.
      // It also removes the listeners after the first use to avoid repeated attempts.
      function userStart() {
        // Try to play again. If this fails, we log the error but don't re-add listeners.
        audio.play().catch(function (e) {
          console.log("Play failed after gesture:", e);
        });
        // Clean up the gesture listeners — they are no longer needed.
        document.removeEventListener("click", userStart);
        document.removeEventListener("keydown", userStart);
      }

      // Add one-time event listeners. Using `{ once: true }` would auto-remove the
      // listener after invocation, but we also explicitly remove them inside userStart
      // for clarity and compatibility with older browsers.
      document.addEventListener("click", userStart, { once: true });
      document.addEventListener("keydown", userStart, { once: true });
    });
}

// --- When to run startAudioAfterGesture ---
// We want to run our start attempt once the DOM is ready. If the script executes
// before DOMContentLoaded, the audio object still works, but it's common practice
// to wait for DOM ready when code depends on the page state. Here it's a lightweight
// readiness check that ensures consistent behavior.
if (document.readyState === "loading") {
  // Page is still loading — wait for DOMContentLoaded
  document.addEventListener("DOMContentLoaded", startAudioAfterGesture);
} else {
  // DOM already ready — start immediately
  startAudioAfterGesture();
}

/*
  Summary of key web concepts used:
  - HTMLMediaElement / Audio API: create and control audio playback.
  - Promises: audio.play() returns a Promise used to detect autoplay blocking.
  - Browser autoplay policies: require a user gesture to play unmuted audio.
  - Event listeners: used to wait for a click/keydown user gesture.
  - DOMContentLoaded & document.readyState: ensure script runs at appropriate time.
*/
