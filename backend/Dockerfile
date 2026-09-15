FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV DJANGO_SECRET_KEY=dummy-key-for-build
ENV DEBUG=True
RUN python manage.py collectstatic --noinput || true
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:7860"]
