import datetime

class DataFormatter:
    @staticmethod
    def format_klines(klines_data):
        """
        Format raw klines data for charting library
        """
        formatted_klines = []
        for kline in klines_data:
            formatted_kline = {
                'time': kline[0] / 1000,  # Convert milliseconds to seconds
                'open': float(kline[1]),
                'high': float(kline[2]),
                'low': float(kline[3]),
                'close': float(kline[4]),
                'volume': float(kline[5])
            }
            formatted_klines.append(formatted_kline)
        return formatted_klines

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