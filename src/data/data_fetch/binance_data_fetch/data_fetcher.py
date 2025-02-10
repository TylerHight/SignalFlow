from .binance_client import BinanceClient
from .websocket_client import BinanceWebSocket
from ...data_processing.data_formatter import DataFormatter
import datetime
from src.utils.logging_service import LoggingService

class DataFetcher:
    """Fetches and formats data by integrating the client and formatter."""

    def __init__(self):
        self.client = BinanceClient()
        self.logger = LoggingService()

    def fetch_current_price(self, symbol="BTCUSDT"):
        """
        Fetch the current ticker price for a symbol.

        :param symbol: String. Trading pair symbol (e.g., 'BTCUSDT').
        :return: Dict containing the current price.
        """
        return self.client.get_ticker_price(symbol)
    
    def fetch_realtime_data(self, symbol="BTCUSDT", callback=None):
        """Fetch real-time data using WebSocket"""
        websocket_client = BinanceWebSocket(symbol, callback)
        websocket_client.connect()
        return websocket_client

    def fetch_historical_data(self, symbol="BTCUSDT", interval="1d", limit=100, start_date=None, end_date=None):
        """
        Fetch historical candlestick data for a symbol.

        :param symbol: String. Trading pair symbol.
        :param interval: String. Candlestick interval (e.g., '1d').
        :param limit: Integer. Number of candles.
        :param start_date: String. Start date (YYYY-MM-DD, optional).
        :param end_date: String. End date (YYYY-MM-DD, optional).
        :return: List of formatted candlestick data.
        """
        start_time = None
        end_time = None

        # Convert datetime if dates are provided
        if start_date:
            start_time = int(datetime.datetime.strptime(start_date, "%Y-%m-%d").timestamp() * 1000)
        if end_date:
            end_time = int(datetime.datetime.strptime(end_date, "%Y-%m-%d").timestamp() * 1000)

        raw_data = self.client.get_historical_candles(symbol, interval, limit, start_time, end_time)
        formatted_data = DataFormatter.format_historical_candles(raw_data)
        self.logger.debug(f"Fetched historical data for {symbol} - {len(formatted_data)} records")
        return formatted_data
