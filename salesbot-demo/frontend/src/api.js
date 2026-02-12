// src/api.js
const BASE = "http://localhost:8081/api";

export async function listServices() {
  const r = await fetch(`${BASE}/services`);
  return r.json();
}

export async function chat(messages, context) {
  const r = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, context }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function quote({ serviceIds, addOnIds, carSize = "medium", weekdayMorning = true }) {
  const r = await fetch(`${BASE}/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ serviceIds, addOnIds, carSize, weekdayMorning }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function saveBooking(payload) {
  const r = await fetch(`${BASE}/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
