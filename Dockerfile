FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000

WORKDIR /app

# Install dependencies in a separate layer so application changes do not
# invalidate the dependency cache.
COPY requirements.txt .
RUN python -m pip install --no-cache-dir --requirement requirements.txt

# Do not run the web process as root.
RUN addgroup --system app && adduser --system --ingroup app app

COPY --chown=app:app app ./app
COPY --chown=app:app data ./data

USER app

EXPOSE 8000

# Render supplies PORT at runtime. Keep one process per container and scale
# horizontally with Render instances rather than competing worker processes.
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port \"${PORT:-8000}\""]