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
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: function() {
            const userRequest = prompt("Enter your request (e.g., vegan, gluten-free, etc.):");
            return userRequest;
          }
        }, (requestResults) => {
          if (requestResults && requestResults[0] && requestResults[0].result) {
            const userRequest = requestResults[0].result;
            sendURLToServer(recipeURL, userRequest);
          }
        });
      }
    });
  }
});

function sendURLToServer(url, userRequest) {
  fetch('http://127.0.0.1:5000/receive_url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: url, request: userRequest })
  }).then(response => {
    if (response.ok) {
      console.log('URL and request sent to server successfully');
    } else {
      console.error('Failed to send URL and request to server');
    }
  }).catch(error => {
    console.error('Error:', error);
  });
}