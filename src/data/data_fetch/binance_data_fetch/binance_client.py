import requests

BASE_URL = "https://api.binance.com/api/v3"


class BinanceClient:
    """A client to interact with Binance's REST API."""

    @staticmethod
    def get_ticker_price(symbol):
        """
        Fetch the current ticker price for a given symbol.

        :param symbol: String. Trading pair symbol (e.g., 'BTCUSDT').
        :return: Dict containing price details.
        """
        url = f"{BASE_URL}/ticker/price"
        response = requests.get(url, params={"symbol": symbol})
        response.raise_for_status()  # Raise error for HTTP issues
        return response.json()

    @staticmethod
    def get_historical_candles(symbol, interval="1d", limit=100, start_time=None, end_time=None):
        """
        Fetch historical OHLC (Open, High, Low, Close) data.

        :param symbol: String. Trading pair symbol (e.g., 'BTCUSDT').
        :param interval: String. Candlestick interval.
        :param limit: Integer. Number of candles to fetch.
        :param start_time: Integer. Unix timestamp in milliseconds (optional).
        :param end_time: Integer. Unix timestamp in milliseconds (optional).
        :return: List of candlestick data.
        """
        url = f"{BASE_URL}/klines"
        params = {
            "symbol": symbol.upper(),
            "interval": interval,
            "limit": limit,
        }
        if start_time:
            params["startTime"] = start_time
        if end_time:
            params["endTime"] = end_time

        response = requests.get(url, params=params)
        response.raise_for_status()  # Raise error for HTTP issues
        return response.json()