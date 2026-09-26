import os
import cv2
import numpy as np

def verify_cinematic_simulation():
    video_path = os.path.join("frontend", "public", "simulation", "jalrakshak_cinematic.mp4")
    evidence_dir = os.path.join("artifacts", "simulation_evidence")
    os.makedirs(evidence_dir, exist_ok=True)

    assert os.path.exists(video_path), f"Video file not found at {video_path}"

    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration_s = total_frames / fps
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    print(f"Video Properties:")
    print(f"  Resolution: {width}x{height}")
    print(f"  FPS: {fps}")
    print(f"  Total Frames: {total_frames}")
    print(f"  Duration: {duration_s:.1f} seconds")

    checkpoints = [0, 15, 30, 45, 60, 75, 90, 115]
    saved_frames = {}

    print("\n--- Extracting Checkpoint Screenshots ---")
    for t in checkpoints:
        f_idx = min(int(t * fps), total_frames - 1)
        cap.set(cv2.CAP_PROP_POS_FRAMES, f_idx)
        ret, frame = cap.read()
        assert ret, f"Failed to read frame at T={t}s"
        out_name = f"frame_T{t:03d}s.png"
        out_path = os.path.join(evidence_dir, out_name)
        cv2.imwrite(out_path, frame)
        saved_frames[t] = frame
        print(f"  [SAVED] T+{t:02d}s (Frame #{f_idx:04d}) -> {out_path}")
    cap.release()

    print("\n--- Visual Difference Analysis (Excluding HUD & UI) ---")
    # Hydraulic map region crop: lines 200..950, cols 100..1820
    # This completely eliminates top HUD banners and bottom progress bars
    results = []
    threshold = 1.0
    for i in range(len(checkpoints) - 1):
        tA, tB = checkpoints[i], checkpoints[i+1]
        fA_crop = saved_frames[tA][200:950, 100:1820].astype(np.float32)
        fB_crop = saved_frames[tB][200:950, 100:1820].astype(np.float32)
        diff = float(np.mean(np.abs(fA_crop - fB_crop)))
        passed = diff >= threshold
        status = "PASS" if passed else "FAIL"
        results.append((tA, tB, diff, status))
        print(f"  visualDifference(T+{tA:02d}s, T+{tB:02d}s) = {diff:6.2f} (Threshold >= {threshold}) -> {status}")

    all_passed = all(r[3] == "PASS" for r in results)
    print(f"\n=======================================================")
    print(f"  CINEMATIC SIMULATION VERIFICATION: {'PASS' if all_passed else 'FAIL'}")
    print(f"=======================================================")
    return all_passed

if __name__ == "__main__":
    success = verify_cinematic_simulation()
    if not success:
        exit(1)
