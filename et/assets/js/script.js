class EarTrainingGame {
    constructor() {
        this.synth = null;
        this.currentMelody = [];
        this.userMelody = [];
        this.currentNoteIndex = 0; // Track which note we're currently on
        this.score = 0;
        this.streak = 0;
        this.isPlaying = false;
        
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
            baseUrl: "assets/audio/",
        }).toDestination();
        
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
            this.handleKeyPress(e.key.toUpperCase());
        });
        

    }
    
    createPiano() {
        const piano = document.getElementById('piano');
        piano.innerHTML = '';
        

        
        // Create white keys first
        this.notes.forEach((note, index) => {
            const key = document.createElement('div');
            key.className = 'piano-key white';
            key.textContent = note.name; // Show full note name like C3, D3, etc.
            key.dataset.note = note.name;
            
            key.addEventListener('click', () => {
                this.playNote(note);
                this.addToUserMelody(note);
            });
            
            piano.appendChild(key);
        });
        

    }
    
    handleKeyPress(key) {
        // Map keyboard keys to diatonic notes
        const keyMap = {
            'C': 'C3', 'D': 'D3', 'E': 'E3', 'F': 'F3', 'G': 'G3', 'A': 'A3', 'B': 'B3',
            '1': 'C3', '2': 'D3', '3': 'E3', '4': 'F3', '5': 'G3', '6': 'A3', '7': 'B3',
            'Q': 'C4', 'W': 'D4', 'E': 'E4', 'R': 'F4', 'T': 'G4', 'Y': 'A4', 'U': 'B4',
            'Z': 'C5'
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
        if (this.synth) {
            // Play the exact note - no transposition needed!
            this.synth.triggerAttackRelease(note.name, "4n");
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
        this.playMelody();
        
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
        this.updateStats();
        
        // Immediately generate and play next melody
        setTimeout(() => {
            this.generateNewMelody();
            this.playMelody();
        }, 500);
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
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EarTrainingGame();
}); 