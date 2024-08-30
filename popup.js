document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup loaded');

    document.getElementById('recipeLibraryButton').addEventListener('click', function () {
      window.location.href = 'library.html';
  });

  chrome.storage.local.get(['OPENAI_API_KEY', 'TINIFY_API_KEY'], function(result) {
    if (!result.OPENAI_API_KEY || !result.TINIFY_API_KEY) {
      document.getElementById('apiKeysModal').style.display = 'block';
    } else {
      console.log('API keys are already set');
    }
  });

  document.getElementById('saveKeysButton').addEventListener('click', function() {
    const openAIKey = document.getElementById('openaiKey').value;
    const tinifyKey = document.getElementById('tinifyKey').value;

    if (openAIKey && tinifyKey) {
      chrome.storage.local.set({ OPENAI_API_KEY: openAIKey, TINIFY_API_KEY: tinifyKey }, function() {
        alert('API keys saved successfully!');
        document.getElementById('apiKeysModal').style.display = 'none';
      });
    } else {
      alert('Both API keys are required.');
    }
  });

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

    chrome.runtime.sendMessage({
        type: 'trackEvent',
        category: 'Diet',
        action: 'Preference Selected',
        label: selectedDiets.join(', ')
    });

    console.log('Selected Diets:', selectedDiets);

    chrome.storage.local.get(['recipeURL', 'OPENAI_API_KEY', 'TINIFY_API_KEY'], (data) => {
      const recipeURL = data.recipeURL;
      const openAIKey = data.OPENAI_API_KEY;
      const tinifyKey = data.TINIFY_API_KEY;
      console.log('Recipe URL:', recipeURL);

      if (recipeURL && openAIKey && tinifyKey) {
        openLoadingWindow();
        chrome.runtime.sendMessage({
          type: 'sendRequest',
          data: { 
            url: recipeURL, 
            userRequest: selectedDiets,
            openAIKey: openAIKey,
            tinifyKey: tinifyKey 
          }
        }, (response) => {
          console.log('Message sent to background script', response);
        });
      } else {
        console.error('Recipe URL or API keys not found in storage');
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