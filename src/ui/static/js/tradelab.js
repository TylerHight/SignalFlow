class TradeLab {
    constructor() {
        this.charts = new Map();
        this.activeSymbols = new Set();
        this.initializeEventListeners();
        this.initializeBacktestingPanel();
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

    initializeBacktestingPanel() {
        const backtestPanel = document.getElementById('backtestPanel');
        const toggleButton = document.getElementById('toggleBacktest');
        let isPanelOpen = false;
        
        // Initially hide the panel
        backtestPanel.style.transform = 'translateX(100%)';
        toggleButton.style.transform = 'translateX(0)';
        
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

        const chartContainer = document.createElement('div');
        chartContainer.className = 'bg-gray-800 p-4 rounded-lg';
        chartContainer.style.height = '400px';
        
        const chartGrid = document.getElementById('chartGrid');
        chartGrid.appendChild(chartContainer);

        // Create and store the chart instance
        const chart = this.createChart(chartContainer, symbol);
        this.charts.set(symbol, chart);
        this.activeSymbols.add(symbol);

        // Fetch and display initial data
        await this.fetchAndDisplayData(symbol, chart);
    }

    createChart(container, symbol) {
        // Implementation for creating a new chart
        // Using TradingView's lightweight charts
        return new Chart(container, {
            symbol: symbol,
            // Additional chart configuration
        });
    }

    async fetchAndDisplayData(symbol, chart) {
        try {
            const response = await fetch(`/api/historical-data/${symbol}`);
            const data = await response.json();
            chart.setData(data);
        } catch (error) {
            console.error('Error fetching data:', error);
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
        this.charts.forEach(chart => chart.destroy());
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
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tradeLab = new TradeLab();
});
