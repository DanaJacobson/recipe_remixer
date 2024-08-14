document.addEventListener('DOMContentLoaded', () => {
    showLibrary();

    document.getElementById('backToModify').addEventListener('click', function () {
        window.location.href = 'popup.html';  // Redirect back to the main popup
    });

    function showLibrary() {
        chrome.storage.local.get({ recipes: [] }, function (result) {
            const recipes = result.recipes;
            const recipeContainer = document.getElementById('recipeContainer');
            recipeContainer.innerHTML = ''; // Clear previous content

            recipes.forEach(function (recipe) {
                // Create a container for each recipe
                const recipeDiv = document.createElement('div');
                recipeDiv.classList.add('recipe-item');
                
                const title = document.createElement('h2');
                title.textContent = recipe.title;
                
                // Make the title clickable to view the recipe
                title.style.cursor = 'pointer'; // Change the cursor to pointer on hover
                title.addEventListener('click', function () {
                    // Store the selected recipe's HTML content
                    chrome.storage.local.set({ selectedRecipe: recipe.content }, function () {
                        // Redirect to the view recipe page
                        window.location.href = 'viewRecipe.html';
                    });
                });

                recipeDiv.appendChild(title);
                recipeContainer.appendChild(recipeDiv);
            });
        });
    }
});
