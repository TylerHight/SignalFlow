from flask import Flask, render_template, request, jsonify
from data.data_fetch.binance_data_fetch.fetch_data import fetch_historical_candles, fetch_current_price

app = Flask(__name__)


@app.route('/')
def index():
    """Home page displaying options for fetching data."""
    return render_template("index.html")


@app.route('/historical', methods=['POST', 'GET'])
def historical_data():
    """Fetch and display historical data."""
    if request.method == 'POST':
        symbol = request.form.get("symbol", "BTCUSDT")
        interval = request.form.get("interval", "1d")
        limit = int(request.form.get("limit", 10))

        # Fetch historical data using your script
        data = fetch_historical_candles(symbol=symbol, interval=interval, limit=limit)
        return render_template("historical_data.html", symbol=symbol, data=data)

    return render_template("historical_data.html", data=None)


@app.route('/live', methods=['POST', 'GET'])
def live_data():
    """Fetch and display current/live price."""
    if request.method == 'POST':
        symbol = request.form.get("symbol", "BTCUSDT")

        # Fetch current price using your script
        data = fetch_current_price(symbol=symbol)
        return render_template("live_data.html", symbol=symbol, data=data)

    return render_template("live_data.html", data=None)


if __name__ == "__main__":
    app.run(debug=True)