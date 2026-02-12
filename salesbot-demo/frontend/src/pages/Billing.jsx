// src/pages/Billing.jsx
import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { quote, saveBooking } from "../api";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  Tag,
  CheckCircle,
  ShoppingBag,
  Calendar,
  Clock,
} from "lucide-react";

export default function Billing() {
  const nav = useNavigate();
  const { items, serviceIds, allAddOnIds, selectedSlot, contact, setContact, resetAll } = useCart();
  const [totals, setTotals] = useState({ subtotal: 0, discount: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      if (serviceIds.length === 0) {
        setTotals({ subtotal: 0, discount: 0, total: 0 });
        return;
      }
      const q = await quote({ serviceIds, addOnIds: allAddOnIds, weekdayMorning: true });
      setTotals(q);
    }
    load();
  }, [serviceIds, allAddOnIds]);

  const isFormValid = contact.name && contact.email && contact.mobile && selectedSlot;

  async function onPay() {
    setLoading(true);
    try {
      const res = await saveBooking({
        bookingId: null,
        serviceIds,
        addOnIds: allAddOnIds,
        date: selectedSlot?.date,
        time: selectedSlot?.time,
        name: contact.name,
        email: contact.email,
        mobile: contact.mobile,
        address: contact.address,
        subtotal: totals.subtotal,
        discount: totals.discount,
        total: totals.total,
        notes: "via billing page",
      });

      setSuccess(true);

      // Tell chatbot that payment is done
      window.dispatchEvent(
        new CustomEvent("chatbot:addMessage", {
          detail: {
            role: "bot",
            content: `Thanks **${contact.name || "there"}**! Your booking **#${res.bookingId}** for **${selectedSlot?.date} ${selectedSlot?.time}** is confirmed.\nTotal paid: **LKR ${Math.round(
              totals.total || 0
            ).toLocaleString()}**. Need anything else?`,
          },
        })
      );

      // Optionally clear + navigate
      // resetAll();
      // nav("/");
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error("Payment failed:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-green-700 bg-clip-text text-transparent mb-2">
            Billing & Payment
          </h1>
          <p className="text-gray-600">Complete your booking with payment details</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl border border-green-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="John Doe"
                      value={contact.name}
                      onChange={(e) => setContact((v) => ({ ...v, name: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+94 77 123 4567"
                      value={contact.mobile}
                      onChange={(e) => setContact((v) => ({ ...v, mobile: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="john@example.com"
                      value={contact.email}
                      onChange={(e) => setContact((v) => ({ ...v, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="123 Main Street, Colombo"
                      value={contact.address}
                      onChange={(e) => setContact((v) => ({ ...v, address: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-green-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
              </div>

              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Secure Payment</span> — Your payment information is encrypted and secure
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-green-100 p-6 shadow-sm sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

              {/* Appointment Details */}
              {selectedSlot && (
                <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{selectedSlot.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{selectedSlot.time}</span>
                  </div>
                </div>
              )}

              {/* Services */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {items.length} Service{items.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    LKR {Math.round(totals.subtotal || 0).toLocaleString()}
                  </span>
                </div>

                {totals.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      Discount
                    </span>
                    <span className="font-medium">
                      -LKR {Math.round(totals.discount).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    LKR {Math.round(totals.total || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={onPay}
                disabled={!isFormValid || loading || success}
                className={`w-full py-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                  !isFormValid || loading
                    ? "bg-gray-300 cursor-not-allowed"
                    : success
                    ? "bg-green-600"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:scale-105"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Payment Successful!
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Confirm & Pay
                  </>
                )}
              </button>

              {!isFormValid && (
                <p className="text-xs text-gray-500 text-center mt-3">Please fill all required fields</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
