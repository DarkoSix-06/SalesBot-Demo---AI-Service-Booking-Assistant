// src/components/Chatbot.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chat } from "../api";
import { useCart } from "../context/CartContext";
import { MessageCircle, X, RefreshCw, Send, Sparkles, Plus, Check } from "lucide-react";

export default function Chatbot({ currentPath = "" }) {
  const nav = useNavigate();
  const { items, serviceIds, allAddOnIds, addService, addAddOn, selectedSlot, setSelectedSlot, subtotal } = useCart();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", content: "Hi! Good day, how can I help you?" }]);
  const [quick, setQuick] = useState([
    { label: "Show services", value: "show services" },
    { label: "Car Wash", value: "car wash" },
    { label: "Oil Change", value: "oil change" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAskAddOns, setPendingAskAddOns] = useState(null); // { serviceId, options: [...] }

  // Receive external events
  useEffect(() => {
    function onExternalMessage(e) {
      const m = e.detail;
      if (!m) return;
      setMessages((prev) => [...prev, m]);
      setOpen(true);
    }
    function onSlotSelected(e) {
      const s = e.detail;
      if (!s) return;
      setMessages((m) => [
        ...m,
        { role: "bot", content: `Got it — **${s.date}${s.time ? " " + s.time : ""}**. Ready to confirm your booking?` },
      ]);
      setQuick([
        { label: "Confirm booking", value: "confirm booking" },
        { label: "Change time", value: "change time" },
      ]);
      setOpen(true);
    }
    window.addEventListener("chatbot:addMessage", onExternalMessage);
    window.addEventListener("chatbot:selectedSlot", onSlotSelected);
    return () => {
      window.removeEventListener("chatbot:addMessage", onExternalMessage);
      window.removeEventListener("chatbot:selectedSlot", onSlotSelected);
    };
  }, []);

  const scrollRef = useRef(null);
  useEffect(() => {
    if (open && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [open, messages, isTyping, pendingAskAddOns]);

  const bubbleHtml = (text) => ({ __html: String(text || "").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>") });

  async function send(text) {
    const trimmed = String(text || "").trim();
    if (!trimmed) return;

    const newMsgs = [...messages, { role: "user", content: trimmed }];
    setMessages(newMsgs);
    setQuick([]);
    setInput("");
    setIsTyping(true);

    const ctx = {
      cart: serviceIds,
      addOnIds: allAddOnIds,
      selectedSlot: selectedSlot || null,
      subtotal,
      page: currentPath,
    };

    try {
      const payload = newMsgs.map((m) => ({
        role: m.role === "bot" ? "assistant" : m.role,
        content: String(m.content ?? ""),
      }));

      const resp = await chat(payload, ctx);
      const replyText = resp?.reply || "Okay.";
      const nextQuick = Array.isArray(resp?.quickReplies) ? resp.quickReplies : [];
      const actions = resp?.actions || {};

      if (actions.askAddOns?.serviceId && Array.isArray(actions.askAddOns.options)) {
        setPendingAskAddOns({ serviceId: actions.askAddOns.serviceId, options: actions.askAddOns.options });
      } else setPendingAskAddOns(null);

      if (actions.navigate) setTimeout(() => nav(String(actions.navigate)), 80);

      if (actions.selectedSlot && typeof actions.selectedSlot === "object") {
        const slot = actions.selectedSlot;
        if (slot.date || slot.time) setSelectedSlot({ date: slot.date, time: slot.time });
      }

      setMessages((m) => [...m, { role: "bot", content: replyText, rec: actions.recommend || [] }]);
      setQuick(nextQuick);
    } catch (err) {
      console.error("chat error", err);
      setMessages((m) => [...m, { role: "bot", content: "Network error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  }

  function addRecommendedService(id) {
    addService({ id, name: id, basePrice: 0, addOns: [] });
    setMessages((m) => [...m, { role: "bot", content: `Added **${id}** to your cart. Add add-ons?` }]);
    setQuick([
      { label: "Add add-ons", value: "add-ons" },
      { label: "Continue", value: "continue" },
    ]);
  }

  function handleReset() {
    setMessages([{ role: "bot", content: "Hi! Good day, how can I help you?" }]);
    setQuick([
      { label: "Show services", value: "show services" },
      { label: "Car Wash", value: "car wash" },
      { label: "Oil Change", value: "oil change" },
    ]);
    setPendingAskAddOns(null);
  }

  function Bubble({ m }) {
    const isBot = m.role === "bot";
    return (
      <div className={`mb-3 ${isBot ? "text-left" : "text-right"}`} style={{ animation: "fadeIn 0.3s ease-in" }}>
        <div
          className={`inline-block px-4 py-2.5 rounded-2xl shadow-sm ${
            isBot
              ? "bg-white border border-green-100 text-gray-900"
              : "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
          }`}
          style={{ maxWidth: "80%" }}
        >
          <div dangerouslySetInnerHTML={bubbleHtml(m.content)} className="text-sm leading-relaxed" />
          {Array.isArray(m.rec) && m.rec.length > 0 && (
            <div className="mt-3 space-y-2">
              {m.rec.map((r, i) => (
                <div key={`${r.id}-${i}`} className="border border-green-100 rounded-lg p-3 bg-green-50/50">
                  <div className="text-sm font-medium text-gray-900 mb-2">{r.id}</div>
                  <button
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-medium hover:shadow-md transition-all duration-200"
                    onClick={() => addRecommendedService(r.id)}
                  >
                    <Plus className="w-3 h-3" />
                    Add to cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Launcher Button */}
      {!open && (
        <button
          className="fixed right-4 bottom-4 w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl z-[9998] hover:scale-110 transition-transform duration-200 flex items-center justify-center group"
          onClick={() => setOpen(true)}
          title="Chat with AI Assistant"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className="fixed right-4 bottom-4 w-[400px] max-w-[90vw] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9999] border border-green-100"
          style={{ animation: "slideUp 0.3s ease-out" }}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">AI Sales Assistant</div>
                <div className="text-xs text-green-50">Online • Always here to help</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                onClick={handleReset}
                title="Reset conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                onClick={() => setOpen(false)}
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-auto p-4 bg-gradient-to-b from-green-50/30 to-white">
            {messages.map((m, i) => (
              <Bubble key={i} m={m} />
            ))}

            {/* Add-ons Panel */}
            {pendingAskAddOns && (
              <div className="mb-3 text-left" style={{ animation: "fadeIn 0.3s ease-in" }}>
                <div
                  className="inline-block px-4 py-3 rounded-2xl bg-white border border-green-100 text-gray-900 shadow-sm"
                  style={{ maxWidth: "85%" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Plus className="w-4 h-4 text-green-600" />
                    <div className="font-semibold text-gray-900">Available Add-ons</div>
                  </div>
                  <div className="space-y-2">
                    {pendingAskAddOns.options.map((a) => (
                      <div
                        key={a.id}
                        className="border border-green-100 rounded-lg p-3 bg-green-50/50 flex items-center justify-between gap-3"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{a.name}</div>
                          <div className="text-xs text-emerald-600 font-semibold mt-0.5">
                            +LKR {Math.round(Number(a.price || 0)).toLocaleString()}
                          </div>
                        </div>
                        <button
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-medium hover:shadow-md transition-all duration-200 whitespace-nowrap"
                          onClick={() => {
                            addAddOn(pendingAskAddOns.serviceId, a);
                            setMessages((m) => [
                              ...m,
                              {
                                role: "bot",
                                content: `Added **${a.name}** (+LKR ${Math.round(Number(a.price || 0)).toLocaleString()}).`,
                              },
                            ]);
                          }}
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium hover:shadow-md transition-all duration-200"
                      onClick={() => {
                        setMessages((m) => [...m, { role: "bot", content: "Noted. Would you like to book a time?" }]);
                        setQuick([
                          { label: "Suggest a time", value: "suggest time" },
                          { label: "Change time", value: "change time" },
                        ]);
                        setPendingAskAddOns(null);
                      }}
                    >
                      <Check className="w-4 h-4" />
                      Done
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50 transition-colors"
                      onClick={() => setPendingAskAddOns(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isTyping && (
              <div className="mb-2 text-left">
                <div className="inline-block px-3 py-2 rounded-2xl bg-gray-100 text-gray-900">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:120ms]" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick replies */}
          <div className="px-3 py-2 border-t bg-white">
            <div className="flex flex-wrap gap-2">
              {quick.map((q, i) => (
                <button
                  key={`${q.value}-${i}`}
                  className="px-3 py-1.5 rounded-full border text-sm hover:bg-gray-50"
                  onClick={() => send(q.value)}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input row */}
          <div className="px-3 py-2 border-t bg-white flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring focus:ring-emerald-200"
              placeholder="Type your message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && input.trim()) send(input.trim());
              }}
            />
            <button
              className="px-4 rounded-lg bg-emerald-600 text-white disabled:opacity-50 flex items-center gap-1"
              disabled={!input.trim()}
              onClick={() => send(input.trim())}
              title="Send"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
