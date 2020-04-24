function storageGet(keys, cb) {
  // Firefox
  if (browser && browser.storage) {
    if (browser.storage.sync) {
      browser.storage.sync.get(keys).then(cb);
    } else {
      cb(browser.storage.local.get(keys));
    }
    // Chrome
  } else {
    chrome.storage.sync.get(keys, cb);
  }
}

function storageSet(data) {
  // Firefox
  if (browser && browser.storage) {
    if (browser.storage.sync) {
      browser.storage.sync.set(data);
    } else {
      browser.storage.local.set(data);
    }
    // Chrome
  } else {
    chrome.storage.sync.set(data);
  }
}
