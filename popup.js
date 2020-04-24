const timeInput = document.getElementById("time");
const enabledInput = document.getElementById("enabled");

storageGet({ skipSeconds: 9, enabled: true }, (data) => {
  timeInput.value = data.skipSeconds;
  enabledInput.checked = data.enabled;
});

timeInput.addEventListener("input", function () {
  const seconds = parseInt(this.value, 10);
  if (!isNaN(seconds) && seconds >= 0) {
    storageSet({ skipSeconds: seconds }, () => {
      if (seconds != timeInput.value) {
        timeInput.value = seconds;
      }
    });
  } else {
    storageGet({ skipSeconds: 9 }, (data) => {
      timeInput.value = data.skipSeconds;
    });
  }
});

enabledInput.addEventListener("input", function () {
  storageSet({
    enabled: enabledInput.checked,
  });
});
