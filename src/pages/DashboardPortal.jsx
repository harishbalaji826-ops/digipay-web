import React, { useEffect, useState } from 'react';
import {
  fetchWalletAnalytics,
  fetchMerchantDashboard,
  fetchAdminDashboard,
  fetchAdminTransactions,
  fetchAdminMerchants,
  toggleMerchantStatus,
  deleteMerchant,
  fetchAdminAnalytics
} from '../services/api';
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  Search,
  Power,
  Trash2,
  Download,
  Compass,
  ShieldCheck,
  Activity,
  LogOut,
  RefreshCw,
  Sliders,
  Wallet,
  Menu,
  PieChart as PieIcon,
  Clock,
  MapPin,
  HelpCircle,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import Toast from '../components/Toast';

const PIE_COLORS = ['#2563EB', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function DashboardPortal({ token, role, name, onLogout }) {
  // Common states
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');
  
  // Dashboard payloads
  const [customerData, setCustomerData] = useState(null);
  const [merchantData, setMerchantData] = useState(null);
  const [adminKPIs, setAdminKPIs] = useState(null);
  
  // Admin specific states
  const [adminTab, setAdminTab] = useState('overview'); // 'overview' | 'transactions' | 'merchants' | 'analytics'
  const [adminTransactions, setAdminTransactions] = useState([]);
  const [txTotalCount, setTxTotalCount] = useState(0);
  const [txCategoryFilter, setTxCategoryFilter] = useState('');
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [txPage, setTxPage] = useState(0);
  const txPerPage = 10;
  
  const [adminMerchants, setAdminMerchants] = useState([]);
  const [adminChartsData, setAdminChartsData] = useState(null);

  const triggerToast = (msg, type = 'error') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      if (role === 'customer') {
        const res = await fetchWalletAnalytics();
        setCustomerData(res);
      } else if (role === 'merchant') {
        const res = await fetchMerchantDashboard();
        setMerchantData(res);
      } else if (role === 'admin') {
        const kpis = await fetchAdminDashboard();
        setAdminKPIs(kpis);
        
        // Pre-fetch lists for admin tabs
        const txs = await fetchAdminTransactions({ limit: txPerPage, offset: 0 });
        setAdminTransactions(txs.transactions);
        setTxTotalCount(txs.total);
        
        const merchants = await fetchAdminMerchants();
        setAdminMerchants(merchants);
        
        const charts = await fetchAdminAnalytics();
        setAdminChartsData(charts);
      }
    } catch (err) {
      triggerToast(err.message || 'Error pulling database telemetry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [role, token]);

  // Handle transaction search / pagination reload
  const reloadAdminTransactions = async (page = 0, query = txSearchQuery, cat = txCategoryFilter) => {
    try {
      const res = await fetchAdminTransactions({
        limit: txPerPage,
        offset: page * txPerPage,
        search: query || undefined,
        category: cat || undefined
      });
      setAdminTransactions(res.transactions);
      setTxTotalCount(res.total);
    } catch (err) {
      triggerToast(err.message || 'Error searching transactions.');
    }
  };

  const handleTxSearchChange = (e) => {
    const val = e.target.value;
    setTxSearchQuery(val);
    setTxPage(0);
    reloadAdminTransactions(0, val, txCategoryFilter);
  };

  const handleTxCategoryFilterChange = (e) => {
    const val = e.target.value;
    setTxCategoryFilter(val);
    setTxPage(0);
    reloadAdminTransactions(0, txSearchQuery, val);
  };

  const handlePageChange = (newPage) => {
    setTxPage(newPage);
    reloadAdminTransactions(newPage, txSearchQuery, txCategoryFilter);
  };

  // Toggle active/inactive status for merchants
  const handleToggleMerchant = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await toggleMerchantStatus(id, newStatus);
      setAdminMerchants(prev =>
        prev.map(m => m.id === id ? { ...m, is_active: newStatus } : m)
      );
      triggerToast(`Merchant status changed successfully.`, 'success');
    } catch (err) {
      triggerToast(err.message || 'Failed to toggle merchant status.');
    }
  };

  // Delete merchant profile
  const handleDeleteMerchant = async (id) => {
    if (!window.confirm('Are you sure you want to delete this merchant account?')) return;
    try {
      await deleteMerchant(id);
      setAdminMerchants(prev => prev.filter(m => m.id !== id));
      triggerToast('Merchant deleted successfully.', 'success');
    } catch (err) {
      triggerToast(err.message || 'Failed to delete merchant.');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!adminTransactions.length) {
      triggerToast('No transaction records to export.');
      return;
    }
    const headers = ['Tx ID', 'Customer Phone', 'Merchant Name', 'Amount (INR)', 'Category', 'Latitude', 'Longitude', 'Timestamp'];
    const rows = adminTransactions.map(t => [
      t.id,
      t.customer_phone,
      t.merchant_name,
      t.amount,
      t.category,
      t.latitude || '',
      t.longitude || '',
      t.timestamp
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `digipay_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('CSV Exported successfully.', 'success');
  };

  // Logged-out cleanup
  const handleLogoutClick = () => {
    localStorage.removeItem('digipay_token');
    onLogout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-400">
        <RefreshCw className="w-10 h-10 text-brand-blue animate-spin" />
        <p className="text-sm font-semibold tracking-wider">Retrieving database telemetry...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col justify-between relative">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
      
      {/* Background glow grids */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* DASHBOARD NAV BAR */}
      <nav className="border-b border-white/5 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center font-bold text-white shadow-md">
              D
            </div>
            <span className="text-lg font-bold tracking-tight text-white">DIGIPAY CONSOLE</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs text-slate-500 font-medium">Logged in as</span>
              <span className="text-sm text-slate-200 font-bold">{name}</span>
            </div>
            <span className="px-3 py-1 bg-brand-blue/15 border border-brand-blue/30 text-brand-blue text-[10px] font-extrabold uppercase rounded-full tracking-wider">
              {role}
            </span>
            <button
              onClick={handleLogoutClick}
              data-testid="logout-button"
              className="p-2.5 bg-slate-900 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 rounded-xl transition-all cursor-pointer shadow"
              title="Logout session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* DASHBOARD CORE BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 relative z-10">
        
        {/* ========================================================================= */}
        {/* 1. CUSTOMER DASHBOARD VIEW */}
        {/* ========================================================================= */}
        {role === 'customer' && customerData && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Wallet Analytics</h1>
              <p className="text-slate-400 text-sm">Real-time metrics parsed from your live UPI transfers.</p>
            </div>

            {/* KPI Metrics */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="glass-panel bg-gradient-to-br from-brand-blue to-brand-blue/70 border-none shadow-lg shadow-brand-blue/10 flex flex-col justify-between min-h-[160px]">
                <div className="flex justify-between items-start text-white/80">
                  <span className="text-xs font-bold uppercase tracking-wider">Estimated Balance</span>
                  <Wallet className="w-5 h-5 text-brand-cyan" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold mb-1">₹{customerData.balance.toFixed(2)}</div>
                  <div className="text-[11px] text-white/75 font-medium">Cycle limit: ₹{customerData.budget_limit}</div>
                </div>
              </div>

              <div className="glass-panel flex flex-col justify-between min-h-[160px]">
                <div className="flex justify-between items-start text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Spent This Month</span>
                  <DollarSign className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold mb-1">₹{customerData.spent_this_month.toFixed(2)}</div>
                  <div className="text-[11px] text-emerald-400 font-bold">Estimated savings: ₹{customerData.saved_this_month}</div>
                </div>
              </div>

              <div className="glass-panel flex flex-col justify-between min-h-[160px]">
                <div className="flex justify-between items-start text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Budget Progress</span>
                  <Activity className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-3xl font-extrabold">{Math.round(customerData.budget_progress * 100)}%</span>
                    <span className="text-xs text-slate-400">₹{customerData.spent_this_month} / ₹{customerData.budget_limit}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        customerData.budget_progress > 0.85 ? 'bg-rose-500' : 'bg-brand-blue'
                      }`}
                      style={{ width: `${customerData.budget_progress * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Sections */}
            <div className="grid md:grid-cols-12 gap-8">
              
              {/* Left Side: Categories & Context */}
              <div className="md:col-span-5 space-y-6">
                <div className="glass-panel space-y-6">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-brand-cyan" /> Category Breakdown
                  </h3>
                  <div className="space-y-4">
                    {customerData.category_breakdown.map((item) => (
                      <div key={item.category} className="space-y-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-slate-300">{item.category}</span>
                          <span className="text-slate-400">
                            ₹{item.amount.toFixed(0)} <span className="text-xs text-slate-500">({item.percentage}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-brand-cyan h-full rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel space-y-6">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-brand-blue" /> Context Intelligence
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-slate-500 font-medium">Peak Activity Hour</span>
                      <span className="text-slate-200 font-bold">{customerData.peak_spending_time}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-500 font-medium">Location Context</span>
                      <span className="text-slate-200 font-bold text-right max-w-[200px] truncate">{customerData.location_spending_summary}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Ledger Table */}
              <div className="md:col-span-7 space-y-6">
                <div className="glass-panel overflow-hidden">
                  <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-400" /> Recent UPI Expenses
                  </h3>
                  {customerData.recent_transactions.length === 0 ? (
                    <div className="text-center py-10 text-slate-600 text-sm">No recorded transactions.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-white/5 text-slate-500 font-semibold">
                            <th className="py-3 px-2">Merchant</th>
                            <th className="py-3 px-2">Category</th>
                            <th className="py-3 px-2 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {customerData.recent_transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-white/2 transition-colors">
                              <td className="py-4 px-2 font-bold text-slate-200">{tx.merchant_name}</td>
                              <td className="py-4 px-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-400 text-xs font-medium border border-white/5">
                                  {tx.category}
                                </span>
                              </td>
                              <td className="py-4 px-2 text-right font-extrabold text-slate-100">
                                -₹{tx.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="glass-panel space-y-4 bg-amber-950/10 border-amber-500/10">
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" /> Savings & Budget Advice
                  </h4>
                  <div className="space-y-3">
                    {customerData.savings_suggestions.map((suggestion, idx) => (
                      <div key={idx} className="text-xs text-amber-200/80 leading-relaxed flex items-start gap-2">
                        <span className="text-amber-400 font-bold shrink-0">•</span>
                        <p>{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. MERCHANT DASHBOARD VIEW */}
        {/* ========================================================================= */}
        {role === 'merchant' && merchantData && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Merchant Portal</h1>
              <p className="text-slate-400 text-sm">Store telemetry, location codes, and digital receipts.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="glass-panel bg-gradient-to-br from-brand-blue to-brand-blue/70 border-none shadow-lg shadow-brand-blue/10 flex flex-col justify-between min-h-[160px]">
                <div className="flex justify-between items-start text-white/80">
                  <span className="text-xs font-bold uppercase tracking-wider">Today's Revenue</span>
                  <DollarSign className="w-5 h-5 text-brand-cyan" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold mb-1">₹{merchantData.today_revenue.toFixed(2)}</div>
                  <div className="text-[11px] text-white/75 font-medium">Transactions: {merchantData.total_payments_count}</div>
                </div>
              </div>

              <div className="glass-panel flex flex-col justify-between min-h-[160px]">
                <div className="flex justify-between items-start text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Customers Today</span>
                  <Users className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold mb-1">{merchantData.today_customers}</div>
                  <div className="text-[11px] text-slate-500 font-medium">Distinct mobile devices pairing</div>
                </div>
              </div>

              <div className="glass-panel flex flex-col justify-between min-h-[160px]">
                <div className="flex justify-between items-start text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Nearby Sensor Activity</span>
                  <Activity className="w-5 h-5 text-brand-cyan animate-pulse" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold mb-1">{merchantData.nearby_activity_count}</div>
                  <div className="text-[11px] text-emerald-400 font-bold">Devices within signal threshold</div>
                </div>
              </div>
            </div>

            {/* Content Splits */}
            <div className="grid md:grid-cols-12 gap-8">
              
              {/* Left Panel: Store properties */}
              <div className="md:col-span-5">
                <div className="glass-panel space-y-6">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-4">
                    Store Information
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-slate-500">Business Name</span>
                      <span className="font-semibold text-slate-200">{merchantData.business_name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-slate-500">Registered Owner</span>
                      <span className="font-semibold text-slate-200">{merchantData.owner_name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-slate-500">Category Tag</span>
                      <span className="font-semibold text-slate-200">{merchantData.category}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-slate-500">DIGIPIN Address</span>
                      <span className="px-2 py-0.5 rounded bg-brand-blue/15 text-brand-blue font-extrabold font-mono text-xs">
                        {merchantData.digipin}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-slate-500">UPI Interface</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> {merchantData.upi_status}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Discovery Node</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> {merchantData.digipin_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel: Transaction receipts received */}
              <div className="md:col-span-7">
                <div className="glass-panel overflow-hidden">
                  <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" /> Recent Received Payments
                  </h3>
                  {merchantData.recent_payments.length === 0 ? (
                    <div className="text-center py-10 text-slate-600 text-sm">No transactions logged today.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-white/5 text-slate-500 font-semibold">
                            <th className="py-3 px-2">Customer Phone</th>
                            <th className="py-3 px-2">Time</th>
                            <th className="py-3 px-2 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {merchantData.recent_payments.map((p) => (
                            <tr key={p.id} className="hover:bg-white/2 transition-colors">
                              <td className="py-4 px-2 font-mono text-slate-300">{p.customer_phone}</td>
                              <td className="py-4 px-2 text-slate-400">
                                {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-4 px-2 text-right font-extrabold text-emerald-400">
                                +₹{p.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. ADMIN DASHBOARD VIEW */}
        {/* ========================================================================= */}
        {role === 'admin' && adminKPIs && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Admin Header with Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">System Control Console</h1>
                <p className="text-slate-400 text-sm">System-wide transaction audits, store validations, and network analytics.</p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-2 bg-slate-900 p-1.5 rounded-2xl border border-white/5">
                <button
                  onClick={() => setAdminTab('overview')}
                  data-testid="admin-overview-tab"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    adminTab === 'overview'
                      ? 'bg-brand-blue text-white shadow'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setAdminTab('transactions')}
                  data-testid="admin-transactions-tab"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    adminTab === 'transactions'
                      ? 'bg-brand-blue text-white shadow'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  Transactions Ledger
                </button>
                <button
                  onClick={() => setAdminTab('merchants')}
                  data-testid="admin-merchants-tab"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    adminTab === 'merchants'
                      ? 'bg-brand-blue text-white shadow'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  Merchants Management
                </button>
                <button
                  onClick={() => setAdminTab('analytics')}
                  data-testid="admin-analytics-tab"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    adminTab === 'analytics'
                      ? 'bg-brand-blue text-white shadow'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  System Analytics
                </button>
              </div>
            </div>

            {/* TAB CONTENT: 1. OVERVIEW */}
            {adminTab === 'overview' && (
              <div className="space-y-8 animate-fade-in">
                {/* KPI Metrics */}
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="glass-panel p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-blue/15 border border-brand-blue/20 flex items-center justify-center text-brand-blue shrink-0">
                      <DollarSign className="w-6 h-6 text-brand-cyan" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Today's Revenue</div>
                      <div className="text-2xl font-black text-slate-100">₹{adminKPIs.today_revenue}</div>
                    </div>
                  </div>

                  <div className="glass-panel p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-cyan/15 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shrink-0">
                      <FileText className="w-6 h-6 text-brand-blue" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">All-Time Tx Count</div>
                      <div className="text-2xl font-black text-slate-100">{adminKPIs.total_transactions}</div>
                    </div>
                  </div>

                  <div className="glass-panel p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Registered Users</div>
                      <div className="text-2xl font-black text-slate-100">{adminKPIs.total_users}</div>
                    </div>
                  </div>

                  <div className="glass-panel p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Total Merchants</div>
                      <div className="text-2xl font-black text-slate-100">{adminKPIs.total_merchants}</div>
                    </div>
                  </div>
                </div>

                {/* Split grid for activity metrics */}
                <div className="grid md:grid-cols-12 gap-8">
                  <div className="md:col-span-8 glass-panel space-y-6">
                    <h3 className="text-lg font-bold text-slate-100">Average System Volume</h3>
                    <div className="p-8 bg-slate-950/50 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center">
                      <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Average Transaction Value</div>
                      <div className="text-5xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        ₹{adminKPIs.average_transaction_value}
                      </div>
                      <p className="text-slate-500 text-xs mt-4">
                        Calculated across all historical database entries.
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-4 glass-panel space-y-6">
                    <h3 className="text-lg font-bold text-slate-100">Live Device Telemetry</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3.5 bg-slate-950/80 rounded-2xl border border-white/5">
                        <span className="text-xs font-medium text-slate-400">Mock Handshake Nodes</span>
                        <span className="text-sm font-bold text-brand-cyan shrink-0 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-brand-cyan rounded-full animate-ping shrink-0"></span>
                          {adminKPIs.active_devices_today}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3.5 bg-slate-950/80 rounded-2xl border border-white/5">
                        <span className="text-xs font-medium text-slate-400">Database Engine</span>
                        <span className="text-xs font-mono font-bold text-slate-300">SQLite fallback</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. TRANSACTIONS LEDGER */}
            {adminTab === 'transactions' && (
              <div className="glass-panel space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-slate-100">Transaction History Audits</h3>
                  
                  {/* Search and Filters */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-950 border border-white/10 focus-within:border-brand-blue/50 rounded-xl px-3.5 py-2 transition-colors">
                      <Search className="w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search by merchant..."
                        value={txSearchQuery}
                        onChange={handleTxSearchChange}
                        data-testid="search-input"
                        className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-600 focus:outline-none w-48 font-medium"
                      />
                    </div>

                    <select
                      value={txCategoryFilter}
                      onChange={handleTxCategoryFilterChange}
                      data-testid="category-filter"
                      className="bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="">All Categories</option>
                      <option value="Food">Food</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Medical">Medical</option>
                      <option value="Bills">Bills</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Retail">Retail</option>
                      <option value="Other">Other</option>
                    </select>

                    <button
                      onClick={handleExportCSV}
                      data-testid="export-csv-btn"
                      className="px-4 py-2 bg-slate-900 border border-white/10 hover:border-brand-blue/30 hover:bg-slate-900/60 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Download className="w-3.5 h-3.5 text-brand-cyan" /> Export CSV
                    </button>
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-500 font-semibold">
                        <th className="py-3 px-2">Customer Phone</th>
                        <th className="py-3 px-2">Merchant Name</th>
                        <th className="py-3 px-2">Category</th>
                        <th className="py-3 px-2">Timestamp</th>
                        <th className="py-3 px-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {adminTransactions.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-10 text-center text-slate-600 text-sm">
                            No transaction ledger entries found matching criteria.
                          </td>
                        </tr>
                      ) : (
                        adminTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-white/1 transition-colors">
                            <td className="py-4 px-2 font-mono font-bold text-slate-300">{tx.customer_phone}</td>
                            <td className="py-4 px-2 font-semibold text-slate-100">{tx.merchant_name}</td>
                            <td className="py-4 px-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-400 text-[11px] font-medium border border-white/5">
                                {tx.category}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-xs text-slate-500">
                              {new Date(tx.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                            <td className="py-4 px-2 text-right font-extrabold text-slate-200">
                              ₹{tx.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Simple Pagination */}
                {txTotalCount > txPerPage && (
                  <div className="flex justify-between items-center border-t border-white/5 pt-4">
                    <span className="text-xs text-slate-500">
                      Showing {txPage * txPerPage + 1}-{Math.min(txTotalCount, (txPage + 1) * txPerPage)} of {txTotalCount} ledger items
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(txPage - 1)}
                        disabled={txPage === 0}
                        className="px-3 py-1.5 bg-slate-900 border border-white/5 text-slate-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => handlePageChange(txPage + 1)}
                        disabled={(txPage + 1) * txPerPage >= txTotalCount}
                        className="px-3 py-1.5 bg-slate-900 border border-white/5 text-slate-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 3. MERCHANTS MANAGEMENT */}
            {adminTab === 'merchants' && (
              <div className="glass-panel space-y-6 animate-fade-in">
                <h3 className="text-lg font-bold text-slate-100">Registered Business Stores</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-500 font-semibold">
                        <th className="py-3 px-2">Store Name</th>
                        <th className="py-3 px-2">Owner Name</th>
                        <th className="py-3 px-2">Category</th>
                        <th className="py-3 px-2">DIGIPIN Address</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {adminMerchants.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-10 text-center text-slate-600 text-sm">No registered stores.</td>
                        </tr>
                      ) : (
                        adminMerchants.map((m) => (
                          <tr key={m.id} className="hover:bg-white/1 transition-colors">
                            <td className="py-4 px-2 font-bold text-slate-200">{m.business_name}</td>
                            <td className="py-4 px-2 text-slate-400">{m.owner_name}</td>
                            <td className="py-4 px-2 text-xs text-slate-400">{m.category}</td>
                            <td className="py-4 px-2">
                              <span className="px-2 py-0.5 rounded bg-brand-blue/15 text-brand-blue font-extrabold font-mono text-xs">
                                {m.digipin}
                              </span>
                            </td>
                            <td className="py-4 px-2">
                              <span
                                className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                                  m.is_active
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-950 text-rose-400 border border-rose-500/20'
                                }`}
                              >
                                {m.is_active ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleToggleMerchant(m.id, m.is_active)}
                                  data-testid="status-toggle"
                                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                                    m.is_active
                                      ? 'bg-rose-950/20 text-rose-400 border-rose-500/20 hover:bg-rose-950/40'
                                      : 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20 hover:bg-emerald-950/40'
                                  }`}
                                  title={m.is_active ? 'Deactivate merchant' : 'Activate merchant'}
                                >
                                  <Power className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMerchant(m.id)}
                                  data-testid="delete-merchant-btn"
                                  className="p-2 bg-slate-900 border border-white/5 hover:border-rose-500/25 text-slate-500 hover:text-rose-400 hover:bg-rose-950/10 rounded-lg transition-all cursor-pointer"
                                  title="Delete merchant profile"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. SYSTEM ANALYTICS */}
            {adminTab === 'analytics' && adminChartsData && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Visual Charts grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Category totals Area */}
                  <div className="glass-panel space-y-6">
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <PieIcon className="w-5 h-5 text-brand-cyan" /> Category Capital Distribution
                    </h3>
                    <div className="h-80 w-full bg-slate-950/30 rounded-2xl border border-white/5 p-4 flex flex-col justify-between">
                      <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={adminChartsData.category_distribution}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                          <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                          />
                          <Bar dataKey="amount" fill="#2563EB" radius={[4, 4, 0, 0]}>
                            {adminChartsData.category_distribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="text-[10px] text-slate-500 font-medium text-center">Amounts calculated in Indian Rupees (INR)</div>
                    </div>
                  </div>

                  {/* Hourly peak area chart */}
                  <div className="glass-panel space-y-6">
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-brand-blue" /> Hourly Peak Activity Graph
                    </h3>
                    <div className="h-80 w-full bg-slate-950/30 rounded-2xl border border-white/5 p-4 flex flex-col justify-between">
                      <ResponsiveContainer width="100%" height="90%">
                        <AreaChart data={adminChartsData.hourly_trends}>
                          <defs>
                            <linearGradient id="colorHour" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                          <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                          />
                          <Area type="monotone" dataKey="count" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorHour)" />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="text-[10px] text-slate-500 font-medium text-center">X-Axis represents UTC hour indexes; Y-Axis represents count.</div>
                    </div>
                  </div>
                </div>

                {/* Weekly volume trends */}
                <div className="glass-panel space-y-6">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" /> Weekly Payment Volumes (Last 4 Weeks)
                  </h3>
                  <div className="h-80 w-full bg-slate-950/30 rounded-2xl border border-white/5 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={adminChartsData.weekly_trends}>
                        <defs>
                          <linearGradient id="colorWeek" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="week" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWeek)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* DASHBOARD FOOTER */}
      <footer className="py-6 border-t border-white/5 text-slate-600 text-xs text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p>© 2026 DIGIPAY Web Portal. Standard Administrative Dashboard.</p>
        </div>
      </footer>
    </div>
  );
}
