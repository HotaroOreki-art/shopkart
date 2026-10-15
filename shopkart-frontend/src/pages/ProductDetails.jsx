import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AddToCartButton, formatPrice, formatStock, WishlistButton } from '../components/ProductCard';
import { getProduct, getWishlist } from '../services/api';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    getProduct(id)
      .then((response) => {
        if (active) {
          setProduct(response.data.product);
        }
      })
      .catch(() => {
        if (active) {
          setError('Something went wrong while loading products.');
          setProduct(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    getWishlist()
      .then((response) => {
        if (active) {
          const ids = (response.data.wishlist || []).map((item) => item._id);
          setSaved(ids.includes(id));
        }
      })
      .catch(() => {
        if (active) {
          setSaved(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-stone-100">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link className="text-sm font-medium text-stone-700 underline" to="/products">
          Back to products
        </Link>

        {loading ? <p className="mt-6 text-stone-600">Loading products...</p> : null}
        {!loading && error ? <p className="mt-6 text-red-700">{error}</p> : null}
        {!loading && !error && product ? (
          <article className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
            <img className="h-80 w-full object-cover" src={product.image} alt={product.name} />
            <div className="p-6">
              <p className="text-sm font-medium text-amber-700">{product.category}</p>
              <h1 className="mt-2 text-3xl font-semibold text-stone-900">{product.name}</h1>
              <p className="mt-4 text-stone-600">{product.description}</p>
              <p className="mt-6 text-2xl font-semibold text-stone-900">{formatPrice(product.price)}</p>
              <p className="mt-2 text-stone-600">{formatStock(product.stock)}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="min-w-40">
                  <AddToCartButton productId={product._id} />
                </div>
                <div className="min-w-52">
                  <WishlistButton productId={product._id} saved={saved} />
                </div>
              </div>
            </div>
          </article>
        ) : null}
      </main>
    </div>
  );
}

export default ProductDetails;
