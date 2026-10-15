import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getWishlist, logoutCustomer } from '../services/api';

function Navbar({ customerName }) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(null);
  const { totalUnits, clearCart } = useCart();

  useEffect(() => {
    let active = true;

    const loadCount = () => {
      getWishlist()
        .then((response) => {
          if (active) {
            setWishlistCount(response.data.count ?? 0);
          }
        })
        .catch(() => {
          if (active) {
            setWishlistCount(null);
          }
        });
    };

    loadCount();
    window.addEventListener('wishlist-changed', loadCount);
    return () => {
      active = false;
      window.removeEventListener('wishlist-changed', loadCount);
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutCustomer();
    } catch {
      // Cookie may already be gone; still send the user to login.
    } finally {
      clearCart();
      navigate('/login');
    }
  };

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-lg font-semibold tracking-tight text-stone-900">ShopKart</p>
            {customerName ? (
              <p className="text-sm text-stone-500">{customerName}</p>
            ) : null}
          </div>
          <nav className="flex gap-4 text-sm font-medium text-stone-700">
            <Link className="hover:text-stone-900" to="/home">Home</Link>
            <Link className="hover:text-stone-900" to="/products">Products</Link>
            <Link className="hover:text-stone-900" to="/wishlist">
              {wishlistCount === null ? 'Wishlist' : `Wishlist (${wishlistCount})`}
            </Link>
            <Link className="hover:text-stone-900" to="/cart">Cart ({totalUnits})</Link>
            <Link className="hover:text-stone-900" to="/orders">Orders</Link>
          </nav>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60"
        >
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
