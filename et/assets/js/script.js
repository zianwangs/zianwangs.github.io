class EarTrainingGame {
    constructor() {
        this.synth = null;
        this.currentMelody = [];
        this.userMelody = [];
        this.currentNoteIndex = 0; // Track which note we're currently on
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.isPlaying = false;
        this.isFirstTime = true;
        
        // Diatonic notes from C3 to C5 (C major scale)
        this.notes = [
            { name: 'C3', key: 'C' },
            { name: 'D3', key: 'D' },
            { name: 'E3', key: 'E' },
            { name: 'F3', key: 'F' },
            { name: 'G3', key: 'G' },
            { name: 'A3', key: 'A' },
            { name: 'B3', key: 'B' },
            { name: 'C4', key: 'C' },
            { name: 'D4', key: 'D' },
            { name: 'E4', key: 'E' },
            { name: 'F4', key: 'F' },
            { name: 'G4', key: 'G' },
            { name: 'A4', key: 'A' },
            { name: 'B4', key: 'B' },
            { name: 'C5', key: 'C' }
        ];
        
        this.init();
    }
    
    init() {
        this.setupToneJS();
        this.setupEventListeners();
        this.createPiano();
        this.updateStats();
        this.generateNewMelody();
    }
    
    setupToneJS() {
        // Create a sampler with local piano MP3 files
        this.synth = new Tone.Sampler({
            urls: {
                "C3": "c3.mp3",
                "D3": "d3.mp3",
                "E3": "e3.mp3",
                "F3": "f3.mp3",
                "G3": "g3.mp3",
                "A3": "a3.mp3",
                "B3": "b3.mp3",
                "C4": "c4.mp3",
                "D4": "d4.mp3",
                "E4": "e4.mp3",
                "F4": "f4.mp3",
                "G4": "g4.mp3",
                "A4": "a4.mp3",
                "B4": "b4.mp3",
                "C5": "c5.mp3"
            },
            volume: 15,
            baseUrl: "assets/audio/",
            onload: () => {
                this.samplesLoaded = true;
            }
        }).toDestination();
        
        this.samplesLoaded = false;
        
        // Start audio context on first user interaction
        document.addEventListener('click', () => {
            if (Tone.context.state !== 'running') {
                Tone.start();
            }
        }, { once: true });
    }
    
    setupEventListeners() {
        document.getElementById('newMelody').addEventListener('click', () => {
            this.generateNewMelody();
        });
        
        document.getElementById('playMelody').addEventListener('click', () => {
            this.playMelody();
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e, e.key.toUpperCase());
        });
        

    }
    
    createPiano() {
        const piano = document.getElementById('piano');
        piano.innerHTML = '';
        

        
        // Create white keys first
        this.notes.forEach((note, index) => {
            const key = document.createElement('div');
            key.className = 'piano-key white';
            key.textContent = note.key === 'C' || note.key === 'F' ? note.name : '';
            key.dataset.note = note.name;
            
            key.addEventListener('click', () => {
                this.playNote(note);
                this.addToUserMelody(note);
            });
            
            piano.appendChild(key);
        });
        

    }
    
    handleKeyPress(e, key) {
        // Map keyboard keys to diatonic notes
        if (key === ' ' && this.samplesLoaded) {
            this.playMelody();
            e.preventDefault();
            return;
        }
        const keyMap = {
            'Q': 'C3', 'W': 'D3', 'E': 'E3', 'R': 'F3', 'T': 'G3', 'Y': 'A3', 'U': 'B3', 'I': 'C4',
            '1': 'C4', '2': 'D4', '3': 'E4', '4': 'F4', '5': 'G4', '6': 'A4', '7': 'B4', '8': 'C5',
        };
        
        const noteName = keyMap[key];
        if (noteName) {
            const note = this.notes.find(n => n.name === noteName);
            if (note) {
                this.playNote(note);
                this.addToUserMelody(note);
            }
        }
    }
    
        playNote(note, showVisualFeedback = true) {
        // Use Tone.js with piano-mp3 samples (all keys available)
        if (this.synth && this.samplesLoaded) {
            // Play the exact note - no transposition needed!
            this.synth.triggerAttackRelease(note.name, "2n");
        }
        
        // Visual feedback only if requested
        if (showVisualFeedback) {
            const keyElement = document.querySelector(`[data-note="${note.name}"]`);
            if (keyElement) {
                keyElement.classList.add('active');
                setTimeout(() => {
                    keyElement.classList.remove('active');
                }, 300);
            }
        }
    }
    
    generateNewMelody() {
        const noteCount = parseInt(document.getElementById('noteCount').value);
        this.currentMelody = [];
        this.userMelody = [];
        this.currentNoteIndex = 0;
        
        for (let i = 0; i < noteCount; i++) {
            const randomNote = this.notes[Math.floor(Math.random() * this.notes.length)];
            this.currentMelody.push(randomNote);
        }
        
        this.updateUserMelodyDisplay();
        this.clearFeedback();
        this.resetPianoKeys(); // Reset piano key styles
        if (this.isFirstTime) {
            this.isFirstTime = false;
            return;
        }
        
        // Only play melody if samples are loaded
        if (this.samplesLoaded) {
            this.playMelody();
        } else {
            // Wait for samples to load, then play
            const checkLoaded = () => {
                if (this.samplesLoaded) {
                    this.playMelody();
                } else {
                    setTimeout(checkLoaded, 100);
                }
            };
            checkLoaded();
        }
    }
    
    playMelody() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        let index = 0;
        
        const playNextNote = () => {
            if (index < this.currentMelody.length) {
                const note = this.currentMelody[index];
                this.playNote(note, false); // No visual feedback during melody playback
                index++;
                setTimeout(playNextNote, 600); // 600ms between notes
            } else {
                this.isPlaying = false;
                this.isFirstTime = false;
            }
        };
        
        playNextNote();
    }
    
    addToUserMelody(note) {
        // Check if this note is correct for the current position
        const expectedNote = this.currentMelody[this.currentNoteIndex];
        const isCorrect = note.name === expectedNote.name;
        
        // Show immediate feedback
        this.showImmediateFeedback(isCorrect, note);
        
        if (isCorrect) {
            // Add to user melody and move to next note
            this.userMelody.push(note);
            this.updateUserMelodyDisplay();
            this.currentNoteIndex++;
            
            // Check if melody is complete
            if (this.currentNoteIndex >= this.currentMelody.length) {
                this.handleMelodyComplete();
            }
        } else {
            // Wrong note - don't add to melody, just show feedback
            // User can try again immediately
            this.streak = 0;
            this.updateStats();
        }
    }
    
    updateUserMelodyDisplay() {
        const display = document.getElementById('userMelody');
        display.innerHTML = '';
        
        // Show revealed notes (correct ones)
        this.userMelody.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-display correct';
            noteElement.textContent = note.name;
            display.appendChild(noteElement);
        });
        
        // Show placeholders for remaining notes
        for (let i = this.userMelody.length; i < this.currentMelody.length; i++) {
            const placeholderElement = document.createElement('div');
            placeholderElement.className = 'note-display placeholder';
            placeholderElement.textContent = '?';
            display.appendChild(placeholderElement);
        }
    }
    
    handleMelodyComplete() {
        this.showFeedback('Correct! 🎉', 'correct');
        this.score += 10;
        this.streak++;
        if (this.streak > this.maxStreak) {
            this.maxStreak = this.streak;
        }
        this.updateStats();
        // Reset again after a short delay to ensure cleanup
        setTimeout(() => {
            this.resetPianoKeys();
        }, 300);
        
        // Immediately generate and play next melody
        setTimeout(() => {
            this.generateNewMelody();
            this.playMelody();
        }, 700);
    }
    
    resetPianoKeys() {
        const allKeys = document.querySelectorAll('.piano-key');
        allKeys.forEach(key => {
            // Remove all possible feedback classes
            key.classList.remove('active', 'correct-note', 'incorrect-note');
            // Reset any inline styles that might be lingering
            key.style.transform = '';
            key.style.boxShadow = '';
            key.style.background = '';
            key.style.color = '';
        });
    }
    
    showImmediateFeedback(isCorrect, note) {
        const keyElement = document.querySelector(`[data-note="${note.name}"]`);
        if (keyElement) {
            // Remove any existing feedback classes
            keyElement.classList.remove('correct-note', 'incorrect-note');
            
            // Add appropriate feedback class
            if (isCorrect) {
                keyElement.classList.add('correct-note');
            } else {
                keyElement.classList.add('incorrect-note');
            }
            
            // Remove feedback after a short delay
            setTimeout(() => {
                keyElement.classList.remove('correct-note', 'incorrect-note');
            }, 1000);
        }
    }
    
    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `feedback ${type}`;
    }
    
    clearFeedback() {
        const feedback = document.getElementById('feedback');
        feedback.textContent = '';
        feedback.className = 'feedback';
    }
    
    updateStats() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('streak').textContent = this.streak;
        document.getElementById('maxStreak').textContent = this.maxStreak;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EarTrainingGame();
}); 