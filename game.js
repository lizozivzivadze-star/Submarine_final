// ==================== DEEP PRESSURE - GAME LOGIC ====================
// Phase 4: AUDIO INTEGRATION (SFX ONLY - NO BGM)

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
    isMuted: false,

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
    // AUDIO CONTROL METHODS
    // ====================
    
    playSound(id, volume = 0.5) {
        if (this.isMuted) return;
        const sound = document.getElementById(id);
        if (sound) {
            sound.volume = volume;
            sound.currentTime = 0;
            sound.play().catch(e => console.log("Audio play blocked"));
        }
    },

    toggleAudio() {
        this.isMuted = !this.isMuted;
        const btn = document.getElementById('mute-btn');
        if (btn) btn.textContent = this.isMuted ? '🔇' : '🔊';
        
        const alarm = document.getElementById('snd-alarm');
        
        if (this.isMuted) {
            if (alarm) alarm.pause();
        }
    },

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
        
        const config = this.config[level];
        this.hull = config.startingHull;
        this.power = config.startingPower;
        this.timeRemaining = config.missionTime;
        
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
        this.showScreen('control-room');
        
        this.problemsSolved = 0;
        this.activeProblems = [];
        this.selectedProblem = null;
        this.selectedAction = null;
        this.isRunning = true;
        
        const config = this.config[this.difficulty];
        if (this.currentMission === 1) {
            this.timeRemaining = config.missionTime;
        } else if (this.currentMission === 2) {
            this.timeRemaining = Math.floor(config.missionTime * 0.85);
        } else if (this.currentMission === 3) {
            this.timeRemaining = Math.floor(config.missionTime * 0.7);
        }
        
        this.updateStatusDisplay();
        this.clearProblems();
        this.addLogEntry('Mission started. All systems nominal.', 'success');
        
        if (this.currentMission === 1) {
            this.showTutorial();
        } else {
            this.startGameLoop();
            setTimeout(() => { if (this.isRunning) this.spawnProblem(); }, 5000);
        }
        this.addHelpButton();
    },
    
    // ====================
    // TUTORIAL SYSTEM
    // ====================
    
    showTutorial() {
        document.getElementById('tutorial-overlay').classList.remove('hidden');
    },
    
    closeTutorial() {
        document.getElementById('tutorial-overlay').classList.add('hidden');
        this.startGameLoop();
        setTimeout(() => { if (this.isRunning) this.spawnProblem(); }, 5000);
    },
    
    addHelpButton() {
        if (document.getElementById('help-btn')) return;
        const controlRoom = document.getElementById('control-room');
        const helpBtn = document.createElement('button');
        helpBtn.id = 'help-btn';
        helpBtn.className = 'help-button';
        helpBtn.textContent = '?';
        helpBtn.onclick = () => {
            this.isRunning = false;
            this.showTutorial();
        };
        controlRoom.appendChild(helpBtn);
    },
    
    // ====================
    // CORE GAME LOOP
    // ====================
    
    startGameLoop() {
        this.gameTimer = setInterval(() => {
            if (!this.isRunning) return;
            this.timeRemaining--;
            this.updateStatusDisplay();
            this.updateGame(); 
            
            if (this.timeRemaining <= 0) this.checkVictory();
            if (this.hull <= 0 || this.power <= 0) this.endGame(false);
        }, 1000);
        
        const spawnRate = this.config[this.difficulty].problemSpawnRate;
        this.problemSpawnTimer = setInterval(() => {
            if (!this.isRunning) return;
            const maxProblems = this.config[this.difficulty].maxProblems;
            if (this.activeProblems.length < maxProblems) this.spawnProblem();
        }, spawnRate);
        
        this.degradationTimer = setInterval(() => {
            if (!this.isRunning) return;
            this.degradeProblems();
        }, 1000);
    },

    updateGame() {
        const hasCritical = this.activeProblems.some(p => p && p.severity > 70);
        const alarm = document.getElementById('snd-alarm');
        
        if (alarm) {
            if (hasCritical && !this.isMuted && this.isRunning) {
                if (alarm.paused) {
                    alarm.volume = 0.4;
                    alarm.play().catch(e => {});
                }
            } else {
                alarm.pause();
            }
        }
    },
    
    stopGameLoop() {
        this.isRunning = false;
        if (this.gameTimer) clearInterval(this.gameTimer);
        if (this.problemSpawnTimer) clearInterval(this.problemSpawnTimer);
        if (this.degradationTimer) clearInterval(this.degradationTimer);
        
        const alarm = document.getElementById('snd-alarm');
        if (alarm) alarm.pause();
    },
    
    // ====================
    // PROBLEM MANAGEMENT
    // ====================
    
    spawnProblem() {
        const maxProblems = this.config[this.difficulty].maxProblems;
        if (this.activeProblems.length >= maxProblems) return;
        
        const problemKeys = Object.keys(this.problemTypes);
        const randomKey = problemKeys[Math.floor(Math.random() * problemKeys.length)];
        const problemType = this.problemTypes[randomKey];
        const location = problemType.location[Math.floor(Math.random() * problemType.location.length)];
        
        const problem = {
            id: Date.now(),
            type: randomKey,
            name: problemType.name,
            icon: problemType.icon,
            description: `${problemType.description} - ${location}`,
            correctAction: problemType.correctAction,
            hullDamage: problemType.hullDamage,
            powerDamage: problemType.powerDamage,
            severity: 0,
            degradationRate: 100 / (this.config[this.difficulty].problemDegradationRate / 1000)
        };
        
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
        this.playSound('snd-fail', 0.2); 
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
            problem.severity += problem.degradationRate;
            if (problem.severity > 100) problem.severity = 100;
            
            const slot = document.getElementById(`problem-slot-${index + 1}`);
            const severityFill = slot.querySelector('.severity-fill');
            if (severityFill) severityFill.style.width = `${problem.severity}%`;
            
            if (problem.severity >= 100) {
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
        
        for (let i = 0; i < 3; i++) {
            const slot = document.getElementById(`problem-slot-${i + 1}`);
            if (i === problemIndex && this.activeProblems[i]) {
                if (!slot.className.includes('critical')) {
                    slot.style.boxShadow = '0 0 30px var(--accent-cyan)';
                }
            } else if (this.activeProblems[i]) {
                slot.style.boxShadow = '';
            }
        }
        
        this.enableActionButtons();
        this.addLogEntry(`Problem selected: ${problem.name}`, 'warning');
    },
    
    selectAction(action) {
        if (this.selectedProblem === null) {
            this.addLogEntry('Select a problem first!', 'warning');
            return;
        }
        this.selectedAction = action;
        document.querySelectorAll('.action-btn').forEach(btn => btn.classList.remove('selected'));
        const btn = document.querySelector(`[data-action="${action}"]`);
        if (btn) btn.classList.add('selected');
        this.executeAction();
    },
    
    executeAction() {
        const problemIndex = this.selectedProblem;
        const problem = this.activeProblems[problemIndex];
        const action = this.selectedAction;
        if (!problem || !action) return;
        
        const isCorrect = (action === problem.correctAction);
        if (isCorrect) {
            this.playSound('snd-success', 0.4);
            this.solveProblem(problemIndex);
        } else {
            this.playSound('snd-fail', 0.5);
            this.failProblem(problemIndex);
        }
        
        this.selectedProblem = null;
        this.selectedAction = null;
        this.disableActionButtons();
        for (let i = 0; i < 3; i++) {
            const slot = document.getElementById(`problem-slot-${i + 1}`);
            slot.style.boxShadow = '';
        }
    },
    
    solveProblem(problemIndex) {
        const problem = this.activeProblems[problemIndex];
        this.activeProblems[problemIndex] = null;
        this.problemsSolved++;
        
        const hullBefore = this.hull;
        const powerBefore = this.power;
        this.hull = Math.min(100, this.hull + 10);
        this.power = Math.min(100, this.power + 10);
        
        if (this.hull > hullBefore) {
            const el = document.getElementById('hull-status');
            el.classList.add('heal-flash');
            setTimeout(() => el.classList.remove('heal-flash'), 500);
        }
        if (this.power > powerBefore) {
            const el = document.getElementById('power-status');
            el.classList.add('heal-flash');
            setTimeout(() => el.classList.remove('heal-flash'), 500);
        }
        
        const slot = document.getElementById(`problem-slot-${problemIndex + 1}`);
        slot.className = 'problem-card just-solved';
        slot.innerHTML = `
            <div class="problem-content">
                <div class="problem-icon">✓</div>
                <div class="problem-title">RESOLVED</div>
                <div class="problem-description">System stabilized</div>
            </div>
        `;
        
        this.addLogEntry(`${problem.name} resolved successfully! +10% systems`, 'success');
        this.updateStatusDisplay();
        
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
        this.hull -= problem.hullDamage + config.wrongActionPenalty.hull;
        this.power -= problem.powerDamage + config.wrongActionPenalty.hull;
        
        const hS = document.getElementById('hull-status');
        const pS = document.getElementById('power-status');
        hS.classList.add('damage-flash');
        pS.classList.add('damage-flash');
        setTimeout(() => {
            hS.classList.remove('damage-flash');
            pS.classList.remove('damage-flash');
        }, 500);
        
        this.addLogEntry(`${problem.name} worsened! -${config.wrongActionPenalty.hull}% hull/power`, 'danger');
        for (let i = 0; i < config.wrongActionPenalty.problems; i++) {
            setTimeout(() => { if (this.isRunning) this.spawnProblem(); }, i * 500);
        }
        
        this.activeProblems[problemIndex] = null;
        const slot = document.getElementById(`problem-slot-${problemIndex + 1}`);
        slot.classList.add('just-failed');
        setTimeout(() => {
            slot.className = 'problem-card empty';
            slot.innerHTML = `
                <div class="problem-content">
                    <div class="problem-icon">⚠️</div>
                    <div class="problem-title">AWAITING PROBLEM</div>
                    <div class="problem-description">System monitoring active...</div>
                </div>
            `;
        }, 500);
        this.updateStatusDisplay();
        if (this.hull <= 0 || this.power <= 0) this.endGame(false);
    },
    
    updateStatusDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const timerDisplay = document.getElementById('timer');
        timerDisplay.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
        if (this.timeRemaining <= 30) timerDisplay.classList.add('critical');
        else timerDisplay.classList.remove('critical');
        
        const hS = document.getElementById('hull-status');
        hS.textContent = `${Math.max(0, Math.round(this.hull))}%`;
        hS.className = this.hull > 50 ? 'status-value' : (this.hull > 25 ? 'status-value warning' : 'status-value critical');
        
        const pS = document.getElementById('power-status');
        pS.textContent = `${Math.max(0, Math.round(this.power))}%`;
        pS.className = this.power > 50 ? 'status-value' : (this.power > 25 ? 'status-value warning' : 'status-value critical');
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
        document.querySelectorAll('.action-btn').forEach(btn => btn.disabled = false);
    },
    
    addLogEntry(message, type = 'info') {
        const logContent = document.getElementById('event-log-content');
        const entry = document.createElement('div');
        entry.className = `event-entry ${type}`;
        entry.textContent = message;
        logContent.insertBefore(entry, logContent.firstChild);
        while (logContent.children.length > 5) logContent.removeChild(logContent.lastChild);
    },
    
    checkVictory() {
        if (this.hull > 0 && this.power > 0) this.endGame(true);
    },
    
    endGame(victory) {
        this.stopGameLoop();
        if (victory) {
            if (this.currentMission < 3) this.showMissionComplete();
            else this.showOutcome(true);
        } else {
            this.showOutcome(false);
        }
    },
    
    showMissionComplete() {
        this.playSound('snd-success', 0.6);
        this.addLogEntry('Mission complete!', 'success');
        const pI = document.getElementById('progress-indicator');
        pI.querySelector('.progress-text').textContent = `MISSION ${this.currentMission} COMPLETE`;
        pI.querySelector('.progress-subtext').textContent = `Preparing for Mission ${this.currentMission + 1}...`;
        pI.classList.remove('hidden');
        
        setTimeout(() => {
            pI.classList.add('hidden');
            this.currentMission++;
            this.showMissionBriefing(this.currentMission);
        }, 3000);
    },
    
    showOutcome(victory) {
        const oT = document.getElementById('outcome-title');
        const oM = document.getElementById('outcome-message');
        if (victory) {
            this.playSound('snd-success', 0.7);
            oT.textContent = 'MISSION COMPLETE';
            oT.className = 'outcome-title victory';
            oM.textContent = 'All missions completed. The submarine survives.';
        } else {
            this.playSound('snd-fail', 0.7);
            oT.textContent = 'MISSION FAILED';
            oT.className = 'outcome-title defeat';
            oM.textContent = 'Submarine destroyed.';
        }
        
        const totalT = this.config[this.difficulty].missionTime;
        const survived = totalT - this.timeRemaining;
        document.getElementById('stat-time').textContent = `${Math.floor(survived / 60)}:${String(survived % 60).padStart(2, '0')}`;
        document.getElementById('stat-solved').textContent = this.problemsSolved;
        document.getElementById('stat-hull').textContent = `${Math.max(0, Math.round(this.hull))}%`;
        document.getElementById('stat-power').textContent = `${Math.max(0, Math.round(this.power))}%`;
        this.showScreen('outcome-screen');
    },
    
    restartGame() {
        location.reload();
    }
};

// ==================== THE PRO TIP ====================
// This automatically finds every button and adds the click sound to it
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        game.playSound('snd-click', 0.5);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (!game.isRunning) return;
    if (e.key === '1') game.selectProblem(0);
    if (e.key === '2') game.selectProblem(1);
    if (e.key === '3') game.selectProblem(2);
    if (game.selectedProblem !== null) {
        if (e.key.toLowerCase() === 's') game.selectAction('seal');
        if (e.key.toLowerCase() === 'r') game.selectAction('reroute');
        if (e.key.toLowerCase() === 'v') game.selectAction('vent');
        if (e.key.toLowerCase() === 'e') game.selectAction('emergency');
    }
    if (e.key === '?' || e.key.toLowerCase() === 'h') {
        const btn = document.getElementById('help-btn');
        if (btn) btn.click();
    }
});
