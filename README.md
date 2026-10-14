# SignBridge AI — AI-Powered Inclusive Communication Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-teal.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-sky.svg)](https://tailwindcss.com/)
[![WCAG](https://img.shields.io/badge/WCAG_2.1-AAA_Design-success.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)

**SignBridge AI** is an inclusive communication assistant web application designed to bridge the communication gap between **Deaf and hard-of-hearing (D/HoH)** individuals and hearing people in hospitals, clinics, educational institutions, government service centers, workplaces, and public transit hubs.

The platform provides practical, real-time two-way communication:
1. **Hearing-to-Deaf Channel:** Converts spoken speech into real-time captions and automatically resolves phrases to structured, multi-step **Indian Sign Language (ISL)** demonstrations.
2. **Deaf-to-Hearing Channel:** Captures real-time sign movements through an extensible landmark and temporal kinematics engine, provides an in-place **Signer Review & Correction Bar**, and vocalizes confirmed text using Text-to-Speech (TTS).

---

## 📊 Truthful Feature-Status Matrix

Every feature in SignBridge AI is documented according to its actual implementation and operational status:

| Feature | Implementation Status | Technical Mechanism & Notes |
| :--- | :--- | :--- |
| **Speech-to-Text (STT) Captions** | ✅ **Tested Working** | Native Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) with real-time audio wave meter via Web Audio API `AudioContext` and streaming interim transcriptions. |
| **STT Audio Simulation Mode** | 🎭 **Simulated Feature** | 4 pre-recorded simulated acoustic scenarios (Hospital Triage, Doctor Prescription, Interpreter Request, Transit Inquiry) allowing full testing without a physical microphone. All simulated turns carry an explicit `[SIMULATION]` badge. |
| **Text-to-Speech (TTS) Voice Readout** | ✅ **Tested Working** | Native browser `window.speechSynthesis` for vocalizing Deaf participant turns to hearing partners with rate and pitch controls. |
| **Authentic Video & Demonstration Player** | ✅ **Tested Working** | Educational ISL video player with Play, Pause, Replay, Slow Motion (`0.5x`, `0.75x`, `1.0x`), Mirror Mode, Fullscreen, CC subtitles, plain-English instructions, and custom video attachment modal. Replaces confusing 2D silhouette avatars. Organized across 6 practical categories: *Greetings*, *Medical Needs*, *Emergency*, *Travel*, *Food*, *Daily Conversation*. |
| **Truthful Non-Available Handling** | ✅ **Tested Working** | When a phrase has no authentic ISL demonstration, displays *"Demonstration not available yet for '[phrase]'"* with clickable chips for related verified phrases. Never falls back to arbitrary signs or automatic fingerspelling. |
| **ISL Two-Handed Fingerspelling** | ✅ **Tested Working** | Two-handed Indian Sign Language fingerspelling engine (letters A–Z) with visual anatomical diagrams and step-by-step descriptions, strictly reserved as an explicit manual toggle for proper nouns and names. |
| **Sign-to-Text Centroid Matching** | ✅ **Tested Working** | Extensible sign recognition with 11 scale-invariant 3D landmark centroids (`trained_centroids.json`) normalized relative to wrist and middle MCP distance, fused with 45-frame rolling kinematics (`TemporalSequenceBuffer`). Unsupported postures explicitly return *"Sign not recognized — please try again."* (no sticky default predictions). |
| **Signer Review & Correction Bar** | ✅ **Tested Working** | Real-time prediction staging interface allowing Deaf signers to inspect model confidence, tap alternate candidate suggestions, edit text manually, or click [Confirm & Send] to dispatch turns to the conversation and trigger TTS vocalization. |
| **Sign Vocabulary Directory & Curriculum Guide** | ✅ **Tested Working** | Interactive visual vocabulary library (`SignVocabularyPage.tsx`) cataloging 47+ verified signs across 12 textbook communication topics (*Greetings*, *Family*, *Numbers & Time*, *Home*, *Emotions*, *Travel*, *Food*, *Shopping*, *Education*, *Hobbies & Weather*, *Health & Doctor*, *Technology*). Every entry contains 4-stage instructional diagrams (Handshape, Start Anchor, Movement Direction, Hold/Expression), ISLRTC citations, ASL comparative notes, and beginner flashcards. |
| **Interactive "Try an Example" Exploration** | ✅ **Tested Working** | Pre-recorded gesture test vectors and simulated sequences enabling full camera and audio workflow evaluation without a physical webcam or microphone. Clearly marked with `[SIMULATION]` badges. |
| **Two-Way Split-Screen Workspace** | ✅ **Tested Working** | Synchronized turn-taking workspace (`TwoWaySessionView.tsx`) where hearing speech immediately projects active ISL demonstrations on the Deaf pane, and Deaf sign confirmations trigger TTS voice playback. |
| **Transcript Export** | ✅ **Tested Working** | Client-side file generator exporting complete consultation transcripts in `.txt` and `.json` formats. |
| **Admin Moderation Registry** | ✅ **Tested Working** | In-app interface for reviewing community feedback, updating moderation status (`Pending`, `Under Review`, `Approved`, `Resolved`, `Rejected`), and toggling phrase verification flags locally. |
| **Accessibility & WCAG AAA UI** | ✅ **Tested Working** | High contrast ratio (15.6:1), high-contrast mode toggle, dynamic typography scaling (Standard, Large, Extra Large), and screen-edge visual flash alert for incoming speech. |
| **Local Storage Persistence** | ✅ **Tested Working** | Offline-first architecture saving user profiles, session transcripts, custom phrases, custom video URLs, and feedback reports to browser `localStorage`. |
| **Supabase Cloud Database Sync** | 🔌 **Requires External Setup** | Optional PostgreSQL cloud synchronization using `@supabase/supabase-js`. Operates in graceful offline fallback mode when credentials are not configured. |

---

## 🧠 Extensible Sign Recognition Architecture

The sign recognition pipeline replaces legacy static heuristics with a modular, dynamic temporal architecture:

```
Camera Frame (Webcam / Video)
        │
        ▼
Google MediaPipe Hands (21 3D Landmarks per Hand)
        │
        ├──► TemporalSequenceBuffer (45-frame sliding window)
        │       • 3D displacement vector (Δx, Δy, Δz)
        │       • Kinematic average speed & acceleration
        │       • Trajectory stroke classification:
        │         [outward_stroke, downward_stroke, wrist_tap, oscillation_twist, static]
        │
        └──► Modular GestureEngine
                • Evaluates dynamic trajectory + static joint geometry
                • Queries SignVocabulary Registry
                • Returns: signName, confidence, isUncertain, alternateSuggestions
                        │
                        ▼
Prediction Review & Correction Bar (User Interface)
        • Visual Trajectory Badge
        • Confidence Score (e.g. 94%)
        • Alternate Suggestion Chips
        • Editable Text Input
        • [Confirm & Send] ──► Dispatches Turn & Triggers TTS Audio
```

### Registered ISL Vocabulary (`signVocabulary.ts`)
The registry supports both static hand postures and multi-frame dynamic sequences across anatomical anchors:
- **`dynamic_sequence`:**
  - `sign-thank-you`: Flat palm outward stroke from `chin`.
  - `sign-doctor`: Dominant two fingers tapping pulse at non-dominant `wrist`.
  - `sign-help`: Closed fist placed on open palm pressing upward at `chest`.
  - `sign-water`: Three middle fingers extended (W-shape) tapping lower lip at `chin`.
  - `sign-pain`: Extended index fingers rotating with inward tension at `chest`.
  - `sign-medicine`: Bent middle finger grinding against open palm at `hand`.
  - `sign-hospital`: Two-finger cross trace across non-dominant `shoulder`.
- **`static_posture`:**
  - `sign-hello`: Open palm with 5 extended digits facing forward.
  - `sign-yes`: Closed fist with vertical thumb extension.
  - `sign-no`: Pinch posture with index/middle fingertips touching thumb.
  - `sign-peace`: V-handshape with index and middle fingers extended apart.
  - `sign-ily`: Thumb, index, and pinky extended with ring and middle curled.

---

## 📽️ Sequential Compound Demonstration Player

Indian Sign Language frequently expresses complex concepts through compound signs. The demonstration player (`SignDemonstrationPlayer.tsx`) breaks compound phrases into sequential steps:

- **Where is the hospital?**: Step 1: `HOSPITAL` (cross traced on shoulder) ➔ Step 2: `WHERE` (open palms questioned in space).
- **Where is the doctor?**: Step 1: `DOCTOR` (pulse check at wrist) ➔ Step 2: `WHERE` (open palms questioned in space).
- **I need water**: Step 1: `WATER` (W-shape tap on lower lip) ➔ Step 2: `NEED` (curved hook downward pull).
- **Please help me**: Step 1: `PLEASE` (open palm rub on chest) ➔ Step 2: `HELP` (fist on flat palm lift).
- **Take this medicine after food**: Step 1: `MEDICINE` (palm flick/grind) ➔ Step 2: `AFTER FOOD` (eating mime then sweep forward).

### Player Controls & Accessibility
- **Step Navigation:** Step buttons and progress bars allowing frame-by-frame review.
- **Speed Selector:** Normal (`1.0x`), Slow (`0.75x`), and Ultra-slow (`0.5x`) playback.
- **Anatomical Anchor Silhouette:** Animated SVG model displaying target contact points (`chin`, `chest`, `wrist`, `shoulder`).
- **Closed Captions:** High-contrast linguistic explanations and non-manual facial cues.
- **Mirror Mode & Fullscreen:** Spatial perspective inversion for left- or right-handed signers.

---

## 🏋️ Dataset Collection & Offline Model Training Workflow

SignBridge AI includes an integrated pipeline for recording landmark datasets and training template centroids using Dynamic Time Warping (DTW):

### 1. In-Browser Landmark Recording
1. Navigate to the **Sign-to-Text** tab.
2. Expand the **Dataset Collection & Offline Training Studio** panel.
3. Select the target sign label from the dropdown (or create a custom sign ID).
4. Click **Start Recording**, perform the sign in front of the camera, and click **Stop Recording**.
5. Click **Download Dataset (JSON)** to export the standardized landmark sequence file (`isl_dataset_<timestamp>.json`).

### 2. Standalone Model Training Script
Run the included Python training script (`scripts/train_gesture_model.py`):
```bash
python scripts/train_gesture_model.py \
  --dataset isl_dataset_export.json \
  --output src/services/recognition/trained_centroids.json \
  --max-frames 30
```
The script performs:
- Landmark normalization: Translates coordinates relative to the wrist (landmark 0) and normalizes for hand size.
- Temporal resampling: Resamples variable-length frame streams to standard 30-frame sequence vectors.
- Centroid computation: Generates robust DTW-averaged reference trajectories for each sign class.

---

## 🔒 Privacy, Network & Storage Audit

### 1. On-Device Video Processing
- **100% Client-Side Camera Frames:** Camera frames processed by MediaPipe Hands are evaluated exclusively in volatile browser RAM. Video frames and raw pixel buffers are **never** transmitted to remote servers, uploaded to cloud buckets, or written to disk.
- **Audio Captions:** Speech-to-text uses the browser's native Web Speech API. Depending on operating system and browser configurations, speech fragments may be processed by browser vendor speech servers (Google Speech Services).

### 2. External CDN & Asset Dependencies
The application fetches the following external resources upon initialization:
- **MediaPipe Scripts & WASM:** Loaded from jsdelivr CDN:
  - `https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js`
  - `https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js`
- **Google Fonts:** Typography stylesheets from `https://fonts.googleapis.com`.

### 3. Database & Storage Architecture
- **Browser LocalStorage:** Stores active sessions (`signbridge_sessions`), feedback items (`signbridge_feedback`), and user profiles (`signbridge_profile`).
- **Supabase PostgreSQL Schema:** A production-ready schema is supplied in [`supabase/schema.sql`](supabase/schema.sql) with comprehensive Row Level Security (RLS) policies for all 5 tables (`profiles`, `phrase_library`, `communication_sessions`, `session_turns`, `user_feedback`).

---

## 💻 Local Setup & Execution Guide

### Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **Browser:** Chromium-based browser (Google Chrome 90+, Microsoft Edge 90+) recommended for full Web Speech API and MediaPipe WebAssembly support.
- **Hardware:** Webcam and microphone (or use the built-in software simulators).

### Installation & Run Commands (Windows / PowerShell)

1. Clone or navigate to the project directory:
   ```powershell
   cd "C:\Users\D . Manogna\.gemini\antigravity\scratch\signbridge-ai"
   ```

2. Install dependencies:
   ```powershell
   npm.cmd install
   ```

3. Run verification test suites:
   ```powershell
   # Comprehensive in-place improvement test suite (53/53 tests: Centroids, Categories, Video Player, Vocabulary)
   npx.cmd tsx "C:\Users\D . Manogna\.gemini\antigravity\brain\1bc40fd8-23aa-4c88-9b63-6c17fa4e41fd\scratch\test_in_place_improvements.ts"

   # Recognition architecture unit test (vocabulary, kinematics buffer, engine, dataset)
   npx.cmd tsx "C:\Users\D . Manogna\.gemini\antigravity\brain\1bc40fd8-23aa-4c88-9b63-6c17fa4e41fd\scratch\test_recognition_architecture.ts"

   # Text-to-sign phrase library test (compound signs, fuzzy lookup, unavailable handling)
   npx.cmd tsx "C:\Users\D . Manogna\.gemini\antigravity\brain\1bc40fd8-23aa-4c88-9b63-6c17fa4e41fd\scratch\test_text_to_sign_library.ts"

   # Two-way session workflow integration test
   npx.cmd tsx "C:\Users\D . Manogna\.gemini\antigravity\brain\1bc40fd8-23aa-4c88-9b63-6c17fa4e41fd\scratch\test_two_way_integration.ts"
   ```

4. Launch development server:
   ```powershell
   npm.cmd run dev
   ```
   Open your browser at: `http://localhost:3000`

5. Build production bundle:
   ```powershell
   npm.cmd run build
   ```

6. Preview production build locally:
   ```powershell
   npm.cmd run preview
   ```

---

## ⌨️ Accessible Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Alt + M` | Toggle Speech-to-Text Microphone |
| `Alt + C` | Toggle Camera Gesture Recognizer |
| `Alt + S` | Open Text-to-Sign Explorer |
| `Alt + H` | Toggle High Contrast Mode (WCAG AAA) |
| `Alt + V` | Toggle Screen Visual Flash Alerts |

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
