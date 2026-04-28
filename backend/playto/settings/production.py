"""
Production settings — extends base.
"""
from .base import *  # noqa: F401,F403

DEBUG = False

# Strict CORS in production — only configured origins
CORS_ALLOW_ALL_ORIGINS = False

# Security hardening
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = 'DENY'
