import React, { useState, useEffect } from 'react';
import { Search, Calendar, SlidersHorizontal, X } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

export const Filters = ({ filters, updateFilters, clearFilters }) => {
  const [localTitle, setLocalTitle] = useState(filters.title);

  // Sync local title input value with filter changes (like clear)
  useEffect(() => {
    setLocalTitle(filters.title);
  }, [filters.title]);

  // Debounced search trigger (updates filters 300ms after user stops typing)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localTitle !== filters.title) {
        updateFilters({ title: localTitle });
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [localTitle, filters.title, updateFilters]);

  // Check if any filter is active
  const hasActiveFilters = filters.category || filters.from || filters.to || filters.title;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6 transition-all duration-300 hover:shadow-md animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-5 h-5 text-slate-500" />
        <h3 className="font-semibold text-slate-700">Filter Expenses</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Title Search Input */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Search Keywords</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. Groceries, Broadband"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl outline-none transition-all duration-200 text-slate-700 placeholder-slate-400"
            />
            {localTitle && (
              <button
                onClick={() => setLocalTitle('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Picker */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Category</label>
          <select
            value={filters.category}
            onChange={(e) => updateFilters({ category: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl outline-none transition-all duration-200 text-slate-700 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.25rem',
              backgroundRepeat: 'no-repeat',
              paddingRight: '2.5rem'
            }}
          >
            <option value="">All Categories</option>
            <option value="Food">Food 🍔</option>
            <option value="Transport">Transport 🚗</option>
            <option value="Shopping">Shopping 🛍️</option>
            <option value="Bills">Bills 🔌</option>
            <option value="Entertainment">Entertainment 🎬</option>
            <option value="Other">Other 📦</option>
          </select>
        </div>

        {/* Start Date Range */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Date From</label>
          <div className="relative">
            <input
              type="date"
              value={filters.from}
              onChange={(e) => updateFilters({ from: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl outline-none transition-all duration-200 text-slate-700 cursor-pointer"
            />
          </div>
        </div>

        {/* End Date Range */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Date To</label>
          <div className="relative">
            <input
              type="date"
              value={filters.to}
              onChange={(e) => updateFilters({ to: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl outline-none transition-all duration-200 text-slate-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Active Filter Chips bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100 animate-fade-in-up">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Active Filters:</span>
          
          {/* Title search chip */}
          {filters.title && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              Search: "{filters.title}"
              <button onClick={() => setLocalTitle('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Category chip */}
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
              Category: {filters.category}
              <button onClick={() => updateFilters({ category: '' })} className="text-indigo-400 hover:text-indigo-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Date range chips */}
          {(filters.from || filters.to) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
              <Calendar className="w-3 h-3" />
              {filters.from ? formatDate(filters.from, 'dd MMM') : 'Beginning'} - {filters.to ? formatDate(filters.to, 'dd MMM') : 'Today'}
              <button
                onClick={() => updateFilters({ from: '', to: '' })}
                className="text-amber-400 hover:text-amber-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Clear All action button */}
          <button
            onClick={clearFilters}
            className="ml-auto text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
