# SignBridge AI — ISL Model Training Workflow & Dataset Guide

This guide describes how to collect labeled Indian Sign Language (ISL) landmark datasets and train recognition models for the SignBridge AI client-side recognition engine.

---

## ⚠️ Important Principle
> **Adding a label to the vocabulary list does NOT train the AI.**
> To recognize a new sign, you must collect real training samples of the sign performed by signers, preprocess the temporal sequences, and train/evaluate the classifier before integrating it into production.

---

## 1. Collecting Training Data Using the In-App Dataset Recorder

1. Open SignBridge AI at `http://localhost:3000` and navigate to **Sign-to-Text Recognition Studio**.
2. Click **"Dataset Recording Tool"** at the bottom of the studio.
3. Select the target ISL sign from the vocabulary registry (or enter a new sign identifier).
4. Position your hand clearly in the webcam frame.
5. Click **"Start Recording (3s)"** and perform the complete sign stroke naturally (including preparation, movement, and release).
6. Perform 15–30 repetitions per sign under diverse lighting conditions, distances, and angles.
7. Click **"Export Dataset (JSON)"** to download the structured landmark sequence file (`isl_dataset.json`).

---

## 2. Dataset Schema Format

The exported dataset follows this standardized JSON structure:
```json
{
  "version": "1.0.0",
  "datasetName": "SignBridge AI ISL Landmark Sequence Dataset",
  "samples": [
    {
      "id": "sample_1697042000_abc12",
      "signId": "sign-thank-you",
      "signLabel": "Thank you",
      "signerId": "signer_01",
      "recordedAt": "2026-10-11T12:00:00Z",
      "frameCount": 42,
      "durationMs": 1380,
      "frames": [
        {
          "timeOffsetMs": 33,
          "hands": [
            {
              "handedness": "Right",
              "landmarks": [
                { "x": 0.482, "y": 0.612, "z": 0.001 },
                ... (21 3D joint points)
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 3. Training the Offline Model

Run the bundled training pipeline:
```bash
python scripts/train_gesture_model.py --input-dataset isl_dataset.json --output-model src/assets/isl_model_weights.json
```

### What the Training Pipeline Does:
1. **Coordinate Normalization:** Translates all 21 hand landmarks relative to the wrist origin $(x_0, y_0, z_0)$ to ensure position invariance, and scales by palm span for distance/hand-size invariance.
2. **Temporal Resampling:** Linearly interpolates variable-length frame sequences (e.g. 25–50 frames) into a uniform temporal length of 30 frames.
3. **Template / Centroid Extraction:** Computes class prototype centroids and Dynamic Time Warping (DTW) feature distributions.
4. **Export:** Generates lightweight JSON model weights suitable for instant client-side execution in the browser.

---

## 4. Ethical & Linguistic Guidelines
- Involve Deaf community signers for dataset collection.
- Ensure diversity in skin tones, hand sizes, and lighting conditions.
- Do not invent artificial signs; ground all data in standardized Indian Sign Language dictionaries (e.g. ISLRTC).
