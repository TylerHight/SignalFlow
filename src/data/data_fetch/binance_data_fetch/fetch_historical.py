import datetime
from .binance_client import BinanceClient

def fetch_historical_data(symbol="BTCUSDT", interval="1d", limit=100, start_date=None, end_date=None):
    """
    Fetch and format historical data.

    :param symbol: String. Trading pair, default is 'BTCUSDT'.
    :param interval: String. Interval of candles, default is '1d'.
    :param limit: Integer. Number of candles, default is 100.
    :param start_date: String. Start date in 'YYYY-MM-DD' format (optional).
    :param end_date: String. End date in 'YYYY-MM-DD' format (optional).
    :return: List of formatted candlestick data.
    """
    start_time = None
    end_time = None

    # Convert dates to timestamps if provided
    if start_date:
        start_time = int(datetime.datetime.strptime(start_date, "%Y-%m-%d").timestamp() * 1000)
    if end_date:
        end_time = int(datetime.datetime.strptime(end_date, "%Y-%m-%d").timestamp() * 1000)

    # Fetch data
    raw_data = BinanceClient.get_historical_candles(symbol, interval, limit, start_time, end_time)

    # Format the fetched data
    formatted_data = []
    for candle in raw_data:
        formatted_data.append({
            "open_time": datetime.datetime.fromtimestamp(candle[0] / 1000).strftime('%Y-%m-%d %H:%M:%S'),
            "open": candle[1],
            "high": candle[2],
            "low": candle[3],
            "close": candle[4],
            "volume": candle[5],
            "close_time": datetime.datetime.fromtimestamp(candle[6] / 1000).strftime('%Y-%m-%d %H:%M:%S'),
        })
    return formatted_data
