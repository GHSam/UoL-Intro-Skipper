const timeInput = document.getElementById("time");
const enabledInput = document.getElementById("enabled");

chrome.storage.sync.get({ skipSeconds: 9, enabled: true }, (data) => {
  timeInput.value = data.skipSeconds;
  enabledInput.checked = data.enabled;
});

timeInput.addEventListener("input", function () {
  const seconds = parseInt(this.value, 10);
  if (!isNaN(seconds)) {
    chrome.storage.sync.set({ skipSeconds: seconds }, () => {
      if (seconds != timeInput.value) {
        timeInput.value = seconds;
      }
    });
  } else {
    chrome.storage.sync.get({ skipSeconds: 9 }, (data) => {
      timeInput.value = data.skipSeconds;
    });
  }
});

enabledInput.addEventListener("input", function () {
  chrome.storage.sync.set({
    enabled: enabledInput.checked,
  });
});
