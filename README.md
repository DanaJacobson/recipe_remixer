***Recipe Remixer***

Version: 1.0

A Chrome extension designed to modify recipes according to dietary preferences, allowing users to create a personalized collection of recipes.

**Introduction**

Recipe Remixer is a Chrome extension that enables users to modify online recipes based on specific dietary requirements such as veganism, vegetarianism, or celiac disease. Users can save these personalized recipes in a library within the extension and add notes to each recipe. This extension aims to help users build a tailored collection of recipes that suit their individual dietary needs.

**Features**

Modify Recipes: Adjust recipes from any website to match dietary preferences.

Save Recipes: Store modified recipes in a personal library within the extension.

Add Notes: Write and save personal notes for each recipe.

Visual Representation: Generate and view an image of the dish based on the modified recipe.

User-Friendly Interface: Simple and intuitive design for easy navigation and use.

**Installation**

1. Clone or download the repository.
2. Active the server :
   - In the terminal "python server.py"
3. Load the extension in Chrome:
   - Open Chrome and navigate to chrome://extensions/.
   - Enable "Developer mode" in the top right corner.
   - Click "Load unpacked" and select the project directory.

**Usage**

Select a Recipe: Right-click on any recipe webpage and choose "Recipe Remixer" from the context menu.

Modify the Recipe: In the popup, select your dietary preferences (e.g., Vegan, Gluten-Free) and click "Submit".

View and Save: The modified recipe, along with a generated image, will appear in a new window. You can save it to your library or add notes.

Access Saved Recipes: Click on the library icon in the popup to view your collection of saved recipes.

**Customization**

To customize the extension:
- API Keys: Set your OpenAI and Tinify API keys in the extension's popup window.
- Dietary Preferences: You can select up to two dietary preferences when modifying a recipe.

**Technical Details**

- Scraper: The extension uses the scrapegraphai library to extract recipe details from web pages.
- Modification: Recipe modifications are performed by sending a request to the OpenAI API, which intelligently substitutes ingredients and adjusts instructions to meet dietary needs.
- Image Generation: A dish image is generated using OpenAI's DALL-E model, and the image is compressed using Tinify's API.
- Storage: Recipes, images, and notes are stored locally in the Chrome extension's storage.

**Code Structure**

Each JavaScript file in the project is paired with a corresponding HTML file to handle the user interface and interactions. The project also includes a manifest file, a CSS file for styling, a Python server for handling backend processes, and Google Analytics for tracking user interactions.
- server.py: A Flask-based server that handles scraping recipes, modifying them according to user preferences, and generating images for the recipes.

- background.js: Handles context menu actions, message passing, and periodic checks for recipe readiness.

- manifest.json: Defines the configuration and permissions for the Chrome extension.

- popup.js: Manages user interaction in the popup, including dietary preference selection and API key storage.
Corresponding HTML: popup.html

- loading.js: Manages the loading screen when the recipe is being modified or processed.
Corresponding HTML: loading.html

- recipe.js: Displays the modified recipe and handles saving to the library.
Corresponding HTML: recipe.html

- library.js: Manages the saved recipes and notes within the extension's library.
Corresponding HTML: library.html

- viewRecipe.js: Displays individual recipes from the library with the option to add comments.
Corresponding HTML: viewRecipe.html

- styles.css: Provides the styling for the HTML files, ensuring a consistent look and feel across the extension.

- Google Analytics: Integrated to track user interactions and usage patterns within the extension, providing insights into how the extension is used.

