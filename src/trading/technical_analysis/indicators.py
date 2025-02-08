import numpy as np
import pandas as pd

class TechnicalIndicators:
    @staticmethod
    def calculate_simple_moving_average(data, period=20):
        """Calculate Simple Moving Average"""
        return pd.Series(data).rolling(window=period).mean()

    @staticmethod
    def calculate_exponential_moving_average(data, period=20):
        """Calculate Exponential Moving Average"""
        return pd.Series(data).ewm(span=period, adjust=False).mean()

    @staticmethod
    def calculate_relative_strength_index(data, period=14):
        """Calculate Relative Strength Index"""
        delta = pd.Series(data).diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        
        relative_strength = gain / loss
        relative_strength_index = 100 - (100 / (1 + relative_strength))
        return relative_strength_index

    @staticmethod
    def calculate_moving_average_convergence_divergence(data, fast_period=12, slow_period=26, signal_period=9):
        """Calculate MACD (Moving Average Convergence Divergence)"""
        exponential_moving_average_fast = pd.Series(data).ewm(span=fast_period, adjust=False).mean()
        exponential_moving_average_slow = pd.Series(data).ewm(span=slow_period, adjust=False).mean()
        
        macd_line = exponential_moving_average_fast - exponential_moving_average_slow
        signal_line = macd_line.ewm(span=signal_period, adjust=False).mean()
        macd_histogram = macd_line - signal_line
        
        return macd_line, signal_line, macd_histogram

    @staticmethod
    def calculate_bollinger_bands(data, period=20, standard_deviation=2):
        """Calculate Bollinger Bands"""
        simple_moving_average = pd.Series(data).rolling(window=period).mean()
        standard_deviation_value = pd.Series(data).rolling(window=period).std()
        
        upper_band = simple_moving_average + (standard_deviation_value * standard_deviation)
        lower_band = simple_moving_average - (standard_deviation_value * standard_deviation)
        
        return upper_band, simple_moving_average, lower_band
