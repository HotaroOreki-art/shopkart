import { formatPrice } from './ProductCard';

function OrderSummary({ items, total }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Order Summary</h2>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li key={item.product?._id || item.product} className="flex justify-between gap-4 text-sm text-stone-700">
            <span>
              {item.product?.name} × {item.quantity}
            </span>
            <span>{formatPrice(item.product.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex justify-between border-t border-stone-200 pt-4 text-lg font-semibold text-stone-900">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </p>
    </section>
  );
}

export default OrderSummary;
