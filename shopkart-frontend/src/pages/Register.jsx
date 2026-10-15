import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerCustomer } from '../services/api';

const emptyForm = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
};

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    }
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!form.password) {
      nextErrors.password = 'Password is required.';
    } else if (form.password.length < 6) {
      nextErrors.password = 'Password must contain at least 6 characters.';
    }
    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone number is required.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setServerError('');
    try {
      await registerCustomer({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
      });
      navigate('/login');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-amber-700">ShopKart</p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900">Create your account</h1>
        <p className="mt-1 text-sm text-stone-500">Register to start shopping.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <Field
            label="Full Name"
            name="fullName"
            value={form.fullName}
            error={errors.fullName}
            onChange={handleChange}
          />
          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            error={errors.email}
            onChange={handleChange}
          />
          <Field
            label="Password"
            name="password"
            type="password"
            value={form.password}
            error={errors.password}
            onChange={handleChange}
          />
          <Field
            label="Phone Number"
            name="phone"
            value={form.phone}
            error={errors.phone}
            onChange={handleChange}
          />

          {serverError ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-stone-600">
          Already have an account?{' '}
          <Link className="font-medium text-stone-900 underline" to="/login">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}

function Field({ label, name, type = 'text', value, error, onChange }) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <input
        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-stone-900"
        name={name}
        type={type}
        value={value}
        onChange={onChange}
      />
      {error ? <span className="mt-1 block text-sm font-normal text-red-600">{error}</span> : null}
    </label>
  );
}

export default Register;
