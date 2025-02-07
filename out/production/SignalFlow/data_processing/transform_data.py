def transform_timestamps(data):
    """Transform unix timestamps into human-readable dates."""
    for row in data:
        row['open_time'] = pd.to_datetime(row['open_time'], unit='ms')
    return data