function generateUniqueId() {
    return 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
}
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get('uniqueUserId', function(result) {
        if (!result.uniqueUserId) {
            const uniqueUserId = generateUniqueId();
            chrome.storage.local.set({ uniqueUserId: uniqueUserId }, function() {
                console.log('Generated and stored unique user ID:', uniqueUserId);
            });
        } else {
            console.log('User ID already exists:', result.uniqueUserId);
        }
    });

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
    const { url, userRequest, openAIKey, tinifyKey } = message.data;
    console.log('Received message in background script:', message);
    sendURLToServer(url, userRequest, openAIKey, tinifyKey).then(response => {
      if (response.success) {
        const { modified_recipe, compressed_image_path } = response.data;

        chrome.storage.local.set({
            recipeURL: url,
            modifiedRecipe: { modified_recipe: modified_recipe },
            imagePath: compressed_image_path
        }, () => {
          console.log('Modified recipe URL, and image path stored.');
          chrome.storage.local.set({ recipeReady: true }, () => {
            console.log('RecipeReady flag set.');
          });
          sendResponse({ success: true });
        });
      } else {
        sendResponse(response);
      }
    }).catch(error => {
      console.error('Error processing sendRequest:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

async function sendURLToServer(url, userRequest, openAIKey, tinifyKey) {
  try {
    console.log('Sending URL and request to server:', url, userRequest);

    const response = await fetch('http://127.0.0.1:5000/receive_url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: url, request: userRequest, openai_key: openAIKey, tinify_key: tinifyKey})
    });

    console.log('Server response status:', response.status);
    console.log('Server response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send URL and request to server:', errorText);
      return { success: false, error: 'Failed to send URL and request to server' };
    }

    const responseData = await response.json();
    console.log('Server response data:', responseData);
    return { success: true, data: responseData };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
}

function checkForModifiedRecipe() {
    chrome.storage.local.get(['recipeReady', 'modifiedRecipe', 'imagePath'], (result) => {
        if (result.recipeReady && result.modifiedRecipe && result.imagePath) {
            console.log('Modified recipe found in storage:', result.modifiedRecipe);

            chrome.storage.local.remove('recipeReady', () => {
                console.log('RecipeReady flag removed from storage');

                chrome.runtime.sendMessage({ type: 'closeLoadingWindow' });

                openRecipeWindow();
            });
        } else {
            console.log('Recipe not ready yet, polling again...');
        }
    });
}

function openRecipeWindow() {
    chrome.windows.create({
        url: chrome.runtime.getURL("recipe.html"),
        type: "popup",
        width: 500,
        height: 600
    }, (newWindow) => {
        if (chrome.runtime.lastError) {
            console.error('Error creating new window:', chrome.runtime.lastError);
        } else {
            console.log('New window opened:', newWindow);
        }
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'trackEvent') {
        sendAnalyticsEvent(message.category, message.action, message.label);
    }
});
function sendAnalyticsEvent(category, action, label) {
    chrome.storage.local.get('uniqueUserId', function(result) {
        const clientId = result.uniqueUserId || 'unknown_client';
        const trackingId = 'G-747LEMVQ4V';
        const url = `https://www.google-analytics.com/collect?v=1&t=event&tid=${trackingId}&cid=${clientId}&ec=${encodeURIComponent(category)}&ea=${encodeURIComponent(action)}&el=${encodeURIComponent(label)}`;

        fetch(url, { method: 'POST' })
          .then(response => {
              if (!response.ok) {
                  console.error('Failed to send event to Google Analytics');
              } else {
                  console.log('Event sent successfully');
              }
          })
          .catch(err => console.error('GA tracking failed', err));
    });
}

setInterval(checkForModifiedRecipe, 1000);