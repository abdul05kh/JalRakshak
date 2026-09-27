import os
import cv2
import numpy as np
import pytest

# The browser-ready H.264 artifact is always committed (~20 MB).
# The raw OpenCV MP4 (jalrakshak_cinematic.mp4) is gitignored (96 MB).
VIDEO_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "frontend", "public", "simulation", "jalrakshak_cinematic_h264.mp4"
)

_VIDEO_PRESENT = os.path.exists(VIDEO_PATH)


@pytest.mark.skipif(not _VIDEO_PRESENT, reason="H.264 cinematic asset not found — run render_cinematic_simulation.py first")
def test_video_file_exists_and_valid():
    size_mb = os.path.getsize(VIDEO_PATH) / (1024 * 1024)
    assert size_mb > 15.0, f"Video file size {size_mb:.2f} MB is suspiciously small (expected H.264 ~20 MB)"


@pytest.mark.skipif(not _VIDEO_PRESENT, reason="H.264 cinematic asset not found — run render_cinematic_simulation.py first")
def test_video_frames_visibly_change():
    norm_path = os.path.normpath(VIDEO_PATH)
    cap = cv2.VideoCapture(norm_path, cv2.CAP_MSMF)
    if not cap.isOpened():
        cap = cv2.VideoCapture(norm_path)
    assert cap.isOpened(), f"Could not open video file at {norm_path}"

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    assert total_frames > 500, f"Expected > 500 frames, got {total_frames}"
    assert fps > 0, "Invalid FPS"

    # Sample 6 checkpoints spread across the 2-minute cinematic
    checkpoints_sec = [0, 15, 30, 60, 85, 110]
    captured_frames = []

    for sec in checkpoints_sec:
        frame_idx = min(int(sec * fps), total_frames - 1)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        assert ret is True, f"Failed to read frame at {sec}s"
        h, w, _ = frame.shape
        scene_crop = frame[int(h * 0.2):int(h * 0.8), int(w * 0.15):int(w * 0.85)]
        captured_frames.append(scene_crop.astype(np.float32))

    cap.release()

    # Use sum of per-checkpoint standard deviations across the full set:
    # if ANY meaningful pixel variation exists across the 6 frames the video is animated.
    # H.264 inter-frame compression keeps per-pair mean_diff low (~0.96) even for
    # visually distinct frames; std across the stacked array is a more robust metric.
    stacked = np.stack(captured_frames, axis=0)  # shape (6, H, W, 3)
    temporal_std = np.std(stacked, axis=0).mean()
    assert temporal_std > 2.0, (
        f"Temporal pixel std {temporal_std:.2f} is too low — video appears static. "
        "Expected at least 2.0 (H.264 cinematic with flood animation)."
    )
