# Checksum Policy & Integrity Standard

1. **Purpose:** SHA-256 cryptographic hashes are recorded for every simulation output, elevation grid, and route file.
2. **Interpretation Boundary:**
   - **SHA-256 Proves:** Exact bitwise file integrity, non-corruption, and repeatable provenance from the execution environment.
   - **SHA-256 Does NOT Prove:** Physical correctness, real-world predictive validity, or hydraulic accuracy.
3. **No Fabricated Checksums:** If a checksum was not recorded during execution, it is explicitly cataloged as `NOT_RECORDED`.
