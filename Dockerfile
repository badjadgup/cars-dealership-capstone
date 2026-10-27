FROM node:22-alpine AS frontend
WORKDIR /build
COPY server/frontend/package*.json ./
RUN npm ci
COPY server/frontend/ ./
RUN npm run build
FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=8000
WORKDIR /app
COPY server/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY server/ ./
COPY --from=frontend /build/dist ./frontend/dist
RUN python manage.py collectstatic --noinput && useradd -m app && mkdir -p /data && chown -R app:app /app /data
USER app
EXPOSE 8000
CMD ["sh","-c","python manage.py migrate --noinput && python manage.py seed_cars && exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT} --workers 1 --threads 4 --access-logfile -"]
