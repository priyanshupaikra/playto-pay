# Playto Backend

A payout engine for Indian freelancers and agencies.

## Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Setup

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database URL

# Run migrations
python manage.py migrate

# Seed the database
python manage.py seed

# Start the server
python manage.py runserver
```

### Running Celery (required for payout processing)

```bash
# Start worker
celery -A playto worker --loglevel=info --concurrency=4

# Start beat (periodic tasks)
celery -A playto beat --loglevel=info
```

### Docker

```bash
docker-compose up -d
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/merchants/` | List all merchants |
| GET | `/api/v1/merchants/<id>/balance/` | Get merchant balance |
| GET | `/api/v1/merchants/<id>/ledger/` | Get ledger entries (paginated) |
| GET | `/api/v1/bank-accounts/?merchant_id=<id>` | List bank accounts |
| POST | `/api/v1/bank-accounts/?merchant_id=<id>` | Add bank account |
| DELETE | `/api/v1/bank-accounts/<id>/` | Remove bank account |
| POST | `/api/v1/payouts/?merchant_id=<id>` | Create payout |
| GET | `/api/v1/payouts/?merchant_id=<id>` | List payouts |
| GET | `/api/v1/payouts/<id>/` | Get payout detail |

## Testing

```bash
python manage.py test tests
```
