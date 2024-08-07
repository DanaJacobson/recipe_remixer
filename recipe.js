document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('modifiedRecipe', (data) => {
    const modifiedRecipe = data.modifiedRecipe.modified_recipe;
    const recipeElement = document.getElementById('recipe');

    // Log the retrieved data to the console for debugging
    console.log('Retrieved modifiedRecipe:', modifiedRecipe);

    if (modifiedRecipe) {
      // Clear any existing content
      recipeElement.textContent = '';

      // Create and append the name of the dish
      const dishName = document.createElement('h1');
      dishName.textContent = modifiedRecipe['Name of the dish'] || 'Dish Name Not Specified';
      recipeElement.appendChild(dishName);

      // Create and append the amount of servings
      const servings = document.createElement('p');
      servings.textContent = `Amount of servings: ${modifiedRecipe['Amount of servings'] || 'Not specified'}`;
      recipeElement.appendChild(servings);

      // Create and append the cooking time
      const cookingTime = document.createElement('p');
      cookingTime.textContent = `Cooking time: ${modifiedRecipe['Cooking time'] || 'Not specified'}`;
      recipeElement.appendChild(cookingTime);

      // Create and append the list of ingredients
      const ingredientsTitle = document.createElement('h2');
      ingredientsTitle.textContent = 'List of ingredients:';
      recipeElement.appendChild(ingredientsTitle);

      const ingredients = modifiedRecipe['List of ingredients'];
      if (Array.isArray(ingredients)) {
        const ingredientsList = document.createElement('ul');
        ingredients.forEach(ingredient => {
          const li = document.createElement('li');
          li.textContent = ingredient;
          ingredientsList.appendChild(li);
        });
        recipeElement.appendChild(ingredientsList);
      } else {
        const noIngredients = document.createElement('p');
        noIngredients.textContent = 'No ingredients found.';
        recipeElement.appendChild(noIngredients);
      }

      // Create and append the instructions
      const instructionsTitle = document.createElement('h2');
      instructionsTitle.textContent = 'Instructions:';
      recipeElement.appendChild(instructionsTitle);

      const instructions = modifiedRecipe['Instructions'];
      if (instructions) {
        let stepNumber = 1;
        for (const step in instructions) {
          const stepTitle = document.createElement('h3');
          stepTitle.textContent = `Step ${stepNumber}:`;
          recipeElement.appendChild(stepTitle);

          const stepContent = document.createElement('p');
          stepContent.textContent = instructions[step];
          recipeElement.appendChild(stepContent);

          stepNumber++;
        }
      } else {
        const noInstructions = document.createElement('p');
        noInstructions.textContent = 'No instructions found.';
        recipeElement.appendChild(noInstructions);
      }
    } else {
      recipeElement.textContent = 'No recipe data found.';
    }
  });
});