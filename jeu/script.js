const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Variables du jeu
let gameState = "menu";
let airplane = { x: 0, y: 50, speed: 2 };
let bombs = [];
let buildings = [];
let currentLevel = 1;
const maxBuildings = 10;
const buildingColors = ["#FF5733", "#33FF57", "#3357FF", "#FFD700"];
const buildingWidth = 70;
let specialBuildingIndex = 0;

// Génération des immeubles pour un niveau
function generateBuildings(level) {
    const generatedBuildings = [];
    specialBuildingIndex = Math.floor(Math.random() * maxBuildings); // Position aléatoire pour l'immeuble spécial

    for (let i = 0; i < maxBuildings; i++) {
        let height = Math.random() * (300 - 50) + 50; // Hauteur aléatoire entre 50 et 300 pixels
        generatedBuildings.push({
            x: i * (canvas.width / maxBuildings),
            height: height,
            isSpecial: i === specialBuildingIndex,
        });
    }
    return generatedBuildings;
}

// Initialisation d'un niveau
function initializeLevel(level) {
    console.log(`Initialisation du niveau ${level}`);
    airplane.x = 0;
    airplane.y = 50;
    airplane.speed = 2 + (level - 1) * 0.2;
    buildings = generateBuildings(level);
    bombs = [];
}

// Dessiner l'avion
function drawAirplane() {
    ctx.fillStyle = "blue";
    ctx.fillRect(airplane.x, airplane.y, 40, 20);
}

// Dessiner les immeubles
function drawBuildings() {
    buildings.forEach((building, index) => {
        // Couleur fixe pour l'immeuble spécial
        if (building.isSpecial) {
            ctx.fillStyle = "gold"; // Fixer la couleur de l'immeuble spécial
        } else {
            ctx.fillStyle = buildingColors[index % buildingColors.length];
        }

        // Dessiner l'immeuble
        ctx.fillRect(building.x, canvas.height - building.height, buildingWidth, building.height);

        // Ajouter "G" en rouge au-dessus de l'immeuble spécial
        if (building.isSpecial) {
            ctx.fillStyle = "red"; // Couleur rouge pour la lettre "G"
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.fillText("G", building.x + buildingWidth / 2, canvas.height - building.height - 10);
        }
    });
}



// Dessiner les bombes
function drawBombs() {
    bombs.forEach((bomb, index) => {
        ctx.fillStyle = "red";
        ctx.fillRect(bomb.x, bomb.y, 10, 10);
        bomb.y += 5; // Descente des bombes

        // Vérifier les collisions avec les immeubles
        buildings.forEach((building) => {
            if (
                bomb.x > building.x &&
                bomb.x < building.x + buildingWidth &&
                bomb.y > canvas.height - building.height
            ) {
                building.height -= 50; // Réduire la hauteur de l'immeuble
                if (building.height <= 0) {
                    buildings.splice(buildings.indexOf(building), 1); // Retirer l'immeuble détruit
                }
                bombs.splice(index, 1); // Retirer la bombe
            }
        });
    });
}

// Mettre à jour le jeu
function updateGame() {
    airplane.x += airplane.speed;

    // Faire descendre l'avion lorsqu'il atteint le bord droit
    if (airplane.x > canvas.width) {
        airplane.x = 0;
        airplane.y += 20;
    }

    // Défaite si l'avion touche un immeuble
    buildings.forEach((building) => {
        if (
            airplane.x + 40 > building.x &&
            airplane.x < building.x + buildingWidth &&
            airplane.y + 20 > canvas.height - building.height
        ) {
            gameState = "gameOver";
        }
    });

    // Victoire ou fin secrète
    if (buildings.length === 1 && buildings[0].isSpecial) {
        gameState = "secretEnding";
    } else if (buildings.length === 0) {
        currentLevel++;
        if (currentLevel > 5) {
            gameState = "victory";
        } else {
            initializeLevel(currentLevel);
        }
    }
}

// Dessiner le jeu
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAirplane();
    drawBuildings();
    drawBombs();
}

// Boucle de jeu
function gameLoop() {
    if (gameState === "playing") {
        updateGame();
        drawGame();
        requestAnimationFrame(gameLoop);
    } else if (gameState === "gameOver") {
        alert("Game Over! L'avion s'est écrasé.");
        resetGame();
    } else if (gameState === "victory") {
        alert("Bravo ! Vous avez terminé tous les niveaux !");
        resetGame();
    } else if (gameState === "secretEnding") {
        alert("Félicitations ! Vous avez découvert la fin secrète !");
        resetGame();
    }
}

// Réinitialiser le jeu
function resetGame() {
    currentLevel = 1;
    initializeLevel(currentLevel);
    gameState = "menu";
}

// Larguer une bombe
function dropBomb() {
    bombs.push({ x: airplane.x + 15, y: airplane.y + 20 });
}

// Gestion des événements
document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && gameState === "playing") {
        dropBomb();
    }
});

document.getElementById("start-game").addEventListener("click", () => {
    gameState = "playing";
    document.getElementById("menu").style.display = "none";
    document.getElementById("gameCanvas").style.display = "block";
    initializeLevel(currentLevel);
    requestAnimationFrame(gameLoop);
});

// Charger le jeu
initializeLevel(currentLevel);
