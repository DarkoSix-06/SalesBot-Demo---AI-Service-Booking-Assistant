// src/context/CartContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";

/**
 * Cart item:
 * {
 *   serviceId: string,
 *   name: string,
 *   price: number,
 *   addOnIds: string[],
 *   addOns: Record<addOnId, { id, name, price }>
 * }
 */
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null); // {date, time}
  const [contact, setContact] = useState({ name: "", address: "", mobile: "", email: "" });

  const addService = (svc) => {
    if (!svc || !svc.id) return;
    setItems((prev) => {
      if (prev.some((p) => p.serviceId === svc.id)) return prev;
      return [
        ...prev,
        {
          serviceId: svc.id,
          name: svc.name,
          price: Number(svc.basePrice ?? svc.price ?? 0),
          addOnIds: [],
          addOns: (svc.addOns || []).reduce((acc, a) => {
            acc[a.id] = { id: a.id, name: a.name, price: Number(a.price ?? a.basePrice ?? 0) };
            return acc;
          }, {}),
        },
      ];
    });
  };

  const removeService = (serviceId) => setItems((prev) => prev.filter((p) => p.serviceId !== serviceId));
  const clear = () => setItems([]);

  const addAddOn = (serviceId, addOn) => {
    if (!serviceId || !addOn || !addOn.id) return;
    setItems((prev) =>
      prev.map((it) => {
        if (it.serviceId !== serviceId) return it;
        if (it.addOnIds.includes(addOn.id)) return it;
        return {
          ...it,
          addOnIds: [...it.addOnIds, addOn.id],
          addOns: {
            ...it.addOns,
            [addOn.id]: {
              id: addOn.id,
              name: addOn.name,
              price: Number(addOn.price ?? addOn.basePrice ?? 0),
            },
          },
        };
      })
    );
  };

  const removeAddOn = (serviceId, addOnId) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.serviceId !== serviceId) return it;
        return { ...it, addOnIds: it.addOnIds.filter((id) => id !== addOnId) };
      })
    );
  };

  const subtotal = useMemo(
    () =>
      items.reduce((sum, it) => {
        const base = Number(it.price || 0);
        const addOnsTotal = (it.addOnIds || []).reduce((acc, id) => acc + Number(it.addOns?.[id]?.price || 0), 0);
        return sum + base + addOnsTotal;
      }, 0),
    [items]
  );

  const serviceIds = useMemo(() => items.map((it) => it.serviceId), [items]);
  const allAddOnIds = useMemo(() => items.flatMap((it) => it.addOnIds || []), [items]);

  const value = {
    items,
    serviceIds,
    allAddOnIds,
    addService,
    removeService,
    addAddOn,
    removeAddOn,
    clear,
    subtotal,
    selectedSlot,
    setSelectedSlot,
    contact,
    setContact,
    resetAll: () => {
      setItems([]);
      setSelectedSlot(null);
      setContact({ name: "", address: "", mobile: "", email: "" });
    },
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export default CartProvider;
