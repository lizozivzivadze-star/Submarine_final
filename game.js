// ==================== DEEP PRESSURE - GAME LOGIC ====================
// Phase 1: Structure and placeholders
// Phase 2: Core game loop (NEXT)

// Game State Object
const game = {
    // Configuration
    difficulty: null,
    currentMission: 1,
    
    // Game Stats
    hull: 100,
    power: 100,
    timeRemaining: 180, // seconds
    problemsSolved: 0,
    
    // Active Problems
    activeProblems: [],
    selectedProblem: null,
    
    // Timers
    gameTimer: null,
    problemSpawnTimer: null,
    
    // Constants will be set based on difficulty
    config: {
        easy: {
            missionTime: 180,
            problemSpawnRate: 15000,
            problemDegradationRate: 30000,
            wrongActionPenalty: { problems: 1, hull: 10 },
            startingHull: 100,
            startingPower: 100,
            maxProblems: 2
        },
        moderate: {
            missionTime: 150,
            problemSpawnRate: 10000,
            problemDegradationRate: 20000,
            wrongActionPenalty: { problems: 1, hull: 10 },
            startingHull: 85,
            startingPower: 75,
            maxProblems: 3
        },
        hard: {
            missionTime: 120,
            problemSpawnRate: 7000,
            problemDegradationRate: 12000,
            wrongActionPenalty: { problems: 2, hull: 15 },
            startingHull: 70,
            startingPower: 50,
            maxProblems: 3
        }
    },
    
    // Problem Types Database
    problemTypes: {
        flooding: {
            name: 'FLOODING',
            icon: '💧',
            description: 'Water breach detected',
            correctAction: 'seal',
            hullDamage: 5,
            powerDamage: 0
        },
        powerFailure: {
            name: 'POWER FAILURE',
            icon: '⚡',
            description: 'Electrical system critical',
            correctAction: 'reroute',
            hullDamage: 0,
            powerDamage: 5
        },
        pressureBreach: {
            name: 'PRESSURE BREACH',
            icon: '🔴',
            description: 'External pressure rising',
            correctAction: 'vent',
            hullDamage: 5,
            powerDamage: 0
        },
        fire: {
            name: 'FIRE',
            icon: '🔥',
            description: 'Fire detected in compartment',
            correctAction: 'emergency',
            hullDamage: 5,
            powerDamage: 5
        },
        systemOverload: {
            name: 'SYSTEM OVERLOAD',
            icon: '⚠️',
            description: 'Systems exceeding capacity',
            correctAction: 'reroute',
            hullDamage: 0,
            powerDamage: 5
        },
        structuralCrack: {
            name: 'STRUCTURAL CRACK',
            icon: '🔧',
            description: 'Hull integrity compromised',
            correctAction: 'seal',
            hullDamage: 5,
            powerDamage: 0
        }
    },
    
    // Mission Data
    missions: [
        {
            number: 1,
            title: 'EMERGENCY DIVE',
            briefing: 'Enemy destroyers have detected our position. Execute emergency dive to 400 meters. Hull integrity compromised during initial descent. Multiple systems showing damage. Maintain stealth protocols while managing critical failures.',
            objective: 'Survive for 3 minutes while keeping hull and power systems operational. Reach safe depth without catastrophic failure.'
        },
        {
            number: 2,
            title: 'CRITICAL SYSTEMS',
            briefing: 'Power grid failing after sustained damage. Crew exhausted from continuous repairs. Multiple cascading failures across all decks. Command has authorized emergency measures to maintain operation.',
            objective: 'Stabilize critical systems for 2.5 minutes. Hull damage carries forward from previous mission. Failure is not an option.'
        },
        {
            number: 3,
            title: 'SURFACE OR DIE',
            briefing: 'All non-essential systems offline. Life support operating on backup reserves. This is our final push to reach friendly waters. Everything is failing at once. Make it count.',
            objective: 'Survive 2 minutes of maximum chaos. Victory requires reaching the surface with any hull and power remaining. This is the end.'
        }
    ],
    
    // ====================
    // SCREEN TRANSITIONS
    // ====================
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    },
    
    showDifficultyScreen() {
        this.showScreen('difficulty-screen');
    },
    
    selectDifficulty(level) {
        this.difficulty = level;
        console.log(`Difficulty selected: ${level}`);
        
        // Load difficulty config
        const config = this.config[level];
        this.hull = config.startingHull;
        this.power = config.startingPower;
        this.timeRemaining = config.missionTime;
        
        // Show first mission briefing
        this.showMissionBriefing(1);
    },
    
    showMissionBriefing(missionNumber) {
        const mission = this.missions[missionNumber - 1];
        
        document.getElementById('mission-number').textContent = `MISSION ${String(missionNumber).padStart(2, '0')}`;
        document.getElementById('mission-title').textContent = mission.title;
        document.getElementById('briefing-content').textContent = mission.briefing;
        document.getElementById('mission-objective').textContent = mission.objective;
        
        this.showScreen('briefing-screen');
    },
    
    startMission() {
        console.log('Mission starting...');
        this.showScreen('control-room');
        
        // Initialize UI
        this.updateStatusDisplay();
        this.clearProblems();
        this.addLogEntry('Mission started. All systems nominal.', 'success');
        
        // Phase 2: Will start game loop here
        console.log('Phase 2: Game loop will be implemented here');
    },
    
    // ====================
    // UI UPDATE FUNCTIONS
    // ====================
    
    updateStatusDisplay() {
        // Update timer
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const timerDisplay = document.getElementById('timer');
        timerDisplay.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
        
        // Add critical class if under 30 seconds
        if (this.timeRemaining <= 30) {
            timerDisplay.classList.add('critical');
        } else {
            timerDisplay.classList.remove('critical');
        }
        
        // Update hull
        const hullStatus = document.getElementById('hull-status');
        hullStatus.textContent = `${Math.max(0, this.hull)}%`;
        
        if (this.hull > 50) {
            hullStatus.className = 'status-value';
        } else if (this.hull > 25) {
            hullStatus.className = 'status-value warning';
        } else {
            hullStatus.className = 'status-value critical';
        }
        
        // Update power
        const powerStatus = document.getElementById('power-status');
        powerStatus.textContent = `${Math.max(0, this.power)}%`;
        
        if (this.power > 50) {
            powerStatus.className = 'status-value';
        } else if (this.power > 25) {
            powerStatus.className = 'status-value warning';
        } else {
            powerStatus.className = 'status-value critical';
        }
    },
    
    clearProblems() {
        for (let i = 1; i <= 3; i++) {
            const slot = document.getElementById(`problem-slot-${i}`);
            slot.className = 'problem-card empty';
            slot.innerHTML = `
                <div class="problem-content">
                    <div class="problem-icon">⚠️</div>
                    <div class="problem-title">AWAITING PROBLEM</div>
                    <div class="problem-description">System monitoring active...</div>
                </div>
            `;
        }
        
        this.activeProblems = [];
        this.disableActionButtons();
    },
    
    disableActionButtons() {
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.disabled = true;
            btn.classList.remove('selected');
        });
    },
    
    enableActionButtons() {
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.disabled = false;
        });
    },
    
    addLogEntry(message, type = 'info') {
        const logContent = document.getElementById('event-log-content');
        const entry = document.createElement('div');
        entry.className = `event-entry ${type}`;
        entry.textContent = message;
        
        logContent.insertBefore(entry, logContent.firstChild);
        
        // Keep only last 5 entries
        while (logContent.children.length > 5) {
            logContent.removeChild(logContent.lastChild);
        }
    },
    
    // ====================
    // PROBLEM MANAGEMENT
    // ====================
    
    selectAction(action) {
        console.log('Action selected:', action);
        // Phase 2: Will implement action handling here
    },
    
    // ====================
    // GAME OVER
    // ====================
    
    showOutcome(victory) {
        const outcomeTitle = document.getElementById('outcome-title');
        const outcomeMessage = document.getElementById('outcome-message');
        
        if (victory) {
            outcomeTitle.textContent = 'MISSION COMPLETE';
            outcomeTitle.className = 'outcome-title victory';
            
            if (this.currentMission < 3) {
                outcomeMessage.textContent = `Mission ${this.currentMission} completed. Prepare for next phase.`;
            } else {
                outcomeMessage.textContent = 'All missions completed. The submarine survives.';
            }
        } else {
            outcomeTitle.textContent = 'MISSION FAILED';
            outcomeTitle.className = 'outcome-title defeat';
            
            if (this.hull <= 0) {
                outcomeMessage.textContent = 'Structural collapse. The submarine has been destroyed.';
            } else if (this.power <= 0) {
                outcomeMessage.textContent = 'Total blackout. All systems offline.';
            } else {
                outcomeMessage.textContent = 'System overload. Too many critical failures.';
            }
        }
        
        // Update stats
        const minutes = Math.floor((this.config[this.difficulty].missionTime - this.timeRemaining) / 60);
        const seconds = (this.config[this.difficulty].missionTime - this.timeRemaining) % 60;
        document.getElementById('stat-time').textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('stat-solved').textContent = this.problemsSolved;
        document.getElementById('stat-hull').textContent = `${Math.max(0, this.hull)}%`;
        document.getElementById('stat-power').textContent = `${Math.max(0, this.power)}%`;
        
        this.showScreen('outcome-screen');
    },
    
    restartGame() {
        location.reload();
    }
};

// Initialize
console.log('DEEP PRESSURE - Phase 1 Complete');
console.log('Game object initialized and ready for Phase 2');
