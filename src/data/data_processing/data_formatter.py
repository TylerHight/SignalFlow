import datetime


class DataFormatter:
    """Handles formatting of raw data from Binance API."""

    @staticmethod
    def format_historical_candles(raw_candles):
        """
        Format raw OHLC candlestick data into a more readable structure.

        :param raw_candles: List of raw candlestick data from Binance API.
        :return: List of formatted candlestick data.
        """
        formatted_data = []
        for candle in raw_candles:
            formatted_data.append({
                "open_time": datetime.datetime.fromtimestamp(candle[0] / 1000).strftime('%Y-%m-%d %H:%M:%S'),
                "open": float(candle[1]),
                "high": float(candle[2]),
                "low": float(candle[3]),
                "close": float(candle[4]),
                "volume": float(candle[5]),
                "close_time": datetime.datetime.fromtimestamp(candle[6] / 1000).strftime('%Y-%m-%d %H:%M:%S'),
            })
        return formatted_data