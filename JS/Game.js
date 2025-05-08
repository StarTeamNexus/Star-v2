const Frame = document.querySelector(".Projects-Frame");
const HAF = document.querySelectorAll(".hideAfterFullscreen");
const IFrame = document.querySelector(".Projects-IFrame");
const modal = document.getElementById("addGameModal");
const addGameBtn = document.getElementById("addGameBtn");
const closeModalBtn = document.getElementById("closeModal");
const addGameForm = document.getElementById("addGameForm");
const iconInput = document.getElementById("gameIcon");
const iconPreview = document.getElementById("iconPreview");

// Store custom games in localStorage
let customGames = JSON.parse(localStorage.getItem("customGames")) || [];

async function addGames() {
    try {
        // Add CDN games
        const cdn = await (await fetch("./Hosting/CDN.json")).json();
        const games = await (await fetch(cdn + "list.json")).json();
        
        // Combine CDN games with custom games
        const allGames = [...games, ...customGames];
        allGames.sort((a, b) => a.game.localeCompare(b.game));

        // Clear existing games
        document.querySelector(".Projects-Container").innerHTML = "";

        for (const game of allGames) {
            const project = document.createElement("div");
            project.className = "Projects-Project";
            
            // Handle both CDN and custom games
            const imageSource = game.isCustom 
                ? game.icon 
                : `${cdn}/Icons/${game.game.replace(/[.\s]/g, "")}.webp`;

            project.innerHTML = `
                <img src="${imageSource}" loading="lazy" onerror="this.src='./Assests/Imgs/NoIcon.png'"/>
                <h1>${game.game}</h1>`;
            
            document.querySelector(".Projects-Container").appendChild(project);

            project.addEventListener("click", () => {
                HAF.forEach(element => element.classList.add("hidden"));
                Frame.classList.remove("hidden");
                
                if (game.isCustom) {
                    // For custom games, create a blob URL
                    const gameContent = `
                        <!DOCTYPE html>
                        <html>
                            <head>
                                <style>${game.css}</style>
                            </head>
                            <body>
                                ${game.html}
                                <script>${game.js}</script>
                            </body>
                        </html>
                    `;
                    const blob = new Blob([gameContent], { type: 'text/html' });
                    IFrame.src = URL.createObjectURL(blob);
                } else {
                    // For CDN games
                    IFrame.src = `${cdn}${game.gameroot}`;
                }
            });
        }
    } catch (error) {
        console.error("Error loading games:", error);
    }
}

// Modal handling
addGameBtn.addEventListener("click", () => modal.classList.remove("hidden"));
closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));

// Icon preview
iconInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            iconPreview.innerHTML = `<img src="${e.target.result}" alt="Icon preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Form submission
addGameForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const iconFile = iconInput.files[0];
    const iconData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(iconFile);
    });

    const newGame = {
        game: document.getElementById("gameName").value,
        icon: iconData,
        html: document.getElementById("gameHTML").value,
        css: document.getElementById("gameCSS").value,
        js: document.getElementById("gameJS").value,
        isCustom: true
    };

    customGames.push(newGame);
    localStorage.setItem("customGames", JSON.stringify(customGames));
    
    modal.classList.add("hidden");
    addGameForm.reset();
    iconPreview.innerHTML = "";
    
    addGames(); // Refresh the game list
});

Frame.querySelector(".Projects-FrameBar").addEventListener("click", (event) => {
    if (event.target.id === "close") {
        HAF.forEach(element => element.classList.remove("hidden"));
        Frame.classList.add("hidden");
        if (IFrame.src.startsWith("blob:")) {
            URL.revokeObjectURL(IFrame.src);
        }
        IFrame.src = "";
    } else if (event.target.id === "fullscreen") {
        const requestFullscreen = IFrame.requestFullscreen ||
            IFrame.webkitRequestFullscreen ||
            IFrame.msRequestFullscreen;
        requestFullscreen.call(IFrame);
    } else if (event.target.id === "link") {
        window.open(IFrame.src);
    }
});

// Search functionality
document.getElementById("GameSearchBar").addEventListener("input", () => {
    const searchedup = document.getElementById("GameSearchBar").value.trim().toLowerCase();
    const gameholders = document.querySelector(".Projects-Container");
    const games = gameholders.querySelectorAll(".Projects-Project");

    games.forEach(game => {
        const gameName = game.querySelector("h1").innerText.trim().toLowerCase();
        game.classList.toggle("hidden", !gameName.includes(searchedup));
    });
});

addGames();
