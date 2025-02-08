import pandas as pandas
import numpy as numpy
from ..technical_analysis.indicators import TechnicalIndicators

class BacktestEngine:
    def __init__(self, initial_capital=10000.0):
        self.initial_capital = initial_capital
        self.capital = initial_capital
        self.positions = {}
        self.trades = []
        self.indicators = TechnicalIndicators()
        
    def run_backtest(self, historical_data, strategy_params):
        """
        Run backtest with given historical data and strategy parameters
        
        :param historical_data: DataFrame with OHLCV data
        :param strategy_params: Dict containing strategy parameters
        :return: Dict containing backtest results
        """
        df = pandas.DataFrame(historical_data)
        
        # Calculate indicators based on strategy parameters
        if strategy_params.get('sma'):
            df['SMA'] = self.indicators.calculate_simple_moving_average(df['close'], 
                                                                      strategy_params['sma_period'])
        
        if strategy_params.get('rsi'):
            df['RSI'] = self.indicators.calculate_relative_strength_index(df['close'], 
                                                                        strategy_params['rsi_period'])
        
        if strategy_params.get('macd'):
            macd_line, signal_line, histogram = self.indicators.calculate_moving_average_convergence_divergence(
                df['close']
            )
            df['MACD'] = macd_line
            df['Signal'] = signal_line
            df['Histogram'] = histogram
        
        # Run strategy
        signals = self._generate_signals(df, strategy_params)
        results = self._execute_signals(df, signals)
        
        return self._calculate_metrics(results)
    
    def _generate_signals(self, df, strategy_params):
        """Generate trading signals based on indicators"""
        signals = pandas.Series(index=df.index, data=0)
        
        if strategy_params.get('sma'):
            # Simple SMA crossover strategy
            signals[df['close'] > df['SMA']] = 1
            signals[df['close'] < df['SMA']] = -1
            
        if strategy_params.get('rsi'):
            # RSI overbought/oversold strategy
            signals[df['RSI'] < 30] = 1
            signals[df['RSI'] > 70] = -1
            
        if strategy_params.get('macd'):
            # MACD crossover strategy
            signals[df['MACD'] > df['Signal']] = 1
            signals[df['MACD'] < df['Signal']] = -1
            
        return signals
    
    def _execute_signals(self, df, signals):
        """Execute trading signals and track performance"""
        position = 0
        equity = []
        returns = []
        
        for i in range(len(df)):
            if signals[i] != 0 and position != signals[i]:
                # Execute trade
                position = signals[i]
                self.trades.append({
                    'timestamp': df.index[i],
                    'price': df['close'][i],
                    'type': 'buy' if position == 1 else 'sell',
                    'size': self.capital / df['close'][i]
                })
            
            # Track equity
            current_equity = self.capital
            if position != 0:
                current_equity = self.capital * (1 + position * (df['close'][i] - self.trades[-1]['price']) 
                                              / self.trades[-1]['price'])
            equity.append(current_equity)
            returns.append((current_equity - equity[-2]) / equity[-2] if i > 0 else 0)
        
        return pandas.DataFrame({
            'equity': equity,
            'returns': returns
        }, index=df.index)
    
    def _calculate_metrics(self, results):
        """Calculate performance metrics"""
        total_return = (results['equity'].iloc[-1] - self.initial_capital) / self.initial_capital
        sharpe_ratio = numpy.sqrt(252) * results['returns'].mean() / results['returns'].std()
        max_drawdown = (results['equity'] / results['equity'].cummax() - 1).min()
        win_rate = len([t for t in self.trades if t['type'] == 'buy']) / len(self.trades) if self.trades else 0
        
        return {
            'total_return': total_return,
            'sharpe_ratio': sharpe_ratio,
            'max_drawdown': max_drawdown,
            'win_rate': win_rate,
            'trades': self.trades,
            'equity_curve': results['equity'].tolist()
        }
