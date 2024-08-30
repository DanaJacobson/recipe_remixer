import os
from dotenv import load_dotenv
from scrapegraphai.graphs import SmartScraperGraph
import json
import openai
import tinify
from flask import Flask, request, jsonify, make_response
import uuid

load_dotenv()

def run_scraper(url, openai_api_key):

    graph_config = {
    "llm": {
        "api_key": openai_api_key,
        "model": "gpt-3.5-turbo",
        },
    }      
    smart_scraper_graph = SmartScraperGraph(
        prompt="""Please extract the following details from the recipe in the source:

        - Name of the dish
        - List of ingredients (including the amount for each ingredient)
        - Instructions
        - Amount of servings
        - Cooking time
        """,
        source=url,
        config=graph_config,
    )

    result = smart_scraper_graph.run()
    return result


def modify_recipe(recipe_data, user_request, openai_api_key):
    client = client = openai.OpenAI(api_key=openai_api_key)
    prompt = f"""
    You are a culinary expert. Here is a recipe I scraped:

    {json.dumps(recipe_data, indent=2)}

    The user has requested the following changes: make this recipe {user_request}
    Please provide a whole recipe, modified with proper alternative for the problematic ingredients. 
    Please provide the modified recipe in the same JSON format.
    For example, if the recipe includes cheese and the user request to change the recipe to vegan, give an alternative for the cheese.
    Try to provide an alternative that will be similar to the original recipe taste and texture.

    Important:
    - List the ingredients in plain text, with the amount included in the same string (e.g., "1 cup sugar").
    - Do not use separate keys for "Ingredient" and "Amount" in the JSON.
    - Ensure that the structure for ingredients and instructions is consistent and easy to read.

    The JSON should include the following details if present in the original recipe:

        - Name of the dish
        - List of ingredients (including the emounts for each ingredient)
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


def flatten_ingredients(ingredients_list):
    flat_ingredients = []
    for item in ingredients_list:
        if isinstance(item, dict):
            for key in item.keys():
                flat_ingredients.append(key)
        else:
            flat_ingredients.append(item)
    return flat_ingredients


def generate_dish_image(modified_recipe, openai_api_key):
    client = openai.OpenAI(api_key=openai_api_key)
    dish_name = modified_recipe.get("Name of the dish", "")
    ingredients = modified_recipe.get("List of ingredients", [])
    ingredients_list = ', '.join(flatten_ingredients(ingredients))
    prompt = f"A delicious dish called {dish_name} made with the following ingredients: {ingredients_list}.. A high-quality, detailed, and appetizing image."

    response = client.images.generate(
        model="dall-e-2",
        prompt=prompt,
        n=1,
        size="1024x1024"
    )

    if response.data and len(response.data) > 0 and response.data[0].url:
        image_url = response.data[0].url
        return image_url
    else:
        print("Error generating image. The response did not contain a valid URL.")
        return None


def compress_image(image_url, tinify_api_key, output_dir="images"):
    tinify.key = tinify_api_key
    unique_filename = str(uuid.uuid4()) + ".png"
    output_path = os.path.join(output_dir, unique_filename)

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    source = tinify.from_url(image_url)
    source.to_file(output_path)

    return output_path


app = Flask(__name__)


@app.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route('/receive_url', methods=['OPTIONS', 'POST'])
def receive_url():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    try:
        data = request.get_json()
        url = data.get('url')
        user_request = data.get('request')
        openai_api_key = data.get('openai_key')
        tinify_api_key = data.get('tinify_key')
        if url and user_request and openai_api_key and tinify_api_key:
            print(f"Received URL: {url}")
            print(f"User Request: {user_request}")
            print("API keys received")

            scraped_data = run_scraper(url, openai_api_key)
            print("Scraped data:\n", scraped_data)
            modified_recipe = modify_recipe(scraped_data, user_request, openai_api_key)
            print("Modified Recipe:\n", modified_recipe)

            image_url = generate_dish_image(modified_recipe, openai_api_key)
            if image_url:
                print(f"Generated Image URL: {image_url}")  # for testing
                compressed_image_path = compress_image(image_url, tinify_api_key)

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

    except Exception as e:
        print("Error processing request:", str(e))
        response = make_response('Internal Server Error', 500)
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response


if __name__ == '__main__':
    app.run(port=5000)