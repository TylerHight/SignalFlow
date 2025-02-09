class CryptoSearch {
    constructor() {
        this.searchInput = document.getElementById('cryptoSearch');
        this.searchResults = document.createElement('div');
        this.searchResults.className = 'search-results hidden absolute w-full bg-gray-700 mt-1 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto left-0 top-full';
        this.searchInput.parentNode.appendChild(this.searchResults);
       
        this.filterButton = document.getElementById('filterButton');
        this.filterMenu = this.createFilterMenu();
        this.selectedCryptos = new Set();
        this.filters = {
            marketCap: 'all',
            volume: 'all',
            priceChange: 'all'
        };
        this.mockData = this.getMockCryptoData();
        this.initializeEventListeners();
    }

    createFilterMenu() {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'hidden absolute right-0 mt-2 w-64 bg-gray-700 rounded-lg shadow-lg z-50 p-4';
        filterContainer.innerHTML = `
            <select class="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm" id="marketCapFilter">
                <option value="all">All Market Caps</option>
                <option value="high">High Cap (>$50B)</option>
                <option value="mid">Mid Cap ($10B-$50B)</option>
                <option value="low">Low Cap (<$10B)</option>
            </select>
            <select class="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm" id="volumeFilter">
                <option value="all">All Volumes</option>
                <option value="high">High Volume (>$500M)</option>
                <option value="mid">Mid Volume ($100M-$500M)</option>
                <option value="low">Low Volume (<$100M)</option>
            </select>
        `;
        document.body.appendChild(filterContainer);
        return filterContainer;
    }

    initializeEventListeners() {
        this.searchInput.addEventListener('input', () => this.filterResults());
        this.searchInput.addEventListener('focus', () => {
            this.displayResults(this.mockData);
            this.showResults();
        });
        this.filterButton.addEventListener('click', (event) => {
            event.stopPropagation();
            this.toggleFilterMenu();
        });
        document.addEventListener('click', (event) => {
            if (!this.searchInput.contains(event.target) && 
                !this.searchResults.contains(event.target)) {
                this.hideResults();
            }
        });
    }

    getMockCryptoData() {
        return [
            { symbol: 'BTC', name: 'Bitcoin', price: 45000, change24h: 2.5, volume: '1.2B', marketCap: '800B' },
            { symbol: 'ETH', name: 'Ethereum', price: 3200, change24h: 1.8, volume: '800M', marketCap: '380B' },
            { symbol: 'BNB', name: 'Binance Coin', price: 380, change24h: -0.5, volume: '400M', marketCap: '60B' },
            { symbol: 'SOL', name: 'Solana', price: 120, change24h: 3.2, volume: '300M', marketCap: '45B' },
            { symbol: 'ADA', name: 'Cardano', price: 1.2, change24h: -1.2, volume: '200M', marketCap: '40B' },
            { symbol: 'XRP', name: 'Ripple', price: 0.8, change24h: 1.5, volume: '150M', marketCap: '35B' },
            { symbol: 'DOT', name: 'Polkadot', price: 25, change24h: -0.8, volume: '120M', marketCap: '25B' },
            { symbol: 'DOGE', name: 'Dogecoin', price: 0.15, change24h: 4.2, volume: '180M', marketCap: '20B' },
            { symbol: 'AVAX', name: 'Avalanche', price: 85, change24h: 2.8, volume: '90M', marketCap: '18B' },
            { symbol: 'LINK', name: 'Chainlink', price: 18, change24h: -1.5, volume: '70M', marketCap: '15B' }
        ];
    }

    filterResults() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const filteredResults = this.mockData.filter(crypto => 
            crypto.symbol.toLowerCase().includes(searchTerm) || 
            crypto.name.toLowerCase().includes(searchTerm)
        );
        this.displayResults(filteredResults);
    }

    displayResults(results) {
        this.searchResults.innerHTML = '';
        results.forEach(crypto => {
            const resultItem = document.createElement('div');
            resultItem.className = 'p-3 hover:bg-gray-600 cursor-pointer flex justify-between items-center';
            resultItem.innerHTML = `
                <div class="flex items-center">
                    <input type="checkbox" class="mr-2" ${this.selectedCryptos.has(crypto.symbol) ? 'checked' : ''}>
                    <div>
                        <div class="font-bold">${crypto.symbol}</div>
                        <div class="text-sm text-gray-400">${crypto.name}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div>$${crypto.price.toLocaleString()}</div>
                    <div class="${crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'}">
                        ${crypto.change24h}%
                    </div>
                </div>
            `;

            const checkbox = resultItem.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    this.selectedCryptos.add(crypto.symbol);
                    this.searchInput.value = '';
                } else {
                    this.selectedCryptos.delete(crypto.symbol);
                }
                this.triggerSelectionChange();
            });

            this.searchResults.appendChild(resultItem);
        });
        this.showResults();
    }

    showResults() {
        this.searchResults.classList.remove('hidden');
        this.searchResults.style.width = this.searchInput.offsetWidth + 'px';
        this.searchResults.style.left = '0';
        this.searchResults.style.top = '100%';
    }

    hideResults() {
        this.searchResults.classList.add('hidden');
    }

    toggleFilterMenu() {
        const isHidden = this.filterMenu.classList.contains('hidden');
        if (isHidden) {
            const buttonRect = this.filterButton.getBoundingClientRect();
            this.filterMenu.style.top = `${buttonRect.bottom + window.scrollY}px`;
            this.filterMenu.style.right = `${window.innerWidth - buttonRect.right}px`;
        }
        this.filterMenu.classList.toggle('hidden');
    }

    triggerSelectionChange() {
        const event = new CustomEvent('cryptoSelectionChange', {
            detail: Array.from(this.selectedCryptos)
        });
        document.dispatchEvent(event);
    }

    getSelectedCryptos() {
        return Array.from(this.selectedCryptos);
    }

    submitSelected() {
        const selectedSymbols = Array.from(this.selectedCryptos);
        if (selectedSymbols.length === 0) {
            alert('Please select at least one cryptocurrency');
            return;
        }

        // Create panels for selected cryptocurrencies
        selectedSymbols.forEach(symbol => {
            window.tradeLab.addChart(symbol);
        });

        // Clear selections and hide dropdown
        this.selectedCryptos.clear();
        this.hideResults();
        this.searchInput.value = '';
    }
}
