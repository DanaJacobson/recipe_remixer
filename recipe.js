document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the recipe and image path from Chrome's local storage
    chrome.storage.local.get(['modifiedRecipe', 'imagePath'], (data) => {
        const modifiedRecipe = data.modifiedRecipe.modified_recipe;
        const imagePath = data.imagePath;
        const recipeElement = document.getElementById('recipe');
        const recipeImageElement = document.getElementById('recipeImage'); // Targeting the image element

        console.log('Retrieved modifiedRecipe:', modifiedRecipe);
        console.log('Retrieved imagePath:', imagePath);

        if (modifiedRecipe) {
            displayRecipe(modifiedRecipe, recipeElement);
        } else {
            recipeElement.textContent = 'No recipe data found.';
        }

        // Set the image src dynamically using the stored path
        if (imagePath) {
            recipeImageElement.src = imagePath; // Assuming the image is saved with a .png extension
        } else {
            recipeImageElement.alt = 'No image available';
        }
    });

    // Save button functionality
    document.getElementById('saveRecipe').addEventListener('click', saveRecipe);

    function saveRecipe() {
        const recipeTitle = document.getElementById('recipe').querySelector('h1').textContent;
        const recipeContent = document.getElementById('recipe').innerHTML;

        chrome.storage.local.get({ recipes: [] }, function (result) {
            const recipes = result.recipes;
            chrome.storage.local.get('imagePath', (data) => {
                const imagePath = data.imagePath;
                recipes.push({ title: recipeTitle, content: recipeContent, imagePath: imagePath });

                chrome.storage.local.set({ recipes: recipes }, function () {
                    console.log('Recipe saved');
                    alert('Recipe saved successfully!');
                    window.location.href = 'library.html';
                });
            });
        });
    }

    function displayRecipe(modifiedRecipe, container) {
        container.textContent = '';

        const dishName = document.createElement('h1');
        dishName.textContent = modifiedRecipe['Name of the dish'] || 'Dish Name Not Specified';
        container.appendChild(dishName);

        const servings = document.createElement('p');
        servings.textContent = `Amount of servings: ${modifiedRecipe['Amount of servings'] || 'Not specified'}`;
        container.appendChild(servings);

        const cookingTime = document.createElement('p');
        cookingTime.textContent = `Cooking time: ${modifiedRecipe['Cooking time'] || 'Not specified'}`;
        container.appendChild(cookingTime);

        const ingredientsTitle = document.createElement('h2');
        ingredientsTitle.textContent = 'List of ingredients:';
        container.appendChild(ingredientsTitle);

        const ingredients = modifiedRecipe['List of ingredients'];
        if (ingredients && typeof ingredients === 'object') {
            const ingredientsList = document.createElement('ul');
            for (const [ingredient, amount] of Object.entries(ingredients)) {
                const li = document.createElement('li');
                li.textContent = `${ingredient}: ${amount}`;
                ingredientsList.appendChild(li);
            }
            container.appendChild(ingredientsList);
        } else {
            const noIngredients = document.createElement('p');
            noIngredients.textContent = 'No ingredients found.';
            container.appendChild(noIngredients);
        }

        const instructionsTitle = document.createElement('h2');
        instructionsTitle.textContent = 'Instructions:';
        container.appendChild(instructionsTitle);

        const instructions = modifiedRecipe['Instructions'];
        if (instructions) {
            if (Array.isArray(instructions)) {
                instructions.forEach((step, index) => {
                    const stepTitle = document.createElement('h3');
                    stepTitle.textContent = `Step ${index + 1}:`;
                    container.appendChild(stepTitle);

                    const stepContent = document.createElement('p');
                    stepContent.textContent = step;
                    container.appendChild(stepContent);
                });
            } else if (typeof instructions === 'string') {
                const steps = instructions.split(/(?<=\.)\s+/);
                steps.forEach((step, index) => {
                    const stepTitle = document.createElement('h3');
                    stepTitle.textContent = `Step ${index + 1}:`;
                    container.appendChild(stepTitle);

                    const stepContent = document.createElement('p');
                    stepContent.textContent = step;
                    container.appendChild(stepContent);
                });
            }
        } else {
            const noInstructions = document.createElement('p');
            noInstructions.textContent = 'No instructions found.';
            container.appendChild(noInstructions);
        }
    }
});