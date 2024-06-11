import os
from dotenv import load_dotenv
from scrapegraphai.graphs import SmartScraperGraph
import json
import openai

load_dotenv()

OPENAI_API_KEY = "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"
client = openai.OpenAI(api_key="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")

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

    {recipe_data}

    The user has requested the following changes: {user_request}
    Please provide a whole recipe, modified with proper alternative for the problematic ingrediants. 
    For example, if the recipe includes cheese and the user request to change the recipe to vegan, give an alternative for the cheese.
    Try to provide an alternative that will be similar to the original recipe taste and texture.
    Please give only the following details if present in the recipe with the necessary changes:

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
    return modified_recipe


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