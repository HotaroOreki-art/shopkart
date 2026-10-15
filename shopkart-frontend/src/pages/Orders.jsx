import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OrderCard from '../components/OrderCard';
import { getOrders } from '../services/api';

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(() => {
    setLoading(true);
    setError('');
    getOrders()
      .then((response) => {
        setOrders(response.data.orders || []);
      })
      .catch((requestError) => {
        if (requestError.response?.status === 401) {
          navigate('/login');
          return;
        }
        setError('Unable to load your orders.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="min-h-screen bg-stone-100">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-semibold text-stone-900">My Orders</h1>
        {loading ? <p className="mt-6 text-stone-600">Loading your orders...</p> : null}
        {!loading && error ? (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-medium text-stone-900">{error}</p>
            <button
              type="button"
              onClick={loadOrders}
              className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
            >
              Try Again
            </button>
          </div>
        ) : null}
        {!loading && !error && orders.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-medium text-stone-900">You have not placed any orders yet.</p>
            <Link
              className="mt-4 inline-flex rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
              to="/products"
            >
              Start Shopping
            </Link>
          </div>
        ) : null}
        {!loading && !error && orders.length > 0 ? (
          <div className="mt-6 grid gap-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default Orders;
