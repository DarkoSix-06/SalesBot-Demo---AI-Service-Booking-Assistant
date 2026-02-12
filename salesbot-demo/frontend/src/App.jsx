// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Cart from "./pages/Cart";
import Booking from "./pages/Booking";
import Billing from "./pages/Billing";
import Checkout from "./pages/Checkout";
import Chatbot from "./components/Chatbot";
import { ShoppingCart, Menu, X, Zap } from "lucide-react";
import { useCart } from "./context/CartContext";

export default function App() {
  const loc = useLocation();
  const { items } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [loc.pathname]);

  const isActive = (path) => loc.pathname === path;
  const cartCount = Array.isArray(items) ? items.length : 0;

  return (
    <>
      {/* Top Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-white"
        } border-b border-green-100`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                CareCraft
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive("/")
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`}
              >
                Home
              </Link>
              <Link
                to="/services"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive("/services")
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`}
              >
                Services
              </Link>
              <Link
                to="/cart"
                className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive("/cart")
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Cart
                {cartCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                      isActive("/cart") ? "bg-white text-green-600" : "bg-green-600 text-white"
                    }`}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to="/booking"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive("/booking")
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`}
              >
                Booking
              </Link>
              <Link
                to="/billing"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive("/billing")
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`}
              >
                Billing
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg hover:bg-green-50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-green-100">
              <div className="flex flex-col gap-2">
                <Link
                  to="/"
                  className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/")
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-green-50"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/services"
                  className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/services")
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-green-50"
                  }`}
                >
                  Services
                </Link>
                <Link
                  to="/cart"
                  className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-between ${
                    isActive("/cart")
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-green-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Cart
                  </span>
                  {cartCount > 0 && (
                    <span
                      className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                        isActive("/cart") ? "bg-white text-green-600" : "bg-green-600 text-white"
                      }`}
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/booking"
                  className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/booking")
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-green-50"
                  }`}
                >
                  Booking
                </Link>
                <Link
                  to="/billing"
                  className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/billing")
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-green-50"
                  }`}
                >
                  Billing
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main */}
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </main>

      {/* Chatbot stays global */}
      <Chatbot currentPath={loc.pathname} />
    </>
  );
}
