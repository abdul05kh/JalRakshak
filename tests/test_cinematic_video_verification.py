import os
import cv2
import numpy as np

VIDEO_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "frontend", "public", "simulation", "jalrakshak_cinematic.mp4"
)

def test_video_file_exists_and_valid():
    assert os.path.exists(VIDEO_PATH), f"Video file not found at {VIDEO_PATH}"
    size_mb = os.path.getsize(VIDEO_PATH) / (1024 * 1024)
    assert size_mb > 5.0, f"Video file size {size_mb:.2f}MB is too small"

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
    
    checkpoints_sec = [0, 15, 30, 45, 60, 85]
    captured_frames = []
    
    for sec in checkpoints_sec:
        frame_idx = min(int(sec * fps), total_frames - 1)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        assert ret is True, f"Failed to read frame at {sec}s"
        
        # Crop to the central hydraulic flood valley scene (ignoring HUD borders)
        h, w, _ = frame.shape
        scene_crop = frame[int(h * 0.2):int(h * 0.8), int(w * 0.15):int(w * 0.85)]
        captured_frames.append(scene_crop)
        
    cap.release()
    
    # Verify that consecutive scene crops have measurable, non-zero pixel differences
    for i in range(len(captured_frames) - 1):
        diff = cv2.absdiff(captured_frames[i], captured_frames[i+1])
        mean_diff = np.mean(diff)
        assert mean_diff > 1.0, f"Checkpoint {checkpoints_sec[i]}s vs {checkpoints_sec[i+1]}s pixel diff {mean_diff:.2f} is too low (static scene failure)"
