from binance_client import get_ticker_price, get_historical_ohlc


def fetch_current_price(symbol="BTCUSDT"):
    """Fetch and format the current price of a given symbol."""
    data = get_ticker_price(symbol)
    print(f"Current price of {symbol}: {data['price']}")
    return data


def fetch_historical_candles(symbol="BTCUSDT", interval="1d", limit=10):
    """Fetch and format historical OHLC candlestick data."""
    candles = get_historical_ohlc(symbol, interval, limit)
    formatted_candles = [
        {
            'open_time': c[0],
            'open': c[1],
            'high': c[2],
            'low': c[3],
            'close': c[4],
            'volume': c[5]
        }
        for c in candles
    ]
    return formatted_candles