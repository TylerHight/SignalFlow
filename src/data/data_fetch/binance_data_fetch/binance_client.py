import requests
from src.utils.logging_service import LoggingService
BASE_URL = "https://api.binance.us/api/v3"
logger = LoggingService()

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
        logger.debug(f"Fetching ticker price for {symbol}")
        response.raise_for_status()
        return response.json()

    @staticmethod
    def get_trading_pairs():
        """
        Fetch all available USDT trading pairs.
        
        :return: List of trading pairs and their current data
        """
        try:
            url = f"{BASE_URL}/ticker/24hr"
            response = requests.get(url)
            response.raise_for_status()
            logger.debug(f"Raw API response status: {response.status_code}")
            data = response.json()
            usdt_pairs = [item for item in data if item['symbol'].endswith('USDT')]
            logger.info(f"Fetched {len(usdt_pairs)} USDT trading pairs")
            logger.debug(f"First few USDT pairs: {usdt_pairs[:3]}")
            return usdt_pairs
        except Exception as e:
            logger.error(f"Error fetching trading pairs: {str(e)}")
            return []

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
