# AVIATO — Aviation Management System

AVIATO is a responsive aviation-operations management prototype. It adapts the lightweight architecture used by the AGNEON reference project: a static HTML/CSS/JavaScript frontend served by a Node.js + Express backend with JSON REST endpoints.

## Current modules

- **Operations dashboard:** flight count, scheduled flights, passengers and delayed-flight indicators.
- **Flight management:** view, search and filter flights; add a flight through the interface.
- **Flight status:** scheduled, boarding, departed, delayed and landed states.
- **Passenger booking:** create a booking against an available flight.
- **Booking lookup:** view booking reference, passenger, route and seat.
- **REST API:** health, dashboard summary, flights and bookings endpoints.

> This is an educational prototype. It uses in-memory arrays, so changes are reset when the server restarts. It is not connected to airline reservation networks, airport operational systems, payment gateways, live ADS-B feeds or real flight data. Sample flights and passengers are fictional.

## Tech stack

- Frontend: HTML5, CSS3, vanilla JavaScript
- Backend: Node.js 18+, Express
- Data: in-memory JavaScript arrays (demo only)

## Run locally

```bash
# 1. Open the AVIATO folder in a terminal
npm install

# 2. Start the server
npm start

# 3. Open in a browser
http://localhost:3000
```

For development with automatic server restart:

```bash
npm run dev
```

## API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | API health check |
| GET | `/api/dashboard` | Dashboard summary and recent flights |
| GET | `/api/flights` | List flights; optional `?q=` and `?status=` filters |
| POST | `/api/flights` | Add a flight |
| PATCH | `/api/flights/:id/status` | Update a flight status |
| GET | `/api/bookings` | List bookings |
| POST | `/api/bookings` | Create a passenger booking |

### Example: add a flight

```json
{
  "flightNumber": "AV204",
  "airline": "Aviato Air",
  "origin": "Delhi (DEL)",
  "destination": "Mumbai (BOM)",
  "departure": "2026-12-01T10:30:00",
  "arrival": "2026-12-01T12:45:00",
  "gate": "A12",
  "status": "Scheduled",
  "capacity": 180
}
```

### Example: create a booking

```json
{
  "passengerName": "Aarav Sharma",
  "email": "aarav@example.com",
  "flightId": 1,
  "seat": "12A"
}
```

## Project structure

```text
AVIATO/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── server/
│   ├── index.js
│   └── data.js
├── docs/
│   └── ARCHITECTURE.md
├── package.json
└── README.md
```

## Architecture

The browser loads the static frontend from Express. The frontend calls JSON API routes. The server validates input and updates in-memory collections. See `docs/ARCHITECTURE.md`.

## Future scope

- Persistent database (PostgreSQL/MySQL/MongoDB)
- Role-based login for administrator, airline staff and passenger
- Seat map and seat availability validation
- Cancellation, refund and ticket generation workflows
- Airport, aircraft, crew and maintenance management
- Live flight feeds and notifications
- Audit logs, automated tests and deployment configuration

## Academic note

AVIATO is a student mini-project prototype demonstrating basic software engineering concepts: modular design, client-server communication, REST APIs, input validation, state updates and testable workflows. Do not use it for real aviation operations.
