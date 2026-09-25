"""
Gate 2 Result Forensics, Comparison & JalRakshak Adapter Ingestion
"""

import os
import sys
import hashlib
import json
import numpy as np
import h5py

def get_file_info(filepath):
    if not os.path.exists(filepath):
        return None
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    stat = os.stat(filepath)
    return {
        "path": filepath,
        "size_bytes": stat.st_size,
        "sha256": h.hexdigest(),
        "mtime": stat.st_mtime
    }

def compare_runs(dir1=r"C:\HEC_Work\TehriExecutionSmokeTest_Run1", dir2=r"C:\HEC_Work\TehriExecutionSmokeTest_Run2"):
    print("=== PHASE 0 & 14: INPUTS AND RUN COMPARISON ===")
    files_to_check = [
        "TehriSmokeTest.prj",
        "TehriSmokeTest.g01",
        "TehriSmokeTest.u01",
        "TehriSmokeTest.p01",
        "TehriSmokeTest.rasmap",
        os.path.join("Terrain", "TehriSmokeTerrain.tif"),
        os.path.join("Terrain", "TehriSmokeTerrain.prj"),
        os.path.join("Terrain", "TehriSmokeTerrain.hdf")
    ]
    
    input_manifest = {}
    for f in files_to_check:
        info1 = get_file_info(os.path.join(dir1, f))
        info2 = get_file_info(os.path.join(dir2, f))
        input_manifest[f] = {
            "run1": info1,
            "run2": info2,
            "hash_match": info1["sha256"] == info2["sha256"] if info1 and info2 else False
        }
        print(f"Input {f:40s} Run1 SHA: {info1['sha256'][:12]}... Run2 SHA: {info2['sha256'][:12]}... Match: {input_manifest[f]['hash_match']}")
        
    print("\n=== OUTPUT RESULT COMPARISON ===")
    out_hdf1 = os.path.join(dir1, "TehriSmokeTest.p01.hdf")
    out_hdf2 = os.path.join(dir2, "TehriSmokeTest.p01.hdf")
    
    res1_info = get_file_info(out_hdf1)
    res2_info = get_file_info(out_hdf2)
    print(f"Run 1 Result HDF5: size={res1_info['size_bytes']} SHA256={res1_info['sha256']}")
    print(f"Run 2 Result HDF5: size={res2_info['size_bytes']} SHA256={res2_info['sha256']}")
    print(f"Byte-for-byte SHA256 Match: {res1_info['sha256'] == res2_info['sha256']}")
    
    with h5py.File(out_hdf1, 'r') as h1, h5py.File(out_hdf2, 'r') as h2:
        # Check numerical equality of datasets
        numerical_diffs = []
        metadata_diffs = []
        
        def compare_ds(name):
            if isinstance(h1[name], h5py.Dataset):
                arr1 = h1[name][:]
                arr2 = h2[name][:]
                if arr1.dtype != arr2.dtype:
                    numerical_diffs.append((name, "dtype mismatch", str(arr1.dtype), str(arr2.dtype)))
                elif arr1.shape != arr2.shape:
                    numerical_diffs.append((name, "shape mismatch", str(arr1.shape), str(arr2.shape)))
                else:
                    if np.issubdtype(arr1.dtype, np.number):
                        if arr1.size > 0:
                            max_diff = np.nanmax(np.abs(arr1 - arr2))
                            if max_diff > 1e-6:
                                numerical_diffs.append((name, "numeric difference", float(max_diff)))
                    else:
                        if not np.array_equal(arr1, arr2):
                            metadata_diffs.append((name, "string/timestamp difference", str(arr1[:2]) if arr1.size > 0 else ""))
        
        h1.visit(compare_ds)
        print(f"Total Dataset Comparisons: Numeric Differences={len(numerical_diffs)}, Metadata Differences={len(metadata_diffs)}")
        if len(numerical_diffs) == 0:
            print("HYDRAULIC NUMERICAL RESULTS ARE 100% IDENTICAL ACROSS RUN 1 AND RUN 2.")
            
    return input_manifest, res1_info, res2_info

def test_jalrakshak_adapter(hdf_path=r"C:\HEC_Work\TehriExecutionSmokeTest_Run1\TehriSmokeTest.p01.hdf"):
    print("\n=== PHASE 15: JALRAKSHAK ADAPTER INGESTION ===")
    sys.path.insert(0, r"d:\projects\JalRakshak")
    from backend.app.domain.hecras_adapter import HecRasHdfAdapter
    
    adapter = HecRasHdfAdapter(hdf_path)
    metadata = adapter.inspect_metadata()
    print("Adapter Read-Only Inspection Metadata:")
    print(json.dumps(metadata, indent=2))
    
    summary = adapter.get_hydraulic_summary()
    print("Adapter Hydraulic Summary:")
    print(json.dumps(summary, indent=2))
    
    return metadata, summary

if __name__ == "__main__":
    compare_runs()
    test_jalrakshak_adapter()
