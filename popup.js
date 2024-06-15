document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup loaded'); // Log when the popup is loaded

  const checkboxes = document.querySelectorAll('input[name="diet"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', handleCheckboxChange);
  });

  document.getElementById('diet-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const selectedDiets = [];
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        selectedDiets.push(checkbox.value);
      }
    });

    if (selectedDiets.length < 1 || selectedDiets.length > 2) {
      alert('Please select one or two options only.');
      return;
    }

    console.log('Selected Diets:', selectedDiets); // Log the selected dietary options

    chrome.storage.local.get('recipeURL', (data) => {
      const recipeURL = data.recipeURL;
      console.log('Recipe URL:', recipeURL); // Log the retrieved recipe URL from storage

      if (recipeURL) {
        openLoadingWindow();
        chrome.runtime.sendMessage({
          type: 'sendRequest',
          data: { url: recipeURL, userRequest: selectedDiets }
        }, (response) => {
          console.log('Message sent to background script', response); // Log when the message is sent to the background script
        });
      } else {
        console.error('Recipe URL not found in storage'); // Log an error if the recipe URL is not found in storage
      }
    });
  });

  function handleCheckboxChange() {
    const selectedCheckboxes = Array.from(checkboxes).filter(checkbox => checkbox.checked);
    if (selectedCheckboxes.length >= 2) {
      checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
          checkbox.disabled = true;
        }
      });
    } else {
      checkboxes.forEach(checkbox => {
        checkbox.disabled = false;
      });
    }
  }

  function openLoadingWindow() {
    chrome.windows.create({
      url: chrome.runtime.getURL("loading.html"),
      type: "popup",
      width: 500,
      height: 600
    }, () => {
      window.close();
    });
  }
});
