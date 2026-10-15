import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getMyProfile } from '../services/api';

function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getMyProfile()
      .then((response) => {
        if (active) {
          setCustomer(response.data);
        }
      })
      .catch(() => {
        if (active) {
          navigate('/login');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-100 text-stone-600">
        Loading your account...
      </main>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <Navbar customerName={customer.fullName} />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-amber-700">Home</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900">
            Welcome, {customer.fullName}
          </h1>
          <p className="mt-2 text-stone-600">You are signed in to ShopKart.</p>
          <Link
            className="mt-6 inline-flex rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
            to="/products"
          >
            Browse products
          </Link>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-stone-50 p-4">
              <dt className="text-sm text-stone-500">Name</dt>
              <dd className="mt-1 font-medium text-stone-900">{customer.fullName}</dd>
            </div>
            <div className="rounded-xl bg-stone-50 p-4">
              <dt className="text-sm text-stone-500">Email</dt>
              <dd className="mt-1 font-medium text-stone-900">{customer.email}</dd>
            </div>
            <div className="rounded-xl bg-stone-50 p-4">
              <dt className="text-sm text-stone-500">Phone number</dt>
              <dd className="mt-1 font-medium text-stone-900">{customer.phone}</dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  );
}

export default Home;
