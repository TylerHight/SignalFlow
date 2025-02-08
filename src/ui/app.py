from flask import Flask, render_template, request, jsonify, Response
from src.data.data_fetch.binance_data_fetch.data_fetcher import DataFetcher
from src.data.data_fetch.binance_data_fetch.websocket_client import BinanceWebSocket
from src.trading.backtesting.backtest_engine import BacktestEngine
from src.trading.technical_analysis.indicators import TechnicalIndicators
from src.trading.execution.trade_executor import TradeExecutor
import json

app = Flask(__name__)
data_fetcher = DataFetcher()
trade_executor = TradeExecutor(data_fetcher.client)
backtest_engine = BacktestEngine()

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/trade-lab')
def trade_lab():
    return render_template("trade_lab.html")

@app.route('/live-trading')
def live_trading():
    return render_template("live_trading.html")

@app.route('/api/technical/indicators', methods=['POST'])
def calculate_indicators():
    """Calculate technical indicators for given data"""
    data = request.json
    prices = data.get('prices', [])
    indicator = data.get('indicator')
    params = data.get('params', {})

    try:
        if indicator == 'sma':
            result = TechnicalIndicators.calculate_sma(prices, params.get('period', 20))
        elif indicator == 'rsi':
            result = TechnicalIndicators.calculate_rsi(prices, params.get('period', 14))
        elif indicator == 'macd':
            result = TechnicalIndicators.calculate_macd(prices)
        else:
            return jsonify({'error': 'Invalid indicator'})

        return jsonify({'result': result.tolist() if hasattr(result, 'tolist') else result})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/trade/market', methods=['POST'])
def place_market_order():
    """Place a market order"""
    data = request.json
    response = trade_executor.place_market_order(
        data['symbol'],
        data['side'],
        float(data['quantity'])
    )
    return jsonify(response)

@app.route('/api/trade/positions', methods=['GET'])
def get_positions():
    """Get all open positions"""
    positions = {
        symbol: position
        for symbol, position in trade_executor.open_positions.items()
    }
    return jsonify(positions)

@app.route('/api/stream/price/<symbol>')
def stream_price(symbol):
    """Stream real-time price data"""
    def generate():
        def on_message(data):
            yield f"data: {json.dumps(data)}\n\n"

        ws_client = BinanceWebSocket(symbol=symbol, callback=on_message)
        ws_client.connect()
        
        try:
            while True:
                yield from on_message
        except GeneratorExit:
            ws_client.disconnect()

    return Response(
        generate(),
        mimetype='text/event-stream',
        headers={'Cache-Control': 'no-cache', 'Connection': 'keep-alive'}
    )

@app.route('/api/backtest/run', methods=['POST'])
def run_backtest():
    """Run backtest with specified parameters"""
    data = request.json
    
    try:
        # Fetch historical data
        historical_data = data_fetcher.fetch_historical_data(
            symbol=data['symbol'],
            interval=data['timeframe'],
            start_date=data['start_date'],
            end_date=data['end_date']
        )
        
        # Run backtest
        results = backtest_engine.run_backtest(
            historical_data=historical_data,
            strategy_params={
                'sma': data.get('sma', False),
                'rsi': data.get('rsi', False),
                'macd': data.get('macd', False),
                'sma_period': data.get('sma_period', 20),
                'rsi_period': data.get('rsi_period', 14)
            }
        )
        
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == "__main__":
    app.run(debug=True)
