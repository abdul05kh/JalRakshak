import struct, os

def write_polygon_shapefile(filepath_no_ext, min_x, min_y, max_x, max_y):
    # Pure Python ESRI Shapefile Polygon Writer
    os.makedirs(os.path.dirname(filepath_no_ext), exist_ok=True)
    shp_path = filepath_no_ext + ".shp"
    shx_path = filepath_no_ext + ".shx"
    dbf_path = filepath_no_ext + ".dbf"
    prj_path = filepath_no_ext + ".prj"

    # Coordinates (clockwise loop)
    coords = [
        (min_x, min_y),
        (min_x, max_y),
        (max_x, max_y),
        (max_x, min_y),
        (min_x, min_y)
    ]
    n_pts = len(coords)

    # 1. SHP
    # Record content length in 16-bit words:
    # shape_type(4) + bbox(32) + num_parts(4) + num_points(4) + parts(4) + points(n_pts * 16)
    rec_bytes = 4 + 32 + 4 + 4 + 4 + (n_pts * 16)
    rec_words = rec_bytes // 2

    shp_header = struct.pack(
        ">IIIIIIIii dddddddd",
        9994, 0, 0, 0, 0, 0,
        50 + (4 + rec_words), # File length in words
        1000, 5, # Version, ShapeType=Polygon (5)
        min_x, min_y, max_x, max_y,
        0.0, 0.0, 0.0, 0.0 # Z, M
    )

    # Record header (Record number, Content length in words)
    rec_head = struct.pack(">II", 1, rec_words)
    # Record body
    rec_body = struct.pack(
        "<i dddd ii i",
        5, # Polygon
        min_x, min_y, max_x, max_y,
        1, n_pts, # 1 part, n points
        0 # part 0 starts at index 0
    )
    for x, y in coords:
        rec_body += struct.pack("<dd", x, y)

    with open(shp_path, "wb") as f:
        f.write(shp_header)
        f.write(rec_head)
        f.write(rec_body)

    # 2. SHX (Index)
    shx_words = 50 + 4 # 1 record = 8 bytes = 4 words
    shx_header = struct.pack(
        ">IIIIIIIii dddddddd",
        9994, 0, 0, 0, 0, 0,
        shx_words,
        1000, 5,
        min_x, min_y, max_x, max_y,
        0.0, 0.0, 0.0, 0.0
    )
    shx_rec = struct.pack(">II", 50, rec_words) # offset 50 words, length in words
    with open(shx_path, "wb") as f:
        f.write(shx_header)
        f.write(shx_rec)

    # 3. DBF
    with open(dbf_path, "wb") as f:
        # Header: version(3), yy, mm, dd, num_recs(1), header_bytes(65), rec_bytes(33)
        f.write(struct.pack("<BBBBIHH20s", 3, 26, 9, 24, 1, 65, 33, b'\x00'*20))
        # Field 1: Name (C, 32)
        f.write(struct.pack("<11scIBB14s", b"Name\x00\x00\x00\x00\x00\x00\x00", b'C', 0, 32, 0, b'\x00'*14))
        # Header terminator
        f.write(b'\r')
        # Record 1 (delete flag + 32 bytes)
        val = b"Tehri15kmReach".ljust(32, b' ')
        f.write(b' ' + val)
        # End of file
        f.write(b'\x1a')

    # 4. PRJ
    utm_wkt = 'PROJCS["WGS_1984_UTM_Zone_44N",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",81.0],PARAMETER["Scale_Factor",0.9996],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]'
    with open(prj_path, "w") as f:
        f.write(utm_wkt)

    print(f"Shapefile successfully created at {shp_path}")
    return shp_path

if __name__ == "__main__":
    write_polygon_shapefile(r"C:\HEC_Work\Tehri15km_Base\gis\perimeter", 255500.0, 3351000.0, 260500.0, 3364000.0)
