document.addEventListener('DOMContentLoaded', () => {
    console.log('Loading script loaded successfully.');

    // Listen for a message from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'closeLoadingWindow') {
            chrome.windows.getCurrent((currentWindow) => {
                chrome.windows.remove(currentWindow.id, () => {
                    console.log('Loading window closed by background script');
                });
            });
        }
    });
});