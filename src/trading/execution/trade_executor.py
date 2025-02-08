from datetime import datetime
from typing import Dict, Optional

class TradeExecutor:
    def __init__(self, client):
        self.client = client
        self.open_positions = {}
        self.order_history = []

    def place_market_order(self, symbol: str, side: str, quantity: float) -> Dict:
        """
        Place a market order
        
        :param symbol: Trading pair symbol
        :param side: 'BUY' or 'SELL'
        :param quantity: Order quantity
        :return: Order response
        """
        try:
            order = {
                'symbol': symbol,
                'side': side,
                'type': 'MARKET',
                'quantity': quantity,
                'timestamp': datetime.now().isoformat()
            }
            
            # Here we would normally interact with the exchange application programming interface
            # For now, we'll just simulate the order
            if side == 'BUY':
                self.open_positions[symbol] = {
                    'quantity': quantity,
                    'entry_price': float(self.client.get_ticker_price(symbol)['price'])
                }
            
            self.order_history.append(order)
            return order
            
        except Exception as e:
            return {'error': str(e)}

    def place_limit_order(self, symbol: str, side: str, quantity: float, price: float) -> Dict:
        """
        Place a limit order
        
        :param symbol: Trading pair symbol
        :param side: 'BUY' or 'SELL'
        :param quantity: Order quantity
        :param price: Limit price
        :return: Order response
        """
        try:
            order = {
                'symbol': symbol,
                'side': side,
                'type': 'LIMIT',
                'quantity': quantity,
                'price': price,
                'timestamp': datetime.now().isoformat()
            }
            
            self.order_history.append(order)
            return order
            
        except Exception as e:
            return {'error': str(e)}

    def get_position(self, symbol: str) -> Optional[Dict]:
        """Get current position for a symbol"""
        return self.open_positions.get(symbol)

    def get_order_history(self) -> list:
        """Get order history"""
        return self.order_history

    def close_position(self, symbol: str) -> Dict:
        """
        Close an open position
        
        :param symbol: Trading pair symbol
        :return: Order response
        """
        position = self.open_positions.get(symbol)
        if position:
            order = self.place_market_order(symbol, 'SELL', position['quantity'])
            if 'error' not in order:
                del self.open_positions[symbol]
            return order
        return {'error': 'No position found'}
