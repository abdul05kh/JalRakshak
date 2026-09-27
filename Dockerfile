# JalRakshak Backend — Production Container
# Deployment target: Google Cloud Run (Firebase + Cloud Run architecture)
#
# Build:
#   docker build -t jalrakshak-backend .
#
# Run locally (with Tehri HDF artifacts):
#   docker run -p 8000:8000 \
#     -e REAL_HECRAS_HDF_PATH=/app/artifacts/hecras/BaldEagleDamBrk.p05.hdf \
#     -v /path/to/your/artifacts:/app/artifacts \
#     jalrakshak-backend
#
# In Cloud Run, set REAL_HECRAS_HDF_PATH via --set-env-vars or Secret Manager.
# The primary Tehri Gate 3B HDF artifacts are bundled inside the image under
# /app/artifacts/hecras/tehri_gate3b/ at build time.

FROM python:3.12-slim

# System dependencies for rasterio (GDAL), h5py (HDF5), and numpy
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgdal-dev \
    libhdf5-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY backend/ ./backend/
COPY data/ ./data/

# Copy precomputed HEC-RAS artifacts (Tehri Gate 3B scenarios)
# These are the primary authoritative inputs for the prototype.
COPY artifacts/ ./artifacts/

# Expose FastAPI port
EXPOSE 8000

# Cloud Run injects PORT; uvicorn binds to it.
# REAL_HECRAS_HDF_PATH is optional — if unset, only Tehri Gate 3B scenarios load.
CMD ["sh", "-c", "python -m uvicorn backend.app.main:app --host 0.0.0.0 --port {PORT:-8000}"]
