from cachetools import TTLCache
from fastapi import Request, HTTPException

# 15-minute window, max 1000 tracked IPs in memory
_rate_cache: TTLCache = TTLCache(maxsize=1000, ttl=900)


class IPRateLimiter:
    def __init__(self, max_calls: int = 3):
        self.max_calls = max_calls

    def check(self, request: Request) -> None:
        client_host = request.client.host if request.client else "127.0.0.1"
        count = _rate_cache.get(client_host, 0)
        if count >= self.max_calls:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please wait before submitting again."
            )
        _rate_cache[client_host] = count + 1

    @staticmethod
    def reset() -> None:
        _rate_cache.clear()
