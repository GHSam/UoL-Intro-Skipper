// Only apply URLs with /lecture/ in them
const lectureUrlRegex = /^https:\/\/www\.coursera\.org\/learn\/uol-[^\/]+\/lecture\//;

// Create live collection of video containers to check.
// Could use querySelector but getElementsByClassName is
// much faster and this has to be checked in every DOM
// mutation so needs to be fast
const containers = document.getElementsByClassName(
  "video-main-player-container"
);

let skipSeconds = 9;
let isEnabled = false;

/**
 * Sets the extensions toolbar icon
 */
function setIcon(value) {
  // If extension is reloaded or updated it will cause
  // Extension context invalidated exception
  try {
    chrome.runtime.sendMessage({
      iconPath: `icons/${value}.png`,
    });
  } catch {}
}

/**
 * Video event handler to skip to 9 seconds if current time is less
 */
function skipIntroHandler() {
  if (this.currentTime < skipSeconds) {
    setIcon("icon-active");
    this.currentTime = skipSeconds;
  }
}

/**
 * Finds the video element and skips the first 9 seconds
 */
function skipIntro() {
  // Only run if has a video and is on a lecture URL
  if (!containers[0] || !lectureUrlRegex.test(window.location)) {
    setIcon("icon-inactive");
    return;
  }

  const video = containers[0].getElementsByTagName("video")[0];
  if (video && video.dataset.intro != "skipped") {
    video.dataset.intro = "skipped";

    // Add events or call the handler if events have already been called
    if (video.readyState < 3) {
      // loadedmetadata seems to be the correct event to use but doesn't
      // always work, looks like Coursera adjusting the time back sometimes?
      // Using canplay and canplaythrough seem to mostly fix the issue.
      video.addEventListener("loadedmetadata", skipIntroHandler, {
        once: true,
      });
      video.addEventListener("canplay", skipIntroHandler, { once: true });
      video.addEventListener("canplaythrough", skipIntroHandler, {
        once: true,
      });
      // Coursera seems to sometimes change the time back so also check on
      // first play that has skipped intro
      video.addEventListener("play", skipIntroHandler, { once: true });
    } else {
      skipIntroHandler.call(video);
    }
  }
}

// Detect react mutations and fix video if needed
const observer = new MutationObserver(skipIntro);

function setEnable(value) {
  if (isEnabled == value) {
    return;
  }

  isEnabled = value;

  if (value) {
    setIcon("icon-inactive");
    skipIntro();

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  } else {
    setIcon("icon-disabled");
    observer.disconnect();
  }
}

// Update settings based on changes from options
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    if (changes.enabled) {
      setEnable(changes.enabled.newValue);
    }

    if (changes.skipSeconds) {
      skipSeconds = changes.skipSeconds.newValue;
    }
  }
});

// Load current options
chrome.storage.sync.get({ skipSeconds: 9, enabled: true }, (data) => {
  skipSeconds = data.skipSeconds;
  setEnable(data.enabled);
});
