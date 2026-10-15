import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WishlistCard from '../components/WishlistCard';
import { getWishlist, removeFromWishlist } from '../services/api';

function Wishlist() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState('');

  const loadWishlist = useCallback(() => {
    setLoading(true);
    setError('');
    getWishlist()
      .then((response) => {
        setItems(response.data.wishlist || []);
      })
      .catch((requestError) => {
        if (requestError.response?.status === 401) {
          navigate('/login');
          return;
        }
        setError('Unable to load wishlist.');
        setItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId);
      setItems((current) => current.filter((item) => item._id !== productId));
      window.dispatchEvent(new Event('wishlist-changed'));
    } catch {
      setError('Unable to load wishlist.');
    } finally {
      setRemovingId('');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-sm font-medium text-amber-700">ShopKart</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900">My Wishlist</h1>
        {!loading && !error ? (
          <p className="mt-1 text-stone-600">
            {items.length} {items.length === 1 ? 'product' : 'products'} saved
          </p>
        ) : null}

        <section className="mt-6">
          {loading ? <p className="text-stone-600">Loading your wishlist...</p> : null}
          {!loading && error ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-lg font-medium text-stone-900">Unable to load wishlist.</p>
              <button
                type="button"
                onClick={loadWishlist}
                className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
              >
                Try Again
              </button>
            </div>
          ) : null}
          {!loading && !error && items.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-2xl">❤️</p>
              <h2 className="mt-3 text-xl font-semibold text-stone-900">Your wishlist is empty</h2>
              <p className="mt-2 text-stone-600">Start saving products you love.</p>
              <Link
                className="mt-6 inline-flex rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
                to="/products"
              >
                Browse Products
              </Link>
            </div>
          ) : null}
          {!loading && !error && items.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  removing={removingId === product._id}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default Wishlist;
