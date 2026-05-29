import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.findIndex(i => i.id === action.payload.id);
      if (exists >= 0) {
        return state.map((item, idx) =>
          idx === exists ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];
    }
    case 'REMOVE_ITEM':
      return state.filter(i => i.id !== action.payload);
    case 'UPDATE_QTY':
      return state.map(i =>
        i.id === action.payload.id
          ? { ...i, quantity: Math.max(0, action.payload.qty) }
          : i
      ).filter(i => i.quantity > 0);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  const addItem     = useCallback((product) => dispatch({ type: 'ADD_ITEM', payload: product }), []);
  const removeItem  = useCallback((id) => dispatch({ type: 'REMOVE_ITEM', payload: id }), []);
  const updateQty   = useCallback((id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { id, qty } }), []);
  const clearCart   = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const { totalItems, totalPrice } = useMemo(() => ({
    totalItems: items.reduce((acc, i) => acc + i.quantity, 0),
    totalPrice: items.reduce((acc, i) => acc + i.price * i.quantity, 0),
  }), [items]);

  const value = useMemo(() => ({
    items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice,
  }), [items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
};
