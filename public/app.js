const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const state = { flights: [], bookings: [], dashboard: null };

function toast(message) {
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 2600);
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));
}
function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString([], { day: "2-digit", month: "short" });
}
function statusPill(status) {
  const key = status.toLowerCase();
  return `<span class="status-pill status-${key}">${escapeHtml(status)}</span>`;
}
async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}
function flightRow(f, includeAirline = false) {
  return `<tr>
    <td><span class="flight-code">${escapeHtml(f.flightNumber)}</span></td>
    ${includeAirline ? `<td>${escapeHtml(f.airline)}</td>` : ""}
    <td><span class="route">${escapeHtml(f.origin)} → ${escapeHtml(f.destination)}</span></td>
    <td>${formatTime(f.departure)}</td>
    ${includeAirline ? `<td>${formatTime(f.arrival)}</td>` : ""}
    <td>${escapeHtml(f.gate)}</td>
    <td>${statusPill(f.status)}</td>
    ${includeAirline ? `<td><select class="status-select" data-flight-id="${f.id}">
      ${["Scheduled","Boarding","Departed","Delayed","Landed"].map(s => `<option ${s===f.status?"selected":""}>${s}</option>`).join("")}
    </select></td>` : ""}
  </tr>`;
}
async function loadDashboard() {
  const data = await api("/api/dashboard");
  state.dashboard = data;
  $("#totalFlights").textContent = data.totalFlights;
  $("#totalBookings").textContent = data.totalBookings;
  $("#boardingFlights").textContent = data.boardingFlights;
  $("#delayedFlights").textContent = data.delayedFlights;
  $("#overviewFlights").innerHTML = data.recentFlights.map(f => flightRow(f)).join("");
  const statuses = [
    ["Scheduled", data.statusCounts.scheduled, "#315efb"],
    ["Boarding", data.statusCounts.boarding, "#159b72"],
    ["Departed", data.statusCounts.departed, "#3985b7"],
    ["Delayed", data.statusCounts.delayed, "#d98a1b"],
    ["Landed", data.statusCounts.landed, "#8064d8"]
  ];
  const max = Math.max(1, ...statuses.map(x => x[1]));
  $("#statusList").innerHTML = statuses.map(([name,count,color]) =>
    `<div class="status-row"><span>${name}</span><div class="bar"><span style="width:${count/max*100}%;background:${color}"></span></div><b>${count}</b></div>`
  ).join("");
}
async function loadFlights() {
  const q = encodeURIComponent($("#flightSearch")?.value || "");
  const status = encodeURIComponent($("#statusFilter")?.value || "");
  state.flights = await api(`/api/flights?q=${q}&status=${status}`);
  $("#allFlights").innerHTML = state.flights.length
    ? state.flights.map(f => flightRow(f, true)).join("")
    : `<tr><td colspan="8" class="empty">No flights match your filters.</td></tr>`;
  $("#flightCount").textContent = `Showing ${state.flights.length} flight(s)`;
  populateFlightOptions();
}
async function loadBookings() {
  state.bookings = await api("/api/bookings");
  $("#bookingTotal").textContent = `${state.bookings.length} RECORDS`;
  $("#allBookings").innerHTML = state.bookings.length ? state.bookings.map(b => `
    <tr><td><span class="flight-code">${escapeHtml(b.bookingReference)}</span></td>
    <td>${escapeHtml(b.passengerName)}<div class="muted">${escapeHtml(b.email)}</div></td>
    <td>${escapeHtml(b.flight?.flightNumber || "—")}</td>
    <td>${escapeHtml(b.flight?.origin || "—")} → ${escapeHtml(b.flight?.destination || "—")}</td>
    <td>${escapeHtml(b.seat)}</td><td>${formatDate(b.createdAt)}</td></tr>`).join("")
    : `<tr><td colspan="6" class="empty">No bookings have been created yet.</td></tr>`;
}
function populateFlightOptions() {
  const select = $("#bookingFlight");
  const available = state.flights.filter(f => !["Departed","Landed"].includes(f.status));
  select.innerHTML = available.map(f => `<option value="${f.id}">${escapeHtml(f.flightNumber)} · ${escapeHtml(f.origin)} → ${escapeHtml(f.destination)}</option>`).join("");
  if (!available.length) select.innerHTML = `<option value="">No bookable flights</option>`;
}
async function refreshAll() {
  await Promise.all([loadDashboard(), loadFlights(), loadBookings()]);
}
function showView(name) {
  $$(".view").forEach(v => v.classList.remove("active"));
  $$(".nav-item").forEach(v => v.classList.toggle("active", v.dataset.view === name));
  $(`#${name}View`).classList.add("active");
  $("#crumb").textContent = name === "overview" ? "Overview" : name === "flights" ? "Flight schedule" : "Bookings";
  $("#sidebar").classList.remove("open");
  if (name === "flights") loadFlights();
  if (name === "bookings") loadBookings();
}
function openModal(id) { $(id).classList.add("open"); }
function closeModals() { $$(".modal-backdrop").forEach(m => m.classList.remove("open")); }

$$(".nav-item").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.view)));
$$("[data-goto]").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.goto)));
$("#menuToggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
$("#quickAddBtn").addEventListener("click", () => openModal("#flightModal"));
$("#addFlightBtn").addEventListener("click", () => openModal("#flightModal"));
$("#newBookingBtn").addEventListener("click", () => openModal("#bookingModal"));
$$("[data-action='add-flight']").forEach(b => b.addEventListener("click", () => openModal("#flightModal")));
$$("[data-action='new-booking']").forEach(b => b.addEventListener("click", () => openModal("#bookingModal")));
$$("[data-action='manage-flights']").forEach(b => b.addEventListener("click", () => showView("flights")));
$$("[data-close]").forEach(b => b.addEventListener("click", closeModals));
$$(".modal-backdrop").forEach(backdrop => backdrop.addEventListener("click", e => {
  if (e.target === backdrop) closeModals();
}));
$("#flightSearch").addEventListener("input", loadFlights);
$("#statusFilter").addEventListener("change", loadFlights);

$("#allFlights").addEventListener("change", async e => {
  if (!e.target.matches(".status-select")) return;
  try {
    await api(`/api/flights/${e.target.dataset.flightId}/status`, {
      method: "PATCH", body: JSON.stringify({ status: e.target.value })
    });
    await refreshAll();
    toast("Flight status updated.");
  } catch (error) { toast(error.message); }
});

$("#flightForm").addEventListener("submit", async e => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const data = Object.fromEntries(form.entries());
  data.capacity = Number(data.capacity);
  try {
    await api("/api/flights", { method: "POST", body: JSON.stringify(data) });
    e.currentTarget.reset();
    closeModals();
    await refreshAll();
    toast("New flight added to the schedule.");
  } catch (error) { $("#flightError").textContent = error.message; }
});
$("#bookingForm").addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.currentTarget).entries());
  data.flightId = Number(data.flightId);
  try {
    const booking = await api("/api/bookings", { method: "POST", body: JSON.stringify(data) });
    e.currentTarget.reset();
    closeModals();
    await refreshAll();
    toast(`Booking confirmed · ${booking.bookingReference}`);
    showView("bookings");
  } catch (error) { $("#bookingError").textContent = error.message; }
});

$("#todayLabel").textContent = new Date().toLocaleDateString([], { weekday:"short", day:"numeric", month:"short", year:"numeric" });
refreshAll().catch(error => toast(`API connection failed: ${error.message}`));
