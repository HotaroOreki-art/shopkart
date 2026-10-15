import { Link } from 'react-router-dom';
import { formatPrice, formatStock } from './ProductCard';

function WishlistCard({ product, removing, onRemove }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
      <img className="h-48 w-full object-cover" src={product.image} alt={product.name} />
      <div className="flex flex-1 flex-col p-4">
        <h2 className="text-lg font-semibold text-stone-900">{product.name}</h2>
        <p className="mt-1 text-sm text-stone-500">{product.category}</p>
        <p className="mt-3 text-lg font-semibold text-stone-900">{formatPrice(product.price)}</p>
        <p className="mt-1 text-sm text-stone-600">{formatStock(product.stock)}</p>
        <div className="mt-4 grid gap-2">
          <Link
            className="inline-flex justify-center rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
            to={`/products/${product._id}`}
          >
            View Details
          </Link>
          <button
            type="button"
            onClick={() => onRemove(product._id)}
            disabled={removing}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-50 disabled:opacity-60"
          >
            {removing ? 'Removing...' : 'Remove from Wishlist'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default WishlistCard;
