// ==================== DEEP PRESSURE - GAME LOGIC ====================
// Phase 2: COMPLETE GAME LOOP IMPLEMENTATION

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
    selectedAction: null,
    
    // Timers
    gameTimer: null,
    problemSpawnTimer: null,
    degradationTimer: null,
    
    // Game State
    isRunning: false,
    
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
            description: 'Water breach in compartment',
            correctAction: 'seal',
            hullDamage: 5,
            powerDamage: 0,
            location: ['Engine Room', 'Torpedo Bay', 'Battery Room', 'Stern Section']
        },
        powerFailure: {
            name: 'POWER FAILURE',
            icon: '⚡',
            description: 'Electrical system critical',
            correctAction: 'reroute',
            hullDamage: 0,
            powerDamage: 5,
            location: ['Main Grid', 'Backup Generator', 'Control Room', 'Navigation']
        },
        pressureBreach: {
            name: 'PRESSURE BREACH',
            icon: '🔴',
            description: 'External pressure rising',
            correctAction: 'vent',
            hullDamage: 5,
            powerDamage: 0,
            location: ['Forward Hull', 'Aft Section', 'Ballast Tank', 'Outer Hull']
        },
        fire: {
            name: 'FIRE',
            icon: '🔥',
            description: 'Fire detected in compartment',
            correctAction: 'emergency',
            hullDamage: 5,
            powerDamage: 5,
            location: ['Galley', 'Engine Room', 'Electronics Bay', 'Crew Quarters']
        },
        systemOverload: {
            name: 'SYSTEM OVERLOAD',
            icon: '⚠️',
            description: 'Systems exceeding capacity',
            correctAction: 'reroute',
            hullDamage: 0,
            powerDamage: 5,
            location: ['Main Computer', 'Sonar Array', 'Life Support', 'Communications']
        },
        structuralCrack: {
            name: 'STRUCTURAL CRACK',
            icon: '🔧',
            description: 'Hull integrity compromised',
            correctAction: 'seal',
            hullDamage: 5,
            powerDamage: 0,
            location: ['Port Side', 'Starboard Side', 'Keel', 'Conning Tower']
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
        this.currentMission = missionNumber;
        
        document.getElementById('mission-number').textContent = `MISSION ${String(missionNumber).padStart(2, '0')}`;
        document.getElementById('mission-title').textContent = mission.title;
        document.getElementById('briefing-content').textContent = mission.briefing;
        document.getElementById('mission-objective').textContent = mission.objective;
        
        this.showScreen('briefing-screen');
    },
    
    startMission() {
        console.log('Mission starting...');
        this.showScreen('control-room');
        
        // Reset for this mission
        this.problemsSolved = 0;
        this.activeProblems = [];
        this.selectedProblem = null;
        this.selectedAction = null;
        this.isRunning = true;
        
        // Set time based on current mission and difficulty
        const config = this.config[this.difficulty];
        if (this.currentMission === 1) {
            this.timeRemaining = config.missionTime;
        } else if (this.currentMission === 2) {
            this.timeRemaining = Math.floor(config.missionTime * 0.85); // 15% less time
        } else if (this.currentMission === 3) {
            this.timeRemaining = Math.floor(config.missionTime * 0.7); // 30% less time
        }
        
        // Initialize UI
        this.updateStatusDisplay();
        this.clearProblems();
        this.addLogEntry('Mission started. All systems nominal.', 'success');
        
        // Start game loop
        this.startGameLoop();
        
        // Spawn first problem after 5 seconds
        setTimeout(() => {
            if (this.isRunning) {
                this.spawnProblem();
            }
        }, 5000);
    },
    
    // ====================
    // CORE GAME LOOP
    // ====================
    
    startGameLoop() {
        // Main timer - counts down every second
        this.gameTimer = setInterval(() => {
            if (!this.isRunning) return;
            
            this.timeRemaining--;
            this.updateStatusDisplay();
            
            // Check for victory
            if (this.timeRemaining <= 0) {
                this.checkVictory();
            }
            
            // Check for defeat
            if (this.hull <= 0 || this.power <= 0) {
                this.endGame(false);
            }
        }, 1000);
        
        // Problem spawner - creates new problems periodically
        const spawnRate = this.config[this.difficulty].problemSpawnRate;
        this.problemSpawnTimer = setInterval(() => {
            if (!this.isRunning) return;
            
            const maxProblems = this.config[this.difficulty].maxProblems;
            if (this.activeProblems.length < maxProblems) {
                this.spawnProblem();
            }
        }, spawnRate);
        
        // Degradation timer - makes problems worse over time
        this.degradationTimer = setInterval(() => {
            if (!this.isRunning) return;
            this.degradeProblems();
        }, 1000);
    },
    
    stopGameLoop() {
        this.isRunning = false;
        
        if (this.gameTimer) clearInterval(this.gameTimer);
        if (this.problemSpawnTimer) clearInterval(this.problemSpawnTimer);
        if (this.degradationTimer) clearInterval(this.degradationTimer);
    },
    
    // ====================
    // PROBLEM MANAGEMENT
    // ====================
    
    spawnProblem() {
        const maxProblems = this.config[this.difficulty].maxProblems;
        if (this.activeProblems.length >= maxProblems) return;
        
        // Get random problem type
        const problemKeys = Object.keys(this.problemTypes);
        const randomKey = problemKeys[Math.floor(Math.random() * problemKeys.length)];
        const problemType = this.problemTypes[randomKey];
        
        // Get random location
        const location = problemType.location[Math.floor(Math.random() * problemType.location.length)];
        
        // Create problem object
        const problem = {
            id: Date.now(),
            type: randomKey,
            name: problemType.name,
            icon: problemType.icon,
            description: `${problemType.description} - ${location}`,
            correctAction: problemType.correctAction,
            hullDamage: problemType.hullDamage,
            powerDamage: problemType.powerDamage,
            severity: 0, // 0-100
            degradationRate: 100 / (this.config[this.difficulty].problemDegradationRate / 1000) // % per second
        };
        
        // Find empty slot
        let slotIndex = -1;
        for (let i = 0; i < maxProblems; i++) {
            if (!this.activeProblems[i]) {
                slotIndex = i;
                break;
            }
        }
        
        if (slotIndex === -1) return;
        
        this.activeProblems[slotIndex] = problem;
        this.renderProblem(problem, slotIndex + 1);
        this.addLogEntry(`New problem: ${problem.name} - ${location}`, 'danger');
    },
    
    renderProblem(problem, slotNumber) {
        const slot = document.getElementById(`problem-slot-${slotNumber}`);
        
        slot.className = 'problem-card active';
        slot.innerHTML = `
            <div class="problem-content">
                <div class="problem-icon">${problem.icon}</div>
                <div class="problem-title">${problem.name}</div>
                <div class="problem-description">${problem.description}</div>
                <div class="problem-severity">
                    <div class="severity-fill" style="width: ${problem.severity}%"></div>
                </div>
                <button class="btn-fix" onclick="game.selectProblem(${slotNumber - 1})">FIX IT</button>
            </div>
        `;
    },
    
    degradeProblems() {
        this.activeProblems.forEach((problem, index) => {
            if (!problem) return;
            
            // Increase severity
            problem.severity += problem.degradationRate;
            
            // Cap at 100%
            if (problem.severity > 100) {
                problem.severity = 100;
            }
            
            // Update visual
            const slot = document.getElementById(`problem-slot-${index + 1}`);
            const severityFill = slot.querySelector('.severity-fill');
            if (severityFill) {
                severityFill.style.width = `${problem.severity}%`;
            }
            
            // Apply damage based on severity
            if (problem.severity >= 100) {
                // Problem reached critical - auto-fail it
                this.addLogEntry(`${problem.name} reached critical state!`, 'danger');
                this.failProblem(index);
            } else if (problem.severity >= 66) {
                slot.className = 'problem-card critical';
            } else if (problem.severity >= 33) {
                slot.className = 'problem-card active';
            }
        });
    },
    
    selectProblem(problemIndex) {
        const problem = this.activeProblems[problemIndex];
        if (!problem) return;
        
        this.selectedProblem = problemIndex;
        this.selectedAction = null;
        
        // Highlight the selected problem
        for (let i = 0; i < 3; i++) {
            const slot = document.getElementById(`problem-slot-${i + 1}`);
            if (i === problemIndex && this.activeProblems[i]) {
                // Keep existing class and add highlight
                if (!slot.className.includes('critical')) {
                    slot.style.boxShadow = '0 0 30px var(--accent-cyan)';
                }
            } else if (this.activeProblems[i]) {
                slot.style.boxShadow = '';
            }
        }
        
        // Enable action buttons
        this.enableActionButtons();
        this.addLogEntry(`Problem selected: ${problem.name}`, 'warning');
    },
    
    selectAction(action) {
        if (this.selectedProblem === null) {
            this.addLogEntry('Select a problem first!', 'warning');
            return;
        }
        
        this.selectedAction = action;
        
        // Highlight selected action
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`[data-action="${action}"]`).classList.add('selected');
        
        // Execute action immediately
        this.executeAction();
    },
    
    executeAction() {
        const problemIndex = this.selectedProblem;
        const problem = this.activeProblems[problemIndex];
        const action = this.selectedAction;
        
        if (!problem || !action) return;
        
        // Check if action is correct
        if (action === problem.correctAction) {
            // SUCCESS
            this.solveProblem(problemIndex);
        } else {
            // FAILURE
            this.failProblem(problemIndex);
        }
        
        // Reset selection
        this.selectedProblem = null;
        this.selectedAction = null;
        this.disableActionButtons();
        
        // Remove highlight
        for (let i = 0; i < 3; i++) {
            const slot = document.getElementById(`problem-slot-${i + 1}`);
            slot.style.boxShadow = '';
        }
    },
    
    solveProblem(problemIndex) {
        const problem = this.activeProblems[problemIndex];
        
        // Remove problem
        this.activeProblems[problemIndex] = null;
        this.problemsSolved++;
        
        // Restore some integrity
        this.hull = Math.min(100, this.hull + 10);
        this.power = Math.min(100, this.power + 10);
        
        // Clear slot
        const slot = document.getElementById(`problem-slot-${problemIndex + 1}`);
        slot.className = 'problem-card empty';
        slot.innerHTML = `
            <div class="problem-content">
                <div class="problem-icon">✓</div>
                <div class="problem-title">RESOLVED</div>
                <div class="problem-description">System stabilized</div>
            </div>
        `;
        
        // Log success
        this.addLogEntry(`${problem.name} resolved successfully! +10% systems`, 'success');
        this.updateStatusDisplay();
        
        // Return to empty state after 2 seconds
        setTimeout(() => {
            if (!this.activeProblems[problemIndex]) {
                slot.className = 'problem-card empty';
                slot.innerHTML = `
                    <div class="problem-content">
                        <div class="problem-icon">⚠️</div>
                        <div class="problem-title">AWAITING PROBLEM</div>
                        <div class="problem-description">System monitoring active...</div>
                    </div>
                `;
            }
        }, 2000);
    },
    
    failProblem(problemIndex) {
        const problem = this.activeProblems[problemIndex];
        const config = this.config[this.difficulty];
        
        // Apply damage
        this.hull -= problem.hullDamage + config.wrongActionPenalty.hull;
        this.power -= problem.powerDamage + config.wrongActionPenalty.hull;
        
        // Log failure
        this.addLogEntry(`${problem.name} worsened! -${config.wrongActionPenalty.hull}% hull/power`, 'danger');
        
        // Spawn additional problems as penalty
        for (let i = 0; i < config.wrongActionPenalty.problems; i++) {
            setTimeout(() => {
                if (this.isRunning) {
                    this.spawnProblem();
                }
            }, i * 500);
        }
        
        // Remove the failed problem
        this.activeProblems[problemIndex] = null;
        
        const slot = document.getElementById(`problem-slot-${problemIndex + 1}`);
        slot.className = 'problem-card empty';
        slot.innerHTML = `
            <div class="problem-content">
                <div class="problem-icon">⚠️</div>
                <div class="problem-title">AWAITING PROBLEM</div>
                <div class="problem-description">System monitoring active...</div>
            </div>
        `;
        
        this.updateStatusDisplay();
        
        // Check for defeat
        if (this.hull <= 0 || this.power <= 0) {
            this.endGame(false);
        }
        
        // Check for too many active problems
        const activeCount = this.activeProblems.filter(p => p !== null).length;
        if (activeCount >= 4) {
            this.endGame(false);
        }
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
        hullStatus.textContent = `${Math.max(0, Math.round(this.hull))}%`;
        
        if (this.hull > 50) {
            hullStatus.className = 'status-value';
        } else if (this.hull > 25) {
            hullStatus.className = 'status-value warning';
        } else {
            hullStatus.className = 'status-value critical';
        }
        
        // Update power
        const powerStatus = document.getElementById('power-status');
        powerStatus.textContent = `${Math.max(0, Math.round(this.power))}%`;
        
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
    // GAME END CONDITIONS
    // ====================
    
    checkVictory() {
        if (this.hull > 0 && this.power > 0) {
            this.endGame(true);
        }
    },
    
    endGame(victory) {
        this.stopGameLoop();
        
        if (victory) {
            // Mission complete
            if (this.currentMission < 3) {
                // More missions to go
                this.showMissionComplete();
            } else {
                // All missions complete - final victory
                this.showOutcome(true);
            }
        } else {
            // Mission failed
            this.showOutcome(false);
        }
    },
    
    showMissionComplete() {
        this.addLogEntry('Mission complete!', 'success');
        
        // Wait 2 seconds, then show next mission briefing
        setTimeout(() => {
            this.currentMission++;
            this.showMissionBriefing(this.currentMission);
        }, 2000);
    },
    
    showOutcome(victory) {
        const outcomeTitle = document.getElementById('outcome-title');
        const outcomeMessage = document.getElementById('outcome-message');
        
        if (victory) {
            outcomeTitle.textContent = 'MISSION COMPLETE';
            outcomeTitle.className = 'outcome-title victory';
            outcomeMessage.textContent = 'All missions completed. The submarine survives. Outstanding work, Captain.';
        } else {
            outcomeTitle.textContent = 'MISSION FAILED';
            outcomeTitle.className = 'outcome-title defeat';
            
            if (this.hull <= 0) {
                outcomeMessage.textContent = 'Structural collapse. The submarine has been destroyed.';
            } else if (this.power <= 0) {
                outcomeMessage.textContent = 'Total blackout. All systems offline. The submarine is dead in the water.';
            } else {
                outcomeMessage.textContent = 'System overload. Too many critical failures. The crew has abandoned ship.';
            }
        }
        
        // Update stats
        const totalTime = this.config[this.difficulty].missionTime;
        const timeSurvived = totalTime - this.timeRemaining;
        const minutes = Math.floor(timeSurvived / 60);
        const seconds = timeSurvived % 60;
        
        document.getElementById('stat-time').textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('stat-solved').textContent = this.problemsSolved;
        document.getElementById('stat-hull').textContent = `${Math.max(0, Math.round(this.hull))}%`;
        document.getElementById('stat-power').textContent = `${Math.max(0, Math.round(this.power))}%`;
        
        this.showScreen('outcome-screen');
    },
    
    restartGame() {
        location.reload();
    }
};

// Initialize
console.log('DEEP PRESSURE - Phase 2 Complete');
console.log('Full game loop active');
