import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addToCart as addToCartRequest,
  getCart,
  removeFromCart as removeFromCartRequest,
  updateCartQuantity as updateCartQuantityRequest,
} from '../services/api';

const CartContext = createContext(null);

export const cartProductId = (item) => item?.product?._id || item?.product;

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);
  const [pendingId, setPendingId] = useState('');

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getCart();
      setCartItems(response.data.cart || []);
      setUnauthorized(false);
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        setCartItems([]);
        setUnauthorized(true);
        setError('');
      } else {
        setError('Unable to load your cart.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const applyCart = (cart) => {
    setCartItems(cart || []);
    setUnauthorized(false);
    setError('');
  };

  const addToCart = async (productId) => {
    setPendingId(productId);
    try {
      const response = await addToCartRequest(productId);
      applyCart(response.data.cart);
      return response.data;
    } finally {
      setPendingId('');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    setPendingId(productId);
    try {
      const response = await updateCartQuantityRequest(productId, quantity);
      applyCart(response.data.cart);
      return response.data;
    } finally {
      setPendingId('');
    }
  };

  const removeFromCart = async (productId) => {
    setPendingId(productId);
    try {
      const response = await removeFromCartRequest(productId);
      applyCart(response.data.cart);
      return response.data;
    } finally {
      setPendingId('');
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setUnauthorized(true);
    setError('');
  };

  const emptyCart = () => {
    setCartItems([]);
    setUnauthorized(false);
    setError('');
  };

  const totalUnits = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const value = useMemo(
    () => ({
      cartItems,
      loading,
      error,
      unauthorized,
      pendingId,
      totalUnits,
      subtotal,
      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      emptyCart,
    }),
    [cartItems, loading, error, unauthorized, pendingId, totalUnits, subtotal, refreshCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
