import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { formatOrderDate } from '../components/OrderCard';
import { formatPrice } from '../components/ProductCard';
import { getOrder } from '../services/api';

function OrderDetails({ success = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getOrder(id)
      .then((response) => {
        if (active) {
          setOrder(response.data.order);
        }
      })
      .catch((requestError) => {
        if (requestError.response?.status === 401) {
          navigate('/login');
          return;
        }
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load this order.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-stone-100">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        {loading ? <p className="text-stone-600">Loading your order...</p> : null}
        {!loading && error ? <p className="text-red-700">{error}</p> : null}
        {!loading && order ? (
          <article className="rounded-2xl bg-white p-8 shadow-sm">
            {success ? (
              <p className="text-sm font-medium text-amber-700">Order placed successfully</p>
            ) : null}
            <h1 className="mt-2 text-3xl font-semibold text-stone-900">
              {success ? 'Order Placed Successfully' : 'Order Details'}
            </h1>
            <p className="mt-4 text-stone-600">Order ID: {order._id}</p>
            <p className="mt-1 text-stone-600">{formatOrderDate(order.createdAt)}</p>
            {success ? (
              <p className="mt-4 text-stone-700">Your order has been saved successfully.</p>
            ) : null}
            <p className="mt-4 text-2xl font-semibold text-stone-900">{formatPrice(order.totalAmount)}</p>
            <p className="mt-2 text-stone-700">Status: {order.status}</p>
            <p className="mt-1 text-stone-700">Payment: {order.paymentStatus}</p>
            <ul className="mt-6 grid gap-3">
              {order.items.map((item) => (
                <li key={`${order._id}-${item.product}`} className="flex justify-between text-stone-700">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-sm text-stone-600">
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
              </p>
              <p>{order.shippingAddress.phone}</p>
            </div>
            <div className="mt-6 flex gap-4 text-sm font-medium">
              <Link className="text-stone-900 underline" to="/orders">
                View My Orders
              </Link>
              <Link className="text-stone-900 underline" to="/products">
                Continue Shopping
              </Link>
            </div>
          </article>
        ) : null}
      </main>
    </div>
  );
}

export default OrderDetails;
