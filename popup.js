document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup loaded'); // Log when the popup is loaded

  document.getElementById('diet-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const selectedDiet = document.querySelector('input[name="diet"]:checked').value;
    console.log('Selected Diet:', selectedDiet); // Log the selected dietary option

    chrome.storage.local.get('recipeURL', (data) => {
      const recipeURL = data.recipeURL;
      console.log('Recipe URL:', recipeURL); // Log the retrieved recipe URL from storage

      if (recipeURL) {
        chrome.runtime.sendMessage({
          type: 'sendRequest',
          data: { url: recipeURL, userRequest: selectedDiet }
        }, (response) => {
          console.log('Message sent to background script', response); // Log when the message is sent to the background script
        });
      } else {
        console.error('Recipe URL not found in storage'); // Log an error if the recipe URL is not found in storage
      }
    });
  });
});
