# rate_limiter.py

import time
import asyncio
from typing import Dict, List
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import logging

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limits: Dict[str, Dict[str, int]]):
        """
        Initialize the RateLimitMiddleware.

        :param app: The FastAPI application instance.
        :param limits: A dictionary defining rate limits per endpoint.
                       Format: {
                           "endpoint_path": {"limit": int, "window": int},
                           ...
                       }
        """
        super().__init__(app)
        self.limits = limits
        self.clients: Dict[str, Dict[str, List[float]]] = {}  # {endpoint: {ip: [timestamps]}}
        self.lock = asyncio.Lock()
        self.logger = logging.getLogger("RateLimitMiddleware")

    async def dispatch(self, request: Request, call_next):
        endpoint = request.url.path
        # Check if the endpoint has a rate limit
        if endpoint not in self.limits:
            return await call_next(request)

        limit = self.limits[endpoint]["limit"]
        window = self.limits[endpoint]["window"]

        client_ip = self.get_client_ip(request)
        current_time = time.time()

        async with self.lock:
            if endpoint not in self.clients:
                self.clients[endpoint] = {}
            if client_ip not in self.clients[endpoint]:
                self.clients[endpoint][client_ip] = []

            request_times = self.clients[endpoint][client_ip]

            # Remove timestamps outside the current window
            window_start = current_time - window
            while request_times and request_times[0] < window_start:
                request_times.pop(0)

            if len(request_times) >= limit:
                retry_after = window - (current_time - request_times[0])
                self.logger.warning(f"Rate limit exceeded for IP: {client_ip} on endpoint: {endpoint}")
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded. Try again in {int(retry_after)} seconds."
                )

            # Record the current request timestamp
            request_times.append(current_time)

        response = await call_next(request)
        return response

    def get_client_ip(self, request: Request) -> str:
        """
        Extract the client's IP address from the request.

        :param request: The incoming request.
        :return: The client's IP address as a string.
        """
        # Try to get the IP from the X-Forwarded-For header (if behind a proxy)
        x_forwarded_for = request.headers.get('x-forwarded-for')
        if x_forwarded_for:
            # X-Forwarded-For may contain multiple IPs, take the first one
            client_ip = x_forwarded_for.split(',')[0].strip()
        else:
            client_ip = request.client.host
        return client_ip
