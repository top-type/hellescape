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
        maxJetpackFuel: 200, // Increased from 100 to allow for more fuel storage
        jetpackActive: false,
        hasSuperJetpack: false
    },
    worldWidth: 3000,  // Much wider world
    worldHeight: 1000, // Base height for the world (only used for bottom boundary)
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
        
        // High altitude platforms - path to space
        { x: 150, y: 0, width: 100, height: 20, color: '#4a4a4a' },
        { x: 300, y: -100, width: 100, height: 20, color: '#4a4a4a' },
        { x: 450, y: -200, width: 100, height: 20, color: '#4a4a4a' },
        { x: 600, y: -300, width: 100, height: 20, color: '#4a4a4a' },
        { x: 750, y: -400, width: 100, height: 20, color: '#4a4a4a' },
        { x: 900, y: -500, width: 100, height: 20, color: '#4a4a4a' },
        
        // Space station platforms - very high altitude
        { x: 1100, y: -700, width: 300, height: 30, color: '#555555' },
        { x: 1000, y: -750, width: 50, height: 50, color: '#666666' },
        { x: 1450, y: -750, width: 50, height: 50, color: '#666666' },
        { x: 1100, y: -850, width: 300, height: 30, color: '#555555' },
        
        // Asteroid platforms - scattered at extreme heights
        { x: 500, y: -1200, width: 80, height: 80, color: '#444444' },
        { x: 700, y: -1500, width: 120, height: 60, color: '#444444' },
        { x: 1000, y: -1800, width: 100, height: 100, color: '#444444' },
        { x: 1300, y: -2100, width: 90, height: 70, color: '#444444' },
        { x: 1600, y: -2400, width: 110, height: 80, color: '#444444' },
        { x: 1900, y: -2700, width: 100, height: 90, color: '#444444' },
        { x: 2200, y: -3000, width: 120, height: 100, color: '#444444' },
        
        // Space station at extreme height
        { x: 1000, y: -4000, width: 500, height: 50, color: '#777777' },
        { x: 1100, y: -4050, width: 300, height: 50, color: '#666666' },
        { x: 1200, y: -4100, width: 100, height: 50, color: '#555555' },
    ],
    // Add deadly traps
    traps: [
        // Empty array - all traps removed
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
        { x: 500, y: 100, width: 20, height: 30, color: '#00ff00', collected: false, fuelAmount: 100 },
        { x: 1200, y: 250, width: 20, height: 30, color: '#00ff00', collected: false, fuelAmount: 100 },
        { x: 1800, y: 200, width: 20, height: 30, color: '#00ff00', collected: false, fuelAmount: 100 },
        { x: 2400, y: 100, width: 20, height: 30, color: '#00ff00', collected: false, fuelAmount: 100 }
    ],
    score: 0,
    gameTime: 0,
    isRewinding: false,
    rewindEnergy: 100, // Percentage of rewind energy available
    maxRewindFrames: 600, // Maximum number of frames we can rewind (10 seconds at 60fps)
    lastUpdateTime: 0, // For frame rate control
    
    // Add Cthulhu monster
    cthulhu: {
        active: false,
        x: 0,
        y: -10000, // Changed from -6000 to move Cthulhu much deeper in space
        width: 200, // Huge monster
        height: 300,
        velocityX: 0,
        velocityY: 0,
        speed: 2.5, // Chase speed (reduced from 6.0 to make Cthulhu slower)
        activationHeight: -9000, // Changed from -5000 to match the deeper position
        tentacles: [], // Will store tentacle positions
        glowIntensity: 0, // For pulsating red glow effect
        glowDirection: 0.02, // Rate of glow change
        attackCooldown: 0,
        attackRange: 300, // Distance at which it can attack
        soundPlayed: false // Track if the horror sound has been played
    },
};

// Game physics constants
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const FRICTION = 0.8;
const JETPACK_THRUST = -0.5;
const JETPACK_FUEL_CONSUMPTION = 0.3; // Reduced from 1 to make fuel last longer
const FRAME_RATE = 60;
const FRAME_DELAY = 1000 / FRAME_RATE; // Time between frames in milliseconds
const REWIND_ENERGY_DEPLETION_RATE = 0.3;
const REWIND_ENERGY_RECOVERY_RATE = 0.2;
const MAX_REWIND_ENERGY = 100; // Maximum rewind energy value

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
    
    // Always allow space key for rewind (to recover from death)
    if (e.key === ' ') {
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
            keys.up = false;
            break;
        case 'ArrowDown':
        case 's':
            keys.jetpack = false;
            gameState.player.jetpackActive = false;
            break;
        case ' ':
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
    // Horizontal bounds: don't go past the left or right edge of the world
    camera.x = Math.max(0, Math.min(idealX, gameState.worldWidth - camera.width));
    
    // Vertical position: ALWAYS follow the player with NO bounds
    // This allows the camera to follow the player as high as they go
    camera.y = idealY;
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
        document.getElementById('timeInfo').textContent = "YOU DIED - PRESS SPACE TO REWIND";
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
    if (!gameState.player.hasJetpack || gameState.player.isDead || gameState.player.jetpackFuel <= 0) return;
    
    if (keys.jetpack) {
        const isSuperJetpack = gameState.player.hasSuperJetpack;
        const flameX = gameState.player.x - camera.x - 5;
        const flameY = gameState.player.y - camera.y + 45;
        
        // Create flame gradient
        const flameGradient = ctx.createLinearGradient(
            flameX, flameY,
            flameX, flameY + 20
        );
        
        if (isSuperJetpack) {
            // Super jetpack has blue-white flames
            flameGradient.addColorStop(0, '#ffffff');
            flameGradient.addColorStop(0.5, '#00ffff');
            flameGradient.addColorStop(1, '#0088ff');
        } else {
            // Regular jetpack has orange-yellow flames
            flameGradient.addColorStop(0, '#ffffff');
            flameGradient.addColorStop(0.5, '#ffff00');
            flameGradient.addColorStop(1, '#ff8800');
        }
        
        ctx.fillStyle = flameGradient;
        
        // Randomize flame shape
        const flameHeight = 15 + Math.random() * 10;
        const flameWidth = 5 + Math.random() * 3;
        
        // Left flame
        ctx.beginPath();
        ctx.moveTo(flameX - 8, flameY);
        ctx.lineTo(flameX - 8 - flameWidth/2, flameY + flameHeight);
        ctx.lineTo(flameX - 8 + flameWidth/2, flameY + flameHeight);
        ctx.closePath();
        ctx.fill();
        
        // Right flame
        ctx.beginPath();
        ctx.moveTo(flameX, flameY);
        ctx.lineTo(flameX - flameWidth/2, flameY + flameHeight);
        ctx.lineTo(flameX + flameWidth/2, flameY + flameHeight);
        ctx.closePath();
        ctx.fill();
        
        // Add glow effect for super jetpack
        if (isSuperJetpack) {
            ctx.fillStyle = 'rgba(0, 200, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(flameX - 4, flameY + 10, 15, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Update player position and handle physics
function updatePlayer() {
    // Skip player updates if dead (except for death animation)
    if (gameState.player.isDead) {
        updateDeathAnimation();
        return;
    }
    
    // Determine if player is in space (negative y value)
    const isInSpace = gameState.player.y < -500;
    const spaceDepth = Math.min(1, Math.abs(gameState.player.y + 500) / 3500); // 0 at edge of space, 1 at -4000
    
    // Adjust physics based on altitude
    const gravityFactor = isInSpace ? Math.max(0.1, 1 - spaceDepth * 0.9) : 1; // Reduced gravity in space
    const currentGravity = GRAVITY * gravityFactor;
    
    // Handle horizontal movement
    if (keys.left) {
        gameState.player.velocityX = -MOVE_SPEED;
    } else if (keys.right) {
        gameState.player.velocityX = MOVE_SPEED;
    } else {
        // Friction is reduced in space
        const frictionFactor = isInSpace ? Math.max(0.95, 1 - spaceDepth * 0.2) : FRICTION;
        gameState.player.velocityX *= frictionFactor;
    }

    // Apply gravity (reduced in space)
    gameState.player.velocityY += currentGravity;

    // Handle jumping
    if (keys.up && !gameState.player.isJumping) {
        // Jump force increases slightly in space
        const jumpFactor = isInSpace ? 1 + spaceDepth * 0.3 : 1;
        gameState.player.velocityY = JUMP_FORCE * jumpFactor;
        gameState.player.isJumping = true;
    }
    
    // Handle jetpack
    if (gameState.player.hasJetpack && keys.jetpack && gameState.player.jetpackFuel > 0) {
        // Check if player has super jetpack
        const hasSuperJetpack = gameState.player.hasSuperJetpack;
        
        // Apply upward thrust - directly set velocity for immediate response
        // Super jetpack has stronger thrust
        const thrustFactor = hasSuperJetpack ? 1.5 : 1;
        // Thrust is more effective in space
        const spaceThrustBonus = isInSpace ? 1 + spaceDepth * 0.5 : 1;
        
        gameState.player.velocityY = JETPACK_THRUST * 5 * thrustFactor * spaceThrustBonus;
        
        // Consume fuel (super jetpack uses less fuel)
        const fuelConsumptionRate = hasSuperJetpack ? 
            JETPACK_FUEL_CONSUMPTION * 0.5 : 
            JETPACK_FUEL_CONSUMPTION;
        
        // Fuel consumption is reduced in space
        const spaceFuelBonus = isInSpace ? 1 - spaceDepth * 0.5 : 1;
        
        gameState.player.jetpackFuel -= fuelConsumptionRate * spaceFuelBonus;
        
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
    gameState.player.isJumping = true;
    
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
            // Space coins are worth more
            gameState.score += coin.value || 10;
        }
    }
    
    // Check jetpack collision
    if (!gameState.jetpack.collected && checkCollision(gameState.player, gameState.jetpack)) {
        gameState.jetpack.collected = true;
        gameState.player.hasJetpack = true;
        gameState.player.jetpackFuel = gameState.player.maxJetpackFuel;
    }
    
    // Check super jetpack collision
    if (gameState.superJetpack && !gameState.superJetpack.collected && 
        checkCollision(gameState.player, gameState.superJetpack)) {
        gameState.superJetpack.collected = true;
        gameState.player.hasSuperJetpack = true;
        // Refill fuel and increase max fuel capacity
        gameState.player.maxJetpackFuel = 200;
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

// Draw platforms with special styling for high-altitude platforms
function drawPlatforms() {
    for (const platform of gameState.platforms) {
        // Skip if not visible in camera view
        if (!isVisible(platform)) continue;
        
        // Determine if this is a high-altitude platform (negative y value)
        const isHighAltitude = platform.y < 0;
        const isExtremeAltitude = platform.y < -1000;
        
        // Create different styles based on altitude
        if (isExtremeAltitude) {
            // Space station or asteroid style
            if (platform.width > 200) {
                // Space station style
                // Main platform
                ctx.fillStyle = '#888888';
                ctx.fillRect(
                    platform.x - camera.x,
                    platform.y - camera.y,
                    platform.width,
                    platform.height
                );
                
                // Add metallic details
                ctx.fillStyle = '#aaaaaa';
                ctx.fillRect(
                    platform.x - camera.x + 10,
                    platform.y - camera.y + 5,
                    platform.width - 20,
                    5
                );
                
                // Add solar panels
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(
                    platform.x - camera.x - 50,
                    platform.y - camera.y + 10,
                    40,
                    20
                );
                ctx.fillRect(
                    platform.x - camera.x + platform.width + 10,
                    platform.y - camera.y + 10,
                    40,
                    20
                );
                
                // Add station lights
                for (let i = 0; i < platform.width; i += 30) {
                    ctx.fillStyle = `rgba(255, 255, 100, ${0.7 + Math.sin(gameState.gameTime * 0.05 + i) * 0.3})`;
                    ctx.fillRect(
                        platform.x - camera.x + i,
                        platform.y - camera.y - 5,
                        5,
                        5
                    );
                }
            } else if (platform.width === platform.height) {
                // Asteroid style - round shape
                const centerX = platform.x - camera.x + platform.width / 2;
                const centerY = platform.y - camera.y + platform.height / 2;
                const radius = platform.width / 2;
                
                // Create asteroid gradient
                const asteroidGradient = ctx.createRadialGradient(
                    centerX, centerY, 0,
                    centerX, centerY, radius
                );
                asteroidGradient.addColorStop(0, '#555555');
                asteroidGradient.addColorStop(0.7, '#444444');
                asteroidGradient.addColorStop(1, '#333333');
                
                ctx.fillStyle = asteroidGradient;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Add crater details
                ctx.fillStyle = '#333333';
                ctx.beginPath();
                ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(centerX + radius * 0.4, centerY + radius * 0.1, radius * 0.15, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Irregular space debris
                ctx.fillStyle = '#555555';
                ctx.beginPath();
                ctx.moveTo(platform.x - camera.x, platform.y - camera.y);
                ctx.lineTo(platform.x - camera.x + platform.width, platform.y - camera.y);
                ctx.lineTo(platform.x - camera.x + platform.width - 10, platform.y - camera.y + platform.height);
                ctx.lineTo(platform.x - camera.x + 10, platform.y - camera.y + platform.height);
                ctx.closePath();
                ctx.fill();
                
                // Add texture
                ctx.fillStyle = '#444444';
                ctx.fillRect(
                    platform.x - camera.x + 10,
                    platform.y - camera.y + 5,
                    platform.width - 20,
                    5
                );
            }
        } else if (isHighAltitude) {
            // High-altitude platforms (upper atmosphere)
            // Create a metallic look
            const platformGradient = ctx.createLinearGradient(
                platform.x - camera.x,
                platform.y - camera.y,
                platform.x - camera.x,
                platform.y - camera.y + platform.height
            );
            platformGradient.addColorStop(0, '#6a6a6a');
            platformGradient.addColorStop(0.5, '#5a5a5a');
            platformGradient.addColorStop(1, '#4a4a4a');
            
            ctx.fillStyle = platformGradient;
            ctx.fillRect(
                platform.x - camera.x,
                platform.y - camera.y,
                platform.width,
                platform.height
            );
            
            // Add metallic edge
            ctx.fillStyle = '#7a7a7a';
            ctx.fillRect(
                platform.x - camera.x,
                platform.y - camera.y,
                platform.width,
                3
            );
        } else {
            // Regular ground-level platforms
            // Create a subtle gradient for the platform
            const platformGradient = ctx.createLinearGradient(
                platform.x - camera.x,
                platform.y - camera.y,
                platform.x - camera.x,
                platform.y - camera.y + platform.height
            );
            platformGradient.addColorStop(0, '#4a4a4a');
            platformGradient.addColorStop(1, '#2a2a2a');
            
            ctx.fillStyle = platformGradient;
            ctx.fillRect(
                platform.x - camera.x,
                platform.y - camera.y,
                platform.width,
                platform.height
            );
            
            // Add a subtle texture to the platform
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            for (let i = 0; i < platform.width; i += 20) {
                ctx.fillRect(
                    platform.x - camera.x + i,
                    platform.y - camera.y,
                    10,
                    platform.height
                );
            }
        }
    }
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background with parallax effect and space transition based on height
    drawBackground();
    
    // Draw platforms (only those visible in camera view)
    drawPlatforms();
    
    // Draw traps (only those visible in camera view)
    for (const trap of gameState.traps) {
        if (isVisible(trap)) {
            // Create a gradient for the trap
            const trapGradient = ctx.createLinearGradient(
                trap.x - camera.x,
                trap.y - camera.y,
                trap.x - camera.x,
                trap.y - camera.y + trap.height
            );
            trapGradient.addColorStop(0, '#ff0000'); // Bright red at top
            trapGradient.addColorStop(1, '#880000'); // Dark red at bottom
            
            ctx.fillStyle = trapGradient;
            
            // Draw spike shape
            ctx.beginPath();
            ctx.moveTo(trap.x - camera.x, trap.y - camera.y + trap.height);
            ctx.lineTo(trap.x - camera.x + trap.width / 2, trap.y - camera.y);
            ctx.lineTo(trap.x - camera.x + trap.width, trap.y - camera.y + trap.height);
            ctx.closePath();
            ctx.fill();
            
            // Add metallic base
            ctx.fillStyle = '#555555';
            ctx.fillRect(
                trap.x - camera.x,
                trap.y - camera.y + trap.height - 5,
                trap.width,
                5
            );
        }
    }
    
    // Draw coins
    drawCoins();
    
    // Draw jetpack if not collected
    if (!gameState.jetpack.collected && isVisible(gameState.jetpack)) {
        // Draw jetpack body
        ctx.fillStyle = '#ff8800';
        ctx.fillRect(
            gameState.jetpack.x - camera.x,
            gameState.jetpack.y - camera.y,
            gameState.jetpack.width,
            gameState.jetpack.height
        );
        
        // Draw jetpack details
        ctx.fillStyle = '#cc6600';
        ctx.fillRect(
            gameState.jetpack.x - camera.x,
            gameState.jetpack.y - camera.y + gameState.jetpack.height - 10,
            gameState.jetpack.width,
            10
        );
        
        // Draw nozzles
        ctx.fillStyle = '#444444';
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
    drawFuelCanisters();
    
    // Draw Cthulhu monster
    drawCthulhu();
    
    // Draw player (adjusted for camera position) or death animation
    if (gameState.player.isDead) {
        // Draw death particles
        for (const particle of gameState.player.deathAnimation.particles) {
            ctx.fillStyle = particle.color;
            ctx.fillRect(
                particle.x - camera.x,
                particle.y - camera.y,
                particle.size,
                particle.size
            );
        }
    } else {
        // Draw player with space suit at high altitudes
        drawPlayer();
    }
    
    // Draw UI elements
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${gameState.score}`, 20, 30);
    
    // Draw rewind energy bar
    const rewindBarWidth = 150;
    const rewindBarHeight = 15;
    const rewindBarX = canvas.width - rewindBarWidth - 20;
    const rewindBarY = 20;
    
    // Draw background
    ctx.fillStyle = '#333333';
    ctx.fillRect(rewindBarX, rewindBarY, rewindBarWidth, rewindBarHeight);
    
    // Draw energy level
    const energyWidth = (gameState.rewindEnergy / MAX_REWIND_ENERGY) * rewindBarWidth;
    ctx.fillStyle = gameState.rewindEnergy > 20 ? '#00ff00' : '#ff0000';
    ctx.fillRect(rewindBarX, rewindBarY, energyWidth, rewindBarHeight);
    
    // Draw border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(rewindBarX, rewindBarY, rewindBarWidth, rewindBarHeight);
    
    // Draw rewind instructions if player is dead
    if (gameState.player.isDead) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2 - 40, 300, 80);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('PRESS SPACE TO REWIND', canvas.width / 2 - 120, canvas.height / 2);
        ctx.font = '16px Arial';
        ctx.fillText('Rewind time to avoid your death!', canvas.width / 2 - 120, canvas.height / 2 + 25);
    }
    
    // Draw altitude indicator when player is high up
    if (gameState.player.y < 0) {
        const altitude = Math.abs(Math.floor(gameState.player.y));
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`ALTITUDE: ${altitude}m`, canvas.width / 2 - 70, 30);
        
        // Add space zone indicators
        if (altitude > 4000) {
            ctx.fillStyle = '#ff00ff';
            ctx.fillText('DEEP SPACE ZONE', canvas.width / 2 - 80, 55);
        } else if (altitude > 2000) {
            ctx.fillStyle = '#00ffff';
            ctx.fillText('OUTER SPACE ZONE', canvas.width / 2 - 80, 55);
        } else if (altitude > 500) {
            ctx.fillStyle = '#80c0ff';
            ctx.fillText('UPPER ATMOSPHERE', canvas.width / 2 - 80, 55);
        }
    }
}

// Draw a background with parallax effect and space transition based on height
function drawBackground() {
    // Calculate height factor for space transition (0 at ground level, 1 at high altitude)
    const spaceTransitionStart = 0; // Height where space transition begins
    const spaceTransitionEnd = 5000; // Height where full space environment is visible
    const heightFactor = Math.min(1, Math.max(0, (gameState.player.y < 0 ? Math.abs(gameState.player.y) : 0) / spaceTransitionEnd));
    
    // Far background (slow parallax)
    const bgParallaxFactor = 0.2;
    
    // Draw a gradient sky with colors that change based on height
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    
    if (heightFactor < 0.3) {
        // Ground level to lower atmosphere
        gradient.addColorStop(0, `rgba(5, 20, 40, ${1 - heightFactor})`); // Darker blue at top
        gradient.addColorStop(0.5, `rgba(30, 58, 90, ${1 - heightFactor})`); // Mid blue
        gradient.addColorStop(1, `rgba(42, 84, 122, ${1 - heightFactor})`); // Lighter blue at bottom
    } else if (heightFactor < 0.7) {
        // Upper atmosphere transition
        const transitionFactor = (heightFactor - 0.3) / 0.4;
        gradient.addColorStop(0, `rgba(5, 10, 30, ${1 - transitionFactor})`); // Darker blue fading out
        gradient.addColorStop(0.5, `rgba(20, 30, 70, ${1 - transitionFactor})`); // Mid blue fading out
        gradient.addColorStop(1, `rgba(30, 40, 90, ${1 - transitionFactor})`); // Lighter blue fading out
    } else {
        // Space - nearly black with slight blue tint
        gradient.addColorStop(0, 'rgba(1, 2, 10, 1)');
        gradient.addColorStop(1, 'rgba(2, 5, 15, 1)');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars with intensity based on height
    const starCount = 50 + Math.floor(heightFactor * 150); // More stars as we go higher
    const starBrightness = 0.5 + heightFactor * 0.5; // Stars get brighter
    const starSize = 1 + heightFactor * 1.5; // Stars get slightly larger
    
    for (let i = 0; i < starCount; i++) {
        // Use a combination of fixed position and camera position for parallax effect
        const parallaxFactor = 0.1 + (i % 10) / 10; // Different stars move at different rates
        const x = (i * 50 + Math.sin(gameState.gameTime * 0.01 + i) * 20 - camera.x * parallaxFactor * 0.1) % canvas.width;
        const y = (i * 30 + Math.cos(gameState.gameTime * 0.01 + i) * 15 - camera.y * parallaxFactor * 0.1) % canvas.height;
        
        const size = Math.random() * starSize + 1;
        const brightness = starBrightness * (0.5 + Math.sin(gameState.gameTime * 0.05 + i) * 0.5);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add space objects that only appear at higher altitudes
    if (heightFactor > 0.4) {
        // Draw distant planets
        const planetVisibility = Math.max(0, (heightFactor - 0.4) / 0.6);
        
        // Planet 1 - large gas giant
        const planet1X = (canvas.width * 0.7 - camera.x * 0.05) % (canvas.width * 2) - canvas.width * 0.5;
        const planet1Y = (canvas.height * 0.3 - camera.y * 0.05) % (canvas.height * 2);
        const planet1Size = 80 + Math.sin(gameState.gameTime * 0.001) * 5;
        
        const planet1Gradient = ctx.createRadialGradient(
            planet1X, planet1Y, 0,
            planet1X, planet1Y, planet1Size
        );
        planet1Gradient.addColorStop(0, `rgba(255, 200, 100, ${0.8 * planetVisibility})`);
        planet1Gradient.addColorStop(0.7, `rgba(200, 100, 50, ${0.7 * planetVisibility})`);
        planet1Gradient.addColorStop(1, `rgba(150, 50, 30, ${0.1 * planetVisibility})`);
        
        ctx.fillStyle = planet1Gradient;
        ctx.beginPath();
        ctx.arc(planet1X, planet1Y, planet1Size, 0, Math.PI * 2);
        ctx.fill();
        
        // Planet 2 - smaller blue planet
        if (heightFactor > 0.6) {
            const planet2X = (canvas.width * 0.2 - camera.x * 0.03) % (canvas.width * 2) - canvas.width * 0.5;
            const planet2Y = (canvas.height * 0.7 - camera.y * 0.03) % (canvas.height * 2);
            const planet2Size = 40 + Math.sin(gameState.gameTime * 0.002 + 2) * 3;
            
            const planet2Gradient = ctx.createRadialGradient(
                planet2X, planet2Y, 0,
                planet2X, planet2Y, planet2Size
            );
            planet2Gradient.addColorStop(0, `rgba(100, 200, 255, ${0.8 * planetVisibility})`);
            planet2Gradient.addColorStop(0.6, `rgba(50, 100, 200, ${0.7 * planetVisibility})`);
            planet2Gradient.addColorStop(1, `rgba(20, 50, 150, ${0.1 * planetVisibility})`);
            
            ctx.fillStyle = planet2Gradient;
            ctx.beginPath();
            ctx.arc(planet2X, planet2Y, planet2Size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Only draw mountains and hills when we're close to the ground
    if (heightFactor < 0.5) {
        const groundVisibility = 1 - heightFactor * 2;
        
        // Draw some distant mountains with better shading
        for (let i = 0; i < 5; i++) {
            const mountainX = (i * 500 - (camera.x * bgParallaxFactor) % 2500) - 100;
            const mountainHeight = 150 + (i % 3) * 50;
            
            // Create mountain gradient for better shading
            const mountainGradient = ctx.createLinearGradient(
                mountainX, canvas.height - mountainHeight,
                mountainX, canvas.height
            );
            mountainGradient.addColorStop(0, `rgba(42, 58, 74, ${groundVisibility})`); // Top of mountain
            mountainGradient.addColorStop(1, `rgba(26, 42, 58, ${groundVisibility})`); // Base of mountain
            
            ctx.fillStyle = mountainGradient;
            ctx.beginPath();
            ctx.moveTo(mountainX, canvas.height - mountainHeight);
            ctx.lineTo(mountainX + 250, canvas.height);
            ctx.lineTo(mountainX - 250, canvas.height);
            ctx.fill();
            
            // Add snow caps to mountains
            ctx.fillStyle = `rgba(255, 255, 255, ${groundVisibility})`;
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
            hillGradient.addColorStop(0, `rgba(58, 74, 90, ${groundVisibility})`); // Top of hill
            hillGradient.addColorStop(1, `rgba(42, 58, 74, ${groundVisibility})`); // Base of hill
            
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
            updateCthulhu(); // Add Cthulhu update
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

// Add space-themed collectibles at higher altitudes
function initializeSpaceCollectibles() {
    // Add special space coins at higher altitudes
    for (let y = -500; y >= -4000; y -= 300) {
        // Create clusters of space coins
        const baseX = Math.random() * 2000 + 500;
        
        for (let i = 0; i < 5; i++) {
            const offsetX = (i - 2) * 50;
            const offsetY = Math.sin(i) * 50;
            
            gameState.coins.push({
                x: baseX + offsetX,
                y: y + offsetY,
                width: 20,
                height: 20,
                collected: false,
                isSpaceCoin: true,
                value: 50, // Space coins are worth more
                rotation: 0
            });
        }
    }
    
    // Add special fuel canisters in space (oxygen tanks)
    for (let y = -1000; y >= -4000; y -= 500) {
        gameState.fuelCanisters.push({
            x: Math.random() * 2500 + 250,
            y: y,
            width: 25,
            height: 35,
            collected: false,
            fuelAmount: 50, // More fuel in space canisters
            isOxygenTank: true
        });
    }
    
    // Add a super jetpack at the space station
    gameState.superJetpack = {
        x: 1250,
        y: -4150,
        width: 40,
        height: 40,
        collected: false
    };
}

// Call this function after initializing the game state
initializeSpaceCollectibles();

// Update the draw function to render space collectibles differently
function drawCoins() {
    for (const coin of gameState.coins) {
        if (coin.collected || !isVisible(coin)) continue;
        
        // Update coin rotation
        coin.rotation = (coin.rotation || 0) + 0.05;
        
        if (coin.isSpaceCoin) {
            // Space coin with special effects
            const coinX = coin.x - camera.x + coin.width / 2;
            const coinY = coin.y - camera.y + coin.height / 2;
            
            // Draw glowing effect
            const glowSize = 10 + Math.sin(gameState.gameTime * 0.05) * 3;
            const gradient = ctx.createRadialGradient(
                coinX, coinY, 0,
                coinX, coinY, coin.width / 2 + glowSize
            );
            gradient.addColorStop(0, 'rgba(200, 200, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(100, 100, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(50, 50, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(coinX, coinY, coin.width / 2 + glowSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw the space coin with a star shape
            ctx.save();
            ctx.translate(coinX, coinY);
            ctx.rotate(coin.rotation);
            
            // Draw a star shape
            ctx.fillStyle = '#8080ff';
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                const outerX = Math.cos(angle) * (coin.width / 2);
                const outerY = Math.sin(angle) * (coin.height / 2);
                
                const innerAngle = angle + Math.PI / 5;
                const innerX = Math.cos(innerAngle) * (coin.width / 4);
                const innerY = Math.sin(innerAngle) * (coin.height / 4);
                
                if (i === 0) {
                    ctx.moveTo(outerX, outerY);
                } else {
                    ctx.lineTo(outerX, outerY);
                }
                
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
            
            // Add inner glow
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, coin.width / 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        } else {
            // Regular coin
            // ... existing regular coin drawing code ...
            const coinX = coin.x - camera.x + coin.width / 2;
            const coinY = coin.y - camera.y + coin.height / 2;
            
            // Draw coin with gradient
            const gradient = ctx.createRadialGradient(
                coinX, coinY, 0,
                coinX, coinY, coin.width / 2
            );
            gradient.addColorStop(0, '#fff7aa');
            gradient.addColorStop(1, '#ffd700');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(coinX, coinY, coin.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Add shine effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(
                coinX - coin.width / 6,
                coinY - coin.height / 6,
                coin.width / 6,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }
}

function drawFuelCanisters() {
    for (const fuel of gameState.fuelCanisters) {
        if (fuel.collected || !isVisible(fuel)) continue;
        
        if (fuel.isOxygenTank) {
            // Draw oxygen tank for space
            const fuelX = fuel.x - camera.x;
            const fuelY = fuel.y - camera.y;
            
            // Tank body
            ctx.fillStyle = '#a0d0ff';
            ctx.fillRect(fuelX, fuelY, fuel.width, fuel.height);
            
            // Tank cap
            ctx.fillStyle = '#80a0c0';
            ctx.fillRect(fuelX, fuelY, fuel.width, 5);
            
            // Tank valve
            ctx.fillStyle = '#6080a0';
            ctx.fillRect(fuelX + fuel.width / 2 - 2, fuelY - 5, 4, 5);
            
            // Oxygen symbol
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.fillText('O₂', fuelX + 5, fuelY + 20);
            
            // Glow effect
            ctx.fillStyle = 'rgba(160, 208, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(
                fuelX + fuel.width / 2,
                fuelY + fuel.height / 2,
                fuel.width,
                0,
                Math.PI * 2
            );
            ctx.fill();
        } else {
            // Regular fuel canister
            // ... existing fuel canister drawing code ...
            const fuelX = fuel.x - camera.x;
            const fuelY = fuel.y - camera.y;
            
            // Canister body
            ctx.fillStyle = '#00cc00';
            ctx.fillRect(fuelX, fuelY, fuel.width, fuel.height);
            
            // Canister cap
            ctx.fillStyle = '#008800';
            ctx.fillRect(fuelX, fuelY, fuel.width, 5);
            
            // Fuel gauge
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(fuelX + 5, fuelY + 10, fuel.width - 10, fuel.height - 20);
            
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(fuelX + 7, fuelY + 12, fuel.width - 14, fuel.height - 24);
        }
    }
    
    // Draw super jetpack if not collected
    if (gameState.superJetpack && !gameState.superJetpack.collected && isVisible(gameState.superJetpack)) {
        const jetpackX = gameState.superJetpack.x - camera.x;
        const jetpackY = gameState.superJetpack.y - camera.y;
        
        // Jetpack body
        ctx.fillStyle = '#ff5500';
        ctx.fillRect(jetpackX, jetpackY, gameState.superJetpack.width, gameState.superJetpack.height);
        
        // Jetpack nozzles
        ctx.fillStyle = '#cc3300';
        ctx.fillRect(jetpackX, jetpackY + gameState.superJetpack.height - 10, 10, 10);
        ctx.fillRect(jetpackX + gameState.superJetpack.width - 10, jetpackY + gameState.superJetpack.height - 10, 10, 10);
        
        // Jetpack straps
        ctx.strokeStyle = '#aa2200';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(jetpackX, jetpackY + 5);
        ctx.lineTo(jetpackX - 10, jetpackY + 15);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(jetpackX + gameState.superJetpack.width, jetpackY + 5);
        ctx.lineTo(jetpackX + gameState.superJetpack.width + 10, jetpackY + 15);
        ctx.stroke();
        
        // Glow effect
        const glowSize = 5 + Math.sin(gameState.gameTime * 0.1) * 2;
        ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(
            jetpackX + gameState.superJetpack.width / 2,
            jetpackY + gameState.superJetpack.height / 2,
            gameState.superJetpack.width / 2 + glowSize,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // "SUPER" text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('SUPER', jetpackX + 2, jetpackY + 15);
    }
}

// Draw player with space suit at high altitudes
function drawPlayer() {
    if (gameState.player.isDead) {
        // Don't draw the player if dead, death animation is handled separately
        return;
    }
    
    // Check if player is in space
    const isInSpace = gameState.player.y < -500;
    const spaceDepth = Math.min(1, Math.abs(gameState.player.y + 500) / 3500);
    
    // Draw jetpack first (if player has one)
    if (gameState.player.hasJetpack) {
        const isSuperJetpack = gameState.player.hasSuperJetpack;
        
        // Draw jetpack body
        ctx.fillStyle = isSuperJetpack ? '#ff5500' : '#ff8800';
        ctx.fillRect(
            gameState.player.x - camera.x - 10,
            gameState.player.y - camera.y + 15,
            20,
            30
        );
        
        // Draw fuel gauge
        const fuelHeight = (gameState.player.jetpackFuel / gameState.player.maxJetpackFuel) * 25;
        
        // Gauge background
        ctx.fillStyle = '#333333';
        ctx.fillRect(
            gameState.player.x - camera.x - 5,
            gameState.player.y - camera.y + 35 - 25,
            7,
            25
        );
        
        // Fuel level
        ctx.fillStyle = isSuperJetpack ? '#00ffff' : '#00ff00';
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
        
        // Draw super jetpack details if applicable
        if (isSuperJetpack) {
            // Add glowing edges
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                gameState.player.x - camera.x - 10,
                gameState.player.y - camera.y + 15,
                20,
                30
            );
            
            // Add "SUPER" text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8px Arial';
            ctx.fillText('SUPER', gameState.player.x - camera.x - 8, gameState.player.y - camera.y + 25);
        }
        
        // Draw jetpack flames if active
        drawJetpackFlames();
    }
    
    // Draw player body
    if (isInSpace) {
        // Space suit appearance
        // Create gradient for space suit
        const suitGradient = ctx.createLinearGradient(
            gameState.player.x - camera.x,
            gameState.player.y - camera.y,
            gameState.player.x - camera.x,
            gameState.player.y + gameState.player.height - camera.y
        );
        
        // Color changes based on depth in space
        if (spaceDepth > 0.7) {
            // Deep space suit (white with blue accents)
            suitGradient.addColorStop(0, '#ffffff');
            suitGradient.addColorStop(1, '#e0e0ff');
        } else {
            // Upper atmosphere suit (light blue)
            suitGradient.addColorStop(0, '#a0c0ff');
            suitGradient.addColorStop(1, '#80a0e0');
        }
        
        // Draw the space suit body
        ctx.fillStyle = suitGradient;
        ctx.fillRect(
            gameState.player.x - camera.x, 
            gameState.player.y - camera.y, 
            gameState.player.width, 
            gameState.player.height
        );
        
        // Draw helmet visor
        ctx.fillStyle = spaceDepth > 0.7 ? '#80c0ff' : '#60a0e0';
        ctx.fillRect(
            gameState.player.x - camera.x + 5, 
            gameState.player.y - camera.y + 5, 
            gameState.player.width - 10, 
            15
        );
        
        // Draw suit details
        ctx.fillStyle = '#555555';
        // Oxygen tank
        ctx.fillRect(
            gameState.player.x - camera.x + gameState.player.width - 5, 
            gameState.player.y - camera.y + 20, 
            5, 
            20
        );
        
        // Draw suit joints
        ctx.fillStyle = '#444444';
        // Arm joint
        ctx.fillRect(
            gameState.player.x - camera.x + gameState.player.width - 8, 
            gameState.player.y - camera.y + 20, 
            8, 
            5
        );
        // Leg joint
        ctx.fillRect(
            gameState.player.x - camera.x + gameState.player.width/2 - 5, 
            gameState.player.y - camera.y + 35, 
            10, 
            5
        );
        
        // Add space suit glow in deep space
        if (spaceDepth > 0.7) {
            ctx.fillStyle = 'rgba(160, 200, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(
                gameState.player.x - camera.x + gameState.player.width/2,
                gameState.player.y - camera.y + gameState.player.height/2,
                gameState.player.width,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    } else {
        // Regular player appearance
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
    }
}

// Function to update the Cthulhu monster
function updateCthulhu() {
    const cthulhu = gameState.cthulhu;
    
    // Check if player is high enough to activate Cthulhu
    if (!cthulhu.active && gameState.player.y < cthulhu.activationHeight) {
        cthulhu.active = true;
        // Position Cthulhu off-screen when activated
        cthulhu.x = gameState.player.x + 1000;
        cthulhu.y = gameState.player.y - 500;
        
        // Play horror sound when Cthulhu first appears
        const horrorSound = document.getElementById('horrorBegins');
        if (horrorSound && !cthulhu.soundPlayed) {
            horrorSound.volume = 0.7; // Set volume to 70%
            horrorSound.currentTime = 0; // Reset to beginning
            horrorSound.play().catch(e => console.log('Error playing sound:', e));
            cthulhu.soundPlayed = true;
        }
        
        // Initialize tentacles
        cthulhu.tentacles = [];
        for (let i = 0; i < 8; i++) {
            cthulhu.tentacles.push({
                length: 50 + Math.random() * 100,
                angle: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.03,
                segments: 5 + Math.floor(Math.random() * 3)
            });
        }
    }
    
    // Update Cthulhu if active
    if (cthulhu.active) {
        // Update glow effect
        cthulhu.glowIntensity += cthulhu.glowDirection;
        if (cthulhu.glowIntensity > 1 || cthulhu.glowIntensity < 0) {
            cthulhu.glowDirection *= -1;
        }
        
        // Calculate direction to player
        const dx = gameState.player.x - cthulhu.x;
        const dy = gameState.player.y - cthulhu.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Move toward player
        if (distance > 50) { // Don't move if very close
            // Calculate dynamic speed based on distance
            // The farther away Cthulhu is, the faster it moves
            const baseSpeed = cthulhu.speed;
            const distanceFactor = Math.min(5, distance / 300); // Reduced cap to 2x and increased distance threshold to 500
            const dynamicSpeed = baseSpeed * distanceFactor;
            
            cthulhu.velocityX = (dx / distance) * dynamicSpeed;
            cthulhu.velocityY = (dy / distance) * dynamicSpeed;
            
            cthulhu.x += cthulhu.velocityX;
            cthulhu.y += cthulhu.velocityY;
        }
        
        // Update tentacle animations
        for (const tentacle of cthulhu.tentacles) {
            tentacle.angle += tentacle.speed;
        }
        
        // Attack player if in range
        if (distance < cthulhu.attackRange && cthulhu.attackCooldown <= 0) {
            // Check for collision with player
            if (checkCollision(
                {
                    x: cthulhu.x - cthulhu.width/2,
                    y: cthulhu.y - cthulhu.height/2,
                    width: cthulhu.width,
                    height: cthulhu.height
                },
                gameState.player
            )) {
                killPlayer();
            }
            
            // Set attack cooldown
            cthulhu.attackCooldown = 60; // 1 second at 60fps
        }
        
        // Decrease attack cooldown
        if (cthulhu.attackCooldown > 0) {
            cthulhu.attackCooldown--;
        }
    }
}

// Function to draw the Cthulhu monster
function drawCthulhu() {
    const cthulhu = gameState.cthulhu;
    
    if (cthulhu.active && isVisible({
        x: cthulhu.x - cthulhu.width/2,
        y: cthulhu.y - cthulhu.height/2,
        width: cthulhu.width,
        height: cthulhu.height
    })) {
        // Save context for transformations
        ctx.save();
        
        // Create a red glow effect
        const glowRadius = 100 + cthulhu.glowIntensity * 50;
        const gradient = ctx.createRadialGradient(
            cthulhu.x - camera.x, cthulhu.y - camera.y,
            0,
            cthulhu.x - camera.x, cthulhu.y - camera.y,
            glowRadius
        );
        gradient.addColorStop(0, `rgba(255, 0, 0, ${0.3 + cthulhu.glowIntensity * 0.2})`);
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        // Draw the glow
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cthulhu.x - camera.x, cthulhu.y - camera.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw the main body (pitch black with slight red tint)
        ctx.fillStyle = 'rgba(10, 0, 0, 0.9)';
        ctx.beginPath();
        ctx.ellipse(
            cthulhu.x - camera.x,
            cthulhu.y - camera.y,
            cthulhu.width / 2,
            cthulhu.height / 2,
            0, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Draw eyes (glowing red)
        const eyeSize = 15;
        const eyeSpacing = 40;
        
        ctx.fillStyle = `rgba(255, 0, 0, ${0.7 + cthulhu.glowIntensity * 0.3})`;
        
        // Left eye
        ctx.beginPath();
        ctx.arc(
            cthulhu.x - camera.x - eyeSpacing,
            cthulhu.y - camera.y - 30,
            eyeSize, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(
            cthulhu.x - camera.x + eyeSpacing,
            cthulhu.y - camera.y - 30,
            eyeSize, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Draw tentacles
        ctx.strokeStyle = 'rgba(10, 0, 0, 0.9)';
        ctx.lineWidth = 10;
        
        for (const tentacle of cthulhu.tentacles) {
            ctx.beginPath();
            
            // Start at the body
            let startX = cthulhu.x - camera.x;
            let startY = cthulhu.y - camera.y + cthulhu.height/3;
            
            ctx.moveTo(startX, startY);
            
            // Draw tentacle segments
            for (let i = 1; i <= tentacle.segments; i++) {
                const segmentLength = tentacle.length / tentacle.segments;
                const segmentAngle = tentacle.angle + Math.sin(gameState.gameTime * 0.05 + i) * 0.5;
                
                const endX = startX + Math.cos(segmentAngle + i * 0.5) * segmentLength;
                const endY = startY + Math.sin(segmentAngle + i * 0.5) * segmentLength;
                
                ctx.lineTo(endX, endY);
                
                startX = endX;
                startY = endY;
            }
            
            ctx.stroke();
        }
        
        ctx.restore();
    }
} 