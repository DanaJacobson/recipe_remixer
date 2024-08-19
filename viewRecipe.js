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

        document.getElementById('saveComment').addEventListener('click', function () {
        const comment = document.getElementById('comment').value;

        if (comment) {
            chrome.storage.local.get('selectedRecipe', (data) => {
                let recipeContent = data.selectedRecipe || "";

                // Append the comment to the recipe content
                const commentHtml = `<p><strong>My comments:</strong> ${comment}</p>`;
                recipeContent += commentHtml;

                // Save the updated recipe content
                chrome.storage.local.set({ 'selectedRecipe': recipeContent }, () => {
                    // Update the displayed recipe content to include the comment
                    document.getElementById('recipe').innerHTML = recipeContent;

                    // Clear the comment box
                    document.getElementById('comment').value = "";

                    // Alert the user
                    alert('Comment saved!');

                    // Scroll to the bottom of the recipe to show the comment
                    document.getElementById('recipe').scrollIntoView(false);
                });
            });
        } else {
            alert('Please enter a comment before saving.');
        }
    });

    document.getElementById('backToLibrary').addEventListener('click', function () {
        window.location.href = 'library.html';  // Redirect back to the library
    });
});
