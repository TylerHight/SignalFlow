import json
import websocket
from threading import Thread

class BinanceWebSocket:
    def __init__(self, symbol="btcusdt", callback=None):
        self.symbol = symbol.lower()
        self.callback = callback
        self.ws = None
        self.ws_thread = None
        self.base_endpoint = "wss://stream.binance.us:9443/ws"
        self.stream = f"{self.symbol.lower()}@kline_1m"  # Changed to kline stream

    def connect(self):
        """Establish WebSocket connection"""
        websocket.enableTrace(True)
        self.ws = websocket.WebSocketApp(
            f"{self.base_endpoint}/{self.stream}",
            on_message=self._on_message,
            on_error=self._on_error,
            on_close=self._on_close,
            on_open=self._on_open
        )
        self.ws_thread = Thread(target=self.ws.run_forever)
        self.ws_thread.daemon = True
        self.ws_thread.start()

    def _on_message(self, ws, message):
        """Handle incoming messages"""
        data = json.loads(message)
        if data.get('e') == 'kline':
            kline_data = {
                'time': data['k']['t'] / 1000,
                'open': float(data['k']['o']),
                'high': float(data['k']['h']),
                'low': float(data['k']['l']),
                'close': float(data['k']['c']),
                'volume': float(data['k']['v']),
                'isClosed': data['k']['x']
            }
            if self.callback:
                self.callback(kline_data)

    def _on_error(self, ws, error):
        """Handle errors"""
        print(f"Error: {error}")

    def _on_close(self, ws, close_status_code, close_msg):
        """Handle connection close"""
        print("WebSocket connection closed")

    def _on_open(self, ws):
        """Handle connection open"""
        print("WebSocket connection established")

    def disconnect(self):
        """Close WebSocket connection"""
        if self.ws:
            self.ws.close()
