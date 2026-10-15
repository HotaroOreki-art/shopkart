const CATEGORIES = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home'];

function SearchBar({ search, category, sort, onSearchChange, onCategoryChange, onSortChange }) {
  return (
    <form
      className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto_auto]"
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="block text-sm font-medium text-stone-700">
        Search
        <input
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-stone-900"
          type="search"
          name="search"
          placeholder="Search products..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
      <label className="block text-sm font-medium text-stone-700">
        Category
        <select
          className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-stone-900"
          name="category"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-stone-700">
        Sort
        <select
          className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-stone-900"
          name="sort"
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
        >
          <option value="">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </label>
    </form>
  );
}

export default SearchBar;
