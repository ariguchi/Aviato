const flights = [
  {
    id: 1, flightNumber: "AV101", airline: "Aviato Air",
    origin: "Delhi (DEL)", destination: "Mumbai (BOM)",
    departure: "2026-11-14T09:30:00", arrival: "2026-11-14T11:40:00",
    gate: "A12", status: "Boarding", capacity: 180
  },
  {
    id: 2, flightNumber: "AV208", airline: "Aviato Air",
    origin: "Bengaluru (BLR)", destination: "Delhi (DEL)",
    departure: "2026-11-14T10:15:00", arrival: "2026-11-14T13:05:00",
    gate: "B04", status: "Scheduled", capacity: 186
  },
  {
    id: 3, flightNumber: "AV315", airline: "Aviato Connect",
    origin: "Mumbai (BOM)", destination: "Goa (GOI)",
    departure: "2026-11-14T11:00:00", arrival: "2026-11-14T12:15:00",
    gate: "C07", status: "Delayed", capacity: 150
  },
  {
    id: 4, flightNumber: "AV422", airline: "Aviato Air",
    origin: "Hyderabad (HYD)", destination: "Kolkata (CCU)",
    departure: "2026-11-14T12:20:00", arrival: "2026-11-14T14:45:00",
    gate: "A03", status: "Scheduled", capacity: 180
  },
  {
    id: 5, flightNumber: "AV509", airline: "Aviato Connect",
    origin: "Chennai (MAA)", destination: "Bengaluru (BLR)",
    departure: "2026-11-14T08:10:00", arrival: "2026-11-14T09:15:00",
    gate: "D02", status: "Departed", capacity: 120
  },
  {
    id: 6, flightNumber: "AV611", airline: "Aviato Air",
    origin: "Delhi (DEL)", destination: "Dubai (DXB)",
    departure: "2026-11-14T14:00:00", arrival: "2026-11-14T17:10:00",
    gate: "E11", status: "Scheduled", capacity: 240
  }
];

const bookings = [
  {
    id: 1, bookingReference: "AVT7K2P", passengerName: "Ishita Mehra",
    email: "ishita@example.com", flightId: 1, seat: "12A",
    createdAt: "2026-11-13T16:20:00.000Z"
  },
  {
    id: 2, bookingReference: "AVT4M8Q", passengerName: "Kabir Rao",
    email: "kabir@example.com", flightId: 2, seat: "08C",
    createdAt: "2026-11-13T17:05:00.000Z"
  },
  {
    id: 3, bookingReference: "AVT9N3R", passengerName: "Meera Kapoor",
    email: "meera@example.com", flightId: 6, seat: "21F",
    createdAt: "2026-11-13T18:10:00.000Z"
  }
];

module.exports = { flights, bookings };
