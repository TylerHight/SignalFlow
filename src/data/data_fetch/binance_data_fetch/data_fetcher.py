from .binance_client import BinanceClient
from ...data_processing.data_formatter import DataFormatter
import datetime


class DataFetcher:
    """Fetches and formats data by integrating the client and formatter."""

    def __init__(self):
        self.client = BinanceClient()

    def fetch_current_price(self, symbol="BTCUSDT"):
        """
        Fetch the current ticker price for a symbol.

        :param symbol: String. Trading pair symbol (e.g., 'BTCUSDT').
        :return: Dict containing the current price.
        """
        return self.client.get_ticker_price(symbol)

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
        return DataFormatter.format_historical_candles(raw_data)
