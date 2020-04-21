chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    chrome.browserAction.setIcon({
        path: request.iconPath,
        tabId: sender.tab.id
    });
});
