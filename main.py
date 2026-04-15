import os
import telebot
import google.generativeai as genai
from flask import Flask, request, jsonify

# HARDCODED SENTRY LOGIC
TOKEN = '8171845032:AAEPTbDZTbHY6RepTAhJzkMTY3k6xdsqdDc'
GEMINI_KEY = 'AIzaSyAUzEe9Qjz99caeoXHccVgxdNdF9K6YdHQ'

bot = telebot.TeleBot(TOKEN)
genai.configure(api_key=GEMINI_KEY)
model = genai.GenerativeModel('gemini-pro')

app = Flask(__name__)

@bot.message_handler(func=lambda message: True)
def handle_message(message):
    try:
        response = model.generate_content(message.text)
        bot.reply_to(message, response.text)
    except Exception as e:
        print(f"Error: {e}")

@app.route('/' + TOKEN, methods=['POST'])
def getMessage():
    json_string = request.get_data().decode('utf-8')
    update = telebot.types.Update.de_json(json_string)
    bot.process_new_updates([update])
    return "!", 200

@app.route("/")
def webhook():
    bot.remove_webhook()
    # Replace URL with your service URL
    bot.set_webhook(url='https://azrael-sentry-233456537122.us-central1.run.app/' + TOKEN)
    # Return JSON so Vercel doesn't "Sever the Link"
    return jsonify({"status": "ONLINE", "sector": "Winston"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
