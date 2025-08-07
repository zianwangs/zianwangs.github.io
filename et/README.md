# 🎵 Ear Training - Melody Dictation

A web-based ear training application for practicing melody dictation using diatonic notes from C3 to C5.

## Features

- **Diatonic Scale**: Uses only the C major scale notes (C, D, E, F, G, A, B) from C3 to C5
- **Configurable Difficulty**: Choose from 2-6 notes per melody
- **Interactive Piano**: Click piano keys or use keyboard (C, D, E, F, G, A, B) to play notes
- **Real-time Feedback**: Visual and audio feedback for correct/incorrect answers
- **Score Tracking**: Keep track of your score and streak
- **Modern UI**: Beautiful, responsive design with smooth animations

## How to Use

1. **Open the Application**: Open `index.html` in a modern web browser
2. **Choose Difficulty**: Select the number of notes (2-6) from the dropdown
3. **Generate Melody**: Click "🎵 New Melody" to create a random melody
4. **Listen**: Click "▶️ Play Melody" to hear the sequence
5. **Play Back**: Click the piano keys or use your keyboard to recreate the melody
6. **Get Feedback**: The app will tell you if you're correct and automatically move to the next melody

## Controls

- **Mouse**: Click piano keys to play notes
- **Keyboard**: Use C, D, E, F, G, A, B keys to play notes
- **Buttons**: 
  - "🎵 New Melody" - Generate a new random melody
  - "▶️ Play Melody" - Play the current melody

## Technical Details

- **Audio Generation**: Uses Web Audio API to generate sine wave tones
- **Note Range**: C3 (130.81 Hz) to C5 (523.25 Hz)
- **Browser Compatibility**: Works in all modern browsers that support Web Audio API
- **Responsive Design**: Adapts to different screen sizes

## Project Structure

```
et/
├── index.html              # Main HTML file
├── assets/
│   ├── css/
│   │   └── styles.css      # Modern CSS styling with animations
│   ├── js/
│   │   └── script.js       # Game logic and audio generation
│   ├── audio/              # Piano MP3 files
│   │   ├── c3.mp3
│   │   ├── d3.mp3
│   │   ├── e3.mp3
│   │   └── ... (all diatonic notes)
│   └── images/
│       └── favicon.png     # Piano icon for browser tabs
└── README.md               # This documentation
```

## Browser Requirements

- Modern browser with Web Audio API support
- Chrome, Firefox, Safari, Edge (latest versions)
- JavaScript enabled

## Tips for Practice

1. Start with 2-3 notes and gradually increase difficulty
2. Listen to the melody multiple times before attempting to play it back
3. Focus on the relative pitch relationships between notes
4. Use the keyboard shortcuts for faster input
5. Practice regularly to improve your ear training skills

Enjoy practicing your ear training! 🎼 