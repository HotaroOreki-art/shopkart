import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
});

export const registerCustomer = (payload) => api.post('/customers/register', payload);

export const loginCustomer = (payload) => api.post('/customers/login', payload);

export const getMyProfile = () => api.get('/customers/me');

export const logoutCustomer = () => api.post('/customers/logout');

export const getProducts = (params, config = {}) => api.get('/products', { ...config, params });

export const getProduct = (id) => api.get(`/products/${id}`);

export const getWishlist = () => api.get('/wishlist');

export const addToWishlist = (productId) => api.post(`/wishlist/${productId}`);

export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);

export const toggleWishlist = (productId) => api.patch(`/wishlist/${productId}/toggle`);

export const getCart = () => api.get('/cart');

export const addToCart = (productId) => api.post(`/cart/${productId}`);

export const updateCartQuantity = (productId, quantity) =>
  api.patch(`/cart/${productId}`, { quantity });

export const removeFromCart = (productId) => api.delete(`/cart/${productId}`);

export const createPaymentOrder = (shippingAddress) =>
  api.post('/orders/create-payment-order', { shippingAddress });

export const verifyPayment = (payload) => api.post('/orders/verify-payment', payload);

export const getOrders = () => api.get('/orders');

export const getOrder = (id) => api.get(`/orders/${id}`);

export default api;
