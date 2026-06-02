import React, { useState } from 'react';
import { Edit2, Trash2, Calendar, FileText, PlusCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatCurrency';

// Color map to keep categories consistent across components
export const categoryColors = {
  Food: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    dot: 'bg-emerald-500',
    accent: 'emerald'
  },
  Transport: {
    bg: 'bg-sky-50 text-sky-700 border-sky-100',
    dot: 'bg-sky-500',
    accent: 'sky'
  },
  Shopping: {
    bg: 'bg-purple-50 text-purple-700 border-purple-100',
    dot: 'bg-purple-500',
    accent: 'purple'
  },
  Bills: {
    bg: 'bg-amber-50 text-amber-700 border-amber-100',
    dot: 'bg-amber-500',
    accent: 'amber'
  },
  Entertainment: {
    bg: 'bg-pink-50 text-pink-700 border-pink-100',
    dot: 'bg-pink-500',
    accent: 'pink'
  },
  Other: {
    bg: 'bg-slate-50 text-slate-700 border-slate-100',
    dot: 'bg-slate-500',
    accent: 'slate'
  }
};

export const ExpenseList = ({
  expenses,
  loading,
  total,
  totalPages,
  filters,
  updateFilters,
  onEdit,
  onDelete,
  onOpenAddForm
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Handle delete click
  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  // Handle delete confirm
  const handleConfirmDelete = (id) => {
    onDelete(id);
    setDeleteConfirmId(null);
  };

  // Check if any filter is active
  const hasActiveFilters = filters.category || filters.from || filters.to || filters.title;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up">
      {/* List Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Transaction History</h3>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Showing {expenses.length} of {total} total expenses
          </p>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && expenses.length === 0 ? (
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full" />
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-slate-100 rounded" />
                  <div className="w-20 h-3 bg-slate-50 rounded" />
                </div>
              </div>
              <div className="w-16 h-5 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : expenses.length === 0 ? (
        /* Empty States */
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          {hasActiveFilters ? (
            <>
              <h4 className="font-bold text-slate-700 mb-1">No matches found</h4>
              <p className="text-sm text-slate-400 max-w-sm mb-6">
                We couldn't find any expenses matching your active filters. Try resetting them.
              </p>
              <button
                onClick={() => updateFilters({ category: '', from: '', to: '', title: '' })}
                className="px-4 py-2 text-sm font-semibold text-white bg-slate-950 rounded-xl hover:bg-indigo-600 transition-colors shadow-sm"
              >
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <h4 className="font-bold text-slate-700 mb-1">No expenses recorded yet</h4>
              <p className="text-sm text-slate-400 max-w-xs mb-6">
                Start tracking your money by adding your very first expense record today!
              </p>
              <button
                onClick={onOpenAddForm}
                className="px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-indigo-600 transition-all shadow-md flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Add Your First Expense
              </button>
            </>
          )}
        </div>
      ) : (
        /* Expenses Table/List */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-3.5">Details</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Notes</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
                <th className="px-6 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.map((expense) => {
                const colors = categoryColors[expense.category] || categoryColors.Other;
                const isOptimistic = expense.isOptimistic;
                const isConfirmingDelete = deleteConfirmId === expense._id;

                return (
                  <tr
                    key={expense._id}
                    className={`hover:bg-slate-50/50 transition-colors ${
                      isOptimistic ? 'opacity-60 bg-indigo-50/10' : ''
                    }`}
                  >
                    {/* Title */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${colors.bg}`}>
                          {expense.category === 'Food' && '🍔'}
                          {expense.category === 'Transport' && '🚗'}
                          {expense.category === 'Shopping' && '🛍️'}
                          {expense.category === 'Bills' && '🔌'}
                          {expense.category === 'Entertainment' && '🎬'}
                          {expense.category === 'Other' && '📦'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700 text-sm">{expense.title}</p>
                          {isOptimistic && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Syncing...
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                        {expense.category}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(expense.date)}
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="px-6 py-4 text-xs text-slate-400 max-w-[180px] truncate">
                      {expense.note ? (
                        <div className="flex items-center gap-1" title={expense.note}>
                          <FileText className="w-3.5 h-3.5 shrink-0 text-slate-300" />
                          <span>{expense.note}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic">No notes</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-right font-bold text-slate-800 text-sm tabular-nums">
                      {formatCurrency(expense.amount)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      {isConfirmingDelete ? (
                        /* Delete confirmation buttons */
                        <div className="flex items-center justify-center gap-2 animate-fade-in-up">
                          <button
                            onClick={() => handleConfirmDelete(expense._id)}
                            className="px-2 py-1 rounded bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold uppercase transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-bold uppercase transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        /* Standard action triggers */
                        <div className="flex items-center justify-center gap-2.5">
                          <button
                            onClick={() => onEdit(expense)}
                            disabled={isOptimistic}
                            className="text-slate-400 hover:text-slate-800 hover:bg-slate-100 p-1.5 rounded-lg transition-colors outline-none"
                            title="Edit Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(expense._id)}
                            disabled={isOptimistic}
                            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 p-1.5 rounded-lg transition-colors outline-none"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => updateFilters({ page: Math.max(1, filters.page - 1) })}
            disabled={filters.page === 1}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:hover:text-slate-600 transition-colors"
          >
            Previous Page
          </button>
          <span className="text-xs font-semibold text-slate-400">
            Page {filters.page} of {totalPages}
          </span>
          <button
            onClick={() => updateFilters({ page: Math.min(totalPages, filters.page + 1) })}
            disabled={filters.page === totalPages}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:hover:text-slate-600 transition-colors"
          >
            Next Page
          </button>
        </div>
      )}
    </div>
  );
};
