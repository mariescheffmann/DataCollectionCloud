FROM python:3.11-slim

WORKDIR /Web

COPY requirements.txt .
COPY .env .env
COPY Web /Web

RUN pip install --upgrade pip && pip install -r requirements.txt

CMD ["python", "main.py"]