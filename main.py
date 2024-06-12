import os
from dotenv import load_dotenv
from scrapegraphai.graphs import SmartScraperGraph
import json
import openai
import tinify


load_dotenv()

OPENAI_API_KEY = "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"
client = openai.OpenAI(api_key=OPENAI_API_KEY)
tinify.key = "48dwhSBSx7zbMzZkX9kT8pj6rkmwcmCJ"


graph_config = {
    "llm": {
        "api_key": OPENAI_API_KEY,
        "model": "gpt-3.5-turbo",
    },
}


# Function to run the scraper
def run_scraper(url):
    smart_scraper_graph = SmartScraperGraph(
        prompt="""You are an expert in web scraping and extracting information from web pages. I will provide you the source, 
        and you need to extract the recipe information from it. Please extract the following details:

        - Name of the dish
        - List of ingredients
        - Instructions
        - Amount of servings
        - Cooking time
        """,
        source=url,
        config=graph_config
    )

    result = smart_scraper_graph.run()
    return result


def modify_recipe(recipe_data, user_request):
    prompt = f"""
    You are a culinary expert. Here is a recipe I scraped:

    {json.dumps(recipe_data, indent=2)}

    The user has requested the following changes: {user_request}
    Please provide a whole recipe, modified with proper alternative for the problematic ingrediants. 
    Please provide the modified recipe in the same JSON format.
    For example, if the recipe includes cheese and the user request to change the recipe to vegan, give an alternative for the cheese.
    Try to provide an alternative that will be similar to the original recipe taste and texture.
    The JSON should include the following details if present in the original recipe:

        - Name of the dish
        - List of ingredients
        - Instructions
        - Amount of servings
        - Cooking time
    """

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a culinary expert."},
            {"role": "user", "content": prompt}
        ]
    )

    modified_recipe = response.choices[0].message.content
    try:
        modified_recipe_json = json.loads(modified_recipe)
    except json.JSONDecodeError:
        modified_recipe_json = {"error": "The response could not be parsed as JSON. Please try again."}
    
    return modified_recipe_json

# Function to flatten the ingredients list
def flatten_ingredients(ingredients_list):
    flat_ingredients = []
    for item in ingredients_list:
        if isinstance(item, dict):
            for key in item.keys():
                flat_ingredients.append(key)
        else:
            flat_ingredients.append(item)
    return flat_ingredients

# Function to generate an image using DALL-E 2
def generate_dish_image(modified_recipe):
    dish_name = modified_recipe.get("Name of the dish")
    ingredients = flatten_ingredients(modified_recipe.get("List of ingredients", []))
    ingredients_list = ','.join(ingredients)
    prompt = f"A delicious dish called {dish_name} made with the following ingredients: {ingredients_list}. A high-quality, detailed, and appetizing image."
    
    response = client.images.generate(
        prompt=prompt,
        n=1,
        size="1024x1024"
    )
    
    image_url = response.data[0].url
    return image_url

# Function to compress the image from URL
def compress_image(image_url, output_path):
    # Compress the image using TinyPNG
    source = tinify.from_url(image_url)
    source.to_file(output_path)
    
    return output_path

# Get the URL from the user
user_url = input("Please enter the recipe URL: ")
# Run the scraper with the provided URL
scraped_data = run_scraper(user_url)
print("This is the original recipe:\n")
print(scraped_data)
print("\n")

user_request = input("Please enter your request for modifying the recipe: ")

# Modify the recipe using GPT-3.5
modified_recipe = modify_recipe(scraped_data, user_request)
print("Modified Recipe:\n")
print(modified_recipe)
image_url = generate_dish_image(modified_recipe)
#print("image of the modified dish:\n")
#print(image_url)

if image_url:
    # Compress the image
    compressed_image_path = compress_image(image_url, "compressed_image.png")
    print(f"Compressed image saved as '{compressed_image_path}'")

else:
    print("Could not generate the image. Dish name or ingredients are missing.")
