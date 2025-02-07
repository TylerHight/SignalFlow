import requests

BINANCE_BASE_URL = "https://api.binance.com"


def get_ticker_price(symbol):
    """Fetch the current price of a given symbol (e.g., BTCUSDT)."""
    url = f"{BINANCE_BASE_URL}/api/v3/ticker/price"
    params = {"symbol": symbol.upper()}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to fetch price: {response.status_code}, {response.text}")


def get_historical_ohlc(symbol, interval="1d", limit=100):
    """Fetch historical OHLC candlestick data."""
    url = f"{BINANCE_BASE_URL}/api/v3/klines"
    params = {
        "symbol": symbol.upper(),
        "interval": interval,
        "limit": limit
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to fetch historical data: {response.status_code}, {response.text}")