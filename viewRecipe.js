document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('selectedRecipe', (data) => {
        const recipeContent = data.selectedRecipe;
        const recipeElement = document.getElementById('recipe');

        if (recipeContent) {
            recipeElement.innerHTML = recipeContent; // Properly render the HTML content
        } else {
            recipeElement.textContent = 'No recipe data found.';
        }
    });

    document.getElementById('backToLibrary').addEventListener('click', function () {
        window.location.href = 'library.html';  // Redirect back to the library
    });
});
