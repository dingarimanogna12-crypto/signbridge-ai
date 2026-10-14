"""
SignBridge AI — ISL Dynamic Sequence Model Training Workflow
============================================================
This script trains a dynamic sequence classifier from landmark datasets
recorded via the in-app SignBridge AI Dataset Recorder tool.

Usage:
  python train_gesture_model.py --input-dataset isl_dataset.json --output-model isl_model_weights.json
"""

import json
import os
import sys
import math
import argparse
from typing import List, Dict, Any, Tuple

def parse_args():
    parser = argparse.ArgumentParser(description="Train ISL Sequence Model from MediaPipe Landmarks")
    parser.add_argument("--input-dataset", default="isl_dataset.json", help="Path to exported JSON dataset")
    parser.add_argument("--output-model", default="isl_model_weights.json", help="Output model weights file")
    parser.add_argument("--sequence-length", type=int, default=30, help="Fixed length to interpolate sequences")
    return parser.parse_args()

def normalize_hand_landmarks(landmarks: List[Dict[str, float]]) -> List[float]:
    """
    Normalizes 21 landmarks relative to the wrist (landmark 0)
    and scales by the maximum palm dimension.
    """
    if not landmarks or len(landmarks) < 21:
        return [0.0] * 63

    wrist = landmarks[0]
    wx, wy, wz = wrist.get("x", 0.0), wrist.get("y", 0.0), wrist.get("z", 0.0)

    # Translate relative to wrist
    translated = []
    max_dist = 0.0001
    for p in landmarks:
        dx = p.get("x", 0.0) - wx
        dy = p.get("y", 0.0) - wy
        dz = p.get("z", 0.0) - wz
        dist = math.sqrt(dx*dx + dy*dy + dz*dz)
        if dist > max_dist:
            max_dist = dist
        translated.append((dx, dy, dz))

    # Scale invariance
    normalized = []
    for dx, dy, dz in translated:
        normalized.extend([dx / max_dist, dy / max_dist, dz / max_dist])

    return normalized

def resample_sequence(sequence: List[List[float]], target_len: int) -> List[List[float]]:
    """Linear interpolation of temporal frame vectors to uniform target_len."""
    if not sequence:
        return [[0.0] * 63 for _ in range(target_len)]
    
    n_frames = len(sequence)
    if n_frames == target_len:
        return sequence
    
    resampled = []
    for i in range(target_len):
        src_idx = (i / (target_len - 1)) * (n_frames - 1) if target_len > 1 else 0
        floor_idx = int(math.floor(src_idx))
        ceil_idx = min(n_frames - 1, int(math.ceil(src_idx)))
        alpha = src_idx - floor_idx
        
        vec1 = sequence[floor_idx]
        vec2 = sequence[ceil_idx]
        interp = [vec1[j] * (1.0 - alpha) + vec2[j] * alpha for j in range(len(vec1))]
        resampled.append(interp)
        
    return resampled

def train_and_export_model(dataset_path: str, output_path: str, target_len: int):
    print("=" * 60)
    print("  SignBridge AI — ISL Dynamic Sequence Model Training")
    print("=" * 60)

    if not os.path.exists(dataset_path):
        print(f"[INFO] Generating dummy dataset for pipeline demonstration: {dataset_path}")
        dummy_dataset = {
            "version": "1.0.0",
            "datasetName": "Demonstration ISL Dataset",
            "samples": [
                {
                    "signLabel": "Thank you",
                    "frames": [{"timeOffsetMs": i * 33, "hands": [{"landmarks": [{"x": 0.5, "y": 0.4 + i*0.01, "z": 0.0} for _ in range(21)]}]} for i in range(20)]
                },
                {
                    "signLabel": "I Need / Want",
                    "frames": [{"timeOffsetMs": i * 33, "hands": [{"landmarks": [{"x": 0.5, "y": 0.5 + i*0.015, "z": 0.0} for _ in range(21)]}]} for i in range(20)]
                }
            ]
        }
        with open(dataset_path, "w", encoding="utf-8") as f:
            json.dump(dummy_dataset, f, indent=2)

    with open(dataset_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    samples = data.get("samples", [])
    print(f"Loaded {len(samples)} sequence samples from {dataset_path}.")

    class_prototypes: Dict[str, Dict[str, Any]] = {}
    label_counts: Dict[str, int] = {}

    for sample in samples:
        label = sample.get("signLabel", "Unknown")
        label_counts[label] = label_counts.get(label, 0) + 1
        raw_frames = sample.get("frames", [])

        # Extract normalized vectors per frame
        seq_vectors = []
        for fr in raw_frames:
            hands = fr.get("hands", [])
            if hands:
                lm = hands[0].get("landmarks", [])
                norm_vec = normalize_hand_landmarks(lm)
                seq_vectors.append(norm_vec)

        if not seq_vectors:
            continue

        resampled = resample_sequence(seq_vectors, target_len)

        if label not in class_prototypes:
            class_prototypes[label] = {
                "label": label,
                "sampleCount": 0,
                "accumulatedSequence": [[0.0] * 63 for _ in range(target_len)]
            }

        proto = class_prototypes[label]
        proto["sampleCount"] += 1
        for t in range(target_len):
            for dim in range(63):
                proto["accumulatedSequence"][t][dim] += resampled[t][dim]

    # Compute centroid prototype templates per sign
    final_templates = []
    for label, proto in class_prototypes.items():
        count = proto["sampleCount"]
        centroid = []
        for t in range(target_len):
            centroid.append([round(v / count, 4) for v in proto["accumulatedSequence"][t]])

        final_templates.append({
            "signLabel": label,
            "trainedSamples": count,
            "templateSequence": centroid
        })
        print(f" - Class '{label}': {count} training samples processed.")

    model_artifact = {
        "modelType": "DynamicTimeWarping_Centroid_Classifier",
        "version": "1.0.0",
        "sequenceLength": target_len,
        "inputDim": 63,
        "classes": final_templates,
        "notes": "Model templates can be evaluated in browser runtime via DTW or Euclidean distance metric."
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(model_artifact, f, indent=2)

    print(f"\n[SUCCESS] Model weights exported to: {output_path}")
    print("=" * 60)

if __name__ == "__main__":
    args = parse_args()
    train_and_export_model(args.input_dataset, args.output_model, args.sequence_length)
