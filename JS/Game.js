class GameLibrary {
    constructor() {
        this.frame = document.querySelector(".Projects-Frame");
        this.iframe = document.querySelector(".Projects-IFrame");
        this.container = document.querySelector(".Projects-Container");
        this.searchBar = document.getElementById("GameSearchBar");
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Frame control events
        this.frame.querySelector(".Projects-FrameBar").addEventListener("click", (e) => {
            this.handleFrameControls(e);
        });

        // Search functionality
        this.searchBar.addEventListener("input", () => {
            this.handleSearch();
        });

        // Error handling for iframe
        this.iframe.addEventListener('error', () => {
            this.showError('Failed to load game. Please try again.');
        });
    }

    handleFrameControls(event) {
        const target = event.target;
        
        if (target.id === "close") {
            this.closeGame();
        } else if (target.id === "fullscreen") {
            this.toggleFullscreen();
        } else if (target.id === "link") {
            window.open(this.iframe.src);
        }
    }

    closeGame() {
        this.frame.classList.add("hidden");
        this.iframe.src = "";
    }

    async toggleFullscreen() {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else {
                await this.iframe.requestFullscreen();
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
        }
    }

    handleSearch() {
        const searchTerm = this.searchBar.value.trim().toLowerCase();
        const games = this.container.querySelectorAll(".Projects-Project");

        games.forEach(game => {
            const gameName = game.querySelector("h1").textContent.toLowerCase();
            game.classList.toggle("hidden", !gameName.includes(searchTerm));
        });
    }

    createGameElement(game, cdnUrl) {
        const project = document.createElement("div");
        project.className = "Projects-Project";
        
        const imageUrl = `${cdnUrl}${CONFIG.apiEndpoints.icons}${game.game.replace(/[.\s]/g, "")}.webp`;
        
        project.innerHTML = `
            <img src="${imageUrl}" 
                 loading="lazy" 
                 alt="${game.game} icon"
                 onerror="this.src='${CONFIG.defaultIcon}'"/>
            <h1>${game.game}</h1>
        `;

        project.addEventListener("click", () => {
            this.loadGame(game, cdnUrl);
        });

        return project;
    }

    loadGame(game, cdnUrl) {
        this.frame.classList.remove("hidden");
        this.iframe.src = `${cdnUrl}${game.gameroot}`;
    }

    showError(message) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        this.container.prepend(error);
        
        setTimeout(() => error.remove(), 5000);
    }

    async loadGames() {
        try {
            const cdnResponse = await fetch('config/cdn.json');
            if (!cdnResponse.ok) throw new Error('CDN configuration not found');
            
            const cdnData = await cdnResponse.json();
            const cdnUrl = cdnData.cdn || CONFIG.cdnBase;

            const gamesResponse = await fetch(`${cdnUrl}${CONFIG.apiEndpoints.gameList}`);
            if (!gamesResponse.ok) throw new Error('Failed to load games list');
            
            const games = await gamesResponse.json();
            
            // Clear loading indicator
            this.container.innerHTML = '';

            // Sort games alphabetically
            games.sort((a, b) => a.game.localeCompare(b.game));

            // Create and append game elements
            const fragment = document.createDocumentFragment();
            games.forEach(game => {
                const gameElement = this.createGameElement(game, cdnUrl);
                fragment.appendChild(gameElement);
            });

            this.container.appendChild(fragment);

        } catch (error) {
            console.error('Error loading games:', error);
            this.showError('Unable to load games. Please try again later.');
        }
    }
}

// Initialize the game library when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const gameLibrary = new GameLibrary();
    gameLibrary.loadGames();
});
