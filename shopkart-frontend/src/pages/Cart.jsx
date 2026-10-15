import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import Navbar from '../components/Navbar';
import { formatPrice } from '../components/ProductCard';
import { cartProductId, useCart } from '../context/CartContext';

function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    unauthorized,
    pendingId,
    totalUnits,
    subtotal,
    refreshCart,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!loading && unauthorized) {
      navigate('/login');
    }
  }, [loading, unauthorized, navigate]);

  const changeQuantity = async (item, nextQuantity) => {
    setActionError('');
    try {
      await updateQuantity(cartProductId(item), nextQuantity);
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Unable to update your cart.');
    }
  };

  const handleRemove = async (item) => {
    setActionError('');
    try {
      await removeFromCart(cartProductId(item));
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Unable to update your cart.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <Navbar />
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_280px]">
        <section>
          <p className="text-sm font-medium text-amber-700">ShopKart</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900">My Cart</h1>

          {loading ? <p className="mt-6 text-stone-600">Loading your cart...</p> : null}
          {!loading && error ? (
            <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-lg font-medium text-stone-900">Unable to load your cart.</p>
              <button
                type="button"
                onClick={refreshCart}
                className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
              >
                Try Again
              </button>
            </div>
          ) : null}
          {!loading && !error && cartItems.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-2xl">🛒</p>
              <h2 className="mt-3 text-xl font-semibold text-stone-900">Your cart is empty</h2>
              <p className="mt-2 text-stone-600">Looks like you haven't added anything yet.</p>
              <Link
                className="mt-6 inline-flex rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
                to="/products"
              >
                Browse Products
              </Link>
            </div>
          ) : null}
          {!loading && !error && cartItems.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {actionError ? <p className="text-sm text-red-700">{actionError}</p> : null}
              {cartItems.map((item) => (
                <CartItem
                  key={cartProductId(item)}
                  item={item}
                  pending={pendingId === cartProductId(item)}
                  onIncrease={() => changeQuantity(item, item.quantity + 1)}
                  onDecrease={() => changeQuantity(item, item.quantity - 1)}
                  onRemove={() => handleRemove(item)}
                />
              ))}
            </div>
          ) : null}
        </section>

        {!loading && !error && cartItems.length > 0 ? (
          <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900">Order Summary</h2>
            <p className="mt-4 text-stone-600">Items: {totalUnits}</p>
            <p className="mt-2 text-lg font-semibold text-stone-900">Subtotal: {formatPrice(subtotal)}</p>
            <Link
              className="mt-6 inline-flex w-full justify-center rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700"
              to="/checkout"
            >
              Proceed to Checkout
            </Link>
          </aside>
        ) : null}
      </main>
    </div>
  );
}

export default Cart;
