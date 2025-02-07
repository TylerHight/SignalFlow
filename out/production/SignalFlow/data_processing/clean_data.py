import pandas as pd


def clean_missing_values(data):
    """Remove rows with missing or incomplete data."""
    df = pd.DataFrame(data)
    return df.dropna()