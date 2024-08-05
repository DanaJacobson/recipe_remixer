document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('modifiedRecipe', (data) => {
    const modifiedRecipe = data.modifiedRecipe;
    const recipeElement = document.getElementById('recipe');
    if (modifiedRecipe) {
      recipeElement.textContent = JSON.stringify(modifiedRecipe, null, 2);
    } else {
      recipeElement.textContent = 'No recipe data found.';
    }
  });
});