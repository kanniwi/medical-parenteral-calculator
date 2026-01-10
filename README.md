# Medical Parenteral Calculator - Setup Guide

## Prerequisites

- Node.js 18+
- Python 3.10+ (for monitoring service)
- PostgreSQL 14+
- Docker Desktop (for Prometheus and Grafana)
- Expo CLI

## Quick Start

### 1. Database Setup

Ensure PostgreSQL is running on localhost:5432

Create database:
```bash
createdb calculator_db
```

Or using psql:
```sql
CREATE DATABASE calculator_db;
```

### 2. Backend Server Setup

Navigate to server directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

Configure environment variables in `server/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calculator_db
DB_USER=postgres
DB_PASSWORD=postgres

PORT=3001
NODE_ENV=development

JWT_SECRET=medical_calculator_secret_key_2024_change_in_production
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:8081,exp://172.20.10.2:8081
```

Run database migrations:
```bash
npm run migrate
npm run migrate:metrics
```

Start the server:
```bash
npm run dev
```

Server will run on: http://localhost:3001

Verify server is running:
```bash
curl http://localhost:3001/health
```

### 3. Monitoring Service Setup

Navigate to monitoring directory:
```bash
cd monitoring
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Configure environment variables in `monitoring/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calculator_db
DB_USER=postgres
DB_PASSWORD=postgres
```

Start the monitoring service:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Monitoring service will run on: http://127.0.0.1:8000

Verify monitoring is running:
```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/metrics
```

### 4. Prometheus and Grafana Setup

Navigate to monitoring directory:
```bash
cd monitoring
```

Start Prometheus and Grafana with Docker Compose:
```bash
docker-compose up -d
```

Services will be available at:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

Grafana default credentials:
- Username: admin
- Password: admin

Stop services:
```bash
docker-compose down
```

View logs:
```bash
docker-compose logs -f
```

### 5. Mobile App Setup

Navigate to project root:
```bash
cd ..
```

Install dependencies:
```bash
npm install
```

Update API URL in `utils/api.ts` with your computer's local IP:
```typescript
const API_BASE_URL = __DEV__
  ? 'http://YOUR_LOCAL_IP:3001/api'  // Replace with your IP
  : 'https://your-production-server.com/api';
```

Start the mobile app:
```bash
npm start
```

Or:
```bash
npx expo start
```

Options:
- Press 'i' for iOS simulator
- Press 'a' for Android emulator
- Scan QR code with Expo Go app on physical device

## Service URLs Summary

### Backend
- Server API: http://localhost:3001
- Health check: http://localhost:3001/health

### Monitoring
- Monitoring API: http://127.0.0.1:8000
- Metrics endpoint: http://127.0.0.1:8000/metrics
- Health check: http://127.0.0.1:8000/health

### Observability
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000
  - Username: admin
  - Password: admin
  - Dashboard: "Medical Calculator Monitoring"

### Mobile App
- Metro bundler: http://localhost:8081

## API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile (requires auth)
```

### Calculations
```
POST   /api/calculations (optional auth)
GET    /api/calculations (requires auth)
DELETE /api/calculations/:id (requires auth)
DELETE /api/calculations (requires auth)
```

### Metrics
```
GET  /api/metrics/summary (requires auth)
GET  /api/metrics/active-users (requires auth)
GET  /api/metrics/calculations (requires auth)
GET  /api/metrics/performance (requires auth)
POST /api/metrics/cleanup (requires auth)
```

## Development Workflow

1. Start PostgreSQL database
2. Start backend server: `cd server && npm run dev`
3. Start monitoring service: `cd monitoring && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`
4. Start Prometheus/Grafana: `cd monitoring && docker-compose up -d`
5. Start mobile app: `npm start`

## Viewing Metrics

1. Open Grafana: http://localhost:3000
2. Login with admin/admin
3. Navigate to Dashboards
4. Select "Medical Calculator Monitoring"
5. View real-time metrics:
   - Total calculations by user type
   - Average operation duration
   - User activity
   - Performance metrics

## Troubleshooting

### Database Connection Failed
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env` files
- Run migrations: `npm run migrate`

### Backend Server Not Starting
- Check port 3001 is not in use
- Verify database connection
- Check logs for errors

### Monitoring Service Not Starting
- Check port 8000 is not in use
- Verify Python dependencies installed
- Check database connection

### Prometheus Cannot Scrape Metrics
- Ensure monitoring service is running on port 8000
- Check `prometheus.yml` configuration
- Verify Docker can access `host.docker.internal`

### Mobile App Cannot Connect to Server
- Update IP address in `utils/api.ts`
- Ensure server is running on port 3001
- Check CORS_ORIGIN in `server/.env`
- Mobile device must be on same network

### Grafana Shows No Data
- Verify Prometheus is scraping metrics: http://localhost:9090/targets
- Check monitoring service is running
- Ensure database has data
- Verify time range on dashboard

## Database Schema

### Main Tables
- `users` - User accounts
- `calculations` - Calculation history

### Metrics Tables
- `calculation_metrics` - Hourly calculation statistics
- `performance_metrics` - Operation performance data
- `user_activity` - User activity tracking

## Production Notes

Before deploying to production:

1. Change all default passwords and secrets
2. Set NODE_ENV=production
3. Use secure HTTPS endpoints
4. Restrict CORS to specific origins
5. Set up proper database backups
6. Configure firewall rules
7. Use environment-specific .env files
8. Enable rate limiting on API endpoints

## License

MIT
