// src/pages/Booking.jsx
import React, { useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import { Calendar, Clock, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

function buildSlots(dateStr) {
  const slots = [];
  for (let h = 9; h <= 16; h++) {
    ["00", "30"].forEach((min) =>
      slots.push({ date: dateStr, time: `${String(h).padStart(2, "0")}:${min}` })
    );
  }
  return slots;
}

export default function Booking() {
  const { selectedSlot, setSelectedSlot } = useCart();
  const [day, setDay] = useState(() => new Date().toISOString().slice(0, 10));
  const slots = useMemo(() => buildSlots(day), [day]);

  function choose(s) {
    setSelectedSlot(s);
    // tell chatbot we picked a slot; it will ask to confirm booking
    window.dispatchEvent(new CustomEvent("chatbot:selectedSlot", { detail: s }));
  }

  function adjustDay(offset) {
    const d = new Date(day);
    d.setDate(d.getDate() + offset);
    setDay(d.toISOString().slice(0, 10));
  }

  const formattedDate = useMemo(() => {
    const d = new Date(day + "T00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [day]);

  const timeSlotsByPeriod = useMemo(() => {
    const morning = [];
    const afternoon = [];
    const evening = [];
    slots.forEach((s) => {
      const hour = parseInt(s.time.split(":")[0], 10);
      if (hour < 12) morning.push(s);
      else if (hour < 17) afternoon.push(s);
      else evening.push(s);
    });
    return { morning, afternoon, evening };
  }, [slots]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-green-700 bg-clip-text text-transparent mb-2">
            Pick Your Appointment
          </h1>
          <p className="text-gray-600">Choose a convenient date and time for your service</p>
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-xl border border-green-100 p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Select Date</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => adjustDay(-1)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex-1">
              <input
                type="date"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-medium"
              />
            </div>

            <button
              onClick={() => adjustDay(1)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="mt-3 text-center text-gray-600 font-medium">{formattedDate}</div>
        </div>

        {/* Time Slots */}
        <div className="bg-white rounded-xl border border-green-100 p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Available Time Slots</h2>
          </div>

          {/* Morning Slots */}
          {timeSlotsByPeriod.morning.length > 0 && (
            <div className="mb-6">
              <div className="text-sm font-medium text-gray-700 mb-3">
                Morning (9:00 AM - 12:00 PM)
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {timeSlotsByPeriod.morning.map((s) => {
                  const active =
                    selectedSlot &&
                    s.date === selectedSlot.date &&
                    s.time === selectedSlot.time;
                  return (
                    <button
                      key={`${s.date}_${s.time}`}
                      onClick={() => choose(s)}
                      className={`relative py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                        active
                          ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 shadow-md scale-105"
                          : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50 hover:scale-105"
                      }`}
                    >
                      {s.time}
                      {active && (
                        <CheckCircle2 className="w-4 h-4 text-green-600 absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Afternoon Slots */}
          {timeSlotsByPeriod.afternoon.length > 0 && (
            <div className="mb-6">
              <div className="text-sm font-medium text-gray-700 mb-3">
                Afternoon (12:00 PM - 5:00 PM)
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {timeSlotsByPeriod.afternoon.map((s) => {
                  const active =
                    selectedSlot &&
                    s.date === selectedSlot.date &&
                    s.time === selectedSlot.time;
                  return (
                    <button
                      key={`${s.date}_${s.time}`}
                      onClick={() => choose(s)}
                      className={`relative py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                        active
                          ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 shadow-md scale-105"
                          : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50 hover:scale-105"
                      }`}
                    >
                      {s.time}
                      {active && (
                        <CheckCircle2 className="w-4 h-4 text-green-600 absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Evening Slots */}
          {timeSlotsByPeriod.evening.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-3">
                Evening (5:00 PM onwards)
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {timeSlotsByPeriod.evening.map((s) => {
                  const active =
                    selectedSlot &&
                    s.date === selectedSlot.date &&
                    s.time === selectedSlot.time;
                  return (
                    <button
                      key={`${s.date}_${s.time}`}
                      onClick={() => choose(s)}
                      className={`relative py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                        active
                          ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 shadow-md scale-105"
                          : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50 hover:scale-105"
                      }`}
                    >
                      {s.time}
                      {active && (
                        <CheckCircle2 className="w-4 h-4 text-green-600 absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected Slot Summary */}
        {selectedSlot && (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 shadow-lg text-white">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Appointment Confirmed</h3>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-green-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{selectedSlot.date}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{selectedSlot.time}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
