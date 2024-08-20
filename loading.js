document.addEventListener('DOMContentLoaded', () => {
  console.log('Loading script loaded successfully.');

  // Function to check for the modified recipe
  function checkForModifiedRecipe() {
    chrome.storage.local.get(['recipeReady', 'modifiedRecipe', 'imagePath'], (result) => {
      if (result.recipeReady && result.modifiedRecipe && result.imagePath) {
        console.log('Modified recipe found in storage:', result.modifiedRecipe);

        // Remove the recipeReady flag
        chrome.storage.local.remove('recipeReady', () => {
          console.log('RecipeReady flag removed from storage');

          // Close the loading window
          chrome.windows.getCurrent((window) => {
            console.log('Current window:', window);
            chrome.windows.remove(window.id, () => {
              console.log('Loading window closed, opening new window');
              // Open the new window with the recipe
              openRecipeWindow();
            });
          });
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

  // Poll for the modified recipe every second
  setInterval(checkForModifiedRecipe, 1000);
});