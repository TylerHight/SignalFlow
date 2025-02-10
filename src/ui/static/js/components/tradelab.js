class TradeLab {
    constructor() {
        this.activeSymbols = new Set();
        this.charts = new Map();
        this.chartData = new Map();
        this.websocket = null;
        this.initializeEventListeners();
        this.initializeBacktestingPanel();
        this.initializeWebSocket();
    }

    async addChart(symbol) {
        if (this.activeSymbols.has(symbol)) {
            alert('This symbol is already displayed');
            return;
        }
        const symbolWithPair = symbol + 'USDT';

        const chartContainer = document.createElement('div');
        chartContainer.className = 'bg-gray-800 p-4 rounded-lg flex flex-col';
        chartContainer.style.height = '400px';
        
        // Add header with crypto name and close button
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center mb-4';
        header.innerHTML = `
            <h3 class="text-xl font-bold">${symbol}</h3>
            <button class="text-gray-400 hover:text-gray-200" onclick="window.tradeLab.removeChart('${symbol}')">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        `;
        chartContainer.appendChild(header);

        const chart = this.createChart(chartContainer, symbol);
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
            const symbolWithPair = symbol + 'USDT';
            const response = await fetch(`/api/historical-data/${symbolWithPair}`);
            const data = await response.json();
            const formattedData = data.map(d => ({
                time: d.time,
                open: parseFloat(d.open),
                high: parseFloat(d.high),
                low: parseFloat(d.low),
                close: parseFloat(d.close)
            }));
            chart.candleSeries.setData(formattedData);
            this.chartData.set(symbol, formattedData[formattedData.length - 1]);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
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

    initializeEventListeners() {
        // Add event listener code here
    }

    initializeBacktestingPanel() {
        // Add backtesting panel code here
    }

    initializeWebSocket() {
        // Add WebSocket initialization code here
    }

    subscribeToSymbol(symbol) {
        // Add WebSocket subscription code here
    }
}
