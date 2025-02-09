class Navigation {
    constructor() {
        this.navPanel = document.getElementById('navigationPanel');
        this.mainContent = document.getElementById('mainContent');
        this.toggleButton = document.getElementById('navToggle');
        this.isNavVisible = true;

        this.initializeEventListeners();
        this.loadNavState();
    }

    initializeEventListeners() {
        this.toggleButton.addEventListener('click', () => this.toggleNavigation());
    }

    toggleNavigation() {
        this.isNavVisible = !this.isNavVisible;
        this.updateNavVisibility();
        this.saveNavState();
    }

    updateNavVisibility() {
        if (this.isNavVisible) {
            this.navPanel.style.transform = 'translateX(0)';
            this.mainContent.style.marginLeft = '16rem'; // 64 in rem
        } else {
            this.navPanel.style.transform = 'translateX(-100%)';
            this.mainContent.style.marginLeft = '0';
        }
    }

    saveNavState() {
        localStorage.setItem('navVisible', this.isNavVisible);
    }

    loadNavState() {
        const savedState = localStorage.getItem('navVisible');
        if (savedState !== null) {
            this.isNavVisible = savedState === 'true';
            this.updateNavVisibility();
        }
    }
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
});
