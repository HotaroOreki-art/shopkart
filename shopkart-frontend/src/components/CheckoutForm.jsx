const fields = [
  ['fullName', 'Full Name'],
  ['phone', 'Phone'],
  ['addressLine1', 'Address'],
  ['city', 'City'],
  ['state', 'State'],
  ['pincode', 'Pincode'],
];

function CheckoutForm({ values, errors, onChange }) {
  return (
    <div className="grid gap-4">
      {fields.map(([name, label]) => (
        <label key={name} className="block text-sm font-medium text-stone-700">
          {label}
          <input
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-stone-900"
            name={name}
            value={values[name]}
            onChange={onChange}
          />
          {errors[name] ? <span className="mt-1 block font-normal text-red-600">{errors[name]}</span> : null}
        </label>
      ))}
    </div>
  );
}

export default CheckoutForm;
