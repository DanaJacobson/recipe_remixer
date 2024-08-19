document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('modifiedRecipe', (data) => {
    const modifiedRecipe = data.modifiedRecipe.modified_recipe;
    const recipeElement = document.getElementById('recipe');

    // Log the retrieved data to the console for debugging
    console.log('Retrieved modifiedRecipe:', modifiedRecipe);

    if (modifiedRecipe) {
        displayRecipe(modifiedRecipe, recipeElement);
    } else {
        recipeElement.textContent = 'No recipe data found.';
    }
    });

    // Save button functionality
    document.getElementById('saveRecipe').addEventListener('click', saveRecipe);

    function saveRecipe() {
        const recipeTitle = document.getElementById('recipe').querySelector('h1').textContent;
        const recipeContent = document.getElementById('recipe').innerHTML;

        // Get the existing recipes from storage
        chrome.storage.local.get({ recipes: [] }, function (result) {
            const recipes = result.recipes;

            // Add the new recipe
            recipes.push({ title: recipeTitle, content: recipeContent });

            // Save back to storage
            chrome.storage.local.set({ recipes: recipes }, function () {
                console.log('Recipe saved');
                alert('Recipe saved successfully!');
                window.location.href = 'library.html';  // Redirect to the library view after saving
            });
        });
    }

    function displayRecipe(modifiedRecipe, container) {
        // Clear any existing content
        container.textContent = '';
    
        // Create and append the name of the dish
        const dishName = document.createElement('h1');
        dishName.textContent = modifiedRecipe['Name of the dish'] || 'Dish Name Not Specified';
        container.appendChild(dishName);
    
        // Create and append the amount of servings
        const servings = document.createElement('p');
        servings.textContent = `Amount of servings: ${modifiedRecipe['Amount of servings'] || 'Not specified'}`;
        container.appendChild(servings);
    
        // Create and append the cooking time
        const cookingTime = document.createElement('p');
        cookingTime.textContent = `Cooking time: ${modifiedRecipe['Cooking time'] || 'Not specified'}`;
        container.appendChild(cookingTime);
    
        // Create and append the list of ingredients
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
    
        // Create and append the instructions
        const instructionsTitle = document.createElement('h2');
        instructionsTitle.textContent = 'Instructions:';
        container.appendChild(instructionsTitle);
    
        const instructions = modifiedRecipe['Instructions'];
        if (instructions) {
            // Check if instructions are a list or a string
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
                // Split instructions string into steps if necessary
                const steps = instructions.split(/(?<=\.)\s+/); // Split based on period followed by space
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
