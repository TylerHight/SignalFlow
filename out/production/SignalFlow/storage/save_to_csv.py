import pandas as pd


def save_to_csv(data, file_name="data.csv"):
    """Save fetched data to a CSV file."""
    df = pd.DataFrame(data)
    df.to_csv(file_name, index=False)