import React from "react";

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange = () => {} }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center mt-8">
      <nav className="inline-flex items-center space-x-1">
        <button
          className="px-3 py-1 rounded-l bg-gray-200 text-gray-600 hover:bg-indigo-100"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        {pages.map((page) => (
          <button
            key={page}
            className={`px-3 py-1 ${
              page === currentPage
                ? "bg-indigo-600 text-white font-semibold"
                : "bg-gray-200 text-gray-600 hover:bg-indigo-100"
            }`}
            onClick={() => onPageChange(page)}
            disabled={page === currentPage}
          >
            {page}
          </button>
        ))}
        <button
          className="px-3 py-1 rounded-r bg-gray-200 text-gray-600 hover:bg-indigo-100"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </nav>
    </div>
  );
};

export default Pagination; 