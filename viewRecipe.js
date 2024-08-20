document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['selectedRecipe', 'selectedImagePath'], (data) => {
        const recipeContent = data.selectedRecipe;
        const imagePath = data.selectedImagePath;
        const recipeElement = document.getElementById('recipe');
        const recipeImageElement = document.getElementById('recipeImage');

        if (recipeContent) {
            recipeElement.innerHTML = recipeContent;
        } else {
            recipeElement.textContent = 'No recipe data found.';
        }

        if (imagePath) {
            recipeImageElement.src = imagePath;
        } else {
            recipeImageElement.alt = 'No image available';
        }
    });

    document.getElementById('saveComment').addEventListener('click', function () {
        const comment = document.getElementById('comment').value;
        if (comment) {
            chrome.storage.local.get('selectedRecipe', (data) => {
                let recipeContent = data.selectedRecipe || "";
                const commentHtml = `<p><strong>My comments:</strong> ${comment}</p>`;
                recipeContent += commentHtml;

                chrome.storage.local.set({ 'selectedRecipe': recipeContent }, () => {
                    document.getElementById('recipe').innerHTML = recipeContent;
                    document.getElementById('comment').value = "";
                    alert('Comment saved!');
                    document.getElementById('recipe').scrollIntoView(false);
                });
            });
        } else {
            alert('Please enter a comment before saving.');
        }
    });

    document.getElementById('backToLibrary').addEventListener('click', function () {
        window.location.href = 'library.html';
    });
});
s