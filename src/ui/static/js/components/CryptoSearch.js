class CryptoSearch {
    constructor() {
        this.cryptoData = [];
        this.searchInput = document.getElementById('cryptoSearch');
        this.searchResults = document.createElement('div');
        this.searchResults.className = 'search-results absolute w-full bg-gray-700 mt-1 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto';
        this.searchInput.parentNode.appendChild(this.searchResults);
        this.selectedCryptos = new Set();
        this.isDropdownOpen = false;
        this.filterButton = document.getElementById('filterButton');
        this.fetchCryptoData();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.searchInput.addEventListener('input', () => {
            this.isDropdownOpen = true;
            this.filterResults();
        });

        this.searchInput.addEventListener('focus', this.handleSearchFocus.bind(this));
        this.searchInput.addEventListener('click', this.handleSearchFocus.bind(this));

        this.searchResults.addEventListener('click', (event) => {
            if (event.target.type === 'checkbox') event.stopPropagation();
        });

        if (this.filterButton) {
            this.filterButton.addEventListener('click', this.handleFilterClick.bind(this));
        }

        document.addEventListener('click', this.handleClickOutside.bind(this));
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.hideResults();
            }
        });
    }

    handleSearchFocus() {
        if (!this.isDropdownOpen) {
            this.showResults();
            this.displayResults(this.cryptoData);
        }
    }

    handleFilterClick(event) {
        if (!this.isDropdownOpen) {
            this.showResults();
        }
        this.searchResults.scrollTop = 0;
        event.stopPropagation();
    }

    async fetchCryptoData() {
        try {
            const response = await fetch('/api/trading-pairs');
            const data = await response.json();

            this.cryptoData = data.map(pair => ({
                symbol: pair.symbol.replace('USDT', ''),
                name: pair.symbol,
                price: parseFloat(pair.lastPrice),
                change24h: parseFloat(pair.priceChangePercent),
                volume: this.formatVolume(pair.volume)
            }));
        } catch (error) {
            console.error('Error fetching crypto data:', error);
            this.cryptoData = [];
        }
    }

    filterResults() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const filteredResults = this.cryptoData.filter(crypto =>
            crypto.symbol.toLowerCase().includes(searchTerm) ||
            crypto.name.toLowerCase().includes(searchTerm)
        );
        this.displayResults(filteredResults);
        this.searchResults.scrollTop = 0;
    }

    displayResults(results) {
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

            resultItem.addEventListener('click', (event) => {
                if (event.target.type === 'checkbox') return;
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
        this.searchResults.style.display = 'block';
        this.searchResults.style.width = this.searchInput.offsetWidth + 'px';
        this.searchResults.style.position = 'absolute';
        this.searchResults.style.zIndex = '1000';
        this.searchResults.style.left = '0';
        this.searchResults.style.top = '100%';
        this.isDropdownOpen = true;
    }

    hideResults() {
        this.searchResults.style.display = 'none';
        this.isDropdownOpen = false;
    }

    handleClickOutside(event) {
        const isClickInsideInput = this.searchInput.contains(event.target);
        const isClickInsideResults = this.searchResults.contains(event.target);
        const isClickOnFilterButton = this.filterButton && this.filterButton.contains(event.target);

        if (!isClickInsideInput && !isClickInsideResults && !isClickOnFilterButton) {
            this.hideResults();
        }
    }

    triggerSelectionChange() {
        console.log('Selected cryptocurrencies updated:', Array.from(this.selectedCryptos));
    }

    formatVolume(volume) {
        if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
        if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
        if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
        return volume.toString();
    }

    submitSelected() {
        console.log('Submitting selected cryptocurrencies');
        const selectedArray = Array.from(this.selectedCryptos);
        console.log('Selected cryptos:', selectedArray);

        if (window.tradeLab) {
            selectedArray.forEach(symbol => window.tradeLab.addChart(symbol));
        }

        this.selectedCryptos.clear(); // Reset the selected cryptos

        const checkboxes = this.searchResults.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => (checkbox.checked = false));

        console.log('Dropdown reset complete');
    }
}