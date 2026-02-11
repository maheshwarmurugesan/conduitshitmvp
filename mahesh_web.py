# Web version of the name program using Flask
# This creates a website where you can enter your name!

from flask import Flask, request, render_template_string

app = Flask(__name__)

# HTML template for the webpage
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Name Greeter</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 500px;
            margin: 100px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
        }
        form {
            margin-top: 20px;
        }
        input[type="text"] {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 10px;
        }
        button:hover {
            background-color: #45a049;
        }
        .result {
            margin-top: 20px;
            padding: 15px;
            background-color: #e8f5e9;
            border-radius: 5px;
            color: #2e7d32;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>👋 Name Greeter</h1>
        <form method="POST">
            <input type="text" name="first_name" placeholder="Enter your first name" required>
            <input type="text" name="last_name" placeholder="Enter your last name" required>
            <button type="submit">Submit</button>
        </form>
        
        {% if result %}
        <div class="result">
            <strong>{{ result }}</strong>
        </div>
        {% endif %}
    </div>
</body>
</html>
"""

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        first_name = request.form.get('first_name', '')
        last_name = request.form.get('last_name', '')
        result = f"Hello, {first_name} {last_name}! Nice to meet you, {first_name}!"
        return render_template_string(HTML_TEMPLATE, result=result)
    return render_template_string(HTML_TEMPLATE, result=None)

if __name__ == '__main__':
    print("\n🌐 Starting web server...")
    print("📍 Open your browser and go to: http://localhost:5000")
    print("🛑 Press Ctrl+C to stop the server\n")
    app.run(debug=True, port=5000)


