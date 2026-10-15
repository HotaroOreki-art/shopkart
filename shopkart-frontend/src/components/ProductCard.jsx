import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartProductId, useCart } from '../context/CartContext';
import { toggleWishlist } from '../services/api';

export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

export const formatStock = (stock) => (stock > 0 ? `${stock} units left` : 'Out of stock');

export function WishlistButton({ productId, saved = false }) {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(saved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsSaved(saved);
  }, [saved]);

  const handleClick = async () => {
    if (saving) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await toggleWishlist(productId);
      setIsSaved(response.data.saved);
      window.dispatchEvent(new Event('wishlist-changed'));
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError('Unable to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  let label = isSaved ? '♥ Remove from Wishlist' : '♡ Add to Wishlist';
  if (saving) {
    label = 'Saving...';
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={saving}
        className="w-full rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-50 disabled:opacity-60"
      >
        {label}
      </button>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

export function AddToCartButton({ productId }) {
  const navigate = useNavigate();
  const { cartItems, pendingId, addToCart } = useCart();
  const [error, setError] = useState('');
  const inCart = cartItems.some((item) => cartProductId(item) === productId);
  const adding = pendingId === productId;

  const handleClick = async () => {
    if (adding) {
      return;
    }
    setError('');
    try {
      await addToCart(productId);
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(requestError.response?.data?.message || 'Unable to update cart.');
    }
  };

  let label = inCart ? 'Add Another' : 'Add to Cart';
  if (adding) {
    label = 'Adding...';
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={adding}
        className="w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60"
      >
        {label}
      </button>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

function ProductCard({ product, saved = false }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
      <img
        className="h-48 w-full object-cover"
        src={product.image}
        alt={product.name}
      />
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
          <AddToCartButton productId={product._id} />
          <WishlistButton productId={product._id} saved={saved} />
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
