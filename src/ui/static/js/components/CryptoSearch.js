class CryptoSearch {
    constructor() {
        this.cryptoData = [];
        this.searchInput = document.getElementById('cryptoSearch');
        this.searchResults = document.createElement('div');
        console.log('Initializing CryptoSearch component'); // Log initialization
        this.searchResults.className = 'search-results absolute w-full bg-gray-700 mt-1 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto';
        this.searchInput.parentNode.appendChild(this.searchResults);
        this.selectedCryptos = new Set();
        this.isDropdownOpen = false; // Track the state of the dropdown
        this.filterButton = document.getElementById('filterButton'); // Add reference to the filter button
        this.fetchCryptoData();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        console.log('Initializing event listeners for CryptoSearch component');

        // Handle input for filtering crypto data
        this.searchInput.addEventListener('input', () => {
            this.isDropdownOpen = true; // Ensure dropdown is considered open
            this.filterResults();
        });

        // Handle search input focus or click
        this.searchInput.addEventListener('focus', this.handleSearchFocus.bind(this));
        this.searchInput.addEventListener('click', this.handleSearchFocus.bind(this));

        // Prevent clicks inside the dropdown from closing it
        this.searchResults.addEventListener('click', (event) => {
            if (event.target.type === 'checkbox') event.stopPropagation();
        });

        // Prevent closing the dropdown when clicking the filter button
        if (this.filterButton) {
            this.filterButton.addEventListener('click', this.handleFilterClick.bind(this));
        }

        // Close the dropdown when clicking outside of the search bar or dropdown
        document.addEventListener('click', this.handleClickOutside.bind(this));

        // Close the dropdown when pressing the Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                console.log('Escape key pressed'); // Log Escape key event
                this.hideResults();
            }
        });
    }

    handleSearchFocus() {
        console.log('Search input clicked or focused'); // Log when input is clicked or focused
        if (!this.isDropdownOpen) {
            this.showResults();
            this.displayResults(this.cryptoData);
        }
    }

    handleFilterClick(event) {
        console.log('Filter button clicked'); // Log when filter button is clicked
        if (!this.isDropdownOpen) {
            this.showResults(); // Ensure the dropdown is visible if it was closed
        }
        this.searchResults.scrollTop = 0; // Reset the scroll position to the top
        event.stopPropagation(); // Prevent click from propagating and triggering dropdown closure
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
        this.searchResults.scrollTop = 0; // Reset scroll position when filtering results
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
        this.isDropdownOpen = true; // Update state to open
    }

    hideResults() {
        console.log('Hiding results dropdown'); // Log when dropdown is hidden
        this.searchResults.style.display = 'none';
        this.isDropdownOpen = false; // Update state to closed
    }

    handleClickOutside(event) {
        const isClickInsideInput = this.searchInput.contains(event.target);
        const isClickInsideResults = this.searchResults.contains(event.target);
        const isClickOnFilterButton = this.filterButton && this.filterButton.contains(event.target);

        if (!isClickInsideInput && !isClickInsideResults && !isClickOnFilterButton) {
            this.hideResults(); // Close the dropdown if clicked outside
        }
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