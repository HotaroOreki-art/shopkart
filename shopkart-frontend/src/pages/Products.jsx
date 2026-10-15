import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { getProducts, getWishlist } from '../services/api';

function Products() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [sort, setSort] = useState('');
  const [products, setProducts] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');

      const params = {};
      if (search.trim()) {
        params.search = search.trim();
      }
      if (category !== 'All Categories') {
        params.category = category;
      }
      if (sort) {
        params.sort = sort;
      }

      getProducts(params, { signal: controller.signal })
        .then((response) => {
          setProducts(response.data.products || []);
        })
        .catch((requestError) => {
          if (requestError.code === 'ERR_CANCELED') {
            return;
          }
          setError('Something went wrong while loading products.');
          setProducts([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, category, sort]);

  useEffect(() => {
    const loadSaved = () => {
      getWishlist()
        .then((response) => {
          setSavedIds((response.data.wishlist || []).map((item) => item._id));
        })
        .catch(() => {
          setSavedIds([]);
        });
    };

    loadSaved();
    window.addEventListener('wishlist-changed', loadSaved);
    return () => window.removeEventListener('wishlist-changed', loadSaved);
  }, []);

  return (
    <div className="min-h-screen bg-stone-100">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-sm font-medium text-amber-700">ShopKart</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900">Products</h1>
        <p className="mt-1 text-stone-600">Search and filter the catalog.</p>

        <div className="mt-6">
          <SearchBar
            search={search}
            category={category}
            sort={sort}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onSortChange={setSort}
          />
        </div>

        <section className="mt-6">
          {loading ? <p className="text-stone-600">Loading products...</p> : null}
          {!loading && error ? <p className="text-red-700">{error}</p> : null}
          {!loading && !error && products.length === 0 ? (
            <p className="text-stone-600">No products found.</p>
          ) : null}
          {!loading && !error && products.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  saved={savedIds.includes(product._id)}
                />
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default Products;
