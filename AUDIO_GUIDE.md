# 🔍 Audio Testing Guide

## How to Test Your Game Audio

### ⚠️ IMPORTANT: Browser Audio Policy
Modern browsers require a **user interaction** before any audio can play. This means:
- The first click initializes the audio system
- Sounds will work after the first button press

---

## 📋 Complete Audio Test Checklist

### **Test 1: Menu Button Sounds**

1. **Open the game** (index.html in browser)
2. **Click "START MISSION"** 
   - ✅ Should hear: Click sound
   - 🔧 If no sound: This is normal - browser needs interaction to init audio
   
3. **Click "EASY" (or any difficulty)**
   - ✅ Should hear: Click sound
   - 📝 Note: Audio initializes here on first click

4. **Click "BEGIN MISSION"**
   - ✅ Should hear: Click sound

5. **Click tutorial close button** (if tutorial appears)
   - ✅ Should hear: Click sound

---

### **Test 2: Gameplay Sounds**

6. **Wait for first problem to appear** (~5 seconds)
   - ✅ Should hear: Alarm beep (double beep)

7. **Click "FIX IT" on a problem card**
   - ✅ Should hear: Click sound

8. **Click any action button** (SEAL, REROUTE, etc.)
   - ✅ Should hear: Click sound

9. **If you chose CORRECT action:**
   - ✅ Should hear: Success tone (ascending pleasant beeps)
   - 📊 Hull/Power should increase

10. **If you chose WRONG action:**
    - ✅ Should hear: Failure buzz (harsh descending tone)
    - 🚨 Should hear: Alarm beep (new problem spawning)

11. **Let a problem reach critical (red border)**
    - ✅ Should hear: Critical alert (triple pulse) when it first turns red
    - ✅ Should hear: Critical alert again if it reaches 100%

12. **Last 10 seconds of timer**
    - ✅ Should hear: Countdown tick every second

---

### **Test 3: Mission End Sounds**

13. **Complete a mission successfully**
    - ✅ Should hear: Victory fanfare (4 ascending notes)

14. **Lose a mission** (let hull or power reach 0%)
    - ✅ Should hear: Defeat sound (3 descending tones)

15. **Click "RESTART MISSION"**
    - ✅ Should hear: Click sound
    - ⏳ Page reloads after 100ms

---

### **Test 4: Audio Toggle**

16. **Click the 🔊 button** (top-right of control room)
    - ✅ Should hear: Click sound
    - 🔇 Icon changes to muted
    - 🔕 All subsequent sounds should be silent

17. **Click the 🔇 button** to unmute
    - ✅ Should hear: Click sound
    - 🔊 Icon changes back
    - 🔔 Sounds should work again

18. **Test muted state:**
    - Let problem spawn → No alarm
    - Solve problem → No success sound
    - Sounds are disabled but game works normally

---

## 🎵 Expected Sound Behavior

### Sound Descriptions:

| Sound | What It Sounds Like |
|-------|---------------------|
| **Click** | Quick subtle beep (300 Hz, very short) |
| **Alarm** | Sharp double-beep warning (800 Hz, attention-grabbing) |
| **Success** | Three ascending tones (400→600→800 Hz, pleasant) |
| **Failure** | Two descending harsh buzzes (200→150 Hz, unpleasant) |
| **Critical** | Three quick pulses (1000 Hz, urgent) |
| **Countdown** | Single high tick (1200 Hz, brief) |
| **Victory** | Four note fanfare (rising melody) |
| **Defeat** | Three descending dramatic tones (falling, ominous) |

---

## 🐛 Troubleshooting

### "I don't hear ANY sounds at all"

**Solution 1:** Make sure you're not in "muted" state
- Check if icon shows 🔇 instead of 🔊
- Click the audio toggle button

**Solution 2:** Check browser console (F12)
- Look for errors mentioning "AudioContext"
- Your browser might not support Web Audio API (very rare)

**Solution 3:** Volume settings
- Check system volume is not muted
- Check browser tab is not muted (right-click tab)

**Solution 4:** Browser audio policy
- Some browsers block audio until user interaction
- Try clicking around more before expecting sounds

---

### "I only hear SOME sounds"

**This is expected!** Sounds only play when events happen:
- Alarm → Only when new problem spawns
- Success → Only when correct action
- Failure → Only when wrong action
- Critical → Only when problem becomes critical (66% or 100%)
- Countdown → Only in last 10 seconds
- Victory/Defeat → Only when mission ends

---

### "Menu buttons don't make sounds on first click"

**This is normal!** 
- First click initializes audio (browser security)
- Second click onwards should have sound
- Try clicking "START MISSION" twice in a row

---

### "Sounds are too quiet/loud"

**Edit volumes in game.js:**

Find the `playSound()` function and adjust the volume parameter (3rd number):

```javascript
case 'click':
    this.createBeep(300, 0.02, 0.1, 'sine');
    //                              ^^^
    //                              Change this (0.1 = 10% volume)
```

Recommended ranges:
- Click: 0.05 - 0.2
- Alarm: 0.2 - 0.4
- Success: 0.2 - 0.4
- All others: 0.3 - 0.6

---

## ✅ Quick Verification

**Fastest way to test all sounds:**

1. Open game
2. Click START → Click EASY → Click BEGIN → Close tutorial
3. Let problem appear (alarm)
4. Click problem (click)
5. Click wrong action (click + failure + new alarm)
6. Click problem again (click)
7. Click correct action (click + success)
8. Wait for timer to hit 10 seconds (countdown ticks)
9. Let timer reach 0:00 (victory or defeat)

**Total time:** ~3 minutes to test everything

---

## 📊 Sound Event Frequency

During a typical 3-minute mission, you'll hear approximately:

- 🖱️ **Click:** 15-30 times (every button press)
- 🚨 **Alarm:** 10-15 times (problems spawning)
- ✅ **Success:** 5-10 times (correct actions)
- ❌ **Failure:** 3-7 times (mistakes)
- ⚠️ **Critical:** 2-5 times (problems degrading)
- ⏱️ **Countdown:** 10 times (last 10 seconds)
- 🏆 **Victory/Defeat:** 1 time (mission end)

---

## 🎯 What Should NOT Have Sound

These events are **intentionally silent:**

- ❌ Screen transitions
- ❌ Status bar updates (hull/power numbers changing)
- ❌ Event log messages appearing
- ❌ Timer counting down (except last 10 seconds)
- ❌ Problem severity bar filling
- ❌ Tutorial opening/appearing
- ❌ Mission briefing screen

---

## 🎮 Final Note

**Audio should enhance, not distract!**

If you find sounds annoying during development/testing:
1. Click the 🔊 button to mute
2. Play the game silently
3. Audio stays muted until you click 🔇 to unmute

The game is **fully playable with or without sound** - audio is purely for feedback and atmosphere.

---

**Your audio system is working if you can check ✅ for tests 1-18 above!**
