def test_safety_buffer_subtraction():
    arrival_sec = 3600.0
    traversal_sec = 759.0
    buffer_sec = 180.0
    
    deadline = arrival_sec - traversal_sec - buffer_sec
    assert deadline == 2661.0
