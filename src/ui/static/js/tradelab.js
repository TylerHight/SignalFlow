class TradeLab {
    constructor() {
        this.baseSymbol = 'USDT';
        this.charts = new Map();
        this.activeSymbols = new Set();
        this.chartData = new Map();
        this.websocket = null;
        this.initializeEventListeners();
        this.initializeBacktestingPanel();
        this.initializeWebSocket();
        this.initializeDataRefresh();
    }

    initializeEventListeners() {
        document.getElementById('cryptoSearch').addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.addChart(event.target.value.toUpperCase());
            }
        });

        document.getElementById('runBacktest').addEventListener('click', () => {
            this.runBacktest();
        });

        document.getElementById('clearCharts').addEventListener('click', () => {
            this.clearAllCharts();
        });

        document.getElementById('strategy').addEventListener('change', () => {
            this.updateStrategyParameters();
        });
    }

    initializeDataRefresh() {
        // Refresh data every minute
        setInterval(() => {
            this.charts.forEach((chart, symbol) => {
                this.fetchAndDisplayData(symbol, chart);
            });
        }, 60000); // 60 seconds
    }

    initializeBacktestingPanel() {
        const backtestPanel = document.getElementById('backtestPanel');
        const toggleButton = document.getElementById('toggleBacktest');
        let isPanelOpen = false;
        
        // Initially hide the panel
        backtestPanel.style.transform = 'translateX(100%)';
        toggleButton.style.right = '0';
        
        toggleButton.addEventListener('click', () => {
            isPanelOpen = !isPanelOpen;
            backtestPanel.style.transform = isPanelOpen ? 'translateX(0)' : 'translateX(100%)';
            toggleButton.style.transform = isPanelOpen ? 'translateX(0) rotate(180deg)' : 'translateX(0)';
            
            // Update button position when panel opens/closes
            toggleButton.style.right = isPanelOpen ? '16rem' : '0';
        });
    }

    async addChart(symbol) {
        if (this.activeSymbols.has(symbol)) {
            alert('This symbol is already displayed');
            return;
        }
        
        const symbolWithPair = symbol + this.baseSymbol;
 
        const chartContainer = document.createElement('div');
        chartContainer.className = 'bg-gray-800 p-4 rounded-lg flex flex-col';
        chartContainer.style.height = '400px';
        chartContainer.dataset.symbol = symbol;
        
        // Add header with crypto name and close button
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center mb-4';
        header.innerHTML = `
            <h3 class="text-xl font-bold">${symbol} - $0.00</h3>
            <button class="text-gray-400 hover:text-gray-200" onclick="window.tradeLab.removeChart('${symbol}')">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        `;
        chartContainer.appendChild(header);
        
        // Add chart container
        const chartDiv = document.createElement('div');
        chartDiv.style.height = 'calc(100% - 2rem)';
        chartContainer.appendChild(chartDiv);

        const chartGrid = document.getElementById('chartGrid');
        chartGrid.appendChild(chartContainer);

        const chart = this.createChart(chartDiv, symbol);
        this.charts.set(symbol, chart);
        this.activeSymbols.add(symbol);
        this.subscribeToSymbol(symbolWithPair);

        await this.fetchAndDisplayData(symbol, chart);
    }

    createChart(container, symbol) {
        const chart = LightweightCharts.createChart(container, {
            layout: {
                background: { color: '#1f2937' },
                textColor: '#d1d5db',
            },
            grid: {
                vertLines: { color: '#374151' },
                horzLines: { color: '#374151' },
            },
            timeScale: {
                borderColor: '#374151',
                timeVisible: true,
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
        });

        const candleSeries = chart.addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        return { chart, candleSeries };
    }

    async fetchAndDisplayData(symbol, chart) {
        try {
            const symbolWithPair = symbol + this.baseSymbol;
            const response = await fetch(`/api/historical-data/${symbolWithPair}`);
            const data = await response.json();
            const formattedData = data.map(d => ({
                time: d.time,
                open: parseFloat(d.open),
                high: parseFloat(d.high),
                low: parseFloat(d.low),
                close: parseFloat(d.close)
            }));
            if (formattedData.length > 0) {
                chart.candleSeries.setData(formattedData);
                this.chartData.set(symbol, formattedData[formattedData.length - 1]);
                this.updateChartTitle(symbol, formattedData[formattedData.length - 1].close);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    initializeWebSocket() {
        this.websocket = new WebSocket('wss://stream.binance.com:9443/ws');
        
        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.e === 'kline') {
                this.updateChartData(data);
            }
        };

        this.websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            // Attempt to reconnect after 5 seconds
            setTimeout(() => this.initializeWebSocket(), 5000);
        };

        this.websocket.onclose = () => {
            setTimeout(() => this.initializeWebSocket(), 5000);
        };
    }

    subscribeToSymbol(symbol) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            console.log(`Subscribing to ${symbol}`);
            const subscription = {
                method: 'SUBSCRIBE',
                params: [`${symbol.toLowerCase()}@kline_1m`],
                id: Date.now()
            };
            this.websocket.send(JSON.stringify(subscription));
        }
    }

    updateChartData(data) {
        const symbol = data.s.replace(this.baseSymbol, '');
        const chart = this.charts.get(symbol);
        
        if (chart) {
            const candleData = {
                time: data.k.t / 1000,
                open: parseFloat(data.k.o),
                high: parseFloat(data.k.h),
                low: parseFloat(data.k.l),
                close: parseFloat(data.k.c)
            };
            
            this.updateChartTitle(symbol, candleData.close);
            chart.candleSeries.update(candleData);
            this.chartData.set(symbol, candleData);
        }
    }

    async runBacktest() {
        const strategy = document.getElementById('strategy').value;
        const parameters = this.getStrategyParameters();
        
        try {
            const response = await fetch('/api/backtest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    strategy,
                    parameters,
                    symbols: Array.from(this.activeSymbols)
                })
            });

            const results = await response.json();
            this.displayBacktestResults(results);
        } catch (error) {
            console.error('Backtest error:', error);
        }
    }

    clearAllCharts() {
        this.charts.forEach(chart => chart.chart.remove());
        this.charts.clear();
        this.activeSymbols.clear();
        document.getElementById('chartGrid').innerHTML = '';
    }

    updateStrategyParameters() {
        // Update parameter inputs based on selected strategy
        const strategy = document.getElementById('strategy').value;
        const parametersContainer = document.getElementById('strategyParams');
        // Implementation for updating strategy parameters
    }

    getStrategyParameters() {
        // Collect current strategy parameters
        const parameters = {};
        // Implementation for collecting parameters
        return parameters;
    }

    displayBacktestResults(results) {
        const modal = document.getElementById('resultsModal');
        const content = document.getElementById('resultsContent');
        
        // Format and display results
        content.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-700 p-4 rounded">
                    <h4 class="text-lg mb-2">Performance Metrics</h4>
                    <p>Total Return: ${results.totalReturn}%</p>
                    <p>Win Rate: ${results.winRate}%</p>
                    <p>Sharpe Ratio: ${results.sharpeRatio}</p>
                </div>
                <div class="bg-gray-700 p-4 rounded">
                    <h4 class="text-lg mb-2">Trade Statistics</h4>
                    <p>Total Trades: ${results.totalTrades}</p>
                    <p>Winning Trades: ${results.winningTrades}</p>
                    <p>Losing Trades: ${results.losingTrades}</p>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }

    removeChart(symbol) {
        const chart = this.charts.get(symbol);
        if (chart) {
            chart.chart.remove();
            this.charts.delete(symbol);
            this.activeSymbols.delete(symbol);
            
            const container = document.querySelector(`[data-symbol="${symbol}"]`);
            if (container) {
                container.remove();
            }
        }
    }

    updateChartTitle(symbol, price) {
        const chartContainer = document.querySelector(`[data-symbol="${symbol}"]`);
        if (chartContainer) {
            const title = chartContainer.querySelector('h3');
            title.textContent = `${symbol} - $${price.toFixed(2)}`;
        }
    }
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tradeLab = new TradeLab();
});
