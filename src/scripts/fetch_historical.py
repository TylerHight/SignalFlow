from data.data_fetch.binance_data_fetch.data_fetcher import DataFetcher
from data.storage import save_to_csv

if __name__ == "__main__":
    # Initialize fetcher
    fetcher = DataFetcher()

    # Customize parameters
    SYMBOL = "BTCUSDT"
    INTERVAL = "1d"
    LIMIT = 10
    START_DATE = "2023-01-01"  # Optional
    END_DATE = "2023-01-10"  # Optional

    # Fetch historical data
    print(f"Fetching historical data for {SYMBOL}...")
    historical_data = fetcher.fetch_historical_data(SYMBOL, INTERVAL, LIMIT, START_DATE, END_DATE)

    # Print data
    for row in historical_data:
        print(row)

    # Save to CSV
    save_to_csv.save_to_csv(historical_data, f"{SYMBOL}_historical_data.csv")
