from flask import Flask, render_template, request, jsonify
from src.data.data_fetch.binance_data_fetch.data_fetcher import DataFetcher
import json

app = Flask(__name__)
data_fetcher = DataFetcher()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    # Fetch some initial data
    btc_price = data_fetcher.fetch_current_price()
    historical_data = data_fetcher.fetch_historical_data(limit=30)
    return render_template('dashboard.html', 
                         current_price=btc_price['price'],
                         historical_data=historical_data)

@app.route('/trading')
def trading():
    return render_template('trading.html')

@app.route('/settings')
def settings():
    return render_template('settings.html')

@app.route('/api/update-settings', methods=['POST'])
def update_settings():
    settings = request.json
    # TODO: Implement settings update logic
    return jsonify({"status": "success"})

@app.route('/api/toggle-trading', methods=['POST'])
def toggle_trading():
    data = request.json
    # TODO: Implement trading toggle logic
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(debug=True)
