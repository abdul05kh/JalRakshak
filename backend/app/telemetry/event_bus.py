import asyncio
from typing import Callable, List, Dict, Any

class AsyncEventBus:
    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = {}

    def subscribe(self, topic: str, callback: Callable):
        if topic not in self._subscribers:
            self._subscribers[topic] = []
        self._subscribers[topic].append(callback)

    async def publish(self, topic: str, data: Dict[str, Any]):
        if topic in self._subscribers:
            for cb in self._subscribers[topic]:
                if asyncio.iscoroutinefunction(cb):
                    await cb(data)
                else:
                    cb(data)
