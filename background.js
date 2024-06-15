chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "recipeRemixer",
    title: "Recipe Remixer",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "recipeRemixer") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: function() {
        return { url: window.location.href };
      }
    }, (results) => {
      if (results && results[0] && results[0].result) {
        const recipeURL = results[0].result.url;
        chrome.storage.local.set({ recipeURL: recipeURL }, () => {
          chrome.windows.create({
            url: chrome.runtime.getURL("popup.html"),
            type: "popup",
            width: 500,
            height: 600
          });
        });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'sendRequest') {
    const { url, userRequest } = message.data;
    console.log('Received message in background script:', message); // Log the received message
    sendURLToServer(url, userRequest).then(response => {
      sendResponse(response);
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Indicates that we will respond asynchronously
  }
});

async function sendURLToServer(url, userRequest) {
  try {
    const response = await fetch('http://127.0.0.1:5000/receive_url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: url, request: userRequest })
    });

    if (response.ok) {
      console.log('URL and request sent to server successfully');
      return { success: true };
    } else {
      console.error('Failed to send URL and request to server');
      return { success: false, error: 'Failed to send URL and request to server' };
    }
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
}