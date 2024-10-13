# rate_limiter.py

import time
from typing import Dict, List
import asyncio
from fastapi import HTTPException, Request
from functools import wraps


class RateLimiter:
    def __init__(self):
        # Stores request timestamps for each IP
        self.clients: Dict[str, List[float]] = {}
        # Lock to ensure thread safety
        self.lock = asyncio.Lock()

    async def is_allowed(self, client_ip: str, limit: int, window: int) -> bool:
        """
        Check if the client is allowed to make a request.

        :param client_ip: The IP address of the client.
        :param limit: Maximum number of allowed requests.
        :param window: Time window in seconds.
        :return: True if allowed, False otherwise.
        """
        current_time = time.time()
        async with self.lock:
            if client_ip not in self.clients:
                self.clients[client_ip] = []

            # Filter out timestamps outside the current window
            window_start = current_time - window
            request_times = [timestamp for timestamp in self.clients[client_ip] if timestamp > window_start]
            self.clients[client_ip] = request_times

            if len(request_times) >= limit:
                return False

            # Add the current request timestamp
            self.clients[client_ip].append(current_time)
            return True

    def get_client_ip(self, request: Request) -> str:
        """
        Extract the client's IP address from the request.

        :param request: The incoming request.
        :return: The client's IP address as a string.
        """
        # Try to get the IP from the X-Forwarded-For header (if behind a proxy)
        x_forwarded_for = request.headers.get('X-Forwarded-For')
        if x_forwarded_for:
            # X-Forwarded-For may contain multiple IPs, take the first one
            client_ip = x_forwarded_for.split(',')[0].strip()
        else:
            client_ip = request.client.host
        return client_ip

    def limit(self, limit: int, window: int):
        """
        Decorator to apply rate limiting to endpoints.

        :param limit: Maximum number of allowed requests.
        :param window: Time window in seconds.
        """
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                request: Request = kwargs.get('request')
                if not request:
                    # If 'request' is not a keyword argument, try to extract it from args
                    for arg in args:
                        if isinstance(arg, Request):
                            request = arg
                            break
                if not request:
                    raise HTTPException(status_code=400, detail="Request object not found.")

                client_ip = self.get_client_ip(request)
                allowed = await self.is_allowed(client_ip, limit, window)
                if not allowed:
                    raise HTTPException(
                        status_code=429,
                        detail=f"Rate limit exceeded. Try again in {window} seconds."
                    )
                return await func(*args, **kwargs)
            return wrapper
        return decorator
