import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// Get base URL for Axios, falling back to local proxy target if not specified
const API_URL = '/api/expenses';

const getInitialFilters = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    category: params.get('category') || '',
    from: params.get('from') || '',
    to: params.get('to') || '',
    title: params.get('title') || '',
    page: parseInt(params.get('page') || '1', 10)
  };
};

export const useExpenses = (addToast, setDbOffline) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState(getInitialFilters);

  // Maintain a cache of previous expenses for rollback purposes on failed optimistic updates
  const rollbackCache = useRef(null);

  // Sync state filter mutations to the browser URL query params
  const syncFiltersToUrl = useCallback((newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.from) params.set('from', newFilters.from);
    if (newFilters.to) params.set('to', newFilters.to);
    if (newFilters.title) params.set('title', newFilters.title);
    if (newFilters.page > 1) params.set('page', newFilters.page.toString());

    const newSearch = params.toString();
    const currentSearch = window.location.search.replace(/^\?/, '');
    
    if (newSearch !== currentSearch) {
      const path = window.location.pathname + (newSearch ? `?${newSearch}` : '');
      window.history.pushState(null, '', path);
    }
  }, []);

  // Fetch expenses from Express API
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        params: {
          category: filters.category || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
          title: filters.title || undefined,
          page: filters.page,
          limit: 50
        }
      });
      setExpenses(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
      setDbOffline(false);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      // If service is unavailable or status is 503
      if (err.response && err.response.status === 503) {
        setDbOffline(true);
      } else if (!err.response) {
        setDbOffline(true); // network error, server offline
      }
      addToast('Failed to load expenses list. Check database connection.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, addToast, setDbOffline]);

  // Handle listening to history state changes (back/forward browser navigation)
  useEffect(() => {
    const handlePopState = () => {
      setFilters(getInitialFilters());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch when filters or page indexes change
  useEffect(() => {
    syncFiltersToUrl(filters);
    fetchExpenses();
  }, [filters, fetchExpenses, syncFiltersToUrl]);

  // Mutator to update specific filter properties
  const updateFilters = useCallback((updatedProperties) => {
    setFilters((prev) => {
      // Reset back to page 1 if modifying values to avoid blank states
      const resetPage = updatedProperties.page !== undefined ? updatedProperties.page : 1;
      return {
        ...prev,
        ...updatedProperties,
        page: resetPage
      };
    });
  }, []);

  // Reset filters
  const clearFilters = useCallback(() => {
    const defaultFilters = { category: '', from: '', to: '', title: '', page: 1 };
    setFilters(defaultFilters);
  }, []);

  // 1. ADD Expense (Optimistic Update)
  const addExpense = useCallback(async (expenseData) => {
    // Generate an optimistic ID and document structure
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = {
      _id: tempId,
      ...expenseData,
      amount: parseFloat(expenseData.amount),
      date: expenseData.date ? new Date(expenseData.date).toISOString() : new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOptimistic: true
    };

    // Cache current state
    rollbackCache.current = { expenses, total };

    // Optimistically update local list
    setExpenses((prev) => [optimisticItem, ...prev]);
    setTotal((prev) => prev + 1);

    addToast('Expense added successfully!', 'success');

    try {
      const response = await axios.post(API_URL, expenseData);
      
      // Replace optimistic temp item with actual server item
      setExpenses((prev) =>
        prev.map((item) => (item._id === tempId ? response.data : item))
      );
      return response.data;
    } catch (err) {
      console.error('Failed to create expense:', err);
      // Rollback to cached state
      if (rollbackCache.current) {
        setExpenses(rollbackCache.current.expenses);
        setTotal(rollbackCache.current.total);
      }
      addToast(err.response?.data?.error || 'Failed to save expense.', 'error');
      throw err;
    } finally {
      rollbackCache.current = null;
    }
  }, [expenses, total, addToast]);

  // 2. EDIT Expense (Optimistic Update)
  const editExpense = useCallback(async (id, expenseData) => {
    if (id.startsWith('temp-')) {
      addToast('Cannot edit an item that is still sync\'ing.', 'warning');
      return;
    }

    rollbackCache.current = { expenses };

    // Optimistically update item in local list
    setExpenses((prev) =>
      prev.map((item) =>
        item._id === id
          ? {
              ...item,
              ...expenseData,
              amount: parseFloat(expenseData.amount),
              date: expenseData.date ? new Date(expenseData.date).toISOString() : item.date,
              updatedAt: new Date().toISOString()
            }
          : item
      )
    );

    addToast('Expense updated successfully!', 'success');

    try {
      const response = await axios.put(`${API_URL}/${id}`, expenseData);
      
      // Update item with exact server response
      setExpenses((prev) =>
        prev.map((item) => (item._id === id ? response.data : item))
      );
      return response.data;
    } catch (err) {
      console.error('Failed to update expense:', err);
      if (rollbackCache.current) {
        setExpenses(rollbackCache.current.expenses);
      }
      addToast(err.response?.data?.error || 'Failed to update expense.', 'error');
      throw err;
    } finally {
      rollbackCache.current = null;
    }
  }, [expenses, addToast]);

  // 3. DELETE Expense (Optimistic Update)
  const deleteExpense = useCallback(async (id) => {
    if (id.startsWith('temp-')) {
      addToast('Cannot delete an item that is still sync\'ing.', 'warning');
      return;
    }

    rollbackCache.current = { expenses, total };

    // Optimistically remove from local list
    setExpenses((prev) => prev.filter((item) => item._id !== id));
    setTotal((prev) => prev - 1);

    addToast('Expense deleted successfully!', 'success');

    try {
      await axios.delete(`${API_URL}/${id}`);
      // Successfully deleted on server
    } catch (err) {
      console.error('Failed to delete expense:', err);
      if (rollbackCache.current) {
        setExpenses(rollbackCache.current.expenses);
        setTotal(rollbackCache.current.total);
      }
      addToast('Failed to delete expense. Retrying...', 'error');
    } finally {
      rollbackCache.current = null;
    }
  }, [expenses, total, addToast]);

  return {
    expenses,
    loading,
    total,
    totalPages,
    filters,
    updateFilters,
    clearFilters,
    addExpense,
    editExpense,
    deleteExpense,
    refetch: fetchExpenses
  };
};
