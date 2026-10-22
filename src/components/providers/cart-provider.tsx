'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/types';

/** One cart line; prices are re-checked by the server when the order is placed. */
export interface CartLine {
  productId: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  qty: number;
  /** Most that can be ordered: stock, capped at 10. */
  max: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (product: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  qtyOf: (productId: string) => number;
}

const STORAGE_KEY = 'renderways_cart';
const CartContext = createContext<CartContextValue | null>(null);

/** Shop products that can go in the cart (rentals are booked by phone). */
export function canBuy(product: Pick<Product, 'category' | 'price' | 'inStock' | 'stockCount'>) {
  return product.category !== 'rental' && product.price > 0 && product.inStock && product.stockCount > 0;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Read after mount so the server render and the first client render agree.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (Array.isArray(saved)) setLines(saved);
    } catch {
      /* unreadable cart: start empty */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage full or blocked: the cart still works for this visit */
    }
  }, [lines, loaded]);

  const add = useCallback((product: Product, qty = 1) => {
    const max = Math.max(1, Math.min(10, product.stockCount || 10));
    setLines((prev) => {
      const existing = prev.find((line) => line.productId === product._id);
      if (existing) {
        return prev.map((line) =>
          line.productId === product._id ? { ...line, qty: Math.min(max, line.qty + qty), max } : line
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          brand: product.brand ?? '',
          category: product.category,
          price: product.price,
          qty: Math.min(max, qty),
          max,
        },
      ];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((line) => line.productId !== productId)
        : prev.map((line) => (line.productId === productId ? { ...line, qty: Math.min(line.max, qty) } : line))
    );
  }, []);

  const remove = useCallback(
    (productId: string) => setLines((prev) => prev.filter((line) => line.productId !== productId)),
    []
  );
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((sum, line) => sum + line.qty, 0),
      subtotal: lines.reduce((sum, line) => sum + line.qty * line.price, 0),
      add,
      setQty,
      remove,
      clear,
      qtyOf: (productId) => lines.find((line) => line.productId === productId)?.qty ?? 0,
    }),
    [lines, add, setQty, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider');
  return value;
}
