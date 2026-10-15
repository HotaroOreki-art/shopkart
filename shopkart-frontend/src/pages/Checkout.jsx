import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CheckoutForm from '../components/CheckoutForm';
import Navbar from '../components/Navbar';
import OrderSummary from '../components/OrderSummary';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment } from '../services/api';

const emptyAddress = {
  fullName: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: '',
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const validateAddress = (address) => {
  const errors = {};
  if (!address.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!/^\d{10}$/.test(address.phone.trim())) errors.phone = 'Phone must be a 10 digit number.';
  if (!address.addressLine1.trim()) errors.addressLine1 = 'Address is required.';
  if (!address.city.trim()) errors.city = 'City is required.';
  if (!address.state.trim()) errors.state = 'State is required.';
  if (!/^\d{6}$/.test(address.pincode.trim())) errors.pincode = 'Pincode must contain 6 digits.';
  return errors;
};

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, loading, unauthorized, subtotal, emptyCart } = useCart();
  const [address, setAddress] = useState(emptyAddress);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!loading && unauthorized) {
      navigate('/login');
    }
  }, [loading, unauthorized, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAddress((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setServerError('');
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    const nextErrors = validateAddress(address);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setPlacing(true);
    setServerError('');
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setServerError('Unable to load Razorpay Checkout. Please try again.');
        return;
      }

      const response = await createPaymentOrder({
        fullName: address.fullName.trim(),
        phone: address.phone.trim(),
        addressLine1: address.addressLine1.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
      });
      const payment = response.data;

      const paymentObject = new window.Razorpay({
        key: payment.key,
        amount: payment.amount,
        currency: payment.currency,
        name: 'ShopKart',
        description: 'ShopKart Order',
        order_id: payment.razorpayOrderId,
        handler: async (razorpayResponse) => {
          try {
            const verified = await verifyPayment({
              shopKartOrderId: payment.shopKartOrderId,
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
            });
            emptyCart();
            navigate(`/order-success/${verified.data.order._id}`);
          } catch (verifyError) {
            setServerError(verifyError.response?.data?.message || 'Payment could not be verified.');
            setPlacing(false);
          }
        },
        prefill: {
          name: address.fullName.trim(),
          contact: address.phone.trim(),
        },
        theme: { color: '#1c1917' },
      });

      paymentObject.on('payment.failed', () => {
        setServerError('Payment failed. Your cart has not been cleared. Please try again.');
        setPlacing(false);
      });
      paymentObject.open();
      setPlacing(false);
    } catch (requestError) {
      setServerError(requestError.response?.data?.message || 'Unable to place the order.');
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-semibold text-stone-900">Checkout</h1>
        {loading ? <p className="mt-6 text-stone-600">Loading your cart...</p> : null}
        {!loading && cartItems.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-medium text-stone-900">Your cart is empty.</p>
            <Link className="mt-4 inline-flex text-sm font-medium text-stone-900 underline" to="/products">
              Browse Products
            </Link>
          </div>
        ) : null}
        {!loading && cartItems.length > 0 ? (
          <form className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]" onSubmit={handlePlaceOrder} noValidate>
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-stone-900">Shipping Details</h2>
              <div className="mt-4">
                <CheckoutForm values={address} errors={errors} onChange={handleChange} />
              </div>
            </section>
            <div>
              <OrderSummary items={cartItems} total={subtotal} />
              {serverError ? <p className="mt-4 text-sm text-red-700">{serverError}</p> : null}
              <button
                type="submit"
                disabled={placing}
                className="mt-4 w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60"
              >
                {placing ? 'Placing order...' : 'Place Order'}
              </button>
            </div>
          </form>
        ) : null}
      </main>
    </div>
  );
}

export default Checkout;
