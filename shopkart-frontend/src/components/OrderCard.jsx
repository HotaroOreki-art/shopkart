import { Link } from 'react-router-dom';
import { formatPrice } from './ProductCard';

export const formatOrderDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

function OrderCard({ order }) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Order #{order._id}</h2>
          <p className="mt-1 text-sm text-stone-500">{formatOrderDate(order.createdAt)}</p>
        </div>
        <p className="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-800">{order.status}</p>
      </div>
      <ul className="mt-4 grid gap-1 text-sm text-stone-700">
        {order.items.map((item) => (
          <li key={`${order._id}-${item.product}`}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>
      <p className="mt-4 font-semibold text-stone-900">Total: {formatPrice(order.totalAmount)}</p>
      <Link className="mt-4 inline-flex text-sm font-medium text-stone-900 underline" to={`/orders/${order._id}`}>
        View Details
      </Link>
    </article>
  );
}

export default OrderCard;
