// src/pages/Cart.jsx
import React, { useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Calendar } from "lucide-react";

export default function Cart() {
  const { items, subtotal, removeService, removeAddOn } = useCart();
  const nav = useNavigate();

  const hasItems = Array.isArray(items) && items.length > 0;

  const rows = useMemo(() => {
    if (!hasItems) return null;
    return items.map((it) => {
      const base = Math.round(it.price || 0);
      const addOns = (it.addOnIds || []).map((id) => it.addOns?.[id]).filter(Boolean);
      const addOnsTotal = addOns.reduce((acc, a) => acc + Math.round(a.price || 0), 0);
      const itemTotal = base + addOnsTotal;

      return (
        <div
          key={it.serviceId}
          className="rounded-xl border border-green-100 p-5 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-semibold text-gray-900 text-lg">{it.name}</div>
              <div className="text-sm text-gray-600 mt-1">Base: LKR {base.toLocaleString()}</div>
            </div>
            <button
              className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              onClick={() => removeService(it.serviceId)}
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>

          {addOns.length > 0 && (
            <div className="mt-3 pl-4 border-l-2 border-green-200">
              <div className="text-sm font-medium text-gray-700 mb-2">Add-ons</div>
              <div className="space-y-2">
                {addOns.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between text-sm bg-green-50/50 rounded-lg p-2"
                  >
                    <span className="text-gray-700">{a.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-emerald-600">
                        +LKR {Math.round(a.price || 0).toLocaleString()}
                      </span>
                      <button
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                        onClick={() => removeAddOn(it.serviceId, a.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-700 flex justify-between items-center pt-2 border-t border-green-100">
                <span>Add-ons total:</span>
                <span className="font-semibold text-emerald-600">
                  LKR {addOnsTotal.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm text-gray-600">Item total:</span>
            <span className="font-bold text-gray-900">LKR {itemTotal.toLocaleString()}</span>
          </div>
        </div>
      );
    });
  }, [items, hasItems, removeService, removeAddOn]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-green-700 bg-clip-text text-transparent mb-2">
            Your Cart
          </h1>
          <p className="text-gray-600">Review your services before booking</p>
        </div>

        {!hasItems ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-green-600" />
            </div>
            <div className="text-gray-600 mb-4">Your cart is empty</div>
            <button
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:shadow-md hover:scale-105 transition-all duration-200 inline-flex items-center gap-2"
              onClick={() => nav("/services")}
            >
              <Plus className="w-4 h-4" />
              Browse Services
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">{rows}</div>

            <div className="rounded-xl border border-green-200 bg-gradient-to-br from-white to-green-50/50 p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg text-gray-700">Subtotal:</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  LKR {Math.round(subtotal || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="flex-1 px-5 py-3 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2"
                  onClick={() => nav("/services")}
                >
                  <Plus className="w-4 h-4" />
                  Add More Services
                </button>
                <button
                  className="flex-1 px-5 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  onClick={() => nav("/booking")}
                >
                  <Calendar className="w-4 h-4" />
                  Choose Time & Book
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
