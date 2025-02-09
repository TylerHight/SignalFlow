from flask import Flask, render_template, request, jsonify
from src.data.data_fetch.binance_data_fetch.data_fetcher import DataFetcher
from src.data.data_fetch.binance_data_fetch.binance_client import BinanceClient
from src.utils.logging_service import LoggingService
import json

app = Flask(__name__)
data_fetcher = DataFetcher()
logger = LoggingService()

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

@app.route('/tradelab')
def tradelab():
    return render_template('tradelab.html')

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

@app.route('/api/trading-pairs')
def get_trading_pairs():
    try:
        client = BinanceClient()
        pairs = client.get_trading_pairs()
        logger.debug(f"Raw trading pairs data: {pairs[:5]}...")  # Log first 5 pairs
        return jsonify(pairs)
    except Exception as e:
        logger.error(f"Detailed error in /api/trading-pairs: {str(e)}")
        logger.exception("Full traceback:")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
