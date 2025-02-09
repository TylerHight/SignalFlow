class CryptoSearch {
    constructor() {
        this.cryptoData = [];
        this.searchInput = document.getElementById('cryptoSearch');
        this.searchResults = document.createElement('div');
        console.log('Initializing CryptoSearch component'); // Log initialization
        this.searchResults.className = 'search-results absolute w-full bg-gray-700 mt-1 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto';
        this.searchInput.parentNode.appendChild(this.searchResults);
        this.selectedCryptos = new Set();
        this.fetchCryptoData();
        this.initializeEventListeners();
    }

    createFilterMenu() {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'hidden absolute right-24 mt-2 w-64 bg-gray-700 rounded-lg shadow-lg z-50 p-4';
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
        // Attach event listeners to handle input and focus events
        console.log('Initializing event listeners for CryptoSearch component');
        this.searchInput.addEventListener('input', () => this.filterResults());
        this.searchInput.addEventListener('focus', () => {
            console.log('Search input focused'); // Log when input gains focus
            this.searchResults.style.display = 'block';
            this.searchResults.style.opacity = '1';
            this.displayResults(this.cryptoData);
            this.showResults();
        });

        // Prevent result panel interactions from triggering click outside
        this.searchResults.addEventListener('click', (event) => {
            if (event.target.type === 'checkbox') event.stopPropagation();
        });

        document.addEventListener('click', this.handleClickOutside.bind(this));
    }

    async fetchCryptoData() {
        // Fetch cryptocurrency data from the API
        try {
            console.log('Fetching cryptocurrency data...');
            const response = await fetch('/api/trading-pairs');
            console.log('API response:', response); // Log the API response
            const data = await response.json();
            console.log('Raw data fetched from API:', data); // Log raw API data

            this.cryptoData = data.map(pair => ({
                symbol: pair.symbol.replace('USDT', ''),
                name: pair.symbol,
                price: parseFloat(pair.lastPrice),
                change24h: parseFloat(pair.priceChangePercent),
                volume: this.formatVolume(pair.volume)
            }));
            console.log('Processed crypto data:', this.cryptoData); // Log processed data
        } catch (error) {
            console.error('Error fetching crypto data:', error);
            this.cryptoData = [];
        }
    }

    filterResults() {
        const searchTerm = this.searchInput.value.toLowerCase();
        console.log('Filtering results for search term:', searchTerm);
        const filteredResults = this.cryptoData.filter(crypto =>
            crypto.symbol.toLowerCase().includes(searchTerm) ||
            crypto.name.toLowerCase().includes(searchTerm)
        );
        console.log('Filtered results:', filteredResults); // Log filtered results
        this.displayResults(filteredResults);
    }

    displayResults(results) {
        console.log('Displaying search results:', results); // Log results to display
        this.searchResults.innerHTML = '';
        results.forEach(crypto => {
            const resultItem = document.createElement('div');
            resultItem.className = 'p-3 hover:bg-gray-600 cursor-pointer flex justify-between items-center select-none';
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

            // Attach click event listener
            resultItem.addEventListener('click', (event) => {
                if (event.target.type === 'checkbox') return; // Ignore clicks on checkboxes
                checkbox.checked = !checkbox.checked;
                if (checkbox.checked) {
                    this.selectedCryptos.add(crypto.symbol);
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
        console.log('Showing results dropdown'); // Log when dropdown is shown
        this.searchResults.style.display = 'block';
        this.searchResults.style.width = this.searchInput.offsetWidth + 'px';
        this.searchResults.style.position = 'absolute';
        this.searchResults.style.zIndex = '1000';
        this.searchResults.style.left = '0';
        this.searchResults.style.top = '100%';
    }

    hideResults() {
        console.log('Hiding results dropdown'); // Log when dropdown is hidden
        this.searchResults.style.display = 'none';
    }

    triggerSelectionChange() {
        console.log('Selected cryptocurrencies updated:', Array.from(this.selectedCryptos)); // Log selected items
    }

    formatVolume(volume) {
        // Helper method to format large volume numbers
        if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
        if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
        if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
        return volume.toString();
    }
}