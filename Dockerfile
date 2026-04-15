FROM python:3.9-slim
WORKDIR /app
COPY . .
RUN pip install flask pyTelegramBotAPI google-generativeai gunicorn
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app
