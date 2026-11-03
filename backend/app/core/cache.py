from cachetools import TTLCache
from app.core.config import settings

# In-memory TTL Cache (max 100 entries, TTL defined by config)
ttl_cache = TTLCache(maxsize=100, ttl=settings.CACHE_TTL_SECONDS)


def get_cached(key: str):
    return ttl_cache.get(key)


def set_cached(key: str, value):
    ttl_cache[key] = value


def clear_cache():
    ttl_cache.clear()

