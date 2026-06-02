import React, { useState, useCallback } from 'react';
import { useExpenses } from './hooks/useExpenses';
import { useSummary } from './hooks/useSummary';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Filters } from './components/Filters';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseForm } from './components/ExpenseForm';
import { ChatAssistant } from './components/ChatAssistant';
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

  const buildDownloadFileName = () => {
    const parts = ['expenses'];

    if (filters.category) {
      parts.push(filters.category.toLowerCase());
    }
    if (filters.title) {
      parts.push('search');
    }
    if (filters.from || filters.to) {
      const fromPart = filters.from ? filters.from : 'start';
      const toPart = filters.to ? filters.to : 'end';
      parts.push(`${fromPart}_to_${toPart}`);
    }

    if (parts.length === 1) {
      parts.push(activeMonth || new Date().toISOString().slice(0, 7));
    }

    return `${parts.join('_')}.xlsx`;
  };

  // Handle Excel download with filters
  const handleDownloadExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.title) params.append('title', filters.title);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      console.log('Download filters:', { filters, queryString });
      const response = await fetch(`http://localhost:5000/api/expenses/download/excel${queryString}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = buildDownloadFileName();
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      addToast('Failed to download Excel file', 'error');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 antialiased font-sans">
      {/* 1. Left Sidebar - Premium Dark Navy Theme */}
      {/* Sidebar */}
<aside className="w-[220px] bg-[#0f1117] flex flex-col shrink-0 border-r border-[#1e2432]">
  
  {/* Top section */}
  <div className="px-4 pt-6">
    
    {/* Logo */}
    <div className="flex items-center gap-2.5 px-1 mb-7">
      <div className="w-7 h-7 bg-[#1a1f2e] border border-[#2a3040] rounded-[6px] flex items-center justify-center shrink-0">
        <Wallet className="w-3.5 h-3.5 text-[#6c7a99] stroke-[1.75]" />
      </div>
      <div>
        <p className="text-[13px] font-semibold text-[#e2e8f0] tracking-[-0.01em]">SpendWise</p>
        <p className="text-[10px] text-[#3d4a63] mt-px tracking-[0.04em]">Expense Tracker</p>
      </div>
    </div>

    {/* Nav label */}
    <p className="text-[10px] font-medium text-[#2e3a52] uppercase tracking-[0.08em] px-2 mb-1.5">
      Menu
    </p>

    {/* Nav items */}
    <nav className="flex flex-col gap-0.5">
      {[
        { id: 'dashboard', label: 'Dashboard',  Icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics',  Icon: BarChart3       },
      ].map(({ id, label, Icon }) => {
        const active = currentPage === id;
        return (
          <button
            key={id}
            onClick={() => setCurrentPage(id)}
            className={`
              w-full flex items-center gap-2.5 px-2 py-[7px] rounded-[6px]
              border transition-colors duration-150 outline-none text-left
              ${active
                ? 'bg-[#161b27] border-[#1e2a3f]'
                : 'border-transparent hover:bg-[#161b27]'
              }
            `}
          >
            <Icon
              className={`w-4 h-4 shrink-0 stroke-[1.75] ${
                active ? 'text-[#7c8fba]' : 'text-[#3d4a63]'
              }`}
            />
            <span
              className={`text-[13px] flex-1 ${
                active ? 'text-[#c8d3ea] font-medium' : 'text-[#3d4a63] font-normal'
              }`}
            >
              {label}
            </span>
            {active && (
              <span className="w-0.5 h-3.5 bg-[#3d5080] rounded-full shrink-0" />
            )}
          </button>
        );
      })}
    </nav>
  </div>

  {/* Spacer */}
  <div className="flex-1" />

  {/* DB status footer */}
  <div className="px-4 pb-4 border-t border-[#161b27] pt-3.5">
    <div className="flex items-center gap-2 px-2.5 py-2 bg-[#0a0d14] border border-[#161b27] rounded-[6px]">
      <span className="relative flex shrink-0">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            dbOffline ? 'bg-[#5c1e1e]' : 'bg-[#1a6b3a]'
          }`}
        />
        {!dbOffline && (
          <span className="absolute inset-0 rounded-full border border-[#1a6b3a] opacity-40 scale-[2]" />
        )}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] text-[#2e3a52] tracking-[0.04em]">MongoDB</p>
        <p className={`text-[11px] font-medium mt-px truncate ${
          dbOffline ? 'text-[#5c1e1e]' : 'text-[#1a6b3a]'
        }`}>
          {dbOffline ? 'Disconnected' : 'localhost:27017'}
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
                onDownloadExcel={handleDownloadExcel}
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

      <ChatAssistant />

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
