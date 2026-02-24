import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Simple visual window of pages (e.g., 5 pages max at a time)
  const renderPageNumbers = () => {
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {i}
        </button>,
      );
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-4 pb-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={18} />
      </button>

      {currentPage > 3 && totalPages > 5 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            1
          </button>
          <span className="text-gray-400">...</span>
        </>
      )}

      {renderPageNumbers()}

      {currentPage < totalPages - 2 && totalPages > 5 && (
        <>
          <span className="text-gray-400">...</span>
          <button
            onClick={() => onPageChange(totalPages)}
            className="flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
