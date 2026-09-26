import pytest
from backend.app.telemetry.event_bus import AsyncEventBus

@pytest.mark.anyio
async def test_event_bus_dispatch():
    bus = AsyncEventBus()
    received = []
    
    async def handler(data):
        received.append(data)
        
    bus.subscribe("INUNDATION_ALERT", handler)
    await bus.publish("INUNDATION_ALERT", {"cell_id": 402, "depth_m": 2.4})
    assert len(received) == 1
    assert received[0]["cell_id"] == 402
