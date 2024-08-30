document.addEventListener('DOMContentLoaded', () => {
    showLibrary();

    document.getElementById('backToModify').addEventListener('click', function () {
        window.location.href = 'popup.html';
    });

    function showLibrary() {
        chrome.storage.local.get({ recipes: [] }, function (result) {
            const recipes = result.recipes;
            const comments = result.recipeComments || {};
            const recipeContainer = document.getElementById('recipeContainer');
            recipeContainer.innerHTML = '';

            if (recipes.length === 0) {
                recipeContainer.textContent = 'No recipes saved.';
            } else {
                recipes.forEach(function (recipe) {
                    const recipeDiv = document.createElement('div');
                    recipeDiv.classList.add('recipe-item');
                    const title = document.createElement('h2');
                    title.textContent = recipe.title;
                    title.style.cursor = 'pointer';
                    title.addEventListener('click', function () {
                        const selectedRecipeComments = comments[recipe.url] || [];
                        chrome.storage.local.set({
                            selectedRecipe: recipe.content,
                            selectedImagePath: recipe.imagePath,
                            recipeURL: recipe.url,
                            selectedRecipeComments: selectedRecipeComments
                        }, function () {
                            window.location.href = 'viewRecipe.html';
                        });
                    });

                    recipeDiv.appendChild(title);
                    recipeContainer.appendChild(recipeDiv);
                });
            }
        });
    }
});