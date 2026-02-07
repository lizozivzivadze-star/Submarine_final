# 🔊 DEEP PRESSURE - Audio System Guide

## Audio Features Added

Your submarine game now has a **complete audio system** using the Web Audio API (no external files needed!).

---

## 🎵 Sound Effects Implemented

### 1. **ALARM** 🚨
- **When:** New problem spawns
- **Sound:** Sharp double-beep warning
- **Purpose:** Alerts player to new threats

### 2. **SUCCESS** ✅
- **When:** Problem correctly solved
- **Sound:** Ascending pleasant tones (400→600→800 Hz)
- **Purpose:** Positive feedback for correct actions

### 3. **FAILURE** ❌
- **When:** Wrong action selected
- **Sound:** Harsh descending buzzer
- **Purpose:** Negative feedback for mistakes

### 4. **CRITICAL** ⚠️
- **When:** 
  - Problem reaches 66% severity (first warning)
  - Problem reaches 100% severity (auto-fail)
- **Sound:** Triple pulsing alert
- **Purpose:** Warns player of imminent danger

### 5. **CLICK** 🖱️
- **When:** 
  - Selecting a problem
  - Selecting an action
- **Sound:** Subtle beep
- **Purpose:** UI feedback for interactions

### 6. **VICTORY** 🏆
- **When:** Mission complete or all missions won
- **Sound:** Rising fanfare (4 notes)
- **Purpose:** Celebratory ending

### 7. **DEFEAT** 💀
- **When:** Hull/power reaches 0% or system overload
- **Sound:** Descending dramatic tones
- **Purpose:** Game over emphasis

### 8. **COUNTDOWN** ⏱️
- **When:** Last 10 seconds of mission timer
- **Sound:** High-pitched urgent tick
- **Purpose:** Creates final tension

### 9. **AMBIENT** 🌊
- **When:** During active gameplay
- **Sound:** Low submarine engine rumble (55 Hz sawtooth wave)
- **Purpose:** Immersive background atmosphere

---

## 🎛️ Audio Controls

### Toggle Button
- **Location:** Top-right of control room screen
- **Icon:** 🔊 (on) / 🔇 (muted)
- **Function:** Click to toggle all sounds on/off
- **Persistence:** Audio setting persists during session

### Auto-Start
- Audio initializes when first mission starts
- Ambient sound begins automatically
- Respects browser autoplay policies

---

## 🔧 Technical Implementation

### Technology Used
- **Web Audio API** (built into all modern browsers)
- **Zero external files** - all sounds generated programmatically
- **Oscillators** for tone generation
- **Gain nodes** for volume control
- **Filters** for ambient sound shaping

### Sound Generation Method
```javascript
// Example: Success sound
playSound('success') {
  - Creates 3 ascending beeps
  - Frequencies: 400Hz → 600Hz → 800Hz
  - Sine wave type for smooth tone
  - Total duration: ~250ms
}
```

### Browser Compatibility
✅ Chrome, Edge, Firefox, Safari, Opera
✅ Desktop and mobile browsers
⚠️ Requires user interaction to start (browser security)

---

## 📊 Sound Mapping Reference

| Game Event | Sound Type | Frequency | Duration |
|------------|-----------|-----------|----------|
| Problem spawns | Alarm | 800 Hz | 0.3s |
| Correct action | Success | 400-800 Hz | 0.25s |
| Wrong action | Failure | 200-150 Hz | 0.4s |
| Critical state | Critical | 1000 Hz | 0.6s |
| UI click | Click | 300 Hz | 0.1s |
| Mission won | Victory | 523-784 Hz | 0.6s |
| Game over | Defeat | 400-200 Hz | 1.1s |
| Timer tick | Countdown | 1200 Hz | 0.06s |
| Submarine | Ambient | 55 Hz | Continuous |

---

## 🎮 User Experience

### Audio Feedback Loop
1. **Player enters mission** → Ambient rumble starts
2. **Problem appears** → Sharp alarm beep
3. **Problem becomes critical** → Pulsing triple alert
4. **Player selects problem** → Subtle click
5. **Player chooses action** → Subtle click
6. **Correct action** → Cheerful success tone
7. **Wrong action** → Harsh failure buzzer + new alarm
8. **Last 10 seconds** → Urgent countdown ticks
9. **Mission ends** → Victory fanfare OR defeat sound
10. **Ambient stops** → Silence until next mission

### Sound Design Philosophy
- **Minimal but effective** - No audio clutter
- **Functional feedback** - Every sound has purpose
- **Submarine aesthetic** - Low rumbly tones, sharp alarms
- **Non-intrusive** - Can be muted without losing gameplay
- **Accessible** - Works without headphones

---

## 🚀 Future Sound Enhancements (Optional)

If you want to expand the audio system:

### Easy Additions
- **Sonar ping** - Every 5 seconds during gameplay
- **Explosion sound** - When hull reaches 0%
- **Electrical buzz** - When power reaches 0%
- **Voice alerts** - Text-to-speech warnings

### Advanced Additions
- **Dynamic ambient** - Changes based on hull/power levels
- **3D audio** - Positional sound for different compartments
- **Music tracks** - Different themes per mission
- **Compression effects** - When at critical health

---

## 📝 Code Changes Summary

### Files Modified
1. **index.html** - Added audio toggle button
2. **style.css** - Styled audio toggle button
3. **game.js** - Complete audio system (200+ lines)

### New Functions Added
- `initAudio()` - Initialize Web Audio API
- `toggleAudio()` - Mute/unmute control
- `playSound(type)` - Play specific sound effects
- `createBeep()` - Low-level tone generator
- `playAmbient()` - Start submarine rumble
- `stopAmbient()` - Stop background sound

### Integration Points
- Problem spawn → Alarm
- Problem critical → Alert
- Action selection → Click
- Solve problem → Success
- Fail problem → Failure
- Timer countdown → Tick
- Mission start → Ambient
- Mission end → Victory/Defeat

---

## ✅ Testing Checklist

Test these scenarios to verify audio works:

- [ ] Click audio toggle - hear mute/unmute
- [ ] Start mission - hear ambient rumble
- [ ] New problem - hear alarm beep
- [ ] Select problem - hear click
- [ ] Correct action - hear success tone
- [ ] Wrong action - hear failure buzz
- [ ] Problem critical (66%) - hear alert
- [ ] Last 10 seconds - hear countdown ticks
- [ ] Mission complete - hear victory fanfare
- [ ] Game over - hear defeat sound
- [ ] Mute button - all sounds stop
- [ ] Unmute button - sounds resume

---

## 🎯 Why This Audio System is Good

### Advantages
✅ **No downloads** - Everything generated in browser
✅ **Instant loading** - No buffering or file loading
✅ **Tiny footprint** - ~200 lines of code total
✅ **Fully customizable** - Easy to tweak frequencies/durations
✅ **Cross-platform** - Works everywhere Web Audio works
✅ **Retro aesthetic** - Fits submarine control theme perfectly

### Limitations
⚠️ **Simple sounds** - Not realistic recordings
⚠️ **No complex music** - Just tones and beeps
⚠️ **Browser dependent** - Autoplay policies vary

---

## 🎨 Customization Guide

### Change Sound Frequencies
Edit the `playSound()` function in `game.js`:

```javascript
case 'alarm':
    this.createBeep(800, 0.1, 0.3, 'square');
    // Change 800 to 1200 for higher pitch
    // Change 0.3 to 0.5 for louder volume
```

### Adjust Ambient Volume
Edit `playAmbient()`:

```javascript
gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 2);
// Change 0.08 to 0.15 for louder rumble
// Change to 0.03 for quieter background
```

### Add New Sounds
Add a new case to `playSound()`:

```javascript
case 'explosion':
    this.createBeep(100, 0.5, 0.8, 'sawtooth');
    setTimeout(() => this.createBeep(50, 0.8, 0.6, 'sawtooth'), 500);
    break;
```

---

**Your game now has a complete, professional audio system!** 🎉

Everything is self-contained, lightweight, and enhances the submarine survival experience.
