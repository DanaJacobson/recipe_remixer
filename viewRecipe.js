document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['selectedRecipe', 'selectedImagePath', 'recipeComments'], (data) => {
        const recipeContent = data.selectedRecipe;
        const imagePath = data.selectedImagePath;
        const comments = data.recipeComments || [];
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

        comments.forEach(comment => {
            const commentHtml = `<p><strong>My comments:</strong> ${comment}</p>`;
            recipeElement.innerHTML += commentHtml;
        });
    });

     document.getElementById('saveComment').addEventListener('click', function () {
        const comment = document.getElementById('comment').value.trim();
        if (comment) {
            chrome.storage.local.get('recipeComments', (data) => {
                let comments = data.recipeComments || [];
                comments.push(comment);

                chrome.storage.local.set({ 'recipeComments': comments }, () => {
                    const commentHtml = `<p><strong>My comments:</strong> ${comment}</p>`;
                    document.getElementById('recipe').innerHTML += commentHtml;
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