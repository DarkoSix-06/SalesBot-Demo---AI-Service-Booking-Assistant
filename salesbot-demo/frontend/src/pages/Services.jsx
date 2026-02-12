// src/pages/Services.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import { listServices } from "../api"; // GET /api/services -> [{id,name,basePrice,addOns:[{id,name,price}]}]
import { Plus, X, Package } from "lucide-react";

export default function Services() {
  const { addService, addAddOn } = useCart();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null); // selected service for add-on drawer

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listServices();
        if (!mounted) return;
        setServices(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("listServices failed:", e);
        setServices([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const onAddService = (svc) => {
    if (!svc) return;
    addService(svc);
    setSel(svc); // immediately open add-ons drawer for this service
  };

  const onAddAddOn = (serviceId, addOn) => {
    addAddOn(serviceId, addOn);
  };

  const cards = useMemo(() => {
    return (services || []).map((s) => (
      <div
        key={s.id}
        className="group rounded-xl border border-green-100 p-5 shadow-sm bg-white hover:shadow-lg hover:border-green-200 transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-green-600" />
          </div>
          {(s.addOns || []).length > 0 && (
            <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full font-medium">
              {s.addOns.length} add-ons
            </span>
          )}
        </div>
        <div className="font-semibold text-gray-900 text-lg mb-1">{s.name}</div>
        <div className="text-emerald-600 font-bold text-xl mb-4">
          LKR {Math.round(s.basePrice || 0).toLocaleString()}
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium hover:shadow-md hover:scale-105 transition-all duration-200"
            onClick={() => onAddService(s)}
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
          <button
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
            onClick={() => setSel(s)}
          >
            View Add-ons
          </button>
        </div>
      </div>
    ));
  }, [services]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30">
      {/* Decorative blobs */}
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse" />
          <div
            className="absolute -bottom-24 -left-24 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-green-700 bg-clip-text text-transparent mb-2">
              Our Services
            </h1>
            <p className="text-gray-600">Choose from our range of professional services</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-gray-500">Loading services…</div>
              </div>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500">No services available</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cards}
            </div>
          )}
        </div>
      </div>

      {/* Add-ons drawer/modal */}
      {sel && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="w-full sm:max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">{sel.name}</div>
                  <div className="text-green-50 text-sm mt-0.5">
                    Base Price: LKR {Math.round(sel.basePrice || 0).toLocaleString()}
                  </div>
                </div>
                <button
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  onClick={() => setSel(null)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="text-sm font-medium text-gray-700 mb-3">Available Add-ons</div>
              <div className="space-y-2 max-h-[50vh] overflow-auto">
                {(sel.addOns || []).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    No add-ons available for this service
                  </div>
                )}
                {(sel.addOns || []).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between border border-gray-200 rounded-lg p-3.5 hover:border-green-200 hover:bg-green-50/50 transition-all duration-200"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{a.name}</div>
                      <div className="text-sm text-emerald-600 font-semibold mt-0.5">
                        +LKR {Math.round(a.price || 0).toLocaleString()}
                      </div>
                    </div>
                    <button
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium hover:shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-1.5"
                      onClick={() => onAddAddOn(sel.id, a)}
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t flex justify-end">
                <button
                  className="px-6 py-2.5 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setSel(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
