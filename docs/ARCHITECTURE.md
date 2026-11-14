# AVIATO — Architecture Notes

## 1. System architecture

```text
+------------------------+       HTTP / JSON       +--------------------------+
| Browser                | <---------------------> | Node.js + Express        |
| HTML / CSS / JS        |                         |                          |
| Dashboard + Forms      |                         | Static files + REST API  |
+------------------------+                         +------------+-------------+
                                                               |
                                          +--------------------+------------------+
                                          |                                       |
                                  +-------v--------+                     +--------v-------+
                                  | flights[]      |                     | bookings[]     |
                                  | in-memory data |                     | in-memory data |
                                  +----------------+                     +----------------+
```

## 2. Main data entities

- **Flight:** id, flightNumber, airline, origin, destination, departure, arrival, gate, status, capacity.
- **Booking:** id, bookingReference, passengerName, email, flightId, seat, createdAt.
- **Passenger:** represented by the passenger name and email fields in a booking in this prototype.

## 3. Data flow — booking

1. Passenger/staff enters passenger details and selects a flight.
2. Browser sends `POST /api/bookings`.
3. Express validates required fields and confirms that the selected flight exists.
4. Server creates a booking reference and appends the booking to the in-memory collection.
5. Server responds with HTTP 201 and the booking details.
6. Browser displays the booking confirmation.

## 4. Status lifecycle

`Scheduled → Boarding → Departed → Landed`

A flight may also be marked `Delayed`. This demo allows an operator to update status manually. It does not infer operational status from live airport systems.

## 5. Limitations

The prototype has no authentication, persistent database, real airline integration, payment processing, live flight tracking or production security controls.
