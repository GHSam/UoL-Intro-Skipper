let skipSeconds = 9;
let enabled = true;

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
function skipHandler() {
  if (this.currentTime < skipSeconds) {
    setIcon("icon-active");
    this.currentTime = skipSeconds;
  }
}

/**
 * Finds the video element and skips the first 9 seconds
 */
function skipIntro() {
  // This is called for every DOM mutation so needs to be fast.
  // Could use querySelector but getElementsByClassName is
  // much faster
  const container = document.getElementsByClassName(
    "video-main-player-container"
  )[0];
  if (!container) {
    setIcon("icon-inactive");
    return;
  }

  const video = container.getElementsByTagName("video")[0];
  if (video && video.dataset.intro != "skipped") {
    video.dataset.intro = "skipped";

    // Add events or call the handler if events have already been called
    if (video.readyState < 3) {
      // loadedmetadata seems to be the corrent event to use but doesn't
      // always work, might be Coursera adjusting it sometimes?
      // Using canplay seems to fix the issue.
      video.addEventListener("loadedmetadata", skipHandler, { once: true });
      video.addEventListener("canplay", skipHandler, { once: true });
    } else {
      skipHandler.call(video);
    }
  }
}

// Detect react mutations and fix video if needed
const observer = new MutationObserver(skipIntro);

function enable() {
  setIcon("icon-inactive");
  skipIntro();

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function disable() {
  setIcon("icon-disabled");
  observer.disconnect();
}

// Update based on changes from options
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    if (changes.enabled && enabled !== changes.enabled.newValue) {
      enabled = changes.enabled.newValue;

      if (enabled) {
        enable();
      } else {
        disable();
      }
    }

    if (changes.skipSeconds) {
      skipSeconds = changes.skipSeconds.newValue;
    }
  }
});

// Load current options
chrome.storage.sync.get(
  {
    skipSeconds: 9,
    enabled: true,
  },
  (data) => {
    skipSeconds = data.skipSeconds;
    enabled = data.enabled;

    if (enabled) {
      enable();
    } else {
      setIcon("icon-disabled");
    }
  }
);
