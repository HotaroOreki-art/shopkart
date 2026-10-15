import { formatPrice } from './ProductCard';

function CartItem({ item, pending, onIncrease, onDecrease, onRemove }) {
  const product = item.product;
  const lineTotal = product.price * item.quantity;
  const atStockLimit = item.quantity >= product.stock;

  return (
    <article className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
      <img className="h-24 w-24 rounded-xl object-cover" src={product.image} alt={product.name} />
      <div className="flex flex-1 flex-col">
        <h2 className="text-lg font-semibold text-stone-900">{product.name}</h2>
        <p className="mt-1 text-stone-600">{formatPrice(product.price)}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDecrease}
              disabled={pending || item.quantity <= 1}
              className="h-8 w-8 rounded-lg border border-stone-300 text-stone-900 disabled:opacity-40"
            >
              -
            </button>
            <span className="min-w-6 text-center font-medium text-stone-900">{item.quantity}</span>
            <button
              type="button"
              onClick={onIncrease}
              disabled={pending || atStockLimit}
              className="h-8 w-8 rounded-lg border border-stone-300 text-stone-900 disabled:opacity-40"
            >
              +
            </button>
          </div>
          <p className="font-semibold text-stone-900">{formatPrice(lineTotal)}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={pending}
          className="mt-3 self-start text-sm font-medium text-stone-700 underline disabled:opacity-60"
        >
          {pending ? 'Updating...' : 'Remove'}
        </button>
      </div>
    </article>
  );
}

export default CartItem;
