from flask import Flask, request, jsonify, make_response
import main

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
    user_request = data.get('request')
    if url and user_request:
        print(f"Received URL: {url}")
        print(f"User Request: {user_request}")
        scraped_data = main.run_scraper(url)
        modified_recipe = main.modify_recipe(scraped_data, user_request)
        print("Modified Recipe:\n", modified_recipe)
        response = make_response(jsonify(modified_recipe), 200)
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response

    response = make_response('No URL or request provided', 400)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

if __name__ == '__main__':
    app.run(port=5000)
