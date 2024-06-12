import os
import sys
from dotenv import load_dotenv
from scrapegraphai.graphs import SmartScraperGraph
import json
import openai
import tinify
from flask import Flask, request, jsonify, make_response

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


def modify_recipe(recipe_data, user_requests):
    user_requests_str = ", ".join(user_requests)
    prompt = f"""
    You are a culinary expert. Here is a recipe I scraped:

    {json.dumps(recipe_data, indent=2)}

    The user has requested the following changes: {user_requests_str}
    Please provide a whole recipe, modified with proper alternative for the problematic ingredients. 
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
    
    if 'data' in response and len(response.data) > 0:
        image_url = response.data[0].url
        return image_url
    else:
        print("Error generating image:", response)
        return None


# Function to compress the image from URL
def compress_image(image_url, output_path):
    # Compress the image using TinyPNG
    source = tinify.from_url(image_url)
    source.to_file(output_path)

    return output_path


app = Flask(__name__)

@app.route('/receive_url', methods=['OPTIONS', 'POST'])
def receive_url():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    data = request.get_json()
    url = data.get('url')
    user_requests = data.get('request')
    if url and user_requests:
        print(f"Received URL: {url}")
        print(f"User Requests: {user_requests}")
        
        # Run the scraper and modify the recipe
        scraped_data = run_scraper(url)
        modified_recipe = modify_recipe(scraped_data, user_requests)
        print("Modified Recipe:\n", modified_recipe)
        
        # Generate image URL
        image_url = generate_dish_image(modified_recipe)
        print(image_url)
        if image_url:
            # Compress the image
            compressed_image_path = compress_image(image_url, "compressed_image.png")
            print(f"Compressed image saved as '{compressed_image_path}'")
            
            # Displaying the image path
            absolute_path = os.path.abspath(compressed_image_path)
            print(f"Image available at: {absolute_path}")

            print(f"To view the image, open the following path in an image viewer: {absolute_path}")

        else:
            print("Could not generate the image. Dish name or ingredients are missing.")
            compressed_image_path = None

        response_data = {
            "modified_recipe": modified_recipe,
            "compressed_image_path": compressed_image_path
        }
        
        response = make_response(jsonify(response_data), 200)
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response

        response = make_response('No URL or request provided', 400)
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response

if __name__ == '__main__':
    app.run(port=5000)
