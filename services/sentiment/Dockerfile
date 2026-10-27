FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt && useradd -m app
COPY . .
ENV APP_ENV=production PORT=5050
USER app
EXPOSE 5050
CMD ["sh","-c","exec gunicorn app:app --bind 0.0.0.0:${PORT} --workers 2 --access-logfile -"]
