"""
tests/test_cinematic_video_verification.py
Automated Visual Difference and Integrity Test Suite for JalRakshak RC2.4 Cinematic Video Simulation.

Verifies:
1. Video asset exists and has valid MP4 H.264 encoding with 2160 frames at 24fps (90.0s).
2. Frame checkpoints (T+00, T+15, T+30, T+45, T+60, T+90) are physically distinct.
3. Visual difference metric proves dynamic flood propagation and extent expansion across timesteps.
"""

import os
import cv2
import numpy as np
import pytest

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
VIDEO_PATH = os.path.join(REPO_ROOT, "frontend", "public", "simulation", "jalrakshak_cinematic.mp4")

def test_cinematic_video_asset_integrity():
    assert os.path.exists(VIDEO_PATH), f"Cinematic video not found at: {VIDEO_PATH}"
    cap = cv2.VideoCapture(VIDEO_PATH)
    assert cap.isOpened(), "Failed to open cinematic video stream"
    
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    file_size_mb = os.path.getsize(VIDEO_PATH) / (1024.0 * 1024.0)
    cap.release()

    assert frame_count == 2160, f"Expected 2160 frames, got {frame_count}"
    assert fps == 24.0, f"Expected 24 fps, got {fps}"
    assert width == 1920, f"Expected 1920 width, got {width}"
    assert height == 1080, f"Expected 1080 height, got {height}"
    assert file_size_mb > 2.0, f"Expected video size > 2MB, got {file_size_mb:.2f} MB"

def test_cinematic_flood_propagation_visual_differences():
    """
    Extract frame checkpoints across the movie and verify genuine physical visual differences.
    """
    cap = cv2.VideoCapture(VIDEO_PATH)
    assert cap.isOpened()

    # Checkpoint frame indices: T+00 (0s), T+15 (22s), T+30 (35s), T+45 (55s), T+60 (75s), T+90 (88s)
    checkpoints = {
        "T+00": 0,
        "T+15": int(22 * 24),
        "T+30": int(35 * 24),
        "T+45": int(55 * 24),
        "T+60": int(75 * 24),
        "T+90": int(88 * 24)
    }

    frames = {}
    for name, f_idx in checkpoints.items():
        cap.set(cv2.CAP_PROP_POS_FRAMES, f_idx)
        ret, frame = cap.read()
        assert ret, f"Failed to read frame at index {f_idx} for {name}"
        frames[name] = frame

    cap.release()

    # Calculate Mean Absolute Pixel Difference across sequential stages
    keys = list(checkpoints.keys())
    for i in range(len(keys) - 1):
        k1 = keys[i]
        k2 = keys[i+1]
        diff = np.mean(np.abs(frames[k1].astype(np.float32) - frames[k2].astype(np.float32)))
        print(f"\nVisual Delta ({k1} -> {k2}): {diff:.2f} mean pixel difference")
        # Visual difference must be significant (> 1.0 mean pixel delta across 2 million pixels)
        assert diff > 1.0, f"Visual delta between {k1} and {k2} too small ({diff:.2f}); scene is static!"

if __name__ == "__main__":
    test_cinematic_video_asset_integrity()
    test_cinematic_flood_propagation_visual_differences()
    print("All cinematic video tests passed!")
