# Time Jump Platformer

A platformer game with a time rewind mechanic built with Node.js, Express, and HTML5 Canvas.

## Features

- Classic platformer mechanics (running, jumping)
- Collect coins to increase your score
- **Time Rewind**: Hold the R key to go back in time
- Rewind energy system that depletes when rewinding and recharges when not in use
- Large scrolling world with camera that follows the player
- Minimap to help with navigation
- **Deadly Traps**: Avoid spike traps that cause instant death
- **Death Animation**: Spectacular particle-based death animation
- **Rise from the Dead**: After death, your only option is to rewind time
- **Jetpack**: Find and collect the jetpack for vertical flight capabilities
- **Fuel System**: Manage limited jetpack fuel and collect fuel canisters

## How to Play

### Controls

- **Arrow Keys or A/D**: Move left/right
- **Up Arrow, W, or Space**: Jump
- **Down Arrow or S**: Activate jetpack (when collected)
- **Hold R key**: Rewind time (especially after death)

### Items

- **Jetpack**: Orange backpack that enables vertical flight
- **Fuel Canisters**: Green containers that refill jetpack fuel
- **Coins**: Gold circles that increase your score
- **Spike Traps**: Red spikes that cause instant death

### Objective

Collect all the coins while navigating the platforms and avoiding deadly traps. Use the jetpack to reach difficult areas, but manage your fuel carefully. If you die, use the rewind feature to go back in time and try again!

## Installation

1. Make sure you have [Node.js](https://nodejs.org/) installed
2. Clone this repository
3. Install dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   node server.js
   ```
5. Open your browser and navigate to `http://localhost:3000`

## How the Time Rewind Works

The game continuously saves the state of all game objects (player position, collected coins, score, etc.) in a history array. When the R key is pressed, the game retrieves previous states from this history and applies them, effectively "rewinding" the gameplay.

The rewind feature has an energy system that depletes while rewinding and recharges when not in use, preventing unlimited rewinding.

## Jetpack Mechanics

The jetpack provides vertical thrust when activated with the Down Arrow or S key. It has a limited fuel supply that depletes while in use. Fuel canisters can be collected to replenish the jetpack's fuel. The fuel gauge is displayed on the screen when you have the jetpack.

## Death and Resurrection

When your character hits a trap or falls off the world, they die in a spectacular particle explosion. At this point, all controls are disabled except for the rewind function. Press and hold R to rewind time and literally rise from the dead, giving you a chance to avoid the fatal mistake.

## Technical Implementation

- **Frontend**: HTML5 Canvas for rendering, JavaScript for game logic
- **Backend**: Node.js with Express for serving the game
- **Real-time Communication**: Socket.io (for potential multiplayer features)
- **Game Loop**: Frame rate controlled game loop for consistent gameplay speed
- **State Management**: Array-based history system for time rewinding
- **Camera System**: Viewport that follows the player through a larger world
- **Parallax Background**: Multi-layered background with parallax scrolling effect
- **Minimap**: Small overview map showing player position in the larger world
- **Death Animation**: Particle system for spectacular death effects
- **Trap System**: Deadly obstacles that trigger death state
- **Jetpack System**: Physics-based vertical thrust with fuel management
- **Item Collection**: Collectible items with different effects

## Recent Changes

- Expanded the game world to be much larger (3000x1000 pixels)
- Added a camera system that follows the player
- Implemented a minimap for easier navigation
- Added parallax scrolling background
- Optimized rendering to only draw objects visible in the camera view
- Changed rewind control from button to R key
- Added frame rate control for consistent game speed
- Improved visual feedback during rewind
- **NEW**: Added deadly spike traps throughout the world
- **NEW**: Implemented death animation with particle effects
- **NEW**: Added "rise from the dead" mechanic where rewind is the only option after death
- **NEW**: Increased gravity and movement speed for more challenging gameplay
- **NEW**: Added jetpack with limited fuel for vertical flight
- **NEW**: Added fuel canisters to refill jetpack fuel
- **NEW**: Redesigned controls to make arrow keys dedicated to movement

## Future Enhancements

- Multiple levels
- Enemies and obstacles
- Power-ups
- Multiplayer support
- More advanced time manipulation mechanics 