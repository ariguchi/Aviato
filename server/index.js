const express = require("express");
const path = require("path");
const { flights, bookings } = require("./data");

const app = express();
const PORT = process.env.PORT || 3000;
const VALID_STATUSES = ["Scheduled", "Boarding", "Departed", "Delayed", "Landed"];

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function bookingReference() {
  return "AVT" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "AVIATO API" });
});

app.get("/api/dashboard", (_req, res) => {
  const counts = VALID_STATUSES.reduce((acc, status) => {
    acc[status.toLowerCase()] = flights.filter(f => f.status === status).length;
    return acc;
  }, {});
  res.json({
    totalFlights: flights.length,
    totalBookings: bookings.length,
    delayedFlights: counts.delayed,
    boardingFlights: counts.boarding,
    scheduledFlights: counts.scheduled,
    statusCounts: counts,
    recentFlights: flights.slice(0, 5)
  });
});

app.get("/api/flights", (req, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();
  const status = String(req.query.status || "").trim().toLowerCase();
  const result = flights.filter(flight => {
    const matchesQuery = !q || [
      flight.flightNumber, flight.airline, flight.origin, flight.destination
    ].some(value => value.toLowerCase().includes(q));
    const matchesStatus = !status || flight.status.toLowerCase() === status;
    return matchesQuery && matchesStatus;
  });
  res.json(result);
});

app.post("/api/flights", (req, res) => {
  const { flightNumber, airline, origin, destination, departure, arrival, gate, status, capacity } = req.body || {};
  const required = [flightNumber, airline, origin, destination, departure, arrival, gate, status, capacity];
  if (required.some(value => value === undefined || value === null || String(value).trim() === "")) {
    return res.status(400).json({ error: "All flight fields are required." });
  }
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid flight status." });
  }
  if (!Number.isInteger(Number(capacity)) || Number(capacity) < 1) {
    return res.status(400).json({ error: "Capacity must be a positive whole number." });
  }
  if (flights.some(f => f.flightNumber.toLowerCase() === String(flightNumber).toLowerCase())) {
    return res.status(409).json({ error: "That flight number already exists." });
  }
  const flight = {
    id: nextId(flights), flightNumber: String(flightNumber).trim().toUpperCase(),
    airline: String(airline).trim(), origin: String(origin).trim(),
    destination: String(destination).trim(), departure, arrival,
    gate: String(gate).trim(), status, capacity: Number(capacity)
  };
  flights.push(flight);
  res.status(201).json(flight);
});

app.patch("/api/flights/:id/status", (req, res) => {
  const flight = flights.find(f => f.id === Number(req.params.id));
  if (!flight) return res.status(404).json({ error: "Flight not found." });
  const { status } = req.body || {};
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Choose a valid flight status." });
  }
  flight.status = status;
  res.json(flight);
});

app.get("/api/bookings", (_req, res) => {
  const result = bookings.map(booking => ({
    ...booking,
    flight: flights.find(f => f.id === booking.flightId) || null
  }));
  res.json(result);
});

app.post("/api/bookings", (req, res) => {
  const { passengerName, email, flightId, seat } = req.body || {};
  if (![passengerName, email, flightId, seat].every(v => v !== undefined && String(v).trim())) {
    return res.status(400).json({ error: "Passenger name, email, flight and seat are required." });
  }
  const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (!emailPattern.test(String(email))) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }
  const flight = flights.find(f => f.id === Number(flightId));
  if (!flight) return res.status(404).json({ error: "Selected flight was not found." });
  if (["Departed", "Landed"].includes(flight.status)) {
    return res.status(400).json({ error: "Bookings are closed for this flight." });
  }
  const seatTaken = bookings.some(b => b.flightId === flight.id && b.seat.toLowerCase() === String(seat).toLowerCase());
  if (seatTaken) return res.status(409).json({ error: "That seat is already booked on this flight." });

  const booking = {
    id: nextId(bookings), bookingReference: bookingReference(),
    passengerName: String(passengerName).trim(), email: String(email).trim(),
    flightId: flight.id, seat: String(seat).trim().toUpperCase(),
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  res.status(201).json({ ...booking, flight });
});

app.use("/api", (_req, res) => res.status(404).json({ error: "API route not found." }));

app.listen(PORT, () => {
  console.log(`AVIATO is running at http://localhost:${PORT}`);
});
