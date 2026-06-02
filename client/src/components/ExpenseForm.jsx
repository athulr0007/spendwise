import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Calendar, Landmark, BookOpen, PenTool } from 'lucide-react';
import { formatInputDate } from '../utils/dateUtils';

export const ExpenseForm = ({ isOpen, onClose, onSubmit, editItem = null }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      title: '',
      amount: '',
      category: 'Food',
      date: formatInputDate(new Date()),
      note: ''
    }
  });

  // Pre-populate form fields if editing an existing expense item
  useEffect(() => {
    if (editItem) {
      reset({
        title: editItem.title,
        amount: editItem.amount,
        category: editItem.category,
        date: formatInputDate(editItem.date),
        note: editItem.note || ''
      });
    } else {
      reset({
        title: '',
        amount: '',
        category: 'Food',
        date: formatInputDate(new Date()),
        note: ''
      });
    }
  }, [editItem, reset, isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      // Errors handled inside useExpenses hook and displayed via toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
      {/* Modal Dialog Container */}
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in-up"
      >
        {/* Header banner */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-800 text-indigo-400 rounded-lg">
              <PenTool className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              {editItem ? 'Edit Expense Record' : 'Record New Expense'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-full transition-colors outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input fields Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Expense Title *</label>
            <input
              type="text"
              placeholder="e.g. Weekly Grocery Run"
              tabIndex={1}
              {...register('title', {
                required: 'Title is required',
                validate: (v) => v.trim().length > 0 || 'Title cannot contain only whitespace',
                maxLength: { value: 100, message: 'Title cannot exceed 100 characters' }
              })}
              className={`w-full px-4 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border rounded-xl outline-none transition-all duration-200 text-slate-800 placeholder-slate-400 ${
                errors.title ? 'border-rose-400 focus:border-rose-500 ring-rose-100' : 'border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100'
              }`}
            />
            {errors.title && (
              <span className="block text-xs font-medium text-rose-500 mt-1">{errors.title.message}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Amount (₹) *</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  tabIndex={2}
                  {...register('amount', {
                    required: 'Amount is required',
                    validate: {
                      isNumeric: (v) => !isNaN(parseFloat(v)) || 'Amount must be a number',
                      positive: (v) => parseFloat(v) > 0 || 'Amount must be greater than 0'
                    }
                  })}
                  className={`w-full pl-4 pr-10 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border rounded-xl outline-none transition-all duration-200 font-medium text-slate-800 placeholder-slate-400 ${
                    errors.amount ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100'
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">INR</span>
              </div>
              {errors.amount && (
                <span className="block text-xs font-medium text-rose-500 mt-1">{errors.amount.message}</span>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Category *</label>
              <div className="relative">
                <select
                  tabIndex={3}
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100 rounded-xl outline-none transition-all duration-200 text-slate-800 appearance-none cursor-pointer font-medium"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.25rem',
                    backgroundRepeat: 'no-repeat',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="Food">Food 🍔</option>
                  <option value="Transport">Transport 🚗</option>
                  <option value="Shopping">Shopping 🛍️</option>
                  <option value="Bills">Bills 🔌</option>
                  <option value="Entertainment">Entertainment 🎬</option>
                  <option value="Other">Other 📦</option>
                </select>
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date Spent *</label>
            <div className="relative">
              <input
                type="date"
                tabIndex={4}
                {...register('date', { required: 'Date is required' })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100 rounded-xl outline-none transition-all duration-200 text-slate-800 font-medium cursor-pointer"
              />
            </div>
            {errors.date && (
              <span className="block text-xs font-medium text-rose-500 mt-1">{errors.date.message}</span>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Notes (Optional)</label>
            <textarea
              placeholder="Add any extra comments here (e.g. details, split with friends...)"
              rows={3}
              tabIndex={5}
              {...register('note', {
                maxLength: { value: 500, message: 'Note cannot exceed 500 characters' }
              })}
              className="w-full px-4 py-3 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100 rounded-xl outline-none transition-all duration-200 text-slate-800 placeholder-slate-400 resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.note && (
                <span className="text-xs font-medium text-rose-500">{errors.note.message}</span>
              )}
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-auto">Max 500 characters</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              tabIndex={6}
              className="w-1/2 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl shadow-lg hover:shadow-indigo-200 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Syncing...' : editItem ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
