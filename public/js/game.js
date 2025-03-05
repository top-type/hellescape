// Connect to the server
const socket = io();

// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 500;

// Camera settings
const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    leftBound: 200,    // Left boundary for camera movement
    rightBound: 600,   // Right boundary for camera movement
    topBound: 150,     // Top boundary for camera movement
    bottomBound: 350   // Bottom boundary for camera movement
};

// Game state
const gameState = {
    player: {
        x: 50,
        y: 400,
        width: 30,
        height: 50,
        velocityX: 0,
        velocityY: 0,
        isJumping: false,
        color: '#4fc3f7',
        isDead: false,
        deathAnimation: {
            progress: 0,
            maxProgress: 60, // Animation frames
            particles: []
        },
        hasJetpack: false,
        jetpackFuel: 0,
        maxJetpackFuel: 100,
        jetpackActive: false
    },
    worldWidth: 3000,  // Much wider world
    worldHeight: 1000, // Taller world
    platforms: [
        // Ground platforms
        { x: 0, y: 450, width: 800, height: 50, color: '#3a3a3a' },
        { x: 850, y: 500, width: 400, height: 50, color: '#3a3a3a' },
        { x: 1300, y: 450, width: 600, height: 50, color: '#3a3a3a' },
        { x: 1950, y: 500, width: 300, height: 50, color: '#3a3a3a' },
        { x: 2300, y: 450, width: 700, height: 50, color: '#3a3a3a' },
        
        // Floating platforms - first section
        { x: 200, y: 350, width: 100, height: 20, color: '#3a3a3a' },
        { x: 400, y: 300, width: 100, height: 20, color: '#3a3a3a' },
        { x: 600, y: 250, width: 100, height: 20, color: '#3a3a3a' },
        { x: 300, y: 200, width: 100, height: 20, color: '#3a3a3a' },
        { x: 100, y: 150, width: 100, height: 20, color: '#3a3a3a' },
        
        // Floating platforms - second section
        { x: 900, y: 400, width: 100, height: 20, color: '#3a3a3a' },
        { x: 1050, y: 350, width: 100, height: 20, color: '#3a3a3a' },
        { x: 1200, y: 300, width: 100, height: 20, color: '#3a3a3a' },
        { x: 1100, y: 250, width: 100, height: 20, color: '#3a3a3a' },
        { x: 950, y: 200, width: 100, height: 20, color: '#3a3a3a' },
        
        // Floating platforms - third section
        { x: 1400, y: 350, width: 100, height: 20, color: '#3a3a3a' },
        { x: 1550, y: 300, width: 100, height: 20, color: '#3a3a3a' },
        { x: 1700, y: 250, width: 100, height: 20, color: '#3a3a3a' },
        { x: 1600, y: 200, width: 100, height: 20, color: '#3a3a3a' },
        { x: 1450, y: 150, width: 100, height: 20, color: '#3a3a3a' },
        
        // Floating platforms - fourth section
        { x: 2000, y: 400, width: 100, height: 20, color: '#3a3a3a' },
        { x: 2150, y: 350, width: 100, height: 20, color: '#3a3a3a' },
        { x: 2300, y: 300, width: 100, height: 20, color: '#3a3a3a' },
        { x: 2200, y: 250, width: 100, height: 20, color: '#3a3a3a' },
        { x: 2050, y: 200, width: 100, height: 20, color: '#3a3a3a' },
        
        // Floating platforms - fifth section
        { x: 2400, y: 350, width: 100, height: 20, color: '#3a3a3a' },
        { x: 2550, y: 300, width: 100, height: 20, color: '#3a3a3a' },
        { x: 2700, y: 250, width: 100, height: 20, color: '#3a3a3a' },
        { x: 2600, y: 200, width: 100, height: 20, color: '#3a3a3a' },
        { x: 2450, y: 150, width: 100, height: 20, color: '#3a3a3a' },
    ],
    // Add deadly traps
    traps: [
        // First section traps
        { x: 350, y: 430, width: 50, height: 20, color: '#ff0000', type: 'spikes' },
        { x: 500, y: 430, width: 50, height: 20, color: '#ff0000', type: 'spikes' },
        
        // Second section traps
        { x: 950, y: 480, width: 50, height: 20, color: '#ff0000', type: 'spikes' },
        { x: 1150, y: 480, width: 50, height: 20, color: '#ff0000', type: 'spikes' },
        
        // Third section traps
        { x: 1450, y: 430, width: 50, height: 20, color: '#ff0000', type: 'spikes' },
        { x: 1650, y: 430, width: 50, height: 20, color: '#ff0000', type: 'spikes' },
        
        // Fourth section traps
        { x: 2050, y: 480, width: 50, height: 20, color: '#ff0000', type: 'spikes' },
        { x: 2150, y: 480, width: 50, height: 20, color: '#ff0000', type: 'spikes' },
        
        // Fifth section traps
        { x: 2450, y: 430, width: 50, height: 20, color: '#ff0000', type: 'spikes' },
        { x: 2650, y: 430, width: 50, height: 20, color: '#ff0000', type: 'spikes' },
        
        // Floating platform traps
        { x: 225, y: 330, width: 50, height: 20, color: '#ff0000', type: 'spikes' },
        { x: 1075, y: 330, width: 50, height: 20, color: '#ff0000', type: 'spikes' },
        { x: 1575, y: 280, width: 50, height: 20, color: '#ff0000', type: 'spikes' },
        { x: 2175, y: 330, width: 50, height: 20, color: '#ff0000', type: 'spikes' },
        { x: 2575, y: 280, width: 50, height: 20, color: '#ff0000', type: 'spikes' },
    ],
    coins: [
        // First section coins
        { x: 250, y: 320, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 450, y: 270, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 650, y: 220, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 350, y: 170, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 150, y: 120, width: 20, height: 20, color: '#ffd700', collected: false },
        
        // Second section coins
        { x: 950, y: 370, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 1100, y: 320, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 1250, y: 270, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 1150, y: 220, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 1000, y: 170, width: 20, height: 20, color: '#ffd700', collected: false },
        
        // Third section coins
        { x: 1450, y: 320, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 1600, y: 270, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 1750, y: 220, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 1650, y: 170, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 1500, y: 120, width: 20, height: 20, color: '#ffd700', collected: false },
        
        // Fourth section coins
        { x: 2050, y: 370, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 2200, y: 320, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 2350, y: 270, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 2250, y: 220, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 2100, y: 170, width: 20, height: 20, color: '#ffd700', collected: false },
        
        // Fifth section coins
        { x: 2450, y: 320, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 2600, y: 270, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 2750, y: 220, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 2650, y: 170, width: 20, height: 20, color: '#ffd700', collected: false },
        { x: 2500, y: 120, width: 20, height: 20, color: '#ffd700', collected: false },
    ],
    // Add jetpack item - moved to a more visible location and made larger
    jetpack: {
        x: 300,  // Changed from 1300 to make it easier to find early in the game
        y: 300,  // Changed from 350 to make it more visible
        width: 40,  // Increased from 30
        height: 50,  // Increased from 40
        color: '#ffa500',
        collected: false
    },
    // Add fuel canisters
    fuelCanisters: [
        { x: 500, y: 100, width: 20, height: 30, color: '#00ff00', collected: false, fuelAmount: 50 },
        { x: 1200, y: 250, width: 20, height: 30, color: '#00ff00', collected: false, fuelAmount: 50 },
        { x: 1800, y: 200, width: 20, height: 30, color: '#00ff00', collected: false, fuelAmount: 50 },
        { x: 2400, y: 100, width: 20, height: 30, color: '#00ff00', collected: false, fuelAmount: 50 }
    ],
    score: 0,
    gameTime: 0,
    isRewinding: false,
    rewindEnergy: 100, // Percentage of rewind energy available
    maxRewindFrames: 600, // Maximum number of frames we can rewind (10 seconds at 60fps)
    lastUpdateTime: 0, // For frame rate control
};

// Constants - Increased gravity and speed for quicker gameplay
const GRAVITY = 0.5;  // Increased from 0.3
const JUMP_FORCE = -10; // Stronger jump to compensate for higher gravity
const MOVE_SPEED = 5.0;  // Increased from 3.5 for faster movement
const FRICTION = 0.8;
const REWIND_ENERGY_DEPLETION_RATE = 0.3;
const REWIND_ENERGY_RECOVERY_RATE = 0.2;
const FRAME_RATE = 60; // Increased from 30 for smoother gameplay
const FRAME_DELAY = 1000 / FRAME_RATE;
const JETPACK_THRUST = -0.8; // Increased from -0.3 to make it powerful enough to overcome gravity
const JETPACK_FUEL_CONSUMPTION = 0.5; // Fuel consumption rate

// Time history for rewinding
const gameHistory = [];

// Controls
const keys = {
    left: false,
    right: false,
    up: false,
    jetpack: false,
    rewind: false
};

// Event listeners for keyboard controls
window.addEventListener('keydown', (e) => {
    // Only process movement keys if player is not dead
    if (!gameState.player.isDead) {
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
                keys.left = true;
                break;
            case 'ArrowRight':
            case 'd':
                keys.right = true;
                break;
            case 'ArrowUp':
            case 'w':
            case ' ':
                keys.up = true;
                break;
            case 'ArrowDown':
            case 's':
                // Activate jetpack if player has it and fuel is available
                if (gameState.player.hasJetpack && gameState.player.jetpackFuel > 0) {
                    keys.jetpack = true;
                    gameState.player.jetpackActive = true;
                }
                break;
        }
    }
    
    // Always allow rewind key (to recover from death)
    if (e.key === 'r' || e.key === 'R') {
        if (gameState.rewindEnergy > 0) {
            keys.rewind = true;
            gameState.isRewinding = true;
        }
    }
});

window.addEventListener('keyup', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
            keys.left = false;
            break;
        case 'ArrowRight':
        case 'd':
            keys.right = false;
            break;
        case 'ArrowUp':
        case 'w':
        case ' ':
            keys.up = false;
            break;
        case 'ArrowDown':
        case 's':
            keys.jetpack = false;
            gameState.player.jetpackActive = false;
            break;
        case 'r':
        case 'R':
            keys.rewind = false;
            gameState.isRewinding = false;
            break;
    }
});

// Remove the old button event listeners
const rewindBtn = document.getElementById('rewindBtn');
rewindBtn.style.display = 'none'; // Hide the button since we're using keyboard now

// Check collision between two rectangles
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update camera position to follow player
function updateCamera() {
    // Calculate the ideal camera position (centered on player)
    const idealX = gameState.player.x - camera.width / 2 + gameState.player.width / 2;
    const idealY = gameState.player.y - camera.height / 2 + gameState.player.height / 2;
    
    // Update camera position with bounds checking
    camera.x = Math.max(0, Math.min(idealX, gameState.worldWidth - camera.width));
    camera.y = Math.max(0, Math.min(idealY, gameState.worldHeight - camera.height));
}

// Check if an object is visible within the camera view
function isVisible(obj) {
    return obj.x + obj.width > camera.x && 
           obj.x < camera.x + camera.width &&
           obj.y + obj.height > camera.y && 
           obj.y < camera.y + camera.height;
}

// Create death animation particles
function createDeathParticles() {
    const particleCount = 30;
    gameState.player.deathAnimation.particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        gameState.player.deathAnimation.particles.push({
            x: gameState.player.x + gameState.player.width / 2,
            y: gameState.player.y + gameState.player.height / 2,
            size: Math.random() * 8 + 2,
            speedX: (Math.random() - 0.5) * 8,
            speedY: (Math.random() - 0.5) * 8,
            color: gameState.player.color,
            opacity: 1
        });
    }
}

// Handle player death
function killPlayer() {
    if (!gameState.player.isDead) {
        gameState.player.isDead = true;
        gameState.player.deathAnimation.progress = 0;
        createDeathParticles();
        
        // Display death message
        document.getElementById('timeInfo').textContent = "YOU DIED - PRESS R TO REWIND";
    }
}

// Update death animation
function updateDeathAnimation() {
    if (gameState.player.isDead && gameState.player.deathAnimation.progress < gameState.player.deathAnimation.maxProgress) {
        gameState.player.deathAnimation.progress++;
        
        // Update particles
        for (const particle of gameState.player.deathAnimation.particles) {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.speedY += 0.1; // Gravity effect on particles
            particle.opacity -= 0.02;
            if (particle.opacity < 0) particle.opacity = 0;
        }
    }
}

// Check for trap collisions
function checkTrapCollisions() {
    if (!gameState.player.isDead) {
        for (const trap of gameState.traps) {
            if (checkCollision(gameState.player, trap)) {
                killPlayer();
                break;
            }
        }
    }
}

// Draw jetpack flames when active
function drawJetpackFlames() {
    if (gameState.player.jetpackActive && gameState.player.jetpackFuel > 0 && keys.jetpack) {
        // Draw flame particles
        const flameX = gameState.player.x + gameState.player.width / 2 - camera.x;
        const flameY = gameState.player.y + gameState.player.height - camera.y;
        
        // Create gradient for flame
        const gradient = ctx.createLinearGradient(flameX, flameY, flameX, flameY + 40); // Even longer flame
        gradient.addColorStop(0, '#ff9900');
        gradient.addColorStop(0.6, '#ff0000');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0.3)'); // Fade out at the end
        
        // Draw main flame with randomized shape for more dynamic effect
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // Start points (with slight randomization)
        const leftX = flameX - 15 + (Math.random() - 0.5) * 3;
        const rightX = flameX + 15 + (Math.random() - 0.5) * 3;
        
        // Control points for curve
        const ctrlX1 = flameX - 10 + (Math.random() - 0.5) * 5;
        const ctrlY1 = flameY + 15 + (Math.random() - 0.5) * 5;
        const ctrlX2 = flameX + 10 + (Math.random() - 0.5) * 5;
        const ctrlY2 = flameY + 15 + (Math.random() - 0.5) * 5;
        
        // End point with randomization
        const endY = flameY + 40 + (Math.random() - 0.5) * 5;
        
        ctx.moveTo(leftX, flameY);
        ctx.quadraticCurveTo(ctrlX1, ctrlY1, flameX, endY);
        ctx.quadraticCurveTo(ctrlX2, ctrlY2, rightX, flameY);
        ctx.closePath();
        ctx.fill();
        
        // Draw smaller inner flame with more vibrant colors
        const innerGradient = ctx.createLinearGradient(flameX, flameY, flameX, flameY + 25);
        innerGradient.addColorStop(0, '#ffffff'); // White hot center
        innerGradient.addColorStop(0.4, '#ffff00');
        innerGradient.addColorStop(1, '#ff9900');
        
        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        
        // Inner flame with slight randomization
        const innerLeftX = flameX - 8 + (Math.random() - 0.5) * 2;
        const innerRightX = flameX + 8 + (Math.random() - 0.5) * 2;
        const innerEndY = flameY + 25 + (Math.random() - 0.5) * 3;
        
        ctx.moveTo(innerLeftX, flameY);
        ctx.quadraticCurveTo(flameX - 3, flameY + 15, flameX, innerEndY);
        ctx.quadraticCurveTo(flameX + 3, flameY + 15, innerRightX, flameY);
        ctx.closePath();
        ctx.fill();
        
        // Add some random flame particles for effect
        for (let i = 0; i < 5; i++) {
            const particleSize = Math.random() * 6 + 2;
            const offsetX = (Math.random() - 0.5) * 15;
            const offsetY = Math.random() * 25 + 15;
            
            // Create particle gradient for more realistic effect
            const particleGradient = ctx.createRadialGradient(
                flameX + offsetX, flameY + offsetY, 0,
                flameX + offsetX, flameY + offsetY, particleSize
            );
            
            if (Math.random() > 0.5) {
                particleGradient.addColorStop(0, '#ffffff');
                particleGradient.addColorStop(0.5, '#ffff00');
                particleGradient.addColorStop(1, 'rgba(255, 153, 0, 0)');
            } else {
                particleGradient.addColorStop(0, '#ffff00');
                particleGradient.addColorStop(0.5, '#ff9900');
                particleGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            }
            
            ctx.fillStyle = particleGradient;
            ctx.beginPath();
            ctx.arc(
                flameX + offsetX,
                flameY + offsetY,
                particleSize,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Add glow effect around the flames
        ctx.shadowColor = '#ff9900';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(flameX, flameY + 10, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 153, 0, 0.1)';
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
    }
}

// Update player position and handle physics
function updatePlayer() {
    // Skip player updates if dead (except for death animation)
    if (gameState.player.isDead) {
        updateDeathAnimation();
        return;
    }
    
    // Handle horizontal movement
    if (keys.left) {
        gameState.player.velocityX = -MOVE_SPEED;
    } else if (keys.right) {
        gameState.player.velocityX = MOVE_SPEED;
    } else {
        gameState.player.velocityX *= FRICTION;
    }

    // Apply gravity
    gameState.player.velocityY += GRAVITY;

    // Handle jumping
    if (keys.up && !gameState.player.isJumping) {
        gameState.player.velocityY = JUMP_FORCE;
        gameState.player.isJumping = true;
    }
    
    // Handle jetpack
    if (gameState.player.hasJetpack && keys.jetpack && gameState.player.jetpackFuel > 0) {
        // Apply upward thrust - directly set velocity for immediate response
        gameState.player.velocityY = JETPACK_THRUST * 5; // Stronger immediate thrust
        
        // Consume fuel
        gameState.player.jetpackFuel -= JETPACK_FUEL_CONSUMPTION;
        
        // Ensure fuel doesn't go below 0
        if (gameState.player.jetpackFuel < 0) {
            gameState.player.jetpackFuel = 0;
            gameState.player.jetpackActive = false;
        }
    }

    // Update position
    gameState.player.x += gameState.player.velocityX;
    gameState.player.y += gameState.player.velocityY;

    // Check platform collisions
    gameState.player.isJumping = true; // Assume we're in the air unless proven otherwise
    
    for (const platform of gameState.platforms) {
        if (checkCollision(gameState.player, platform)) {
            // Collision from above (landing on platform)
            if (gameState.player.velocityY > 0 && 
                gameState.player.y + gameState.player.height - gameState.player.velocityY <= platform.y) {
                gameState.player.y = platform.y - gameState.player.height;
                gameState.player.velocityY = 0;
                gameState.player.isJumping = false;
            }
            // Collision from below (hitting head on platform)
            else if (gameState.player.velocityY < 0 && 
                     gameState.player.y >= platform.y + platform.height - gameState.player.velocityY) {
                gameState.player.y = platform.y + platform.height;
                gameState.player.velocityY = 0;
            }
            // Collision from left
            else if (gameState.player.velocityX > 0 && 
                     gameState.player.x + gameState.player.width - gameState.player.velocityX <= platform.x) {
                gameState.player.x = platform.x - gameState.player.width;
                gameState.player.velocityX = 0;
            }
            // Collision from right
            else if (gameState.player.velocityX < 0 && 
                     gameState.player.x >= platform.x + platform.width - gameState.player.velocityX) {
                gameState.player.x = platform.x + platform.width;
                gameState.player.velocityX = 0;
            }
        }
    }

    // Check coin collisions
    for (const coin of gameState.coins) {
        if (!coin.collected && checkCollision(gameState.player, coin)) {
            coin.collected = true;
            gameState.score += 10;
        }
    }
    
    // Check jetpack collision
    if (!gameState.jetpack.collected && checkCollision(gameState.player, gameState.jetpack)) {
        gameState.jetpack.collected = true;
        gameState.player.hasJetpack = true;
        gameState.player.jetpackFuel = gameState.player.maxJetpackFuel;
    }
    
    // Check fuel canister collisions
    for (const fuel of gameState.fuelCanisters) {
        if (!fuel.collected && checkCollision(gameState.player, fuel)) {
            fuel.collected = true;
            if (gameState.player.hasJetpack) {
                gameState.player.jetpackFuel += fuel.fuelAmount;
                if (gameState.player.jetpackFuel > gameState.player.maxJetpackFuel) {
                    gameState.player.jetpackFuel = gameState.player.maxJetpackFuel;
                }
            }
        }
    }
    
    // Check trap collisions
    checkTrapCollisions();

    // Boundary checks for world limits
    if (gameState.player.x < 0) {
        gameState.player.x = 0;
        gameState.player.velocityX = 0;
    }
    if (gameState.player.x + gameState.player.width > gameState.worldWidth) {
        gameState.player.x = gameState.worldWidth - gameState.player.width;
        gameState.player.velocityX = 0;
    }
    
    // Death if player falls off the world
    if (gameState.player.y > gameState.worldHeight) {
        killPlayer();
    }
    
    // Update camera to follow player
    updateCamera();
}

// Save current game state to history
function saveGameState() {
    // Create a deep copy of the current game state
    const stateCopy = JSON.parse(JSON.stringify(gameState));
    
    // Remove the isRewinding flag and lastUpdateTime from the copy to avoid saving it
    stateCopy.isRewinding = false;
    delete stateCopy.lastUpdateTime;
    
    // Add to history
    gameHistory.push(stateCopy);
    
    // Limit history size to maxRewindFrames
    if (gameHistory.length > gameState.maxRewindFrames) {
        gameHistory.shift();
    }
}

// Rewind to a previous game state
function rewindGameState() {
    if (gameHistory.length > 0 && gameState.rewindEnergy > 0) {
        // Get the previous state
        const previousState = gameHistory.pop();
        
        // Apply the previous state (except for rewind energy, isRewinding flag, and lastUpdateTime)
        const currentRewindEnergy = gameState.rewindEnergy;
        const currentIsRewinding = gameState.isRewinding;
        const currentLastUpdateTime = gameState.lastUpdateTime;
        
        Object.assign(gameState, previousState);
        
        // Keep current rewind energy, isRewinding flag, and lastUpdateTime
        gameState.rewindEnergy = currentRewindEnergy - REWIND_ENERGY_DEPLETION_RATE;
        gameState.isRewinding = currentIsRewinding;
        gameState.lastUpdateTime = currentLastUpdateTime;
        
        // Ensure rewind energy doesn't go below 0
        if (gameState.rewindEnergy < 0) {
            gameState.rewindEnergy = 0;
            gameState.isRewinding = false;
        }
        
        // Update camera to follow player during rewind
        updateCamera();
    } else {
        gameState.isRewinding = false;
    }
}

// Recover rewind energy when not rewinding
function recoverRewindEnergy() {
    if (!gameState.isRewinding && gameState.rewindEnergy < 100) {
        gameState.rewindEnergy += REWIND_ENERGY_RECOVERY_RATE;
        if (gameState.rewindEnergy > 100) {
            gameState.rewindEnergy = 100;
        }
    }
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background with parallax effect
    drawBackground();
    
    // Draw platforms (only those visible in camera view)
    for (const platform of gameState.platforms) {
        if (isVisible(platform)) {
            ctx.fillStyle = platform.color;
            ctx.fillRect(
                platform.x - camera.x, 
                platform.y - camera.y, 
                platform.width, 
                platform.height
            );
        }
    }
    
    // Draw traps (only those visible in camera view)
    for (const trap of gameState.traps) {
        if (isVisible(trap)) {
            if (trap.type === 'spikes') {
                // Draw spike trap with improved visuals
                const trapX = trap.x - camera.x;
                const trapY = trap.y - camera.y;
                const spikeCount = 5;
                const spikeWidth = trap.width / spikeCount;
                
                // Create metallic gradient for base
                const baseGradient = ctx.createLinearGradient(
                    trapX, trapY + 10, 
                    trapX, trapY + trap.height
                );
                baseGradient.addColorStop(0, '#8a0303'); // Dark red
                baseGradient.addColorStop(0.5, '#cc0000'); // Medium red
                baseGradient.addColorStop(1, '#8a0303'); // Dark red again
                
                // Draw base with metallic effect
                ctx.fillStyle = baseGradient;
                ctx.fillRect(trapX, trapY + 10, trap.width, trap.height - 10);
                
                // Add metallic highlights to base
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(trapX, trapY + 11, trap.width, 2);
                
                // Create spike gradient
                const spikeGradient = ctx.createLinearGradient(
                    trapX, trapY, 
                    trapX, trapY + 10
                );
                spikeGradient.addColorStop(0, '#ff3333'); // Bright red at tip
                spikeGradient.addColorStop(1, '#aa0000'); // Darker red at base
                
                // Draw spikes with metallic effect
                ctx.fillStyle = spikeGradient;
                ctx.beginPath();
                for (let i = 0; i < spikeCount; i++) {
                    const startX = trapX + i * spikeWidth;
                    ctx.moveTo(startX, trapY + 10);
                    ctx.lineTo(startX + spikeWidth/2, trapY);
                    ctx.lineTo(startX + spikeWidth, trapY + 10);
                }
                ctx.fill();
                
                // Add shine to spike tips
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                for (let i = 0; i < spikeCount; i++) {
                    const tipX = trapX + i * spikeWidth + spikeWidth/2;
                    ctx.fillRect(tipX - 1, trapY + 1, 2, 2);
                }
                
                // Add glow effect for danger
                ctx.shadowColor = '#ff0000';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                for (let i = 0; i < spikeCount; i++) {
                    const tipX = trapX + i * spikeWidth + spikeWidth/2;
                    ctx.fillRect(tipX, trapY, 1, 1);
                }
                ctx.shadowBlur = 0;
            }
        }
    }

    // Draw coins (only those visible in camera view)
    for (const coin of gameState.coins) {
        if (!coin.collected && isVisible(coin)) {
            // Create shiny gold gradient
            const coinX = coin.x + coin.width/2 - camera.x;
            const coinY = coin.y + coin.height/2 - camera.y;
            const coinRadius = coin.width/2;
            
            // Add glow effect
            ctx.shadowColor = '#ffdf00';
            ctx.shadowBlur = 10;
            
            // Create gold gradient
            const coinGradient = ctx.createRadialGradient(
                coinX - coinRadius/3, coinY - coinRadius/3, 0,
                coinX, coinY, coinRadius
            );
            coinGradient.addColorStop(0, '#ffffff'); // Highlight
            coinGradient.addColorStop(0.2, '#ffdf00'); // Bright gold
            coinGradient.addColorStop(0.8, '#ffa500'); // Orange gold
            coinGradient.addColorStop(1, '#ff8c00'); // Dark gold
            
            // Draw main coin circle
            ctx.fillStyle = coinGradient;
            ctx.beginPath();
            ctx.arc(
                coinX, 
                coinY, 
                coinRadius, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
            
            // Add spinning animation
            const spinAngle = (gameState.gameTime * 0.1) % (Math.PI * 2);
            const squishFactor = Math.abs(Math.sin(spinAngle)) * 0.3 + 0.7;
            
            // Draw inner details (dollar sign or star)
            ctx.fillStyle = '#ffffff';
            
            // Draw a star shape
            const starPoints = 5;
            const innerRadius = coinRadius * 0.3;
            const outerRadius = coinRadius * 0.6;
            
            ctx.beginPath();
            for (let i = 0; i < starPoints * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI / starPoints) + spinAngle;
                const x = coinX + Math.cos(angle) * radius * squishFactor;
                const y = coinY + Math.sin(angle) * radius;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
            
            // Reset shadow
            ctx.shadowBlur = 0;
        }
    }
    
    // Draw jetpack if not collected
    if (!gameState.jetpack.collected && isVisible(gameState.jetpack)) {
        // Draw jetpack body
        ctx.fillStyle = gameState.jetpack.color;
        ctx.fillRect(
            gameState.jetpack.x - camera.x,
            gameState.jetpack.y - camera.y,
            gameState.jetpack.width,
            gameState.jetpack.height
        );
        
        // Draw jetpack straps
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(
            gameState.jetpack.x - camera.x - 5,
            gameState.jetpack.y - camera.y + 5,
            5,
            10
        );
        ctx.fillRect(
            gameState.jetpack.x - camera.x + gameState.jetpack.width,
            gameState.jetpack.y - camera.y + 5,
            5,
            10
        );
        
        // Draw nozzles
        ctx.fillStyle = '#555555';
        ctx.fillRect(
            gameState.jetpack.x - camera.x + 5,
            gameState.jetpack.y - camera.y + gameState.jetpack.height,
            5,
            5
        );
        ctx.fillRect(
            gameState.jetpack.x - camera.x + gameState.jetpack.width - 10,
            gameState.jetpack.y - camera.y + gameState.jetpack.height,
            5,
            5
        );
    }
    
    // Draw fuel canisters
    for (const fuel of gameState.fuelCanisters) {
        if (!fuel.collected && isVisible(fuel)) {
            // Draw canister body
            ctx.fillStyle = fuel.color;
            ctx.fillRect(
                fuel.x - camera.x,
                fuel.y - camera.y,
                fuel.width,
                fuel.height
            );
            
            // Draw canister cap
            ctx.fillStyle = '#555555';
            ctx.fillRect(
                fuel.x - camera.x,
                fuel.y - camera.y,
                fuel.width,
                5
            );
        }
    }

    // Draw player (adjusted for camera position) or death animation
    if (gameState.player.isDead) {
        // Draw death particles with improved effects
        for (const particle of gameState.player.deathAnimation.particles) {
            // Create a radial gradient for each particle
            const particleGradient = ctx.createRadialGradient(
                particle.x - camera.x, particle.y - camera.y, 0,
                particle.x - camera.x, particle.y - camera.y, particle.size
            );
            
            // Parse the color components
            const r = parseInt(particle.color.slice(1, 3), 16);
            const g = parseInt(particle.color.slice(3, 5), 16);
            const b = parseInt(particle.color.slice(5, 7), 16);
            
            particleGradient.addColorStop(0, `rgba(${r + 50}, ${g + 50}, ${b + 50}, ${particle.opacity})`);
            particleGradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${particle.opacity})`);
            particleGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            ctx.fillStyle = particleGradient;
            ctx.beginPath();
            ctx.arc(
                particle.x - camera.x,
                particle.y - camera.y,
                particle.size,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Add glow effect to particles
            if (particle.opacity > 0.5) {
                ctx.shadowColor = particle.color;
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(
                    particle.x - camera.x,
                    particle.y - camera.y,
                    particle.size * 0.5,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = `rgba(${r + 100}, ${g + 100}, ${b + 100}, ${particle.opacity * 0.5})`;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    } else {
        // Draw normal player with improved styling
        // Create gradient for player body
        const playerGradient = ctx.createLinearGradient(
            gameState.player.x - camera.x,
            gameState.player.y - camera.y,
            gameState.player.x - camera.x,
            gameState.player.y + gameState.player.height - camera.y
        );
        playerGradient.addColorStop(0, '#4fc3f7'); // Original color
        playerGradient.addColorStop(1, '#0288d1'); // Darker shade for bottom
        
        ctx.fillStyle = playerGradient;
        ctx.fillRect(
            gameState.player.x - camera.x, 
            gameState.player.y - camera.y, 
            gameState.player.width, 
            gameState.player.height
        );
        
        // Add details to player
        // Draw eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(
            gameState.player.x - camera.x + 7,
            gameState.player.y - camera.y + 10,
            5,
            5
        );
        ctx.fillRect(
            gameState.player.x - camera.x + 18,
            gameState.player.y - camera.y + 10,
            5,
            5
        );
        
        // Draw pupils (follow movement direction)
        ctx.fillStyle = '#000000';
        const pupilOffset = gameState.player.velocityX > 0 ? 2 : (gameState.player.velocityX < 0 ? -2 : 0);
        ctx.fillRect(
            gameState.player.x - camera.x + 9 + pupilOffset,
            gameState.player.y - camera.y + 12,
            2,
            2
        );
        ctx.fillRect(
            gameState.player.x - camera.x + 20 + pupilOffset,
            gameState.player.y - camera.y + 12,
            2,
            2
        );
        
        // Draw jetpack on player if collected with improved styling
        if (gameState.player.hasJetpack) {
            // Create gradient for jetpack
            const jetpackGradient = ctx.createLinearGradient(
                gameState.player.x - camera.x - 5,
                gameState.player.y - camera.y + 10,
                gameState.player.x - camera.x + 5,
                gameState.player.y - camera.y + 40
            );
            jetpackGradient.addColorStop(0, '#ffa500'); // Orange
            jetpackGradient.addColorStop(0.7, '#ff8c00'); // Dark orange
            jetpackGradient.addColorStop(1, '#cc7000'); // Even darker
            
            // Draw jetpack body
            ctx.fillStyle = jetpackGradient;
            ctx.fillRect(
                gameState.player.x - camera.x - 8,
                gameState.player.y - camera.y + 10,
                13,
                30
            );
            
            // Draw jetpack details
            // Fuel gauge on jetpack
            const fuelPercentage = gameState.player.jetpackFuel / gameState.player.maxJetpackFuel;
            
            // Gauge background
            ctx.fillStyle = '#333333';
            ctx.fillRect(
                gameState.player.x - camera.x - 5,
                gameState.player.y - camera.y + 15,
                7,
                20
            );
            
            // Fuel level
            let fuelColor;
            if (fuelPercentage > 0.6) {
                fuelColor = '#00ff00'; // Green for high fuel
            } else if (fuelPercentage > 0.3) {
                fuelColor = '#ffff00'; // Yellow for medium fuel
            } else {
                fuelColor = '#ff0000'; // Red for low fuel
            }
            
            ctx.fillStyle = fuelColor;
            const fuelHeight = 20 * fuelPercentage;
            ctx.fillRect(
                gameState.player.x - camera.x - 5,
                gameState.player.y - camera.y + 35 - fuelHeight,
                7,
                fuelHeight
            );
            
            // Draw nozzles
            ctx.fillStyle = '#555555';
            ctx.fillRect(
                gameState.player.x - camera.x - 8,
                gameState.player.y - camera.y + 40,
                5,
                5
            );
            ctx.fillRect(
                gameState.player.x - camera.x,
                gameState.player.y - camera.y + 40,
                5,
                5
            );
            
            // Draw jetpack straps
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(gameState.player.x - camera.x - 8, gameState.player.y - camera.y + 15);
            ctx.lineTo(gameState.player.x - camera.x + 5, gameState.player.y - camera.y + 10);
            ctx.lineTo(gameState.player.x - camera.x + 15, gameState.player.y - camera.y + 15);
            ctx.stroke();
            
            // Draw jetpack flames if active
            drawJetpackFlames();
            
            // Draw jetpack availability indicator
            if (gameState.player.jetpackFuel > 0 && !gameState.player.jetpackActive) {
                // Draw a pulsing indicator above the player
                const pulseSize = Math.sin(gameState.gameTime * 0.1) * 2 + 5;
                
                // Create radial gradient for the indicator
                const indicatorGradient = ctx.createRadialGradient(
                    gameState.player.x + gameState.player.width / 2 - camera.x,
                    gameState.player.y - 10 - camera.y,
                    0,
                    gameState.player.x + gameState.player.width / 2 - camera.x,
                    gameState.player.y - 10 - camera.y,
                    pulseSize + 2
                );
                indicatorGradient.addColorStop(0, '#ffffff');
                indicatorGradient.addColorStop(0.5, '#ffff00');
                indicatorGradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
                
                ctx.fillStyle = indicatorGradient;
                ctx.beginPath();
                ctx.arc(
                    gameState.player.x + gameState.player.width / 2 - camera.x,
                    gameState.player.y - 10 - camera.y,
                    pulseSize + 2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Draw small up arrow with glow effect
                ctx.shadowColor = '#ffff00';
                ctx.shadowBlur = 5;
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.moveTo(gameState.player.x + gameState.player.width / 2 - camera.x, gameState.player.y - 15 - camera.y);
                ctx.lineTo(gameState.player.x + gameState.player.width / 2 - 5 - camera.x, gameState.player.y - 5 - camera.y);
                ctx.lineTo(gameState.player.x + gameState.player.width / 2 + 5 - camera.x, gameState.player.y - 5 - camera.y);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }

    // Draw score and other UI elements (fixed position, not affected by camera)
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${gameState.score}`, 20, 30);
    ctx.fillText(`Position: ${Math.floor(gameState.player.x)}, ${Math.floor(gameState.player.y)}`, 20, 60);
    
    // Draw jetpack fuel gauge if player has jetpack
    if (gameState.player.hasJetpack) {
        const fuelPercentage = gameState.player.jetpackFuel / gameState.player.maxJetpackFuel;
        ctx.fillText(`Jetpack Fuel: ${Math.floor(gameState.player.jetpackFuel)}%`, 20, 90);
        
        // Draw fuel bar background
        ctx.fillStyle = '#333333';
        ctx.fillRect(20, 100, 150, 15);
        
        // Draw fuel level
        let fuelColor;
        if (fuelPercentage > 0.6) {
            fuelColor = '#00ff00'; // Green for high fuel
        } else if (fuelPercentage > 0.3) {
            fuelColor = '#ffff00'; // Yellow for medium fuel
        } else {
            fuelColor = '#ff0000'; // Red for low fuel
        }
        
        ctx.fillStyle = fuelColor;
        ctx.fillRect(20, 100, 150 * fuelPercentage, 15);
    }

    // Draw minimap
    drawMinimap();
    
    // Update UI elements
    if (!gameState.player.isDead) {
        document.getElementById('timeInfo').textContent = `Time: ${Math.floor(gameState.gameTime / FRAME_RATE)}s`;
    }
    document.getElementById('rewindInfo').textContent = `Rewind Energy: ${Math.floor(gameState.rewindEnergy)}%`;
    
    // Visual effect when rewinding
    if (gameState.isRewinding) {
        ctx.fillStyle = 'rgba(79, 195, 247, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = 'rgba(79, 195, 247, 0.8)';
        ctx.lineWidth = 5;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Add a rewind text indicator
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('REWINDING', canvas.width / 2, 50);
        ctx.textAlign = 'left';
    }
    
    // Death message
    if (gameState.player.isDead) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('YOU DIED', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = 'bold 25px Arial';
        ctx.fillText('PRESS R TO REWIND TIME', canvas.width / 2, canvas.height / 2 + 20);
        ctx.textAlign = 'left';
    }
}

// Draw a simple background with parallax effect
function drawBackground() {
    // Far background (slow parallax)
    const bgParallaxFactor = 0.2;
    
    // Draw a gradient sky with more vibrant colors
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#051428'); // Darker blue at top
    gradient.addColorStop(0.5, '#1e3a5a'); // Mid blue
    gradient.addColorStop(1, '#2a547a'); // Lighter blue at bottom
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars in the background
    for (let i = 0; i < 50; i++) {
        const x = (i * 50 + Math.sin(gameState.gameTime * 0.01 + i) * 20) % canvas.width;
        const y = (i * 30 + Math.cos(gameState.gameTime * 0.01 + i) * 15) % (canvas.height * 0.7);
        const size = Math.random() * 2 + 1;
        const brightness = 0.5 + Math.sin(gameState.gameTime * 0.05 + i) * 0.5;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw some distant mountains with better shading
    for (let i = 0; i < 5; i++) {
        const mountainX = (i * 500 - (camera.x * bgParallaxFactor) % 2500) - 100;
        const mountainHeight = 150 + (i % 3) * 50;
        
        // Create mountain gradient for better shading
        const mountainGradient = ctx.createLinearGradient(
            mountainX, canvas.height - mountainHeight,
            mountainX, canvas.height
        );
        mountainGradient.addColorStop(0, '#2a3a4a'); // Top of mountain
        mountainGradient.addColorStop(1, '#1a2a3a'); // Base of mountain
        
        ctx.fillStyle = mountainGradient;
        ctx.beginPath();
        ctx.moveTo(mountainX, canvas.height - mountainHeight);
        ctx.lineTo(mountainX + 250, canvas.height);
        ctx.lineTo(mountainX - 250, canvas.height);
        ctx.fill();
        
        // Add snow caps to mountains
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(mountainX, canvas.height - mountainHeight);
        ctx.lineTo(mountainX + 30, canvas.height - mountainHeight + 40);
        ctx.lineTo(mountainX - 30, canvas.height - mountainHeight + 40);
        ctx.fill();
    }
    
    // Add a closer layer of hills with different parallax
    const hillParallaxFactor = 0.4;
    for (let i = 0; i < 7; i++) {
        const hillX = (i * 350 - (camera.x * hillParallaxFactor) % 2450) - 100;
        const hillHeight = 100 + (i % 4) * 30;
        
        // Create hill gradient
        const hillGradient = ctx.createLinearGradient(
            hillX, canvas.height - hillHeight,
            hillX, canvas.height
        );
        hillGradient.addColorStop(0, '#3a4a5a'); // Top of hill
        hillGradient.addColorStop(1, '#2a3a4a'); // Base of hill
        
        ctx.fillStyle = hillGradient;
        ctx.beginPath();
        
        // Create a more natural hill shape with bezier curves
        ctx.moveTo(hillX - 200, canvas.height);
        ctx.quadraticCurveTo(
            hillX - 100, 
            canvas.height - hillHeight * 0.8, 
            hillX, 
            canvas.height - hillHeight
        );
        ctx.quadraticCurveTo(
            hillX + 100, 
            canvas.height - hillHeight * 0.8, 
            hillX + 200, 
            canvas.height
        );
        ctx.fill();
    }
}

// Draw a minimap in the corner
function drawMinimap() {
    const minimapWidth = 150;
    const minimapHeight = 80;
    const minimapX = canvas.width - minimapWidth - 10;
    const minimapY = 10;
    const minimapScale = minimapWidth / gameState.worldWidth;
    
    // Draw minimap background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(minimapX, minimapY, minimapWidth, minimapHeight);
    
    // Draw platforms on minimap
    ctx.fillStyle = '#555555';
    for (const platform of gameState.platforms) {
        ctx.fillRect(
            minimapX + platform.x * minimapScale,
            minimapY + platform.y * minimapScale * (minimapHeight / gameState.worldHeight),
            platform.width * minimapScale,
            platform.height * minimapScale * (minimapHeight / gameState.worldHeight)
        );
    }
    
    // Draw player on minimap
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(
        minimapX + gameState.player.x * minimapScale,
        minimapY + gameState.player.y * minimapScale * (minimapHeight / gameState.worldHeight),
        gameState.player.width * minimapScale,
        gameState.player.height * minimapScale * (minimapHeight / gameState.worldHeight)
    );
    
    // Draw camera view on minimap
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(
        minimapX + camera.x * minimapScale,
        minimapY + camera.y * minimapScale * (minimapHeight / gameState.worldHeight),
        camera.width * minimapScale,
        camera.height * minimapScale * (minimapHeight / gameState.worldHeight)
    );
}

// Game loop with frame rate control
function gameLoop(timestamp) {
    // Calculate time since last update
    if (!gameState.lastUpdateTime) {
        gameState.lastUpdateTime = timestamp;
    }
    const elapsed = timestamp - gameState.lastUpdateTime;
    
    // Only update if enough time has passed
    if (elapsed > FRAME_DELAY) {
        gameState.lastUpdateTime = timestamp;
        
        if (gameState.isRewinding) {
            rewindGameState();
        } else {
            updatePlayer();
            saveGameState();
            gameState.gameTime++;
            recoverRewindEnergy();
        }
        
        draw();
    }
    
    requestAnimationFrame(gameLoop);
}

// Start the game
requestAnimationFrame(gameLoop); 