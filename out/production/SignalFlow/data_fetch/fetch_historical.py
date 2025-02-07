from binance_data_fetch.fetch_data import fetch_historical_candles
from storage.save_to_csv import save_to_csv

if __name__ == "__main__":
    data = fetch_historical_candles(symbol="BTCUSDT", interval="1d", limit=100)
    save_to_csv(data, file_name="bitcoin_historical.csv")