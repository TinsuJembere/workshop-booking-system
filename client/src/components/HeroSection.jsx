import React, { useState } from "react";

const categories = [
  { value: "", label: "All Categories" },
  { value: "Art", label: "Art" },
  { value: "Tech", label: "Tech" },
  { value: "Wellness", label: "Wellness" },
];

const HeroSection = ({ onFilterChange = () => {} }) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ search, category });
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    onFilterChange({ search, category: e.target.value });
  };

  return (
    <section className="relative bg-white pb-8">
      {/* Banner Image */}
      <div className="w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-b-2xl flex items-center justify-center">
        <img
          src="/hero.jpg"
          alt="Workshop Banner"
          className="object-cover w-full h-full opacity-90"
        />
        <div className="absolute inset-0 bg-opacity-30 flex flex-col items-center justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 text-center drop-shadow-lg">
            Unleash Your Inner Creator
          </h1>
          <form
            className="flex flex-col md:flex-row items-center gap-2 w-full max-w-xl mx-auto"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              placeholder="Search workshops..."
              className="w-full md:w-2/3 px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="category-select w-full md:w-1/3 px-4 py-2 rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={category}
              onChange={handleCategoryChange}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <button className="mt-2 md:mt-0 md:ml-2 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition font-semibold">
              Search
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
