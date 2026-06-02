import React, { useState, useCallback } from 'react';
import { useExpenses } from './hooks/useExpenses';
import { useSummary } from './hooks/useSummary';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Filters } from './components/Filters';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseForm } from './components/ExpenseForm';
import {
  Wallet,
  LayoutDashboard,
  BarChart3,
  PlusCircle,
  Database,
  X,
  AlertTriangle,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function App() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Active selected month state (YYYY-MM format, defaults to current month)
  const [activeMonth, setActiveMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  
  // Database connectivity state
  const [dbOffline, setDbOffline] = useState(false);
  
  // Custom Toast state
  const [toasts, setToasts] = useState([]);

  // Toast emitter function
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Automatically dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Wire custom hooks
  const {
    expenses,
    loading: listLoading,
    total,
    filters,
    updateFilters,
    clearFilters,
    addExpense,
    editExpense,
    deleteExpense,
    refetch: refetchExpenses
  } = useExpenses(addToast, setDbOffline);

  const {
    summary,
    trends,
    loading: summaryLoading,
    refreshSummary
  } = useSummary(activeMonth, addToast);

  // Trigger double refresh upon successful mutation
  const handleAddExpense = async (data) => {
    await addExpense(data);
    refreshSummary();
  };

  const handleEditExpense = async (id, data) => {
    await editExpense(id, data);
    refreshSummary();
  };

  const handleDeleteExpense = async (id) => {
    await deleteExpense(id);
    refreshSummary();
  };

  // Expense Form Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const openAddForm = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 antialiased font-sans">
      {/* 1. Left Sidebar - Premium Dark Navy Theme */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 shadow-xl z-20">
        <div className="p-6">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">SpendWise</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">MERN Tracker</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 outline-none ${
                currentPage === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentPage('analytics')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 outline-none ${
                currentPage === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analytics Insights</span>
            </button>
          </nav>
        </div>

        {/* Database connectivity status inside Sidebar */}
        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-950/40 rounded-xl border border-slate-800/60">
            <div className={`w-2 h-2 rounded-full shrink-0 ${dbOffline ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
            <div className="truncate">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Local MongoDB</p>
              <p className="text-xs font-semibold text-slate-300 truncate mt-0.5">
                {dbOffline ? 'Offline / Offline' : 'Active (27017)'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto z-10 relative">
        {/* Connection Error Banner Overlay if database goes offline */}
        {dbOffline && (
          <div className="sticky top-0 z-40 bg-rose-500 text-white px-6 py-3 flex items-center justify-between border-b border-rose-600 shadow-md animate-fade-in-up">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce" />
              <p className="text-sm font-bold tracking-tight">
                Cannot connect to database! Please ensure local MongoDB is running on port 27017.
              </p>
            </div>
            <button 
              onClick={() => {
                refetchExpenses();
                refreshSummary();
              }}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 border border-rose-400/30 rounded-xl text-xs font-bold transition-all"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Navbar */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-800 capitalize tracking-tight">
              {currentPage === 'dashboard' ? 'Expense Dashboard' : 'Analytics & Trends'}
            </h2>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200/45">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="month"
                value={activeMonth}
                onChange={(e) => setActiveMonth(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-600 outline-none border-none cursor-pointer"
                title="Select month for summaries"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openAddForm}
              className="px-4 py-2.5 bg-slate-900 hover:bg-indigo-600 active:bg-indigo-700 text-white rounded-2xl shadow-lg hover:shadow-indigo-500/10 font-bold text-sm transition-all duration-200 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </div>
        </header>

        {/* Dynamic Pages Area */}
        <div className="flex-1 p-8 space-y-6">
          {currentPage === 'dashboard' ? (
            /* Dashboard View */
            <>
              <Dashboard
                summary={summary}
                rawExpenses={expenses}
                activeMonth={activeMonth}
                loading={summaryLoading}
              />
              
              {/* Combinable Filters Bar */}
              <Filters
                filters={filters}
                updateFilters={updateFilters}
                clearFilters={clearFilters}
              />

              {/* Expense List Table */}
              <ExpenseList
                expenses={expenses}
                loading={listLoading}
                total={total}
                totalPages={Math.ceil(total / (filters.limit || 50))}
                filters={filters}
                updateFilters={updateFilters}
                onEdit={openEditForm}
                onDelete={handleDeleteExpense}
                onOpenAddForm={openAddForm}
              />
            </>
          ) : (
            /* Analytics View */
            <Analytics
              trends={trends}
              loading={summaryLoading}
            />
          )}
        </div>
      </main>

      {/* 3. Action Add/Edit Modal Overlay */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={editingItem ? (data) => handleEditExpense(editingItem._id, data) : handleAddExpense}
        editItem={editingItem}
      />

      {/* 4. Sleek Stacked Custom Toaster alerts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-4 rounded-2xl border shadow-xl animate-fade-in-up transition-all ${
              t.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : t.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-100'
                : 'bg-amber-50 text-amber-800 border-amber-100'
            }`}
          >
            {t.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />}
            
            <div className="flex-1 text-sm font-semibold pr-2">
              {t.message}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className={`p-0.5 rounded-full hover:bg-slate-800/40 text-slate-400 hover:text-white transition-colors`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
