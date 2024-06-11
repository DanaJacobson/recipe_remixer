import os
from dotenv import load_dotenv
from scrapegraphai.graphs import SmartScraperGraph
import json
import openai

load_dotenv()

# Replace this with your actual OpenAI API key loading method
openai_key = "sk-proj-cKlHZWTLnw3x3xCCa57oT3BlbkFJVFvsHVlzbbkI7DB8vjbr"
client = openai.OpenAI(api_key="sk-proj-cKlHZWTLnw3x3xCCa57oT3BlbkFJVFvsHVlzbbkI7DB8vjbr")


graph_config = {
    "llm": {
        "api_key": openai_key,
        "model": "gpt-3.5-turbo",
    },
}

# Function to run the scraper
def run_scraper(url):
    smart_scraper_graph = SmartScraperGraph(
        prompt="""You are an expert in web scraping and extracting information from web pages. I will provide you with the source, and you need to extract the recipe information from it. Please extract the following details:
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
    Please provide a proper alternative for the problematic ingrediants. 
    For example, if the recipe includes cheese and the user request to change the recipe to vegan, give an alternative for the cheese.
    Try to provide an atlernative that will be similar to the original recipe taste and texture.
    
    
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
print("Modified Recipe:")
print(modified_recipe)